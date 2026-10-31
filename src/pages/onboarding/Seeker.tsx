// Job seeker sign-up, steps 2–5: occupation, questionnaire, photos and video, review.
import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useFinishAuth } from '../../lib/auth';
import { useSignup, type FieldEntry, type Photo } from '../../data/signup';
import { appearanceTypes, clothingSizes, fieldByKey, fields, genres, hairColors, occupationRows, shoeSizes, ageFrom, type Field as FieldKey } from '../../data/registration';
import { Wizard } from '../../layout/Wizard';
import { Btn, Field, Icon, Modal, ModalHead, Option, PageTitle, Pill, Select } from '../../ui/kit';

export const SEEKER_STEPS = ['About you', 'What do you do', 'Details', 'Photos and video', 'Check your profile'];

function useEntry() {
  const { seeker, setSeeker } = useSignup();
  const entry = seeker.occupations[seeker.occupations.length - 1];
  const setEntry = (u: Partial<FieldEntry>) => setSeeker((s) => ({ occupations: s.occupations.map((o, i) => (i === s.occupations.length - 1 ? { ...o, ...u } : o)) }));
  return { seeker, setSeeker, entry, setEntry };
}

// ---------- step 2 ----------
export function Occupation() {
  const nav = useNavigate();
  const { seeker, setSeeker } = useSignup();
  const [sp] = useSearchParams();
  const second = sp.has('second');
  const taken = second ? [seeker.occupations[0]?.field] : [];
  const cur = second ? seeker.occupations[1] : seeker.occupations[0];
  const [field, setField] = useState<FieldKey | undefined>(cur?.field);
  const [roles, setRoles] = useState<string[]>(cur?.roles ?? []);
  if (!seeker.firstName) return <Navigate to="/auth/role" replace />;
  return (
    <Wizard
      steps={SEEKER_STEPS}
      cur={1}
      backTo={second ? '/signup/review' : '/auth/about'}
      nextDisabled={!field || !roles.length}
      onNext={() => {
        const entry: FieldEntry = { field: field!, roles, details: cur?.field === field ? cur.details : {}, links: cur?.field === field ? cur.links : [] };
        setSeeker((s) => ({ occupations: second ? [s.occupations[0], entry] : [entry, ...s.occupations.slice(1)] }));
        nav('/signup/details');
      }}
    >
      <PageTitle title="What do you do?" sub={second ? 'Pick your second field and roles.' : 'Pick your main field and roles. You can add a second field at the end.'} />
      <div className="col g12">
        <span className="small strong muted">Fields</span>
        <div className="grid2" style={{ gap: 12 }}>
          {fields
            .filter((f) => !taken.includes(f.key))
            .map((f) =>
              f.key === field ? (
                <div key={f.key} className="span-all col g14" style={{ borderRadius: 20, border: '2px solid var(--primary)', padding: 20 }}>
                  <button className="row between" onClick={() => setField(undefined)}>
                    <span className="s17 strong">{f.label}</span>
                    <span className="s14 strong" style={{ color: 'var(--link)' }}>
                      {roles.length ? `${roles.length} selected` : 'Pick roles'}
                    </span>
                  </button>
                  <div className="chips">
                    {f.roles.map((r) => (
                      <Option key={r} on={roles.includes(r)} onClick={() => setRoles(roles.includes(r) ? roles.filter((x) => x !== r) : [...roles, r])}>
                        {r}
                      </Option>
                    ))}
                  </div>
                </div>
              ) : (
                <button
                  key={f.key}
                  className="row between"
                  style={{ height: 64, borderRadius: 18, border: '1px solid var(--stroke)', padding: '0 18px', fontSize: 16, fontWeight: 600, background: 'var(--surface)' }}
                  onClick={() => {
                    setField(f.key);
                    setRoles([]);
                  }}
                >
                  {f.label}
                  <span className="muted" style={{ display: 'flex' }}>
                    <Icon name="chevron-down" size={18} />
                  </span>
                </button>
              ),
            )}
        </div>
      </div>
    </Wizard>
  );
}

