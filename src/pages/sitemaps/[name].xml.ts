import type { APIContext } from 'astro';
import { LANG_CODES } from '../../i18n';
import { homePath, alternatesFor } from '../../lib/data';
import { CHUNK, entriesFor, renderUrlset, sitemapNames } from '../../lib/sitemap';

export function getStaticPaths() {
  return sitemapNames().map((name) => ({ params: { name } }));
}

export function GET({ params }: APIContext) {
  const name = params.name!;
  let entries;
  if (name === 'root') {
    entries = [{ path: '/', alternates: alternatesFor(homePath), xDefault: '/' }];
  } else {
    const [lang, page] = name.split('-');
    if (!LANG_CODES.includes(lang)) return new Response(null, { status: 404 });
    entries = entriesFor(lang).slice((Number(page) - 1) * CHUNK, Number(page) * CHUNK);
  }
  return new Response(renderUrlset(entries), { headers: { 'Content-Type': 'application/xml' } });
}
