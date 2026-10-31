// Sign in, sign up and password reset. Split layout on desktop (brand panel + form), form only on mobile.
import { useEffect, useState, type ReactNode } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { Link } from '../../lib/links';
import { DEMO_EMPLOYER, useFinishAuth } from '../../lib/auth';
import { city, stock } from '../../data/asset';
import { useSession, type Role } from '../../data/session';
import { useSignup } from '../../data/signup';
import { allCountries, citiesFor, formatDob } from '../../data/registration';
import { formatPhone } from '../../data/dictionaries';
import pattern from '../../assets/img/pattern-3d.jpg';
import { Btn, Field, Icon, IconBtn, Logo, PageTitle, Select } from '../../ui/kit';

export function BrandPanel() {
  const ph: [string, number, number, number, number][] = [
    [stock['f-pink-skirt'], 0, 0, 200, 260],
    [stock['f-headphones'], 220, 60, 180, 230],
    [stock['f-yellow-suit'], 60, 280, 190, 240],
    [stock['f-dj'], 270, 310, 170, 210],
  ];
  return (
    <aside className="brandpanel">
      <img className="bg" src={pattern} alt="" aria-hidden="true" />
      <Link to="/" aria-label="919 home">
        <Logo h={30} color="#FFFFFF" />
      </Link>
      <h1 className="display" style={{ marginTop: 56, fontSize: 52, lineHeight: 1.08, letterSpacing: '-0.02em' }}>
        Find work.
        <br />
        Find people.
      </h1>
      <p style={{ marginTop: 18, fontSize: 17, lineHeight: 1.5, opacity: 0.9, maxWidth: 400 }}>Hospitality, events, F&amp;B and modeling jobs in the UAE.</p>
      <div className="photos">
        {ph.map(([src, x, y, w, h]) => (
          <img key={src} src={src} alt="" style={{ left: x, top: y, width: w, height: h }} />
        ))}
      </div>
    </aside>
  );
}

export function AuthLayout({ children, top, width = 440 }: { children: ReactNode; top?: ReactNode; width?: number }) {
  return (
    <div className="auth">
      <BrandPanel />
      <main className="auth-main">
        <div className="auth-top">
          <span className="mob-only grow">
            <Link to="/" aria-label="919 home">
              <Logo h={24} />
            </Link>
          </span>
          {top}
        </div>
        <div className="auth-form">
          <div style={{ width }}>{children}</div>
        </div>
      </main>
    </div>
  );
}

const CreateTop = () => (
  <>
    <span className="desk-only">New to 919?</span>
    <Btn kind="secondary" h={44} to="/auth/role">
      Create account
    </Btn>
  </>
);
const SignInTop = () => (
  <>
    <span className="desk-only">Already have an account?</span>
    <Btn kind="secondary" h={44} to="/auth/sign-in">
      Sign in
    </Btn>
  </>
);

const APPLE = (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="currentColor" d="M16.4 12.6c0-2.4 2-3.6 2.1-3.7-1.1-1.7-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.7.9-.8 0-1.9-.9-3.2-.8-1.6 0-3.1 1-4 2.4-1.7 3-.4 7.4 1.2 9.8.8 1.2 1.8 2.5 3 2.4 1.2 0 1.7-.8 3.1-.8 1.5 0 1.9.8 3.2.8 1.3 0 2.1-1.2 2.9-2.4.9-1.4 1.3-2.7 1.3-2.8 0 0-2.4-1-2.4-3.9ZM14 5.4c.7-.8 1.1-1.9 1-3-1 0-2.1.7-2.8 1.5-.6.7-1.2 1.8-1 2.9 1 .1 2.1-.6 2.8-1.4Z" />
  </svg>
);
const GOOGLE = (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M22 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.6c-.2 1.3-1 2.4-2.1 3.1v2.6h3.4c2-1.8 3.1-4.5 3.1-7.5Z" />
    <path fill="#34A853" d="M12 22.5c2.8 0 5.2-.9 6.9-2.5l-3.4-2.6c-.9.6-2.1 1-3.5 1-2.7 0-5-1.8-5.8-4.3H2.7v2.7c1.7 3.4 5.2 5.7 9.3 5.7Z" />
    <path fill="#FBBC05" d="M6.2 14.1c-.2-.6-.3-1.3-.3-2.1s.1-1.4.3-2.1V7.2H2.7C2 8.6 1.6 10.3 1.6 12s.4 3.4 1.1 4.8l3.5-2.7Z" />
    <path fill="#EA4335" d="M12 5.6c1.5 0 2.9.5 4 1.6l3-3C17.2 2.5 14.8 1.5 12 1.5 7.9 1.5 4.4 3.8 2.7 7.2l3.5 2.7C7 7.4 9.3 5.6 12 5.6Z" />
  </svg>
);

