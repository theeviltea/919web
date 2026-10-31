// 919 domain components: vacancy rows, talent cards, the search hero, status chips.
import type { ReactNode } from 'react';
import { Link } from '../lib/links';
import { contractTypes, formatAmount, spheres } from '../data/dictionaries';
import type { AppStatus } from '../data/seeker';
import type { Candidate } from '../data/talentPool';
import type { ContractType, Vacancy } from '../data/types';
import type { FrameStyle, Tier } from '../data/tiers';
import pattern from '../assets/img/pattern-3d.jpg';
import { FRAMES, Icon, Pill, TierBadge } from './kit';

export const money = (amount?: number, currency = 'AED') => (amount === undefined ? 'Negotiable' : `${currency} ${formatAmount(amount)}`);

export function ContractPill({ c }: { c: ContractType }) {
  const t = contractTypes[c];
  return <Pill tone={t.tone}>{t.label}</Pill>;
}

export function AppliedPill({ status }: { status: AppStatus }) {
  if (status === 'pending') return <Pill tone="blue" icon="check">Applied</Pill>;
  if (status === 'accepted') return <Pill tone="green" icon="check">Accepted</Pill>;
  if (status === 'hired') return <Pill tone="green" icon="briefcase">Hired</Pill>;
  if (status === 'declined') return <Pill tone="gray">Not selected</Pill>;
  return <Pill tone="gray">Application closed</Pill>;
}

export const UrgentPill = () => (
  <Pill tone="urgent" icon="fire">
    Urgent
  </Pill>
);

export function VacancyRow({ v, to, status, saved, onSave }: { v: Vacancy; to: string; status?: AppStatus; saved?: boolean; onSave?: () => void }) {
  const t = contractTypes[v.pay.contract];
  return (
    <article className="vrow">
      <Link to={to} aria-label={v.title} style={{ display: 'contents' }}>
        <img className="cover" src={v.cover} alt="" />
        <div className="grow">
          <div className="s17 semi" style={{ lineHeight: 1.3, fontSize: 18 }}>
            {v.title}
          </div>
          <div className="s14 muted" style={{ marginTop: 4 }}>
            {v.company.name} · {v.city} · {spheres[v.sphere]}
          </div>
          {v.urgent || status ? (
            <div className="row wrap g6" style={{ marginTop: 10 }}>
              {v.urgent ? <UrgentPill /> : null}
              {status ? <AppliedPill status={status} /> : null}
            </div>
          ) : null}
        </div>
        <div className="pay">
          <div className="row base g6">
            <span className="s20 strong">{money(v.pay.amount)}</span>
            <span className="s14 muted">{t.suffix}</span>
          </div>
          <div className="row g8">
            <ContractPill c={v.pay.contract} />
            <span className="small muted">{v.postedAgo}</span>
          </div>
        </div>
      </Link>
      {onSave ? (
        <button className="iconbtn bm" aria-label={saved ? 'Remove from saved' : 'Save'} aria-pressed={saved} onClick={onSave} style={saved ? { color: 'var(--link)' } : undefined}>
          <Icon name={saved ? 'bookmark-filled' : 'bookmark'} size={18} />
        </button>
      ) : null}
    </article>
  );
}

export function FrameRing({ frame, radius = 20 }: { frame?: FrameStyle; radius?: number }) {
  if (!frame) return null;
  return <span className="frame" aria-hidden="true" style={{ background: FRAMES[frame], borderRadius: radius }} />;
}

export function TodayPill({ slot }: { slot: string }) {
  return (
    <span className="pill urgent" style={{ height: 24, padding: '0 8px 0 6px', gap: 3 }}>
      <Icon name="flash" size={13} />
      Today · {slot}
    </span>
  );
}

