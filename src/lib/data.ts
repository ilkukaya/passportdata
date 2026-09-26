import visa from '../data/visa.json';
import countriesJson from '../data/countries.json';
import { ROUTE_ORIGINS, SITE_URL } from '../config/site';
import { LANG_CODES } from '../i18n';

export type Status = 'visa_free' | 'visa_on_arrival' | 'eta' | 'e_visa' | 'visa_required' | 'no_admission';
export const STATUSES: Status[] = ['visa_free', 'visa_on_arrival', 'eta', 'e_visa', 'visa_required', 'no_admission'];
/** Statuses that let you travel without applying for a visa in advance. */
export const OPEN_STATUSES: Status[] = ['visa_free', 'visa_on_arrival', 'eta'];

export interface Requirement {
  status: Status;
  days: number | null;
}
interface Country {
  continent: 'EU' | 'AS' | 'AF' | 'NA' | 'SA' | 'OC';
  names: Record<string, string>;
  slugs: Record<string, string>;
}

const matrix = visa.matrix as unknown as Record<string, Record<string, [Status, number?]>>;
export const COUNTRIES = countriesJson as unknown as Record<string, Country>;
export const CODES = Object.keys(COUNTRIES).sort();
export const DATA_UPDATED: string = visa.updated;
export const DATA_SOURCE = visa.source;
export const DESTINATION_COUNT = CODES.length - 1;

export function requirement(from: string, to: string): Requirement | null {
  const r = matrix[from]?.[to];
  return r ? { status: r[0], days: r[1] ?? null } : null;
}

export const countryName = (code: string, lang: string) => COUNTRIES[code]?.names[lang] ?? COUNTRIES[code]?.names.en ?? code;
export const countrySlug = (code: string, lang: string) => COUNTRIES[code]?.slugs[lang] ?? COUNTRIES[code]?.slugs.en;
export const continentOf = (code: string) => COUNTRIES[code]?.continent;
export const flagUrl = (code: string) => `/flags/${code.toLowerCase()}.svg`;

export function sortByName(codes: string[], lang: string): string[] {
  const collator = new Intl.Collator(lang);
  return [...codes].sort((a, b) => collator.compare(countryName(a, lang), countryName(b, lang)));
}

export type Counts = Record<Status, number> & { open: number };
const emptyCounts = (): Counts => ({
  visa_free: 0, visa_on_arrival: 0, eta: 0, e_visa: 0, visa_required: 0, no_admission: 0, open: 0,
});

const outboundCache = new Map<string, Counts>();
/** How a passport fares across all destinations. */
export function outboundCounts(passport: string): Counts {
  if (!outboundCache.has(passport)) {
    const c = emptyCounts();
    for (const [status] of Object.values(matrix[passport] ?? {})) c[status]++;
    c.open = c.visa_free + c.visa_on_arrival + c.eta;
    outboundCache.set(passport, c);
  }
  return outboundCache.get(passport)!;
}

const inboundCache = new Map<string, Counts>();
/** How a destination treats all passports. */
export function inboundCounts(destination: string): Counts {
  if (!inboundCache.has(destination)) {
    const c = emptyCounts();
    for (const from of CODES) {
      const r = matrix[from]?.[destination];
      if (r) c[r[0]]++;
    }
    c.open = c.visa_free + c.visa_on_arrival + c.eta;
    inboundCache.set(destination, c);
  }
  return inboundCache.get(destination)!;
}

/** Destinations of a passport grouped by status. */
export function outboundGroups(passport: string): Record<Status, string[]> {
  const groups = Object.fromEntries(STATUSES.map((s) => [s, [] as string[]])) as Record<Status, string[]>;
  for (const [to, [status]] of Object.entries(matrix[passport] ?? {})) groups[status].push(to);
  return groups;
}

/** Passports grouped by how a destination treats them. */
export function inboundGroups(destination: string): Record<Status, string[]> {
  const groups = Object.fromEntries(STATUSES.map((s) => [s, [] as string[]])) as Record<Status, string[]>;
  for (const from of CODES) {
    const r = matrix[from]?.[destination];
    if (r) groups[r[0]].push(from);
  }
  return groups;
}

export interface RankEntry {
  code: string;
  rank: number;
  score: number;
  counts: Counts;
}
/** Passport ranking by mobility score (standard competition ranking: 1, 1, 3 …). */
export const RANKING: RankEntry[] = (() => {
  const entries = CODES.map((code) => ({ code, counts: outboundCounts(code), score: outboundCounts(code).open, rank: 0 }));
  entries.sort((a, b) => b.score - a.score || b.counts.visa_free - a.counts.visa_free || a.code.localeCompare(b.code));
  entries.forEach((e, i) => (e.rank = i > 0 && e.score === entries[i - 1].score ? entries[i - 1].rank : i + 1));
  return entries;
})();
const rankByCode = new Map(RANKING.map((e) => [e.code, e]));
export const rankOf = (code: string) => rankByCode.get(code)!;

/* ---------- URLs ---------- */

export const homePath = (lang: string) => `/${lang}/`;
export const passportPath = (lang: string, code: string) => `/${lang}/${countrySlug(code, lang)}/`;
export const visitPath = (lang: string, code: string) => `/${lang}/visit/${countrySlug(code, lang)}/`;
export const routePath = (lang: string, from: string, to: string) =>
  `/${lang}/${countrySlug(from, lang)}/to/${countrySlug(to, lang)}/`;
export const toolPath = (lang: string, tool: string) => `/${lang}/${tool}/`;
export const absolute = (path: string) => `${SITE_URL}${path}`;

/** Whether /lang/{from}/to/{dest}/ pages exist for this passport in this language. */
export function hasRoutes(lang: string, from: string): boolean {
  const origins = ROUTE_ORIGINS[lang];
  return origins === 'all' || (Array.isArray(origins) && origins.includes(from));
}

/** Best link for "passport X → destination Y" in a language: the route page, else the destination page. */
export const pairPath = (lang: string, from: string, to: string) =>
  hasRoutes(lang, from) ? routePath(lang, from, to) : visitPath(lang, to);

export type Alternates = Record<string, string>;
export const alternatesFor = (build: (lang: string) => string, langs: string[] = LANG_CODES): Alternates =>
  Object.fromEntries(langs.map((l) => [l, build(l)]));
export const routeLangs = (from: string) => LANG_CODES.filter((l) => hasRoutes(l, from));
