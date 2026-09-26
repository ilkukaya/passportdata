import { RANKING, DATA_UPDATED, countryName } from '../../../lib/data';

export function GET() {
  return Response.json({
    updated: DATA_UPDATED,
    method: 'mobility score = visa_free + visa_on_arrival + eta destinations',
    ranking: RANKING.map((e) => ({ code: e.code, name: countryName(e.code, 'en'), rank: e.rank, score: e.score, ...e.counts })),
  });
}
