import { spheres } from './dictionaries';
import { allVacancies } from './mock';
import type { Vacancy } from './types';

// Public employer pages (SeekCompanyAbout / SeekCompanyVacancies): what a job seeker sees about a company.

export type CompanyProfile = {
  id: string; // slug of the name: "skyline-hospitality"
  name: string;
  initials: string;
  verified: boolean;
  industry: string;
  city: string;
  about: string;
  website?: string;
  instagram?: string;
  linkedin?: string;
  facebook?: string;
};

export const companySlug = (name: string) =>
  name
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

/** Hand-written pages for the companies that appear most in the demo. */
const written: Record<string, Partial<CompanyProfile>> = {
  'skyline-hospitality': {
    industry: 'Hospitality',
    about:
      'Skyline Hospitality runs rooftop lounges, beach clubs and restaurants across Dubai and Abu Dhabi. We hire hosts, waiters, bartenders and event staff for our venues and private events, and we train every new team member on site.',
    website: 'skylinehospitality.ae',
    instagram: '@skyline.dxb',
    linkedin: 'Skyline Hospitality LLC',
    facebook: 'Skyline Hospitality Dubai',
  },
  'orzu-group': {
    industry: 'Events',
    about: 'ORZU Group produces yacht parties, brand launches and private celebrations along the Dubai coast — from a sunset set for 60 guests to a full-night festival on the water.',
    website: 'orzu.group',
    instagram: '@orzu.group',
  },
  'atlantis-the-palm': {
    industry: 'Hospitality',
    about: 'An iconic resort on the Palm Jumeirah with 20+ restaurants, a waterpark and an aquarium. Our events team hires hosts, entertainers and seasonal staff for galas and holidays.',
    website: 'atlantis.com',
    instagram: '@atlantisthepalm',
    linkedin: 'Atlantis The Palm',
    facebook: 'Atlantis The Palm',
  },
  'azure-beach': {
    industry: 'Hospitality',
    about: 'A family-run beach club on JBR. We’re looking for friendly hostesses and waiters for the high season.',
  },
};

const hash = (s: string) => [...s].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 7);
const plural = (role: string) => {
  const r = role.toLowerCase();
  return /s$/.test(r) ? r : /(ss|sh|ch)$/.test(r) ? `${r}es` : `${r}s`;
};

/** Every company with vacancies on 919, by slug. */
const byId: Record<string, { first: Vacancy; list: Vacancy[] }> = {};
for (const v of allVacancies) {
  const id = companySlug(v.company.name);
  (byId[id] ??= { first: v, list: [] }).list.push(v);
}

export function companyProfile(id: string): CompanyProfile | undefined {
  const entry = byId[id];
  if (!entry) return undefined;
  const { first, list } = entry;
  const w = written[id] ?? {};
  const h = hash(id);
  const roles = [...new Set(list.map((v) => v.details.role.split(',')[0].replace(/^(VIP|Resident|Front desk) /, '')))].slice(0, 3).map(plural);
  const industry = w.industry ?? spheres[first.sphere];
  const handle = id.replace(/-/g, '.');
  return {
    id,
    name: first.company.name,
    initials: first.company.initials,
    verified: first.company.verified,
    industry,
    city: first.city,
    about:
      w.about ??
      `${first.company.name} is a ${industry === 'F&B' ? 'food and beverage' : industry.toLowerCase()} company based in ${first.city}. On 919 we hire ${roles.join(', ')} for our venues and events. Work is paid on time, and every new team member gets a short briefing on site.`,
    // Not every company fills in links: some have a website, some only Instagram, some nothing.
    website: 'website' in w ? w.website : h % 10 < 7 ? `${id.replace(/-/g, '')}.com` : undefined,
    instagram: 'instagram' in w ? w.instagram : h % 10 < 8 ? `@${handle}` : undefined,
    linkedin: 'linkedin' in w ? w.linkedin : h % 4 === 0 ? first.company.name : undefined,
    facebook: 'facebook' in w ? w.facebook : h % 5 === 1 ? first.company.name : undefined,
  };
}

/** Active vacancies of a company. */
export const companyVacancies = (id: string) => byId[id]?.list ?? [];
