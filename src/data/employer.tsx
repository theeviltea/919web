import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { Img } from './asset';

import { initialChats, withId, type EmpMsg, type NewEmpMsg } from './empChat';
import { initialApplicants, initialDetails, type Applicant, type ApplicantStatus, type VacancyDetail } from './hiring';
import { mockImg as img, personPhoto as p } from './mock';
import { findCandidate } from './talentPool';
import type { FrameStyle, Tier } from './tiers';

// Employer-side mock for the prototype (demo account: Emanuel Brooks, Skyline Hospitality). Mirrors the canvas
// screens TalentProfiles / TalentVideos / EmpHiring / EmpHiringSaved / EmpMessages* / Company*. Replaced by the API later.

export type Placeholder = 1 | 2 | 3 | 4 | 5;
export type TalentTile = { id: string; name: string; role: string; city: string; photo: Img; tier?: Tier; frame?: FrameStyle; placeholder: Placeholder };
export type VideoTile = { id: string; name: string; city: string; photo: Img; duration: string; views: string; tint: string; tier?: Tier; frame?: FrameStyle };

export const company = {
  name: 'Skyline Hospitality',
  initials: 'SH',
  plan: 'premium' as 'premium' | 'free',
  about:
    'Skyline Hospitality runs rooftop lounges, beach clubs and restaurants across Dubai and Abu Dhabi. We hire hosts, waiters, bartenders and event staff for our venues and private events, and we train every new team member on site.',
  links: [
    { key: 'web', label: 'Website', value: 'skylinehospitality.ae', badge: null },
    { key: 'ig', label: 'Instagram', value: '@skyline.dxb', badge: 'IG' },
    { key: 'in', label: 'LinkedIn', value: 'Skyline Hospitality LLC', badge: 'IN' },
    { key: 'fb', label: 'Facebook', value: 'Skyline Hospitality Dubai', badge: 'FB' },
  ],
  contacts: [
    { key: 'phone', icon: 'call' as const, label: 'Phone', value: '+971 4 555 0199' },
    { key: 'email', icon: 'mail' as const, label: 'Email', value: 'hr@skylinehospitality.ae' },
    { key: 'office', icon: 'location' as const, label: 'Office', value: 'Bay Square 7, Business Bay, Dubai' },
  ],
};

export const me = { firstName: 'Emanuel', lastName: 'Brooks', title: 'HR director', photo: p(10) };

export const team = [
  { id: 'u1', name: 'Emanuel Brooks', you: true, role: 'HR director', admin: true, photo: p(10) },
  { id: 'u2', name: 'Sara Haddad', role: 'Recruiter · Rooftop lounges', photo: p(2) },
  { id: 'u3', name: 'Omar Rahman', role: 'Recruiter · Events', photo: p(9) },
];
export const initialJoinRequests = [{ id: 'j1', name: 'Lina Morozova', email: 'lina.m@skylinehospitality.ae', when: '2 h ago', photo: p(4) }];

export type HireStatus = 'active' | 'review' | 'archive' | 'changes' | 'rejected';
export type MyVacancy = {
  id: string;
  title: string;
  meta: string; // "Events · AED 4 500 / event"
  cover: Img;
  status: HireStatus;
  note: string; // "6 of 7 days left · until 14 Oct" / "Sent 25 min ago" / "Expired 28 Sep · 2 hired"
  daysLeft?: number; // of 7
  urgentLeft?: string; // "18 h left"
  applicants?: number;
  fresh?: number; // new applicants
  faces?: Img[];
  views?: number;
  /** Full vacancy for the owner's page (EmpVacancy). */
  detail?: VacancyDetail;
  /** Moderation asked for corrections (EmpVacancyChanges). */
  changes?: { at: string; summary: string; items: string[] };
  /** Moderation rejected it (EmpVacancyRejected). */
  rejected?: { at: string; short: string; reason: string; refund?: boolean };
  /** Paid Urgent is running (EmpVacancyUrgent). */
  urgentInfo?: { left: string; progress: number; views: number; applicants: number };
};

