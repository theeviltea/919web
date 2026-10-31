import { asset, personFor } from './asset';
import type { Img } from './asset';


import { frameOf, tierOf, tierRank, type FrameStyle, type Tier } from './tiers';


// Candidate pool for employer search and filters (TalentSearch / TalentFilters). Deterministic mock, replaced by the API.

export type TalentSphere = 'hospitality' | 'fnb' | 'events' | 'modeling' | 'music' | 'beauty' | 'service';
export const talentSphereLabels: Record<TalentSphere, string> = {
  hospitality: 'Hospitality',
  fnb: 'F&B',
  events: 'Events',
  modeling: 'Modeling',
  music: 'Music',
  beauty: 'Beauty',
  service: 'Service',
};
export const talentSphereOrder: TalentSphere[] = ['hospitality', 'fnb', 'events', 'modeling', 'music', 'beauty', 'service'];

export type Gender = 'female' | 'male';
export type ProfileHas = 'video' | 'photos' | 'links';

export type Candidate = {
  id: string;
  name: string; // "Ibrahim K."
  role: string;
  city: string;
  country: string;
  sphere: TalentSphere;
  gender: Gender;
  age: number;
  languages: string[];
  premium: boolean;
  verified: boolean;
  /** Seeker plan: badge on cards, Max also gets a frame and goes first. */
  tier: Tier;
  frame?: FrameStyle;
  photo: Img;
  placeholder: 1 | 2 | 3 | 4 | 5;
  tint: string;
  video?: { duration: string; views: string };
  photos: boolean;
  links: boolean;
  /** Available today (§14): when they can work, e.g. "Evening". Shown in the Today tab and on the profile. */
  today?: string;
};

// Photos: the original people set (p0–p14), the team's second set (people2/q01–q33, Oct 2026) and people from vacancy covers.
// Licensed stock photos (Oct 2026): the People section and the profiles it opens.
export const stock = {
  dj: asset('stock/f-dj.webp'),
  guitarAcoustic: asset('stock/f-guitar-acoustic.webp'),
  guitarElectric: asset('stock/f-guitar-electric.webp'),
  guitarHat: asset('stock/f-guitar-hat.webp'),
  headphones: asset('stock/f-headphones.webp'),
  makeup: asset('stock/f-makeup.webp'),
  photographer: asset('stock/f-photographer.webp'),
  pinkSkirt: asset('stock/f-pink-skirt.webp'),
  videographer: asset('stock/f-videographer.webp'),
  yellowLips: asset('stock/f-yellow-lips.webp'),
  yellowSuit: asset('stock/f-yellow-suit.webp'),
};
// Web: non-stock keys get a licensed photo of the same gender (accelerator licensing rule).
const photoOf = (k: string, id = k, gender: Gender = 'female'): Img => (k.startsWith('s:') ? stock[k.slice(2) as keyof typeof stock] : personFor(id, gender));

const tints = ['#2A2235', '#1B2A44', '#2C2140', '#13302A', '#3A2418', '#1A1F2B'];

