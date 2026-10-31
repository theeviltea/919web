import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { asset } from './asset';
import type { Img } from './asset';

import { AVAIL_MS, AVAIL_REMIND_MS, availOff, type Avail, type AvailStats, type Slot } from './availability';
import { formatPhone } from './dictionaries';
import { ageFrom, type Field } from './registration';
import { useSession } from './session';
import { useSignup, type FieldEntry, type Photo, type SeekerDraft } from './signup';
import type { FrameStyle, Tier } from './tiers';
import type { Sphere, Vacancy } from './types';

// ---------- profile

export type LangLevel = 'Native' | 'Fluent' | 'Intermediate' | 'Basic';
export type Language = { code: string; name: string; level: LangLevel };
/** Month precision; `d` only when the person picked an exact day. Months are 0-based. */
export type YM = { y: number; m: number; d?: number };
export type Job = { id: string; role: string; company: string; city: string; category: string; start: YM; end?: YM; current: boolean; description: string };
export type Study = { id: string; institution: string; degree: string; field: string; start: number; end?: number; current: boolean };
export type LinkKind = 'web' | 'soundcloud' | 'instagram' | 'facebook' | 'tiktok' | 'youtube' | 'spotify' | 'linkedin';
export type ProfileLink = { id: string; kind: LinkKind; value: string };

export const linkKinds: Record<LinkKind, { label: string; code: string; placeholder: string }> = {
  web: { label: 'Portfolio', code: 'WEB', placeholder: 'yoursite.com' },
  soundcloud: { label: 'SoundCloud', code: 'SC', placeholder: 'soundcloud.com/you' },
  instagram: { label: 'Instagram', code: 'IG', placeholder: '@username' },
  facebook: { label: 'Facebook', code: 'FB', placeholder: 'Profile link' },
  tiktok: { label: 'TikTok', code: 'TT', placeholder: '@username' },
  youtube: { label: 'YouTube', code: 'YT', placeholder: 'youtube.com/@you' },
  spotify: { label: 'Spotify', code: 'SP', placeholder: 'Artist link' },
  linkedin: { label: 'LinkedIn', code: 'IN', placeholder: 'linkedin.com/in/you' },
};

export const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MON = MONTHS.map((m) => m.slice(0, 3));
export const fmtYM = (v?: YM, short = false) => (v ? `${v.d && !short ? `${v.d} ` : ''}${short ? MON[v.m] : MONTHS[v.m]} ${v.y}` : '');
const months = (a: YM, b: YM) => Math.max(0, (b.y - a.y) * 12 + b.m - a.m + 1);
export const nowYM = (): YM => ({ y: new Date().getFullYear(), m: new Date().getMonth() });
export function fmtLength(n: number) {
  const y = Math.floor(n / 12);
  const m = n % 12;
  return [y ? `${y} yr${y > 1 ? 's' : ''}` : '', m ? `${m} mo${m > 1 ? 's' : ''}` : ''].filter(Boolean).join(' ') || '1 mo';
}
export const jobMonths = (j: Job) => months(j.start, j.current || !j.end ? nowYM() : j.end);
export const jobPeriod = (j: Job) => `${fmtYM(j.start, true)} — ${j.current || !j.end ? 'now' : fmtYM(j.end, true)} · ${fmtLength(jobMonths(j))}`;
export const totalExperience = (jobs: Job[]) => fmtLength(jobs.reduce((n, j) => n + jobMonths(j), 0));
export const studyPeriod = (e: Study) => `${e.start} — ${e.current || !e.end ? 'now' : e.end}`;

export type SeekerProfile = {
  firstName: string;
  lastName: string;
  verified: boolean;
  photo?: Img;
  gender?: string;
  dob?: Date;
  age?: number;
  city?: string;
  country?: string;
  occupations: FieldEntry[];
  photos: Photo[];
  video?: { poster: Img; duration: string; progress?: number };
  /** Max plan: up to 4 more videos besides the main presentation (5 in total). */
  moreVideos?: { poster: Img; duration: string }[];
  about: string;
  languages: Language[];
  experience: Job[];
  education: Study[];
  links: ProfileLink[];
  /** "+971 50 123 4567"; undefined when the account was created with email or a social login. */
  phone?: string;
  email?: string;
  emailSource?: 'google' | 'apple';
  stats: { views: number; applications: number; invites: number; videoViews: string };
};

const p = (n: number) => ({
  id: `mp${n}`,
  source: [
    asset('mock/people/p2.jpg'),
    asset('mock/people/p3.jpg'),
    asset('mock/people/p4.jpg'),
    asset('mock/people/p5.jpg'),
    asset('mock/people/p6.jpg'),
    asset('mock/people/p7.jpg'),
  ][n],
});

