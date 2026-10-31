// Vacancy feed (guest and job seeker), search results, guest talent preview, Available today.
import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { feedVacancies, talents } from '../../data/mock';
import { spheres, vacancySpheres } from '../../data/dictionaries';
import { applyFilters, countFilters, emptyFilters, type VacancyFilters } from '../../data/filters';
import { completeness, useSeeker } from '../../data/seeker';
import { SLOTS, slotLabels, slotsLabel, statsLine, toggleSlot, untilLabel, type Slot } from '../../data/availability';
import { stock } from '../../data/asset';
import type { Sphere } from '../../data/types';
import { useSession } from '../../data/session';
import { Link } from '../../lib/links';
import { Hero, SphereChips, TalentCard, VacancyRow } from '../../ui/domain';
import { FiltersCard, FiltersDrawer } from '../../ui/filters';
import { Avatar, Btn, Card, Empty, FlashTile, H2, Icon, Modal, ModalHead, Option, TierBadge, Toggle, useToast } from '../../ui/kit';

const greeting = () => {
  const h = new Date().getHours();
  return h < 5 ? 'Good night' : h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
};

function useFeed(initial?: Partial<VacancyFilters>) {
  const [filters, setFilters] = useState<VacancyFilters>({ ...emptyFilters, ...initial });
  const [sphere, setSphere] = useState<Sphere | 'all'>('all');
  const list = useMemo(() => {
    const f = sphere === 'all' ? filters : { ...filters, spheres: [sphere] };
    return applyFilters(feedVacancies, f);
  }, [filters, sphere]);
  return { filters, setFilters, sphere, setSphere, list };
}

const sphereItems = vacancySpheres.map((s) => ({ key: s, label: spheres[s] }));

function FeedList({ list, guest, limit }: { list: typeof feedVacancies; guest?: boolean; limit?: number }) {
  const s = useSeeker();
  const toast = useToast();
  const nav = useNavigate();
  const shown = limit ? list.slice(0, limit) : list;
  if (!list.length) return <Empty icon="search" title="Nothing found" text="Try another sphere or reset the filters." />;
  return (
    <>
      {shown.map((v) => (
        <VacancyRow
          key={v.id}
          v={v}
          to={guest ? `/v/${v.id}` : `/vacancy/${v.id}`}
          status={guest ? undefined : s.appFor(v.id)?.status}
          saved={!guest && s.saved.includes(v.id)}
          onSave={() => {
            if (guest) return nav('/auth/sign-in');
            const on = s.toggleSaved(v.id);
            toast(on ? 'Saved to Applications' : 'Removed from saved', on ? 'bookmark-filled' : 'bookmark');
          }}
        />
      ))}
    </>
  );
}

function ListHead({ n }: { n?: number }) {
  return (
    <div className="row between">
      <h2 className="display d4">Hiring today{n !== undefined ? <span className="muted s16 semi" style={{ fontFamily: 'var(--font)', marginLeft: 8 }}>{n}</span> : null}</h2>
      <span className="row g6 s14 strong">
        <Icon name="sort" size={16} />
        Newest
      </span>
    </div>
  );
}

// ---------- guest ----------
export function GuestFeed() {
  const nav = useNavigate();
  const feed = useFeed();
  const [q, setQ] = useState('');
  const [drawer, setDrawer] = useState(false);
  const list = q.trim() ? feed.list.filter((v) => `${v.title} ${v.company.name} ${v.city}`.toLowerCase().includes(q.trim().toLowerCase())) : feed.list;
  return (
    <main className="page">
      <Hero eyebrow="Hospitality, events, F&B and modeling" title="Find work. Find people." query={q} onQuery={setQ} placeholder="Role, venue or area" onSubmit={() => undefined} onFilters={() => setDrawer(true)} filters={countFilters(feed.filters)} />
      <div className="layout-r w320 mt24">
        <div className="stack">
          <SphereChips items={sphereItems} value={feed.sphere} onChange={feed.setSphere} urgent={feed.filters.urgent} onUrgent={() => feed.setFilters({ ...feed.filters, urgent: !feed.filters.urgent })} />
          <ListHead n={list.length} />
          <FeedList list={list} guest limit={20} />
        </div>
        <aside className="stack desk-only">
          <section className="card" style={{ background: 'var(--panel-dark)', color: '#fff', gap: 14 }}>
            <span className="small strong" style={{ color: 'var(--urgent)' }}>
              For talent
            </span>
            <div className="display d3" style={{ fontSize: 24 }}>
              Be seen.
              <br />
              Get hired.
            </div>
            <div className="row g8">
              {(['f-pink-skirt', 'f-headphones', 'f-yellow-suit', 'f-dj'] as const).map((k) => (
                <Avatar key={k} src={stock[k]} size={44} radius={14} />
              ))}
            </div>
            <p className="s14 lh" style={{ color: 'var(--panel-dark-muted)' }}>
              Create a profile with photos and video. Employers message you directly.
            </p>
            <Btn full onClick={() => nav('/auth/role')}>
              Create a profile
            </Btn>
          </section>
          <Card pad={20} style={{ gap: 12 }}>
            <H2>Hiring?</H2>
            <p className="s14 muted lh">Register your company, post vacancies and message talent directly.</p>
            <Btn kind="secondary" h={44} full to="/auth/role">
              Register a company
            </Btn>
          </Card>
        </aside>
      </div>
      {drawer ? <FiltersDrawer value={feed.filters} source={feedVacancies} onClose={() => setDrawer(false)} onApply={(f) => (feed.setFilters(f), setDrawer(false))} /> : null}
    </main>
  );
}