export function SocialButtons({ onPick, emailTo, labels = 'continue' }: { onPick: (k: 'apple' | 'google') => void; emailTo?: string; labels?: 'continue' | 'signin' }) {
  const v = labels === 'continue' ? 'Continue with' : 'Sign in with';
  return (
    <div className="col g10">
      {emailTo ? (
        <Btn kind="secondary" h={52} full icon="mail" to={emailTo}>
          Sign in with email
        </Btn>
      ) : null}
      <button className="btn secondary h52 full" onClick={() => onPick('apple')}>
        {APPLE}
        {v} Apple
      </button>
      <button className="btn secondary h52 full" onClick={() => onPick('google')}>
        {GOOGLE}
        {v} Google
      </button>
    </div>
  );
}

function PhoneField({ digits, onChange, autoFocus }: { digits: string; onChange: (d: string) => void; autoFocus?: boolean }) {
  return (
    <Field
      label="Phone number"
      value={formatPhone(digits, '+971')}
      onChange={(v) => onChange(v.replace(/\D/g, '').slice(0, 9))}
      placeholder="50 123 4567"
      inputMode="tel"
      autoFocus={autoFocus}
      prefix={
        <span className="row g6 semi" style={{ paddingRight: 12, borderRight: '1px solid var(--stroke)', fontSize: 16 }}>
          🇦🇪 +971
        </span>
      }
    />
  );
}

function Divider({ children }: { children: ReactNode }) {
  return (
    <div className="row g12 small muted">
      <span className="grow" style={{ height: 1, background: 'var(--stroke)' }} />
      {children}
      <span className="grow" style={{ height: 1, background: 'var(--stroke)' }} />
    </div>
  );
}

// ---------- Sign in ----------
export function SignIn() {
  const nav = useNavigate();
  const finish = useFinishAuth();
  const [digits, setDigits] = useState('');
  const ok = digits.length === 9;
  return (
    <AuthLayout top={<CreateTop />}>
      <PageTitle title="Welcome back" sub="Enter the phone number linked to your 919 account. We’ll text you a one-time code." />
      <form
        className="col g14"
        onSubmit={(e) => {
          e.preventDefault();
          if (ok) nav(`/auth/code?flow=signin&to=${encodeURIComponent(`+971|${digits}`)}`);
        }}
      >
        <PhoneField digits={digits} onChange={setDigits} autoFocus />
        <Btn type="submit" h={56} full disabled={!ok}>
          Continue
        </Btn>
      </form>
      <Divider>Other ways to sign in</Divider>
      <SocialButtons labels="continue" emailTo="/auth/email" onPick={() => finish({ role: 'seeker' })} />
      <p className="small muted lh">
        Use the method you chose when you created the account. Demo: any number opens the job seeker account, 88 888 8888 opens the employer.
      </p>
    </AuthLayout>
  );
}

export function EmailSignIn() {
  const finish = useFinishAuth();
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [show, setShow] = useState(false);
  return (
    <AuthLayout top={<CreateTop />}>
      <IconBtn icon="chevron-left" label="Back" to="/auth/sign-in" />
      <PageTitle title="Sign in with email" sub="Use the email and password of your 919 account." />
      <form
        className="col g14"
        onSubmit={(e) => {
          e.preventDefault();
          finish(email.startsWith('hr@') ? DEMO_EMPLOYER : { role: 'seeker', email });
        }}
      >
        <Field label="Email" value={email} onChange={setEmail} type="email" autoFocus />
        <Field
          label="Password"
          value={pass}
          onChange={setPass}
          type={show ? 'text' : 'password'}
          suffix={
            <button type="button" aria-label={show ? 'Hide password' : 'Show password'} onClick={() => setShow(!show)} style={{ display: 'flex' }}>
              <Icon name={show ? 'eye-off' : 'view'} />
            </button>
          }
        />
        <div className="row end">
          <Link to="/auth/forgot" className="link s14">
            Forgot password?
          </Link>
        </div>
        <Btn type="submit" h={56} full disabled={!email.includes('@') || pass.length < 6}>
          Sign in
        </Btn>
      </form>
    </AuthLayout>
  );
}

