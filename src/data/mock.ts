import { asset } from './asset';
// Mock content for the prototype. Mirrors the canvas screens; replaced by the API later.
import { frameOf, tierOf } from './tiers';
import type { Talent, Vacancy } from './types';

const img = {
  dj: asset('mock/dj.jpg'),
  dubai1: asset('mock/dubai1.jpg'),
  dubai2: asset('mock/dubai2.jpg'),
  hostess: asset('mock/hostess.jpg'),
  waiter: asset('mock/waiter.jpg'),
  misc: asset('mock/misc.jpg'),
  barber: asset('mock/barber.jpg'),
};
/** Extra covers for the long feed (photos from the team, Oct 2026). */
const vac = {
  band: asset('mock/vac/v01.jpg'),
  dj2: asset('mock/vac/v02.jpg'),
  hostess2: asset('mock/vac/v03.jpg'),
  guitar: asset('mock/vac/v04.jpg'),
  hostess3: asset('mock/vac/v05.jpg'),
  barista: asset('mock/vac/v06.jpg'),
  dj3: asset('mock/vac/v07.jpg'),
  hostess4: asset('mock/vac/v08.jpg'),
  hostess5: asset('mock/vac/v09.jpg'),
  host: asset('mock/vac/v10.jpg'),
  madinat: asset('mock/vac/v11.jpg'),
  promo: asset('mock/vac/v12.jpg'),
  model: asset('mock/vac/v13.jpg'),
  burj: asset('mock/vac/v14.jpg'),
};
const p = (n: number) =>
  ({
    0: asset('mock/people/p0.jpg'),
    1: asset('mock/people/p1.jpg'),
    2: asset('mock/people/p2.jpg'),
    3: asset('mock/people/p3.jpg'),
    4: asset('mock/people/p4.jpg'),
    5: asset('mock/people/p5.jpg'),
    6: asset('mock/people/p6.jpg'),
    7: asset('mock/people/p7.jpg'),
    8: asset('mock/people/p8.jpg'),
    9: asset('mock/people/p9.jpg'),
    10: asset('mock/people/p10.jpg'),
    12: asset('mock/people/p12.jpg'),
    13: asset('mock/people/p13.jpg'),
    14: asset('mock/people/p14.jpg'),
  })[n] ?? asset(`mock/people/p${n}.jpg`);

/** Photos for other mock modules (employer data). */
export const mockImg = { ...img, ...vac };
export const personPhoto = (n: number) => p(n);

const dives = { id: 'dives', name: 'DIVES Holding', initials: 'DH', verified: true };
const desc =
  "Welcome guests at the hotel's beach restaurant, take orders and serve food and drinks during lunch and dinner. Working days are 8 hours, 5 days a week, with uniform and staff meals provided. Previous experience in a five-star venue is a plus.";

const base = (v: Partial<Vacancy> & Pick<Vacancy, 'id' | 'title' | 'company' | 'pay' | 'cover'>): Vacancy => ({
  sphere: 'hospitality',
  city: 'Dubai',
  country: 'United Arab Emirates',
  urgent: false,
  postedAgo: '2 h ago',
  views: 1240,
  photos: [v.cover, img.misc, img.dubai1],
  details: { role: v.title },
  description: desc,
  requirements: ['English — fluent'],
  ...v,
});