// [name, role, sphere, gender, city, photo]
const seed: [string, string, TalentSphere, Gender, string, string][] = [
  ['Ibrahim K.', 'Bartender', 'hospitality', 'male', 'Dubai', 'q06'],
  ['Angela R.', 'Hostess', 'hospitality', 'female', 'Dubai', 'p1'],
  ['Elena S.', 'Model', 'modeling', 'female', 'Dubai', 'q13'],
  ['Zoey M.', 'Singer', 'music', 'female', 'Dubai', 'q23'],
  ['Akmed V.', 'Bartender', 'hospitality', 'male', 'Dubai', 'q09'],
  ['Anna B.', 'Barista', 'fnb', 'female', 'Dubai', 'q26'],
  ['Victoria P.', 'Dancer', 'events', 'female', 'Dubai', 'q11'],
  ['Yusuf T.', 'Barber', 'beauty', 'male', 'Dubai', 'q04'],
  ['Max P.', 'Photographer', 'service', 'male', 'Dubai', 'q07'],
  ['Mira K.', 'Hostess', 'hospitality', 'female', 'Dubai', 'p2'],
  ['Adam T.', 'Model', 'modeling', 'male', 'Dubai', 'q16'],
  ['Boris A.', 'Bass player', 'music', 'male', 'Dubai', 'q05'],
  ['Lucas M.', 'Head bartender', 'hospitality', 'male', 'Dubai', 'q14'],
  ['Karim B.', 'Barista', 'fnb', 'male', 'Dubai', 'q15'],
  ['Sofia L.', 'Hostess, events', 'events', 'female', 'Dubai', 'p4'],
  ['Kira L.', 'Promo model', 'modeling', 'female', 'Dubai', 'q28'],
  ['Igor S.', 'Barber', 'beauty', 'male', 'Dubai', 'q22'],
  ['Zaurbek T.', 'Videographer', 'service', 'male', 'Dubai', 'q02'],
  ['Rita S.', 'Bartender, mixology', 'hospitality', 'female', 'Dubai', 'p8'],
  ['Ryan C.', 'DJ', 'music', 'male', 'Dubai', 'v02'],
  ['Layla H.', 'Hostess', 'hospitality', 'female', 'Dubai', 's:pinkSkirt'],
  ['Nadia R.', 'Hostess', 'hospitality', 'female', 'Abu Dhabi', 's:yellowSuit'],
  ['Omar H.', 'Illusionist', 'events', 'male', 'Abu Dhabi', 'q01'],
  ['Sami J.', 'Sommelier', 'fnb', 'male', 'Dubai', 'p9'],
  ['Sveta V.', 'Hostess', 'hospitality', 'female', 'Dubai', 'p5'],
  ['Leo V.', 'Model', 'modeling', 'male', 'Dubai', 'q17'],
  ['Amara J.', 'DJ', 'music', 'female', 'Dubai', 'v07'],
  ['Hassan Q.', 'Hair stylist', 'beauty', 'male', 'Dubai', 'q31'],
  ['Ruslan K.', 'Photographer', 'service', 'male', 'Abu Dhabi', 'q08'],
  ['Mia D.', 'Hostess', 'hospitality', 'female', 'Dubai', 'p12'],
  ['Dina R.', 'Barista', 'fnb', 'female', 'Dubai', 'v06'],
  ['Wakako T.', 'Promo, hostess', 'events', 'female', 'Dubai', 'p7'],
  ['Chen W.', 'Image model', 'modeling', 'female', 'Dubai', 'q20'],
  ['Selin Y.', 'Guitarist', 'music', 'female', 'Dubai', 'q03'],
  ['Omar R.', 'Waiter', 'hospitality', 'male', 'Dubai', 'q32'],
  ['Daniel R.', 'Model', 'modeling', 'male', 'Dubai', 'q18'],
  ['Kofi A.', 'DJ', 'music', 'male', 'Abu Dhabi', 'dj'],
  ['Daria P.', 'Hostess', 'hospitality', 'female', 'Dubai', 'p6'],
  ['Farah N.', 'Waitress', 'fnb', 'female', 'Dubai', 'hostess'],
  ['Kate O.', 'Animator', 'events', 'female', 'Dubai', 'q29'],
  ['Dmitri V.', 'Photographer', 'service', 'male', 'Dubai', 'q12'],
  ['Tara N.', 'Model', 'modeling', 'female', 'Abu Dhabi', 'q21'],
  ['Marco D.', 'Bartender', 'hospitality', 'male', 'Dubai', 'misc'],
  ['Ali M.', 'Guitarist', 'music', 'male', 'Abu Dhabi', 'q25'],
  ['Alina G.', 'Champagne girl', 'hospitality', 'female', 'Dubai', 'p3'],
  ['Tom B.', 'Waiter', 'fnb', 'male', 'Dubai', 'p10'],
  ['Noor K.', 'Event host', 'events', 'female', 'Dubai', 'q33'],
  ['Rafael M.', 'Model', 'modeling', 'male', 'Dubai', 'q19'],
  ['Olga M.', 'Hostess', 'hospitality', 'female', 'Dubai', 'v03'],
  ['Jamal O.', 'Chef de rang', 'fnb', 'male', 'Dubai', 'barber'],
  ['Eva L.', 'Model', 'modeling', 'female', 'Dubai', 'q30'],
  ['Rahul S.', 'Guitarist', 'music', 'male', 'Dubai', 'v04'],
  ['Maya C.', 'Hostess', 'hospitality', 'female', 'Dubai', 'v08'],
  ['Nina T.', 'Promo hostess', 'events', 'female', 'Dubai', 'v12'],
  ['Aisha K.', 'Model', 'modeling', 'female', 'Dubai', 'v13'],
  ['Laura G.', 'Hostess', 'hospitality', 'female', 'Dubai', 'v09'],
  ['Reem A.', 'Hostess', 'hospitality', 'female', 'Sharjah', 'q27'],
  ['Adil N.', 'Host', 'hospitality', 'male', 'Dubai', 'v10'],
  ['Julia F.', 'Front desk hostess', 'hospitality', 'female', 'Dubai', 'v05'],
  ['Amira Z.', 'Hostess', 'hospitality', 'female', 'Dubai', 'p14'],
  ['Hana S.', 'Waitress', 'fnb', 'female', 'Abu Dhabi', 'p0'],
  // People section (SeekPeople): stock photos.
  ['Sara M.', 'Waitress', 'hospitality', 'female', 'Dubai', 's:makeup'],
  ['Olivia G.', 'Concierge', 'hospitality', 'female', 'Dubai', 's:photographer'],
  ['Karim A.', 'DJ', 'music', 'male', 'Dubai', 's:headphones'],
  ['Lina M.', 'DJ', 'music', 'female', 'Dubai', 's:dj'],
  ['Omar S.', 'Guitarist', 'music', 'male', 'Dubai', 's:guitarElectric'],
  ['Zara K.', 'Model', 'modeling', 'female', 'Dubai', 's:yellowLips'],
  ['Leo P.', 'Videographer', 'service', 'male', 'Abu Dhabi', 's:videographer'],
  ['Ali R.', 'Singer', 'music', 'male', 'Dubai', 's:guitarHat'],
  ['Yusuf N.', 'Musician', 'music', 'male', 'Dubai', 's:guitarAcoustic'],
];

