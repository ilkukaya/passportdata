import { SITE_URL } from '../config/site';
import { DATA_UPDATED } from '../lib/data';
import { sitemapNames } from '../lib/sitemap';

export function GET() {
  const items = sitemapNames()
    .map((n) => `<sitemap><loc>${SITE_URL}/sitemaps/${n}.xml</loc><lastmod>${DATA_UPDATED}</lastmod></sitemap>`)
    .join('\n');
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items}\n</sitemapindex>\n`,
    { headers: { 'Content-Type': 'application/xml' } },
  );
}
