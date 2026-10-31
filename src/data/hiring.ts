import type { Img } from './asset';

import { profileOf } from './candidateProfile';
import { mockImg as img } from './mock';
import { findCandidate, type Candidate } from './talentPool';
import type { ContractType, Vacancy } from './types';

// The employer's own vacancies in full (EmpVacancy*) and their applicants (EmpApplicants*). Prototype data.

export type VacancyDetail = {
  category: string; // "Hospitality"
  contract: ContractType;
  currency: string;
  /** Absent: negotiable. */
  amount?: number;
  from?: boolean;
  role: string;
  gender: string;
  age: string;
  city: string;
  country: string;
  description: string;
  requirements: string[];
  photos: Img[];
  posted: string; // "2 h ago"
  views: number;
  /** The form as it was filled (vacancies posted in the app), so editing reopens it exactly. */
  form?: {
    field?: string;
    roles: string[];
    startDate?: string;
    params: Record<string, string | boolean | string[]>;
    languages: { name: string; level: string }[];
    amountMode: 'exact' | 'from' | 'negotiable';
    currency?: string;
  };
};

export type ApplicantStatus = 'new' | 'accepted' | 'declined';
export type Applicant = {
  candidateId: string;
  status: ApplicantStatus;
  when: string; // "4 min"
  /** Cover message from the application. */
  note?: string;
  /** "Declined yesterday · no Arabic" */
  declinedNote?: string;
  /** Minutes ago, for sorting. */
  ago: number;
};

const desc = (what: string) =>
  `${what} Working days are 8 hours, 5 days a week, with uniform and staff meals provided. Previous experience in a five-star venue is a plus. We train every new team member on site and pay on time, every month.`;

/** Details for the demo vacancies (keyed by MyVacancy id). */
export const initialDetails: Record<string, VacancyDetail> = {
  mv1: {
    category: 'Events',
    contract: 'one-time',
    currency: 'AED',
    amount: 4500,
    role: 'DJ, house and disco',
    gender: 'Any',
    age: '21–35',
    city: 'Dubai',
    country: 'United Arab Emirates',
    description: 'Four-hour set on a private yacht for 60 guests, sunset to midnight. Sound system on board; bring your own controller. Dress code smart casual. Transfer from Dubai Marina is on us.',
    requirements: ['English — fluent', 'Own equipment', 'Video presentation'],
    photos: [img.dj, img.dj2, img.dj3, img.dubai2],
    posted: '1 day ago',
    views: 2420,
  },
  mv2: {
    category: 'Hospitality',
    contract: 'monthly',
    currency: 'AED',
    amount: 15000,
    role: 'Hostess, rooftop lounge',
    gender: 'Female',
    age: '21–25',
    city: 'Dubai',
    country: 'United Arab Emirates',
    description: desc('Welcome guests at our rooftop lounge in Business Bay, manage the waiting list and seat guests during evening service.'),
    requirements: ['English — native', 'Age 21–25', 'Video presentation'],
    photos: [img.hostess, img.hostess2, img.hostess4, img.burj, img.misc, img.dubai1],
    posted: '4 days ago',
    views: 2145,
  },
  mv3: {
    category: 'Hospitality',
    contract: 'monthly',
    currency: 'AED',
    amount: 7500,
    role: 'Barista',
    gender: 'Any',
    age: 'Any',
    city: 'Dubai',
    country: 'United Arab Emirates',
    description: desc('Prepare specialty coffee and manual brews at our lobby café, keep the bar spotless and help guests choose beans.'),
    requirements: ['English — fluent'],
    photos: [img.waiter, img.barista, img.misc],
    posted: 'On review',
    views: 0,
  },
  mv4: {
    category: 'Model Business',
    contract: 'daily',
    currency: 'AED',
    amount: 1200,
    role: 'Promo model',
    gender: 'Female',
    age: '20–28',
    city: 'Dubai',
    country: 'United Arab Emirates',
    description: 'Two days at a car launch in Dubai Design District: greet guests, present the new model and pose for the press. Styling and outfits provided.',
    requirements: ['English — fluent', 'Height 170+ cm'],
    photos: [img.dubai1, img.promo, img.model],
    posted: '21 Sep',
    views: 3810,
  },
  mv5: {
    category: 'Hospitality',
    contract: 'monthly',
    currency: 'AED',
    amount: 9000,
    role: 'Waiter, fine dining',
    gender: 'Any',
    age: '21–35',
    city: 'Dubai',
    country: 'United Arab Emirates',
    description: desc('Serve a seven-course tasting menu in our 40-seat dining room and pair dishes with wine together with the sommelier.'),
    requirements: ['English — fluent'],
    photos: [img.misc, img.waiter, img.madinat],
    posted: '14 Sep',
    views: 1960,
  },
  mv6: {
    category: 'Events',
    contract: 'daily',
    currency: 'AED',
    amount: 800,
    role: 'Hostess, events',
    gender: 'Female',
    age: '21–30',
    city: 'Dubai',
    country: 'United Arab Emirates',
    description: 'Three days at the yacht show in Dubai Harbour: welcome guests on board, hand out brochures and guide tours of the yachts.',
    requirements: ['English — fluent', 'Arabic — basic'],
    photos: [img.dubai2, img.hostess3, img.burj],
    posted: '5 Sep',
    views: 1530,
  },
  mv7: {
    category: 'Hospitality',
    contract: 'monthly',
    currency: 'AED',
    amount: 15000,
    role: 'Hostess, beach restaurant',
    gender: 'Female',
    age: '21–25',
    city: 'Dubai',
    country: 'United Arab Emirates',
    description:
      "Welcome guests at the hotel's beach restaurant, take orders and serve food and drinks during lunch and dinner. Working days are 8 hours, 5 days a week, with uniform and staff meals provided. Previous experience in a five-star venue is a plus.",
    requirements: ['English — native', 'Age 21–25', 'Video presentation'],
    photos: [img.waiter, img.misc, img.madinat],
    posted: 'Not published',
    views: 0,
  },
  mv8: {
    category: 'Events',
    contract: 'daily',
    currency: 'AED',
    amount: 300,
    role: 'Promoter',
    gender: 'Any',
    age: '18–30',
    city: 'Dubai',
    country: 'United Arab Emirates',
    description: 'Hand out flyers and invite guests to our events. Paid training is included in the first week, uniform is purchased by the promoter.',
    requirements: ['English — fluent'],
    photos: [img.misc, img.promo],
    posted: 'Not published',
    views: 0,
  },
};

