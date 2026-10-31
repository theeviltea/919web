// Image map for the web build. Accelerator licensing rule: people are shown ONLY with the 11 purchased stock photos
// (src/assets/people). Every mock path from the app data layer resolves to one of them, or to a city photo.
import fDj from '../assets/people/f-dj.webp';
import fGuitarAcoustic from '../assets/people/f-guitar-acoustic.webp';
import fGuitarElectric from '../assets/people/f-guitar-electric.webp';
import fGuitarHat from '../assets/people/f-guitar-hat.webp';
import fHeadphones from '../assets/people/f-headphones.webp';
import fMakeup from '../assets/people/f-makeup.webp';
import fPhotographer from '../assets/people/f-photographer.webp';
import fPinkSkirt from '../assets/people/f-pink-skirt.webp';
import fVideographer from '../assets/people/f-videographer.webp';
import fYellowLips from '../assets/people/f-yellow-lips.webp';
import fYellowSuit from '../assets/people/f-yellow-suit.webp';
import dubai1 from '../assets/img/dubai1.jpg';
import dubai2 from '../assets/img/dubai2.jpg';

export type Img = string;

export const stock = {
  'f-dj': fDj,
  'f-guitar-acoustic': fGuitarAcoustic,
  'f-guitar-electric': fGuitarElectric,
  'f-guitar-hat': fGuitarHat,
  'f-headphones': fHeadphones,
  'f-makeup': fMakeup,
  'f-photographer': fPhotographer,
  'f-pink-skirt': fPinkSkirt,
  'f-videographer': fVideographer,
  'f-yellow-lips': fYellowLips,
  'f-yellow-suit': fYellowSuit,
} as const;
export const city = { dubai1, dubai2 };

export const FEMALE: Img[] = [fPinkSkirt, fYellowSuit, fMakeup, fPhotographer, fYellowLips, fDj];
export const MALE: Img[] = [fHeadphones, fGuitarElectric, fGuitarHat, fGuitarAcoustic, fVideographer];

// Mia (the demo seeker) is f-yellow-suit everywhere; p9/p10/p14 are men in the app data.
const FIXED: Record<string, Img> = { p1: fYellowSuit, p12: fYellowSuit, p9: fGuitarHat, p10: fHeadphones, p14: fGuitarElectric, dj: fDj, waiter: fMakeup, misc: fPhotographer, barber: fGuitarHat, hostess: dubai1, dubai1, dubai2, v11: dubai2, v14: dubai1 };
const hash = (s: string) => [...s].reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) >>> 0, 7);

/** Resolves an app image path ("mock/people/p3.jpg", "stock/f-dj.webp") to a licensed web asset. */
export function asset(path: string): Img {
  const key = path.split('/').pop()!.replace(/\.(jpg|png|webp)$/, '');
  if (key in stock) return stock[key as keyof typeof stock];
  if (FIXED[key]) return FIXED[key];
  return FEMALE[hash(key) % FEMALE.length];
}

/** A licensed photo that matches the person's gender, stable per id. */
export function personFor(id: string, gender: 'female' | 'male' = 'female'): Img {
  const pool = gender === 'male' ? MALE : FEMALE;
  return pool[hash(id) % pool.length];
}
