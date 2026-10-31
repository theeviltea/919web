// Registration dictionaries — seeker questionnaires by field (claude/919-questionnaires.md) and location data.

export type Field = 'model' | 'music' | 'service' | 'entertainment' | 'hospitality';
export type Questionnaire = 'body' | 'model' | 'music' | 'service';

export const fields: { key: Field; label: string; icon: 'star' | 'play' | 'briefcase' | 'sparkles' | 'building'; roles: string[]; form: Questionnaire }[] = [
  { key: 'model', label: 'Model business', icon: 'star', roles: ['Model', 'Image model', 'Promo model', 'Extras'], form: 'model' },
  { key: 'music', label: 'Music', icon: 'play', roles: ['DJ', 'Vocal performer', 'Musician', 'MC', 'Live band'], form: 'music' },
  { key: 'service', label: 'Service', icon: 'briefcase', roles: ['Photography', 'Filming', 'Stylist', 'Make up', 'PR'], form: 'service' },
  { key: 'entertainment', label: 'Entertainment', icon: 'sparkles', roles: ['Dancer', 'Animator', 'Stage show', 'Actor / actress', 'Host'], form: 'body' },
  { key: 'hospitality', label: 'Hospitality', icon: 'building', roles: ['Champagne girl', 'Hostess', 'Waiter', 'Bartender'], form: 'body' },
];
export const fieldByKey = (k: Field) => fields.find((f) => f.key === k)!;

export const clothingSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
export const shoeSizes = Array.from({ length: 15 }, (_, i) => String(34 + i));
export const hairColors = ['Brunette', 'Brown', 'Blonde', 'Red', 'Colored'];
export const appearanceTypes = ['European', 'Asian', 'African', 'Latin'];
export const genres = ['Hip-hop', 'EDM', 'Retro', 'Rock', 'Blues', 'Jazz', 'Funk', 'R&B', 'Chill', 'Classical', 'House', 'Techno', 'Pop'];
export const positions = ['HR manager', 'Owner', 'Manager', 'Event producer', 'Casting director', 'Recruiter'];

export const popularCountryNames = ['United Arab Emirates', 'Saudi Arabia', 'Qatar', 'Kuwait', 'Bahrain', 'Oman'];
export const allCountries = [
  'Afghanistan',
  'Albania',
  'Algeria',
  'Argentina',
  'Armenia',
  'Australia',
  'Austria',
  'Azerbaijan',
  'Bahrain',
  'Bangladesh',
  'Belarus',
  'Belgium',
  'Brazil',
  'Bulgaria',
  'Canada',
  'Chile',
  'China',
  'Colombia',
  'Croatia',
  'Cyprus',
  'Czechia',
  'Denmark',
  'Egypt',
  'Estonia',
  'Ethiopia',
  'Finland',
  'France',
  'Georgia',
  'Germany',
  'Greece',
  'Hungary',
  'India',
  'Indonesia',
  'Iran',
  'Iraq',
  'Ireland',
  'Israel',
  'Italy',
  'Japan',
  'Jordan',
  'Kazakhstan',
  'Kenya',
  'Kuwait',
  'Kyrgyzstan',
  'Latvia',
  'Lebanon',
  'Lithuania',
  'Malaysia',
  'Mexico',
  'Moldova',
  'Morocco',
  'Nepal',
  'Netherlands',
  'New Zealand',
  'Nigeria',
  'Norway',
  'Oman',
  'Pakistan',
  'Philippines',
  'Poland',
  'Portugal',
  'Qatar',
  'Romania',
  'Russia',
  'Saudi Arabia',
  'Serbia',
  'Singapore',
  'Slovakia',
  'South Africa',
  'South Korea',
  'Spain',
  'Sri Lanka',
  'Sweden',
  'Switzerland',
  'Tajikistan',
  'Thailand',
  'Tunisia',
  'Turkey',
  'Turkmenistan',
  'Uganda',
  'Ukraine',
  'United Arab Emirates',
  'United Kingdom',
  'United States',
  'Uzbekistan',
  'Vietnam',
];
export const countryShort: Record<string, string> = { 'United Arab Emirates': 'UAE', 'United Kingdom': 'UK', 'United States': 'USA' };
export const countryCode: Record<string, string> = {
  'United Arab Emirates': 'AE',
  'Saudi Arabia': 'SA',
  Qatar: 'QA',
  Kuwait: 'KW',
  Bahrain: 'BH',
  Oman: 'OM',
};
export const citiesByCountry: Record<string, string[]> = {
  'United Arab Emirates': ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain', 'Al Ain'],
  'Saudi Arabia': ['Riyadh', 'Jeddah', 'Dammam', 'Mecca', 'Medina', 'Khobar'],
  Qatar: ['Doha', 'Al Wakrah', 'Al Khor'],
  Kuwait: ['Kuwait City', 'Hawalli', 'Salmiya'],
  Bahrain: ['Manama', 'Muharraq', 'Riffa'],
  Oman: ['Muscat', 'Salalah', 'Sohar'],
};
/** City list for any country; unknown countries get their capital-free free-text fallback in the sheet. */
export const citiesFor = (country?: string) => (country ? (citiesByCountry[country] ?? []) : []);

