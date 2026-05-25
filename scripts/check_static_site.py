#!/usr/bin/env python3
"""Lightweight static-site validation for the portfolio repo."""

from __future__ import annotations

import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
REQUIRED_FILES = [
    "index.html",
    "privacy.html",
    "impressum.html",
    "404.html",
    "style.css",
    "robots.txt",
    "sitemap.xml",
    "CNAME",
]


class LinkAndImageParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.links: list[tuple[str, str]] = []
        self.images: list[tuple[str, str | None]] = []
        self.ids: set[str] = set()
        self.has_viewport = False
        self.has_description = False
        self.has_title = False

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attr = dict(attrs)
        if "id" in attr and attr["id"]:
            self.ids.add(attr["id"] or "")
        if tag == "a" and attr.get("href"):
            self.links.append(("href", attr["href"] or ""))
        if tag == "link" and attr.get("href"):
            self.links.append(("href", attr["href"] or ""))
        if tag == "script" and attr.get("src"):
            self.links.append(("src", attr["src"] or ""))
        if tag == "img":
            self.images.append((attr.get("src") or "", attr.get("alt")))
        if tag == "meta" and attr.get("name") == "viewport":
            self.has_viewport = True
        if tag == "meta" and attr.get("name") == "description" and attr.get("content"):
            self.has_description = True
        if tag == "title":
            self.has_title = True


def is_external(url: str) -> bool:
    parsed = urlparse(url)
    return parsed.scheme in {"http", "https", "mailto", "tel", "data"}


def local_path_for(url: str, source: Path) -> Path | None:
    if not url or url.startswith("#") or is_external(url):
        return None
    clean = url.split("#", 1)[0].split("?", 1)[0]
    if not clean:
        return None
    if clean.startswith("/"):
        clean = clean.lstrip("/")
        return ROOT / clean
    return (source.parent / clean).resolve()


def validate_html(path: Path) -> list[str]:
    text = path.read_text(encoding="utf-8")
    parser = LinkAndImageParser()
    parser.feed(text)
    errors: list[str] = []

    if "<html" not in text.lower():
        errors.append(f"{path.name}: missing <html> tag")
    if not re.search(r"<title>.+?</title>", text, re.IGNORECASE | re.DOTALL):
        errors.append(f"{path.name}: missing non-empty <title>")
    if path.name == "index.html":
        if not parser.has_viewport:
            errors.append("index.html: missing viewport meta tag")
        if not parser.has_description:
            errors.append("index.html: missing meta description")

    for src, alt in parser.images:
        if not src:
            errors.append(f"{path.name}: image with empty src")
        if alt is None:
            errors.append(f"{path.name}: image {src!r} is missing alt text")

    for kind, url in parser.links + [("img", src) for src, _ in parser.images]:
        candidate = local_path_for(url, path)
        if candidate and not candidate.exists():
            errors.append(f"{path.name}: missing local {kind} target {url!r}")

    return errors


def main() -> int:
    errors: list[str] = []
    for relative in REQUIRED_FILES:
        if not (ROOT / relative).exists():
            errors.append(f"missing required file: {relative}")

    for html in sorted(ROOT.glob("*.html")):
        errors.extend(validate_html(html))

    if errors:
        print("Static site validation failed:")
        for error in errors:
            print(f"- {error}")
        return 1

    print("Static site validation passed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