export const vacancies: Vacancy[] = [
  base({
    id: 'v1',
    title: 'DJ for a boat party',
    company: { id: 'orzu', name: 'ORZU Group', initials: 'OG', verified: true },
    sphere: 'events',
    urgent: true,
    pay: { amount: 15000, currency: 'AED', contract: 'monthly' },
    cover: img.dj,
  }),
  base({
    id: 'v2',
    title: 'Event coordinator, beach festival',
    company: { id: 'coast', name: 'Coastline Events', initials: 'CE', verified: true },
    sphere: 'events',
    city: 'Abu Dhabi',
    postedAgo: '5 h ago',
    pay: { amount: 20000, currency: 'AED', contract: 'one-time' },
    cover: img.dubai1,
  }),
  base({
    id: 'v3',
    title: 'Hostess, rooftop lounge',
    company: { id: 'skyline', name: 'Skyline Hospitality', initials: 'SH', verified: true },
    urgent: true,
    postedAgo: '1 h ago',
    pay: { amount: 120, currency: 'AED', contract: 'hourly' },
    cover: img.hostess,
  }),
  base({
    id: 'v4',
    title: 'European female waitresses',
    company: dives,
    urgent: true,
    views: 2145,
    pay: { amount: 15000, currency: 'AED', contract: 'monthly' },
    cover: img.waiter,
    photos: [img.waiter, img.misc, img.barber, img.dubai1, img.hostess, img.dubai2],
    details: { role: 'Hostess, beach restaurant', gender: 'Female', age: '21–25' },
    requirements: ['English — native', 'Age 21–25', 'Video presentation'],
  }),
  base({
    id: 'v5',
    title: 'Hostess for a car launch',
    company: { id: 'velocity', name: 'Velocity Events', initials: 'VE', verified: true },
    sphere: 'events',
    urgent: true,
    postedAgo: '3 h ago',
    pay: { amount: 1200, currency: 'AED', contract: 'daily' },
    cover: img.dubai1,
  }),
  base({
    id: 'v6',
    title: 'Restaurant hostess, beach club',
    company: { id: 'azure', name: 'Azure Beach', initials: 'AB', verified: false },
    sphere: 'fnb',
    city: 'Sharjah',
    postedAgo: 'Yesterday',
    pay: { amount: 90, currency: 'AED', contract: 'hourly' },
    cover: img.misc,
  }),
  base({
    id: 'v7',
    title: 'VIP hostess, yacht show',
    company: { id: 'marina', name: 'Marina Yachts', initials: 'MY', verified: true },
    sphere: 'events',
    city: 'Abu Dhabi',
    postedAgo: '2 d ago',
    pay: { amount: 800, currency: 'AED', contract: 'daily' },
    cover: img.dubai2,
  }),
  base({
    id: 'v8',
    title: 'Barista, specialty coffee bar',
    company: { id: 'brew', name: 'Brew Lab', initials: 'BL', verified: true },
    sphere: 'fnb',
    city: 'Riyadh',
    country: 'Saudi Arabia',
    postedAgo: '6 h ago',
    pay: { amount: 6500, currency: 'AED', contract: 'monthly' },
    cover: img.barber,
  }),
  base({
    id: 'v9',
    title: 'Promo models for a fashion week',
    company: { id: 'atelier', name: 'Atelier Gulf', initials: 'AG', verified: true },
    sphere: 'modeling',
    city: 'Doha',
    country: 'Qatar',
    postedAgo: '8 h ago',
    pay: { amount: 2500, currency: 'AED', contract: 'fixed-term' },
    cover: img.dubai2,
  }),
  // Not in the public feed: referenced by the seeker's applications and saved list.
  base({
    id: 'v10',
    title: 'Barber, premium salon',
    company: { id: 'gents', name: 'Gentlemen’s Club', initials: 'GC', verified: true },
    sphere: 'beauty',
    postedAgo: '5 h ago',
    pay: { amount: 8000, currency: 'AED', contract: 'monthly' },
    cover: img.barber,
  }),
  base({
    id: 'v11',
    title: 'Hostess, yacht club',
    company: { id: 'myc', name: 'Marina Yacht Club', initials: 'MY', verified: true },
    postedAgo: 'Yesterday',
    pay: { amount: 600, currency: 'AED', contract: 'daily' },
    cover: img.hostess,
  }),
  base({
    id: 'v12',
    title: 'Resident DJ, beach bar',
    company: { id: 'sunset', name: 'Sunset Beach', initials: 'SB', verified: true },
    sphere: 'music',
    postedAgo: '4 d ago',
    pay: { amount: 12000, currency: 'AED', contract: 'monthly' },
    cover: img.dj,
  }),
  base({
    id: 'v13',
    title: 'Promo model, car launch',
    company: { id: 'prestige', name: 'Prestige Events', initials: 'PE', verified: true },
    sphere: 'modeling',
    postedAgo: '1 d ago',
    pay: { amount: 1200, currency: 'AED', contract: 'daily' },
    cover: img.dubai2,
  }),
  base({
    id: 'v14',
    title: 'Promo model, auto show',
    company: { id: 'prestige', name: 'Prestige Events', initials: 'PE', verified: true },
    sphere: 'modeling',
    postedAgo: '2 d ago',
    pay: { amount: 1500, currency: 'AED', contract: 'daily' },
    cover: img.dubai1,
  }),
  base({
    id: 'v15',
    title: 'Waiter, fine dining',
    company: { id: 'atlantis', name: 'Atlantis The Palm', initials: 'AP', verified: true },
    sphere: 'fnb',
    postedAgo: '3 w ago',
    pay: { amount: 8000, currency: 'AED', contract: 'monthly' },
    cover: img.waiter,
  }),
  base({
    id: 'v16',
    title: 'DJ, New Year party',
    company: { id: 'orzu', name: 'ORZU Group', initials: 'OG', verified: true },
    sphere: 'music',
    postedAgo: '10 mo ago',
    pay: { amount: 3000, currency: 'AED', contract: 'one-time' },
    cover: img.dj,
  }),
  base({
    id: 'v17',
    title: 'Bartender, pop-up bar',
    company: { id: 'brew', name: 'Brew Lab', initials: 'BL', verified: true },
    sphere: 'fnb',
    postedAgo: '1 mo ago',
    pay: { amount: 700, currency: 'AED', contract: 'daily' },
    cover: img.barber,
  }),
];