export function GuestTalent() {
  const [gate, setGate] = useState(false);
  return (
    <main className="page">
      <div className="row between wrap g16" style={{ marginTop: 8 }}>
        <div>
          <h1 className="display d2">Talent on 919</h1>
          <p className="muted" style={{ marginTop: 6 }}>
            Hosts, models, musicians and event staff in the UAE. Sign in as an employer to open profiles and message them.
          </p>
        </div>
        <Btn to="/auth/role">Register a company</Btn>
      </div>
      <div className="grid4 mt24">
        {talents.map((t) => (
          <div key={t.id} onClickCapture={(e) => (e.preventDefault(), e.stopPropagation(), setGate(true))}>
            <TalentCard name={t.name} role={`${t.role} · ${t.city}`} photo={t.photo} tier={t.tier} frame={t.frame} to="/talent-preview" />
          </div>
        ))}
      </div>
      {gate ? (
        <Modal onClose={() => setGate(false)} label="Sign in to see profiles" width={480}>
          <ModalHead title="Sign in to see profiles" sub="Profiles, videos and messages are open to registered employers." onClose={() => setGate(false)} />
          <Btn h={56} full to="/auth/sign-in">
            Sign in
          </Btn>
          <Btn kind="secondary" h={56} full to="/auth/role">
            Create an employer account
          </Btn>
        </Modal>
      ) : null}
    </main>
  );
}

// ---------- Available today ----------
export function AvailModal() {
  const s = useSeeker();
  const toast = useToast();
  const [slots, setSlots] = useState<Slot[]>(['any']);
  if (!s.availSheet) return null;
  const close = () => s.setAvailSheet(false);
  return (
    <Modal onClose={close} width={560} label="Available today">
      <ModalHead lead={<FlashTile size={52} />} title="Available today" sub="Turn it on when you can start work today — a one-time shift or an event." onClose={close} />
      <ul className="col g10">
        {['You appear in the Available today tab for employers', 'Only verified companies can message you from there', 'It turns off by itself in 24 hours'].map((t) => (
          <li key={t} className="row top g10 primary-text lh">
            <span style={{ color: 'var(--success-text)', display: 'flex', paddingTop: 1 }}>
              <Icon name="check" size={18} />
            </span>
            {t}
          </li>
        ))}
      </ul>
      <div>
        <div className="s15 strong" style={{ marginBottom: 10 }}>
          When can you work?
        </div>
        <div className="chips" role="group" aria-label="When can you work?">
          {SLOTS.map((sl) => (
            <Option key={sl} on={slots.includes(sl)} onClick={() => setSlots(toggleSlot(slots, sl))}>
              {slotLabels[sl]}
            </Option>
          ))}
        </div>
      </div>
      <div className="row top g10" style={{ padding: '12px 14px', borderRadius: 14, background: 'var(--attention-back)', color: 'var(--attention-text)', fontSize: 14, lineHeight: 1.5 }}>
        <Icon name="shield" size={18} />
        919 never asks you to pay for a job. Keep talks and payments in 919 chat and report anyone who asks otherwise.
      </div>
      <div className="row g10">
        <Btn kind="secondary" h={52} onClick={close}>
          Not now
        </Btn>
        <Btn
          h={52}
          icon="flash"
          style={{ flex: 1 }}
          onClick={() => {
            s.turnOnAvail(slots);
            close();
            toast('You’re available today for 24 hours', 'flash');
          }}
        >
          Turn on for 24 hours
        </Btn>
      </div>
    </Modal>
  );
}

