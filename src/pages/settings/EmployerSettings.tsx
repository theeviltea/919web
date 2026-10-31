// Employer account: company details, verification by trade licence, team and roles, subscription, settings.
import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { company, EMPLOYER_LOSSES, initialsOf, useEmployer, type Member } from '../../data/employer';
import { allCountries, citiesFor, positions } from '../../data/registration';
import { useSession } from '../../data/session';
import { personFor } from '../../data/asset';
import { Sec, SettingsLayout, SaveBar, SRow, ThemeSeg } from './SeekerSettings';
import { Avatar, Btn, Card, Field, Icon, Initials, Modal, ModalHead, Pill, Select, Toggle, useToast, type IconName } from '../../ui/kit';

const NAV: [string, [string, IconName, string][]][] = [
  ['Company', [['Company details', 'building', '/company/details'], ['Verification', 'verified', '/company/verification'], ['Team and roles', 'users', '/company/team']]],
  ['Plan', [['Subscription', 'star', '/company/subscription']]],
  ['Account', [['Settings', 'settings', '/company/settings']]],
];

function EmpLayout({ active, children }: { active: string; children: ReactNode }) {
  const e = useEmployer();
  return (
    <SettingsLayout
      active={active}
      nav={NAV}
      head={
        <div className="row g12" style={{ padding: '4px 4px 14px' }}>
          {e.info.logo ? <Avatar src={e.info.logo} size={48} radius={14} /> : <Initials text={initialsOf(e.info.name) || company.initials} size={48} radius={14} />}
          <div className="grow">
            <div className="row g6 s16 strong">
              {e.info.name}
              {e.verified ? (
                <span style={{ color: 'var(--primary)', display: 'flex' }}>
                  <Icon name="verified" size={16} />
                </span>
              ) : null}
            </div>
            <div className="small muted">
              {e.info.industry} · {e.info.city}
            </div>
          </div>
        </div>
      }
    >
      {children}
    </SettingsLayout>
  );
}