// ---------- OTP ----------
const WRONG = '000000';
export function Code() {
  const [sp] = useSearchParams();
  const nav = useNavigate();
  const finish = useFinishAuth();
  const { pendingRole } = useSession();
  const { setEmployer } = useSignup();
  const flow = sp.get('flow') ?? 'signin';
  const to = sp.get('to') ?? '';
  const [dial, digits = ''] = to.split('|');
  const target = flow === 'forgot' ? to : `${dial} ${digits.slice(0, 2)} ••• ${digits.slice(-4)}`;
  const [code, setCode] = useState('');
  const [left, setLeft] = useState(60);
  const [attempts, setAttempts] = useState(3);
  const [error, setError] = useState<string>();
  useEffect(() => {
    if (left <= 0) return;
    const t = setTimeout(() => setLeft(left - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);
  const submit = (v: string) => {
    if (v === WRONG) {
      const a = attempts - 1;
      setAttempts(a);
      setError(a > 0 ? `Incorrect code. ${a} attempt${a === 1 ? '' : 's'} left` : 'Too many attempts. Request a new code.');
      return;
    }
    if (flow === 'signin') finish(/^8+$/.test(digits) ? { ...DEMO_EMPLOYER, phone: to } : { role: 'seeker', phone: to });
    else if (flow === 'forgot') nav(`/auth/new-password?email=${encodeURIComponent(to)}`, { replace: true });
    else if (pendingRole === 'employer') {
      setEmployer({ phone: digits ? `${dial} ${formatPhone(digits, dial)}` : '', phoneLocked: !!digits });
      nav('/employer/type', { replace: true });
    } else nav('/auth/about', { replace: true });
  };
  const onDigits = (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, 6);
    setCode(d);
    setError(undefined);
    if (d.length === 6) submit(d);
  };
  return (
    <AuthLayout top={<CreateTop />}>
      <IconBtn icon="chevron-left" label="Back" to={flow === 'forgot' ? '/auth/forgot' : flow === 'signin' ? '/auth/sign-in' : '/auth/register'} />
      <PageTitle
        title="Enter the code"
        sub={
          <>
            Sent {flow === 'forgot' ? 'to' : 'by SMS to'} <b style={{ color: 'var(--text-headline)' }}>{target}</b>
          </>
        }
      />
      <label className="rel" style={{ display: 'block' }}>
        <input
          value={code}
          onChange={(e) => onDigits(e.target.value)}
          inputMode="numeric"
          autoComplete="one-time-code"
          autoFocus
          aria-label="Code"
          style={{ position: 'absolute', inset: 0, opacity: 0, width: '100%', cursor: 'text' }}
        />
        <span style={{ display: 'grid', gridTemplateColumns: 'repeat(6, minmax(0, 1fr))', gap: 10 }} aria-hidden="true">
          {Array.from({ length: 6 }, (_, i) => {
            const cur = i === code.length;
            return (
              <span
                key={i}
                className="display"
                style={{
                  height: 64,
                  borderRadius: 16,
                  background: 'var(--surface)',
                  border: error ? '2px solid var(--danger-text)' : cur ? '2px solid var(--primary)' : '1px solid var(--stroke)',
                  boxShadow: cur && !error ? '0 0 0 4px var(--focus-ring)' : undefined,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24,
                }}
              >
                {code[i] ?? (cur ? <span style={{ width: 2, height: 28, borderRadius: 2, background: 'var(--primary)' }} /> : '')}
              </span>
            );
          })}
        </span>
      </label>
      {error ? <div className="hint err">{error}</div> : null}
      <div className="row between s14 muted">
        {left > 0 ? (
          <span className="row g8">
            <Icon name="clock" size={16} />
            Resend code in <b style={{ color: 'var(--text-headline)', fontVariantNumeric: 'tabular-nums' }}>0:{String(left).padStart(2, '0')}</b>
          </span>
        ) : (
          <button
            className="link"
            onClick={() => {
              setLeft(60);
              setCode('');
              setAttempts(3);
              setError(undefined);
            }}
          >
            Send a new code
          </button>
        )}
        {flow !== 'forgot' ? (
          <Link to={flow === 'signin' ? '/auth/sign-in' : '/auth/register'} className="link">
            Change number
          </Link>
        ) : null}
      </div>
      <p className="small muted">Demo: any code works, 000000 is a wrong one.</p>
    </AuthLayout>
  );
}

// ---------- Forgot password ----------
export function Forgot() {
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  return (
    <AuthLayout top={<CreateTop />}>
      <IconBtn icon="chevron-left" label="Back" to="/auth/email" />
      <PageTitle title="Reset password" sub="Enter the email of your 919 account. We’ll send a 6-digit code to reset your password." />
      <form
        className="col g14"
        onSubmit={(e) => {
          e.preventDefault();
          nav(`/auth/code?flow=forgot&to=${encodeURIComponent(email)}`);
        }}
      >
        <Field label="Email" value={email} onChange={setEmail} type="email" autoFocus />
        <Btn type="submit" h={56} full disabled={!/\S+@\S+\.\S+/.test(email)}>
          Send code
        </Btn>
      </form>
    </AuthLayout>
  );
}

export function NewPassword() {
  const nav = useNavigate();
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const err = b && a !== b ? 'Passwords don’t match' : undefined;
  return (
    <AuthLayout top={<CreateTop />}>
      <PageTitle title="New password" sub="At least 8 characters, with a letter and a number." />
      <Field label="New password" value={a} onChange={setA} type="password" autoFocus />
      <Field label="Repeat password" value={b} onChange={setB} type="password" error={err} />
      <Btn h={56} full disabled={a.length < 8 || a !== b} onClick={() => nav('/auth/email', { replace: true })}>
        Save and sign in
      </Btn>
    </AuthLayout>
  );
}

// ---------- Role ----------
function RoleCard({ title, sub, pts, img, on, onClick }: { title: string; sub: string; pts: string[]; img: string; on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={on}
      className="grow col g16"
      style={{
        textAlign: 'left',
        borderRadius: 24,
        background: 'var(--surface)',
        padding: 24,
        border: on ? '2px solid var(--primary)' : '1px solid var(--stroke)',
        boxShadow: on ? '0 0 0 4px var(--focus-ring)' : undefined,
      }}
    >
      <img src={img} alt="" className="ph-cover" style={{ height: 150, borderRadius: 16 }} />
      <div>
        <div className="s20 strong">{title}</div>
        <div className="s14 muted" style={{ marginTop: 4 }}>
          {sub}
        </div>
      </div>
      <ul className="col g10">
        {pts.map((p) => (
          <li key={p} className="row g10 primary-text">
            <span style={{ color: 'var(--success-text)', display: 'flex' }}>
              <Icon name="check" size={18} />
            </span>
            {p}
          </li>
        ))}
      </ul>
    </button>
  );
}

export function RolePick() {
  const nav = useNavigate();
  const { setPendingRole, pendingRole } = useSession();
  const [role, setRole] = useState<Role>(pendingRole ?? 'seeker');
  return (
    <AuthLayout top={<SignInTop />} width={720}>
      <PageTitle title="Who are you here as?" sub="Hospitality, events, F&B and modeling jobs." />
      <div className="row top g16" style={{ flexWrap: 'wrap' }}>
        <RoleCard title="I'm looking for work" sub="Job seeker account" pts={['Build your profile and CV', 'Apply to shifts in one tap', 'Get hired in hours, not weeks']} img={stock['f-makeup']} on={role === 'seeker'} onClick={() => setRole('seeker')} />
        <RoleCard title="I'm hiring" sub="Employer account" pts={['Register your company', 'Post vacancies and castings', 'Find the best candidates']} img={city.dubai1} on={role === 'employer'} onClick={() => setRole('employer')} />
      </div>
      <div>
        <Btn
          h={56}
          style={{ width: 240 }}
          onClick={() => {
            setPendingRole(role);
            nav('/auth/register');
          }}
        >
          Continue
        </Btn>
      </div>
    </AuthLayout>
  );
}

// ---------- Register: contact method ----------
export function Register() {
  const nav = useNavigate();
  const { pendingRole } = useSession();
  const [digits, setDigits] = useState('');
  if (!pendingRole) return <Navigate to="/auth/role" replace />;
  const go = (social?: string) => (pendingRole === 'employer' ? nav('/employer/type') : nav(`/auth/about${social ? `?social=${social}` : ''}`));
  return (
    <AuthLayout top={<SignInTop />}>
      <IconBtn icon="chevron-left" label="Back" to="/auth/role" />
      <PageTitle title="Create account" sub={pendingRole === 'employer' ? 'Employer account. We’ll text you a code to confirm the number.' : 'Job seeker account. We’ll text you a code to confirm the number.'} />
      <form
        className="col g14"
        onSubmit={(e) => {
          e.preventDefault();
          if (digits.length === 9) nav(`/auth/code?flow=signup&to=${encodeURIComponent(`+971|${digits}`)}`);
        }}
      >
        <PhoneField digits={digits} onChange={setDigits} autoFocus />
        <Btn type="submit" h={56} full disabled={digits.length !== 9}>
          Get the code
        </Btn>
      </form>
      <Divider>or</Divider>
      <SocialButtons onPick={(k) => go(k)} />
      <p className="small muted lh">
        By continuing you accept the <a href="#terms">User agreement</a> and <a href="#privacy">Privacy policy</a>.
      </p>
    </AuthLayout>
  );
}

// ---------- Register: About you (seeker step 1 of 5) ----------
export function StepBar({ step, of }: { step: number; of: number }) {
  return (
    <div className="col g10">
      <span className="small strong muted">
        Step {step} of {of}
      </span>
      <div className="row g6">
        {Array.from({ length: of }, (_, i) => (
          <span key={i} className="grow" style={{ height: 6, borderRadius: 999, background: i < step ? 'var(--primary)' : 'var(--back-darker)' }} />
        ))}
      </div>
    </div>
  );
}

export function PhotoPicker({ src, onPick, size = 96 }: { src?: string; onPick: (url: string) => void; size?: number }) {
  return (
    <label className="rel" style={{ flex: 'none', width: size, height: size, cursor: 'pointer' }} aria-label="Upload photo">
      <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => e.target.files?.[0] && onPick(URL.createObjectURL(e.target.files[0]))} />
      {src ? (
        <img src={src} alt="" className="avatar" style={{ width: size, height: size }} />
      ) : (
        <span style={{ width: size, height: size, borderRadius: '50%', background: 'var(--primary-secondary)', color: 'var(--link)', border: '2px dashed var(--stroke-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="camera" size={30} />
        </span>
      )}
      <span style={{ position: 'absolute', right: -2, bottom: -2, width: 34, height: 34, borderRadius: '50%', background: 'var(--primary)', color: '#fff', border: '3px solid var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="camera" size={16} />
      </span>
    </label>
  );
}

const parseDob = (s: string) => {
  const m = s.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (!m) return undefined;
  const d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
  return isNaN(d.getTime()) ? undefined : d;
};

export function About() {
  const nav = useNavigate();
  const { seeker, setSeeker } = useSignup();
  const [f, setF] = useState({ first: seeker.firstName, last: seeker.lastName, gender: seeker.gender ?? '', dob: formatDob(seeker.dob) ?? '', country: seeker.country ?? 'United Arab Emirates', city: seeker.city ?? '' });
  const [photo, setPhoto] = useState(seeker.photo);
  const letters = (s: string) => /^[\p{L}\s'-]*$/u.test(s);
  const dob = parseDob(f.dob);
  const ok = photo && f.first.trim() && f.last.trim() && letters(f.first) && letters(f.last) && f.gender && dob && f.city;
  return (
    <AuthLayout top={<SignInTop />} width={640}>
      <StepBar step={1} of={5} />
      <PageTitle title="About you" sub="Employers see this first. Fields marked * are required." />
      <div className="row g18">
        <PhotoPicker src={photo} onPick={setPhoto} />
        <div>
          <div className="s16 strong">Profile photo *</div>
          <div className="s14 muted" style={{ marginTop: 4 }}>
            A clear, well-lit photo with your face visible
          </div>
        </div>
      </div>
      <div className="grid2">
        <Field label="First name *" value={f.first} onChange={(v) => setF({ ...f, first: v })} error={letters(f.first) ? undefined : 'Use letters only, without symbols'} autoFocus />
        <Field label="Last name *" value={f.last} onChange={(v) => setF({ ...f, last: v })} error={letters(f.last) ? undefined : 'Use letters only, without symbols'} />
        <Select label="Gender *" value={f.gender} options={['Female', 'Male']} onChange={(v) => setF({ ...f, gender: v })} />
        <Field label="Date of birth *" value={f.dob} placeholder="DD.MM.YYYY" onChange={(v) => setF({ ...f, dob: v.replace(/[^\d.]/g, '').slice(0, 10) })} inputMode="numeric" suffix={<Icon name="calendar" size={18} />} />
        <Select label="Country *" value={f.country} options={allCountries} onChange={(v) => setF({ ...f, country: v, city: '' })} />
        <Select label="City *" value={f.city} options={citiesFor(f.country)} onChange={(v) => setF({ ...f, city: v })} />
      </div>
      <div className="row end cta-bar">
        <Btn
          h={56}
          style={{ width: 200 }}
          disabled={!ok}
          onClick={() => {
            setSeeker({ photo, firstName: f.first.trim(), lastName: f.last.trim(), gender: f.gender, dob, country: f.country, city: f.city });
            nav('/signup/occupation');
          }}
        >
          Continue
        </Btn>
      </div>
    </AuthLayout>
  );
}
