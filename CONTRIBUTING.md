# Contributing

Thanks for improving the portfolio site. This repo is intentionally simple: static HTML, CSS, images, and GitHub Pages deployment.

## Ground rules

- Keep the site static and privacy-friendly.
- Do not add analytics, trackers, external embeds, cookie banners, forms, or third-party scripts without an issue discussing the tradeoff first.
- Do not add real client names, internal documents, private contact data, credentials, or screenshots that reveal sensitive information.
- Avoid absolute claims such as “guaranteed compliant”, “certified”, or “fully secure” unless there is a current source and explicit approval.
- Preserve the direct, practical tone of the site.

## Development

Preview locally:

```bash
python3 -m http.server 8080
```

Run validation:

```bash
python3 scripts/check_static_site.py
```

## Pull request checklist

- [ ] I ran `python3 scripts/check_static_site.py`.
- [ ] New links and images resolve locally.
- [ ] No trackers, external scripts, credentials, or private data were added.
- [ ] Public claims are factual and not overstated.
- [ ] The change preserves mobile readability and keyboard navigation.