// ---------- step 3 ----------
export function Details() {
  const nav = useNavigate();
  const { entry, setEntry, seeker } = useEntry();
  const seekerOccs = seeker.occupations.length;
  const [d, setD] = useState<Record<string, string>>(entry?.details ?? {});
  const [tattoos, setTattoos] = useState(!!entry?.tattoos);
  const [piercing, setPiercing] = useState(!!entry?.piercing);
  const [link, setLink] = useState(entry?.links[0] ?? '');
  if (!entry) return <Navigate to="/signup/occupation" replace />;
  const form = fieldByKey(entry.field).form;
  const body = form === 'model' || form === 'body';
  const keys = body ? ['height', 'weight', ...(form === 'model' ? ['bust', 'waist', 'hips'] : []), 'clothing', 'shoe', 'hair', 'appearance'] : form === 'music' ? ['genre'] : [];
  const ok = keys.every((k) => d[k]) && (form !== 'service' || link);
  const num = (k: string, label: string) => <Field key={k} label={label} value={d[k] ?? ''} onChange={(v) => setD({ ...d, [k]: v.replace(/\D/g, '').slice(0, 3) })} inputMode="numeric" />;
  const sel = (k: string, label: string, options: string[]) => <Select key={k} label={label} value={d[k] ?? ''} options={options} onChange={(v) => setD({ ...d, [k]: v })} />;
  const role = entry.roles[0] ?? fieldByKey(entry.field).label;
  const title = form === 'model' ? 'Model details' : form === 'music' ? 'Musician details' : `${role} details`;
  return (
    <Wizard
      steps={SEEKER_STEPS}
      cur={2}
      backTo="/signup/occupation"
      nextDisabled={!ok}
      onNext={() => {
        setEntry({ details: d, tattoos, piercing, links: link ? [link] : [] });
        nav(seekerOccs > 1 ? '/signup/review' : '/signup/media');
      }}
    >
      <PageTitle title={title} sub={form === 'model' ? 'Employers filter castings by these. Fields marked * are required.' : 'Employers filter candidates by these. Fields marked * are required.'} />
      {body ? (
        <div className="grid3">
          {num('height', 'Height, cm *')}
          {num('weight', 'Weight, kg *')}
          {form === 'model' ? [num('bust', 'Bust, cm *'), num('waist', 'Waist, cm *'), num('hips', 'Hips, cm *')] : null}
          {sel('clothing', 'Clothing size *', clothingSizes)}
          {sel('shoe', 'Shoe size, EU *', shoeSizes)}
          {sel('hair', 'Hair color *', hairColors)}
          {sel('appearance', 'Appearance type *', appearanceTypes)}
        </div>
      ) : null}
      {body ? (
        <div>
          <div className="s15 strong" style={{ marginBottom: 10 }}>
            Tattoos and piercing <span className="muted semi">· tap what applies</span>
          </div>
          <div className="chips">
            <Option on={tattoos} onClick={() => setTattoos(!tattoos)}>
              Tattoos
            </Option>
            <Option on={piercing} onClick={() => setPiercing(!piercing)}>
              Piercing
            </Option>
          </div>
        </div>
      ) : null}
      {form === 'music' ? (
        <div>
          <div className="s15 strong" style={{ marginBottom: 10 }}>
            Genre *
          </div>
          <div className="chips">
            {genres.map((g) => (
              <Option key={g} on={d.genre === g} onClick={() => setD({ ...d, genre: g })}>
                {g}
              </Option>
            ))}
          </div>
        </div>
      ) : null}
      {form === 'music' || form === 'service' ? <Field label={form === 'music' ? 'Promo link' : 'Portfolio link *'} value={link} onChange={setLink} placeholder={form === 'music' ? 'youtube.com, soundcloud.com…' : 'instagram.com, behance.net…'} /> : null}
    </Wizard>
  );
}

// ---------- step 4 ----------
const PROMPTS = ['Say hello and tell your name and age', 'Tell about your experience: where you worked and what you did', 'Why do you want to work with us?'];