export type Company = { id: string; name: string; initials: string; city: string; tint: 1 | 2 | 3 | 4 | 5 | 'brand' | 'dark'; declines?: boolean };
export const companies: Company[] = [
  { id: '919', name: '919 Team', initials: '919', city: 'Dubai, UAE', tint: 'brand' },
  { id: 'praia', name: 'Praia', initials: 'Pr', city: 'Dubai, UAE', tint: 1 },
  { id: 'berezka', name: 'Berezka', initials: 'Be', city: 'Dubai, UAE', tint: 4 },
  { id: 'leov', name: "LEO'V", initials: 'LV', city: 'Los Angeles, USA', tint: 'dark', declines: true },
  { id: 'lucky', name: 'Lucky Fish', initials: 'LF', city: 'Dubai, UAE', tint: 2 },
  { id: 'five', name: 'FIVE', initials: '5', city: 'Dubai, UAE', tint: 3 },
  { id: 'skyline', name: 'Skyline Hospitality', initials: 'SH', city: 'Dubai, UAE', tint: 'dark' },
  { id: 'dives', name: 'DIVES Holding', initials: 'DH', city: 'Dubai, UAE', tint: 'dark' },
];

export const ageFrom = (dob?: Date) => {
  if (!dob) return undefined;
  const n = new Date();
  let a = n.getFullYear() - dob.getFullYear();
  if (n.getMonth() < dob.getMonth() || (n.getMonth() === dob.getMonth() && n.getDate() < dob.getDate())) a--;
  return a;
};
export const formatDob = (d?: Date) => (d ? `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}` : undefined);

const DETAIL_LABELS: Record<string, [string, string?]> = {
  weight: ['Weight', 'kg'],
  height: ['Height', 'cm'],
  bust: ['Bust', 'cm'],
  waist: ['Waist', 'cm'],
  hips: ['Hips', 'cm'],
  clothing: ['Clothing size'],
  shoe: ['Shoe size', 'EU'],
  hair: ['Hair color'],
  appearance: ['Appearance'],
  genre: ['Genre'],
};

/** Label/value rows of a filled questionnaire (review screen, profile). */
export function occupationRows(e: { field: Field; details: Record<string, string>; tattoos?: boolean; piercing?: boolean; links: string[] }, withLinks = true): [string, string][] {
  const f = fieldByKey(e.field);
  const rows: [string, string][] = Object.entries(DETAIL_LABELS)
    .filter(([k]) => e.details[k])
    .map(([k, [l, u]]) => [l, u ? `${e.details[k]} ${u}` : e.details[k]]);
  if (f.form === 'model' || f.form === 'body') rows.push(['Tattoos', e.tattoos ? 'Yes' : 'No'], ['Piercing', e.piercing ? 'Yes' : 'No']);
  if (withLinks) e.links.forEach((l, i) => rows.push([i ? `Link ${i + 1}` : f.form === 'music' ? 'Promo link' : 'Portfolio', l.replace(/^https?:\/\//, '')]));
  return rows;
}