export function TalentCard({
  name,
  role,
  photo,
  tier,
  frame,
  today,
  to,
  saved,
  onSave,
}: {
  name: string;
  role: string;
  photo: string;
  tier?: Tier;
  frame?: FrameStyle;
  today?: string;
  to: string;
  saved?: boolean;
  onSave?: () => void;
}) {
  return (
    <article className="tcard">
      <FrameRing frame={frame} />
      <Link to={to} aria-label={`${name}, ${role}`} style={{ display: 'block', color: 'inherit' }}>
        <div className="ph">
          <img src={photo} alt="" />
          {tier && tier !== 'free' ? (
            <span className="tb">
              <TierBadge tier={tier} size={24} />
            </span>
          ) : null}
          {today ? (
            <span className="today">
              <TodayPill slot={today} />
            </span>
          ) : null}
        </div>
        <div className="meta">
          <div className="semi">{name}</div>
          <div className="small muted">{role}</div>
        </div>
      </Link>
      {onSave ? (
        <button className="bm" aria-label={saved ? 'Remove from saved' : 'Save'} aria-pressed={saved} onClick={onSave}>
          <Icon name={saved ? 'bookmark-filled' : 'bookmark'} size={16} />
        </button>
      ) : null}
    </article>
  );
}

export const candidateCard = (c: Candidate, to: string, extra?: { saved?: boolean; onSave?: () => void; today?: string }) => (
  <TalentCard key={c.id} name={c.name} role={`${c.role} · ${c.city}`} photo={c.photo} tier={c.tier} frame={c.frame} to={to} today={extra?.today} saved={extra?.saved} onSave={extra?.onSave} />
);

/** Compact blue search hero (desktop: one row; mobile: stacked). */
export function Hero({
  eyebrow,
  title,
  query,
  onQuery,
  placeholder,
  onSubmit,
  onFilters,
  filters = 0,
  city = 'Dubai',
}: {
  eyebrow: ReactNode;
  title: string;
  query: string;
  onQuery: (v: string) => void;
  placeholder: string;
  onSubmit: () => void;
  onFilters: () => void;
  filters?: number;
  city?: string;
}) {
  return (
    <section className="hero" style={{ marginTop: 0 }}>
      <img className="bg" src={pattern} alt="" aria-hidden="true" />
      <div className="t">
        <div className="s14" style={{ opacity: 0.9 }}>
          {eyebrow}
        </div>
        <h1 className="display" style={{ fontSize: 26, marginTop: 4, whiteSpace: 'nowrap' }}>
          {title}
        </h1>
      </div>
      <form
        className="search"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <label className="q grow">
          <Icon name="search" />
          <input value={query} onChange={(e) => onQuery(e.target.value)} placeholder={placeholder} aria-label={placeholder} />
        </label>
        <span className="city desk-only">
          <Icon name="location" size={18} />
          {city}
          <Icon name="chevron-down" size={16} />
        </span>
      </form>
      <button className="filterbtn" onClick={onFilters}>
        <Icon name="filter" />
        Filters
        {filters ? <span className="n">{filters}</span> : null}
      </button>
      <button className="btn ink h56 go" style={{ height: 56, borderRadius: 16, padding: '0 26px' }} onClick={onSubmit}>
        Search
      </button>
    </section>
  );
}

export function SphereChips<T extends string>({ items, value, onChange, urgent, onUrgent }: { items: { key: T; label: string; n?: number }[]; value: T | 'all'; onChange: (k: T | 'all') => void; urgent?: boolean; onUrgent?: () => void }) {
  return (
    <div className="chips scroll">
      <button className={`chip${value === 'all' && !urgent ? ' on' : ''}`} onClick={() => onChange('all')}>
        All
      </button>
      {onUrgent ? (
        <button className={`chip urgent`} aria-pressed={urgent} onClick={onUrgent} style={urgent ? { boxShadow: 'inset 0 0 0 2px #18191C' } : undefined}>
          <Icon name="fire" size={16} />
          Urgent
        </button>
      ) : null}
      {items.map((s) => (
        <button key={s.key} className={`chip${value === s.key ? ' on' : ''}`} onClick={() => onChange(s.key)}>
          {s.label}
          {s.n !== undefined ? <span className="n">{s.n}</span> : null}
        </button>
      ))}
    </div>
  );
}