export function CompanyDetails() {
  const e = useEmployer();
  const toast = useToast();
  const [f, setF] = useState(e.info);
  const [rep, setRep] = useState(e.rep);
  const set = (u: Partial<typeof f>) => setF({ ...f, ...u });
  const renamed = f.name.trim() !== e.info.name;
  return (
    <EmpLayout active="Company details">
      <Sec title="Company">
        <div className="row g18">
          {f.logo ? <Avatar src={f.logo} size={96} radius={28} /> : <Initials text={initialsOf(f.name)} size={96} radius={28} />}
          <div>
            <div className="s16 strong">Company logo *</div>
            <div className="s14 muted" style={{ marginTop: 4 }}>
              Square image, at least 400×400 px
            </div>
            <label className="btn tonal h40" style={{ marginTop: 10 }}>
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(ev) => ev.target.files?.[0] && set({ logo: URL.createObjectURL(ev.target.files[0]) })} />
              <Icon name="image" size={16} />
              Change logo
            </label>
          </div>
        </div>
        <div className="grid2">
          <Field label="Company name *" value={f.name} onChange={(v) => set({ name: v })} />
          <Select label="Industry *" value={f.industry} options={['Hospitality', 'F&B', 'Events', 'Modeling', 'Music', 'Beauty']} onChange={(v) => set({ industry: v })} />
          <Select label="Company size" value={f.size} options={['1–10 employees', '10–50 employees', '50–200 employees', '200+ employees']} onChange={(v) => set({ size: v })} />
          <Field label="Founded" value={f.founded} onChange={(v) => set({ founded: v.replace(/\D/g, '').slice(0, 4) })} inputMode="numeric" />
        </div>
        {renamed ? (
          <div className="row g10 s14" style={{ padding: '12px 14px', borderRadius: 14, background: 'var(--attention-back)', color: 'var(--attention-text)' }}>
            <Icon name="alert-circle" size={18} />
            Changing the company name sends it for a quick re-check by the 919 team.
          </div>
        ) : null}
      </Sec>
      <Sec title="About the company">
        <Field label="Description *" value={f.about} onChange={(v) => set({ about: v })} area maxLength={1000} hint="Shown on every vacancy you post" />
      </Sec>
      <Sec title="Location and contacts">
        <div className="grid2">
          <Select label="Country *" value={f.country} options={allCountries} onChange={(v) => set({ country: v, city: '' })} />
          <Select label="City *" value={f.city} options={citiesFor(f.country)} onChange={(v) => set({ city: v })} />
          <Field label="Phone" value={f.phone} onChange={(v) => set({ phone: v })} />
          <Field label="Email" value={f.email} onChange={(v) => set({ email: v })} />
          <Field label="Office" value={f.office} onChange={(v) => set({ office: v })} />
          <Field label="Website" value={f.website} onChange={(v) => set({ website: v })} />
          <Field label="Instagram" value={f.instagram} onChange={(v) => set({ instagram: v })} placeholder="@company" />
          <Field label="Facebook" value={f.facebook} onChange={(v) => set({ facebook: v })} />
        </div>
      </Sec>
      <Sec title="Representative">
        <div className="grid2">
          <Field label="First name *" value={rep.firstName} onChange={(v) => setRep({ ...rep, firstName: v })} />
          <Field label="Last name *" value={rep.lastName} onChange={(v) => setRep({ ...rep, lastName: v })} />
          <Select label="Position *" value={rep.position} options={[...new Set([rep.position, ...positions])]} onChange={(v) => setRep({ ...rep, position: v })} />
          <Field label="Work email *" value={rep.email} onChange={(v) => setRep({ ...rep, email: v })} />
        </div>
      </Sec>
      <SaveBar
        disabled={!f.name.trim() || !f.about.trim() || !f.city}
        onSave={() => {
          e.setInfo(f);
          e.setRep(rep);
          toast(renamed ? 'Saved. The new name goes to a quick check' : 'Changes saved');
        }}
      />
    </EmpLayout>
  );
}

