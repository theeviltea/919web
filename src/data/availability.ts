// "Available today" (product rules §14): a job seeker who can start work within 24 hours turns it on, and employers
// see them in the Today tab of Find talent. It turns itself off after 24 hours; an hour before that the seeker gets
// a push to extend it. Only verified companies can message people who are available today.

export type Slot = 'any' | 'morning' | 'afternoon' | 'evening' | 'night';
export const SLOTS: Slot[] = ['any', 'morning', 'afternoon', 'evening', 'night'];
export const slotLabels: Record<Slot, string> = { any: 'Any time', morning: 'Morning', afternoon: 'Afternoon', evening: 'Evening', night: 'Night' };

export const AVAIL_MS = 24 * 60 * 60 * 1000;
/** The "Still available today?" push goes out this long before the status ends. */
export const AVAIL_REMIND_MS = 60 * 60 * 1000;

/** "Any time" is exclusive: picking it clears the rest, picking a part of the day clears it. Nothing picked = any time. */
export function toggleSlot(list: Slot[], s: Slot): Slot[] {
  if (s === 'any') return ['any'];
  const rest: Slot[] = list.filter((x) => x !== 'any');
  const next = rest.includes(s) ? rest.filter((x) => x !== s) : [...rest, s];
  return next.length ? SLOTS.filter((x) => next.includes(x)) : ['any'];
}

export const slotsLabel = (list: Slot[]) => (!list.length || list.includes('any') ? 'Any time' : list.map((s) => slotLabels[s]).join(', '));

const hhmm = (d: Date) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
/** "until 19:57 tomorrow" / "until 23:40 today". */
export function untilLabel(until: number, now = Date.now()) {
  const d = new Date(until);
  const today = new Date(now).toDateString() === d.toDateString();
  return `until ${hhmm(d)} ${today ? 'today' : 'tomorrow'}`;
}

export type AvailStats = { views: number; messages: number; invites: number };
export type Avail = ({ on: true; until: number; slots: Slot[] } | { on: false }) & AvailStats;
export const availOff: Avail = { on: false, views: 0, messages: 0, invites: 0 };

/** "12 employers viewed you · 2 messages" — or a hint while nobody has looked yet. */
export function statsLine(s: AvailStats) {
  if (!s.views && !s.messages) return 'Employers can see you in the Today tab';
  const parts = [`${s.views} employer${s.views === 1 ? '' : 's'} viewed you`];
  if (s.messages) parts.push(`${s.messages} message${s.messages === 1 ? '' : 's'}`);
  return parts.join(' · ');
}