/** Existing account used when someone signs in instead of registering (prototype). */
const demoProfile: SeekerProfile = {
  firstName: 'Mia',
  lastName: 'Dakaskos',
  verified: true,
  photo: asset('mock/people/p1.jpg'),
  gender: 'Female',
  age: 25,
  city: 'Dubai',
  country: 'United Arab Emirates',
  occupations: [
    { field: 'hospitality', roles: ['Waiter'], details: { height: '165', weight: '45', clothing: 'XS', shoe: '36', hair: 'Brown', appearance: 'European' }, links: [] },
    {
      field: 'model',
      roles: ['Model', 'Image model'],
      details: { height: '165', weight: '45', bust: '86', waist: '61', hips: '90', clothing: 'XS', shoe: '36', hair: 'Brown', appearance: 'European' },
      links: [],
    },
  ],
  photos: [0, 1, 2, 3, 4, 5].map(p),
  video: { poster: asset('mock/people/p12.jpg'), duration: '0:42' },
  moreVideos: [
    { poster: asset('stock/f-pink-skirt.webp'), duration: '0:31' },
    { poster: asset('stock/f-yellow-lips.webp'), duration: '0:55' },
  ],
  about:
    'Five years in hospitality, from beach clubs in JBR to fine dining at DIFC. Calm under pressure, great with VIP guests. Also work as a commercial and runway model. Fluent in English and Russian, conversational Arabic. Available for evening and weekend work, can travel within the UAE.',
  languages: [
    { code: 'EN', name: 'English', level: 'Native' },
    { code: 'RU', name: 'Russian', level: 'Native' },
    { code: 'AR', name: 'Arabic', level: 'Basic' },
  ],
  experience: [
    {
      id: 'x1',
      role: 'Hostess',
      company: 'Atlantis The Palm',
      city: 'Dubai',
      category: 'Hospitality',
      start: { y: 2022, m: 2, d: 14 },
      current: true,
      description: 'Welcomed guests at the main restaurant, managed the waiting list and VIP seating for up to 300 covers a night.',
    },
    { id: 'x2', role: 'Waitress', company: 'Beach club, JBR', city: 'Dubai', category: 'F&B', start: { y: 2020, m: 5 }, end: { y: 2022, m: 1 }, current: false, description: '' },
  ],
  education: [{ id: 'e1', institution: 'Dubai Hospitality College', degree: 'Diploma', field: 'Hospitality management', start: 2017, end: 2019, current: false }],
  links: [
    { id: 'l1', kind: 'web', value: 'miadakaskos.com' },
    { id: 'l2', kind: 'soundcloud', value: 'soundcloud.com/mia.dj' },
    { id: 'l3', kind: 'instagram', value: '@mia.dakaskos' },
  ],
  phone: '+971 50 123 4567',
  email: 'mia.dakaskos@gmail.com',
  emailSource: 'google',
  stats: { views: 128, applications: 12, invites: 5, videoViews: '1.2k' },
};

/** Draft seeded on sign-in to the demo account, so registration screens can edit the same data. */
export const demoDraft: SeekerDraft = {
  demo: true,
  photo: demoProfile.photo,
  firstName: demoProfile.firstName,
  lastName: demoProfile.lastName,
  gender: 'Female',
  dob: new Date(new Date().getFullYear() - 25, 2, 14),
  country: 'United Arab Emirates',
  city: 'Dubai',
  occupations: demoProfile.occupations,
  photos: demoProfile.photos,
  video: demoProfile.video,
};

// ---------- applications

export type AppStatus = 'pending' | 'accepted' | 'declined' | 'hired' | 'closed';
/** Seeker's answer to "Did you get this job?" for an accepted application (hire confirmation). */
export type HireAnswer = 'yes' | 'no' | 'process' | { other: string };
export const HIRE_OTHER_MAX = 200;
export const hireAnswerLabel = (a: HireAnswer) => (typeof a === 'object' ? 'Other answer' : a === 'yes' ? 'Got the job' : a === 'no' ? 'Didn’t work out' : 'Still in process');
export type Application = {
  vacancyId: string;
  status: AppStatus;
  note: string;
  chatId?: string;
  archived?: boolean;
  when?: string;
  message?: string;
  /** When the employer accepted (shown in the hire question). */
  acceptedOn?: string;
  /** Hire confirmation answer; 'yes' moves the application to Active (status 'hired'). */
  answer?: HireAnswer;
};

const initialApps: Application[] = [
  { vacancyId: 'v3', status: 'accepted', note: 'Replied today', chatId: 'c-skyline', acceptedOn: '9 Oct' },
  { vacancyId: 'v1', status: 'pending', note: 'Applied 2 h ago · viewed' },
  { vacancyId: 'v2', status: 'pending', note: 'Applied yesterday' },
  { vacancyId: 'v4', status: 'declined', note: 'The position was filled', chatId: 'c-dives' },
  { vacancyId: 'v8', status: 'pending', note: 'Applied 3 d ago' },
  { vacancyId: 'v14', status: 'hired', note: 'Today · until 22:00', chatId: 'c-sara-promo', when: 'Today' },
  { vacancyId: 'v15', status: 'closed', note: 'Vacancy closed on 2 Oct', archived: true },
  { vacancyId: 'v16', status: 'hired', note: 'Job finished · 1 Jan', archived: true },
  { vacancyId: 'v17', status: 'declined', note: 'Archived on 18 Sep', archived: true },
];

