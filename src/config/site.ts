/**
 * Central site configuration. Everything monetisation/analytics related is driven by
 * environment variables so the site renders cleanly (no broken ad slots or dead
 * affiliate links) until real IDs are provided. See .env.example.
 */
// Shell/CI variables (process.env) take precedence over values loaded from .env files.
const env: Record<string, unknown> = { ...import.meta.env, ...((globalThis as any).process?.env ?? {}) };

const clean = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : '');

export const SITE_URL = (clean(env.SITE_URL) || 'https://passportdata.netlify.app').replace(/\/$/, '');
export const SITE_NAME = 'PassportData';
export const CONTACT_EMAIL = clean(env.PUBLIC_CONTACT_EMAIL);

export const ADSENSE_CLIENT = clean(env.PUBLIC_ADSENSE_CLIENT); // e.g. ca-pub-1234567890123456
export const ADSENSE_SLOTS = {
  top: clean(env.PUBLIC_ADSENSE_SLOT_TOP),
  inContent: clean(env.PUBLIC_ADSENSE_SLOT_IN_CONTENT),
  bottom: clean(env.PUBLIC_ADSENSE_SLOT_BOTTOM),
};
export const GA4_ID = clean(env.PUBLIC_GA4_ID); // e.g. G-XXXXXXXXXX
export const CF_ANALYTICS_TOKEN = clean(env.PUBLIC_CF_ANALYTICS_TOKEN);
// IndexNow keys are public by design (served at /{key}.txt).
export const INDEXNOW_KEY = clean(env.PUBLIC_INDEXNOW_KEY) || '03dadaeb24b51e7d05988552784a5067';

export const VERIFICATION = {
  google: clean(env.PUBLIC_GOOGLE_SITE_VERIFICATION),
  bing: clean(env.PUBLIC_BING_SITE_VERIFICATION),
  yandex: clean(env.PUBLIC_YANDEX_VERIFICATION),
};

/** Affiliate programmes that are free to join. Links are only shown once an ID is set. */
export const AFFILIATES = {
  safetywing: clean(env.PUBLIC_AFF_SAFETYWING), // referenceID
  airalo: clean(env.PUBLIC_AFF_AIRALO_URL), // full referral URL
  booking: clean(env.PUBLIC_AFF_BOOKING_URL), // full tracking URL (e.g. Travelpayouts / Booking affiliate)
  ivisa: clean(env.PUBLIC_AFF_IVISA_URL), // full tracking URL
};

/**
 * Route pages (/lang/{passport}/to/{destination}/) are generated for every passport in
 * English and, in other languages, for the passports of countries where that language is
 * widely spoken — this is who actually searches in that language, and it keeps the site
 * free of hundreds of thousands of near-duplicate pages.
 */
const MINIMAL_ROUTES = clean(env.PD_ROUTES) === 'minimal'; // faster local/dev builds
export const ROUTE_ORIGINS: Record<string, string[] | 'all'> = {
  en: MINIMAL_ROUTES ? ['US', 'GB', 'IN', 'TR', 'DE'] : 'all',
  zh: ['CN', 'TW', 'HK', 'MO', 'SG', 'MY'],
  hi: ['IN', 'NP'],
  es: ['ES', 'MX', 'AR', 'CO', 'PE', 'VE', 'CL', 'EC', 'GT', 'CU', 'BO', 'DO', 'HN', 'PY', 'SV', 'NI', 'CR', 'PA', 'UY', 'GQ'],
  ar: ['SA', 'EG', 'AE', 'IQ', 'JO', 'LB', 'SY', 'YE', 'OM', 'QA', 'KW', 'BH', 'LY', 'TN', 'DZ', 'MA', 'SD', 'PS', 'MR', 'SO', 'DJ', 'KM'],
  fr: ['FR', 'BE', 'CH', 'CA', 'LU', 'MC', 'SN', 'CI', 'CM', 'MA', 'DZ', 'TN', 'HT', 'CD', 'CG', 'MG', 'ML', 'BF', 'NE', 'GN', 'BJ', 'TG', 'TD', 'GA', 'RW', 'BI', 'DJ', 'KM', 'MR', 'CF'],
  bn: ['BD', 'IN'],
  pt: ['BR', 'PT', 'AO', 'MZ', 'CV', 'GW', 'ST', 'TL'],
  ru: ['RU', 'BY', 'KZ', 'KG', 'UA', 'UZ', 'TJ', 'TM', 'AZ', 'AM', 'GE', 'MD'],
  ur: ['PK', 'IN'],
  id: ['ID'],
  de: ['DE', 'AT', 'CH', 'LI', 'LU'],
  ja: ['JP'],
  tr: ['TR', 'AZ', 'CY'],
  vi: ['VN'],
};

/** Top tourist destinations, used for "popular destinations" lists and FAQ answers. */
export const POPULAR_DESTINATIONS = [
  'FR', 'ES', 'US', 'TR', 'IT', 'MX', 'GB', 'DE', 'GR', 'AT', 'TH', 'JP', 'AE', 'SA', 'PT', 'MY', 'NL', 'HR', 'CN', 'CA',
  'EG', 'MA', 'ID', 'SG', 'KR', 'VN', 'AU', 'IN', 'BR', 'GE',
];
export const POPULAR_PASSPORTS = ['US', 'GB', 'IN', 'CN', 'DE', 'TR', 'BR', 'PK', 'NG', 'PH', 'ID', 'MX', 'RU', 'BD', 'EG', 'FR'];

/** Schengen Area members (2025+: including Bulgaria and Romania). */
export const SCHENGEN = [
  'AT', 'BE', 'BG', 'HR', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IS', 'IT', 'LV', 'LI', 'LT', 'LU', 'MT', 'NL',
  'NO', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 'CH',
];