/** EmpHiring / EmpHiringModeration: 8 vacancies — 2 moderation results, 2 active, 1 on review, 3 in archive. */
export const initialVacancies: MyVacancy[] = [
  {
    id: 'mv7',
    title: 'European female waitresses',
    meta: 'Hospitality · AED 15 000 / month',
    cover: img.waiter,
    status: 'changes',
    note: 'Today, 11:40',
    detail: initialDetails.mv7,
    changes: {
      at: 'today, 11:40',
      summary: 'cover photo, working hours, salary.',
      items: [
        'Replace the cover photo — it shows a different venue, not your restaurant.',
        'Add working hours and days to the description.',
        'Check the salary: AED 15 000 per month for part-time work looks like a typo.',
      ],
    },
  },
  {
    id: 'mv8',
    title: 'Promoters, training included',
    meta: 'Events · AED 300 / day',
    cover: img.misc,
    status: 'rejected',
    note: 'Today, 10:15',
    detail: initialDetails.mv8,
    rejected: {
      at: 'today, 10:15',
      short: 'asks candidates to pay for training.',
      reason: 'The vacancy asks candidates to pay for training and a uniform before starting. This is treated as a scam.',
      refund: true,
    },
  },
  {
    id: 'mv1',
    title: 'DJ for a boat party',
    meta: 'Events · AED 4 500 / event',
    cover: img.dj,
    status: 'active',
    note: '6 of 7 days left · until 14 Oct',
    daysLeft: 6,
    urgentLeft: '18 h left',
    urgentInfo: { left: '18 h 24 min left · ends 10 Oct, 09:30', progress: 0.77, views: 640, applicants: 9 },
    detail: initialDetails.mv1,
  },
  {
    id: 'mv2',
    title: 'Hostess, rooftop lounge',
    meta: 'Hospitality · AED 15 000 / month',
    cover: img.hostess,
    status: 'active',
    note: '3 of 7 days left · until 11 Oct',
    daysLeft: 3,
    detail: initialDetails.mv2,
  },
  { id: 'mv3', title: 'Barista, specialty coffee', meta: 'Hospitality · AED 7 500 / month', cover: img.waiter, status: 'review', note: 'Sent 25 min ago', detail: initialDetails.mv3 },
  { id: 'mv4', title: 'Promo model, car launch', meta: 'Model Business · AED 1 200 / day', cover: img.dubai1, status: 'archive', note: 'Expired 28 Sep · 2 hired', detail: initialDetails.mv4 },
  { id: 'mv5', title: 'Waiter, fine dining', meta: 'Hospitality · AED 9 000 / month', cover: img.misc, status: 'archive', note: 'Closed 21 Sep · 1 hired', detail: initialDetails.mv5 },
  { id: 'mv6', title: 'Hostess, yacht show', meta: 'Events · AED 800 / day', cover: img.dubai2, status: 'archive', note: 'Expired 12 Sep · 1 hired', detail: initialDetails.mv6 },
];

export const hireStats = { active: 2, fresh: 7, hired: 4 };

export type EmpThread = {
  id: string;
  name: string;
  photo: Img;
  online?: boolean;
  time: string;
  /** Contexts: Direct (from the candidate profile) and/or vacancies; "+N" after two. */
  direct?: boolean;
  vacancies?: string[];
  /** Inactive and archive rows show the candidate's role instead. */
  subtitle?: string;
  last: string;
  lastIcon?: 'video';
  mine?: boolean;
  unread: number;
  box: 'active' | 'inactive' | 'archive';
  reason?: 'Declined' | 'Blocked';
  /** Pool candidate behind the chat (profile card, photo). */
  candidateId?: string;
  /** Messages per context: 'direct' or a vacancy id (EmpChat / EmpChatDirect). */
  chats?: Record<string, EmpMsg[]>;
  /** Blocked by you (EmpChatBlocked) or the candidate deleted the account (EmpChatDeleted). */
  state?: 'blocked' | 'deleted';
  /** Direct contact request from Talent (EmpChatRequestPending / Accepted). */
  request?: 'pending' | 'accepted';
};

