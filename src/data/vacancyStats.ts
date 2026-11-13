// Employer analytics: vacancy views, who viewed and when, where views come from; and the candidate widgets
// (profile completeness, match with the employer's open vacancies). Mock data is deterministic per id.
import type { MyVacancy } from './employer';
import type { VacancyDetail } from './hiring';
import { candidates, type Candidate, type TalentSphere } from './talentPool';
import { profileOf } from './candidateProfile';

const hash = (s: string) => [...s].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 7);
const rnd = (seed: number) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/** Views, unique viewers and applications for the last `days` days, oldest first. */
export function viewsSeries(v: MyVacancy, days: number) {
  const total = v.detail?.views ?? v.views ?? 0;
  if (!total || v.status === 'review' || v.status === 'changes' || v.status === 'rejected') return Array.from({ length: days }, () => 0);
  const h = hash(v.id);
  const live = v.status === 'active';
  // Active vacancies peak at the start and on the Urgent boost; archived ones taper to zero.
  const raw = Array.from({ length: 14 }, (_, i) => {
    const age = 13 - i;
    const base = live ? 0.6 + rnd(h + i) * 0.8 : Math.max(0, 1.2 - age * 0.18) * (rnd(h + i) * 0.6 + 0.4) * (age > 7 ? 1 : 0);
    const boost = live && v.urgentLeft && age < 2 ? 2.4 : 1;
    return base * boost;
  });
  const sum = raw.reduce((a, b) => a + b, 0) || 1;
  const series = raw.map((x) => Math.round((x / sum) * total * 0.55));
  return series.slice(14 - days);
}

export type VacancyStats = { views: number; viewers: number; saves: number; applications: number; conversion: number };
export function statsOf(v: MyVacancy, days: number, applications: number): VacancyStats {
  const views = viewsSeries(v, days).reduce((a, b) => a + b, 0);
  const viewers = Math.round(views * 0.71);
  const apps = Math.min(applications, viewers);
  return { views, viewers, saves: Math.round(viewers * 0.06), applications: apps, conversion: viewers ? apps / viewers : 0 };
}

export const SOURCES: [string, number][] = [
  ['Vacancy feed', 44],
  ['Search', 26],
  ['Urgent at the top', 16],
  ['Shared link', 9],
  ['Company page', 5],
];

const SPHERES: Record<string, TalentSphere[]> = {
  Hospitality: ['hospitality', 'fnb'],
  'F&B': ['fnb', 'hospitality'],
  Events: ['events', 'music'],
  'Model Business': ['modeling'],
  Modeling: ['modeling'],
  Music: ['music'],
  Beauty: ['beauty'],
};

export type Viewer = { c: Candidate; vacancyId: string; minutesAgo: number; times: number; applied: boolean };
const MIN_AGO = [4, 12, 26, 48, 75, 110, 160, 230, 320, 470, 640, 900, 1300, 1800, 2600, 3900];

/** People who opened the employer's vacancies, newest first. Only job seekers signed in to 919 are shown by name. */
export function viewersOf(vacancies: MyVacancy[], appliedIds: Record<string, string[]>): Viewer[] {
  const out: Viewer[] = [];
  vacancies
    .filter((v) => v.detail && (v.status === 'active' || v.status === 'archive'))
    .forEach((v) => {
      const spheres = SPHERES[v.detail!.category] ?? [];
      const pool = candidates.filter((c) => spheres.includes(c.sphere) || rnd(hash(c.id + v.id)) > 0.82);
      const h = hash(v.id);
      const n = v.status === 'active' ? 9 : 3;
      pool.slice(0, 40).forEach((c, i) => {
        if (out.filter((o) => o.vacancyId === v.id).length >= n) return;
        if (rnd(h + i * 3) < 0.35) return;
        const k = (i + (h % 5)) % MIN_AGO.length;
        out.push({
          c,
          vacancyId: v.id,
          minutesAgo: (v.status === 'active' ? MIN_AGO[k] : MIN_AGO[k] + 14 * 1440) + (h % 9),
          times: 1 + Math.floor(rnd(h + i) * 3),
          applied: (appliedIds[v.id] ?? []).includes(c.id) || rnd(h + i * 7) > 0.78,
        });
      });
    });
  return out.sort((a, b) => a.minutesAgo - b.minutesAgo);
}

