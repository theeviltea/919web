// Employer: Find talent (Profiles / Videos / Today, search, filters) and the candidate profile with contact flow.
import { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { applyTalentFilters, availableToday, candidates, countTalentFilters, emptyTalentFilters, findCandidate, hasLabels, matchesCandidate, talentChips, talentSphereLabels, talentSphereOrder, type Candidate, type ProfileHas, type TalentFilters, type TalentSphere } from '../../data/talentPool';
import { company, useEmployer } from '../../data/employer';
import { tierRank } from '../../data/tiers';
import { allCountries, citiesFor } from '../../data/registration';
import { toggleIn } from '../../data/filters';
import { candidateCard, Hero } from '../../ui/domain';
import { ProfileView } from '../seeker/People';
import { Btn, CheckRow, Drawer, FlashTile, H2, Icon, Modal, ModalHead, Pill, Select, Tabs, useToast, Avatar, Field } from '../../ui/kit';

type View = 'profiles' | 'videos' | 'today';
const profileRows = talentSphereOrder.map((k) => ({ key: k, title: talentSphereLabels[k], list: candidates.filter((x) => x.sphere === k).sort((a, b) => tierRank(b.tier) - tierRank(a.tier)) })).filter((r) => r.list.length);
const LANGS = ['English', 'Arabic', 'Russian', 'French', 'Hindi', 'Spanish'];

function TalentFiltersDrawer({ value, onApply, onClose }: { value: TalentFilters; onApply: (f: TalentFilters) => void; onClose: () => void }) {
  const [f, setF] = useState(value);
  const n = applyTalentFilters(candidates, f).length;
  const sect = (t: React.ReactNode, inner: React.ReactNode) => (
    <div className="fsection">
      <div className="s15 strong">{t}</div>
      {inner}
    </div>
  );
  return (
    <Drawer onClose={onClose} label="Filters">
      <div className="row g12" style={{ padding: '24px 28px 8px' }}>
        <h2 className="display d4 grow">Filters</h2>
        <button className="link s14" onClick={() => setF(emptyTalentFilters)}>
          Reset
        </button>
        <button className="iconbtn soft" aria-label="Close" onClick={onClose}>
          <Icon name="cancel" />
        </button>
      </div>
      <div className="body">
        {sect(
          <>
            Sphere <span className="muted semi">· any, if none selected</span>
          </>,
          <div className="chips">
            {talentSphereOrder.map((s) => (
              <button key={s} className={`chip${f.spheres.includes(s) ? ' on' : ''}`} onClick={() => setF({ ...f, spheres: toggleIn(f.spheres, s) })}>
                {talentSphereLabels[s]}
              </button>
            ))}
          </div>,
        )}
        {sect(
          'Location',
          <div className="grid2" style={{ gap: 10 }}>
            <Select label="Country" value={f.country ?? ''} placeholder="Any" options={allCountries.slice(0, 30)} onChange={(v) => setF({ ...f, country: v || undefined, city: undefined })} />
            <Select label="City" value={f.city ?? ''} placeholder="Any" options={citiesFor(f.country ?? 'United Arab Emirates')} onChange={(v) => setF({ ...f, city: v || undefined })} />
          </div>,
        )}
        {sect(
          'Gender',
          <div className="tabs full">
            {(['any', 'female', 'male'] as const).map((g) => (
              <button key={g} className={`tab${f.gender === g ? ' on' : ''}`} onClick={() => setF({ ...f, gender: g })}>
                {g[0].toUpperCase() + g.slice(1)}
              </button>
            ))}
          </div>,
        )}
        {sect(
          'Age',
          <div className="grid2" style={{ gap: 10 }}>
            <Field label="From" value={f.ageFrom ?? ''} onChange={(v) => setF({ ...f, ageFrom: v.replace(/\D/g, '').slice(0, 2) || undefined })} inputMode="numeric" />
            <Field label="To" value={f.ageTo ?? ''} onChange={(v) => setF({ ...f, ageTo: v.replace(/\D/g, '').slice(0, 2) || undefined })} inputMode="numeric" />
          </div>,
        )}
        {sect(
          <>
            Languages <span className="muted semi">· speaks all selected</span>
          </>,
          <div className="chips">
            {LANGS.map((l) => (
              <button key={l} className={`chip${f.languages.includes(l) ? ' on' : ''}`} onClick={() => setF({ ...f, languages: toggleIn(f.languages, l) })}>
                {l}
              </button>
            ))}
          </div>,
        )}
        {sect(
          'Profile has',
          (Object.keys(hasLabels) as ProfileHas[]).map((k) => (
            <CheckRow key={k} on={f.has.includes(k)} onChange={() => setF({ ...f, has: toggleIn(f.has, k) })}>
              {hasLabels[k]}
            </CheckRow>
          )),
        )}
      </div>
      <div style={{ padding: '16px 28px 24px', borderTop: '1px solid var(--divider)' }}>
        <Btn h={56} full onClick={() => onApply(f)}>
          Show {n} profiles
        </Btn>
      </div>
    </Drawer>
  );
}

function VideoCard({ c }: { c: Candidate }) {
  return (
    <div className="tcard">
      <div className="rel" style={{ height: 300 }}>
        <img src={c.photo} alt="" className="ph-cover" style={{ height: '100%' }} />
        <span style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0) 45%, rgba(0,0,0,.65))' }} />
        <span className="play">
          <span style={{ width: 44, height: 44 }}>
            <Icon name="play-filled" size={18} />
          </span>
        </span>
        <span style={{ position: 'absolute', left: 12, right: 12, bottom: 12, color: '#fff' }}>
          <span className="strong" style={{ display: 'block' }}>
            {c.name}
          </span>
          <span className="small" style={{ opacity: 0.85 }}>
            {c.video?.duration} · {c.video?.views} views
          </span>
        </span>
      </div>
    </div>
  );
}