/** EmpMessages / Inactive / Archive. */
const rawThreads: EmpThread[] = [
  {
    id: 'e1',
    candidateId: 'c2',
    name: 'Angela R.',
    photo: p(12),
    online: true,
    time: '14:35',
    direct: true,
    vacancies: ['Hostess, rooftop lounge', 'DJ for a boat party'],
    last: 'Yes, I can come for a trial day on Friday',
    unread: 2,
    box: 'active',
  },
  { id: 'e2', candidateId: 'c1', name: 'Ibrahim K.', photo: p(10), time: '12:08', direct: true, last: 'Video presentation', lastIcon: 'video', unread: 1, box: 'active' },
  {
    id: 'e3',
    candidateId: 'c3',
    name: 'Elena Sokolova',
    photo: p(1),
    time: '10:41',
    vacancies: ['Promo model, car launch'],
    last: 'Thank you! See you on Monday at Expo City',
    mine: true,
    unread: 0,
    box: 'active',
  },
  { id: 'e4', candidateId: 'c25', name: 'Sveta V.', photo: p(13), online: true, time: 'Yesterday', vacancies: ['Hostess, rooftop lounge'], last: 'What is the dress code?', unread: 0, box: 'active' },
  {
    id: 'e5',
    candidateId: 'c13',
    name: 'Lucas M.',
    photo: p(14),
    time: 'Mon',
    vacancies: ['DJ for a boat party'],
    direct: true,
    last: 'Great, I will send the contract tonight',
    mine: true,
    unread: 0,
    box: 'active',
  },
  { id: 'e6', name: 'Nour A.', photo: p(6), time: 'Sun', vacancies: ['Hostess, rooftop lounge'], last: 'Hello! Is the vacancy still open?', unread: 0, box: 'active' },
  {
    id: 'e12',
    candidateId: 'c30',
    name: 'Mia D.',
    photo: p(1),
    online: true,
    time: '17:41',
    direct: true,
    request: 'accepted',
    last: 'Hi! Yes, I’m interested. What are the hours?',
    unread: 1,
    box: 'active',
  },
  { id: 'e7', candidateId: 'c38', name: 'Daria P.', photo: p(8), time: 'Tue', subtitle: 'Hostess · Dubai', last: '', unread: 0, box: 'inactive', reason: 'Declined' },
  { id: 'e8', candidateId: 'c23', name: 'Omar H.', photo: p(5), time: '2 Oct', subtitle: 'Illusionist · Abu Dhabi', last: '', unread: 0, box: 'inactive', reason: 'Blocked', state: 'blocked' },
  {
    id: 'e9',
    candidateId: 'c10',
    name: 'Mira K.',
    photo: p(4),
    time: '28 Sep',
    subtitle: 'Hostess · Dubai',
    last: 'Hi! Yes, I can do Saturday. What time?',
    unread: 0,
    box: 'archive',
    state: 'deleted',
    vacancies: ['Hostess, yacht show'],
  },
  { id: 'e10', candidateId: 'c5', name: 'Akmed V.', photo: p(9), time: '21 Sep', subtitle: 'Waiter · Dubai', last: 'The position is filled, thank you', mine: true, unread: 0, box: 'archive' },
  { id: 'e11', candidateId: 'c16', name: 'Kira L.', photo: p(3), time: '12 Sep', subtitle: 'Promo model · Dubai', last: 'See you next time 🙂', unread: 0, box: 'archive' },
];
/** EmpMessages: pool photos and seeded conversations. */
export const initialEmpThreads: EmpThread[] = rawThreads.map((t) => ({ ...t, photo: t.candidateId ? (findCandidate(t.candidateId)?.photo ?? t.photo) : t.photo, chats: initialChats[t.id] }));

/** Trade licence verification. Only an approved licence gives the company the verified badge. */
export type LicenceStatus = 'none' | 'review' | 'rejected' | 'verified';
export type LicenceFile = { name: string; size: string; uri?: string };
export type Licence = {
  status: LicenceStatus;
  file?: LicenceFile;
  sentAt?: string;
  checkedAt?: string;
  reason?: string;
  number?: string;
  issuer?: string;
  validUntil?: string;
  /** Private recruiters: no trade licence, no badge prompts. */
  exempt?: boolean;
};
/** Demo account (Skyline Hospitality) is verified. */
export const initialLicence: Licence = {
  status: 'verified',
  file: { name: 'Skyline_trade_licence.pdf', size: '1.2 MB' },
  checkedAt: '12 Sep 2026',
  number: 'CN-3318204',
  issuer: 'Dubai DED',
  validUntil: '14 Mar 2027',
};

export type EmpNotifKind = 'applicants' | 'accepted' | 'changes' | 'urgent' | 'approved' | 'rejected' | 'expires' | 'declined' | 'premiumSoon' | 'archived' | 'applicant' | 'premiumOver' | 'licenceOk' | 'licenceRejected' | 'hireAsk' | 'availToday';
export type EmpNotif = {
  id: string;
  kind: EmpNotifKind;
  group: 'applicants' | 'vacancies' | 'messages' | 'subscription' | 'company';
  title: string;
  text: string;
  time: string;
  day: 'today' | 'earlier';
  unread: boolean;
  /** Candidate photo or vacancy cover; tiles are drawn for the rest. */
  photo?: Img;
  cover?: Img;
  action?: string;
};

/** EmpNotificationCenter: New · 4, Today, Earlier. */
/** Employer's answer about an accepted candidate (EmpHireSurvey): did the hire happen? */
export type HireAnswer = 'hired' | 'nofit' | 'deciding';
/** Saved answers per vacancy → candidate. mv2 (Hostess, rooftop lounge) is still unanswered: the demo asks about it. */
export const initialHireAnswers: Record<string, Record<string, HireAnswer>> = {
  mv1: { c13: 'hired', c37: 'deciding' },
  mv4: { c3: 'hired', c54: 'hired', c32: 'nofit' },
  mv5: { c35: 'hired' },
  mv6: { c10: 'hired', c47: 'nofit' },
};