const a = (candidateId: string, status: ApplicantStatus, when: string, ago: number, extra: Partial<Applicant> = {}): Applicant => ({ candidateId, status, when, ago, ...extra });

/** Applicants per vacancy (EmpApplicants: New · Accepted · Declined). */
export const initialApplicants: Record<string, Applicant[]> = {
  mv1: [
    a('c2', 'new', '5 min', 5, { note: 'I host events too and would love to try a boat party.' }),
    a('c20', 'new', '12 min', 12, { note: 'Played boat parties for Xclusive Yachts all summer, house and nu-disco.' }),
    a('c27', 'new', '2 h', 120),
    a('c13', 'accepted', 'Yesterday', 1500),
    a('c37', 'accepted', 'Yesterday', 1600),
    a('c12', 'declined', '2 days', 2900, { declinedNote: 'Declined yesterday · plays live bass, not DJ sets' }),
  ],
  mv2: [
    a('c56', 'new', '4 min', 4, { note: 'Five years in DIFC lounges, available every weekend.' }),
    a('c19', 'new', '38 min', 38),
    a('c57', 'new', '1 h', 60, { note: 'I can start next week and work evenings.' }),
    a('c49', 'new', '3 h', 180),
    a('c53', 'new', '5 h', 300),
    a('c2', 'accepted', 'Yesterday', 1440),
    a('c25', 'accepted', '2 days', 2880),
    a('c21', 'accepted', '2 days', 3000),
    a('c16', 'declined', 'Yesterday', 1500, { declinedNote: 'Declined yesterday · no Arabic' }),
    a('c38', 'declined', '3 days', 4300, { declinedNote: 'Declined 2 days ago · not available on weekends' }),
  ],
  mv4: [
    a('c3', 'accepted', '27 Sep', 29000),
    a('c54', 'accepted', '26 Sep', 30000),
    a('c32', 'accepted', '25 Sep', 31000),
    a('c42', 'declined', '24 Sep', 32000, { declinedNote: 'Declined 24 Sep' }),
    a('c55', 'declined', '23 Sep', 33000, { declinedNote: 'Declined 23 Sep' }),
  ],
  mv5: [a('c35', 'accepted', '18 Sep', 40000), a('c46', 'declined', '17 Sep', 41000, { declinedNote: 'Declined 17 Sep' }), a('c39', 'declined', '16 Sep', 42000, { declinedNote: 'Declined 16 Sep' })],
  mv6: [a('c10', 'accepted', '10 Sep', 49000), a('c47', 'accepted', '9 Sep', 50000), a('c59', 'declined', '8 Sep', 51000, { declinedNote: 'Declined 8 Sep' })],
};

/** "Hostess · 5 yrs · Arabic, English" */
export function applicantLine(c: Candidate) {
  const yrs = profileOf(c).total.split(' ').slice(0, 2).join(' ');
  return [c.role.split(',')[0], yrs, c.languages.join(', ')].filter(Boolean).join(' · ');
}

export const candidateOf = (x: Applicant) => findCandidate(x.candidateId)!;

/** The share sheet speaks the public vacancy shape. */
export const asPublicVacancy = (v: { id: string; title: string; cover: Img; urgentLeft?: string }, d: VacancyDetail, company: { name: string; initials: string; verified: boolean }): Vacancy => ({
  id: v.id,
  title: v.title,
  company: { id: 'me', name: company.name, initials: company.initials, verified: company.verified },
  sphere: 'hospitality',
  city: d.city,
  country: d.country,
  pay: { amount: d.amount ?? 0, currency: 'AED', contract: d.contract },
  urgent: !!v.urgentLeft,
  postedAgo: d.posted,
  views: d.views,
  cover: v.cover,
  photos: d.photos,
  details: { role: d.role },
  description: d.description,
  requirements: d.requirements,
});
