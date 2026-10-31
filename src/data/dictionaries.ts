type Colors = Record<string, string>;

import type { ContractType, Country, Sphere } from './types';

export const contractTypes: Record<ContractType, { label: string; suffix: string; tone: 'blue' | 'green' }> = {
  'one-time': { label: 'One-time', suffix: 'one-time', tone: 'blue' },
  'fixed-term': { label: 'Fixed term', suffix: 'fixed term', tone: 'blue' },
  monthly: { label: 'Monthly', suffix: '/ month', tone: 'green' },
  weekly: { label: 'Weekly', suffix: '/ week', tone: 'green' },
  daily: { label: 'Daily', suffix: '/ day', tone: 'green' },
  hourly: { label: 'Hourly', suffix: '/ hour', tone: 'green' },
};

/** Label colours: blue for one-off contracts, green for recurring. Orange is reserved for Premium. */
export const contractLabelColors: Record<'blue' | 'green', { back: keyof Colors; text: keyof Colors }> = {
  blue: { back: 'primarySecondary', text: 'link' },
  green: { back: 'successBack', text: 'successText' },
};

export const spheres: Record<Sphere, string> = {
  hospitality: 'Hospitality',
  fnb: 'F&B',
  events: 'Events',
  modeling: 'Modeling',
  music: 'Music',
  beauty: 'Beauty',
};

export const vacancySpheres: Sphere[] = ['hospitality', 'fnb', 'events', 'modeling', 'music', 'beauty'];
export const talentSpheres: { key: Sphere; label: string }[] = [
  { key: 'hospitality', label: 'Hospitality' },
  { key: 'modeling', label: 'Models' },
  { key: 'events', label: 'Events' },
  { key: 'music', label: 'Music' },
  { key: 'beauty', label: 'Beauty' },
];

export const popularCountries: Country[] = [
  { code: 'AE', name: 'United Arab Emirates', dial: '+971' },
  { code: 'SA', name: 'Saudi Arabia', dial: '+966' },
  { code: 'QA', name: 'Qatar', dial: '+974' },
  { code: 'KW', name: 'Kuwait', dial: '+965' },
  { code: 'BH', name: 'Bahrain', dial: '+973' },
  { code: 'OM', name: 'Oman', dial: '+968' },
  { code: 'IN', name: 'India', dial: '+91' },
  { code: 'PH', name: 'Philippines', dial: '+63' },
  { code: 'KZ', name: 'Kazakhstan', dial: '+7' },
  { code: 'KG', name: 'Kyrgyzstan', dial: '+996' },
  { code: 'RU', name: 'Russia', dial: '+7' },
  { code: 'GB', name: 'United Kingdom', dial: '+44' },
];

/**
 * National number masks by dial code: digit groups and a sample number for the placeholder.
 * The field takes exactly as many digits as the country uses, so +7 numbers (10 digits) fit as well as UAE ones (9).
 */
const PHONE_MASKS: Record<string, { groups: number[]; sample: string }> = {
  '+971': { groups: [2, 3, 4], sample: '50 000 0000' },
  '+966': { groups: [2, 3, 4], sample: '50 000 0000' },
  '+974': { groups: [4, 4], sample: '3000 0000' },
  '+965': { groups: [4, 4], sample: '5000 0000' },
  '+973': { groups: [4, 4], sample: '3600 0000' },
  '+968': { groups: [4, 4], sample: '9000 0000' },
  '+91': { groups: [5, 5], sample: '98765 43210' },
  '+63': { groups: [3, 3, 4], sample: '917 000 0000' },
  '+7': { groups: [3, 3, 2, 2], sample: '700 000 00 00' },
  '+996': { groups: [3, 3, 3], sample: '700 000 000' },
  '+44': { groups: [4, 6], sample: '7400 000000' },
};
const DEFAULT_MASK = { groups: [3, 3, 4], sample: '000 000 0000' };
export const phoneMask = (dial: string) => PHONE_MASKS[dial] ?? DEFAULT_MASK;
/** Digits in a full national number for this dial code. */
export const phoneLength = (dial: string) => phoneMask(dial).groups.reduce((a, b) => a + b, 0);
/** "50 123 4567" for +971, "701 234 56 78" for +7 … */
export function formatPhone(digits: string, dial = '+971') {
  const out: string[] = [];
  let i = 0;
  for (const g of phoneMask(dial).groups) {
    if (i >= digits.length) break;
    out.push(digits.slice(i, i + g));
    i += g;
  }
  return out.join(' ');
}

export const formatAmount = (n: number) => n.toLocaleString('en-US').replace(/,/g, ' ');
