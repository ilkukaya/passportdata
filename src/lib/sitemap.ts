import { LANG_CODES, langInfo } from '../i18n';
import { SITE_URL } from '../config/site';
import {
  CODES, DATA_UPDATED, homePath, passportPath, visitPath, routePath, toolPath, hasRoutes, routeLangs, alternatesFor,
} from './data';

export interface SitemapEntry {
  path: string;
  alternates: Record<string, string>;
  xDefault?: string;
}

const TOOLS = ['passport-ranking', 'compare', 'schengen-calculator', 'about', 'privacy', 'terms'];
export const CHUNK = 20_000;

/** Every indexable URL of a language, with its hreflang alternates. */
export function entriesFor(lang: string): SitemapEntry[] {
  const out: SitemapEntry[] = [{ path: homePath(lang), alternates: alternatesFor(homePath), xDefault: '/' }];
  for (const tool of TOOLS) out.push({ path: toolPath(lang, tool), alternates: alternatesFor((l) => toolPath(l, tool)) });
  for (const code of CODES) out.push({ path: passportPath(lang, code), alternates: alternatesFor((l) => passportPath(l, code)) });
  for (const code of CODES) out.push({ path: visitPath(lang, code), alternates: alternatesFor((l) => visitPath(l, code)) });
  for (const from of CODES) {
    if (!hasRoutes(lang, from)) continue;
    const langs = routeLangs(from);
    for (const to of CODES) {
      if (to !== from) out.push({ path: routePath(lang, from, to), alternates: alternatesFor((l) => routePath(l, from, to), langs) });
    }
  }
  return out;
}

export function sitemapNames(): string[] {
  const names = ['root'];
  for (const lang of LANG_CODES) {
    const chunks = Math.ceil(entriesFor(lang).length / CHUNK);
    for (let i = 1; i <= chunks; i++) names.push(`${lang}-${i}`);
  }
  return names;
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

export function renderUrlset(entries: SitemapEntry[]): string {
  const body = entries
    .map((e) => {
      const alts = Object.entries(e.alternates);
      const links =
        alts.length > 1
          ? alts
              .map(([l, p]) => `<xhtml:link rel="alternate" hreflang="${langInfo(l).hreflang}" href="${esc(SITE_URL + p)}"/>`)
              .join('') +
            `<xhtml:link rel="alternate" hreflang="x-default" href="${esc(SITE_URL + (e.xDefault ?? e.alternates.en ?? e.path))}"/>`
          : '';
      return `<url><loc>${esc(SITE_URL + e.path)}</loc><lastmod>${DATA_UPDATED}</lastmod>${links}</url>`;
    })
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${body}\n</urlset>\n`;
}