export function VideoRecorder({ poster, onDone, onClose }: { poster?: string; onDone: () => void; onClose: () => void }) {
  const [p, setP] = useState(0);
  const [sec, setSec] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setSec((s) => (s >= 60 ? s : s + 1)), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <Modal onClose={onClose} width={900} label="Record a video">
      <div className="row top g24" style={{ flexWrap: 'wrap' }}>
        <div className="rel ovh" style={{ flex: 'none', width: 420, maxWidth: '100%', height: 560, borderRadius: 24, background: 'var(--inverse)' }}>
          {poster ? <img src={poster} alt="" className="ph-cover" style={{ height: '100%' }} /> : null}
          <span className="pill" style={{ position: 'absolute', left: 16, top: 16, height: 32, background: 'rgba(14,26,43,.6)', color: '#fff', fontSize: 14 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#E0123F' }} />
            0:{String(sec).padStart(2, '0')} / 1:00
          </span>
          <button aria-label="Stop recording" onClick={onDone} style={{ position: 'absolute', left: '50%', bottom: 20, transform: 'translateX(-50%)', width: 72, height: 72, borderRadius: '50%', border: '4px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ width: 28, height: 28, borderRadius: 8, background: '#E0123F' }} />
          </button>
        </div>
        <div className="grow col g14" style={{ minWidth: 260, alignSelf: 'stretch' }}>
          <ModalHead title="Record a video" onClose={onClose} />
          {PROMPTS.map((t, i) => (
            <div key={t} style={{ borderRadius: 18, padding: 16, background: i === p ? 'var(--primary-secondary)' : 'var(--back)', opacity: i < p ? 0.55 : 1 }}>
              <div className="small strong" style={{ color: i === p ? 'var(--link)' : 'var(--text-body)' }}>
                Prompt {i + 1} of 3
              </div>
              <div className="s16 semi" style={{ marginTop: 6, lineHeight: 1.4 }}>
                {t}
              </div>
            </div>
          ))}
          <span className="grow" />
          <div className="row g10">
            {p < 2 ? (
              <Btn h={52} icon="arrow-right" onClick={() => setP(p + 1)}>
                Next prompt
              </Btn>
            ) : (
              <Btn h={52} icon="check" onClick={onDone}>
                Finish recording
              </Btn>
            )}
            <Btn
              kind="secondary"
              h={52}
              onClick={() => {
                setP(0);
                setSec(0);
              }}
            >
              Start over
            </Btn>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export function PhotoGrid({ photos, onChange, max = 9, cols = 5, coverLabel = 'Main' }: { photos: Photo[]; onChange: (p: Photo[]) => void; max?: number; cols?: number; coverLabel?: string }) {
  const add = (files: FileList | null) => {
    if (!files) return;
    const next = [...photos, ...[...files].map((f, i) => ({ id: `u${Date.now()}${i}`, source: URL.createObjectURL(f) }))].slice(0, max);
    onChange(next);
  };
  const empty = Math.max(0, Math.min(3, max - photos.length - 1));
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gap: 12 }} className="photogrid">
      {photos.map((p, i) => (
        <div key={p.id} className="rel">
          <img src={p.source} alt="" className="ph-cover" style={{ aspectRatio: '3 / 4', borderRadius: 18 }} />
          {i === 0 ? (
            <span className="pill white" style={{ position: 'absolute', left: 10, top: 10, height: 24 }}>
              {coverLabel}
            </span>
          ) : (
            <button className="pill white mkcover" style={{ position: 'absolute', left: 10, top: 10, height: 24 }} onClick={() => onChange([p, ...photos.filter((x) => x.id !== p.id)])}>
              Make {coverLabel.toLowerCase()}
            </button>
          )}
          <button aria-label="Remove photo" onClick={() => onChange(photos.filter((x) => x.id !== p.id))} style={{ position: 'absolute', right: 10, top: 10, width: 30, height: 30, borderRadius: 10, background: 'rgba(14,26,43,.55)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="trash" size={16} />
          </button>
        </div>
      ))}
      {photos.length < max ? (
        <label className="drop" style={{ aspectRatio: '3 / 4', fontSize: 14 }}>
          <input type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={(e) => add(e.target.files)} />
          <Icon name="add" size={24} />
          Add photo
        </label>
      ) : null}
      {Array.from({ length: empty }, (_, i) => (
        <div key={i} className="desk-only" style={{ aspectRatio: '3 / 4', borderRadius: 18, background: 'var(--back)' }} />
      ))}
    </div>
  );
}

export function VideoTile({ poster, duration, w = 180 }: { poster: string; duration: string; w?: number }) {
  return (
    <div className="rel ovh" style={{ width: w, height: Math.round((w * 4) / 3), borderRadius: 18, flex: 'none' }}>
      <img src={poster} alt="" className="ph-cover" style={{ height: '100%' }} />
      <span className="play">
        <span>
          <Icon name="play-filled" size={22} />
        </span>
      </span>
      <span className="dur">{duration}</span>
    </div>
  );
}

export function Media() {
  const nav = useNavigate();
  const { seeker, setSeeker } = useSignup();
  const [rec, setRec] = useState(false);
  if (!seeker.occupations.length) return <Navigate to="/signup/occupation" replace />;
  return (
    <Wizard steps={SEEKER_STEPS} cur={3} backTo="/signup/details" nextDisabled={seeker.photos.length < 1} onNext={() => nav('/signup/review')}>
      <PageTitle title="Photos and video" sub="The same set shows for every field you work in. Photos are required, video is optional." />
      <div>
        <div className="row between s15 strong" style={{ marginBottom: 12 }}>
          Photos *<span className="muted">{seeker.photos.length} / 9</span>
        </div>
        <PhotoGrid photos={seeker.photos} onChange={(photos) => setSeeker({ photos })} />
        <div className="hint">Drag photos to change the order. The first one is your main photo.</div>
      </div>
      <div>
        <div className="s15 strong" style={{ marginBottom: 12 }}>
          Video presentation
        </div>
        <div className="row g16 wrap">
          {seeker.video ? <VideoTile poster={seeker.video.poster} duration={seeker.video.duration} /> : null}
          <div className="col g10" style={{ maxWidth: 340 }}>
            <p className="s14 muted lh">Up to 1 minute. Three short prompts help you tell employers about yourself. Profiles with a video get 3× more invitations.</p>
            <div className="row g8 wrap">
              <Btn kind="secondary" h={44} icon="video" onClick={() => setRec(true)}>
                {seeker.video ? 'Record again' : 'Record video'}
              </Btn>
              <label className="btn secondary h44">
                <input type="file" accept="video/*" style={{ display: 'none' }} onChange={(e) => e.target.files?.[0] && setSeeker({ video: { poster: seeker.photos[0]?.source ?? seeker.photo ?? '', duration: '0:42' } })} />
                <Icon name="download" size={18} />
                Upload file
              </label>
              {seeker.video ? (
                <Btn kind="ghost" h={44} onClick={() => setSeeker({ video: undefined })}>
                  Remove
                </Btn>
              ) : null}
            </div>
          </div>
        </div>
      </div>
      {rec ? (
        <VideoRecorder
          poster={seeker.photo}
          onClose={() => setRec(false)}
          onDone={() => {
            setSeeker({ video: { poster: seeker.photo ?? seeker.photos[0]?.source ?? '', duration: '0:42' } });
            setRec(false);
          }}
        />
      ) : null}
    </Wizard>
  );
}

// ---------- step 5 ----------
export function Review() {
  const nav = useNavigate();
  const finish = useFinishAuth();
  const { seeker } = useSignup();
  const [open, setOpen] = useState<number | null>(0);
  if (!seeker.occupations.length) return <Navigate to="/signup/occupation" replace />;
  const age = ageFrom(seeker.dob);
  return (
    <Wizard steps={SEEKER_STEPS} cur={4} backTo="/signup/media" onNext={() => finish({ role: 'seeker' })}>
      <PageTitle title="Check your profile" sub="This is what employers will see. You can edit it any time." />
      <div className="row g20">
        {seeker.photo ? <img src={seeker.photo} alt="" className="avatar" style={{ width: 88, height: 88 }} /> : null}
        <div className="grow">
          <div className="s20 strong" style={{ fontSize: 24 }}>
            {seeker.firstName} {seeker.lastName}
          </div>
          <div className="s15 muted" style={{ marginTop: 4 }}>
            {[age !== undefined ? `${age} years` : null, seeker.gender, seeker.city].filter(Boolean).join(' · ')}
          </div>
        </div>
        <Btn kind="secondary" h={44} icon="edit" to="/auth/about">
          Edit
        </Btn>
      </div>
      {seeker.occupations.map((o, i) => {
        const rows = occupationRows(o);
        return (
          <div key={o.field} className="col g14" style={{ borderRadius: 20, border: '1px solid var(--stroke)', padding: 20 }}>
            <button className="row g10" onClick={() => setOpen(open === i ? null : i)}>
              <span className="s17 strong">{fieldByKey(o.field).label}</span>
              <Pill tone="green" icon="check">
                Complete
              </Pill>
              <span className="grow" />
              <span className="s14 muted">{o.roles.join(' · ')}</span>
              <Icon name={open === i ? 'chevron-down' : 'chevron-right'} size={18} />
            </button>
            {open === i ? (
              <div className="grid5" style={{ gap: 8 }}>
                {rows.map(([a, b]) => (
                  <div key={a} className="inset" style={{ padding: '12px 14px', borderRadius: 14 }}>
                    <div className="small muted">{a}</div>
                    <div className="s15 strong" style={{ marginTop: 2 }}>
                      {b}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        );
      })}
      {seeker.occupations.length < 2 ? (
        <button
          className="drop"
          style={{ height: 56, flexDirection: 'row', fontSize: 15 }}
          onClick={() => nav('/signup/occupation?second=1')}
        >
          <Icon name="add" size={20} />
          Add a second occupation
        </button>
      ) : null}
      <div className="layout-r w320" style={{ gap: 16 }}>
        <div>
          <div className="s15 strong" style={{ marginBottom: 10 }}>
            Photos
          </div>
          <div className="grid5" style={{ gap: 8 }}>
            {seeker.photos.map((p) => (
              <img key={p.id} src={p.source} alt="" className="ph-cover" style={{ aspectRatio: '3 / 4', borderRadius: 14 }} />
            ))}
          </div>
        </div>
        {seeker.video ? (
          <div>
            <div className="s15 strong" style={{ marginBottom: 10 }}>
              Video presentation
            </div>
            <VideoTile poster={seeker.video.poster} duration={seeker.video.duration} w={180} />
          </div>
        ) : null}
      </div>
    </Wizard>
  );
}