// ---------- chats

export type Msg =
  | { id: string; kind: 'text'; mine: boolean; text: string; time: string; quote?: { author: string; text: string } }
  | { id: string; kind: 'photos'; mine: boolean; photos: Img[]; text?: string; time: string }
  | { id: string; kind: 'video'; mine: boolean; poster: Img; duration: string; text?: string; time: string }
  | { id: string; kind: 'contact'; mine: boolean; name: string; phone?: string; email?: string; photo?: Img; time: string }
  | { id: string; kind: 'system'; tone: 'success' | 'danger'; text: string; time: string }
  | { id: string; kind: 'date'; label: string };

/** Message without its id (distributes over the union). */
export type NewMsg = Msg extends infer M ? (M extends Msg ? Omit<M, 'id'> : never) : never;

export type Thread = {
  id: string;
  /** Vacancy context, or Direct (contact request from a Premium employer). */
  vacancyId?: string;
  company: { name: string; initials: string; verified: boolean };
  person: { name: string; role: string; online?: boolean; photo?: Img };
  messages: Msg[];
  unread: number;
  time: string;
  state: 'active' | 'request' | 'withdrawn' | 'blocked' | 'declined';
  archived: boolean;
  requestText?: string;
};

const person = (n: number) =>
  [asset('mock/people/p9.jpg'), asset('mock/people/p13.jpg'), asset('mock/people/p14.jpg'), asset('mock/people/p0.jpg')][n];

const initialThreads: Thread[] = [
  {
    id: 'c-request-azure',
    company: { name: 'Azure Beach Club', initials: 'AB', verified: true },
    person: { name: 'Nadia Saleh', role: 'HR', online: true, photo: person(1) },
    requestText: 'Hi Mia! We’re hiring hostesses for a new rooftop lounge, evening work. Would you like to talk?',
    messages: [{ id: 'd', kind: 'date', label: 'Today' }],
    unread: 1,
    time: '17:12',
    state: 'request',
    archived: false,
  },
  {
    id: 'c-orzu',
    vacancyId: 'v1',
    company: { name: 'ORZU Group', initials: 'OG', verified: true },
    person: { name: 'Karim', role: 'HR', online: true, photo: person(2) },
    messages: [
      { id: 'd1', kind: 'date', label: 'Today' },
      { id: 'm1', kind: 'text', mine: false, text: 'Hi Mia! We liked your profile and the DJ mix on SoundCloud.', time: '14:20' },
      { id: 'm2', kind: 'text', mine: false, text: 'The party is on Friday, 20:00 – 02:00, Dubai Marina.', time: '14:21' },
      { id: 'm3', kind: 'text', mine: false, text: 'Schedule a call for tomorrow at 11:00?', time: '14:35' },
    ],
    unread: 3,
    time: '14:35',
    state: 'active',
    archived: false,
  },
  {
    id: 'c-skyline',
    vacancyId: 'v3',
    company: { name: 'Skyline Hospitality', initials: 'SH', verified: true },
    person: { name: 'Lina Haddad', role: 'HR manager', photo: person(3) },
    messages: [
      { id: 'd1', kind: 'date', label: 'Today' },
      { id: 's1', kind: 'system', tone: 'success', text: 'Your application was accepted', time: '08:40' },
      { id: 'm1', kind: 'text', mine: false, text: 'Hi Mia! Can you come for a short trial day on Saturday at 18:00?', time: '09:05' },
      { id: 'm2', kind: 'text', mine: true, text: 'Ok, I’m waiting for the address', time: '09:12' },
    ],
    unread: 0,
    time: '09:12',
    state: 'active',
    archived: false,
  },
  {
    id: 'c-dives',
    vacancyId: 'v4',
    company: { name: 'DIVES Holding', initials: 'DH', verified: true },
    person: { name: 'Omar Haddad', role: 'recruiter', online: true, photo: person(0) },
    messages: [
      { id: 'd1', kind: 'date', label: 'Yesterday' },
      { id: 's1', kind: 'system', tone: 'success', text: 'Your application was accepted', time: '22:32' },
      { id: 'm1', kind: 'text', mine: false, text: 'Hi! Please send us your video presentation.', time: '22:32' },
      { id: 'm2', kind: 'text', mine: true, text: 'Hi! Great!', time: '22:29' },
      { id: 'm3', kind: 'text', mine: true, text: 'I’ll send the video in 2–3 hours', time: '22:29' },
      { id: 'd2', kind: 'date', label: 'Today' },
      { id: 'm4', kind: 'text', mine: false, text: 'We are waiting 😊', time: '01:32' },
      { id: 'm5', kind: 'text', mine: true, text: 'Sorry for the delay, I was out of network coverage', time: '02:29' },
      { id: 'm6', kind: 'video', mine: true, poster: asset('mock/people/p12.jpg'), duration: '0:42', text: 'Here is the video', time: '02:30' },
    ],
    unread: 0,
    time: 'Sat',
    state: 'active',
    archived: false,
  },
  {
    id: 'c-sara',
    company: { name: 'Private recruiter', initials: 'SM', verified: false },
    person: { name: 'Sara Mendes', role: 'Private recruiter', photo: person(1) },
    messages: [
      { id: 'd1', kind: 'date', label: 'Friday' },
      { id: 's1', kind: 'system', tone: 'success', text: 'You accepted the request', time: '12:01' },
      { id: 'm1', kind: 'text', mine: false, text: 'Have you worked at yacht events before?', time: '12:04' },
    ],
    unread: 1,
    time: 'Fri',
    state: 'active',
    archived: false,
  },
  {
    id: 'c-sara-promo',
    vacancyId: 'v13',
    company: { name: 'Prestige Events', initials: 'PE', verified: true },
    person: { name: 'Sara Mendes', role: 'Private recruiter', photo: person(1) },
    messages: [
      { id: 'd1', kind: 'date', label: 'Monday' },
      { id: 'm1', kind: 'text', mine: false, text: 'Casting is on Monday, 10:00, Expo City', time: '10:02' },
    ],
    unread: 0,
    time: 'Mon',
    state: 'active',
    archived: false,
  },
  {
    id: 'c-old-1',
    vacancyId: 'v15',
    company: { name: 'Atlantis The Palm', initials: 'AP', verified: true },
    person: { name: 'Ravi Menon', role: 'F&B manager' },
    messages: [{ id: 'm1', kind: 'text', mine: false, text: 'Thank you for applying, the vacancy is closed.', time: '2 Oct' }],
    unread: 0,
    time: '2 Oct',
    state: 'active',
    archived: true,
  },
];

