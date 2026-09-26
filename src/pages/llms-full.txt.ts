import { SITE_URL } from '../config/site';
import { RANKING, DATA_UPDATED, DATA_SOURCE, countryName, passportPath, outboundGroups, sortByName } from '../lib/data';

export function GET() {
  const sections = RANKING.map((e) => {
    const g = outboundGroups(e.code);
    const names = (codes: string[]) => sortByName(codes, 'en').map((c) => countryName(c, 'en')).join(', ') || '—';
    return `## ${countryName(e.code, 'en')} passport (${e.code})
Rank #${e.rank} · mobility score ${e.score} · visa-free ${e.counts.visa_free} · visa on arrival ${e.counts.visa_on_arrival} · eTA ${e.counts.eta} · e-Visa ${e.counts.e_visa} · visa required ${e.counts.visa_required}${e.counts.no_admission ? ` · no admission ${e.counts.no_admission}` : ''}
URL: ${SITE_URL}${passportPath('en', e.code)}
- Visa-free: ${names(g.visa_free)}
- Visa on arrival: ${names(g.visa_on_arrival)}
- eTA: ${names(g.eta)}
- e-Visa: ${names(g.e_visa)}
`;
  }).join('\n');
  const body = `# PassportData – full passport summaries

Data date ${DATA_UPDATED}. Source: ${DATA_SOURCE.name} (MIT), ${DATA_SOURCE.origin}. Destinations not listed for a passport require a visa from an embassy (or deny admission). Always confirm with official sources before travel.

${sections}`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
