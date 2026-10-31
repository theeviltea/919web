import type { Img } from './asset';

import { talentSphereLabels, type Candidate, type TalentSphere } from './talentPool';

// Full candidate profile as the employer sees it (EmpSeekerProfile). Built deterministically from the pool entry.

export type CandidateProfile = {
  c: Candidate;
  fullName: string;
  about: string;
  languages: { code: string; name: string; level: string }[];
  experience: { role: string; place: string; period: string }[];
  total: string;
  education?: { title: string; school: string; years: string };
  field: { title: string; roles: string[]; rows: [string, string][] };
  links: { kind: 'web' | 'ig' | 'sc' | 'fb'; label: string; value: string }[];
  gallery: Img[];
};

/** Full names shown in People (design) for the people it features; everyone else gets a generated surname. */
export const FULL_NAMES: Record<string, string> = {
  'Layla H.': 'Layla Haddad',
  'Nadia R.': 'Nadia Rahimi',
  'Sara M.': 'Sara Mendes',
  'Olivia G.': 'Olivia Grant',
  'Karim A.': 'Karim Aziz',
  'Zara K.': 'Zara King',
  'Leo P.': 'Leo Park',
};

const surnames = ['Dakaskos', 'Haddad', 'Novak', 'Rahman', 'Moreau', 'Ivanova', 'Khalil', 'Santos', 'Petrov', 'Nasser', 'Cole', 'Farouk', 'Lindqvist', 'Okafor', 'Mansour'];
const codes: Record<string, string> = { English: 'EN', Arabic: 'AR', Russian: 'RU', French: 'FR', Spanish: 'ES' };

const places: Record<TalentSphere, [string, string][]> = {
  hospitality: [
    ['Atlantis The Palm', 'Dubai'],
    ['Beach club, JBR', 'Dubai'],
    ['Skyline rooftop lounge', 'Dubai'],
  ],
  fnb: [
    ['Specialty coffee bar, DIFC', 'Dubai'],
    ['Fine dining, Downtown', 'Dubai'],
    ['Hotel restaurant, Saadiyat', 'Abu Dhabi'],
  ],
  events: [
    ['Expo City events', 'Dubai'],
    ['Yacht show crew', 'Dubai'],
    ['Private events agency', 'Abu Dhabi'],
  ],
  modeling: [
    ['Fashion week, d3', 'Dubai'],
    ['Commercial campaigns', 'Dubai'],
    ['Showroom fittings', 'Abu Dhabi'],
  ],
  music: [
    ['Rooftop residency', 'Dubai'],
    ['Wedding and events', 'Dubai'],
    ['Hotel lobby sessions', 'Abu Dhabi'],
  ],
  beauty: [
    ['Barbershop, Business Bay', 'Dubai'],
    ['Salon, Marina', 'Dubai'],
    ['Backstage, fashion shows', 'Dubai'],
  ],
  service: [
    ['Event photo agency', 'Dubai'],
    ['Freelance, brands and venues', 'Dubai'],
    ['Wedding studio', 'Abu Dhabi'],
  ],
};

const abouts: Record<TalentSphere, string> = {
  hospitality: 'Years in hospitality, from beach clubs in JBR to fine dining at DIFC. Calm under pressure, great with VIP guests and big tables. Available for evening work and private events.',
  fnb: 'Coffee and service are my craft: latte art, manual brewing and friendly, fast service at the bar. I keep the station clean and know the menu by heart.',
  events: 'I make events feel easy for guests — welcoming, guiding, keeping the energy up. Comfortable on stage and in crowds, fluent with brand scripts.',
  modeling: 'Commercial and runway model with editorial experience. Professional on set, quick with direction, available for campaigns, fittings and promo events.',
  music: 'Live sets for lounges, weddings and corporate events. I read the room and build the night, from sunset chill to peak-hour energy. Own equipment.',
  beauty: 'Clean fades, beard work and styling for shoots and events. I work fast backstage and keep every client looking sharp.',
  service: 'Photo and video for events, venues and brands. Quick turnaround, natural light and a calm presence on set.',
};

const fieldTitle: Record<TalentSphere, string> = {
  hospitality: 'Hospitality',
  fnb: 'F&B',
  events: 'Events',
  modeling: 'Model business',
  music: 'Music',
  beauty: 'Beauty',
  service: 'Service',
};

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const yrs = (m: number) => {
  const y = Math.floor(m / 12);
  const r = m % 12;
  return [y ? `${y} yr${y > 1 ? 's' : ''}` : '', r ? `${r} mo${r > 1 ? 's' : ''}` : ''].filter(Boolean).join(' ');
};

