// Job seeker profile editing and account: hub, personal, general, professional, profile look, plans, subscription, settings.
import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from '../../lib/links';
import { useTheme, type ThemePref } from '../../lib/theme';
import { completeness, jobPeriod, linkKinds, MONTHS, studyPeriod, useSeeker, type Job, type LangLevel, type LinkKind } from '../../data/seeker';
import { allCountries, citiesFor, fieldByKey, fields } from '../../data/registration';
import { useSession } from '../../data/session';
import { city } from '../../data/asset';
import type { FrameStyle } from '../../data/tiers';
import { PhotoGrid } from '../onboarding/Seeker';
import { Avatar, Btn, Card, Field, FRAMES, H2, Icon, Initials, Modal, ModalHead, Pill, Select, Toggle, TierBadge, useToast, type IconName } from '../../ui/kit';

const NAV: [string, [string, IconName, string][]][] = [
  ['Profile', [['Edit profile', 'user', '/profile/edit'], ['Personal info', 'user', '/profile/personal'], ['General', 'image', '/profile/general'], ['Professional', 'briefcase', '/profile/professional']]],
  ['Plan', [['Subscription', 'star', '/profile/subscription'], ['Profile look', 'sparkles', '/profile/look']]],
  ['Account', [['Settings', 'settings', '/profile/settings']]],
];

export function SettingsLayout({ active, children, nav, head }: { active: string; children: ReactNode; nav: [string, [string, IconName, string][]][]; head: ReactNode }) {
  return (
    <main className="page">
      <div className="layout-l" style={{ marginTop: 8 }}>
        <aside className="desk-only">
          <Card pad={16} className="snav" style={{ gap: 0 }}>
            {head}
            {nav.map(([g, items]) => (
              <div key={g}>
                <div className="grp">{g}</div>
                {items.map(([t, i, to]) => (
                  <Link key={t} to={to} className={t === active ? 'active' : ''} aria-current={t === active ? 'page' : undefined}>
                    <Icon name={i} />
                    <span className="grow">{t}</span>
                  </Link>
                ))}
              </div>
            ))}
          </Card>
        </aside>
        <div className="stack">
          <div className="mob-only">
            <Link to="/profile/edit" className="crumbs">
              <Icon name="chevron-left" size={16} />
              <b>{active}</b>
            </Link>
          </div>
          {children}
        </div>
      </div>
    </main>
  );
}

function SeekerLayout({ active, children }: { active: string; children: ReactNode }) {
  const s = useSeeker();
  const p = s.profile;
  const nav = NAV.map(([g, items]) => [g, items.map(([t, i, to]) => [t, i, t === 'Subscription' && s.plan === 'free' ? '/profile/plans' : to])] as [string, [string, IconName, string][]]);
  return (
    <SettingsLayout
      active={active}
      nav={nav}
      head={
        <div className="row g12" style={{ padding: '4px 4px 14px' }}>
          <Avatar src={p.photo} size={48} />
          <div className="grow">
            <div className="row g6 s16 strong">
              {p.firstName} {p.lastName}
              <TierBadge tier={s.plan} size={18} />
            </div>
            <div className="small muted ellipsis">
              {p.occupations.flatMap((o) => o.roles).slice(0, 2).join(' · ')} · {p.city}
            </div>
          </div>
        </div>
      }
    >
      {children}
    </SettingsLayout>
  );
}

export function Sec({ title, right, children, gap = 16 }: { title: ReactNode; right?: ReactNode; children: ReactNode; gap?: number }) {
  return (
    <Card pad={28} style={{ gap }}>
      <H2 right={right}>{title}</H2>
      {children}
    </Card>
  );
}

export function SaveBar({ onSave, disabled, onCancel }: { onSave: () => void; disabled?: boolean; onCancel?: () => void }) {
  return (
    <div className="row end g10">
      {onCancel ? (
        <Btn kind="secondary" h={52} onClick={onCancel}>
          Cancel
        </Btn>
      ) : null}
      <Btn h={52} style={{ minWidth: 200 }} onClick={onSave} disabled={disabled}>
        Save changes
      </Btn>
    </div>
  );
}

export function SRow({ icon, title, sub, right, to, onClick, danger }: { icon: IconName; title: string; sub?: string; right?: ReactNode; to?: string; onClick?: () => void; danger?: boolean }) {
  const inner = (
    <>
      <span className="ico" style={danger ? { background: 'var(--danger-back)', color: 'var(--danger-text)' } : undefined}>
        <Icon name={icon} />
      </span>
      <span className="grow">
        <span className="s15 strong" style={{ display: 'block', color: danger ? 'var(--danger-text)' : undefined }}>
          {title}
        </span>
        {sub ? <span className="small muted">{sub}</span> : null}
      </span>
      {right ?? (to || onClick ? <Icon name="chevron-right" /> : null)}
    </>
  );
  if (to)
    return (
      <Link to={to} className="srow">
        {inner}
      </Link>
    );
  if (onClick)
    return (
      <button className="srow" onClick={onClick}>
        {inner}
      </button>
    );
  return <div className="srow">{inner}</div>;
}

