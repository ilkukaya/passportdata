import { SITE_NAME, SITE_URL } from '../config/site';
import { DATA_UPDATED, DATA_SOURCE } from './data';

export const ORG_ID = `${SITE_URL}/#organization`;
export const SITE_ID = `${SITE_URL}/#website`;
export const DATASET_ID = `${SITE_URL}/#dataset`;

export interface Crumb {
  name: string;
  path?: string;
}
export interface QA {
  q: string;
  a: string;
}

export function baseGraph(lang: string, tagline: string) {
  return [
    {
      '@type': 'Organization',
      '@id': ORG_ID,
      name: SITE_NAME,
      url: `${SITE_URL}/`,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/icon-512.png`, width: 512, height: 512 },
    },
    {
      '@type': 'WebSite',
      '@id': SITE_ID,
      name: SITE_NAME,
      url: `${SITE_URL}/`,
      description: tagline,
      publisher: { '@id': ORG_ID },
      inLanguage: lang,
    },
  ];
}

export function webPage(opts: {
  url: string;
  name: string;
  description: string;
  lang: string;
  type?: string;
  crumbs?: Crumb[];
  about?: object;
}) {
  const page: Record<string, unknown> = {
    '@type': opts.type ?? 'WebPage',
    '@id': `${opts.url}#webpage`,
    url: opts.url,
    name: opts.name,
    description: opts.description,
    inLanguage: opts.lang,
    isPartOf: { '@id': SITE_ID },
    publisher: { '@id': ORG_ID },
    dateModified: DATA_UPDATED,
  };
  if (opts.crumbs?.length) page.breadcrumb = { '@id': `${opts.url}#breadcrumb` };
  if (opts.about) page.about = opts.about;
  return page;
}

export function breadcrumbList(url: string, crumbs: Crumb[]) {
  return {
    '@type': 'BreadcrumbList',
    '@id': `${url}#breadcrumb`,
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      ...(c.path ? { item: `${SITE_URL}${c.path}` } : {}),
    })),
  };
}

export function faqPage(url: string, items: QA[]) {
  return {
    '@type': 'FAQPage',
    '@id': `${url}#faq`,
    mainEntity: items.map((it) => ({
      '@type': 'Question',
      name: it.q,
      acceptedAnswer: { '@type': 'Answer', text: it.a },
    })),
  };
}

export function dataset(lang: string, name: string, description: string) {
  return {
    '@type': 'Dataset',
    '@id': DATASET_ID,
    name,
    description,
    url: `${SITE_URL}/${lang}/about/`,
    inLanguage: lang,
    license: 'https://opensource.org/licenses/MIT',
    isAccessibleForFree: true,
    dateModified: DATA_UPDATED,
    creator: { '@id': ORG_ID },
    isBasedOn: DATA_SOURCE.url,
    keywords: ['visa requirements', 'passport', 'visa-free travel', 'passport ranking', 'e-Visa', 'eTA'],
    spatialCoverage: 'Worldwide',
    variableMeasured: 'Visa requirement per passport and destination',
    distribution: [
      {
        '@type': 'DataDownload',
        encodingFormat: 'application/json',
        contentUrl: `${SITE_URL}/api/v1/visa-requirements.json`,
      },
    ],
  };
}