export function Verification() {
  const e = useEmployer();
  const toast = useToast();
  const l = e.licence;
  const st = l.exempt
    ? { tone: 'var(--back)', icon: 'user' as IconName, title: 'Private recruiter', text: 'Private recruiters post without a trade licence. The verified badge is for companies.' }
    : l.status === 'verified'
      ? { tone: 'var(--primary-secondary)', icon: 'verified' as IconName, title: 'Verified company', text: `Trade licence checked on ${l.checkedAt}. The badge shows next to your company name on vacancies, the company page and in chats.` }
      : l.status === 'review'
        ? { tone: 'var(--primary-secondary)', icon: 'clock' as IconName, title: 'Licence on review', text: `Sent ${l.sentAt ?? 'just now'}. We check it within 24 hours.` }
        : l.status === 'rejected'
          ? { tone: 'var(--danger-back)', icon: 'alert-circle' as IconName, title: 'Licence not accepted', text: l.reason ?? 'The file is unreadable or expired. Upload a valid licence.' }
          : { tone: 'var(--attention-back)', icon: 'shield' as IconName, title: 'Not verified yet', text: 'Upload your trade licence. When the 919 team checks it, the badge appears next to your company name.' };
  return (
    <EmpLayout active="Verification">
      <section className="card row g18" style={{ background: st.tone, flexDirection: 'row', alignItems: 'center' }}>
        <span className="tile" style={{ width: 56, height: 56, background: l.status === 'none' ? 'var(--urgent)' : 'var(--surface)', color: l.status === 'verified' ? 'var(--link)' : 'var(--text-headline)', borderRadius: 18 }}>
          <Icon name={st.icon} size={28} />
        </span>
        <div className="grow">
          <div className="s20 strong">{st.title}</div>
          <div className="s15 lh primary-text" style={{ marginTop: 4 }}>
            {st.text}
          </div>
        </div>
      </section>
      <div className="layout-r w380" style={{ gap: 16 }}>
        {l.status === 'verified' ? (
          <Sec title="Trade licence" gap={6}>
            <div>
              {[
                ['File', l.file?.name ?? '—'],
                ['Licence number', l.number ?? '—'],
                ['Issued by', l.issuer ?? '—'],
                ['Valid until', l.validUntil ?? '—'],
              ].map(([a, b]) => (
                <div key={a} className="kv">
                  <span>{a}</span>
                  <span>{b}</span>
                </div>
              ))}
            </div>
          </Sec>
        ) : !l.exempt ? (
          <Sec title={l.status === 'review' ? 'Uploaded licence' : 'Upload trade licence'}>
            <label className="drop" style={{ height: 200, gap: 10 }}>
              <input type="file" accept="application/pdf" style={{ display: 'none' }} onChange={(ev) => ev.target.files?.[0] && (e.sendLicence({ name: ev.target.files[0].name, size: `${(ev.target.files[0].size / 1048576).toFixed(1)} MB` }), toast('Licence sent for verification', 'shield'))} />
              <span className="tile" style={{ width: 56, height: 56, background: 'var(--primary-secondary)', borderRadius: 18 }}>
                <Icon name="file" size={26} />
              </span>
              <span className="s16">{l.file ? l.file.name : 'Drag a file here or click to choose'}</span>
              <span className="s14 muted semi">{l.file ? `${l.file.size} · click to replace` : 'PDF, up to 10 MB'}</span>
            </label>
            <div className="row g20 wrap s14 muted">
              <span className="row g8">
                <Icon name="lock" size={16} />
                Only the 919 team sees this file.
              </span>
              <span className="row g8">
                <Icon name="clock" size={16} />
                We check it within 24 hours.
              </span>
            </div>
          </Sec>
        ) : null}
        <Sec title="How candidates see you">
          <div className="row g12 inset" style={{ padding: 16, borderRadius: 18 }}>
            <Initials text={company.initials} size={48} radius={14} />
            <div>
              <div className="row g6 s15 strong">
                {e.info.name}
                {e.verified ? (
                  <span style={{ color: 'var(--primary)', display: 'flex' }}>
                    <Icon name="verified" size={16} />
                  </span>
                ) : null}
              </div>
              <div className="small muted">{e.vacancies[0]?.title} · {e.vacancies[0]?.meta.split(' · ')[1]}</div>
            </div>
          </div>
          {!e.verified ? <p className="small muted">The badge appears here after the check.</p> : null}
        </Sec>
      </div>
    </EmpLayout>
  );
}