export function FindTalent() {
  const e = useEmployer();
  const nav = useNavigate();
  const toast = useToast();
  const [sp, setSp] = useSearchParams();
  const [view, setView] = useState<View>(sp.get('tab') === 'today' ? 'today' : 'profiles');
  const [q, setQ] = useState(sp.get('q') ?? '');
  const [filters, setFilters] = useState<TalentFilters>(emptyTalentFilters);
  const [drawer, setDrawer] = useState(false);
  const [todaySphere, setTodaySphere] = useState<TalentSphere | 'all'>('all');
  const tabParam = sp.get('tab');
  useEffect(() => {
    if (tabParam === 'today') setView('today');
  }, [tabParam]);
  const query = (sp.get('q') ?? '').trim();
  const searching = !!query || countTalentFilters(filters) > 0;
  const results = useMemo(() => applyTalentFilters(candidates, filters).filter((c) => !query || matchesCandidate(c, query)).sort((a, b) => tierRank(b.tier) - tierRank(a.tier)), [filters, query]);
  const save = (c: Candidate) => () => {
    const on = e.toggleSaved(c.id);
    toast(on ? `${c.name} saved` : 'Removed from saved', on ? 'bookmark-filled' : 'bookmark');
  };
  const card = (c: Candidate, today?: boolean) => candidateCard(c, `/talent/${c.id}`, { saved: e.savedIds.includes(c.id), onSave: save(c), today: today ? c.today : undefined });
  const today = availableToday();
  const todayList = today.filter((c) => todaySphere === 'all' || c.sphere === todaySphere);
  const todaySpheres = talentSphereOrder.map((s) => ({ s, n: today.filter((c) => c.sphere === s).length })).filter((x) => x.n);
  return (
    <main className="page">
      <Hero
        eyebrow={
          <span className="row g8">
            {e.info.name || company.name}
            {e.plan === 'premium' ? (
              <Pill tone="orange" icon="star" h={24}>
                Premium
              </Pill>
            ) : null}
          </span>
        }
        title="Find talent"
        query={q}
        onQuery={setQ}
        placeholder="Name, role or skill"
        onSubmit={() => setSp(q.trim() ? { q: q.trim() } : {})}
        onFilters={() => setDrawer(true)}
        filters={countTalentFilters(filters)}
      />
      {searching ? (
        <div className="stack mt24">
          <div className="row between wrap g12">
            <h2 className="s20 strong">
              {results.length} profiles{query ? ` for “${query}”` : ''}
            </h2>
            <button className="link s14" onClick={() => (setFilters(emptyTalentFilters), setQ(''), setSp({}))}>
              Clear search
            </button>
          </div>
          {talentChips(filters).length ? (
            <div className="chips">
              {talentChips(filters).map((c) => (
                <button key={c.key} className="chip soft" onClick={() => setFilters(c.remove(filters))}>
                  {c.label}
                  <Icon name="cancel" size={16} />
                </button>
              ))}
            </div>
          ) : null}
          <div className="grid6">{results.slice(0, 36).map((c) => card(c))}</div>
        </div>
      ) : (
        <>
          <div className="row between wrap g12 mt24">
            <Tabs<View>
              items={[
                {
                  key: 'profiles',
                  label: (
                    <>
                      <Icon name="users" size={18} />
                      Profiles
                    </>
                  ),
                },
                {
                  key: 'videos',
                  label: (
                    <>
                      <Icon name="video" size={18} />
                      Videos
                    </>
                  ),
                },
                {
                  key: 'today',
                  label: (
                    <>
                      <span style={{ color: '#E0A800', display: 'flex' }}>
                        <Icon name="flash" size={18} />
                      </span>
                      Today
                    </>
                  ),
                },
              ]}
              value={view}
              onChange={setView}
            />
            <span className="row g8 s14 muted desk-only">
              <Icon name="location" size={16} />
              Dubai, UAE · All fields
            </span>
          </div>
          {view === 'profiles'
            ? profileRows.map((r) => (
                <div key={r.key} className="mt24">
                  <H2
                    right={
                      <Btn kind="secondary" h={40} onClick={() => setFilters({ ...emptyTalentFilters, spheres: [r.key] })}>
                        See all
                      </Btn>
                    }
                  >
                    {r.title} <span className="muted semi">{r.list.length}</span>
                  </H2>
                  <div className="grid6 mt16">{r.list.slice(0, 6).map((c) => card(c))}</div>
                </div>
              ))
            : null}
          {view === 'videos'
            ? profileRows
                .map((r) => ({ ...r, list: r.list.filter((x) => x.video) }))
                .filter((r) => r.list.length)
                .map((r) => (
                  <div key={r.key} className="mt24">
                    <H2>
                      {r.title} <span className="muted semi">{r.list.length}</span>
                    </H2>
                    <div className="grid6 mt16">
                      {r.list.slice(0, 6).map((c) => (
                        <div key={c.id} onClick={() => nav(`/talent/${c.id}`)} style={{ cursor: 'pointer' }}>
                          <VideoCard c={c} />
                        </div>
                      ))}
                    </div>
                  </div>
                ))
            : null}
          {view === 'today' ? (
            <>
              <div className="row g14 mt24" style={{ padding: '16px 20px', borderRadius: 20, background: 'var(--attention-back)' }}>
                <FlashTile size={40} />
                <div className="grow s15 primary-text">
                  <b style={{ color: 'var(--text-headline)' }}>People who can start work today.</b> They turn this on for 24 hours.
                  {!e.verified ? ' Only verified companies can message them.' : ''}
                </div>
                {!e.verified ? (
                  <Btn kind="secondary" h={40} to="/company/verification">
                    Get verified
                  </Btn>
                ) : null}
              </div>
              <div className="chips scroll mt16">
                <button className={`chip${todaySphere === 'all' ? ' on' : ''}`} onClick={() => setTodaySphere('all')}>
                  All <span className="n">{today.length}</span>
                </button>
                {todaySpheres.map(({ s, n }) => (
                  <button key={s} className={`chip${todaySphere === s ? ' on' : ''}`} onClick={() => setTodaySphere(s)}>
                    {talentSphereLabels[s]} <span className="n">{n}</span>
                  </button>
                ))}
              </div>
              <div className="grid6 mt16">{todayList.map((c) => card(c, true))}</div>
            </>
          ) : null}
        </>
      )}
      {drawer ? <TalentFiltersDrawer value={filters} onClose={() => setDrawer(false)} onApply={(f) => (setFilters(f), setDrawer(false))} /> : null}
    </main>
  );
}

