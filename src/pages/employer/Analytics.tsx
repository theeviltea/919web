// Employer analytics: the Analytics tab of Vacancies (views, who viewed and when, sources) and the views card on a vacancy page.
import { useMemo, useState } from 'react';
import { useEmployer, type MyVacancy } from '../../data/employer';
import { SOURCES, ago, completenessOf, matchOne, matchesFor, statsOf, viewersOf, viewsSeries, type Viewer } from '../../data/vacancyStats';
import type { Candidate } from '../../data/talentPool';
import { Link } from '../../lib/links';
import { Avatar, Card, H2, Icon, Pill, TierBadge } from '../../ui/kit';
import { StatusPill } from './Vacancies';

const fmt = (n: number) => n.toLocaleString('en').replace(/,/g, ' ');
const pct = (x: number) => `${(x * 100).toFixed(1)}%`;
const DAY = (back: number) => {
  const d = new Date(Date.UTC(2026, 9, 9) - back * 864e5);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });
};

function useApplied() {
  const e = useEmployer();
  return useMemo(() => Object.fromEntries(Object.entries(e.applicants).map(([k, xs]) => [k, xs.map((x) => x.candidateId)])), [e.applicants]);
}

/** Views per day as bars; the last bar is today. */
function Bars({ values, days, label }: { values: number[]; days: number; label: string }) {
  const max = Math.max(1, ...values);
  return (
    <div className="col g8">
      <div className="an-bars" role="img" aria-label={`${label}: ${values.join(', ')} views per day`}>
        {values.map((v, i) => (
          <span key={i} title={`${DAY(days - 1 - i)} · ${fmt(v)} views`} className={i === values.length - 1 ? 'today' : ''} style={{ height: `${Math.max(3, (v / max) * 100)}%` }} />
        ))}
      </div>
      <div className="row between small light">
        <span>{DAY(days - 1)}</span>
        <span>{DAY(Math.floor((days - 1) / 2))}</span>
        <span>Today</span>
      </div>
    </div>
  );
}

function ViewerRow({ x, vacancyTitle, showMatch = true }: { x: Viewer; vacancyTitle?: string; showMatch?: boolean }) {
  const e = useEmployer();
  const v = e.vacancies.find((y) => y.id === x.vacancyId);
  const m = showMatch && v ? matchOne(x.c, v) : null;
  return (
    <Link to={`/talent/${x.c.id}`} className="an-viewer">
      <Avatar src={x.c.photo} size={44} />
      <span className="grow" style={{ minWidth: 0 }}>
        <span className="row g6 s15 strong">
          <span className="ellipsis">{x.c.name}</span>
          <TierBadge tier={x.c.tier} size={16} />
        </span>
        <span className="small muted ellipsis" style={{ display: 'block', marginTop: 2 }}>
          {x.c.role.split(',')[0]} · {x.c.city}
          {vacancyTitle ? <> · viewed “{vacancyTitle}”</> : null}
        </span>
      </span>
      <span className="col" style={{ alignItems: 'flex-end', gap: 4, flex: 'none' }}>
        <span className="small muted">
          {ago(x.minutesAgo)}
          {x.times > 1 ? ` · ${x.times}×` : ''}
        </span>
        <span className="row g6">
          {m && m.score >= 70 ? <Pill tone="blue">{m.score}% match</Pill> : null}
          {x.applied ? (
            <Pill tone="green" icon="check">
              Applied
            </Pill>
          ) : (
            <Pill tone="gray">Didn’t apply</Pill>
          )}
        </span>
      </span>
    </Link>
  );
}

