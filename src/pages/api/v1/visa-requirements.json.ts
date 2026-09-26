import visa from '../../../data/visa.json';
import { SITE_URL } from '../../../config/site';

export function GET() {
  return Response.json({
    updated: visa.updated,
    source: visa.source,
    license: 'MIT',
    site: SITE_URL,
    format: 'matrix[passport][destination] = [status, maxStayDays?]',
    statuses: ['visa_free', 'visa_on_arrival', 'eta', 'e_visa', 'visa_required', 'no_admission'],
    matrix: visa.matrix,
  });
}
