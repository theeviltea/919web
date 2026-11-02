// Vacancy page for guests and job seekers: gallery, details, requirements fit, Respond → apply / gate / limit / sign in.
import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { findVacancy } from '../../data/mock';
import { contractTypes, spheres } from '../../data/dictionaries';
import { fieldByKey } from '../../data/registration';
import { companySlug } from '../../data/companies';
import { completeness, FREE_APPLY_LIMIT, matchRequirement, missingForApply, sphereToField, useSeeker } from '../../data/seeker';
import { useSession } from '../../data/session';
import type { Vacancy } from '../../data/types';
import { Link } from '../../lib/links';
import { AppliedPill, money, UrgentPill } from '../../ui/domain';
import { PhotoViewer } from './People';
import { Btn, Card, Crumbs, H2, Icon, Initials, Modal, ModalHead, Pill, useToast } from '../../ui/kit';

const QUICK = ['I can start this week', 'I have similar experience', 'Available on weekends'];

export function ApplyModal({ v, onClose, onSent }: { v: Vacancy; onClose: () => void; onSent: () => void }) {
  const s = useSeeker();
  const [m, setM] = useState('');
  return (
    <Modal onClose={onClose} label="Apply to this vacancy" width={560}>
      <ModalHead title="Apply to this vacancy" sub={`${v.title} · ${v.company.name}`} onClose={onClose} />
      <div>
        <div className="s14 strong" style={{ marginBottom: 8 }}>
          Message to the employer <span className="muted semi">· optional</span>
        </div>
        <label className="field area">
          <textarea value={m} onChange={(e) => setM(e.target.value.slice(0, 500))} rows={4} placeholder="Tell them why you’re a good fit or when you can start" aria-label="Message to the employer" autoFocus />
        </label>
      </div>
      <div className="chips">
        {QUICK.map((q) => (
          <button key={q} className="chip" style={{ height: 36 }} onClick={() => setM(m ? `${m} ${q}` : q)}>
            {q}
          </button>
        ))}
      </div>
      <div className="row g10 inset s14 primary-text">
        <Icon name="view" size={18} />
        The employer will see your profile, photos and video presentation.
      </div>
      {s.plan === 'free' ? (
        <div className="small muted">
          Free plan: {s.appsUsed + 1} of {FREE_APPLY_LIMIT} applications this month.
        </div>
      ) : null}
      <Btn
        h={56}
        full
        onClick={() => {
          s.apply(v.id, m.trim());
          onSent();
        }}
      >
        Send application
      </Btn>
    </Modal>
  );
}

function GuestAuthModal({ v, onClose }: { v: Vacancy; onClose: () => void }) {
  const { setReturn } = useSession();
  const nav = useNavigate();
  const go = (to: string) => {
    setReturn(`/vacancy/${v.id}`, 'seeker');
    nav(to);
  };
  return (
    <Modal onClose={onClose} label="Sign in to apply" width={480}>
      <ModalHead title="Sign in to apply" sub="Your application goes out right after you sign in." onClose={onClose} />
      <div className="row g14 inset" style={{ borderRadius: 18 }}>
        <Initials text={v.company.initials} size={48} radius={14} />
        <div>
          <div className="s16 strong">{v.title}</div>
          <div className="s14 muted" style={{ marginTop: 2 }}>
            {v.company.name} · {money(v.pay.amount)} {contractTypes[v.pay.contract].suffix}
          </div>
        </div>
      </div>
      <Btn h={56} full icon="phone" onClick={() => go('/auth/sign-in')}>
        Sign in with phone
      </Btn>
      <Btn kind="secondary" h={52} full icon="mail" onClick={() => go('/auth/email')}>
        Sign in with email
      </Btn>
      <div className="s14 muted" style={{ textAlign: 'center' }}>
        New to 919?{' '}
        <button className="link" onClick={() => go('/auth/register')}>
          Create account
        </button>
        <div className="small" style={{ marginTop: 4 }}>
          The account will be created as a job seeker
        </div>
      </div>
    </Modal>
  );
}