export function AvailCard() {
  const s = useSeeker();
  const toast = useToast();
  if (!s.availEligible && !s.avail.on) return null;
  if (s.avail.on)
    return (
      <section className="card" style={{ background: 'var(--urgent)', color: '#18191C', gap: 10 }}>
        <div className="row g12">
          <FlashTile size={40} />
          <div className="grow">
            <div className="s16 strong">You’re available today</div>
            <div className="small" style={{ marginTop: 2 }}>
              {slotsLabel(s.avail.slots)} · {untilLabel(s.avail.until)}
            </div>
          </div>
          <Toggle
            on
            label="Available today"
            onChange={() => {
              s.turnOffAvail();
              toast('Available today is off', 'flash');
            }}
          />
        </div>
        <div className="small" style={{ opacity: 0.85 }}>
          {statsLine(s.avail)}
        </div>
      </section>
    );
  return (
    <Card pad={20} style={{ gap: 14 }}>
      <div className="row g12">
        <FlashTile size={40} />
        <div className="grow">
          <div className="s16 strong">Available today</div>
          <div className="small muted" style={{ marginTop: 2 }}>
            Show employers you can start work today
          </div>
        </div>
        <Toggle on={false} label="Available today" onChange={() => s.setAvailSheet(true)} />
      </div>
    </Card>
  );
}

// ---------- seeker ----------
export function SeekerFeed() {
  const s = useSeeker();
  const nav = useNavigate();
  const feed = useFeed();
  const [q, setQ] = useState('');
  const [drawer, setDrawer] = useState(false);
  const c = completeness(s.profile);
  const search = () => q.trim() && nav(`/seeker/search?q=${encodeURIComponent(q.trim())}`);
  return (
    <main className="page">
      <Hero eyebrow={`${greeting()}, ${s.profile.firstName}`} title="Find your next job" query={q} onQuery={setQ} placeholder="Role, venue or area" onSubmit={search} onFilters={() => setDrawer(true)} filters={countFilters(feed.filters)} />
      <div className="layout-3 mt24">
        <aside className="stack">
          <AvailCard />
          <span className="desk-only">
            <FiltersCard value={feed.filters} onChange={feed.setFilters} source={feedVacancies} />
          </span>
        </aside>
        <div className="stack">
          <SphereChips items={sphereItems} value={feed.sphere} onChange={feed.setSphere} urgent={feed.filters.urgent} onUrgent={() => feed.setFilters({ ...feed.filters, urgent: !feed.filters.urgent })} />
          <ListHead />
          <FeedList list={feed.list} limit={30} />
        </div>
        <aside className="stack">
          {s.plan === 'max' ? (
            <section className="card" style={{ background: 'var(--panel-dark)', color: '#fff', gap: 12 }}>
              <div className="row g8">
                <TierBadge tier="max" size={26} />
                <span className="s16 strong">You’re on Max</span>
              </div>
              <p className="s14 lh" style={{ color: 'var(--panel-dark-muted)' }}>
                Your profile is pinned to the top of employer search with your frame.
              </p>
              <Link to="/profile/look" className="s14 strong" style={{ color: 'var(--urgent)' }}>
                Profile look →
              </Link>
            </section>
          ) : (
            <section className="card" style={{ background: 'var(--panel-dark)', color: '#fff', gap: 12 }}>
              <div className="row g8">
                <TierBadge tier="max" size={26} />
                <span className="s16 strong">Get hired faster</span>
              </div>
              <p className="s14 lh" style={{ color: 'var(--panel-dark-muted)' }}>
                Max puts you at the top for employers, with a frame and unlimited applications.
              </p>
              <Btn h={44} to="/profile/plans">
                See plans
              </Btn>
            </section>
          )}
          <Card pad={20} style={{ gap: 12 }}>
            <H2 right={<span className="s14 strong">{c.percent}%</span>}>Your profile</H2>
            <div style={{ height: 8, borderRadius: 999, background: 'var(--success-back)' }}>
              <div style={{ width: `${c.percent}%`, height: 8, borderRadius: 999, background: '#1DB954' }} />
            </div>
            <p className="s14 muted lh">
              {c.next ? `${c.next.hint} to reach ${c.nextPercent}%.` : 'Employers see your photos, video and fields.'} {s.profile.stats.views} profile views this week.
            </p>
            {c.next ? (
              <Btn kind="secondary" h={40} to="/profile/edit">
                Complete profile
              </Btn>
            ) : null}
          </Card>
        </aside>
      </div>
      {drawer ? <FiltersDrawer value={feed.filters} source={feedVacancies} onClose={() => setDrawer(false)} onApply={(f) => (feed.setFilters(f), setDrawer(false))} /> : null}
      <AvailModal />
    </main>
  );
}

