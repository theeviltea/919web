// Employer vacancies: hub (KPIs, status filter, saved talent), own vacancy page with actions, applicants.
import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { company, savedLabels, useEmployer, type HireStatus, type MyVacancy } from '../../data/employer';
import { applicantLine, asPublicVacancy, candidateOf } from '../../data/hiring';
import { findCandidate } from '../../data/talentPool';
import { contractTypes } from '../../data/dictionaries';
import type { ApplicantStatus } from '../../data/hiring';
import { Link } from '../../lib/links';
import { VacancyBody } from '../seeker/Vacancy';
import { candidateCard, money } from '../../ui/domain';
import { Btn, Card, Crumbs, Empty, Icon, IconBtn, Modal, ModalHead, Option, Pill, SearchBox, Tabs, TierBadge, useToast } from '../../ui/kit';

const fmtDay = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
const ARCHIVE_REASONS = [
  { key: 'hired', title: 'Hired through 919', note: 'hired via 919' },
  { key: 'elsewhere', title: 'Hired elsewhere', note: 'hired elsewhere' },
  { key: 'cancelled', title: 'No longer needed', note: 'not needed' },
] as const;

export function StatusPill({ v }: { v: MyVacancy }) {
  if (v.status === 'active') return <Pill tone="green">Active</Pill>;
  if (v.status === 'review') return <Pill tone="gray" icon="clock">On review</Pill>;
  if (v.status === 'changes') return <Pill tone="yellow" icon="edit">Changes needed</Pill>;
  if (v.status === 'rejected') return <Pill tone="red" icon="cancel">Rejected</Pill>;
  return <Pill tone="gray">In archive</Pill>;
}

function useActions() {
  const e = useEmployer();
  const toast = useToast();
  return {
    urgent: (v: MyVacancy) => {
      e.updateVacancy(v.id, { urgentLeft: '24 h left', urgentInfo: { left: '24 h left · started just now', progress: 1, views: 0, applicants: 0 } });
      toast('Urgent is on for 24 hours', 'fire');
    },
    archive: (v: MyVacancy, note: string) => {
      e.updateVacancy(v.id, { status: 'archive', note: `Closed ${fmtDay(new Date())} · ${note}`, urgentLeft: undefined, urgentInfo: undefined, daysLeft: undefined });
      toast('Moved to archive. Waiting candidates got a notice', 'clock');
    },
    relaunch: (v: MyVacancy) => {
      const until = fmtDay(new Date(Date.now() + 7 * 864e5));
      e.updateVacancy(v.id, { status: 'active', daysLeft: 7, note: `7 of 7 days left · until ${until}`, detail: v.detail && { ...v.detail, posted: 'Just now' } });
      toast(`Relaunched · live until ${until}`, 'flash');
    },
  };
}

function CloseModal({ v, onClose }: { v: MyVacancy; onClose: () => void }) {
  const a = useActions();
  const [r, setR] = useState<string>('hired');
  return (
    <Modal onClose={onClose} label="Close vacancy" width={480}>
      <ModalHead title="Close this vacancy?" sub="It stops receiving applicants now instead of after 7 days. You can relaunch it from Archive any time." onClose={onClose} />
      <div className="col g10">
        {ARCHIVE_REASONS.map((x) => (
          <Option key={x.key} on={r === x.key} onClick={() => setR(x.key)}>
            {x.title}
          </Option>
        ))}
      </div>
      <Btn kind="danger" h={52} full onClick={() => (a.archive(v, ARCHIVE_REASONS.find((x) => x.key === r)!.note), onClose())}>
        Close vacancy
      </Btn>
    </Modal>
  );
}

