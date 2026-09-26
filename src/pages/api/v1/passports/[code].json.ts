import type { APIContext } from 'astro';
import visa from '../../../../data/visa.json';
import { CODES, DATA_UPDATED, countryName, outboundCounts, rankOf } from '../../../../lib/data';

export function getStaticPaths() {
  return CODES.map((code) => ({ params: { code } }));
}

export function GET({ params }: APIContext) {
  const code = params.code!;
  return Response.json({
    code,
    name: countryName(code, 'en'),
    updated: DATA_UPDATED,
    rank: rankOf(code).rank,
    counts: outboundCounts(code),
    requirements: (visa.matrix as Record<string, unknown>)[code],
  });
}
