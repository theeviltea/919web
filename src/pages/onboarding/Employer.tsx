// Employer sign-up: account type, representative, company (new or join), trade licence, sent for verification.
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFinishAuth } from '../../lib/auth';
import { useEmployer } from '../../data/employer';
import { useSignup, type EmployerMode } from '../../data/signup';
import { allCountries, citiesFor, companies, positions } from '../../data/registration';
import { Wizard } from '../../layout/Wizard';
import { AuthLayout, PhotoPicker } from '../auth/Auth';
import { Btn, Card, Field, Icon, IconTile, Initials, Logo, PageTitle, Pill, SearchBox, Select } from '../../ui/kit';
import { Link } from '../../lib/links';

const stepsFor = (m?: EmployerMode) => (m === 'join' ? ['Representative', 'Company'] : m === 'private' ? ['Representative'] : ['Representative', 'Company', 'Trade licence']);

function TypeOption({ icon, title, sub, on, onClick }: { icon: 'building' | 'users' | 'user'; title: string; sub: string; on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={on}
      className="row g16"
      style={{ textAlign: 'left', padding: 20, borderRadius: 20, background: 'var(--surface)', border: on ? '2px solid var(--primary)' : '1px solid var(--stroke)', boxShadow: on ? '0 0 0 4px var(--focus-ring)' : undefined }}
    >
      <IconTile icon={icon} size={52} bg={on ? 'var(--primary-secondary)' : 'var(--back)'} fg={on ? 'var(--link)' : 'var(--text-headline)'} />
      <span className="grow">
        <span className="s17 strong" style={{ display: 'block' }}>
          {title}
        </span>
        <span className="s14 muted lh" style={{ display: 'block', marginTop: 4 }}>
          {sub}
        </span>
      </span>
      <Icon name="chevron-right" />
    </button>
  );
}

export function EmpType() {
  const nav = useNavigate();
  const { employer, setEmployer } = useSignup();
  const [m, setM] = useState<EmployerMode>(employer.mode ?? 'company');
  return (
    <AuthLayout
      width={520}
      top={
        <>
          <span className="desk-only">Already have an account?</span>
          <Btn kind="secondary" h={44} to="/auth/sign-in">
            Sign in
          </Btn>
        </>
      }
    >
      <PageTitle title="How will you hire?" sub="Choose the account that fits. You can invite teammates later." />
      <div className="col g12">
        <TypeOption icon="building" title="Register a company" sub="Create the company profile, post vacancies and add your team." on={m === 'company'} onClick={() => setM('company')} />
        <TypeOption icon="users" title="Join my company" sub="I'm a representative of a company that's already on 919" on={m === 'join'} onClick={() => setM('join')} />
        <TypeOption icon="user" title="Private recruiter" sub="Post vacancies and search for candidates on your own, without a company." on={m === 'private'} onClick={() => setM('private')} />
      </div>
      <Btn
        h={56}
        full
        onClick={() => {
          setEmployer({ mode: m });
          nav('/employer/rep');
        }}
      >
        Continue
      </Btn>
    </AuthLayout>
  );
}

export function EmpRep() {
  const nav = useNavigate();
  const finish = useFinishAuth();
  const { employer: e, setEmployer } = useSignup();
  const { resetLicence } = useEmployer();
  const [f, setF] = useState({ first: e.firstName, last: e.lastName, position: e.position ?? '', email: e.email, phone: e.phone });
  const [photo, setPhoto] = useState(e.photo);
  const ok = photo && f.first.trim() && f.last.trim() && f.position && /\S+@\S+\.\S+/.test(f.email) && f.phone.replace(/\D/g, '').length >= 9;
  const steps = stepsFor(e.mode);
  return (
    <Wizard
      steps={steps}
      cur={0}
      exitTo="/"
      backTo="/employer/type"
      nextDisabled={!ok}
      nextLabel={e.mode === 'private' ? 'Create account' : 'Continue'}
      onNext={() => {
        setEmployer({ photo, firstName: f.first.trim(), lastName: f.last.trim(), position: f.position, email: f.email, phone: f.phone });
        if (e.mode === 'private') {
          resetLicence(undefined, true);
          finish({ role: 'employer', firstName: f.first, company: { name: `${f.first} ${f.last}`, status: 'approved' } });
        } else nav(e.mode === 'join' ? '/employer/join' : '/employer/company');
      }}
    >
      <PageTitle title="Who's hiring?" sub="The contact person candidates will talk to. Fields marked * are required." />
      <div className="row g18">
        <PhotoPicker src={photo} onPick={setPhoto} />
        <div>
          <div className="s16 strong">Your photo *</div>
          <div className="s14 muted" style={{ marginTop: 4 }}>
            Click the camera to change it
          </div>
        </div>
      </div>
      <div className="grid2">
        <Field label="First name *" value={f.first} onChange={(v) => setF({ ...f, first: v })} autoFocus />
        <Field label="Last name *" value={f.last} onChange={(v) => setF({ ...f, last: v })} />
        <Select label="Position *" value={f.position} options={positions} onChange={(v) => setF({ ...f, position: v })} />
        <Field label="Work email *" value={f.email} onChange={(v) => setF({ ...f, email: v })} type="email" />
        <Field
          label="Phone *"
          value={f.phone}
          onChange={(v) => !e.phoneLocked && setF({ ...f, phone: v })}
          hint={e.phoneLocked ? 'Taken from sign-in. If you signed in with email, fill in the phone instead.' : undefined}
          suffix={e.phoneLocked ? <Icon name="lock" size={18} /> : undefined}
        />
      </div>
    </Wizard>
  );
}