export const initialEmpNotifs: EmpNotif[] = [
  {
    id: 'en-avail',
    kind: 'availToday',
    group: 'applicants',
    title: '2 hostesses are available today',
    text: 'Hostess, rooftop lounge is urgent. See who can start today in Dubai',
    time: '20 min',
    day: 'today',
    unread: true,
    action: 'See who',
  },
  {
    id: 'en-hire',
    kind: 'hireAsk',
    group: 'vacancies',
    title: 'Who did you hire?',
    text: 'Hostess, rooftop lounge: how did it go with your accepted candidates? Answer in a few taps',
    time: '1 h',
    day: 'today',
    unread: true,
    action: 'Answer',
  },
  {
    id: 'en1',
    kind: 'applicants',
    group: 'applicants',
    title: '3 new applicants for Hostess, rooftop lounge',
    text: 'Angela R., Sveta V. and 1 more applied',
    time: '5 min',
    day: 'today',
    unread: true,
    photo: p(12),
    action: 'View applicants',
  },
  {
    id: 'en2',
    kind: 'accepted',
    group: 'messages',
    title: 'Mia D. accepted your contact request',
    text: 'Direct chat is open — you can write now',
    time: '20 min',
    day: 'today',
    unread: true,
    photo: p(1),
    action: 'Open chat',
  },
  {
    id: 'en3',
    kind: 'changes',
    group: 'vacancies',
    title: 'Changes needed: European female waitresses',
    text: '3 corrections from the 919 team — cover photo, working hours, salary',
    time: '1 h',
    day: 'today',
    unread: true,
    cover: img.waiter,
    action: 'Fix and resubmit',
  },
  { id: 'en4', kind: 'urgent', group: 'vacancies', title: 'Urgent ends in 2 hours', text: 'DJ for a boat party · 9 new applicants since it went urgent', time: '2 h', day: 'today', unread: true },
  {
    id: 'en5',
    kind: 'approved',
    group: 'vacancies',
    title: 'Vacancy approved',
    text: 'Hostess, rooftop lounge is live for 7 days, until 16 Oct',
    time: '10:40',
    day: 'today',
    unread: false,
    cover: img.hostess,
  },
  {
    id: 'en6',
    kind: 'rejected',
    group: 'vacancies',
    title: 'Vacancy rejected: Promoters, training included',
    text: 'Violates 919 rules. Urgent hiring $2.99 will be refunded within 3 business days.',
    time: '10:15',
    day: 'today',
    unread: false,
    cover: img.misc,
  },
  {
    id: 'en7',
    kind: 'expires',
    group: 'vacancies',
    title: 'Promo model, car launch expires tomorrow',
    text: 'Relaunch it for another 7 days to keep receiving applicants',
    time: '09:00',
    day: 'today',
    unread: false,
    action: 'Relaunch',
  },
  {
    id: 'en8',
    kind: 'declined',
    group: 'messages',
    title: 'Mira K. declined your contact request',
    text: 'You can still invite her through a vacancy',
    time: '08:12',
    day: 'today',
    unread: false,
    photo: p(4),
  },
  {
    id: 'en9',
    kind: 'premiumSoon',
    group: 'subscription',
    title: 'Premium expires in 3 days',
    text: 'Your subscription was canceled. Premium features stay until 9 Nov',
    time: 'Mon',
    day: 'earlier',
    unread: false,
    action: 'Renew',
  },
  {
    id: 'en10',
    kind: 'archived',
    group: 'vacancies',
    title: 'Vacancy moved to archive',
    text: 'Barista, specialty coffee was live for 7 days and got 14 applicants',
    time: 'Sun',
    day: 'earlier',
    unread: false,
  },
  {
    id: 'en11',
    kind: 'applicant',
    group: 'applicants',
    title: 'New applicant for Barista, specialty coffee',
    text: 'Sveta V. · 2 years of experience',
    time: 'Sat',
    day: 'earlier',
    unread: false,
    photo: p(8),
  },
  {
    id: 'en12',
    kind: 'premiumOver',
    group: 'subscription',
    title: 'Premium has expired',
    text: 'You’re on the Free plan: 1 active vacancy, chats only via applications',
    time: '2 Oct',
    day: 'earlier',
    unread: false,
    action: 'Get Premium',
  },
];

export type Plan = 'free' | 'premium' | 'canceled';
export type Rep = { firstName: string; lastName: string; position: string; email: string; phone: string; photo: Img };
export type CompanyInfo = {
  name: string;
  logo?: Img;
  industry: string;
  size: string;
  founded: string;
  about: string;
  country: string;
  city: string;
  phone: string;
  email: string;
  office: string;
  website: string;
  instagram: string;
  linkedin: string;
  facebook: string;
};
export type Member = { id: string; name: string; role: 'Admin' | 'Recruiter'; title: string; you?: boolean; photo: Img; vacancies?: number };

export const initialRep: Rep = { firstName: 'Emanuel', lastName: 'Brooks', position: 'HR director', email: 'emanuel@skylinehospitality.ae', phone: '+971 50 123 4567', photo: p(10) };
export const initialInfo: CompanyInfo = {
  name: 'Skyline Hospitality',
  industry: 'Hospitality',
  size: '50–200 employees',
  founded: '2014',
  about: 'Skyline Hospitality runs rooftop lounges, beach clubs and restaurants across Dubai and Abu Dhabi. We hire hosts, waiters, bartenders and event staff for our venues and private events.',
  country: 'United Arab Emirates',
  city: 'Dubai',
  phone: '+971 4 555 0199',
  email: 'hr@skylinehospitality.ae',
  office: 'Bay Square 7, Business Bay, Dubai',
  website: 'skylinehospitality.ae',
  instagram: '@skyline.dxb',
  linkedin: '',
  facebook: 'Skyline Hospitality Dubai',
};
export const initialMembers: Member[] = [
  { id: 'u1', name: 'Emanuel Brooks', role: 'Admin', title: 'HR director', you: true, photo: p(10) },
  { id: 'u2', name: 'Sara Haddad', role: 'Recruiter', title: 'Rooftop lounges', photo: p(2), vacancies: 6 },
  { id: 'u3', name: 'Omar Rahman', role: 'Recruiter', title: 'Events', photo: p(9), vacancies: 2 },
];
/** What deleting an employer account removes (EmpDeleteAccount). */
export const EMPLOYER_LOSSES = ['Your profile, company vacancies, applicants and chats', 'Your Premium subscription will be canceled', 'Payments for the current period are not refunded'];