/** Vacancies shown in feeds; the rest exist only in a seeker's history. */

// ---------- long feed: 41 more vacancies so the list pages (20 at a time) like the real API.
type Seed = [title: string, company: string, sphere: Vacancy['sphere'], contract: Vacancy['pay']['contract'], amount: number, cover: keyof typeof vac, extra?: (keyof typeof vac | keyof typeof img)[]];
const seeds: Seed[] = [
  ['Hostess, Michelin restaurant', 'Ossiano', 'hospitality', 'monthly', 9000, 'hostess2', ['hostess3']],
  ['Live band for a gala dinner', 'Emaar Events', 'music', 'one-time', 18000, 'band', ['guitar']],
  ['Resident DJ, rooftop bar', 'Sky Lounge', 'music', 'monthly', 14000, 'dj2', ['dj3']],
  ['Guitarist for Friday brunch', 'Bla Bla Dubai', 'music', 'daily', 1500, 'guitar'],
  ['Front desk hostess, business hotel', 'Address Downtown', 'hospitality', 'monthly', 8500, 'hostess3', ['hostess5']],
  ['Barista, mornings', 'Kava Coffee', 'fnb', 'hourly', 45, 'barista'],
  ['DJ for a private yacht party', 'Xclusive Yachts', 'music', 'one-time', 4000, 'dj3', ['dj2']],
  ['Restaurant hostess, evenings', 'Zuma Dubai', 'hospitality', 'monthly', 10000, 'hostess4'],
  ['VIP hostess, product launch', 'Luxe Events', 'events', 'daily', 900, 'hostess5', ['promo']],
  ['Host for a corporate conference', 'DWTC', 'events', 'fixed-term', 6000, 'host'],
  ['Event staff, heritage festival', 'Madinat Jumeirah', 'events', 'daily', 600, 'madinat', ['burj']],
  ['Promo hostess, mall activation', 'Promo Pro', 'events', 'hourly', 80, 'promo'],
  ['Fashion model, lookbook shoot', 'Studio Noir', 'modeling', 'one-time', 3500, 'model'],
  ['Hostess, observation deck', 'At The Top', 'hospitality', 'hourly', 70, 'burj', ['hostess2']],
  ['Waiter, beach club', 'Nikki Beach', 'fnb', 'monthly', 6500, 'hostess4'],
  ['Saxophonist for sunset sessions', 'White Beach', 'music', 'daily', 1800, 'guitar', ['band']],
  ['Brand ambassador, car show', 'Prestige Events', 'events', 'daily', 1100, 'promo', ['hostess5']],
  ['Commercial model, beauty campaign', 'Glow Agency', 'modeling', 'fixed-term', 5000, 'model'],
  ['Hostess, art gallery opening', 'Alserkal Avenue', 'events', 'one-time', 700, 'hostess3'],
  ['Bartender, speakeasy', 'Fibber Magees', 'fnb', 'monthly', 7000, 'barista'],
  ['MC for a wedding expo', 'Expo Weddings', 'events', 'one-time', 2500, 'host'],
  ['Cover band for a hotel lobby', 'Atlantis The Royal', 'music', 'weekly', 9000, 'band'],
  ['Guest relations, luxury resort', 'One&Only', 'hospitality', 'monthly', 11000, 'hostess2'],
  ['Hostess, Formula 1 hospitality', 'Yas Marina', 'events', 'daily', 1300, 'hostess5', ['burj']],
  ['Coffee bar attendant, expo stand', 'Gulfood', 'fnb', 'daily', 500, 'barista'],
  ['DJ, ladies night', 'Cavalli Club', 'music', 'weekly', 5000, 'dj2'],
  ['Runway model, fashion week', 'Arab Fashion Council', 'modeling', 'fixed-term', 7000, 'model'],
  ['Concierge hostess, residence', 'Emaar Properties', 'hospitality', 'monthly', 8000, 'hostess4'],
  ['Tour host, Old Dubai', 'Frying Pan Tours', 'events', 'hourly', 90, 'madinat'],
  ['Promoter, energy drink launch', 'Red Bull', 'events', 'daily', 650, 'promo'],
  ['Host, new year countdown', 'Burj Park', 'events', 'one-time', 3000, 'burj', ['host']],
  ['Hostess, padel tournament', 'Padel Pro', 'events', 'daily', 750, 'hostess3'],
  ['Pianist, hotel lounge', 'Jumeirah Al Qasr', 'music', 'monthly', 12000, 'guitar'],
  ['Waitress, Arabic restaurant', 'Al Hadheerah', 'fnb', 'monthly', 6000, 'hostess4'],
  ['Hostess, golf championship', 'Emirates Golf Club', 'events', 'daily', 1000, 'hostess5'],
  ['Barista, specialty pop-up', 'Raw Coffee', 'fnb', 'daily', 450, 'barista'],
  ['Event host, tech summit', 'GITEX', 'events', 'fixed-term', 7500, 'host', ['promo']],
  ['Hostess, cruise terminal', 'Port Rashid', 'hospitality', 'hourly', 65, 'hostess2'],
  ['DJ, beach festival', 'Soundstorm', 'music', 'one-time', 9000, 'dj3', ['band']],
  ['Image model, hotel campaign', 'Five Hotels', 'modeling', 'one-time', 4000, 'model'],
  ['Event crew, desert camp', 'Platinum Heritage', 'events', 'weekly', 2800, 'madinat'],
  ['Waiter, fine dining', 'Skyline Hospitality', 'fnb', 'monthly', 9000, 'hostess4'],
  ['Bartender, beach club', 'Skyline Hospitality', 'fnb', 'monthly', 8500, 'barista'],
];
const cities: [string, string][] = [
  ['Dubai', 'United Arab Emirates'],
  ['Dubai', 'United Arab Emirates'],
  ['Abu Dhabi', 'United Arab Emirates'],
  ['Dubai', 'United Arab Emirates'],
  ['Sharjah', 'United Arab Emirates'],
  ['Riyadh', 'Saudi Arabia'],
  ['Dubai', 'United Arab Emirates'],
  ['Doha', 'Qatar'],
];
const ago = ['20 min ago', '45 min ago', '1 h ago', '2 h ago', '3 h ago', '5 h ago', '8 h ago', 'Yesterday', '2 d ago', '3 d ago', '4 d ago', '1 w ago'];
const pic = (k: keyof typeof vac | keyof typeof img) => (k in vac ? vac[k as keyof typeof vac] : img[k as keyof typeof img]);