const guessKind = (l: string): LinkKind => {
  const k = (['soundcloud', 'instagram', 'facebook', 'tiktok', 'youtube', 'spotify', 'linkedin'] as LinkKind[]).find((x) => l.toLowerCase().includes(x));
  return k ?? 'web';
};
/** "+971|501234567" (session) → "+971 50 123 4567". */
const phoneLabel = (v: string) => {
  const [dial, d = ''] = v.includes('|') ? v.split('|') : ['+971', v.replace(/\D/g, '')];
  return `${dial} ${formatPhone(d, dial)}`.trim();
};

/** Profile strength for Edit profile and the "can't find you" banner. */
export function completeness(p: SeekerProfile) {
  const ready = p.photos.filter((x) => x.progress === undefined).length;
  const items = [
    { key: 'photo', done: !!p.photo, hint: 'Add a profile photo' },
    { key: 'photos', done: ready >= 3, hint: 'Add at least 3 photos', count: `${Math.min(ready, 3)} / 3` },
    { key: 'video', done: !!p.video, hint: 'Record a video presentation' },
    { key: 'about', done: !!p.about.trim(), hint: 'Write a few lines about you' },
    { key: 'languages', done: p.languages.length > 0, hint: 'Add your languages' },
    { key: 'experience', done: p.experience.length > 0, hint: 'Add your experience' },
    { key: 'education', done: p.education.length > 0, hint: 'Add your education' },
  ];
  const percent = Math.round((items.filter((i) => i.done).length / items.length) * 100);
  /** Needed to appear in talent search. */
  const search = items.filter((i) => ['photos', 'video', 'about'].includes(i.key) && !i.done);
  const next = items.find((i) => !i.done);
  const nextPercent = Math.round(((items.filter((i) => i.done).length + 1) / items.length) * 100);
  return { percent, items, search, next, nextPercent };
}

// ---------- recent searches

export type RecentSearch = { id: string; q: string; filters: import('./filters').VacancyFilters };
const initialRecent: RecentSearch[] = [
  { id: 'r1', q: 'Hostess', filters: { urgent: false, spheres: [], contracts: ['hourly', 'daily'], country: 'United Arab Emirates', city: 'Dubai', min: '100' } },
  { id: 'r2', q: 'Promo model', filters: { urgent: false, spheres: [], contracts: ['one-time'], country: 'United Arab Emirates', city: 'Dubai' } },
  { id: 'r3', q: 'Waiter, beach club', filters: { urgent: false, spheres: [], contracts: ['monthly'], country: 'United Arab Emirates', city: 'Dubai' } },
];

// ---------- notifications

export type NotifKind = 'request' | 'accepted' | 'declined' | 'vacancies' | 'urgent' | 'viewed' | 'saved' | 'views' | 'video' | 'hireAsk' | 'availSoon' | 'availEnded';
export type Notif = {
  id: string;
  kind: NotifKind;
  group: 'applications' | 'requests' | 'vacancies' | 'other';
  title: string;
  text: string;
  quote?: string;
  time: string;
  day: 'today' | 'earlier';
  unread: boolean;
  vacancyId?: string;
  threadId?: string;
  /** Category of a "new vacancies" digest and the covers to stack. */
  sphere?: Sphere;
  stack?: string[];
  more?: number;
};