/** Company initials for the logo tile: "Skyline Hospitality" → "SH". */
export const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('') || '—';
/** Profile completeness for the Edit profile hub. */
export function companyCompleteness(info: CompanyInfo, rep: Rep) {
  const checks = [info.name, info.about, info.industry, info.city, info.phone, info.email, info.office, info.website, info.instagram, info.linkedin, info.facebook, rep.position, rep.email];
  const done = checks.filter((x) => x.trim()).length;
  return Math.round((done / checks.length) * 100);
}

/** Saved talent at start (EmpHiringSaved): candidate ids from the pool and when they were saved. */
export const DEFAULT_SAVED = ['c2', 'c1', 'c3', 'c5', 'c25', 'c13', 'c11', 'c16', 'c22', 'c10', 'c33', 'c32'];
export const savedLabels: Record<string, string> = {
  c2: 'Saved today',
  c1: 'Saved yesterday',
  c3: 'Saved 2 days ago',
  c5: 'Saved 3 days ago',
  c25: 'Saved 5 days ago',
  c13: 'Saved 1 week ago',
  c11: 'Saved 1 week ago',
  c16: 'Saved 2 weeks ago',
  c22: 'Saved 2 weeks ago',
  c10: 'Saved 3 weeks ago',
  c33: 'Saved 1 month ago',
  c32: 'Saved 1 month ago',
};

type Store = {
  threads: EmpThread[];
  moveThread: (id: string, box: EmpThread['box']) => void;
  deleteThread: (id: string) => void;
  /** Direct contact request from a candidate profile (EmpContactSheet → EmpMessagesRequest). */
  addThread: (t: EmpThread) => void;
  updateThread: (id: string, fn: (t: EmpThread) => Partial<EmpThread>) => void;
  /** Append a message to one context of a chat. */
  sendChat: (threadId: string, ctx: string, msg: NewEmpMsg) => void;
  /** Accept / decline an applicant: updates the applicants list and the candidate's chat. */
  acceptApplicant: (vacancyId: string, candidateId: string) => string;
  declineApplicant: (vacancyId: string, candidateId: string) => void;
  /** Direct contact request from a profile (EmpContactSheet → EmpChatRequestPending; the demo candidate accepts a bit later). */
  requestContact: (candidateId: string, text: string) => string;
  vacancies: MyVacancy[];
  /** New vacancy from the posting flow: lands On review, the demo moderation approves it a bit later. */
  addVacancy: (v: MyVacancy) => void;
  updateVacancy: (id: string, u: Partial<MyVacancy>) => void;
  /** Edited vacancy goes back to review (Edit vacancy → Send for review); the demo moderation approves it again. */
  resubmitVacancy: (id: string, u: Partial<MyVacancy>) => void;
  removeVacancy: (id: string) => void;
  /** Applicants per vacancy id (EmpApplicants). */
  applicants: Record<string, Applicant[]>;
  setApplicant: (vacancyId: string, candidateId: string, status: ApplicantStatus) => void;
  /** New applicants across active vacancies (hub stat and the Vacancies tab badge). */
  freshTotal: number;
  addNotif: (n: EmpNotif) => void;
  unreadTotal: number;
  joinRequests: typeof initialJoinRequests;
  resolveJoin: (id: string) => void;
  notifs: EmpNotif[];
  readNotif: (id: string) => void;
  readAllNotifs: () => void;
  unreadNotifs: number;
  rep: Rep;
  setRep: (u: Partial<Rep>) => void;
  info: CompanyInfo;
  setInfo: (u: Partial<CompanyInfo>) => void;
  plan: Plan;
  setPlan: (p: Plan) => void;
  /** Trade licence and the verified badge (EmpVerify*). */
  licence: Licence;
  verified: boolean;
  sendLicence: (file: LicenceFile) => void;
  /** New employer from sign-up: no licence yet, or the one picked on step 3. Private recruiters are exempt. */
  resetLicence: (file?: LicenceFile, exempt?: boolean) => void;
  /** Employer still should be asked to upload a licence (no file, not exempt). */
  needsLicence: boolean;
  /** The one-time 'Add your trade licence' sheet after sign-up was shown. */
  licencePromptSeen: boolean;
  setLicencePromptSeen: () => void;
  members: Member[];
  addMember: (m: Member) => void;
  updateMember: (id: string, u: Partial<Member>) => void;
  removeMember: (id: string) => void;
  /** Hire confirmation (EmpHireSurvey): answers per vacancy → accepted candidate. */
  hireAnswers: Record<string, Record<string, HireAnswer>>;
  saveHireAnswers: (vacancyId: string, answers: Record<string, HireAnswer>) => void;
  /** Vacancy whose "Who did you hire?" sheet is open (null = closed). */
  hireSurveyFor: string | null;
  openHireSurvey: (vacancyId: string) => void;
  closeHireSurvey: () => void;
  /** The sheet already opened itself once this session (or the employer chose "Ask me later"). */
  hireAskSeen: boolean;
  setHireAskSeen: () => void;
  /** Bookmarked candidates (search results). */
  savedIds: string[];
  toggleSaved: (id: string) => boolean;
};