export function ago(min: number) {
  if (min < 60) return `${min} min ago`;
  if (min < 1440) return `${Math.floor(min / 60)} h ago`;
  const d = Math.floor(min / 1440);
  return d === 1 ? 'yesterday' : `${d} days ago`;
}

// ---------- candidate widgets ----------

export type Completeness = { pct: number; done: string[]; missing: string[] };
/** What a complete profile has: the same items the job seeker sees in their own progress widget. */
export function completenessOf(c: Candidate): Completeness {
  const p = profileOf(c);
  const items: [string, boolean][] = [
    ['Photo', true],
    ['More photos', c.photos],
    ['Video presentation', !!c.video],
    ['About', !!p.about],
    ['Experience', p.experience.length > 0],
    ['Languages', p.languages.length > 0],
    ['Education', !!p.education],
    ['Portfolio and socials', c.links],
    ['Field details', p.field.rows.length > 0],
  ];
  const done = items.filter(([, ok]) => ok).map(([k]) => k);
  return { pct: Math.round((done.length / items.length) * 100), done, missing: items.filter(([, ok]) => !ok).map(([k]) => k) };
}

export type MatchCheck = { label: string; ok: boolean };
export type Match = { v: MyVacancy; score: number; checks: MatchCheck[] };

function ageRange(s: string): [number, number] | null {
  const m = s.match(/(\d+)\s*[–-]\s*(\d+)/);
  return m ? [Number(m[1]), Number(m[2])] : null;
}

/** How well a candidate fits one vacancy, 0–100. A different field is no match at all (null). */
export function matchOne(c: Candidate, v: MyVacancy): Match | null {
  const d: VacancyDetail | undefined = v.detail;
  if (!d) return null;
  const spheres = SPHERES[d.category] ?? [];
  if (!spheres.includes(c.sphere)) return null;
  const checks: MatchCheck[] = [];
  let score = 30;
  const roleWords = d.role.toLowerCase().split(/[\s,/]+/).filter((w) => w.length > 2);
  const roleOk = roleWords.some((w) => c.role.toLowerCase().includes(w));
  checks.push({ label: roleOk ? `Works as ${c.role.split(',')[0].toLowerCase()}` : `Different role: ${c.role.split(',')[0].toLowerCase()}`, ok: roleOk });
  score += roleOk ? 30 : -20;
  const cityOk = c.city === d.city;
  checks.push({ label: cityOk ? `Lives in ${c.city}` : `Lives in ${c.city}, not ${d.city}`, ok: cityOk });
  if (cityOk) score += 10;
  if (d.gender !== 'Any') {
    const ok = d.gender.toLowerCase() === c.gender;
    checks.push({ label: ok ? `${d.gender}, as asked` : `You asked for ${d.gender.toLowerCase()}`, ok });
    score += ok ? 10 : -25;
  } else score += 10;
  const r = ageRange(d.age);
  if (r) {
    const ok = c.age >= r[0] && c.age <= r[1];
    checks.push({ label: ok ? `Age ${c.age}, in your ${d.age} range` : `Age ${c.age}, outside ${d.age}`, ok });
    score += ok ? 10 : -15;
  } else score += 10;
  if (d.requirements.some((x) => x.startsWith('English'))) {
    const ok = c.languages.includes('English');
    checks.push({ label: ok ? 'Speaks English' : 'No English in the profile', ok });
    score += ok ? 5 : -10;
  } else score += 5;
  if (d.requirements.includes('Video presentation')) {
    const ok = !!c.video;
    checks.push({ label: ok ? 'Has a video presentation' : 'No video presentation', ok });
    score += ok ? 5 : -5;
  } else score += 5;
  if (c.today) checks.push({ label: `Available today · ${c.today}`, ok: true });
  return { v, score: Math.max(0, Math.min(100, score)), checks };
}

/** Open vacancies the candidate fits, best first. Weak fits (under 50%) are left out; an empty list hides the widget. */
export function matchesFor(c: Candidate, vacancies: MyVacancy[]): Match[] {
  return vacancies
    .filter((v) => v.status === 'active' || v.status === 'review')
    .map((v) => matchOne(c, v))
    .filter((m): m is Match => !!m && m.score >= 50)
    .sort((a, b) => b.score - a.score);
}
