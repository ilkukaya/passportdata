export type VisaStatus = 'visa_free' | 'visa_on_arrival' | 'e_visa' | 'visa_required';

export interface VisaEntry {
  status: VisaStatus;
  days: number | null;
  notes: string;
}

export function filterByStatus(visaData: Record<string, VisaEntry>, status: VisaStatus): [string, VisaEntry][] {
  return Object.entries(visaData).filter(([, v]) => v.status === status);
}

export function filterByContinent(
  entries: [string, VisaEntry][],
  continent: string,
  countries: Record<string, any>
): [string, VisaEntry][] {
  if (continent === 'all') return entries;
  return entries.filter(([code]) => countries[code]?.continent === continent);
}

export function sortByCountryName(
  entries: [string, VisaEntry][],
  lang: string,
  countries: Record<string, any>
): [string, VisaEntry][] {
  return entries.sort(([a], [b]) => {
    const nameA = countries[a]?.names?.[lang] || countries[a]?.names?.en || a;
    const nameB = countries[b]?.names?.[lang] || countries[b]?.names?.en || b;
    return nameA.localeCompare(nameB);
  });
}