// ---------- hub ----------
export function EditHub() {
  const s = useSeeker();
  const toast = useToast();
  const p = s.profile;
  const c = completeness(p);
  return (
    <SeekerLayout active="Edit profile">
      <Card pad={28} style={{ gap: 20 }}>
        <div className="row g20 edit-head">
          <Avatar src={p.photo} size={88} ring={s.plan === 'max' ? 'var(--gold)' : undefined} />
          <div className="grow" style={{ minWidth: 0 }}>
            <div className="display d3">
              {p.firstName} {p.lastName}
            </div>
            <div className="s15 muted" style={{ marginTop: 4 }}>
              {p.occupations.flatMap((o) => o.roles).slice(0, 2).join(' · ')} · {p.city}
            </div>
          </div>
          <span className="edit-head-act">
            <Btn kind="secondary" h={44} icon="view" to="/seeker/profile">
              View my profile
            </Btn>
          </span>
        </div>
        <div className="inset" style={{ padding: '16px 18px', borderRadius: 18 }}>
          <div className="row between s15 strong">
            Profile completeness<span>{c.percent}%</span>
          </div>
          <div style={{ marginTop: 10, height: 8, borderRadius: 999, background: 'var(--back-darker)' }}>
            <div style={{ width: `${c.percent}%`, height: 8, borderRadius: 999, background: '#1DB954' }} />
          </div>
          {c.next ? (
            <div className="s14 muted" style={{ marginTop: 8 }}>
              {c.next.hint} to reach {c.nextPercent}%
            </div>
          ) : null}
        </div>
      </Card>
      <Card style={{ padding: '12px 28px', gap: 0 }}>
        <SRow icon="user" title="Personal info" sub="Name, gender, age, contacts" to="/profile/personal" />
        <SRow icon="image" title="General" sub="Photos, video, about, languages" to="/profile/general" />
        <SRow icon="briefcase" title="Professional" sub="Occupations, experience, education, links" to="/profile/professional" />
      </Card>
      <Card pad={20}>
        <div className="row g14">
          <span className="tile" style={{ width: 44, height: 44, background: 'var(--back)', borderRadius: 14 }}>
            <Icon name="view" />
          </span>
          <div className="grow">
            <div className="s16 strong">Visible to employers</div>
            <div className="s14 muted">Show my profile in talent search</div>
          </div>
          <Toggle on={!s.hidden} label="Visible to employers" onChange={(v) => (s.setHidden(!v), toast(v ? 'Profile is visible' : 'Profile hidden from search', v ? 'view' : 'eye-off'))} />
        </div>
      </Card>
    </SeekerLayout>
  );
}

// ---------- personal ----------
export function EditPersonal() {
  const s = useSeeker();
  const toast = useToast();
  const p = s.profile;
  const [f, setF] = useState({ first: p.firstName, last: p.lastName, gender: p.gender ?? '', country: p.country ?? 'United Arab Emirates', city: p.city ?? '', email: p.email ?? '' });
  const [photo, setPhoto] = useState(p.photo);
  return (
    <SeekerLayout active="Personal info">
      <Sec title="Basic info">
        <div className="row g18">
          <Avatar src={photo} size={80} />
          <label className="btn tonal h40">
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => e.target.files?.[0] && setPhoto(URL.createObjectURL(e.target.files[0]))} />
            <Icon name="camera" size={16} />
            Change photo
          </label>
        </div>
        <div className="grid2">
          <Field label="First name *" value={f.first} onChange={(v) => setF({ ...f, first: v })} />
          <Field label="Last name *" value={f.last} onChange={(v) => setF({ ...f, last: v })} />
          <Select label="Gender *" value={f.gender} options={['Female', 'Male']} onChange={(v) => setF({ ...f, gender: v })} />
          <Field label="Age" value={p.age ? `${p.age} years` : ''} onChange={() => undefined} hint="Calculated from your date of birth" />
          <Select label="Country *" value={f.country} options={allCountries} onChange={(v) => setF({ ...f, country: v, city: '' })} />
          <Select label="City *" value={f.city} options={citiesFor(f.country)} onChange={(v) => setF({ ...f, city: v })} />
        </div>
      </Sec>
      <Sec title="Contacts">
        <div className="grid2">
          <Field
            label="Phone"
            value={p.phone ?? ''}
            onChange={() => undefined}
            suffix={
              p.phone ? (
                <Pill tone="green" icon="check">
                  Verified
                </Pill>
              ) : undefined
            }
          />
          <Field label="Email" value={f.email} onChange={(v) => setF({ ...f, email: v })} type="email" />
        </div>
        <div className="row g10 inset s14 primary-text">
          <Icon name="lock" size={18} />
          Employers see your contacts only after you apply or accept an invite.
        </div>
      </Sec>
      <SaveBar
        disabled={!f.first.trim() || !f.last.trim() || !f.city}
        onSave={() => {
          s.updateProfile({ firstName: f.first.trim(), lastName: f.last.trim(), gender: f.gender, country: f.country, city: f.city, email: f.email, photo });
          toast('Changes saved');
        }}
      />
    </SeekerLayout>
  );
}

