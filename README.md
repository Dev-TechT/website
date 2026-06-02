# it-expert.io portfolio website

Static portfolio and service website for Antonios Chatzigiagkos, published from this repository to GitHub Pages at <https://it-expert.io/>.

## What is in this repo

- `index.html` — main landing page
- `style.css` — site styling
- `privacy.html` and `impressum.html` — public legal/contact pages
- `sample-audit.html` and `audit-example.md` — example AI automation audit material
- `ai-language-check.html` and `fillblank.html` — client-friendly AI language consistency check plus legacy redirect
- `assets/images/` — local image assets
- `.github/workflows/static.yml` — GitHub Pages deployment workflow

## Local preview

No build step is required. Serve the repository root with any static server:

```bash
python3 -m http.server 8080
```

Then open <http://127.0.0.1:8080/>.

## Validation before changes

Run the same checks used by CI:

```bash
python3 scripts/check_static_site.py
```

The checker verifies key pages exist, required HTML structure is present, and local asset links resolve.

## Contributing

Small fixes are welcome. Good first contributions are:

- typos or broken links
- accessibility improvements
- SEO metadata improvements
- safer wording for public service descriptions
- CSS cleanup that preserves the current visual style

Please do not add tracking scripts, third-party embeds, cookies, client/customer details, or unsupported compliance claims. See `CONTRIBUTING.md` for the full checklist.

## License and content rights

The website code can be reused under the repository license once a license is added. Personal photos, logos, contact details, and portfolio copy are not offered for reuse unless explicitly stated.
