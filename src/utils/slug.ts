import type { Lang } from './i18n';

const CATEGORY_SLUGS: Record<string, Record<Lang, string>> = {
  'visa-free-countries': {
    en: 'visa-free-countries',
    tr: 'vizesiz-ulkeler',
    es: 'paises-sin-visa',
    ar: 'dwal-bidun-tashira',
    pt: 'paises-sem-visto',
    fr: 'pays-sans-visa',
  },
  'visa-on-arrival': {
    en: 'visa-on-arrival',
    tr: 'kapida-vize',
    es: 'visa-a-la-llegada',
    ar: 'tashira-ind-alwsul',
    pt: 'visto-na-chegada',
    fr: 'visa-a-larrivee',
  },
  'e-visa': {
    en: 'e-visa',
    tr: 'e-vize',
    es: 'e-visa',
    ar: 'tashira-elektroniya',
    pt: 'e-visto',
    fr: 'e-visa',
  },
  'visa-required': {
    en: 'visa-required',
    tr: 'vize-gerekli',
    es: 'visa-requerida',
    ar: 'tashira-matluba',
    pt: 'visto-necessario',
    fr: 'visa-requis',
  },
};

export function getCategorySlug(category: string, lang: Lang): string {
  return CATEGORY_SLUGS[category]?.[lang] || category;
}

export function getCategoryFromSlug(slug: string, lang: Lang): string | null {
  for (const [category, slugs] of Object.entries(CATEGORY_SLUGS)) {
    if (slugs[lang] === slug) return category;
  }
  return null;
}