export function SeekerSearch() {
  const [sp, setSp] = useSearchParams();
  const s = useSeeker();
  const { user } = useSession();
  const [q, setQ] = useState(sp.get('q') ?? '');
  const [filters, setFilters] = useState<VacancyFilters>(emptyFilters);
  const [drawer, setDrawer] = useState(false);
  const query = (sp.get('q') ?? '').trim().toLowerCase();
  const list = applyFilters(feedVacancies, filters).filter((v) => !query || `${v.title} ${v.company.name} ${v.city} ${v.details.role}`.toLowerCase().includes(query));
  const chips: { label: string; clear: () => void }[] = [
    ...(filters.urgent ? [{ label: 'Urgent', clear: () => setFilters({ ...filters, urgent: false }) }] : []),
    ...filters.spheres.map((x) => ({ label: spheres[x], clear: () => setFilters({ ...filters, spheres: filters.spheres.filter((y) => y !== x) }) })),
    ...(filters.city ? [{ label: filters.city, clear: () => setFilters({ ...filters, city: undefined }) }] : []),
    ...filters.contracts.map((x) => ({ label: x, clear: () => setFilters({ ...filters, contracts: filters.contracts.filter((y) => y !== x) }) })),
    ...(filters.min ? [{ label: `From AED ${filters.min}`, clear: () => setFilters({ ...filters, min: undefined }) }] : []),
  ];
  const submit = () => {
    setSp(q.trim() ? { q: q.trim() } : {});
    if (q.trim() && user) s.addRecent({ q: q.trim(), filters });
  };
  return (
    <main className="page">
      <div className="row g12">
        <form
          className="search grow"
          style={{ height: 56, border: '2px solid var(--primary)' }}
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <Icon name="search" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Role, venue or area" aria-label="Search vacancies" autoFocus />
          {q ? (
            <button type="button" aria-label="Clear" onClick={() => (setQ(''), setSp({}))} style={{ display: 'flex', color: 'var(--text-body)' }}>
              <Icon name="cancel" />
            </button>
          ) : null}
        </form>
        <button className="filterbtn mob-only" onClick={() => setDrawer(true)}>
          <Icon name="filter" />
          {countFilters(filters) ? <span className="n">{countFilters(filters)}</span> : null}
        </button>
      </div>
      {chips.length ? (
        <div className="chips mt16">
          {chips.map((c) => (
            <button key={c.label} className="chip soft" onClick={c.clear}>
              {c.label}
              <Icon name="cancel" size={16} />
            </button>
          ))}
          <button className="link s14" onClick={() => setFilters(emptyFilters)}>
            Clear all
          </button>
        </div>
      ) : null}
      {!query && s.recent.length ? (
        <div className="chips mt16">
          <span className="small strong muted" style={{ alignSelf: 'center' }}>
            Recent
          </span>
          {s.recent.map((r) => (
            <button key={r.id} className="chip" onClick={() => (setQ(r.q), setFilters(r.filters), setSp({ q: r.q }))}>
              <Icon name="clock" size={16} />
              {r.q}
            </button>
          ))}
        </div>
      ) : null}
      <div className="layout-l mt24">
        <aside className="desk-only">
          <FiltersCard value={filters} onChange={setFilters} source={feedVacancies} />
        </aside>
        <div className="stack">
          <div className="row between">
            <h2 className="s20 strong">{query ? `${list.length} vacancies for “${sp.get('q')}”` : `${list.length} vacancies`}</h2>
            <span className="row g6 s14 strong">
              <Icon name="sort" size={16} />
              Newest
            </span>
          </div>
          <FeedList list={list} limit={40} />
        </div>
      </div>
      {drawer ? <FiltersDrawer value={filters} source={feedVacancies} onClose={() => setDrawer(false)} onApply={(f) => (setFilters(f), setDrawer(false))} /> : null}
    </main>
  );
}