function GateModal({ v, onClose }: { v: Vacancy; onClose: () => void }) {
  const s = useSeeker();
  const items = missingForApply(s.profile, v, fieldByKey(sphereToField[v.sphere]).label);
  const pct = Math.max(10, Math.min(completeness(s.profile).percent, Math.round(((4 - items.length) / 4) * 100)));
  return (
    <Modal onClose={onClose} label="Complete your profile to apply" width={520}>
      <ModalHead title="Complete your profile to apply" sub="Employers decide by your profile. Add these and your application goes through in one tap." onClose={onClose} />
      <div style={{ height: 8, borderRadius: 999, background: 'var(--back-darker)' }}>
        <div style={{ width: `${pct}%`, height: 8, borderRadius: 999, background: 'var(--primary)' }} />
      </div>
      {items.map((i) => (
        <Link key={i.key} to={i.key === 'photo' ? '/profile/personal' : i.key === 'field' ? '/profile/professional' : '/profile/general'} className="row g14" style={{ padding: 14, borderRadius: 16, border: '1px solid var(--stroke)', color: 'var(--text-headline)' }}>
          <Icon name="alert-circle" />
          <span className="grow">
            <span className="strong" style={{ display: 'block' }}>
              {i.title}
            </span>
            <span className="small muted">{i.text}</span>
          </span>
          <Icon name="chevron-right" />
        </Link>
      ))}
    </Modal>
  );
}

function LimitModal({ onClose }: { onClose: () => void }) {
  return (
    <Modal onClose={onClose} label="Monthly limit reached" width={480}>
      <ModalHead title="You’ve used 10 of 10 applications" sub="The Free plan includes 10 applications a month. Premium and Max have no limit." onClose={onClose} />
      <Btn h={56} full to="/profile/plans">
        See plans
      </Btn>
      <Btn kind="secondary" h={52} full onClick={onClose}>
        Not now
      </Btn>
    </Modal>
  );
}

/**
 * Vacancy photos, up to 10. Desktop: 1 wide · 2 halves · 3 big + 2 stacked · 4 big + 3 stacked · 5+ big + 2×2 with "+N".
 * Phones: a swipeable strip with a counter. Every photo opens the full-screen viewer.
 */