const langSets = [['English'], ['English', 'Arabic'], ['English', 'Russian'], ['English', 'French'], ['English', 'Arabic', 'French'], ['Arabic'], ['English', 'Spanish']];
const durations = ['0:48', '0:36', '1:02', '0:29', '0:42', '0:51', '0:35', '0:28', '1:04', '0:38'];

// Who is available today in the demo (licensed stock photos only).
const todayByName: Record<string, string> = {
  'Layla H.': 'Evening',
  'Zara K.': 'Any time',
  'Karim A.': 'Night',
  'Nadia R.': 'Evening',
  'Sara M.': 'Afternoon',
  'Omar S.': 'Evening',
  'Lina M.': 'Night',
  'Olivia G.': 'Morning',
};

export const candidates: Candidate[] = seed.map(([name, role, sphere, gender, city, photo], i) => ({
  id: `c${i + 1}`,
  name,
  role,
  city,
  country: 'United Arab Emirates',
  sphere,
  gender,
  age: 20 + ((i * 7) % 15),
  languages: langSets[i % langSets.length],
  premium: tierOf(name) !== 'free',
  verified: i % 5 !== 3,
  tier: tierOf(name),
  frame: tierOf(name) === 'max' ? frameOf(name) : undefined,
  photo: photoOf(photo, name, gender),
  placeholder: ((i % 5) + 1) as 1 | 2 | 3 | 4 | 5,
  tint: tints[i % tints.length],
  video: i % 3 !== 2 ? { duration: durations[i % durations.length], views: `${(((i * 37) % 120) / 10 + 1).toFixed(1)}k` } : undefined,
  photos: true,
  links: i % 4 !== 1,
  today: todayByName[name],
}));
/** Today tab: everyone available today, Max and Premium first. */
export const availableToday = () => candidates.filter((c) => c.today).sort((a, b) => tierRank(b.tier) - tierRank(a.tier));
export const findCandidate = (id: string) => candidates.find((c) => c.id === id);