/** How long the demo moderation takes for a new vacancy. */
const MODERATION_MS = 20_000;

const clock = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};
const preview = (msg: NewEmpMsg) =>
  msg.kind === 'text'
    ? msg.text
    : msg.kind === 'photos'
      ? 'Photo'
      : msg.kind === 'vacancy'
        ? 'Vacancy'
        : msg.kind === 'location'
          ? 'Location'
          : msg.kind === 'contact'
            ? 'Contact'
            : msg.kind === 'event'
              ? msg.text
              : '';

const Ctx = createContext<Store | null>(null);

/** Employer-side state for the prototype: chats and join requests. */
export function EmployerProvider({ children }: { children: ReactNode }) {
  const [threads, setThreads] = useState(initialEmpThreads);
  const [joinRequests, setJoin] = useState(initialJoinRequests);
  const [savedIds, setSaved] = useState<string[]>(DEFAULT_SAVED);
  const [notifs, setNotifs] = useState(initialEmpNotifs);
  const [vacancies, setVacancies] = useState(initialVacancies);
  const [applicants, setApplicants] = useState(initialApplicants);
  const [rep, setRepState] = useState(initialRep);
  const [info, setInfoState] = useState(initialInfo);
  const [plan, setPlan] = useState<Plan>('premium');
  const [licence, setLicence] = useState<Licence>(initialLicence);
  const [licencePromptSeen, setPromptSeen] = useState(false);
  const [hireAnswers, setHireAnswers] = useState(initialHireAnswers);
  const [hireSurveyFor, setHireSurveyFor] = useState<string | null>(null);
  const [hireAskSeen, setHireAskSeenState] = useState(false);
  const [members, setMembers] = useState(initialMembers);
  /** Demo check of a trade licence: the 919 team approves it a little after it's sent. */
  const checkLicenceLater = () =>
    setTimeout(() => {
      const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
      setLicence((l) => (l.status === 'review' ? { ...l, status: 'verified', checkedAt: today, issuer: 'Dubai DED', validUntil: '14 Mar 2027', reason: undefined } : l));
      setNotifs((ns) => [
        { id: `lic-${Date.now()}`, kind: 'licenceOk', group: 'company', title: 'Company verified', text: 'Trade licence approved. The verified badge is now next to your company name', time: 'now', day: 'today', unread: true },
        ...ns,
      ]);
    }, MODERATION_MS);
  /** Demo moderation: the 919 team approves a vacancy a little after it's sent. */
  const approveLater = (id: string, title: string, cover: Img) =>
    setTimeout(() => {
      const until = new Date(Date.now() + 7 * 864e5).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
      setVacancies((vs) =>
        vs.map((x) =>
          x.id === id && x.status === 'review'
            ? {
                ...x,
                status: 'active',
                daysLeft: 7,
                note: `7 of 7 days left · until ${until}`,
                detail: x.detail && { ...x.detail, posted: 'Just now' },
                urgentInfo: x.urgentLeft ? { left: '24 h left · started just now', progress: 1, views: 0, applicants: 0 } : undefined,
              }
            : x,
        ),
      );
      setNotifs((ns) => [
        {
          id: `n${id}-${Date.now()}`,
          kind: 'approved',
          group: 'vacancies',
          title: 'Vacancy approved',
          text: `${title} is live for 7 days, until ${until}`,
          time: 'now',
          day: 'today',
          unread: true,
          cover,
        },
        ...ns,
      ]);
    }, MODERATION_MS);
  const value = useMemo<Store>(
    () => ({
      threads,
      moveThread: (id, box) => setThreads((ts) => ts.map((t) => (t.id === id ? { ...t, box } : t))),
      deleteThread: (id) => setThreads((ts) => ts.filter((t) => t.id !== id)),
      vacancies,
      addVacancy: (v) => {
        setVacancies((vs) => [v, ...vs]);
        approveLater(v.id, v.title, v.cover);
      },
      resubmitVacancy: (id, u) => {
        setVacancies((vs) => vs.map((x) => (x.id === id ? { ...x, ...u, status: 'review', note: 'Changes sent just now', changes: undefined, rejected: undefined, daysLeft: undefined } : x)));
        approveLater(id, u.title ?? vacancies.find((x) => x.id === id)?.title ?? 'Vacancy', u.cover ?? vacancies.find((x) => x.id === id)!.cover);
      },
      updateVacancy: (id, u) => setVacancies((vs) => vs.map((v) => (v.id === id ? { ...v, ...u } : v))),
      removeVacancy: (id) => setVacancies((vs) => vs.filter((v) => v.id !== id)),
      applicants,
      setApplicant: (vid, cid, status) =>
        setApplicants((all) => ({
          ...all,
          [vid]: (all[vid] ?? []).map((x) => (x.candidateId === cid ? { ...x, status, declinedNote: status === 'declined' ? 'Declined just now' : x.declinedNote } : x)),
        })),
      freshTotal: vacancies.filter((v) => v.status === 'active').reduce((n, v) => n + (applicants[v.id] ?? []).filter((x) => x.status === 'new').length, 0),
      addNotif: (n) => setNotifs((ns) => [n, ...ns]),
      addThread: (t) => setThreads((ts) => [t, ...ts.filter((x) => x.id !== t.id)]),
      updateThread: (id, fn) => setThreads((ts) => ts.map((t) => (t.id === id ? { ...t, ...fn(t) } : t))),
      sendChat: (threadId, ctx, msg) =>
        setThreads((ts) =>
          ts.map((t) => {
            if (t.id !== threadId) return t;
            const chats = { ...(t.chats ?? {}), [ctx]: [...(t.chats?.[ctx] ?? []), withId(msg)] };
            const text = preview(msg);
            const mine = 'mine' in msg ? msg.mine : true;
            return text ? { ...t, chats, last: text, lastIcon: undefined, mine, time: 'now', box: t.box === 'archive' ? 'active' : t.box, unread: mine ? 0 : t.unread + 1 } : { ...t, chats };
          }),
        ),
      acceptApplicant: (vid, cid) => {
        setApplicants((all) => ({ ...all, [vid]: (all[vid] ?? []).map((x) => (x.candidateId === cid ? { ...x, status: 'accepted' } : x)) }));
        const cand = findCandidate(cid)!;
        const title = vacancies.find((v) => v.id === vid)?.title ?? 'Vacancy';
        const existing = threads.find((t) => t.candidateId === cid);
        const accepted = withId({ kind: 'event', tone: 'success', text: 'You accepted the application', time: clock() });
        if (existing) {
          setThreads((ts) =>
            ts.map((t) =>
              t.id === existing.id
                ? {
                    ...t,
                    vacancies: t.vacancies?.includes(title) ? t.vacancies : [...(t.vacancies ?? []), title],
                    chats: { ...(t.chats ?? {}), [vid]: [...(t.chats?.[vid] ?? []), accepted] },
                    box: 'active',
                    reason: undefined,
                  }
                : t,
            ),
          );
          return existing.id;
        }
        const id = `t-${cid}`;
        const first = cand.name.split(' ')[0];
        setThreads((ts) => [
          {
            id,
            candidateId: cid,
            name: cand.name,
            photo: cand.photo,
            time: 'now',
            vacancies: [title],
            last: 'You accepted the application',
            mine: true,
            unread: 0,
            box: 'active',
            chats: { [vid]: [withId({ kind: 'date', label: 'Today' }), withId({ kind: 'event', tone: 'info', text: `${first} applied to your vacancy`, time: clock() }), accepted] },
          },
          ...ts,
        ]);
        return id;
      },
      declineApplicant: (vid, cid) => {
        setApplicants((all) => ({ ...all, [vid]: (all[vid] ?? []).map((x) => (x.candidateId === cid ? { ...x, status: 'declined', declinedNote: 'Declined just now' } : x)) }));
      },
      requestContact: (cid, text) => {
        const cand = findCandidate(cid)!;
        const first = cand.name.split(' ')[0];
        const existing = threads.find((t) => t.candidateId === cid);
        const id = existing?.id ?? `req-${cid}`;
        const body = text.trim() || `Hi ${first}! We’d like to talk about working together.`;
        const sent = [
          withId({ kind: 'date', label: 'Today' }),
          withId({ kind: 'event', tone: 'info', icon: 'message', text: 'You sent a contact request', time: clock() }),
          withId({ kind: 'text', mine: true, text: body, time: clock() }),
        ];
        if (existing) {
          setThreads((ts) =>
            ts.map((t) => (t.id === id ? { ...t, direct: true, chats: { ...(t.chats ?? {}), direct: [...(t.chats?.direct ?? []), ...sent] }, last: body, mine: true, time: 'now' } : t)),
          );
          return id;
        }
        setThreads((ts) => [
          { id, candidateId: cid, name: cand.name, photo: cand.photo, time: 'now', direct: true, request: 'pending', last: body, mine: true, unread: 0, box: 'active', chats: { direct: sent } },
          ...ts,
        ]);
        // Demo: the candidate accepts a little later.
        setTimeout(() => {
          setThreads((ts) =>
            ts.map((t) =>
              t.id === id && t.request === 'pending'
                ? {
                    ...t,
                    request: 'accepted',
                    online: true,
                    last: 'Hi! Yes, I’m interested. What are the hours?',
                    mine: false,
                    unread: 1,
                    time: clock(),
                    chats: {
                      ...(t.chats ?? {}),
                      direct: [
                        ...(t.chats?.direct ?? []),
                        withId({ kind: 'event', tone: 'success', text: `${first} accepted your request`, time: clock() }),
                        withId({ kind: 'text', mine: false, text: 'Hi! Yes, I’m interested. What are the hours?', time: clock() }),
                      ],
                    },
                  }
                : t,
            ),
          );
          setNotifs((ns) => [
            {
              id: `nreq-${cid}-${Date.now()}`,
              kind: 'accepted',
              group: 'messages',
              title: `${cand.name} accepted your contact request`,
              text: 'Direct chat is open — you can write now',
              time: 'now',
              day: 'today',
              unread: true,
              photo: cand.photo,
              action: 'Open chat',
            },
            ...ns,
          ]);
        }, 20_000);
        return id;
      },
      unreadTotal: threads.filter((t) => t.box === 'active').reduce((n, t) => n + t.unread, 0),
      joinRequests,
      resolveJoin: (id) => setJoin((js) => js.filter((j) => j.id !== id)),
      notifs,
      readNotif: (id) => setNotifs((ns) => ns.map((n) => (n.id === id ? { ...n, unread: false } : n))),
      readAllNotifs: () => setNotifs((ns) => ns.map((n) => ({ ...n, unread: false }))),
      unreadNotifs: notifs.filter((n) => n.unread).length,
      rep,
      setRep: (u) => setRepState((x) => ({ ...x, ...u })),
      info,
      setInfo: (u) => setInfoState((x) => ({ ...x, ...u })),
      plan,
      setPlan,
      licence,
      verified: licence.status === 'verified',
      sendLicence: (file) => {
        setLicence({ status: 'review', file, sentAt: `today at ${clock()}` });
        checkLicenceLater();
      },
      needsLicence: !licence.exempt && (licence.status === 'none' || licence.status === 'rejected'),
      licencePromptSeen,
      setLicencePromptSeen: () => setPromptSeen(true),
      resetLicence: (file, exempt) => {
        setPromptSeen(false);
        if (exempt) setLicence({ status: 'none', exempt: true });
        else if (file) {
          setLicence({ status: 'review', file, sentAt: `today at ${clock()}` });
          checkLicenceLater();
        } else setLicence({ status: 'none' });
      },
      // "You" in the team always mirrors Your profile.
      members: members.map((m) => (m.you ? { ...m, name: `${rep.firstName} ${rep.lastName}`, title: rep.position, photo: rep.photo } : m)),
      addMember: (m) => setMembers((ms) => [...ms, m]),
      updateMember: (id, u) => setMembers((ms) => ms.map((m) => (m.id === id ? { ...m, ...u } : m))),
      removeMember: (id) => setMembers((ms) => ms.filter((m) => m.id !== id)),
      hireAnswers,
      saveHireAnswers: (vid, answers) => {
        setHireAnswers((all) => ({ ...all, [vid]: { ...all[vid], ...answers } }));
        setNotifs((ns) => ns.map((n) => (n.kind === 'hireAsk' ? { ...n, unread: false } : n)));
      },
      hireSurveyFor,
      openHireSurvey: (vid) => {
        setHireAskSeenState(true);
        setHireSurveyFor(vid);
      },
      closeHireSurvey: () => setHireSurveyFor(null),
      hireAskSeen,
      setHireAskSeen: () => setHireAskSeenState(true),
      savedIds,
      toggleSaved: (id) => {
        const on = !savedIds.includes(id);
        setSaved((xs) => (on ? [id, ...xs] : xs.filter((x) => x !== id)));
        return on;
      },
    }),
    [threads, joinRequests, savedIds, notifs, rep, info, plan, licence, licencePromptSeen, members, vacancies, applicants, hireAnswers, hireSurveyFor, hireAskSeen],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useEmployer() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useEmployer must be used inside <EmployerProvider>');
  return v;
}

/** Accepted candidates of a vacancy and how many still have no answer (Who did you hire?). */
export function hireProgress(applicants: Applicant[] | undefined, answers: Record<string, HireAnswer> | undefined) {
  const accepted = (applicants ?? []).filter((a) => a.status === 'accepted');
  const a = answers ?? {};
  const count = (k: HireAnswer) => accepted.filter((x) => a[x.candidateId] === k).length;
  return {
    accepted,
    unanswered: accepted.filter((x) => !a[x.candidateId]).length,
    hired: count('hired'),
    deciding: count('deciding'),
    nofit: count('nofit'),
  };
}
