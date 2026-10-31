// Applications: Applied (with status filter), Saved, Active (hired), Archive. Hire confirmation on accepted ones.
import { useState } from 'react';
import { findVacancy } from '../../data/mock';
import { contractTypes } from '../../data/dictionaries';
import { hireAnswerLabel, useSeeker, type Application, type AppStatus, type HireAnswer } from '../../data/seeker';
import type { Vacancy } from '../../data/types';
import { Link } from '../../lib/links';
import { money } from '../../ui/domain';
import { Btn, Empty, Icon, Modal, ModalHead, Option, Pill, Tabs, useToast, type PillTone } from '../../ui/kit';

type Tab = 'applied' | 'saved' | 'active' | 'archive';
type Filter = 'all' | 'pending' | 'accepted' | 'declined';
const chip: Record<AppStatus, { tone: PillTone; label: string; icon?: 'check' | 'cancel' | 'clock' }> = {
  pending: { tone: 'gray', label: 'Pending', icon: 'clock' },
  accepted: { tone: 'green', label: 'Accepted', icon: 'check' },
  declined: { tone: 'red', label: 'Declined', icon: 'cancel' },
  hired: { tone: 'green', label: 'Hired', icon: 'check' },
  closed: { tone: 'gray', label: 'Closed', icon: 'clock' },
};

function AppCard({ v, top, footer, extra }: { v: Vacancy; top?: React.ReactNode; footer: React.ReactNode; extra?: React.ReactNode }) {
  return (
    <article className="card" style={{ padding: 20, gap: 14 }}>
      <Link to={`/vacancy/${v.id}`} className="row top g14" style={{ color: 'var(--text-headline)' }}>
        <img src={v.cover} alt="" className="ph-cover" style={{ width: 56, height: 56, borderRadius: 16, flex: 'none' }} />
        <div className="grow">
          <div className="s16 strong ellipsis">{v.title}</div>
          <div className="s14 muted">
            {v.company.name} · {v.city}
          </div>
          <div className="s14 strong" style={{ marginTop: 4 }}>
            {money(v.pay.amount)} <span className="muted semi">{contractTypes[v.pay.contract].suffix}</span>
          </div>
        </div>
        {top}
      </Link>
      <div className="row g8 wrap" style={{ paddingTop: 12, borderTop: '1px solid var(--divider)' }}>
        {footer}
      </div>
      {extra}
    </article>
  );
}

const ANSWERS: { k: HireAnswer; label: string }[] = [
  { k: 'yes', label: 'Got the job' },
  { k: 'process', label: 'Still in process' },
  { k: 'no', label: 'Didn’t work out' },
];

function HireModal({ a, onClose }: { a: Application; onClose: () => void }) {
  const s = useSeeker();
  const toast = useToast();
  const v = findVacancy(a.vacancyId)!;
  const [pick, setPick] = useState<HireAnswer | null>(null);
  return (
    <Modal onClose={onClose} label="Did you get this job?" width={500}>
      <ModalHead title="Did you get this job?" sub={`${v.company.name} accepted your application${a.acceptedOn ? ` on ${a.acceptedOn}` : ''}. Your answer helps others see real hires.`} onClose={onClose} />
      <div className="col g10">
        {ANSWERS.map((x) => (
          <Option key={String(x.k)} on={pick === x.k} onClick={() => setPick(x.k)}>
            {x.label}
          </Option>
        ))}
      </div>
      <Btn
        h={56}
        full
        disabled={!pick}
        onClick={() => {
          s.answerHire(a.vacancyId, pick!);
          onClose();
          toast('Thanks, answer saved');
        }}
      >
        Save answer
      </Btn>
    </Modal>
  );
}