export function EmpCompany() {
  const nav = useNavigate();
  const { employer: e, setEmployer } = useSignup();
  const [c, setC] = useState({ ...e.company, country: e.company.country ?? 'United Arab Emirates' });
  const ok = c.name.trim() && c.city && c.phone.trim();
  return (
    <Wizard steps={stepsFor('company')} cur={1} exitTo="/" backTo="/employer/rep" nextDisabled={!ok} onNext={() => (setEmployer({ company: c }), nav('/employer/licence'))}>
      <PageTitle title="Your company" sub="Candidates see this on every vacancy. Fields marked * are required." />
      <div className="row g18">
        <PhotoPicker src={c.logo} onPick={(logo) => setC({ ...c, logo })} />
        <div>
          <div className="s16 strong">Company logo</div>
          <div className="s14 muted" style={{ marginTop: 4 }}>
            Square image, at least 400×400 px
          </div>
        </div>
      </div>
      <div className="grid2">
        <Field label="Company name *" value={c.name} onChange={(v) => setC({ ...c, name: v })} autoFocus />
        <Field label="Company phone *" value={c.phone} onChange={(v) => setC({ ...c, phone: v })} inputMode="tel" />
        <Select label="Country *" value={c.country} options={allCountries} onChange={(v) => setC({ ...c, country: v, city: undefined })} />
        <Select label="City *" value={c.city ?? ''} options={citiesFor(c.country)} onChange={(v) => setC({ ...c, city: v })} />
        <Field label="Website" value={c.website} onChange={(v) => setC({ ...c, website: v })} placeholder="skylinehospitality.ae" />
      </div>
    </Wizard>
  );
}

export function EmpJoin() {
  const nav = useNavigate();
  const { employer: e, setEmployer } = useSignup();
  const [q, setQ] = useState('');
  const [id, setId] = useState(e.joinCompanyId);
  const list = companies.filter((c) => c.name.toLowerCase().includes(q.trim().toLowerCase()));
  return (
    <Wizard steps={stepsFor('join')} cur={1} exitTo="/" backTo="/employer/rep" nextDisabled={!id} nextLabel="Send request" onNext={() => (setEmployer({ joinCompanyId: id }), nav('/employer/sent'))}>
      <PageTitle title="Find your company" sub="Pick the company you recruit for. Its admin will confirm you." />
      <SearchBox value={q} onChange={setQ} placeholder="Company name" inset />
      <div className="grid2" style={{ gap: 10 }} role="radiogroup" aria-label="Company">
        {list.map((c) => (
          <button key={c.id} role="radio" aria-checked={id === c.id} onClick={() => setId(c.id)} className={`row g14${id === c.id ? ' selbox' : ''}`} style={{ padding: 14, borderRadius: 18, border: '1px solid var(--stroke)', textAlign: 'left', background: 'var(--surface)' }}>
            {c.tint === 'brand' ? (
              <span className="tile" style={{ width: 44, height: 44, background: 'var(--primary)', borderRadius: 12 }}>
                <Logo h={14} color="#fff" />
              </span>
            ) : (
              <Initials text={c.initials} size={44} />
            )}
            <span className="grow">
              <span className="s15 strong" style={{ display: 'block' }}>
                {c.name}
              </span>
              <span className="small muted">{c.city}</span>
            </span>
            <span className={`radio${id === c.id ? ' on' : ''}`} />
          </button>
        ))}
        {!list.length ? <p className="muted span-all">No company with this name yet. Go back and register it.</p> : null}
      </div>
    </Wizard>
  );
}

