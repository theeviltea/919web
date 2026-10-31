import type { Img } from './asset';

import type { IconName } from '../lib/icon';

// Employer chats (EmpChat*): one chat per candidate, split into contexts — Direct and one per vacancy.

export type EmpMsg =
  | { id: string; kind: 'text'; mine: boolean; text: string; time: string; quote?: { author: string; text: string } }
  | { id: string; kind: 'photos'; mine: boolean; photos: Img[]; text?: string; time: string }
  | { id: string; kind: 'vacancy'; mine: boolean; vacancyId: string; time: string }
  | { id: string; kind: 'location'; mine: boolean; title: string; address: string; time: string }
  | { id: string; kind: 'contact'; mine: boolean; name: string; phone?: string; email?: string; time: string }
  | { id: string; kind: 'event'; tone: 'success' | 'danger' | 'info'; icon?: IconName; text: string; time: string }
  /** "Continue in the vacancy chat" link in Direct. */
  | { id: string; kind: 'link'; text: string; ctx: string }
  | { id: string; kind: 'date'; label: string };

export type NewEmpMsg = EmpMsg extends infer M ? (M extends EmpMsg ? Omit<M, 'id'> : never) : never;

let seq = 0;
const m = (x: NewEmpMsg): EmpMsg => ({ ...x, id: `m${++seq}` }) as EmpMsg;
export const withId = m;

/** Seed conversations, keyed by thread id, then by context ('direct' or a vacancy id). */
export const initialChats: Record<string, Record<string, EmpMsg[]>> = {
  e1: {
    direct: [
      m({ kind: 'date', label: '2 Oct' }),
      m({ kind: 'event', tone: 'info', icon: 'message', text: 'You started a direct chat from Talent', time: '11:20' }),
      m({ kind: 'text', mine: true, text: 'Hi Angela! We loved your video. Would you like to host at our rooftop lounge?', time: '11:21' }),
      m({ kind: 'text', mine: false, text: 'Hi! Yes, sounds interesting 😊 What are the hours?', time: '11:40' }),
      m({ kind: 'text', mine: true, text: 'Evenings, 4 days a week. Here is the vacancy:', time: '11:42' }),
      m({ kind: 'vacancy', mine: true, vacancyId: 'mv2', time: '11:42' }),
      m({ kind: 'event', tone: 'success', icon: 'briefcase', text: 'Angela applied to Hostess, rooftop lounge', time: '12:05' }),
      m({ kind: 'link', text: 'Continue in the vacancy chat', ctx: 'mv2' }),
    ],
    mv2: [
      m({ kind: 'date', label: 'Yesterday' }),
      m({ kind: 'event', tone: 'info', text: 'Angela applied to your vacancy', time: '18:02' }),
      m({ kind: 'event', tone: 'success', text: 'You accepted the application', time: '18:40' }),
      m({ kind: 'text', mine: true, text: 'Hi Angela! Thanks for applying. Your video is great 👏', time: '18:41' }),
      m({ kind: 'vacancy', mine: true, vacancyId: 'mv2', time: '18:41' }),
      m({ kind: 'text', mine: true, text: 'Could you come for a trial day this week?', time: '18:42' }),
      m({ kind: 'date', label: 'Today' }),
      m({ kind: 'text', mine: false, text: 'Hi! Thank you so much 😊', time: '14:31' }),
      m({ kind: 'text', mine: false, text: 'Yes, I can come for a trial day on Friday', time: '14:35' }),
    ],
    mv1: [m({ kind: 'date', label: 'Today' }), m({ kind: 'event', tone: 'info', text: 'Angela applied to your vacancy', time: '14:30' })],
  },
  e2: {
    direct: [
      m({ kind: 'date', label: 'Today' }),
      m({ kind: 'event', tone: 'info', icon: 'message', text: 'You started a direct chat from Talent', time: '11:52' }),
      m({ kind: 'text', mine: true, text: 'Hi Ibrahim! Do you have a short video of you behind the bar?', time: '11:54' }),
      m({ kind: 'text', mine: false, text: 'Sure, recording one for you now 🎥', time: '12:08' }),
    ],
  },
  e12: {
    direct: [
      m({ kind: 'date', label: 'Today' }),
      m({ kind: 'event', tone: 'info', icon: 'message', text: 'You sent a contact request', time: '17:12' }),
      m({ kind: 'text', mine: true, text: 'Hi Mia! We’re hiring hostesses for a new rooftop lounge, evening work. Would you like to talk?', time: '17:12' }),
      m({ kind: 'event', tone: 'success', text: 'Mia accepted your request', time: '17:40' }),
      m({ kind: 'text', mine: false, text: 'Hi! Yes, I’m interested. What are the hours?', time: '17:41' }),
    ],
  },
  e9: {
    mv6: [
      m({ kind: 'date', label: '2 Oct' }),
      m({ kind: 'text', mine: true, text: 'Hi Mira! Are you free for the yacht event on Saturday?', time: '12:04' }),
      m({ kind: 'text', mine: false, text: 'Hi! Yes, I can do Saturday. What time?', time: '12:20' }),
      m({ kind: 'text', mine: true, text: 'From 6 pm to midnight. I’ll send details tomorrow.', time: '12:22' }),
    ],
  },
};

/** A plain history for threads without a seeded one: who applied, then the last message. */
export function fallbackChat(name: string, last: string, mine: boolean | undefined, time: string, direct: boolean): EmpMsg[] {
  const first = name.split(' ')[0];
  const day = /^\d\d:\d\d$/.test(time) ? 'Today' : time;
  const clock = /^\d\d:\d\d$/.test(time) ? time : '12:00';
  return [
    m({ kind: 'date', label: day }),
    direct
      ? m({ kind: 'event', tone: 'info', icon: 'message', text: 'You started a direct chat from Talent', time: clock })
      : m({ kind: 'event', tone: 'info', text: `${first} applied to your vacancy`, time: clock }),
    ...(last ? [m({ kind: 'text', mine: !!mine, text: last, time: clock })] : []),
  ];
}

/** Canned replies while the demo candidate is "online". */
export const candidateReplies = ['Great, thank you!', 'Sounds good 👍', 'Perfect, see you then!', 'Thanks! Let me check my schedule.'];