export function profileOf(c: Candidate): CandidateProfile {
  const n = Number(c.id.slice(1));
  const first = c.name.split(' ')[0];
  const fullName = FULL_NAMES[c.name] ?? `${first} ${surnames[n % surnames.length]}`;
  const [p1, p2] = [places[c.sphere][n % 3], places[c.sphere][(n + 1) % 3]];
  const m1 = 12 + (n % 24);
  const m2 = 8 + ((n * 5) % 18);
  const start1 = 2026 * 12 + 9 - m1;
  const end2 = start1 - 1;
  const start2 = end2 - m2;
  const fmt = (t: number) => `${months[t % 12]} ${Math.floor(t / 12)}`;
  const experience = [
    { role: c.role, place: `${p1[0]} · ${p1[1]}`, period: `${fmt(start1)} — now · ${yrs(m1)}` },
    ...(c.age > 22 ? [{ role: c.role.split(',')[0], place: `${p2[0]} · ${p2[1]}`, period: `${fmt(start2)} — ${fmt(end2)} · ${yrs(m2)}` }] : []),
  ];
  const total = yrs(m1 + (c.age > 22 ? m2 : 0));
  const languages = c.languages.map((l, i) => ({ code: codes[l] ?? l.slice(0, 2).toUpperCase(), name: l, level: i === 0 ? (n % 2 ? 'Native' : 'Fluent') : i === 1 ? 'Fluent' : 'Basic' }));

  const body: [string, string][] =
    c.gender === 'female'
      ? [
          ['Appearance', ['European', 'Asian', 'Latin', 'African', 'Middle Eastern'][n % 5]],
          ['Height', `${160 + (n % 16)} cm`],
          ['Weight', `${46 + (n % 12)} kg`],
          ['Shoe size', `${36 + (n % 4)} EU`],
        ]
      : [
          ['Appearance', ['European', 'Middle Eastern', 'Latin', 'African', 'Asian'][n % 5]],
          ['Height', `${174 + (n % 14)} cm`],
          ['Weight', `${68 + (n % 14)} kg`],
          ['Shoe size', `${41 + (n % 5)} EU`],
        ];
  const rows: [string, string][] =
    c.sphere === 'music'
      ? [
          ['Genre', ['House', 'Jazz', 'Pop', 'R&B', 'Funk'][n % 5]],
          ['Own equipment', 'Yes'],
        ]
      : c.sphere === 'service' || c.sphere === 'beauty'
        ? [['Experience', total]]
        : body;
  const extraRole: Partial<Record<TalentSphere, string>> = { modeling: 'Image model', hospitality: 'Waiter/ess', events: 'Promo', music: 'Musician', fnb: 'Waiter/ess' };
  const roles = [c.role.split(',')[0], ...(extraRole[c.sphere] && extraRole[c.sphere] !== c.role ? [extraRole[c.sphere]!] : [])];

  const handle = `@${first.toLowerCase()}.${surnames[n % surnames.length].toLowerCase()}`;
  const links: CandidateProfile['links'] = c.links
    ? [
        ...(c.sphere === 'modeling' || c.sphere === 'service' ? [{ kind: 'web' as const, label: 'Portfolio', value: `${first.toLowerCase()}${surnames[n % surnames.length].toLowerCase()}.com` }] : []),
        ...(c.sphere === 'music' ? [{ kind: 'sc' as const, label: 'SoundCloud', value: `@${first.toLowerCase()}.music` }] : []),
        { kind: 'ig' as const, label: 'Instagram', value: handle },
        { kind: 'fb' as const, label: 'Facebook', value: fullName },
      ]
    : [{ kind: 'ig' as const, label: 'Instagram', value: handle }];

  return {
    c,
    fullName,
    about: abouts[c.sphere],
    languages,
    experience,
    total,
    education:
      n % 3 === 0
        ? {
            title: c.sphere === 'hospitality' || c.sphere === 'fnb' ? 'Diploma, Hospitality management' : 'Bachelor, Media and design',
            school: n % 2 ? 'Dubai Hospitality College' : 'Middlesex University Dubai',
            years: `${2014 + (n % 6)} — ${2017 + (n % 6)}`,
          }
        : undefined,
    field: { title: fieldTitle[c.sphere], roles, rows },
    links,
    // One real photo per mock person: the grid shows it with three crops so the gallery reads as a set.
    gallery: [c.photo, c.photo, c.photo],
  };
}

export const sphereChip = (c: Candidate) => `${talentSphereLabels[c.sphere]} · ${c.role.split(',')[0]}`;