export type TalentFilters = {
  spheres: TalentSphere[];
  country?: string;
  city?: string;
  gender: 'any' | Gender;
  ageFrom?: string;
  ageTo?: string;
  languages: string[];
  has: ProfileHas[];
};
export const emptyTalentFilters: TalentFilters = { spheres: [], gender: 'any', languages: [], has: [] };

export const hasLabels: Record<ProfileHas, string> = { video: 'Video presentation', photos: 'Photos', links: 'Portfolio links' };

export function applyTalentFilters(list: Candidate[], f: TalentFilters) {
  const from = f.ageFrom ? Number(f.ageFrom) : 0;
  const to = f.ageTo ? Number(f.ageTo) : 200;
  return list.filter(
    (c) =>
      (!f.spheres.length || f.spheres.includes(c.sphere)) &&
      (!f.country || c.country === f.country) &&
      (!f.city || c.city === f.city) &&
      (f.gender === 'any' || c.gender === f.gender) &&
      c.age >= from &&
      c.age <= to &&
      f.languages.every((l) => c.languages.includes(l)) &&
      (!f.has.includes('video') || !!c.video) &&
      (!f.has.includes('photos') || c.photos) &&
      (!f.has.includes('links') || c.links),
  );
}

/** Active filters as removable chips (TalentFilterResults): city replaces country when both are set. */
export function talentChips(f: TalentFilters): { key: string; label: string; remove: (f: TalentFilters) => TalentFilters }[] {
  const out: { key: string; label: string; remove: (f: TalentFilters) => TalentFilters }[] = [];
  f.spheres.forEach((s) => out.push({ key: `s-${s}`, label: talentSphereLabels[s], remove: (x) => ({ ...x, spheres: x.spheres.filter((y) => y !== s) }) }));
  if (f.city) out.push({ key: 'city', label: f.city, remove: (x) => ({ ...x, city: undefined }) });
  else if (f.country) out.push({ key: 'country', label: f.country, remove: (x) => ({ ...x, country: undefined }) });
  if (f.gender !== 'any') out.push({ key: 'g', label: f.gender === 'female' ? 'Female' : 'Male', remove: (x) => ({ ...x, gender: 'any' }) });
  if (f.ageFrom || f.ageTo)
    out.push({
      key: 'age',
      label: f.ageFrom && f.ageTo ? `${f.ageFrom}–${f.ageTo}` : f.ageFrom ? `${f.ageFrom}+` : `Up to ${f.ageTo}`,
      remove: (x) => ({ ...x, ageFrom: undefined, ageTo: undefined }),
    });
  f.languages.forEach((l) => out.push({ key: `l-${l}`, label: l, remove: (x) => ({ ...x, languages: x.languages.filter((y) => y !== l) }) }));
  f.has.forEach((h) => out.push({ key: `h-${h}`, label: h === 'video' ? 'Video' : hasLabels[h], remove: (x) => ({ ...x, has: x.has.filter((y) => y !== h) }) }));
  return out;
}
export const countTalentFilters = (f: TalentFilters) => talentChips(f).length;

/** Word-stem match on name and role: "bartenders" finds "Bartender", "host" finds "Hostess". */
export function matchesCandidate(c: Candidate, q: string) {
  const words = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return true;
  const hay = `${c.name} ${c.role} ${talentSphereLabels[c.sphere]}`.toLowerCase();
  return words.every((w) => hay.includes(w.length > 4 ? w.slice(0, -1) : w));
}
