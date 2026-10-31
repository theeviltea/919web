import type { Img } from './asset';

import type { FrameStyle, Tier } from './tiers';

/** Contract types — one dictionary for vacancy creation, filters, cards and the backend (product rules §7). */
export type ContractType = 'one-time' | 'fixed-term' | 'monthly' | 'weekly' | 'daily' | 'hourly';

export type Sphere = 'hospitality' | 'fnb' | 'events' | 'modeling' | 'music' | 'beauty';

export type Vacancy = {
  id: string;
  title: string;
  company: { id: string; name: string; initials: string; verified: boolean };
  sphere: Sphere;
  city: string;
  country: string;
  pay: { amount: number; currency: 'AED'; contract: ContractType };
  urgent: boolean;
  postedAgo: string;
  views: number;
  cover: Img;
  photos: Img[];
  details: { role: string; gender?: 'Female' | 'Male' | 'Any'; age?: string };
  description: string;
  requirements: string[];
};

export type Talent = {
  id: string;
  name: string; // first name + initial for guests: "Angela R."
  role: string;
  city: string;
  verified: boolean;
  premium: boolean;
  tier?: Tier;
  frame?: FrameStyle;
  sphere: Sphere;
  photo: Img;
  placeholder: 1 | 2 | 3 | 4 | 5;
};

export type Country = { code: string; name: string; dial: string; flag?: string };
