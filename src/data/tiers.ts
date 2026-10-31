/**
 * Seeker subscription tiers (product rules §12). Free has no badge; Premium = blue star badge;
 * Max = gold star badge + a gradient frame of the seeker's choice, always first for employers.
 * Mock assignment by first name so every screen shows the same person with the same tier.
 */
export type Tier = 'free' | 'premium' | 'max';
export type FrameStyle = 'gold' | 'ocean' | 'neon';

const MAX = new Set(['Akmed', 'Angela', 'Ibrahim', 'Layla', 'Lucas', 'Sofia', 'Sveta', 'Wakako', 'Mia']);
const PREMIUM = new Set(['Nadia', 'Nour', 'Mira', 'Janet', 'Zoey', 'Omar']);
const FREE = new Set(['Elena', 'Chen', 'Tara', 'Rita', 'Daria', 'Kira', 'Anna', 'Zaurbek']);

// Full-name overrides (People section) win over the first-name sets.
const BY_NAME: Record<string, Tier> = {
  'Sara M.': 'max',
  'Karim A.': 'max',
  'Lina M.': 'max',
  'Omar S.': 'max',
  'Zara K.': 'max',
  'Leo P.': 'max',
  'Ali R.': 'max',
  'Yusuf N.': 'max',
  'Olivia G.': 'premium',
};

const first = (name: string) => name.trim().split(/\s+/)[0].replace(/[.,]/g, '');
const sum = (s: string) => [...s].reduce((a, ch) => a + ch.charCodeAt(0), 0);

export function tierOf(name: string): Tier {
  if (BY_NAME[name.trim()]) return BY_NAME[name.trim()];
  const k = first(name);
  if (MAX.has(k)) return 'max';
  if (PREMIUM.has(k)) return 'premium';
  if (FREE.has(k)) return 'free';
  return sum(k) % 3 === 0 ? 'premium' : 'free';
}

export function frameOf(name: string): FrameStyle {
  return (['gold', 'ocean', 'neon'] as const)[sum(first(name)) % 3];
}

/** Gradient stops of each Max frame (the design uses a conic gradient; native draws them as a sweep of linear stops). */
export const frameStops: Record<FrameStyle, string[]> = {
  gold: ['#FFE27A', '#FFB800', '#FF8652', '#FFE27A'],
  ocean: ['#7CF2D4', '#00C2FF', '#3589F2', '#7CF2D4'],
  neon: ['#FF1E54', '#7A3FD1', '#3589F2', '#FF1E54'],
};

/** Employer sort: Max first, then Premium, then Free. */
export const tierRank = (t: Tier) => (t === 'max' ? 2 : t === 'premium' ? 1 : 0);