// ---------- general ----------
const LEVELS: LangLevel[] = ['Native', 'Fluent', 'Intermediate', 'Basic'];
const LANGS = ['English', 'Arabic', 'Russian', 'French', 'Spanish', 'Hindi', 'Turkish', 'German', 'Italian', 'Portuguese'];
export function EditGeneral() {
  const s = useSeeker();
  const toast = useToast();
  const p = s.profile;
  const [photos, setPhotos] = useState(p.photos);
  const [about, setAbout] = useState(p.about);
  const [langs, setLangs] = useState(p.languages);
  const [video, setVideo] = useState(p.video);
  return (
    <SeekerLayout active="General">
      <Sec title="Photos" right={<span className="s14 strong muted">{photos.length} / {s.plan === 'free' ? 10 : 20}</span>}>
        <PhotoGrid photos={photos} onChange={setPhotos} max={s.plan === 'free' ? 10 : 20} cols={6} coverLabel="Cover" />
        <div className="small muted">The first photo is your cover.</div>
      </Sec>
      <Sec title="Video presentation">
        <div className="row g16 wrap">
          {video ? (
            <div className="rel ovh" style={{ width: 120, height: 160, borderRadius: 16 }}>
              <img src={video.poster} alt="" className="ph-cover" style={{ height: '100%' }} />
              <span className="dur" style={{ left: 8, bottom: 8 }}>
                {video.duration}
              </span>
            </div>
          ) : null}
          <div className="row g8">
            <label className="btn secondary h44">
              <input type="file" accept="video/*" style={{ display: 'none' }} onChange={(e) => e.target.files?.[0] && setVideo({ poster: p.photo ?? '', duration: '0:42' })} />
              <Icon name="video" size={18} />
              {video ? 'Replace' : 'Upload video'}
            </label>
            {video ? (
              <Btn kind="secondary" h={44} icon="trash" onClick={() => setVideo(undefined)}>
                Remove
              </Btn>
            ) : null}
          </div>
        </div>
      </Sec>
      <Sec title="About me">
        <Field label="A few lines about you" value={about} onChange={setAbout} area maxLength={500} />
      </Sec>
      <Sec title="Languages">
        <div className="grid2" style={{ gap: 10 }}>
          {langs.map((l, i) => (
            <div key={l.code + i} className="row g12" style={{ height: 56, padding: '0 14px', borderRadius: 16, border: '1px solid var(--stroke)' }}>
              <Initials text={l.code} size={34} radius={10} />
              <span className="grow semi">{l.name}</span>
              <select aria-label={`${l.name} level`} value={l.level} onChange={(e) => setLangs(langs.map((x, k) => (k === i ? { ...x, level: e.target.value as LangLevel } : x)))} style={{ border: 'none', background: 'transparent', color: 'var(--text-body)', fontSize: 14 }}>
                {LEVELS.map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
              <button aria-label={`Remove ${l.name}`} onClick={() => setLangs(langs.filter((_, k) => k !== i))} style={{ color: 'var(--text-light-secondary)', display: 'flex' }}>
                <Icon name="trash" size={18} />
              </button>
            </div>
          ))}
          <select
            className="drop"
            aria-label="Add language"
            value=""
            onChange={(e) => e.target.value && setLangs([...langs, { code: e.target.value.slice(0, 2).toUpperCase(), name: e.target.value, level: 'Fluent' }])}
            style={{ height: 56, padding: '0 16px', fontSize: 15, fontWeight: 700, textAlign: 'center' }}
          >
            <option value="">+ Add language</option>
            {LANGS.filter((x) => !langs.some((l) => l.name === x)).map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </div>
      </Sec>
      <SaveBar
        onSave={() => {
          s.updateProfile({ photos, about, languages: langs, video });
          toast('Changes saved');
        }}
      />
    </SeekerLayout>
  );
}

// ---------- professional ----------
function JobModal({ job, onClose, onSave, onDelete }: { job?: Job; onClose: () => void; onSave: (j: Job) => void; onDelete?: () => void }) {
  const [j, setJ] = useState<Job>(job ?? { id: `x${Date.now()}`, role: '', company: '', city: 'Dubai', category: 'Hospitality', start: { y: 2024, m: 0 }, current: true, description: '' });
  const years = Array.from({ length: 20 }, (_, i) => String(new Date().getFullYear() - i));
  return (
    <Modal onClose={onClose} label="Experience" width={640}>
      <ModalHead title="Experience" onClose={onClose} />
      <div className="grid2" style={{ gap: 12 }}>
        <Field label="Job title *" value={j.role} onChange={(v) => setJ({ ...j, role: v })} autoFocus />
        <Field label="Company or venue *" value={j.company} onChange={(v) => setJ({ ...j, company: v })} />
        <Select label="City *" value={j.city} options={citiesFor('United Arab Emirates')} onChange={(v) => setJ({ ...j, city: v })} />
        <Select label="Category *" value={j.category} options={['Hospitality', 'F&B', 'Events', 'Modeling', 'Music', 'Beauty', 'Service']} onChange={(v) => setJ({ ...j, category: v })} />
        <div className="row g8">
          <Select label="Start month *" value={MONTHS[j.start.m]} options={MONTHS} onChange={(v) => setJ({ ...j, start: { ...j.start, m: MONTHS.indexOf(v) } })} />
          <Select label="Year" value={String(j.start.y)} options={years} onChange={(v) => setJ({ ...j, start: { ...j.start, y: Number(v) } })} />
        </div>
        {j.current ? (
          <Field label="End" value="Present" onChange={() => undefined} />
        ) : (
          <div className="row g8">
            <Select label="End month" value={j.end ? MONTHS[j.end.m] : ''} options={MONTHS} onChange={(v) => setJ({ ...j, end: { y: j.end?.y ?? new Date().getFullYear(), m: MONTHS.indexOf(v) } })} />
            <Select label="Year" value={j.end ? String(j.end.y) : ''} options={years} onChange={(v) => setJ({ ...j, end: { m: j.end?.m ?? 0, y: Number(v) } })} />
          </div>
        )}
      </div>
      <button className="row g10 s15 semi" role="checkbox" aria-checked={j.current} onClick={() => setJ({ ...j, current: !j.current, end: j.current ? j.end : undefined })}>
        <span className={`check${j.current ? ' on' : ''}`}>{j.current ? <Icon name="check" size={14} /> : null}</span>I currently work here
      </button>
      <Field label="What you did · optional" value={j.description} onChange={(v) => setJ({ ...j, description: v })} area maxLength={500} />
      <div className="row between">
        {onDelete ? (
          <button className="row g8 s15 strong danger" onClick={onDelete}>
            <Icon name="trash" size={18} />
            Delete this experience
          </button>
        ) : (
          <span />
        )}
        <Btn h={52} style={{ width: 160 }} disabled={!j.role.trim() || !j.company.trim()} onClick={() => onSave(j)}>
          Save
        </Btn>
      </div>
    </Modal>
  );
}

function Item({ ini, title, sub, meta, extra, onEdit }: { ini: string; title: string; sub: string; meta?: string; extra?: ReactNode; onEdit?: () => void }) {
  return (
    <div className="row g14 sep" style={{ padding: '14px 0' }}>
      <Initials text={ini} size={44} />
      <div className="grow">
        <div className="row g8 s15 strong">
          {title}
          {extra}
        </div>
        <div className="s14 muted" style={{ marginTop: 2 }}>
          {sub}
        </div>
        {meta ? <div className="small muted">{meta}</div> : null}
      </div>
      {onEdit ? (
        <button aria-label={`Edit ${title}`} onClick={onEdit} className="iconbtn soft">
          <Icon name="edit" size={18} />
        </button>
      ) : null}
    </div>
  );
}

export function EditProfessional() {
  const s = useSeeker();
  const toast = useToast();
  const p = s.profile;
  const [job, setJob] = useState<Job | 'new' | null>(null);
  const [linkKind, setLinkKind] = useState<LinkKind>('instagram');
  const [linkVal, setLinkVal] = useState('');
  const saveJob = (j: Job) => {
    const exists = p.experience.some((x) => x.id === j.id);
    s.updateProfile({ experience: exists ? p.experience.map((x) => (x.id === j.id ? j : x)) : [j, ...p.experience] });
    setJob(null);
    toast('Experience saved');
  };
  const free = fields.filter((f) => !p.occupations.some((o) => o.field === f.key));
  return (
    <SeekerLayout active="Professional">
      <Sec title="Occupations" gap={6}>
        <div>
          {p.occupations.map((o, i) => (
            <Item key={o.field} ini={fieldByKey(o.field).label.slice(0, 2).toUpperCase()} title={fieldByKey(o.field).label} sub={o.roles.join(' · ')} extra={i === 0 ? <Pill tone="blue">Primary</Pill> : undefined} />
          ))}
        </div>
        {free.length && p.occupations.length < 2 ? (
          <select
            aria-label="Add occupation"
            value=""
            className="link"
            style={{ border: 'none', background: 'transparent', height: 40, fontSize: 15, alignSelf: 'flex-start' }}
            onChange={(e) => {
              const f = fieldByKey(e.target.value as never);
              s.updateProfile({ occupations: [...p.occupations, { field: f.key, roles: [f.roles[0]], details: {}, links: [] }] });
            }}
          >
            <option value="">+ Add occupation</option>
            {free.map((f) => (
              <option key={f.key} value={f.key}>
                {f.label}
              </option>
            ))}
          </select>
        ) : null}
      </Sec>
      <Sec title="Experience" gap={6}>
        <div>
          {p.experience.map((j) => (
            <Item key={j.id} ini={j.company.slice(0, 2).toUpperCase()} title={j.role} sub={`${j.company} · ${j.city}`} meta={jobPeriod(j)} onEdit={() => setJob(j)} />
          ))}
        </div>
        <button className="link row g8" style={{ height: 40 }} onClick={() => setJob('new')}>
          <Icon name="add" size={18} />
          Add experience
        </button>
      </Sec>
      <Sec title="Education" gap={6}>
        <div>
          {p.education.map((e) => (
            <Item key={e.id} ini={e.institution.slice(0, 2).toUpperCase()} title={`${e.degree}, ${e.field}`} sub={e.institution} meta={studyPeriod(e)} />
          ))}
        </div>
      </Sec>
      <Sec title="Portfolio and socials" gap={6}>
        <div>
          {p.links.map((l) => (
            <Item key={l.id} ini={linkKinds[l.kind].code} title={linkKinds[l.kind].label} sub={l.value} onEdit={() => s.updateProfile({ links: p.links.filter((x) => x.id !== l.id) })} />
          ))}
        </div>
        <div className="row g8 wrap" style={{ marginTop: 8 }}>
          <select aria-label="Link type" value={linkKind} onChange={(e) => setLinkKind(e.target.value as LinkKind)} className="field" style={{ minHeight: 48, width: 180, fontSize: 15 }}>
            {(Object.keys(linkKinds) as LinkKind[]).map((k) => (
              <option key={k} value={k}>
                {linkKinds[k].label}
              </option>
            ))}
          </select>
          <input className="field" style={{ minHeight: 48, flex: 1, fontSize: 15 }} placeholder={linkKinds[linkKind].placeholder} value={linkVal} onChange={(e) => setLinkVal(e.target.value)} aria-label="Link" />
          <Btn kind="tonal" h={48} icon="add" disabled={!linkVal.trim()} onClick={() => (s.updateProfile({ links: [...p.links, { id: `l${Date.now()}`, kind: linkKind, value: linkVal.trim() }] }), setLinkVal(''))}>
            Add link
          </Btn>
        </div>
      </Sec>
      {job ? <JobModal job={job === 'new' ? undefined : job} onClose={() => setJob(null)} onSave={saveJob} onDelete={job === 'new' ? undefined : () => (s.updateProfile({ experience: p.experience.filter((x) => x.id !== job.id) }), setJob(null))} /> : null}
    </SeekerLayout>
  );
}

// ---------- profile look (Max) ----------
export function ProfileLook() {
  const s = useSeeker();
  const toast = useToast();
  const [frame, setFrame] = useState<FrameStyle | undefined>(s.look.frame);
  const [header, setHeader] = useState(s.look.header);
  const max = s.plan === 'max';
  const p = s.profile;
  const opts: [FrameStyle | undefined, string][] = [
    [undefined, 'None'],
    ['gold', 'Gold'],
    ['ocean', 'Ocean'],
    ['neon', 'Neon'],
  ];
  return (
    <SeekerLayout active="Profile look">
      {!max ? (
        <section className="card" style={{ background: 'var(--panel-dark)', color: '#fff' }}>
          <div className="row g10">
            <TierBadge tier="max" size={28} />
            <span className="s17 strong">Profile look comes with Max</span>
          </div>
          <p style={{ color: 'var(--panel-dark-muted)' }}>A frame around your photo and your own header, plus the top of employer search.</p>
          <Btn h={44} to="/profile/plans" style={{ alignSelf: 'flex-start' }}>
            See Max
          </Btn>
        </section>
      ) : null}
      <Card pad={16}>
        <div className="rel ovh" style={{ borderRadius: 24, background: 'var(--back)' }}>
          <div style={{ height: 180, background: header ? undefined : 'var(--primary)' }}>{header ? <img src={city.dubai2} alt="" className="ph-cover" style={{ height: '100%' }} /> : null}</div>
          <div className="row g16" style={{ padding: '0 24px 22px', marginTop: -44, alignItems: 'flex-end' }}>
            <span style={{ width: 104, height: 104, borderRadius: '50%', padding: frame ? 5 : 0, background: frame ? FRAMES[frame] : undefined, flex: 'none' }}>
              <img src={p.photo} alt="" className="avatar" style={{ width: '100%', height: '100%', border: '4px solid var(--surface)' }} />
            </span>
            <div style={{ paddingBottom: 6 }}>
              <div className="row g6 s20 strong">
                {p.firstName} {p.lastName}
                <TierBadge tier="max" size={20} />
              </div>
              <div className="s14 muted">{p.occupations.flatMap((o) => o.roles).slice(0, 2).join(' · ')} · {p.city}</div>
            </div>
          </div>
          <span className="pill" style={{ position: 'absolute', right: 14, top: 14, background: 'rgba(14,26,43,.6)', color: '#fff', height: 28 }}>
            Preview
          </span>
        </div>
      </Card>
      <Sec title="Profile header">
        <p className="s14 muted" style={{ marginTop: -6 }}>
          A wide photo for the top of your profile. At least 1200 × 400 px.
        </p>
        <div className="row g10">
          <Btn kind={header ? 'tonal' : 'secondary'} h={44} icon="image" disabled={!max} onClick={() => setHeader(true)}>
            Upload
          </Btn>
          <Btn kind={!header ? 'tonal' : 'secondary'} h={44} disabled={!max} onClick={() => setHeader(false)}>
            Default
          </Btn>
        </div>
      </Sec>
      <Sec title="Frame">
        <p className="s14 muted" style={{ marginTop: -6 }}>
          Shows around your photo in your profile, search and People.
        </p>
        <div className="grid4" style={{ gap: 12 }}>
          {opts.map(([k, label]) => (
            <button key={label} disabled={!max} aria-pressed={frame === k} onClick={() => setFrame(k)} className={`col g10${frame === k ? ' selbox' : ''}`} style={{ alignItems: 'center', padding: 16, borderRadius: 18, border: '1px solid var(--stroke)', opacity: max ? 1 : 0.5 }}>
              <span style={{ width: 72, height: 72, borderRadius: '50%', padding: 4, background: k ? FRAMES[k] : 'var(--back-darker)' }}>
                <img src={p.photo} alt="" className="avatar" style={{ width: '100%', height: '100%', border: '3px solid var(--surface)' }} />
              </span>
              <span className="s15 strong">{label}</span>
            </button>
          ))}
        </div>
      </Sec>
      <SaveBar disabled={!max} onSave={() => (s.setLook({ frame, header }), toast('Profile look saved', 'sparkles'))} />
    </SeekerLayout>
  );
}

// ---------- plans ----------
export function Plans() {
  const s = useSeeker();
  const nav = useNavigate();
  const toast = useToast();
  const buy = (t: 'premium' | 'max') => {
    s.subscribe(t);
    toast(t === 'max' ? 'You’re on Max' : 'You’re on Premium', 'star');
    nav('/profile/subscription');
  };
  const plan = (name: 'Premium' | 'Max', price: string, pts: string[], featured: boolean) => (
    <div className="grow col g18" style={{ minWidth: 260, borderRadius: 24, padding: 28, background: featured ? 'var(--panel-dark)' : 'var(--surface)', color: featured ? '#fff' : undefined, border: featured ? 'none' : '1px solid var(--stroke)' }}>
      <div className="row between">
        <span className="row g8 s20 strong" style={{ fontSize: 22 }}>
          <TierBadge tier={featured ? 'max' : 'premium'} size={26} />
          {name}
        </span>
        {featured ? (
          <Pill tone="urgent" icon="star">
            Best to get hired
          </Pill>
        ) : null}
      </div>
      <div>
        <span className="display" style={{ fontSize: 34 }}>
          {price}
        </span>
        <span style={{ opacity: 0.7 }}> / month</span>
      </div>
      <ul className="col g10">
        {pts.map((x) => (
          <li key={x} className="row g10" style={{ color: featured ? 'var(--panel-dark-muted)' : 'var(--text-primary)' }}>
            <span style={{ color: featured ? 'var(--urgent)' : 'var(--success-text)', display: 'flex' }}>
              <Icon name="check" size={18} />
            </span>
            {x}
          </li>
        ))}
      </ul>
      <span className="grow" />
      {s.plan === name.toLowerCase() ? (
        <Btn kind="secondary" h={52} full disabled>
          Your plan
        </Btn>
      ) : (
        <Btn kind={featured ? 'primary' : 'secondary'} h={52} full onClick={() => buy(featured ? 'max' : 'premium')}>
          {featured ? `Subscribe for ${price} / month` : `Choose ${name}`}
        </Btn>
      )}
    </div>
  );
  const rows: [string, string, string, string][] = [
    ['Photos', '10', '20', '20'],
    ['Videos', '1', '5', '5'],
    ['Applications', '10', 'Unlimited', 'Unlimited'],
    ['Badge', '—', 'Blue star', 'Gold star'],
    ['Top of search for employers', '—', '—', '✓'],
    ['Profile frame', '—', '—', '3 styles'],
    ['Custom profile header', '—', '—', '✓'],
  ];
  return (
    <SeekerLayout active="Subscription">
      <Card pad={28}>
        <div className="row g20">
          <Avatar src={s.profile.photo} size={64} ring="var(--gold)" />
          <div>
            <div className="display d3" style={{ fontSize: 24 }}>
              Get hired faster
            </div>
            <div className="s15 muted" style={{ marginTop: 4 }}>
              This is how employers will see you with Max: at the top, with your frame and gold badge.
            </div>
          </div>
        </div>
      </Card>
      <div className="row top g16" style={{ flexWrap: 'wrap', alignItems: 'stretch' }}>
        {plan('Premium', '$2.99', ['Unlimited applications', 'Up to 20 photos and 5 videos', 'Blue star badge on your profile'], false)}
        {plan('Max', '$5.99', ['Everything in Premium', 'Always at the top for employers', 'Profile frame, 3 styles', 'Your own profile header'], true)}
      </div>
      <Sec title="Compare plans" gap={4}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15, minWidth: 520 }}>
            <thead>
              <tr className="small muted" style={{ textAlign: 'left' }}>
                <th style={{ padding: '12px 0' }} />
                <th>Free</th>
                <th>Premium</th>
                <th>Max</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r[0]} style={{ borderTop: '1px solid var(--divider)' }}>
                  {r.map((c, i) => (
                    <td key={i} style={{ padding: '14px 0', fontWeight: i === 0 ? 600 : i === 3 ? 700 : 400 }}>
                      {c}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Sec>
      <p className="small muted" style={{ textAlign: 'center' }}>
        Billed monthly to your card. Cancel any time. <a href="#terms">Terms</a> · <a href="#privacy">Privacy</a>
      </p>
    </SeekerLayout>
  );
}

// ---------- subscription ----------
export function SeekerSubscription() {
  const s = useSeeker();
  const toast = useToast();
  const [cancel, setCancel] = useState(false);
  if (s.plan === 'free') return <Plans />;
  const max = s.plan === 'max';
  const inc: [IconName, string, string][] = max
    ? [
        ['star', 'Always at the top for employers', 'First in Talents, search and recommendations'],
        ['sparkles', 'Profile frame', 'Choose one of 3 gradient frames'],
        ['image', 'Custom profile header', 'Your own cover photo at the top of the profile'],
        ['check-double', 'Unlimited applications', 'Apply to as many jobs as you want'],
        ['video', '20 photos and 5 videos', 'Show more of your work in the profile'],
        ['verified', 'Gold star badge', 'On your photo and next to your name everywhere in 919'],
      ]
    : [
        ['check-double', 'Unlimited applications', 'Apply to as many jobs as you want'],
        ['video', '20 photos and 5 videos', 'Show more of your work in the profile'],
        ['verified', 'Blue star badge', 'On your photo and next to your name everywhere in 919'],
      ];
  return (
    <SeekerLayout active="Subscription">
      <section className="card row g20" style={{ background: 'var(--panel-dark)', color: '#fff', flexDirection: 'row', alignItems: 'center' }}>
        <TierBadge tier={s.plan} size={56} />
        <div className="grow">
          <div className="small strong" style={{ color: 'var(--urgent)' }}>
            {s.planCanceled ? 'Canceled · active until 9 Nov 2026' : 'Subscription active'}
          </div>
          <div className="display d2" style={{ marginTop: 4, fontSize: 28 }}>
            {max ? 'Max' : 'Premium'}
          </div>
          <div style={{ marginTop: 6, color: 'var(--panel-dark-muted)' }}>{max ? 'You’re at the top for employers, with your frame, header and unlimited applications.' : 'Unlimited applications and a blue star badge.'}</div>
        </div>
      </section>
      <div className="layout-r w360" style={{ gap: 16 }}>
        <Sec title="What’s included">
          <div className="grid2" style={{ gap: 12 }}>
            {inc.map(([i, t, x]) => (
              <div key={t} className="row top g12 inset" style={{ padding: 14 }}>
                <span className="tile" style={{ width: 40, height: 40, background: 'var(--attention-back)', color: 'var(--info-text)', borderRadius: 12 }}>
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
        <div className="stack">
          <Sec title="Subscription status" gap={6}>
            <div>
              {[
                ['Plan', `${max ? 'Max' : 'Premium'} · monthly`],
                ['Price', max ? '$5.99 / month' : '$2.99 / month'],
                ['Status', s.planCanceled ? 'Canceled' : 'Active'],
                [s.planCanceled ? 'Active until' : 'Next payment', '9 Nov 2026'],
                ['Payment', 'Card •••• 4242'],
              ].map(([a, b]) => (
                <div key={a} className="kv">
                  <span>{a}</span>
                  <span style={a === 'Status' ? { color: s.planCanceled ? 'var(--danger-text)' : 'var(--success-text)' } : undefined}>{b}</span>
                </div>
              ))}
            </div>
          </Sec>
          <Card pad={20} style={{ gap: 10 }}>
            {s.planCanceled ? (
              <Btn h={48} full onClick={() => (s.renewPlan(), toast('Subscription renewed', 'star'))}>
                Renew subscription
              </Btn>
            ) : (
              <>
                <Btn kind="secondary" h={48} full to="/profile/plans">
                  Change plan
                </Btn>
                {max ? (
                  <Btn kind="tonal" h={48} full onClick={() => (s.subscribe('premium'), toast('Switched to Premium', 'star'))}>
                    Switch to Premium for $2.99 / month
                  </Btn>
                ) : null}
                <button className="strong danger" style={{ height: 40 }} onClick={() => setCancel(true)}>
                  Cancel subscription
                </button>
                <div className="small muted lh" style={{ textAlign: 'center' }}>
                  If you cancel, you keep {max ? 'Max' : 'Premium'} until the end of the paid period — 9 Nov 2026.
                </div>
              </>
            )}
          </Card>
        </div>
      </div>
      {cancel ? (
        <Modal onClose={() => setCancel(false)} label="Cancel subscription" width={460}>
          <ModalHead title="Cancel subscription?" sub={`You keep ${max ? 'Max' : 'Premium'} until 9 Nov 2026. After that your profile moves to the Free plan: 10 applications a month, no badge${max ? ', no frame and no top placement' : ''}.`} onClose={() => setCancel(false)} />
          <div className="row g8">
            <Btn kind="secondary" style={{ flex: 1 }} onClick={() => setCancel(false)}>
              Keep it
            </Btn>
            <Btn kind="danger" style={{ flex: 1 }} onClick={() => (s.cancelPlan(), setCancel(false), toast('Subscription canceled', 'cancel'))}>
              Cancel subscription
            </Btn>
          </div>
        </Modal>
      ) : null}
    </SeekerLayout>
  );
}

// ---------- settings ----------
export function ThemeSeg() {
  const [pref, setPref] = useTheme();
  return (
    <div className="tabs" role="radiogroup" aria-label="Theme">
      {(['light', 'dark', 'system'] as ThemePref[]).map((k) => (
        <button key={k} role="radio" aria-checked={pref === k} className={`tab${pref === k ? ' on' : ''}`} style={{ height: 34, fontSize: 14 }} onClick={() => setPref(k)}>
          {k[0].toUpperCase() + k.slice(1)}
        </button>
      ))}
    </div>
  );
}

export function SeekerSettings() {
  const s = useSeeker();
  const { signOut } = useSession();
  const nav = useNavigate();
  const [modal, setModal] = useState<'notif' | 'privacy' | 'delete' | null>(null);
  const prefs: [string, string][] = [
    ['apps', 'Application updates'],
    ['messages', 'New messages'],
    ['vacancies', 'New vacancies in my fields'],
    ['urgent', 'Urgent vacancies'],
    ['email', 'Email digest'],
  ];
  return (
    <SeekerLayout active="Settings">
      <Sec title="Account" gap={4}>
        <div>
          <SRow icon="notification" title="Notifications" sub="Applications, messages, new vacancies" onClick={() => setModal('notif')} />
          <SRow icon="shield" title="Privacy and security" sub="Who sees your profile and contacts" onClick={() => setModal('privacy')} />
          <SRow icon="moon" title="Theme" sub="Light, dark or your device setting" right={<ThemeSeg />} />
        </div>
      </Sec>
      <Sec title="Subscription" gap={4}>
        <div>
          <SRow icon="star" title="Subscription" sub={s.plan === 'free' ? 'Free plan · 10 applications a month' : `Renews 9 Nov 2026`} to={s.plan === 'free' ? '/profile/plans' : '/profile/subscription'} right={s.plan !== 'free' ? <span className="row g8"><Pill tone={s.plan === 'max' ? 'max' : 'blue'}>{s.plan === 'max' ? 'Max' : 'Premium'}</Pill><Icon name="chevron-right" /></span> : undefined} />
          <SRow icon="sparkles" title="Profile look" sub="Frame and header for your profile" to="/profile/look" />
        </div>
      </Sec>
      <Sec title="Legal" gap={4}>
        <div>
          <SRow icon="file" title="User agreement" to="/profile/settings#terms" />
          <SRow icon="lock" title="Privacy policy" to="/profile/settings#privacy" />
        </div>
      </Sec>
      <Card style={{ padding: '12px 28px 20px', gap: 8 }}>
        <div>
          <SRow icon="logout" title="Log out" onClick={() => (signOut(), nav('/', { replace: true }))} right={<span />} />
          <SRow icon="trash" title="Delete account" danger onClick={() => setModal('delete')} right={<span />} />
        </div>
        <div className="small light">919 · web 0.1.0</div>
      </Card>
      {modal === 'notif' ? (
        <Modal onClose={() => setModal(null)} label="Notifications" width={480}>
          <ModalHead title="Notifications" onClose={() => setModal(null)} />
          {prefs.map(([k, l]) => (
            <div key={k} className="row between">
              <span className="semi">{l}</span>
              <Toggle on={s.prefs[k] ?? true} label={l} onChange={(v) => s.setPref(k, v)} />
            </div>
          ))}
        </Modal>
      ) : null}
      {modal === 'privacy' ? (
        <Modal onClose={() => setModal(null)} label="Privacy and security" width={480}>
          <ModalHead title="Privacy and security" onClose={() => setModal(null)} />
          <div className="row between">
            <span className="semi">Show my profile in talent search</span>
            <Toggle on={!s.hidden} label="Visible" onChange={(v) => s.setHidden(!v)} />
          </div>
          <div className="row between">
            <span className="semi">Show contacts after I apply</span>
            <Toggle on={s.prefs.contacts ?? true} label="Contacts" onChange={(v) => s.setPref('contacts', v)} />
          </div>
        </Modal>
      ) : null}
      {modal === 'delete' ? (
        <Modal onClose={() => setModal(null)} label="Delete account" width={460}>
          <ModalHead title="Delete account?" sub="Your profile, applications and chats are deleted for good. Active subscriptions are not refunded." onClose={() => setModal(null)} />
          <Btn kind="danger" h={52} full onClick={() => (signOut(), nav('/', { replace: true }))}>
            Delete account
          </Btn>
        </Modal>
      ) : null}
    </SeekerLayout>
  );
}
