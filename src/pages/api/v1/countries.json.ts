import { COUNTRIES, DATA_UPDATED } from '../../../lib/data';

export function GET() {
  return Response.json({ updated: DATA_UPDATED, countries: COUNTRIES });
}
