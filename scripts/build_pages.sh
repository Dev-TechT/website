#!/usr/bin/env bash
set -euo pipefail
[[ ! -e _site ]] || { printf "%s\n" "Refusing to overwrite _site" >&2; exit 1; }
mkdir -p _site
cp -R assets _site/assets
cp 404.html CNAME ai-language-check.html audit-example.md fillblank.html fillblank-language.js fillblank-sample-report.html impressum.html index.html language.js llms.txt privacy.html privacy-language.js robots.txt sample-audit.html sitemap.xml style.css _site/
mkdir -p _site/labs/sentinel-swarm/{assets,data}
cp labs/sentinel-swarm/{index.html,sentinel.css,sentinel.js} _site/labs/sentinel-swarm/
cp labs/sentinel-swarm/assets/world.svg _site/labs/sentinel-swarm/assets/
cp labs/sentinel-swarm/data/kev.json _site/labs/sentinel-swarm/data/
