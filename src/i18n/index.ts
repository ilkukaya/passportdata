import languages from './languages.json';
import en from './ui/en';

export type UI = typeof en;
export type Lang = (typeof languages)[number]['code'];
export interface LanguageInfo {
  code: string;
  name: string;
  hreflang: string;
  ogLocale: string;
  dir: 'ltr' | 'rtl';
  latinSlugs: boolean;
}

export const LANGUAGES = languages as LanguageInfo[];
export const LANG_CODES = LANGUAGES.map((l) => l.code);
export const DEFAULT_LANG = 'en';
export const langInfo = (lang: string) => LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0];

const modules = import.meta.glob<{ default: UI }>('./ui/*.ts', { eager: true });

function deepMerge<T>(base: T, override: any): T {
  if (Array.isArray(base)) return (Array.isArray(override) && override.length === base.length ? override : base) as T;
  if (base && typeof base === 'object') {
    const out: any = {};
    for (const key of Object.keys(base as any)) out[key] = deepMerge((base as any)[key], override?.[key]);
    return out;
  }
  return (typeof override === typeof base ? override : base) as T;
}

const dictionaries: Record<string, UI> = {};
for (const { code } of LANGUAGES) {
  const mod = modules[`./ui/${code}.ts`];
  dictionaries[code] = code === 'en' || !mod ? en : deepMerge(en, mod.default);
}

export function getUI(lang: string): UI {
  return dictionaries[lang] ?? en;
}

/** Replace {placeholders} in a template. */
export function fmt(template: string, vars: Record<string, string | number> = {}): string {
  return template.replace(/\{(\w+)\}/g, (m, key) => (key in vars ? String(vars[key]) : m));
}

const numberFormats = new Map<string, Intl.NumberFormat>();
export function num(lang: string, n: number): string {
  if (!numberFormats.has(lang)) numberFormats.set(lang, new Intl.NumberFormat(lang, { numberingSystem: 'latn' }));
  return numberFormats.get(lang)!.format(n);
}

export function formatDate(lang: string, iso: string): string {
  return new Intl.DateTimeFormat(lang, { dateStyle: 'long', timeZone: 'UTC', numberingSystem: 'latn' }).format(
    new Date(`${iso}T00:00:00Z`),
  );
}

/** Locale-aware list: "A, B and C". */
export function list(lang: string, items: string[]): string {
  return new Intl.ListFormat(lang, { style: 'long', type: 'conjunction' }).format(items);
}