export function VacancyGallery({ photos, title }: { photos: string[]; title: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const [cur, setCur] = useState(0);
  const n = photos.length;
  const shown = n >= 5 ? 5 : n;
  const tile = (i: number) => (
    <button key={i} className={`vg-tile t${i}`} onClick={() => setOpen(i)} aria-label={i === 4 && n > 5 ? `Show all ${n} photos` : `Photo ${i + 1} of ${n}`}>
      <img src={photos[i]} alt="" />
      {i === 4 && n > 5 ? <span className="more">+{n - 5}</span> : null}
    </button>
  );
  return (
    <>
      <div className={`vgal n${shown} desk-only`}>{Array.from({ length: shown }, (_, i) => tile(i))}</div>
      <div className="vgal-m mob-only">
        <div className="vgal-strip" onScroll={(e) => setCur(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}>
          {photos.map((p, i) => (
            <button key={i} onClick={() => setOpen(i)} aria-label={`Photo ${i + 1} of ${n}`}>
              <img src={p} alt="" />
            </button>
          ))}
        </div>
        {n > 1 ? (
          <span className="vgal-count">
            <Icon name="image" size={14} />
            {cur + 1} / {n}
          </span>
        ) : null}
      </div>
      {open !== null ? <PhotoViewer photos={photos} index={open} title={title} ratio="4 / 3" onClose={() => setOpen(null)} /> : null}
    </>
  );
}

export function VacancyBody({ v, side, fit }: { v: Vacancy; side: React.ReactNode; fit?: React.ReactNode }) {
  const [more, setMore] = useState(false);
  const photos = v.photos.length ? v.photos : [v.cover];
  const rows: [string, string][] = [
    ['Role', v.details.role],
    ...(v.details.gender ? [['Gender', v.details.gender] as [string, string]] : []),
    ...(v.details.age ? [['Age', v.details.age] as [string, string]] : []),
    ['Location', `${v.city}, ${v.country}`],
    ['Contract', contractTypes[v.pay.contract].label],
  ];
  return (
    <div className="layout-r w380 mt16">
      <div className="stack">
        <VacancyGallery photos={photos} title={v.title} />
        <Card style={{ gap: 14 }}>
          <div className="row wrap g6">
            {v.urgent ? <UrgentPill /> : null}
            <Pill tone="blue">{spheres[v.sphere]}</Pill>
            {v.urgent ? <span className="small muted">Hiring within 24 h</span> : null}
          </div>
          <h1 className="display d2">{v.title}</h1>
          <div className="row wrap g16 s14 muted">
            <span className="row g6">
              <Icon name="location" size={16} />
              {v.city}, {v.country === 'United Arab Emirates' ? 'UAE' : v.country}
            </span>
            <span className="row g6">
              <Icon name="clock" size={16} />
              {v.postedAgo}
            </span>
            <span className="row g6">
              <Icon name="view" size={16} />
              {v.views.toLocaleString('en-US').replace(/,/g, ' ')} views
            </span>
          </div>
        </Card>
        {fit}
        <Card style={{ gap: 6 }}>
          <H2>Vacancy details</H2>
          <div style={{ marginTop: 8 }}>
            {rows.map(([a, b]) => (
              <div key={a} className="kv">
                <span>{a}</span>
                <span>{b}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card style={{ gap: 12 }}>
          <H2>Job description</H2>
          <p className="primary-text lh" style={more ? undefined : { display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {v.description}
          </p>
          {v.description.length > 240 ? (
            <button className="link s14" style={{ alignSelf: 'flex-start' }} onClick={() => setMore(!more)}>
              {more ? 'Show less' : 'Show more'}
            </button>
          ) : null}
        </Card>
      </div>
      <aside className="stack">{side}</aside>
    </div>
  );
}

export function VacancyPage({ guest }: { guest?: boolean }) {
  const { id = '' } = useParams();
  const v = findVacancy(id);
  const s = useSeeker();
  const toast = useToast();
  const [sheet, setSheet] = useState<'apply' | 'gate' | 'limit' | 'auth' | null>(null);
  if (!v) return <Navigate to={guest ? '/' : '/seeker'} replace />;
  const app = guest ? undefined : s.appFor(v.id);
  const saved = !guest && s.saved.includes(v.id);
  const respond = () => {
    if (guest) return setSheet('auth');
    if (s.plan === 'free' && s.appsUsed >= FREE_APPLY_LIMIT) return setSheet('limit');
    const gaps = missingForApply(s.profile, v, fieldByKey(sphereToField[v.sphere]).label);
    setSheet(gaps.length ? 'gate' : 'apply');
  };
  const met = v.requirements.map((r) => [r, matchRequirement(r, s.profile)] as const);
  const fit = guest ? null : (
    <section className="card" style={{ background: 'var(--primary-secondary)', gap: 14 }}>
      <div className="row g8 s16 strong">
        <Icon name="sparkles" />
        You fit {met.filter((m) => m[1]).length} of {met.length} requirements
      </div>
      <div className="grid2" style={{ gap: 8 }}>
        {met.map(([r, ok]) => (
          <div key={r} className="row g10 s14 semi" style={{ height: 44, padding: '0 14px', borderRadius: 14, background: ok ? 'var(--success-back)' : 'var(--back)', color: ok ? 'var(--success-text)' : 'var(--text-primary)' }}>
            <Icon name={ok ? 'check' : 'alert-circle'} size={18} />
            {r}
          </div>
        ))}
      </div>
      <div className="small muted">Green — already in your profile.</div>
    </section>
  );
  const side = (
    <>
      <Card style={{ gap: 14 }}>
        <div className="row base g8">
          <span className="display" style={{ fontSize: 30 }}>
            {money(v.pay.amount)}
          </span>
          <span className="muted">{contractTypes[v.pay.contract].suffix}</span>
        </div>
        <div className="row g6">
          <Pill tone={contractTypes[v.pay.contract].tone}>{contractTypes[v.pay.contract].label}</Pill>
          {app ? <AppliedPill status={app.status} /> : null}
        </div>
        {app ? (
          <>
            <div className="inset s14 primary-text">{app.note}</div>
            {app.chatId ? (
              <Btn h={56} full icon="message" to={`/seeker/messages/${app.chatId}`}>
                Open chat
              </Btn>
            ) : app.status === 'pending' ? (
              <Btn
                kind="secondary"
                h={52}
                full
                onClick={() => {
                  s.withdraw(v.id);
                  toast('Application withdrawn', 'cancel');
                }}
              >
                Withdraw application
              </Btn>
            ) : null}
          </>
        ) : (
          <Btn h={56} full onClick={respond}>
            Respond
          </Btn>
        )}
        <div className="row g8">
          <Btn
            kind="secondary"
            icon={saved ? 'bookmark-filled' : 'bookmark'}
            style={{ flex: 1 }}
            onClick={() => {
              if (guest) return setSheet('auth');
              const on = s.toggleSaved(v.id);
              toast(on ? 'Saved' : 'Removed from saved', on ? 'bookmark-filled' : 'bookmark');
            }}
          >
            {saved ? 'Saved' : 'Save'}
          </Btn>
          <Btn
            kind="secondary"
            icon="share"
            style={{ flex: 1 }}
            onClick={() => {
              navigator.clipboard?.writeText(`${location.origin}/v/${v.id}`).catch(() => undefined);
              toast('Link copied', 'link');
            }}
          >
            Share
          </Btn>
        </div>
        {!guest && s.plan === 'free' ? (
          <p className="small muted lh">
            The employer sees your profile, photos and video presentation. Free plan: {s.appsUsed} of {FREE_APPLY_LIMIT} applications this month.
          </p>
        ) : null}
      </Card>
      <Card pad={20} style={{ gap: 12 }}>
        <span className="small strong muted">Posted by</span>
        <div className="row g12">
          <Initials text={v.company.initials} size={48} radius={14} />
          <div>
            <div className="row g6 s16 strong">
              {v.company.name}
              {v.company.verified ? (
                <span style={{ color: 'var(--primary)', display: 'flex' }}>
                  <Icon name="verified" size={16} />
                </span>
              ) : null}
            </div>
            <div className="small muted">
              {v.city}, {v.country}
            </div>
          </div>
        </div>
        {guest ? null : (
          <Link to={`/org/${companySlug(v.company.name)}`} className="link s14">
            About the company
          </Link>
        )}
      </Card>
    </>
  );
  return (
    <main className="page">
      <Crumbs back={{ to: guest ? '/' : '/seeker', label: 'Vacancies' }} items={[spheres[v.sphere], v.title]} />
      <VacancyBody v={v} side={side} fit={fit} />
      {sheet === 'auth' ? <GuestAuthModal v={v} onClose={() => setSheet(null)} /> : null}
      {sheet === 'gate' ? <GateModal v={v} onClose={() => setSheet(null)} /> : null}
      {sheet === 'limit' ? <LimitModal onClose={() => setSheet(null)} /> : null}
      {sheet === 'apply' ? (
        <ApplyModal
          v={v}
          onClose={() => setSheet(null)}
          onSent={() => {
            setSheet(null);
            toast('You’ve applied to this vacancy');
          }}
        />
      ) : null}
    </main>
  );
}