// ---------- candidate ----------
export function CandidatePage() {
  const { id = '' } = useParams();
  const c = findCandidate(id);
  const e = useEmployer();
  const nav = useNavigate();
  const toast = useToast();
  const [sheet, setSheet] = useState<'contact' | 'paywall' | 'verify' | null>(null);
  const [msg, setMsg] = useState('');
  if (!c) return <Navigate to="/hire" replace />;
  const first = c.name.split(' ')[0];
  const chat = e.threads.find((t) => t.candidateId === c.id && t.state !== 'deleted');
  const saved = e.savedIds.includes(c.id);
  const contact = () => {
    if (chat) return nav(`/hire/messages/${chat.id}`);
    if (c.today && !e.verified) return setSheet('verify');
    setSheet(e.plan === 'free' ? 'paywall' : 'contact');
  };
  return (
    <>
      <ProfileView
        c={c}
        back={{ to: '/hire', label: 'Talent' }}
        actions={
          <>
            <Btn h={56} full icon="message" onClick={contact}>
              {chat ? (chat.request === 'pending' ? 'Request sent · Open chat' : 'Open chat') : 'Contact candidate'}
            </Btn>
            <div className="row g8">
              <Btn kind="secondary" h={44} icon="download" style={{ flex: 1 }} onClick={() => toast('CV downloaded', 'download')}>
                CV
              </Btn>
              <Btn kind="secondary" h={44} icon={saved ? 'bookmark-filled' : 'bookmark'} style={{ flex: 1 }} onClick={() => toast(e.toggleSaved(c.id) ? 'Saved' : 'Removed from saved', 'bookmark')}>
                {saved ? 'Saved' : 'Save'}
              </Btn>
              <Btn kind="secondary" h={44} icon="share" style={{ flex: 1 }} onClick={() => (navigator.clipboard?.writeText(location.href).catch(() => undefined), toast('Link copied', 'link'))}>
                Share
              </Btn>
            </div>
          </>
        }
      />
      {sheet === 'contact' ? (
        <Modal onClose={() => setSheet(null)} label={`Contact ${first}`} width={540}>
          <ModalHead title={`Contact ${first} directly`} onClose={() => setSheet(null)} />
          <div className="row g14 inset" style={{ borderRadius: 18 }}>
            <Avatar src={c.photo} size={52} />
            <div className="grow">
              <div className="s16 strong">{c.name}</div>
              <div className="s14 muted">
                {c.role} · {c.city}
              </div>
            </div>
            <Pill tone="orange" icon="star">
              Premium
            </Pill>
          </div>
          <div>
            <div className="s14 strong" style={{ marginBottom: 8 }}>
              Message <span className="muted semi">· optional</span>
            </div>
            <label className="field area">
              <textarea value={msg} onChange={(ev) => setMsg(ev.target.value.slice(0, 500))} rows={4} placeholder={`Say what the job is about — it helps ${first} decide faster`} aria-label="Message" autoFocus />
            </label>
          </div>
          <div className="row g10 s14" style={{ padding: '12px 14px', borderRadius: 14, background: 'var(--primary-secondary)', color: 'var(--link)' }}>
            <Icon name="message" size={18} />
            {first} gets a contact request. You can chat once they accept it.
          </div>
          <Btn
            h={56}
            full
            onClick={() => {
              const tid = e.requestContact(c.id, msg);
              setSheet(null);
              toast(`Request sent. You can chat once ${first} accepts it`, 'message');
              nav(`/hire/messages/${tid}`);
            }}
          >
            Send request
          </Btn>
        </Modal>
      ) : null}
      {sheet === 'paywall' ? (
        <Modal onClose={() => setSheet(null)} label="919 Premium" width={520}>
          <div className="row between">
            <Pill tone="orange" icon="star" h={28}>
              919 Premium
            </Pill>
            <button className="iconbtn soft" aria-label="Close" onClick={() => setSheet(null)}>
              <Icon name="cancel" />
            </button>
          </div>
          <div>
            <h2 className="display d3">Write to {first} directly</h2>
            <p className="muted lh" style={{ marginTop: 8 }}>
              On the Free plan you can chat only with candidates who applied to your vacancy.
            </p>
          </div>
          {(
            [
              ['message', 'Message any candidate directly', 'From their profile, video or search — without waiting for an application'],
              ['briefcase', 'Unlimited active vacancies', 'Free plan includes 1 active vacancy at a time'],
            ] as const
          ).map(([i, t, x]) => (
            <div key={t} className="row top g14">
              <span className="tile" style={{ width: 44, height: 44, background: 'var(--premium-back)', color: 'var(--premium-strong)', borderRadius: 14 }}>
                <Icon name={i} />
              </span>
              <div>
                <div className="s16 strong">{t}</div>
                <div className="s14 muted" style={{ marginTop: 2 }}>
                  {x}
                </div>
              </div>
            </div>
          ))}
          <div className="row between" style={{ padding: 18, borderRadius: 18, border: '2px solid var(--premium)' }}>
            <div>
              <div className="s16 strong">Monthly</div>
              <div className="small muted">Renews automatically · cancel any time</div>
            </div>
            <div className="s20 strong">
              $3.99 <span className="s14 muted semi">/ month</span>
            </div>
          </div>
          <Btn kind="premium" h={56} full onClick={() => (e.setPlan('premium'), setSheet('contact'), toast('You’re on Premium', 'star'))}>
            Subscribe for $3.99 / month
          </Btn>
          <button className="link s14" onClick={() => setSheet(null)}>
            Not now
          </button>
          <p className="small muted" style={{ textAlign: 'center', marginTop: -8 }}>
            Billed monthly to your card. Terms · Privacy
          </p>
        </Modal>
      ) : null}
      {sheet === 'verify' ? (
        <Modal onClose={() => setSheet(null)} label="Verify your company to message" width={500}>
          <ModalHead title="Verify your company to message" sub="People available today can be contacted only by companies with the verified badge. It keeps them safe. Upload your trade licence — we check it within 24 hours." onClose={() => setSheet(null)} />
          <Btn h={56} full icon="shield" to="/company/verification">
            Upload trade licence
          </Btn>
        </Modal>
      ) : null}
    </>
  );
}