const initialNotifs: Notif[] = [
  {
    id: 'n-hire-v3',
    kind: 'hireAsk',
    group: 'applications',
    title: 'Did you get the job?',
    text: 'Hostess, rooftop lounge at Skyline Hospitality. Tell us how it went.',
    time: 'now',
    day: 'today',
    unread: true,
    vacancyId: 'v3',
  },
  {
    id: 'n1',
    kind: 'request',
    group: 'requests',
    title: 'Azure Beach Club wants to chat with you',
    text: 'Contact request · Rooftop lounge hostess',
    quote: '“Hi Mia! We’re hiring hostesses for a new rooftop lounge, evening work. Would you like to talk?”',
    time: '2 min',
    day: 'today',
    unread: true,
    vacancyId: 'v6',
    threadId: 'c-request-azure',
  },
  {
    id: 'n2',
    kind: 'accepted',
    group: 'applications',
    title: 'Skyline Hospitality accepted your application',
    text: 'Hostess, rooftop lounge · They opened a chat with you.',
    time: '5 min',
    day: 'today',
    unread: true,
    vacancyId: 'v3',
    threadId: 'c-skyline',
  },
  {
    id: 'n3',
    kind: 'vacancies',
    group: 'vacancies',
    title: '5 new vacancies in Music',
    text: 'DJ for a boat party, Resident DJ, beach bar and 3 more',
    time: '1 h',
    day: 'today',
    unread: true,
    sphere: 'music',
    stack: ['v1', 'v12', 'v2'],
    more: 2,
  },
  {
    id: 'n4',
    kind: 'declined',
    group: 'applications',
    title: 'DIVES Holding declined your application',
    text: 'European female waitresses · 12 similar vacancies are still open.',
    time: '3 h',
    day: 'today',
    unread: true,
    vacancyId: 'v4',
  },
  {
    id: 'n5',
    kind: 'urgent',
    group: 'vacancies',
    title: 'Urgent in Hospitality: hostess for tonight',
    text: 'Skyline Hospitality · AED 120 / hour · Hiring within 24 h',
    time: '09:40',
    day: 'today',
    unread: false,
    vacancyId: 'v3',
  },
  {
    id: 'n6',
    kind: 'viewed',
    group: 'applications',
    title: 'ORZU Group viewed your application',
    text: 'DJ for a boat party · Usually they reply within a day.',
    time: '08:55',
    day: 'today',
    unread: false,
    vacancyId: 'v1',
  },
  {
    id: 'n7',
    kind: 'saved',
    group: 'vacancies',
    title: 'A saved vacancy closes tomorrow',
    text: 'Promo model, car launch · Prestige Events. Apply before it closes.',
    time: 'Yesterday',
    day: 'earlier',
    unread: false,
    vacancyId: 'v13',
  },
  {
    id: 'n8',
    kind: 'views',
    group: 'other',
    title: 'Your profile was viewed 18 times this week',
    text: 'Employers from hospitality and music looked at your profile.',
    time: 'Mon',
    day: 'earlier',
    unread: false,
  },
  { id: 'n9', kind: 'video', group: 'other', title: 'Add a video presentation', text: 'Profiles with a video get 3× more invitations.', time: '2 Oct', day: 'earlier', unread: false },
];

// ---------- profile completeness (product rules §10)

export const sphereToField: Record<Sphere, Field> = { hospitality: 'hospitality', fnb: 'hospitality', events: 'entertainment', modeling: 'model', music: 'music', beauty: 'service' };

export type GateItem = { key: 'photo' | 'photos' | 'about' | 'field'; title: string; text: string };

export function missingForApply(p: SeekerProfile, v: Vacancy, fieldLabel: string): GateItem[] {
  const out: GateItem[] = [];
  if (!p.photo) out.push({ key: 'photo', title: 'Profile photo', text: 'A clear photo of your face' });
  const ready = p.photos.filter((x) => x.progress === undefined).length;
  if (ready < 3) out.push({ key: 'photos', title: 'Photos', text: `At least 3 photos · ${ready} added` });
  if (!p.about.trim()) out.push({ key: 'about', title: 'About you', text: 'A few lines about your experience' });
  if (!p.occupations.some((o) => o.field === sphereToField[v.sphere])) out.push({ key: 'field', title: `${fieldLabel} in your fields`, text: `This vacancy is in ${fieldLabel}` });
  return out;
}