/** Vacancies › Analytics: the dashboard over all vacancies. */
export function VacancyAnalytics({ initial }: { initial?: string }) {
  const e = useEmployer();
  const applied = useApplied();
  const [days, setDays] = useState<7 | 14>(7);
  const [only, setOnly] = useState<string>(initial ?? 'all');
  const [who, setWho] = useState<'all' | 'applied' | 'not'>('all');
  // Active vacancies, plus archived ones that still got views in the chosen period.
  const live = e.vacancies.filter((v) => v.status === 'active' || (v.status === 'archive' && viewsSeries(v, days).some((x) => x > 0)));
  const rows = live.map((v) => ({ v, s: statsOf(v, days, (e.applicants[v.id] ?? []).length || v.applicants || 0) }));
  const pick = only === 'all' ? rows : rows.filter((r) => r.v.id === only);
  const sum = (k: 'views' | 'viewers' | 'applications' | 'saves') => pick.reduce((a, r) => a + r.s[k], 0);
  const series = Array.from({ length: days }, (_, i) => pick.reduce((a, r) => a + viewsSeries(r.v, days)[i], 0));
  const prev = Math.round(sum('views') * 0.86);
  const viewers = viewersOf(e.vacancies, applied).filter((x) => (only === 'all' || x.vacancyId === only) && (who === 'all' || (who === 'applied' ? x.applied : !x.applied)));
  const title = (id: string) => e.vacancies.find((v) => v.id === id)?.title ?? '';
  const conv = sum('viewers') ? sum('applications') / sum('viewers') : 0;
  const kpis = [
    ['Views', fmt(sum('views')), `+${Math.round((sum('views') / Math.max(1, prev) - 1) * 100)}% vs previous ${days} days`],
    ['Unique viewers', fmt(sum('viewers')), 'signed-in job seekers and guests'],
    ['Applications', fmt(sum('applications')), `${sum('saves')} saved a vacancy`],
    ['View → apply', pct(conv), 'of unique viewers applied'],
  ];
  return (
    <div className="col g16 mt24">
      <div className="row between wrap g12">
        <div className="chips" style={{ margin: 0 }}>
          <button className={`chip${only === 'all' ? ' on' : ''}`} onClick={() => setOnly('all')}>
            All vacancies
          </button>
          {live.map((v) => (
            <button key={v.id} className={`chip${only === v.id ? ' on' : ''}`} onClick={() => setOnly(v.id)}>
              {v.title}
            </button>
          ))}
        </div>
        <div className="tabs" role="tablist" style={{ flex: 'none' }}>
          {([7, 14] as const).map((d) => (
            <button key={d} role="tab" aria-selected={days === d} className={`tab${days === d ? ' on' : ''}`} onClick={() => setDays(d)}>
              {d} days
            </button>
          ))}
        </div>
      </div>
      <div className="grid4">
        {kpis.map(([k, n, s]) => (
          <div key={k} className="stat">
            <div className="s14 semi muted">{k}</div>
            <div className="n" style={{ marginTop: 4 }}>
              {n}
            </div>
            <div className="small muted" style={{ marginTop: 2 }}>
              {s}
            </div>
          </div>
        ))}
      </div>
      <div className="an-grid">
        <Card style={{ gap: 16 }}>
          <H2 right={<span className="s14 muted">last {days} days</span>}>Views per day</H2>
          <Bars values={series} days={days} label="Views per day" />
        </Card>
        <Card style={{ gap: 12 }}>
          <H2 right={<span className="s14 muted">share of views</span>}>Where views come from</H2>
          {SOURCES.map(([k, v]) => (
            <div key={k} className="col g6">
              <div className="row between s14">
                <span className="semi">{k}</span>
                <span className="muted">{v}%</span>
              </div>
              <div className="an-track">
                <span style={{ width: `${v}%` }} />
              </div>
            </div>
          ))}
        </Card>
      </div>
      <div className="an-grid">
        <Card style={{ gap: 4 }}>
          <H2 right={<span className="s14 muted">{viewers.length} people</span>}>Who viewed</H2>
          <div className="tabs" role="tablist" style={{ alignSelf: 'flex-start', margin: '8px 0' }}>
            {(
              [
                ['all', 'Everyone'],
                ['not', 'Didn’t apply'],
                ['applied', 'Applied'],
              ] as const
            ).map(([k, l]) => (
              <button key={k} role="tab" aria-selected={who === k} className={`tab${who === k ? ' on' : ''}`} onClick={() => setWho(k)}>
                {l}
              </button>
            ))}
          </div>
          {viewers.slice(0, 12).map((x) => (
            <ViewerRow key={x.c.id + x.vacancyId} x={x} vacancyTitle={only === 'all' ? title(x.vacancyId) : undefined} />
          ))}
          {!viewers.length ? <p className="muted s14" style={{ padding: '12px 0' }}>Nobody here yet.</p> : null}
          <p className="small muted" style={{ paddingTop: 10 }}>
            Guests and people who hid their profile count in views but aren’t listed. Didn’t apply? You can message them first from their profile.
          </p>
        </Card>
        <Card style={{ gap: 0 }}>
          <H2>By vacancy</H2>
          <div className="an-table">
            <div className="an-tr head">
              <span>Vacancy</span>
              <span>Views</span>
              <span>Applied</span>
              <span>Rate</span>
            </div>
            {rows.map(({ v, s }) => (
              <Link key={v.id} to={`/my-vacancy/${v.id}`} className="an-tr">
                <span className="col" style={{ gap: 4, minWidth: 0, alignItems: 'flex-start' }}>
                  <span className="semi ellipsis" style={{ maxWidth: '100%' }}>{v.title}</span>
                  <StatusPill v={v} />
                </span>
                <span className="tnum">
                  {fmt(s.views)}
                </span>
                <span className="tnum">
                  {s.applications}
                </span>
                <span className="tnum">
                  {pct(s.conversion)}
                </span>
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

/** Views card on the employer's own vacancy page: totals, a 7-day chart and the latest viewers. */
export function VacancyViewsCard({ v }: { v: MyVacancy }) {
  const e = useEmployer();
  const applied = useApplied();
  if (v.status !== 'active' && v.status !== 'archive') return null;
  const s = statsOf(v, 7, (e.applicants[v.id] ?? []).length || v.applicants || 0);
  const people = viewersOf([v], applied).slice(0, 4);
  return (
    <Card style={{ gap: 14 }}>
      <H2 right={<Link to={`/hire/vacancies?tab=analytics&v=${v.id}`} className="link s14">Analytics</Link>}>Views</H2>
      <div className="row g20">
        {(
          [
            [fmt(s.views), 'views · 7 days'],
            [fmt(s.viewers), 'people'],
            [pct(s.conversion), 'applied'],
          ] as const
        ).map(([n, l]) => (
          <div key={l}>
            <div className="display" style={{ fontSize: 22 }}>
              {n}
            </div>
            <div className="small muted">{l}</div>
          </div>
        ))}
      </div>
      <Bars values={viewsSeries(v, 7)} days={7} label={`Views of ${v.title}`} />
      {people.length ? (
        <div className="col" style={{ gap: 0 }}>
          <div className="s14 strong" style={{ marginTop: 4 }}>
            Recently viewed
          </div>
          {people.map((x) => (
            <ViewerRow key={x.c.id} x={x} showMatch={false} />
          ))}
        </div>
      ) : null}
    </Card>
  );
}

/** Candidate profile, employer view: how complete the profile is. */
export function CompletenessCard({ c }: { c: Candidate }) {
  const p = completenessOf(c);
  const tone = p.pct >= 85 ? 'var(--success-strong)' : p.pct >= 60 ? 'var(--primary)' : 'var(--warning)';
  return (
    <Card style={{ gap: 12 }}>
      <H2 right={<span className="s16 strong">{p.pct}%</span>}>Profile filled</H2>
      <div className="an-track" style={{ height: 8 }} role="progressbar" aria-valuenow={p.pct} aria-valuemin={0} aria-valuemax={100} aria-label="Profile filled">
        <span style={{ width: `${p.pct}%`, background: tone }} />
      </div>
      {p.missing.length ? (
        <div className="s14 muted lh">
          Not added yet: <span className="primary-text">{p.missing.join(', ').toLowerCase()}</span>
        </div>
      ) : (
        <div className="s14 muted">Everything is filled in: photos, video, experience and details.</div>
      )}
    </Card>
  );
}

/** Candidate profile, employer view: fit with the employer's open vacancies. Not shown when nothing fits. */
export function MatchCard({ c }: { c: Candidate }) {
  const e = useEmployer();
  const ms = matchesFor(c, e.vacancies);
  const [open, setOpen] = useState(0);
  if (!ms.length) return null;
  const label = (n: number) => (n >= 85 ? 'Strong match' : n >= 70 ? 'Good match' : 'Partial match');
  return (
    <Card style={{ gap: 4 }}>
      <H2 right={<span className="s14 muted">{ms.length === 1 ? '1 vacancy' : `${ms.length} vacancies`}</span>}>Fits your vacancies</H2>
      {ms.map((m, i) => (
        <div key={m.v.id} className="an-match">
          <button className="row g12" style={{ width: '100%', textAlign: 'left', padding: '12px 0' }} aria-expanded={open === i} onClick={() => setOpen(open === i ? -1 : i)}>
            <span className="an-ring" style={{ ['--p' as string]: m.score }} aria-hidden="true">
              <span>{m.score}</span>
            </span>
            <span className="grow" style={{ minWidth: 0 }}>
              <span className="s15 strong ellipsis" style={{ display: 'block' }}>
                {m.v.title}
              </span>
              <span className="small muted">
                {label(m.score)} · {m.score}%
              </span>
            </span>
            <span style={{ display: 'flex', transform: open === i ? 'rotate(180deg)' : undefined }}><Icon name="chevron-down" size={18} /></span>
          </button>
          {open === i ? (
            <ul className="col g6" style={{ padding: '0 0 12px 56px' }}>
              {m.checks.map((x) => (
                <li key={x.label} className="row g8 s14" style={{ color: x.ok ? 'var(--text-primary)' : 'var(--text-body)' }}>
                  <span style={{ color: x.ok ? 'var(--success-text)' : 'var(--danger-text)', display: 'flex' }}>
                    <Icon name={x.ok ? 'check' : 'cancel'} size={16} />
                  </span>
                  {x.label}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ))}
    </Card>
  );
}
