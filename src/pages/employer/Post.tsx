// Post a vacancy: Category → Basic information → Salary → Requirements → sent for review. Also edits a vacancy (?edit=id).
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { company, useEmployer, type MyVacancy } from '../../data/employer';
import { contractTypes, formatAmount } from '../../data/dictionaries';
import { fields, citiesFor, allCountries } from '../../data/registration';
import type { ContractType } from '../../data/types';
import type { Photo } from '../../data/signup';
import { FEMALE, city } from '../../data/asset';
import { Wizard } from '../../layout/Wizard';
import { PhotoGrid } from '../onboarding/Seeker';
import { Btn, Card, Field, Icon, Option, PageTitle, Pill, Select, Toggle, useToast } from '../../ui/kit';

const STEPS = ['Category', 'Basic information', 'Salary', 'Requirements'];
const CONTRACTS = Object.keys(contractTypes) as ContractType[];
const PARAMS: [string, string, 'num' | 'text' | 'flag'][] = [
  ['height', 'Height (cm)', 'num'],
  ['weight', 'Weight (kg)', 'num'],
  ['bust', 'Bust (cm)', 'num'],
  ['waist', 'Waist (cm)', 'num'],
  ['hips', 'Hips (cm)', 'num'],
  ['clothing', 'Clothing size', 'text'],
  ['shoe', 'Shoe size', 'text'],
  ['hair', 'Hair color', 'text'],
  ['appearance', 'Appearance type', 'text'],
  ['tattoos', 'Tattoos / piercings', 'flag'],
  ['catwalk', 'Catwalk experience', 'flag'],
  ['video', 'Video presentation', 'flag'],
];
const contractNote: Record<ContractType, string> = {
  'one-time': 'A single job or event, paid once.',
  'fixed-term': 'A contract for a set period, paid in full.',
  monthly: 'A regular job with a monthly salary.',
  weekly: 'Paid every week.',
  daily: 'Paid per working day.',
  hourly: 'Paid per hour worked.',
};

type Draft = {
  field?: string;
  roles: string[];
  cover?: string;
  title: string;
  description: string;
  start: string;
  country: string;
  city: string;
  photos: Photo[];
  contract: ContractType;
  mode: 'exact' | 'from' | 'negotiable';
  amount: string;
  gender: string;
  age: string;
  params: Record<string, string | boolean>;
  languages: string;
  urgent: boolean;
};

const blank: Draft = { roles: [], title: '', description: '', start: '', country: 'United Arab Emirates', city: 'Dubai', photos: [], contract: 'monthly', mode: 'exact', amount: '', gender: 'Any', age: '21–30', params: {}, languages: '', urgent: false };

function fromVacancy(v: MyVacancy): Draft {
  const d = v.detail!;
  return {
    ...blank,
    field: fields.find((f) => f.label === d.category || d.category.startsWith(f.label.split(' ')[0]))?.key ?? 'hospitality',
    roles: d.form?.roles ?? [d.role],
    cover: v.cover,
    title: v.title,
    description: d.description,
    start: d.form?.startDate ?? '',
    country: d.country,
    city: d.city,
    photos: d.photos.map((p, i) => ({ id: `e${i}`, source: p })),
    contract: d.contract,
    mode: d.amount === undefined ? 'negotiable' : d.from ? 'from' : 'exact',
    amount: d.amount ? String(d.amount) : '',
    gender: d.gender,
    age: d.age,
    params: (d.form?.params as Record<string, string | boolean>) ?? {},
    languages: d.requirements.filter((r) => /—/.test(r)).join(', '),
  };
}

function Preview({ d }: { d: Draft }) {
  return (
    <Card pad={16} style={{ gap: 10 }}>
      <div className="small strong muted">Candidates see</div>
      {d.cover ? <img src={d.cover} alt="" className="ph-cover" style={{ height: 150, borderRadius: 16 }} /> : <div style={{ height: 150, borderRadius: 16, background: 'var(--back)' }} />}
      <div>
        <div className="s16 strong">{d.title || 'Vacancy title'}</div>
        <div className="small muted" style={{ marginTop: 2 }}>
          {company.name} · {d.city}
        </div>
      </div>
      <div className="row base g6">
        <span className="s17 strong">{d.mode === 'negotiable' || !d.amount ? 'Negotiable' : `${d.mode === 'from' ? 'from ' : ''}AED ${formatAmount(Number(d.amount))}`}</span>
        <span className="small muted">{d.mode !== 'negotiable' && d.amount ? contractTypes[d.contract].suffix : ''}</span>
      </div>
      {d.urgent ? (
        <Pill tone="urgent" icon="fire">
          Urgent
        </Pill>
      ) : null}
    </Card>
  );
}