function VacCard({ v }: { v: MyVacancy }) {
  const a = useActions();
  const e = useEmployer();
  const [close, setClose] = useState(false);
  const apps = e.applicants[v.id] ?? [];
  const fresh = apps.filter((x) => x.status === 'new').length;
  return (
    <article className="card" style={{ padding: 22, gap: 14 }}>
      <div className="row top g14">
        <Link to={`/my-vacancy/${v.id}`} style={{ display: 'contents', color: 'inherit' }}>
          <img src={v.cover} alt="" className="ph-cover" style={{ width: 56, height: 56, borderRadius: 16, flex: 'none' }} />
          <div className="grow">
            <div className="s17 strong">{v.title}</div>
            <div className="small muted" style={{ marginTop: 2 }}>
              {v.meta}
            </div>
            <div className="row g6 wrap" style={{ marginTop: 8 }}>
              <StatusPill v={v} />
              {v.urgentLeft ? (
                <Pill tone="urgent" icon="fire">
                  Urgent · {v.urgentLeft}
                </Pill>
              ) : null}
            </div>
          </div>
        </Link>
        <IconBtn icon="more" label="Vacancy actions" to={`/my-vacancy/${v.id}`} />
      </div>
      <div className="small muted">{v.note}</div>
      {v.changes ? <div className="s14 lh" style={{ padding: '10px 12px', borderRadius: 12, background: 'var(--attention-back)', color: 'var(--attention-text)' }}>The 919 team asks to fix: {v.changes.summary}</div> : null}
      {v.rejected ? <div className="s14 lh" style={{ padding: '10px 12px', borderRadius: 12, background: 'var(--danger-back)', color: 'var(--danger-text)' }}>Rejected: {v.rejected.short}</div> : null}
      <div className="row between g12" style={{ paddingTop: 14, borderTop: '1px solid var(--divider)' }}>
        <span className="s15 semi">
          {v.status === 'review' ? (
            'Applicants appear after publication'
          ) : (
            <>
              {apps.length || v.applicants || 0} applicants{fresh ? <span style={{ color: 'var(--link)' }}> · {fresh} new</span> : null}
            </>
          )}
        </span>
        {v.status === 'active' ? (
          <div className="row g8">
            <Btn kind="secondary" h={40} onClick={() => setClose(true)}>
              Close
            </Btn>
            <Btn h={40} to={`/my-vacancy/${v.id}/applicants`}>
              Applicants
            </Btn>
          </div>
        ) : v.status === 'archive' ? (
          <Btn kind="tonal" h={40} icon="flash" onClick={() => a.relaunch(v)}>
            Relaunch for 7 days
          </Btn>
        ) : v.status === 'changes' ? (
          <Btn kind="secondary" h={40} to={`/post?edit=${v.id}`}>
            Fix and resubmit
          </Btn>
        ) : null}
      </div>
      {close ? <CloseModal v={v} onClose={() => setClose(false)} /> : null}
    </article>
  );
}