const generated: Vacancy[] = seeds.map(([title, company, sphere, contract, amount, cover, extra], i) => {
  const [city, country] = cities[i % cities.length];
  const id = company.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return base({
    id: `v${18 + i}`,
    title,
    company: {
      id,
      name: company,
      initials: company
        .split(/\s+/)
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase(),
      verified: i % 5 !== 3,
    },
    sphere,
    city,
    country,
    urgent: i % 6 === 0,
    postedAgo: ago[Math.min(ago.length - 1, Math.floor(i / 3.5))],
    views: 300 + ((i * 137) % 2400),
    pay: { amount, currency: 'AED', contract },
    cover: vac[cover],
    photos: [vac[cover], ...(extra ?? []).map(pic), img.misc, img.dubai1].slice(0, 4),
    details: { role: title.split(',')[0] },
  });
});

// Gallery demo: the hand-made vacancies show every photo count from 1 to 10 (licensed stock and city shots only).
const GALLERY_POOL = [asset('dubai2'), asset('stock/f-photographer.webp'), asset('dubai1'), asset('stock/f-dj.webp'), asset('stock/f-yellow-lips.webp'), asset('stock/f-guitar-electric.webp'), asset('stock/f-makeup.webp'), asset('stock/f-headphones.webp'), asset('stock/f-pink-skirt.webp'), asset('stock/f-guitar-acoustic.webp')];
const GALLERY_COUNT: Record<string, number> = { v1: 10, v2: 1, v3: 2, v4: 3, v5: 4, v6: 5, v7: 6, v8: 7, v9: 9 };
vacancies.forEach((v) => {
  const n = GALLERY_COUNT[v.id];
  if (n) v.photos = [v.cover, ...GALLERY_POOL.filter((x) => x !== v.cover)].slice(0, n);
});

