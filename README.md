# PassportData

Visa requirements for every passport – 199 passports × 198 destinations in 15 languages.
Static site built with [Astro](https://astro.build) and Tailwind CSS, deployed to Netlify.

- **Data:** open Passport Index dataset (MIT) → `src/data/visa.json`, refreshed weekly by GitHub Actions (`scripts/update-data.mjs`).
- **Languages:** en, zh, hi, es, ar, fr, bn, pt, ru, ur, id, de, ja, tr, vi (`src/i18n/`).
- **Pages:** passport pages, passport→destination route pages, destination pages, ranking, compare tool, Schengen 90/180 calculator, legal pages.
- **SEO/AEO/GEO:** hreflang, chunked multilingual sitemaps, JSON-LD (FAQPage, Dataset, BreadcrumbList, ItemList), `llms.txt`, open JSON API under `/api/v1/`, IndexNow.
- **Deploy:** Netlify builds the default branch automatically on every push.
- **Monetisation:** AdSense (with Consent Mode v2), analytics and affiliate links are configured through environment variables – see `.env.example`.

```bash
npm ci
PD_ROUTES=minimal npm run build   # fast local build
npm run build                     # full build
```

Launch guide (Turkish): [docs/YAYINA-ALMA.md](docs/YAYINA-ALMA.md)