export function Team() {
  const e = useEmployer();
  const toast = useToast();
  const [invite, setInvite] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Member['role']>('Recruiter');
  return (
    <EmpLayout active="Team and roles">
      {e.joinRequests.length ? (
        <Sec
          title={
            <>
              Join requests <span className="muted semi">{e.joinRequests.length}</span>
            </>
          }
        >
          {e.joinRequests.map((j) => (
            <div key={j.id} className="row g14 wrap selbox" style={{ padding: 16, borderRadius: 18, border: '1px solid var(--stroke)' }}>
              <Avatar src={j.photo} size={48} />
              <div className="grow">
                <div className="s15 strong">{j.name}</div>
                <div className="s14 muted">
                  {j.email} · {j.when}
                </div>
              </div>
              <Btn kind="secondary" h={40} onClick={() => (e.resolveJoin(j.id), toast('Request declined', 'cancel'))}>
                Decline
              </Btn>
              <Btn h={40} onClick={() => (e.addMember({ id: j.id, name: j.name, role: 'Recruiter', title: 'Recruiter', photo: j.photo, vacancies: 0 }), e.resolveJoin(j.id), toast(`${j.name} joined the team`))}>
                Accept
              </Btn>
            </div>
          ))}
        </Sec>
      ) : null}
      <Sec
        title={
          <>
            Members <span className="muted semi">{e.members.length}</span>
          </>
        }
        right={
          <Btn h={44} icon="add" onClick={() => setInvite(true)}>
            Invite recruiter
          </Btn>
        }
        gap={4}
      >
        <div>
          {e.members.map((m) => (
            <div key={m.id} className="row g14 sep" style={{ padding: '14px 0' }}>
              <Avatar src={m.photo} size={48} />
              <div className="grow">
                <div className="s15 strong">
                  {m.name}
                  {m.you ? <span className="muted semi"> · you</span> : null}
                </div>
                <div className="s14 muted">
                  {m.title}
                  {m.vacancies !== undefined ? ` · ${m.vacancies} vacancies` : ''}
                </div>
              </div>
              <select aria-label={`${m.name} role`} disabled={m.you} value={m.role} onChange={(ev) => e.updateMember(m.id, { role: ev.target.value as Member['role'] })} className="field" style={{ minHeight: 40, width: 140, fontSize: 14, fontWeight: 600 }}>
                <option>Admin</option>
                <option>Recruiter</option>
              </select>
              {!m.you ? (
                <button className="iconbtn soft" aria-label={`Remove ${m.name}`} onClick={() => (e.removeMember(m.id), toast(`${m.name} removed`, 'trash'))}>
                  <Icon name="trash" size={18} />
                </button>
              ) : null}
            </div>
          ))}
        </div>
      </Sec>
      <Sec title="Roles">
        <div className="grid2" style={{ gap: 12 }}>
          {[
            ['Admin', 'Edits the company profile, manages the team and the subscription, posts vacancies and chats with candidates.'],
            ['Recruiter', 'Posts and edits own vacancies, reviews applicants and chats with candidates.'],
          ].map(([a, b]) => (
            <div key={a} className="inset" style={{ padding: 16 }}>
              <div className="s15 strong">{a}</div>
              <div className="s14 muted lh" style={{ marginTop: 4 }}>
                {b}
              </div>
            </div>
          ))}
        </div>
      </Sec>
      {invite ? (
        <Modal onClose={() => setInvite(false)} label="Invite recruiter" width={480}>
          <ModalHead title="Invite recruiter" sub="We email them a link to join your company on 919." onClose={() => setInvite(false)} />
          <Field label="Work email" value={email} onChange={setEmail} type="email" autoFocus />
          <div className="tabs full">
            {(['Recruiter', 'Admin'] as const).map((r) => (
              <button key={r} className={`tab${role === r ? ' on' : ''}`} onClick={() => setRole(r)}>
                {r}
              </button>
            ))}
          </div>
          <Btn
            h={52}
            full
            disabled={!/\S+@\S+\.\S+/.test(email)}
            onClick={() => {
              const name = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
              e.addMember({ id: `u${Date.now()}`, name, role, title: 'Invited · waiting', photo: personFor(email), vacancies: 0 });
              setInvite(false);
              setEmail('');
              toast('Invite sent', 'mail');
            }}
          >
            Send invite
          </Btn>
        </Modal>
      ) : null}
    </EmpLayout>
  );
}

