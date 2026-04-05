import enTranslations from '../data/translations/en.json';
import trTranslations from '../data/translations/tr.json';
import esTranslations from '../data/translations/es.json';
import arTranslations from '../data/translations/ar.json';
import ptTranslations from '../data/translations/pt.json';
import frTranslations from '../data/translations/fr.json';

export const SUPPORTED_LANGS = ['en', 'tr', 'es', 'ar', 'pt', 'fr'] as const;
export type Lang = typeof SUPPORTED_LANGS[number];

const translationsMap: Record<Lang, any> = {
  en: enTranslations,
  tr: trTranslations,
  es: esTranslations,
  ar: arTranslations,
  pt: ptTranslations,
  fr: frTranslations,
};

export function getLangFromUrl(url: URL): Lang {
  const [, lang] = url.pathname.split('/');
  if (SUPPORTED_LANGS.includes(lang as Lang)) return lang as Lang;
  return 'en';
}

export function useTranslations(lang: Lang) {
  const translations = translationsMap[lang] || translationsMap.en;
  return function t(key: string, replacements?: Record<string, string>): string {
    const keys = key.split('.');
    let value: any = translations;
    for (const k of keys) value = value?.[k];
    if (typeof value !== 'string') return key;
    if (replacements) {
      return Object.entries(replacements).reduce(
        (str, [k, v]) => str.replace(new RegExp(`\\{${k}\\}`, 'g'), v),
        value
      );
    }
    return value;
  };
}

export function getCountrySlug(countryCode: string, lang: Lang, countries: any): string {
  return countries[countryCode]?.slugs?.[lang] || countries[countryCode]?.slugs?.['en'] || countryCode.toLowerCase();
}

export function getCountryCodeFromSlug(slug: string, lang: Lang, countries: any): string | null {
  for (const [code, data] of Object.entries(countries) as [string, any][]) {
    if (data.slugs?.[lang] === slug || data.slugs?.['en'] === slug) {
      return code;
    }
  }
  return null;
}

export function getAlternateLinks(countryCode: string, pageType: string, countries: any): Record<Lang, string> {
  const result: Record<string, string> = {};
  for (const lang of SUPPORTED_LANGS) {
    const slug = getCountrySlug(countryCode, lang, countries);
    const suffix = pageType && pageType !== 'home' ? `${pageType}/` : '';
    result[lang] = `/${lang}/${slug}/${suffix}`;
  }
  return result as Record<Lang, string>;
}

export function getToolPageAlternateLinks(pageSlug: string): Record<Lang, string> {
  const result: Record<string, string> = {};
  for (const lang of SUPPORTED_LANGS) {
    result[lang] = `/${lang}/${pageSlug}/`;
  }
  return result as Record<Lang, string>;
}

export function isRTL(lang: Lang): boolean {
  return lang === 'ar';
}

export function getVisaStats(visaData: Record<string, any>) {
  const values = Object.values(visaData);
  return {
    visa_free: values.filter((v: any) => v.status === 'visa_free').length,
    visa_on_arrival: values.filter((v: any) => v.status === 'visa_on_arrival').length,
    e_visa: values.filter((v: any) => v.status === 'e_visa').length,
    visa_required: values.filter((v: any) => v.status === 'visa_required').length,
    total: values.length,
  };
}

export function getVisaStatusColor(status: string): string {
  switch (status) {
    case 'visa_free': return 'bg-green-100 text-green-800';
    case 'visa_on_arrival': return 'bg-yellow-100 text-yellow-800';
    case 'e_visa': return 'bg-blue-100 text-blue-800';
    case 'visa_required': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

export function getVisaStatusDot(status: string): string {
  switch (status) {
    case 'visa_free': return 'bg-green-500';
    case 'visa_on_arrival': return 'bg-yellow-500';
    case 'e_visa': return 'bg-blue-500';
    case 'visa_required': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
}
