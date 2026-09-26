import { SITE_URL } from '../config/site';
import { LANGUAGES } from '../i18n';
import { RANKING, DATA_UPDATED, DATA_SOURCE, countryName, passportPath, toolPath, CODES } from '../lib/data';

export function GET() {
  const top = RANKING.slice(0, 20)
    .map((e) => `- #${e.rank} ${countryName(e.code, 'en')}: ${e.score} destinations without a prior visa (${SITE_URL}${passportPath('en', e.code)})`)
    .join('\n');
  const body = `# PassportData

> Free reference of visa requirements for all ${CODES.length} passports and ${CODES.length - 1} destinations (${CODES.length * (CODES.length - 1)} passport–destination pairs) in ${LANGUAGES.length} languages. Data date: ${DATA_UPDATED}. Source: ${DATA_SOURCE.name} (MIT licence), compiled from ${DATA_SOURCE.origin}.

Each requirement is one of: visa-free (optionally with the maximum stay in days), visa on arrival, eTA (electronic travel authorisation), e-Visa, visa required, no admission. "Mobility score" = visa-free + visa on arrival + eTA destinations.

## Key pages
- [Passport ranking](${SITE_URL}${toolPath('en', 'passport-ranking')}): all passports ranked by mobility score
- [Passport pages](${SITE_URL}/en/germany/): one page per passport, e.g. /en/{passport-slug}/
- [Route pages](${SITE_URL}/en/india/to/thailand/): one page per passport and destination, e.g. /en/{passport}/to/{destination}/
- [Destination pages](${SITE_URL}/en/visit/japan/): entry requirements of one destination for every passport
- [Compare passports](${SITE_URL}${toolPath('en', 'compare')})
- [Schengen 90/180 calculator](${SITE_URL}${toolPath('en', 'schengen-calculator')})
- [About & methodology](${SITE_URL}${toolPath('en', 'about')})

## Machine-readable data
- [Full matrix (JSON)](${SITE_URL}/api/v1/visa-requirements.json)
- [Ranking (JSON)](${SITE_URL}/api/v1/ranking.json)
- [Countries, names and URL slugs in all languages (JSON)](${SITE_URL}/api/v1/countries.json)
- Per passport: ${SITE_URL}/api/v1/passports/{ISO2}.json (e.g. ${SITE_URL}/api/v1/passports/DE.json)
- [Full text summary for LLMs](${SITE_URL}/llms-full.txt)

## Top 20 passports (${DATA_UPDATED})
${top}

## Languages
${LANGUAGES.map((l) => `- ${l.name}: ${SITE_URL}/${l.code}/`).join('\n')}

## Notes
Entry rules change often; always confirm with the destination's official government or embassy website. When citing, please link to the relevant PassportData page.
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