export function CompanySubscription() {
  const e = useEmployer();
  const toast = useToast();
  const [cancel, setCancel] = useState(false);
  const inc: [IconName, string, string][] = [
    ['briefcase', 'Multiple job postings', 'Publish as many vacancies as you need at once'],
    ['message', 'Direct messages to candidates', 'Contact any candidate from their profile, video or search'],
    ['star', 'More hiring opportunities', 'Premium badge on your company and vacancies'],
  ];
  const premium = e.plan !== 'free';
  return (
    <EmpLayout active="Subscription">
      <section className="card row g20" style={{ background: 'var(--panel-dark)', color: '#fff', flexDirection: 'row', alignItems: 'center' }}>
        <span className="tile" style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--premium)' }}>
          <Icon name="star" size={28} />
        </span>
        <div className="grow">
          <div className="small strong" style={{ color: '#FFB27A' }}>
            {e.plan === 'premium' ? 'Subscription active' : e.plan === 'canceled' ? 'Canceled · Premium until 9 Nov 2026' : 'Free plan'}
          </div>
          <div className="display d2" style={{ marginTop: 4, fontSize: 28 }}>
            {premium ? 'Premium' : '919 Premium · $3.99 / month'}
          </div>
          <div style={{ marginTop: 6, color: 'var(--panel-dark-muted)' }}>{premium ? 'You can publish more vacancies and send direct messages to candidates.' : 'On the Free plan you have 1 active vacancy and chat only with applicants.'}</div>
        </div>
        {!premium ? (
          <Btn kind="premium" h={52} onClick={() => (e.setPlan('premium'), toast('You’re on Premium', 'star'))}>
            Get Premium
          </Btn>
        ) : null}
      </section>
      <div className="layout-r w360" style={{ gap: 16 }}>
        <Sec title="What’s included">
          <div className="col g10">
            {inc.map(([i, t, x]) => (
              <div key={t} className="row top g12 inset" style={{ padding: 14 }}>
                <span className="tile" style={{ width: 40, height: 40, background: 'var(--premium-back)', color: 'var(--premium-strong)', borderRadius: 12 }}>
                  <Icon name={i} />
                </span>
                <div>
                  <div className="s15 strong">{t}</div>
                  <div className="small muted" style={{ marginTop: 2 }}>
                    {x}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Sec>
        {premium ? (
          <div className="stack">
            <Sec title="Subscription status" gap={6}>
              <div>
                {[
                  ['Plan', 'Monthly subscription'],
                  ['Price', '$3.99 / month'],
                  ['Status', e.plan === 'canceled' ? 'Canceled' : 'Active'],
                  [e.plan === 'canceled' ? 'Active until' : 'Next payment', '9 Nov 2026'],
                  ['Payment', 'Card •••• 4242'],
                ].map(([a, b]) => (
                  <div key={a} className="kv">
                    <span>{a}</span>
                    <span style={a === 'Status' ? { color: e.plan === 'canceled' ? 'var(--danger-text)' : 'var(--success-text)' } : undefined}>{b}</span>
                  </div>
                ))}
              </div>
            </Sec>
            <Card pad={20} style={{ gap: 8 }}>
              {e.plan === 'canceled' ? (
                <Btn kind="premium" h={48} full onClick={() => (e.setPlan('premium'), toast('Subscription renewed', 'star'))}>
                  Renew subscription
                </Btn>
              ) : (
                <>
                  <button className="strong danger" style={{ height: 40 }} onClick={() => setCancel(true)}>
                    Cancel subscription
                  </button>
                  <div className="small muted lh" style={{ textAlign: 'center' }}>
                    If you cancel, you keep Premium until the end of the paid period — 9 Nov 2026.
                  </div>
                </>
              )}
            </Card>
          </div>
        ) : null}
      </div>
      {cancel ? (
        <Modal onClose={() => setCancel(false)} label="Cancel subscription" width={460}>
          <ModalHead title="Cancel Premium?" sub="You keep Premium until 9 Nov 2026. Then: 1 active vacancy and chats only with applicants." onClose={() => setCancel(false)} />
          <div className="row g8">
            <Btn kind="secondary" style={{ flex: 1 }} onClick={() => setCancel(false)}>
              Keep it
            </Btn>
            <Btn kind="danger" style={{ flex: 1 }} onClick={() => (e.setPlan('canceled'), setCancel(false), toast('Subscription canceled', 'cancel'))}>
              Cancel
            </Btn>
          </div>
        </Modal>
      ) : null}
    </EmpLayout>
  );
}

export function CompanySettings() {
  const e = useEmployer();
  const { signOut } = useSession();
  const nav = useNavigate();
  const [modal, setModal] = useState<'notif' | 'delete' | 'leave' | null>(null);
  const [prefs, setPrefs] = useState<Record<string, boolean>>({ applicants: true, messages: true, join: true, moderation: true, email: false });
  const out = () => (signOut(), nav('/', { replace: true }));
  return (
    <EmpLayout active="Settings">
      <Sec title="Account" gap={4}>
        <div>
          <SRow icon="notification" title="Notifications" sub="New applicants, messages, join requests" onClick={() => setModal('notif')} />
          <SRow icon="moon" title="Theme" sub="Light, dark or your device setting" right={<ThemeSeg />} />
        </div>
      </Sec>
      <Sec title="Company" gap={4}>
        <div>
          <SRow icon="verified" title="Verification" sub={e.verified ? `Trade licence · verified ${e.licence.checkedAt ?? ''}` : 'Not verified'} to="/company/verification" right={<span className="row g8">{e.verified ? <Pill tone="blue">Verified</Pill> : null}<Icon name="chevron-right" /></span>} />
          <SRow icon="users" title="Team and roles" sub={`${e.members.length} members${e.joinRequests.length ? ` · ${e.joinRequests.length} join request` : ''}`} to="/company/team" />
          <SRow icon="star" title="Subscription" sub={e.plan === 'free' ? 'Free plan' : 'Renews 9 Nov 2026'} to="/company/subscription" right={<span className="row g8">{e.plan !== 'free' ? <Pill tone="orange">Premium</Pill> : null}<Icon name="chevron-right" /></span>} />
        </div>
      </Sec>
      <Sec title="Legal" gap={4}>
        <div>
          <SRow icon="file" title="User agreement" to="/company/settings#terms" />
          <SRow icon="lock" title="Privacy policy" to="/company/settings#privacy" />
        </div>
      </Sec>
      <Card style={{ padding: '12px 28px 20px', gap: 8 }}>
        <div>
          <SRow icon="building" title="Leave company" onClick={() => setModal('leave')} right={<span />} />
          <SRow icon="logout" title="Log out" onClick={out} right={<span />} />
          <SRow icon="trash" title="Delete account" danger onClick={() => setModal('delete')} right={<span />} />
        </div>
        <div className="small light">919 for business · web 0.1.0</div>
      </Card>
      {modal === 'notif' ? (
        <Modal onClose={() => setModal(null)} label="Notifications" width={480}>
          <ModalHead title="Notifications" onClose={() => setModal(null)} />
          {(
            [
              ['applicants', 'New applicants'],
              ['messages', 'New messages'],
              ['join', 'Join requests'],
              ['moderation', 'Moderation results'],
              ['email', 'Email digest'],
            ] as const
          ).map(([k, l]) => (
            <div key={k} className="row between">
              <span className="semi">{l}</span>
              <Toggle on={prefs[k]} label={l} onChange={(v) => setPrefs({ ...prefs, [k]: v })} />
            </div>
          ))}
        </Modal>
      ) : null}
      {modal === 'leave' ? (
        <Modal onClose={() => setModal(null)} label="Leave company" width={460}>
          <ModalHead title="Leave the company?" sub="You lose access to its vacancies and chats. An admin can invite you again." onClose={() => setModal(null)} />
          <Btn kind="danger" h={52} full onClick={out}>
            Leave company
          </Btn>
        </Modal>
      ) : null}
      {modal === 'delete' ? (
        <Modal onClose={() => setModal(null)} label="Delete account" width={460}>
          <ModalHead title="Delete account?" onClose={() => setModal(null)} />
          <ul className="col g8">
            {EMPLOYER_LOSSES.map((x) => (
              <li key={x} className="row top g10 primary-text">
                <span className="danger" style={{ display: 'flex' }}>
                  <Icon name="cancel" size={18} />
                </span>
                {x}
              </li>
            ))}
          </ul>
          <Btn kind="danger" h={52} full onClick={out}>
            Delete account
          </Btn>
        </Modal>
      ) : null}
    </EmpLayout>
  );
}