export function PostVacancy() {
  const nav = useNavigate();
  const [sp] = useSearchParams();
  const e = useEmployer();
  const toast = useToast();
  const editing = e.vacancies.find((v) => v.id === sp.get('edit'));
  const [step, setStep] = useState(0);
  const [d, setD] = useState<Draft>(() => (editing?.detail ? fromVacancy(editing) : blank));
  const [sent, setSent] = useState<MyVacancy | null>(null);
  const set = (u: Partial<Draft>) => setD({ ...d, ...u });
  const field = fields.find((f) => f.key === d.field);

  const send = () => {
    const amount = d.mode === 'negotiable' ? undefined : Number(d.amount);
    const reqs = [...(d.languages ? d.languages.split(',').map((x) => x.trim()).filter(Boolean) : []), `Age ${d.age}`, ...(d.params.video ? ['Video presentation'] : [])];
    const detail = {
      category: field?.label ?? 'Hospitality',
      contract: d.contract,
      currency: 'AED',
      amount,
      from: d.mode === 'from',
      role: d.roles.join(', ') || d.title,
      gender: d.gender,
      age: d.age,
      city: d.city,
      country: d.country,
      description: d.description,
      requirements: reqs,
      photos: d.photos.map((p) => p.source),
      posted: 'Just now',
      views: 0,
      form: { field: d.field, roles: d.roles, startDate: d.start, params: d.params, languages: [], amountMode: d.mode, currency: 'AED' },
    };
    const meta = `${field?.label ?? 'Hospitality'} · ${amount === undefined ? 'Negotiable' : `AED ${formatAmount(amount)} ${contractTypes[d.contract].suffix}`}`;
    if (editing) {
      e.resubmitVacancy(editing.id, { title: d.title, meta, cover: d.cover ?? editing.cover, detail });
      toast('Sent for review', 'clock');
      nav(`/my-vacancy/${editing.id}`);
      return;
    }
    const v: MyVacancy = {
      id: `mv${Date.now()}`,
      title: d.title,
      meta,
      cover: d.cover ?? d.photos[0]?.source ?? city.dubai1,
      status: 'review',
      note: 'Sent just now',
      detail,
      urgentLeft: d.urgent ? '24 h left' : undefined,
    };
    e.addVacancy(v);
    setSent(v);
  };

  if (sent)
    return (
      <>
        <header className="topnav">
          <div className="topnav-in">
            <span className="grow" />
            <Btn kind="secondary" h={44} to="/hire">
              Back to 919
            </Btn>
          </div>
        </header>
        <main className="page" style={{ maxWidth: 672 }}>
          <Card pad={36} style={{ gap: 24, marginTop: 40 }}>
            <span className="tile" style={{ width: 72, height: 72, borderRadius: 22, background: 'var(--success-back)', color: 'var(--success-text)' }}>
              <Icon name="check-double" size={34} />
            </span>
            <PageTitle title="Vacancy sent for review" sub="The 919 team checks every vacancy, usually within an hour. We'll notify you as soon as it goes live." size={28} />
            <div className="row g14 inset" style={{ padding: 16, borderRadius: 20 }}>
              <img src={sent.cover} alt="" className="ph-cover" style={{ width: 64, height: 64, borderRadius: 16 }} />
              <div className="grow">
                <div className="s16 strong">{sent.title}</div>
                <div className="s14 muted">
                  {d.city} · {sent.meta.split(' · ')[1]}
                  {d.start ? ` · ${d.start}` : ''}
                </div>
              </div>
              <Pill tone="white" icon="clock">
                On review
              </Pill>
            </div>
            <div className="row g10">
              <Btn kind="secondary" h={52} icon="add" style={{ flex: 1 }} onClick={() => (setSent(null), setD(blank), setStep(0))}>
                Create another
              </Btn>
              <Btn h={52} style={{ flex: 1 }} to="/hire/vacancies">
                Go to my vacancies
              </Btn>
            </div>
          </Card>
        </main>
      </>
    );

  const valid = [!!d.field && d.roles.length > 0, !!d.title.trim() && d.description.trim().length >= 20 && !!d.start && !!d.city && d.photos.length > 0, d.mode === 'negotiable' || Number(d.amount) > 0, !!d.gender && !!d.age][step];
  const next = () => (step < 3 ? setStep(step + 1) : send());
  return (
    <Wizard
      steps={STEPS}
      cur={step}
      exitTo={editing ? `/my-vacancy/${editing.id}` : '/hire/vacancies'}
      exitLabel={editing ? 'Cancel' : 'Save draft'}
      onNext={next}
      nextDisabled={!valid}
      nextLabel={step === 3 ? 'Send for review' : 'Proceed'}
      aside={step ? <Preview d={d} /> : undefined}
    >
      {step > 0 ? (
        <button className="link s14 row g6" style={{ alignSelf: 'flex-start', marginBottom: -12 }} onClick={() => setStep(step - 1)}>
          <Icon name="chevron-left" size={16} />
          Back to {STEPS[step - 1].toLowerCase()}
        </button>
      ) : null}
      {step === 0 ? (
        <>
          <PageTitle title={editing ? 'Edit vacancy' : 'Add vacancy'} sub="Choose the field and the role you are hiring for." />
          <div className="grid2" style={{ gap: 12 }}>
            {fields.map((f) =>
              f.key === d.field ? (
                <div key={f.key} className="span-all col g14" style={{ borderRadius: 20, border: '2px solid var(--primary)', padding: 20 }}>
                  <div className="row g12 s17 strong">
                    <span className="tile" style={{ width: 40, height: 40, background: 'var(--primary-secondary)', color: 'var(--link)', borderRadius: 12 }}>
                      <Icon name={f.icon} />
                    </span>
                    {f.label}
                  </div>
                  <div className="chips">
                    {f.roles.map((r) => (
                      <Option key={r} on={d.roles.includes(r)} onClick={() => set({ roles: d.roles.includes(r) ? d.roles.filter((x) => x !== r) : [...d.roles, r] })}>
                        {r}
                      </Option>
                    ))}
                  </div>
                </div>
              ) : (
                <button key={f.key} className="row g12" style={{ height: 68, borderRadius: 18, border: '1px solid var(--stroke)', padding: '0 18px', fontSize: 16, fontWeight: 600, background: 'var(--surface)', textAlign: 'left' }} onClick={() => set({ field: f.key, roles: [] })}>
                  <span className="tile" style={{ width: 40, height: 40, background: 'var(--back)', borderRadius: 12 }}>
                    <Icon name={f.icon} />
                  </span>
                  <span className="grow">{f.label}</span>
                  <Icon name="chevron-down" size={18} />
                </button>
              ),
            )}
          </div>
        </>
      ) : null}
      {step === 1 ? (
        <>
          <PageTitle title="Basic information" sub="Fill in all the fields — this is what candidates see first." />
          <div>
            <div className="s15 strong" style={{ marginBottom: 10 }}>
              Cover
            </div>
            <label className="rel ovh" style={{ display: 'block', height: 200, borderRadius: 20, cursor: 'pointer', background: 'var(--back)' }}>
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(ev) => ev.target.files?.[0] && set({ cover: URL.createObjectURL(ev.target.files[0]) })} />
              {d.cover ? <img src={d.cover} alt="" className="ph-cover" style={{ height: '100%' }} /> : null}
              <span className="btn secondary h40" style={{ position: 'absolute', right: 14, bottom: 14 }}>
                <Icon name="image" size={16} />
                {d.cover ? 'Change cover' : 'Add cover'}
              </span>
            </label>
            {!d.cover ? (
              <button className="link s14" style={{ marginTop: 8 }} onClick={() => set({ cover: FEMALE[0] })}>
                Use a sample cover
              </button>
            ) : null}
          </div>
          <div className="col g12">
            <div className="s15 strong">Details</div>
            <Field label="Title *" value={d.title} onChange={(v) => set({ title: v.slice(0, 80) })} placeholder="Models for a fashion show" />
            <Field label="Description *" value={d.description} onChange={(v) => set({ description: v })} area maxLength={1000} hint="At least 20 characters: duties, hours, what you offer." />
            <Field label="Start date *" value={d.start} onChange={(v) => set({ start: v.replace(/[^\d.]/g, '').slice(0, 10) })} placeholder="DD.MM.YYYY" inputMode="numeric" suffix={<Icon name="calendar" size={18} />} />
          </div>
          <div className="col g12">
            <div className="s15 strong">Location</div>
            <div className="grid2">
              <Select label="Country *" value={d.country} options={allCountries} onChange={(v) => set({ country: v, city: '' })} />
              <Select label="City *" value={d.city} options={citiesFor(d.country)} onChange={(v) => set({ city: v })} />
            </div>
          </div>
          <div>
            <div className="row between s15 strong" style={{ marginBottom: 10 }}>
              Photos *<span className="muted semi">{d.photos.length} of 10 · the first one is the main</span>
            </div>
            <PhotoGrid photos={d.photos} onChange={(photos) => set({ photos })} max={10} cols={6} />
          </div>
        </>
      ) : null}
      {step === 2 ? (
        <>
          <PageTitle title="Salary" sub="Candidates filter vacancies by pay, so be specific." />
          <div>
            <div className="s15 strong" style={{ marginBottom: 10 }}>
              Contract type
            </div>
            <div className="chips">
              {CONTRACTS.map((c) => (
                <Option key={c} dark on={d.contract === c} onClick={() => set({ contract: c })}>
                  {contractTypes[c].label}
                </Option>
              ))}
            </div>
            <div className="hint">{contractNote[d.contract]}</div>
          </div>
          <div>
            <div className="s15 strong" style={{ marginBottom: 10 }}>
              Amount
            </div>
            <div className="tabs full">
              {(
                [
                  ['exact', 'Exact amount'],
                  ['from', 'Amount from'],
                  ['negotiable', 'Negotiable'],
                ] as const
              ).map(([k, l]) => (
                <button key={k} className={`tab${d.mode === k ? ' on' : ''}`} onClick={() => set({ mode: k })}>
                  {l}
                </button>
              ))}
            </div>
          </div>
          {d.mode !== 'negotiable' ? (
            <div className="grid2">
              <Select label="Currency *" value="AED · UAE dirham" options={['AED · UAE dirham']} onChange={() => undefined} />
              <Field label="Amount *" value={d.amount ? formatAmount(Number(d.amount)) : ''} onChange={(v) => set({ amount: v.replace(/\D/g, '').slice(0, 7) })} inputMode="numeric" autoFocus />
            </div>
          ) : null}
          <div className="row g10 s14" style={{ padding: '12px 14px', borderRadius: 14, background: 'var(--primary-secondary)', color: 'var(--link)' }}>
            <Icon name="view" size={18} />
            Candidates will see <b>{d.mode === 'negotiable' || !d.amount ? 'Negotiable' : `${d.mode === 'from' ? 'from ' : ''}AED ${formatAmount(Number(d.amount))} · ${contractTypes[d.contract].suffix.replace('/ ', 'per ')}`}</b>
          </div>
        </>
      ) : null}
      {step === 3 ? (
        <>
          <PageTitle title="Requirements" sub="Set what matters for this role. Everything else stays open." />
          <div>
            <div className="s15 strong" style={{ marginBottom: 10 }}>
              Mandatory
            </div>
            <div className="grid2">
              <Select label="Sex *" value={d.gender} options={['Any', 'Female', 'Male']} onChange={(v) => set({ gender: v })} />
              <Select label="Age *" value={d.age} options={['18–21', '21–24', '21–25', '21–30', '25–35', '30–45', '18–60']} onChange={(v) => set({ age: v })} />
            </div>
          </div>
          <div>
            <div className="s15 strong">Additional</div>
            <div className="small muted" style={{ margin: '2px 0 10px' }}>
              Tick a parameter to set it
            </div>
            <div className="grid2" style={{ gap: 8 }}>
              {PARAMS.map(([k, l, kind]) => {
                const on = d.params[k] !== undefined && d.params[k] !== false;
                return (
                  <div key={k} className={`row g12${on ? ' selbox' : ''}`} style={{ minHeight: 52, padding: '0 14px', borderRadius: 14, border: '1px solid var(--stroke)' }}>
                    <button role="checkbox" aria-checked={on} className="row g12 grow s15 semi" style={{ height: 50, textAlign: 'left' }} onClick={() => set({ params: { ...d.params, [k]: on ? false : kind === 'flag' ? true : '' } })}>
                      <span className={`check${on ? ' on' : ''}`}>{on ? <Icon name="check" size={14} /> : null}</span>
                      {l}
                    </button>
                    {on && kind !== 'flag' ? (
                      <input aria-label={l} value={String(d.params[k] ?? '')} onChange={(ev) => set({ params: { ...d.params, [k]: ev.target.value } })} placeholder={kind === 'num' ? '170' : 'Any'} style={{ width: 90, height: 36, borderRadius: 10, border: '1px solid var(--stroke)', padding: '0 10px', background: 'var(--surface)', fontWeight: 700 }} />
                    ) : null}
                  </div>
                );
              })}
            </div>
            <div className="mt8">
              <Field label="Languages" value={d.languages} onChange={(v) => set({ languages: v })} placeholder="English — fluent, Arabic — conversational" />
            </div>
          </div>
          {!editing ? (
            <div className="row g16" style={{ padding: 20, borderRadius: 20, background: 'var(--attention-back)' }}>
              <span className="tile" style={{ width: 48, height: 48, background: 'var(--urgent)', color: '#18191C', borderRadius: 16 }}>
                <Icon name="fire" size={24} />
              </span>
              <div className="grow">
                <div className="row base g10 s17 strong wrap">
                  Urgent hiring <span>$2.99</span>
                  <span className="small muted semi">One-time purchase · lasts 24 hours</span>
                </div>
                <div className="s14 lh primary-text" style={{ marginTop: 4 }}>
                  The vacancy is pinned to the top of the feed and search, gets a hot Urgent badge and appears in the Urgent tab of candidates’ filters.
                </div>
              </div>
              <Toggle on={d.urgent} label="Urgent hiring" onChange={(v) => set({ urgent: v })} />
            </div>
          ) : null}
        </>
      ) : null}
    </Wizard>
  );
}
