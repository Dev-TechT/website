#!/usr/bin/env python3
"""Build a full public KEV snapshot for the Sentinel Swarm lab."""

import argparse
import csv
from datetime import date, datetime, timezone
import gzip
import io
import json
from pathlib import Path
import re
from tempfile import NamedTemporaryFile
from urllib.request import urlopen

FEED = 'https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json'
CATALOG = 'https://www.cisa.gov/known-exploited-vulnerabilities-catalog'
MAX_BYTES = 8_000_000
EPSS_FEED = 'https://epss.empiricalsecurity.com/epss_scores-current.csv.gz'


def enrich_epss(snapshot, stream, today):
    metadata = stream.readline(256)
    match = re.fullmatch(r'#model_version:[^,\n]+,score_date:(\d{4}-\d{2}-\d{2})(?:T[^\r\n]+)?\r?\n', metadata)
    if not match:
        raise ValueError('Missing EPSS score date')
    score_date = date.fromisoformat(match[1])
    if not 0 <= (today - score_date).days <= 7:
        raise ValueError('EPSS source is stale or future-dated')
    reader = csv.DictReader(stream)
    if reader.fieldnames != ['cve', 'epss', 'percentile']:
        raise ValueError('Unexpected EPSS schema')
    wanted = {row['id']: row for row in snapshot['entries']}
    scores = {}
    for i, row in enumerate(reader):
        if i >= 1_000_000:
            raise ValueError('EPSS exceeded row limit')
        cve = row['cve']
        if cve not in wanted:
            continue
        score = float(row['epss'])
        if not 0 <= score <= 1 or cve in scores:
            raise ValueError('Invalid or duplicate EPSS score')
        scores[cve] = score
    if not scores or len(scores) * 10 < len(wanted) * 9:
        raise ValueError('EPSS covered fewer than 90% of KEV records')
    for cve, score in scores.items():
        wanted[cve]['epss'] = score
    snapshot['epssDate'] = score_date.isoformat()
    return len(scores)


def clean(value, max_length):
    if not isinstance(value, str) or not value.strip() or len(value) > max_length:
        raise ValueError('Malformed KEV text field')
    return ' '.join(value.split())


def build_snapshot(feed, now):
    entries = feed['vulnerabilities']
    if not isinstance(entries, list) or not entries or len(entries) != feed['count']:
        raise ValueError('Incomplete KEV feed')
    released = datetime.fromisoformat(feed['dateReleased'].replace('Z', '+00:00'))
    if released.tzinfo is None or released > now:
        raise ValueError('Invalid KEV release timestamp')
    result = []
    ids = set()
    for raw in entries:
        cve = raw['cveID']
        if not isinstance(cve, str) or not re.fullmatch(r'CVE-[0-9]{4}-[0-9]{4,}', cve) or cve in ids:
            raise ValueError('Invalid or duplicate KEV ID')
        ids.add(cve)
        added = date.fromisoformat(raw['dateAdded'])
        if added > released.date():
            raise ValueError('KEV entry added after release timestamp')
        result.append({'id': cve, 'added': added.isoformat(),
                       'vendor': clean(raw['vendorProject'], 160),
                       'product': clean(raw['product'], 1000),
                       'action': clean(raw['requiredAction'], 2000)})
    result.sort(key=lambda row: (row['added'], row['id']), reverse=True)
    return {'version': 2, 'source': CATALOG, 'sourceReleasedAt': released.isoformat(),
            'catalogTotal': len(result), 'entries': result}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--input', type=Path, help='Read a saved raw CISA feed instead of fetching it')
    epss = parser.add_mutually_exclusive_group()
    epss.add_argument('--epss-input', type=Path, help='Enrich using a saved EPSS CSV gzip')
    epss.add_argument('--with-epss', action='store_true', help='Enrich using the dated official EPSS feed')
    parser.add_argument('output', type=Path)
    args = parser.parse_args()
    if any(source and source.resolve() == args.output.resolve() for source in (args.input, args.epss_input)):
        parser.error('Input and output must be different files')
    with (args.input.open('rb') if args.input else urlopen(FEED, timeout=20)) as response:
        raw = response.read(MAX_BYTES + 1)
    if len(raw) > MAX_BYTES:
        raise ValueError('KEV feed exceeded size limit')
    now = datetime.now(timezone.utc)
    output = build_snapshot(json.loads(raw), now)
    if args.epss_input or args.with_epss:
        with (args.epss_input.open('rb') if args.epss_input else urlopen(EPSS_FEED, timeout=30)) as response:
            compressed = response.read(MAX_BYTES + 1)
        if len(compressed) > MAX_BYTES:
            raise ValueError('Compressed EPSS exceeded size limit')
        with gzip.GzipFile(fileobj=io.BytesIO(compressed)) as archive:
            scores = archive.read(40_000_001)
        if len(scores) > 40_000_000:
            raise ValueError('Decompressed EPSS exceeded size limit')
        matched = enrich_epss(output, io.StringIO(scores.decode('utf-8'), newline=''), now.date())
        print(f"FIRST EPSS {output['epssDate']}: {matched} matched entries")
    args.output.parent.mkdir(parents=True, exist_ok=True)
    with NamedTemporaryFile(mode='w', encoding='utf-8', dir=args.output.parent, delete=False) as handle:
        temporary = Path(handle.name)
        try:
            json.dump(output, handle, ensure_ascii=False, indent=2)
            handle.write('\n')
            handle.flush()
            temporary.chmod(0o644)
            temporary.replace(args.output)
        finally:
            temporary.unlink(missing_ok=True)
    print(f"CISA KEV release {output['sourceReleasedAt']}: {output['catalogTotal']} entries")


if __name__ == '__main__':
    main()