/** Requirement check for "You fit N of M": known kinds are matched, the rest count as met. */
export function matchRequirement(req: string, p: SeekerProfile): boolean {
  const lang = req.match(/^(English|Arabic|Russian|French)/i);
  if (lang) return p.languages.some((l) => l.name.toLowerCase() === lang[1].toLowerCase());
  const age = req.match(/Age (\d+)\D+(\d+)/);
  if (age) return p.age !== undefined && p.age >= Number(age[1]) && p.age <= Number(age[2]);
  if (/video/i.test(req)) return !!p.video && p.video.progress === undefined;
  return true;
}

// ---------- store

type Store = {
  profile: SeekerProfile;
  updateProfile: (u: Partial<SeekerProfile>) => void;
  hidden: boolean;
  setHidden: (v: boolean) => void;
  /** Settings switches (notifications, privacy). */
  prefs: Record<string, boolean>;
  setPref: (k: string, v: boolean) => void;
  apps: Application[];
  appFor: (vacancyId: string) => Application | undefined;
  apply: (vacancyId: string, message: string) => void;
  withdraw: (vacancyId: string) => void;
  saved: string[];
  toggleSaved: (vacancyId: string) => boolean;
  threads: Thread[];
  thread: (id: string) => Thread | undefined;
  updateThread: (id: string, fn: (t: Thread) => Partial<Thread>) => void;
  /** Swipe actions in Messages: Archive / Restore keep the chat, Delete removes it for you. */
  archiveThread: (id: string, archived: boolean) => void;
  deleteThread: (id: string) => void;
  send: (id: string, msg: NewMsg) => void;
  unreadTotal: number;
  /** Contact request (Premium employer): accept opens the chat, decline hides it. */
  acceptRequest: (threadId: string) => void;
  declineRequest: (threadId: string) => void;
  recent: RecentSearch[];
  addRecent: (r: Omit<RecentSearch, 'id'>) => void;
  removeRecent: (id: string) => void;
  clearRecent: () => void;
  notifs: Notif[];
  readNotif: (id: string) => void;
  readAllNotifs: () => void;
  removeNotif: (id: string) => void;
  unreadNotifs: number;
  /** Seeker subscription (§12). `canceled`: stays active until the end of the paid period. */
  plan: Tier;
  planCanceled: boolean;
  subscribe: (t: Exclude<Tier, 'free'>) => void;
  cancelPlan: () => void;
  renewPlan: () => void;
  /** Max profile look: frame around the photo and the custom header. */
  look: { frame?: FrameStyle; header: boolean };
  setLook: (l: { frame?: FrameStyle; header: boolean }) => void;
  /** Free plan: applications used this month, limit 10. */
  appsUsed: number;
  /** Hire confirmation ("Did you get this job?"). */
  answerHire: (vacancyId: string, answer: HireAnswer) => void;
  /** The sheet was shown or postponed this session (Ask me later) — don't auto-open it again. */
  hireAskDone: boolean;
  setHireAskDone: () => void;
  /** Available today (§14). Only a visible, complete profile can turn it on. */
  avail: Avail;
  availEligible: boolean;
  turnOnAvail: (slots: Slot[]) => void;
  turnOffAvail: () => void;
  /** Another 24 hours from now ("Still available today?" push). */
  extendAvail: () => void;
  /** Results of the 24 hours that just ended — the SeekAvailEnded sheet shows them once. */
  availEnded: AvailStats | null;
  closeAvailEnded: () => void;
  /** The SeekAvailSheet ("Turn on for 24 hours"), opened from the feed, the profile or a notification. */
  availSheet: boolean;
  setAvailSheet: (v: boolean) => void;
};

/** Free plan limit on applications (§12). */
export const FREE_APPLY_LIMIT = 10;

const Ctx = createContext<Store | null>(null);
let mid = 0;
const now = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