export function EmpLicence() {
  const nav = useNavigate();
  const finish = useFinishAuth();
  const { employer: e, setEmployer } = useSignup();
  const { resetLicence } = useEmployer();
  const [file, setFile] = useState(e.licence);
  const done = (skip: boolean) => {
    const lic = skip ? undefined : file;
    setEmployer({ licence: lic });
    resetLicence(lic);
    finish({ role: 'employer', firstName: e.firstName, company: { name: e.company.name, status: 'pending' } });
    nav('/employer/review', { replace: true });
  };
  return (
    <Wizard
      steps={stepsFor('company')}
      cur={2}
      exitTo="/"
      backTo="/employer/company"
      nextDisabled={!file}
      nextLabel="Send for verification"
      onNext={() => done(false)}
      footNote={
        <button className="link" onClick={() => done(true)}>
          Skip, add it later
        </button>
      }
    >
      <PageTitle title="Trade licence" sub="Upload your company’s trade licence to get the verified badge. Candidates reply more often to verified employers." />
      <label className="drop" style={{ height: 220, gap: 10 }}>
        <input type="file" accept="application/pdf" style={{ display: 'none' }} onChange={(ev) => ev.target.files?.[0] && setFile({ name: ev.target.files[0].name, size: `${(ev.target.files[0].size / 1048576).toFixed(1)} MB` })} />
        <IconTile icon="file" size={64} bg="var(--primary-secondary)" fg="var(--link)" />
        <span className="s17">{file ? file.name : 'Upload trade licence'}</span>
        <span className="s14 muted semi">{file ? `${file.size} · click to replace` : 'Drag a file here or click to choose · PDF, up to 10 MB'}</span>
      </label>
      <div className="grid3" style={{ gap: 12 }}>
        {(
          [
            ['lock', 'Only the 919 team sees this file. Candidates never do.'],
            ['clock', 'We check it within 24 hours.'],
            ['verified', 'After the check, the badge appears next to your company name on vacancies, the company page and in chats.'],
          ] as const
        ).map(([i, t]) => (
          <div key={t} className="row top g12 inset" style={{ padding: 16 }}>
            <span style={{ color: 'var(--link)', display: 'flex' }}>
              <Icon name={i} />
            </span>
            <span className="s14 lh primary-text">{t}</span>
          </div>
        ))}
      </div>
    </Wizard>
  );
}

function StatusPage({ icon, title, sub, steps, foot, actions }: { icon: 'shield' | 'clock'; title: string; sub: string; steps: [string, boolean, string?][]; foot: string; actions: React.ReactNode }) {
  return (
    <>
      <header className="topnav">
        <div className="topnav-in">
          <Link to="/">
            <Logo h={26} />
          </Link>
        </div>
      </header>
      <main className="page" style={{ maxWidth: 640 + 32 }}>
        <Card pad={36} style={{ gap: 24, marginTop: 40 }}>
          <IconTile icon={icon} size={72} bg="var(--primary-secondary)" fg="var(--link)" />
          <PageTitle title={title} sub={sub} size={28} />
          <div className="inset" style={{ padding: '8px 18px', borderRadius: 20 }}>
            {steps.map(([t, d, s]) => (
              <div key={t} className="row g14" style={{ padding: '12px 0' }}>
                <span className="tile" style={{ width: 32, height: 32, borderRadius: '50%', background: d ? '#1DB954' : 'var(--urgent)', color: d ? '#fff' : '#18191C' }}>
                  <Icon name={d ? 'check' : 'clock'} size={16} />
                </span>
                <span className="grow s16 semi">{t}</span>
                {s ? <Pill tone="yellow">{s}</Pill> : null}
              </div>
            ))}
          </div>
          <p className="muted">{foot}</p>
          <div className="row g10 wrap">{actions}</div>
        </Card>
      </main>
    </>
  );
}

export function EmpReview() {
  return (
    <StatusPage
      icon="shield"
      title="Company sent for verification"
      sub="We check your company and trade licence so candidates can trust every vacancy on 919. You'll get a notification as soon as it's done, and the verified badge appears on your profile."
      steps={[
        ['Account created', true],
        ['Company details sent', true],
        ['Trade licence sent', true],
        ['Verification by the 919 team', false, 'In progress'],
      ]}
      foot="You can already browse talent and prepare your first vacancy while we check."
      actions={
        <>
          <Btn kind="secondary" h={52} icon="users" to="/hire" style={{ flex: 1 }}>
            Browse talent
          </Btn>
          <Btn h={52} icon="add" to="/post" style={{ flex: 1 }}>
            Create a vacancy
          </Btn>
        </>
      }
    />
  );
}

export function EmpJoinSent() {
  const { employer } = useSignup();
  const co = companies.find((c) => c.id === employer.joinCompanyId);
  return (
    <StatusPage
      icon="clock"
      title="Request sent"
      sub={`The admin of ${co?.name ?? 'the company'} will confirm you. We'll send a notification as soon as they do.`}
      steps={[
        ['Account created', true],
        ['Request sent to the company admin', true],
        ['Admin confirms you', false, 'Waiting'],
      ]}
      foot="Usually admins reply within a day."
      actions={
        <Btn kind="secondary" h={52} to="/">
          Back to 919
        </Btn>
      }
    />
  );
}