type F = 'all' | HireStatus;
export function MyVacancies() {
  const e = useEmployer();
  const toast = useToast();
  const [tab, setTab] = useState<'mine' | 'saved'>('mine');
  const [f, setF] = useState<F>('all');
  const [q, setQ] = useState('');
  const n = (s: HireStatus) => e.vacancies.filter((v) => v.status === s).length;
  const query = q.trim().toLowerCase();
  // Search in My vacancies: title, role, city and description (app: EmpHiringSearch).
  const hay = (v: (typeof e.vacancies)[number]) => [v.title, v.meta, v.note, v.detail?.description, v.detail?.role, v.detail?.city].filter(Boolean).join(' ').toLowerCase();
  const list = e.vacancies.filter((v) => (f === 'all' || v.status === f) && (!query || hay(v).includes(query)));
  const saved = e.savedIds.map(findCandidate).filter(Boolean);
  const hired = Object.values(e.hireAnswers).reduce((s, x) => s + Object.values(x).filter((a) => a === 'hired').length, 0);
  return (
    <main className="page">
      <div className="row between wrap g16" style={{ marginTop: 8, alignItems: 'flex-end' }}>
        <h1 className="display d1">Vacancies</h1>
        <Tabs
          items={[
            { key: 'mine', label: 'My vacancies', n: e.vacancies.length },
            { key: 'saved', label: 'Saved talent', n: saved.length },
          ]}
          value={tab}
          onChange={setTab}
        />
      </div>
      {tab === 'mine' ? (
        <>
          <div className="grid4 vstats mt24">
            <div className="stat">
              <div className="n">{n('active')}</div>
              <div className="s14 semi" style={{ marginTop: 4 }}>
                Active vacancies
              </div>
              <div className="small muted">{n('review')} on review</div>
            </div>
            <div className="stat">
              <div className="n">{e.freshTotal}</div>
              <div className="s14 semi" style={{ marginTop: 4 }}>
                New applicants
              </div>
              <div className="small muted">since yesterday</div>
            </div>
            <div className="stat">
              <div className="n">{hired}</div>
              <div className="s14 semi" style={{ marginTop: 4 }}>
                Hired this month
              </div>
              <div className="small muted">confirmed by both</div>
            </div>
            <section className="stat col g10" style={{ background: 'var(--attention-back)' }}>
              <div className="row g8 s15 strong">
                <Icon name="fire" size={18} />
                Need people fast?
              </div>
              <div className="small lh primary-text">Urgent hiring puts a vacancy at the top of the feed for 24 hours.</div>
              <span className="s14 strong">$2.99 once</span>
            </section>
          </div>
          <div className="row g12 wrap mt24 vac-tools">
            <div style={{ flex: '1 1 260px', maxWidth: 420 }}>
              <SearchBox value={q} onChange={setQ} placeholder="Search my vacancies" />
            </div>
          </div>
          <div className="chips mt16">
            {(
              [
                ['all', 'All', e.vacancies.length],
                ['active', 'Active', n('active')],
                ['review', 'On review', n('review')],
                ['changes', 'Changes needed', n('changes')],
                ['rejected', 'Rejected', n('rejected')],
                ['archive', 'Archive', n('archive')],
              ] as [F, string, number][]
            )
              .filter(([k, , c]) => k === 'all' || c)
              .map(([k, l, c]) => (
                <button key={k} className={`chip${f === k ? ' on' : ''}`} onClick={() => setF(k)}>
                  {l} <span className="n">{c}</span>
                </button>
              ))}
          </div>
          <div className="grid2 mt16" style={{ gap: 16 }}>
            {list.map((v) => (
              <VacCard key={v.id} v={v} />
            ))}
          </div>
          {!list.length && query ? <Empty icon="search" title={`Nothing found for “${q.trim()}”`} text="Search looks in the title, role, city and description of your vacancies." action={<Btn kind="secondary" onClick={() => setQ('')}>Clear search</Btn>} /> : null}
          {!list.length && !query ? <Empty icon="briefcase" title="No vacancies here" text="Post a vacancy — it goes live after a quick check by the 919 team." action={<Btn icon="add" to="/post">Post a vacancy</Btn>} /> : null}
        </>
      ) : (
        <div className="grid6 mt24">
          {saved.map((c) => (
            <div key={c!.id} className="col g6">
              {candidateCard(c!, `/talent/${c!.id}`, { saved: true, onSave: () => (e.toggleSaved(c!.id), toast('Removed from saved', 'bookmark')) })}
              <span className="small muted">{savedLabels[c!.id] ?? 'Saved'}</span>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

export function MyVacancyPage() {
  const { id = '' } = useParams();
  const e = useEmployer();
  const a = useActions();
  const toast = useToast();
  const nav = useNavigate();
  const [modal, setModal] = useState<'close' | 'urgent' | 'delete' | null>(null);
  const v = e.vacancies.find((x) => x.id === id);
  if (!v || !v.detail) return <Navigate to="/hire/vacancies" replace />;
  const d = v.detail;
  const pub = asPublicVacancy(v, d, { name: e.info.name || company.name, initials: company.initials, verified: e.verified });
  const apps = e.applicants[v.id] ?? [];
  const fresh = apps.filter((x) => x.status === 'new').length;
  const banner =
    v.status === 'changes' && v.changes ? (
      <section className="card" style={{ background: 'var(--attention-back)', gap: 10 }}>
        <div className="row g8 s16 strong" style={{ color: 'var(--attention-text)' }}>
          <Icon name="edit" />
          Changes needed · {v.changes.at}
        </div>
        <ul className="col g6 primary-text" style={{ listStyle: 'disc', paddingLeft: 20 }}>
          {v.changes.items.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
        <Btn h={44} to={`/post?edit=${v.id}`} style={{ alignSelf: 'flex-start' }}>
          Fix and resubmit
        </Btn>
      </section>
    ) : v.status === 'rejected' && v.rejected ? (
      <section className="card" style={{ background: 'var(--danger-back)', gap: 10 }}>
        <div className="row g8 s16 strong danger">
          <Icon name="cancel" />
          Rejected · {v.rejected.at}
        </div>
        <p className="primary-text lh">{v.rejected.reason}</p>
        {v.rejected.refund ? <p className="s14 muted">Urgent hiring $2.99 will be refunded within 3 business days.</p> : null}
      </section>
    ) : v.status === 'review' ? (
      <section className="card row g12" style={{ background: 'var(--primary-secondary)', flexDirection: 'row' }}>
        <Icon name="clock" />
        <span className="grow">On review · {v.note}. Moderation usually takes up to 2 hours.</span>
      </section>
    ) : v.urgentInfo ? (
      <section className="card" style={{ background: 'var(--attention-back)', gap: 10 }}>
        <div className="row g8 s16 strong">
          <Icon name="fire" />
          Urgent · {v.urgentInfo.left}
        </div>
        <div style={{ height: 8, borderRadius: 999, background: 'var(--back-darker)' }}>
          <div style={{ width: `${v.urgentInfo.progress * 100}%`, height: 8, borderRadius: 999, background: 'var(--urgent)' }} />
        </div>
        <div className="s14 primary-text">
          {v.urgentInfo.views} views · {v.urgentInfo.applicants} applicants since it went urgent
        </div>
      </section>
    ) : v.status === 'active' ? (
      <section className="card row g16" style={{ background: 'var(--attention-back)', flexDirection: 'row', alignItems: 'center' }}>
        <span className="tile" style={{ width: 48, height: 48, background: 'var(--urgent)', color: '#18191C', borderRadius: 16 }}>
          <Icon name="fire" size={24} />
        </span>
        <div className="grow">
          <div className="s17 strong">Need people fast?</div>
          <div className="s14 primary-text" style={{ marginTop: 2 }}>
            Make it urgent: top of the feed and a hot badge for 24 h
          </div>
        </div>
        <Btn kind="ink" h={48} onClick={() => setModal('urgent')}>
          Make urgent · $2.99
        </Btn>
      </section>
    ) : null;
  const side = (
    <>
      <Card style={{ gap: 14 }}>
        <div className="row between">
          <StatusPill v={v} />
          <span className="small muted">{v.note}</span>
        </div>
        <div className="row base g8">
          <span className="display" style={{ fontSize: 30 }}>
            {money(d.amount, d.currency)}
          </span>
          <span className="muted">{d.amount === undefined ? '' : contractTypes[d.contract].suffix}</span>
        </div>
        {v.status === 'active' || v.status === 'archive' ? (
          <Btn h={56} full icon="users" to={`/my-vacancy/${v.id}/applicants`}>
            {fresh ? `${fresh} new applicants` : `${apps.length} applicants`}
          </Btn>
        ) : null}
        <div className="row g8">
          <Btn kind="secondary" icon="edit" style={{ flex: 1 }} to={`/post?edit=${v.id}`}>
            Edit
          </Btn>
          <Btn kind="secondary" icon="share" style={{ flex: 1 }} onClick={() => (navigator.clipboard?.writeText(`${location.origin}/v/${v.id}`).catch(() => undefined), toast('Link copied', 'link'))}>
            Share
          </Btn>
        </div>
        {v.status === 'active' ? (
          <button className="strong danger" style={{ height: 36 }} onClick={() => setModal('close')}>
            Close vacancy
          </button>
        ) : v.status === 'archive' ? (
          <Btn kind="tonal" icon="flash" onClick={() => a.relaunch(v)}>
            Relaunch for 7 days
          </Btn>
        ) : (
          <button className="strong danger" style={{ height: 36 }} onClick={() => setModal('delete')}>
            Delete vacancy
          </button>
        )}
      </Card>
      <div className="grid2" style={{ gap: 12 }}>
        <div className="stat">
          <div className="n">{d.views.toLocaleString('en-US').replace(/,/g, ' ')}</div>
          <div className="s14 semi">Views</div>
        </div>
        <div className="stat">
          <div className="n">{apps.length}</div>
          <div className="s14 semi">Applicants</div>
          <div className="small muted">{fresh} new</div>
        </div>
      </div>
    </>
  );
  return (
    <main className="page">
      <Crumbs back={{ to: '/hire/vacancies', label: 'Vacancies' }} items={[d.category, v.title]} />
      <VacancyBody v={pub} side={side} fit={banner} />
      {modal === 'close' ? <CloseModal v={v} onClose={() => setModal(null)} /> : null}
      {modal === 'urgent' ? (
        <Modal onClose={() => setModal(null)} label="Urgent hiring" width={480}>
          <ModalHead lead={<span className="tile" style={{ width: 52, height: 52, background: 'var(--urgent)', color: '#18191C', borderRadius: 16 }}><Icon name="fire" size={26} /></span>} title="Urgent hiring · $2.99" sub="The vacancy is pinned to the top of the feed and search for 24 hours, gets a hot Urgent badge and appears in the Urgent tab of candidates’ filters." onClose={() => setModal(null)} />
          <Btn kind="urgent" h={56} full onClick={() => (a.urgent(v), setModal(null))}>
            Pay $2.99
          </Btn>
        </Modal>
      ) : null}
      {modal === 'delete' ? (
        <Modal onClose={() => setModal(null)} label="Delete vacancy" width={440}>
          <ModalHead title="Delete this vacancy?" sub="It disappears for you and candidates. This can’t be undone." onClose={() => setModal(null)} />
          <Btn kind="danger" h={52} full onClick={() => (e.removeVacancy(v.id), toast('Vacancy deleted', 'trash'), nav('/hire/vacancies'))}>
            Delete
          </Btn>
        </Modal>
      ) : null}
    </main>
  );
}

export function ApplicantsPage() {
  const { id = '' } = useParams();
  const e = useEmployer();
  const nav = useNavigate();
  const toast = useToast();
  const [tab, setTab] = useState<ApplicantStatus>('new');
  const v = e.vacancies.find((x) => x.id === id);
  if (!v) return <Navigate to="/hire/vacancies" replace />;
  const apps = e.applicants[v.id] ?? [];
  const list = apps.filter((x) => x.status === tab).sort((a, b) => a.ago - b.ago);
  const n = (s: ApplicantStatus) => apps.filter((x) => x.status === s).length;
  return (
    <main className="page">
      <Crumbs back={{ to: `/my-vacancy/${v.id}`, label: 'Vacancies' }} items={[v.title, 'Applicants']} />
      <div className="row between wrap g16 mt16" style={{ alignItems: 'flex-end' }}>
        <div>
          <h1 className="display d2">{v.title}</h1>
          <div className="row g8 s14 muted" style={{ marginTop: 8 }}>
            <StatusPill v={v} />
            {v.note}
          </div>
        </div>
        <Tabs<ApplicantStatus>
          items={[
            { key: 'new', label: 'New', n: n('new') },
            { key: 'accepted', label: 'Accepted', n: n('accepted') },
            { key: 'declined', label: 'Declined', n: n('declined') },
          ]}
          value={tab}
          onChange={setTab}
        />
      </div>
      <div className="row between s14 muted mt24">
        {list.length} {tab} · newest first
        <span className="row g6 strong" style={{ color: 'var(--text-headline)' }}>
          <Icon name="sort" size={16} />
          Newest
        </span>
      </div>
      {list.length ? (
        <div className="grid4 mt16">
          {list.map((x) => {
            const c = candidateOf(x);
            if (!c) return null;
            return (
              <article key={x.candidateId} className="card" style={{ padding: 16, gap: 14 }}>
                <Link to={`/talent/${c.id}`} className="rel" style={{ display: 'block' }}>
                  <img src={c.photo} alt="" className="ph-cover" style={{ height: 260, borderRadius: 18 }} />
                  <span className="pill white" style={{ position: 'absolute', right: 10, top: 10 }}>
                    {x.when}
                  </span>
                  {c.tier !== 'free' ? (
                    <span style={{ position: 'absolute', left: 10, top: 10 }}>
                      <TierBadge tier={c.tier} size={24} />
                    </span>
                  ) : null}
                </Link>
                <div>
                  <div className="s17 strong">{c.name}</div>
                  <div className="s14 muted" style={{ marginTop: 2 }}>
                    {applicantLine(c)}
                  </div>
                </div>
                {x.note ? <div className="inset s14 primary-text lh" style={{ padding: '10px 12px', borderRadius: 12 }}>“{x.note}”</div> : x.declinedNote ? <div className="small muted">{x.declinedNote}</div> : null}
                <span className="grow" />
                {tab === 'new' ? (
                  <div className="row g8">
                    <Btn kind="secondary" h={44} style={{ flex: 1 }} onClick={() => (e.declineApplicant(v.id, c.id), toast(`${c.name} declined`, 'cancel'))}>
                      Decline
                    </Btn>
                    <Btn
                      h={44}
                      style={{ flex: 1 }}
                      onClick={() => {
                        const tid = e.acceptApplicant(v.id, c.id);
                        toast(`${c.name} accepted · chat opened`, 'check');
                        nav(`/hire/messages/${tid}`);
                      }}
                    >
                      Accept
                    </Btn>
                  </div>
                ) : tab === 'accepted' ? (
                  <Btn kind="tonal" h={44} icon="message" full onClick={() => nav(`/hire/messages/${e.threads.find((t) => t.candidateId === c.id)?.id ?? ''}`)}>
                    Open chat
                  </Btn>
                ) : (
                  <Btn kind="secondary" h={44} full onClick={() => e.setApplicant(v.id, c.id, 'new')}>
                    Move back to new
                  </Btn>
                )}
              </article>
            );
          })}
        </div>
      ) : (
        <Empty icon="users" title={tab === 'new' ? 'No new applicants' : `No ${tab} applicants`} text="New applicants show up here. Urgent hiring brings more of them in 24 hours." />
      )}
    </main>
  );
}