export const allVacancies: Vacancy[] = [...vacancies, ...generated];
/** Public feed: 9 hand-made + 43 generated = 52 vacancies. */
export const feedVacancies = [...vacancies.slice(0, 9), ...generated];

const withTier = (t: Talent): Talent => ({ ...t, tier: tierOf(t.name), frame: tierOf(t.name) === 'max' ? frameOf(t.name) : undefined, premium: tierOf(t.name) !== 'free' });

export const talents: Talent[] = ([
  { id: 't1', name: 'Angela R.', role: 'Hostess', city: 'Dubai', verified: true, premium: true, sphere: 'hospitality', photo: p(1), placeholder: 1 },
  { id: 't2', name: 'Ibrahim K.', role: 'Bartender', city: 'Dubai', verified: true, premium: false, sphere: 'hospitality', photo: p(10), placeholder: 2 },
  { id: 't3', name: 'Sofia L.', role: 'Model', city: 'Dubai', verified: true, premium: true, sphere: 'modeling', photo: p(8), placeholder: 3 },
  { id: 't4', name: 'Nour A.', role: 'Bartender', city: 'Abu Dhabi', verified: true, premium: false, sphere: 'hospitality', photo: p(9), placeholder: 4 },
  { id: 't5', name: 'Layla H.', role: 'Hostess', city: 'Dubai', verified: false, premium: true, sphere: 'hospitality', photo: asset('stock/f-pink-skirt.webp'), placeholder: 1 },
  { id: 't6', name: 'Lucas M.', role: 'DJ', city: 'Dubai', verified: true, premium: false, sphere: 'music', photo: p(14), placeholder: 5 },
  { id: 't7', name: 'Mira K.', role: 'Hostess', city: 'Dubai', verified: true, premium: false, sphere: 'hospitality', photo: p(2), placeholder: 2 },
  { id: 't8', name: 'Wakako T.', role: 'Promo, hostess', city: 'Dubai', verified: true, premium: true, sphere: 'events', photo: p(3), placeholder: 3 },
] as Talent[]).map(withTier);

export const findVacancy = (id: string) => allVacancies.find((v) => v.id === id);