export function Applications() {
  const s = useSeeker();
  const toast = useToast();
  const [tab, setTab] = useState<Tab>('applied');
  const [filter, setFilter] = useState<Filter>('all');
  const [ask, setAsk] = useState<Application | null>(null);
  const appliedAll = s.apps.filter((a) => !a.archived && ['pending', 'accepted', 'declined'].includes(a.status));
  const count = (f: Filter) => (f === 'all' ? appliedAll.length : appliedAll.filter((a) => a.status === f).length);
  const applied = filter === 'all' ? appliedAll : appliedAll.filter((a) => a.status === filter);
  const active = s.apps.filter((a) => !a.archived && a.status === 'hired');
  const archive = s.apps.filter((a) => a.archived);
  const savedList = s.saved.map(findVacancy).filter(Boolean) as Vacancy[];
  const footer = (a: Application) => (
    <>
      <Pill tone={chip[a.status].tone} icon={chip[a.status].icon}>
        {chip[a.status].label}
      </Pill>
      <span className="s14 muted grow">{a.note}</span>
      {a.chatId ? (
        <Link to={`/seeker/messages/${a.chatId}`} className="link s14 row g6">
          <Icon name="message" size={16} />
          Chat
        </Link>
      ) : null}
    </>
  );
  const grid = (items: React.ReactNode) => <div className="grid2" style={{ gap: 16 }}>{items}</div>;
  return (
    <main className="page">
      <div className="row between wrap g16" style={{ marginTop: 8 }}>
        <h1 className="display d1">Applications</h1>
        <Tabs<Tab>
          items={[
            { key: 'applied', label: 'Applied', n: appliedAll.length },
            { key: 'saved', label: 'Saved', n: savedList.length },
            { key: 'active', label: 'Active', n: active.length },
            { key: 'archive', label: 'Archive', n: archive.length },
          ]}
          value={tab}
          onChange={setTab}
        />
      </div>
      <div className="stack mt24">
        {tab === 'applied' ? (
          <>
            <div className="chips scroll">
              {(['all', 'pending', 'accepted', 'declined'] as Filter[]).map((f) => (
                <button key={f} className={`chip${filter === f ? ' on' : ''}`} onClick={() => setFilter(f)}>
                  {f[0].toUpperCase() + f.slice(1)}
                  <span className="n">{count(f)}</span>
                </button>
              ))}
            </div>
            {applied.length ? (
              grid(
                applied.map((a) => {
                  const v = findVacancy(a.vacancyId);
                  return v ? (
                    <AppCard
                      key={a.vacancyId}
                      v={v}
                      footer={footer(a)}
                      extra={
                        a.status === 'accepted' ? (
                          <div className="row g10" style={{ padding: '12px 14px', borderRadius: 14, background: 'var(--attention-back)' }}>
                            <span className="grow s14 strong" style={{ color: 'var(--attention-text)' }}>
                              {a.answer ? `Your answer: ${hireAnswerLabel(a.answer)}` : 'Did you get this job?'}
                            </span>
                            <Btn kind="secondary" h={40} onClick={() => setAsk(a)}>
                              {a.answer ? 'Change' : 'Answer'}
                            </Btn>
                          </div>
                        ) : undefined
                      }
                    />
                  ) : null;
                }),
              )
            ) : (
              <Empty icon="briefcase" title={filter === 'all' ? 'No applications yet' : `No ${filter} applications`} text="Apply to vacancies that fit you and track every status here — pending, accepted or declined." action={<Btn icon="search" to="/seeker">Browse vacancies</Btn>} />
            )}
          </>
        ) : null}
        {tab === 'saved' ? (
          savedList.length ? (
            <>
              <p className="s14 muted">
                {savedList.length} saved vacanc{savedList.length === 1 ? 'y' : 'ies'} · we will remind you before they close
              </p>
              {grid(
                savedList.map((v, i) => (
                  <AppCard
                    key={v.id}
                    v={v}
                    top={
                      <button
                        className="iconbtn"
                        aria-label="Remove from saved"
                        style={{ color: 'var(--link)' }}
                        onClick={(e) => {
                          e.preventDefault();
                          s.toggleSaved(v.id);
                          toast('Removed from saved', 'bookmark');
                        }}
                      >
                        <Icon name="bookmark-filled" size={18} />
                      </button>
                    }
                    footer={
                      <>
                        <span className="s14 grow" style={{ color: i === 0 ? 'var(--attention-text)' : 'var(--text-body)' }}>
                          {i === 0 ? 'Closes in 2 days' : `Posted ${v.postedAgo.toLowerCase()}`}
                        </span>
                        {s.appFor(v.id) ? (
                          <span className="s14 semi muted">Applied</span>
                        ) : (
                          <Link to={`/vacancy/${v.id}`} className="link s14">
                            Apply
                          </Link>
                        )}
                      </>
                    }
                  />
                )),
              )}
            </>
          ) : (
            <Empty icon="bookmark" title="No saved vacancies" text="Tap the bookmark on a vacancy to keep it here. We remind you before it closes." action={<Btn icon="search" to="/seeker">Browse vacancies</Btn>} />
          )
        ) : null}
        {tab === 'active' ? (
          active.length ? (
            grid(active.map((a) => findVacancy(a.vacancyId) && <AppCard key={a.vacancyId} v={findVacancy(a.vacancyId)!} footer={footer(a)} />))
          ) : (
            <Empty icon="briefcase" title="No active jobs" text="When you confirm a hire, the job shows here until it ends." />
          )
        ) : null}
        {tab === 'archive' ? (
          archive.length ? (
            grid(archive.map((a) => findVacancy(a.vacancyId) && <AppCard key={a.vacancyId} v={findVacancy(a.vacancyId)!} footer={footer(a)} />))
          ) : (
            <Empty icon="clock" title="Archive is empty" text="Closed vacancies and finished jobs move here." />
          )
        ) : null}
      </div>
      {ask ? <HireModal a={ask} onClose={() => setAsk(null)} /> : null}
    </main>
  );
}