/** Seeker-side data for the prototype: profile, applications, saved vacancies and chats. Replaced by the API later. */
export function SeekerProvider({ children }: { children: ReactNode }) {
  const { seeker: draft } = useSignup();
  const { user } = useSession();
  const [extra, setExtra] = useState<Partial<SeekerProfile>>({});
  const [hidden, setHidden] = useState(false);
  const [prefs, setPrefs] = useState<Record<string, boolean>>({
    push: true,
    newVacancies: true,
    savedClosing: true,
    urgentNearby: false,
    appStatus: true,
    invites: true,
    messages: true,
    preview: true,
    digest: true,
    news: false,
    faceId: true,
    showAge: true,
    readReceipts: true,
    // Employer account switches (EmpNotifications / EmpPrivacy).
    empApplicants: true,
    empDigest: false,
    empStatus: true,
    empJoin: true,
    empTeam: false,
    empWeekly: true,
    showName: true,
    showPhone: false,
  });
  const [apps, setApps] = useState<Application[]>(initialApps);
  const [saved, setSaved] = useState<string[]>(['v13', 'v10', 'v11', 'v12']);
  const [threads, setThreads] = useState<Thread[]>(initialThreads);
  const [notifs, setNotifs] = useState<Notif[]>(initialNotifs);
  const [hireAskDone, setHireAskDoneState] = useState(false);
  const setHireAskDone = useCallback(() => setHireAskDoneState(true), []);
  const [recent, setRecent] = useState<RecentSearch[]>(initialRecent);
  // Demo account (Mia) is on Max with the neon frame and a custom header, as on the canvas; new accounts start Free.
  const [planState, setPlanState] = useState<{ plan: Tier; canceled: boolean } | null>(null);
  const [lookState, setLookState] = useState<{ frame?: FrameStyle; header: boolean } | null>(null);
  const [avail, setAvail] = useState<Avail>(availOff);
  const [availEnded, setAvailEnded] = useState<AvailStats | null>(null);
  const [availSheet, setAvailSheet] = useState(false);

  const profile = useMemo<SeekerProfile>(() => {
    const base = draft.demo ? demoProfile : null;
    return {
      firstName: draft.firstName,
      lastName: draft.lastName,
      verified: !!base,
      photo: draft.photo,
      gender: draft.gender,
      dob: draft.dob,
      age: ageFrom(draft.dob),
      city: draft.city,
      country: draft.country,
      occupations: draft.occupations,
      photos: draft.photos,
      video: draft.video,
      moreVideos: base?.moreVideos,
      about: base?.about ?? '',
      languages: base?.languages ?? [],
      experience: base?.experience ?? [],
      education: base?.education ?? [],
      links: base?.links ?? draft.occupations.flatMap((o) => o.links.map((l, i) => ({ id: `${o.field}${i}`, kind: guessKind(l), value: l.replace(/^https?:\/\//, '') }))),
      phone: base?.phone ?? (user?.phone ? phoneLabel(user.phone) : undefined),
      email: base?.email ?? user?.email,
      emailSource: base?.emailSource,
      stats: base?.stats ?? { views: 0, applications: 0, invites: 0, videoViews: '0' },
      ...extra,
    };
  }, [draft, extra, user]);

  const plan: Tier = planState?.plan ?? (draft.demo ? 'max' : 'free');
  const look = useMemo(() => lookState ?? (draft.demo ? { frame: 'neon' as FrameStyle, header: true } : { header: false }), [lookState, draft.demo]);

  const availEligible = !hidden && completeness(profile).search.length === 0;
  const availUntil = avail.on ? avail.until : 0;
  // The 24 hours: the reminder an hour before the end, then the status turns itself off and shows the results.
  useEffect(() => {
    if (!availUntil) return;
    const left = availUntil - Date.now();
    const soon = setTimeout(
      () =>
        setNotifs((ns) => [
          { id: `avail-soon-${availUntil}`, kind: 'availSoon', group: 'other', title: 'Still available today?', text: 'Your Available today ends in 1 hour. Extend it for another 24 hours?', time: 'now', day: 'today', unread: true },
          ...ns.filter((n) => n.kind !== 'availSoon'),
        ]),
      Math.max(0, left - AVAIL_REMIND_MS),
    );
    const end = setTimeout(() => {
      setAvail((a) => {
        if (a.on) setAvailEnded({ views: a.views, messages: a.messages, invites: a.invites });
        return { ...availOff };
      });
      setNotifs((ns) => [
        { id: `avail-end-${availUntil}`, kind: 'availEnded', group: 'other', title: 'Available today turned off', text: 'Your 24 hours are over. Turn it on again whenever you can start the same day.', time: 'now', day: 'today', unread: true },
        ...ns.filter((n) => n.kind !== 'availSoon' && n.kind !== 'availEnded'),
      ]);
    }, Math.max(0, left));
    return () => (clearTimeout(soon), clearTimeout(end));
  }, [availUntil]);
  // Prototype: employers open the profile while the status is on (views come from the API later).
  useEffect(() => {
    if (!availUntil) return;
    const t = setInterval(() => setAvail((a) => (a.on && a.views < 12 ? { ...a, views: a.views + 1 } : a)), 15000);
    return () => clearInterval(t);
  }, [availUntil]);

  const updateThread = useCallback((id: string, fn: (t: Thread) => Partial<Thread>) => setThreads((ts) => ts.map((t) => (t.id === id ? { ...t, ...fn(t) } : t))), []);

  const value = useMemo<Store>(
    () => ({
      profile,
      updateProfile: (u) => setExtra((e) => ({ ...e, ...u })),
      hidden,
      // Hiding the profile also turns Available today off.
      setHidden: (v) => {
        setHidden(v);
        if (v) setAvail({ ...availOff });
      },
      prefs,
      setPref: (k, v) => setPrefs((x) => ({ ...x, [k]: v })),
      apps,
      appFor: (id) => apps.find((a) => a.vacancyId === id),
      // The message goes with the application; the chat opens when the employer accepts.
      apply: (id, message) => setApps((a) => [{ vacancyId: id, status: 'pending', note: 'Applied just now', message: message.trim() || undefined }, ...a.filter((x) => x.vacancyId !== id)]),
      withdraw: (id) => setApps((a) => a.map((x) => (x.vacancyId === id ? { ...x, status: 'closed', note: 'You withdrew the application', archived: true } : x))),
      saved,
      toggleSaved: (id) => {
        const on = !saved.includes(id);
        setSaved((s) => (on ? [id, ...s] : s.filter((x) => x !== id)));
        return on;
      },
      threads,
      thread: (id) => threads.find((t) => t.id === id),
      updateThread,
      archiveThread: (id, archived) => updateThread(id, () => ({ archived })),
      deleteThread: (id) => setThreads((ts) => ts.filter((t) => t.id !== id)),
      send: (id, msg) =>
        setThreads((ts) => ts.map((t) => (t.id === id ? { ...t, messages: [...t.messages, { ...msg, id: `n${++mid}` } as Msg], time: 'time' in msg ? (msg.time as string) : now(), unread: 0 } : t))),
      unreadTotal: threads.filter((t) => !t.archived).reduce((n, t) => n + t.unread, 0),
      acceptRequest: (id) => {
        updateThread(id, (x) =>
          x.state !== 'request'
            ? {}
            : {
                state: 'active',
                unread: 0,
                messages: [
                  ...x.messages,
                  { id: 'req', kind: 'text', mine: false, text: x.requestText ?? '', time: x.time },
                  { id: 'acc', kind: 'system', tone: 'success', text: 'You accepted the request', time: now() },
                ],
              },
        );
        setNotifs((ns) => ns.filter((n) => !(n.kind === 'request' && n.threadId === id)));
      },
      declineRequest: (id) => {
        updateThread(id, () => ({ state: 'declined', unread: 0, archived: true }));
        setNotifs((ns) => ns.filter((n) => !(n.kind === 'request' && n.threadId === id)));
      },
      recent,
      addRecent: (r) =>
        setRecent((rs) =>
          [{ ...r, id: `r${Date.now()}` }, ...rs.filter((x) => x.q.trim().toLowerCase() !== r.q.trim().toLowerCase() || JSON.stringify(x.filters) !== JSON.stringify(r.filters))].slice(0, 6),
        ),
      removeRecent: (id) => setRecent((rs) => rs.filter((x) => x.id !== id)),
      clearRecent: () => setRecent([]),
      notifs,
      readNotif: (id) => setNotifs((ns) => ns.map((n) => (n.id === id ? { ...n, unread: false } : n))),
      readAllNotifs: () => setNotifs((ns) => ns.map((n) => ({ ...n, unread: false }))),
      removeNotif: (id) => setNotifs((ns) => ns.filter((n) => n.id !== id)),
      unreadNotifs: notifs.filter((n) => n.unread).length,
      plan,
      planCanceled: planState?.canceled ?? false,
      subscribe: (t) => setPlanState({ plan: t, canceled: false }),
      cancelPlan: () => setPlanState({ plan, canceled: true }),
      renewPlan: () => setPlanState({ plan: plan === 'free' ? 'max' : plan, canceled: false }),
      look: plan === 'max' ? look : { header: false },
      setLook: setLookState,
      appsUsed: apps.length,
      answerHire: (id, answer) => {
        setApps((a) =>
          a.map((x) => {
            if (x.vacancyId !== id) return x;
            // "Yes" = hired: it moves to Active, like jobs the employer marked hired.
            if (answer === 'yes') return { ...x, answer, status: 'hired', note: 'You confirmed the hire', when: 'Today' };
            return { ...x, answer, status: x.status === 'hired' ? 'accepted' : x.status };
          }),
        );
        setNotifs((ns) => ns.filter((n) => !(n.kind === 'hireAsk' && n.vacancyId === id)));
      },
      hireAskDone,
      setHireAskDone,
      // An incomplete profile is out of search, so it can't be available either.
      avail: availEligible ? avail : availOff,
      availEligible,
      turnOnAvail: (slots) => {
        setAvail({ on: true, until: Date.now() + AVAIL_MS, slots, views: 0, messages: 0, invites: 0 });
        setNotifs((ns) => ns.filter((n) => n.kind !== 'availSoon' && n.kind !== 'availEnded'));
      },
      turnOffAvail: () => {
        setAvail({ ...availOff });
        setNotifs((ns) => ns.filter((n) => n.kind !== 'availSoon'));
      },
      extendAvail: () => {
        setAvail((a) => (a.on ? { ...a, until: Date.now() + AVAIL_MS } : a));
        setNotifs((ns) => ns.filter((n) => n.kind !== 'availSoon'));
      },
      availEnded,
      closeAvailEnded: () => setAvailEnded(null),
      availSheet,
      setAvailSheet,
    }),
    [profile, hidden, prefs, apps, saved, threads, notifs, recent, updateThread, plan, planState, look, hireAskDone, setHireAskDone, avail, availEligible, availEnded, availSheet],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSeeker() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useSeeker must be used inside <SeekerProvider>');
  return v;
}

export { now as clockNow };
