// People (job seeker): top profiles in the field, Max strip, how to join the top, everyone. Person profile page.
import { useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { candidates, findCandidate, mediaOf, talentSphereLabels, talentSphereOrder, type Candidate, type TalentSphere } from '../../data/talentPool';
import { FULL_NAMES, profileOf, sphereChip } from '../../data/candidateProfile';
import { completeness, useSeeker } from '../../data/seeker';
import { tierRank } from '../../data/tiers';
import { FEMALE, MALE } from '../../data/asset';
import pattern from '../../assets/img/pattern-3d.jpg';
import { Link } from '../../lib/links';
import { candidateCard, FrameRing } from '../../ui/domain';
import { VideoGrid, VideoPlayer } from '../../ui/video';
import { Btn, Card, Crumbs, H2, Icon, Initials, Pill, TierBadge, type IconName } from '../../ui/kit';

const byName = (n: string) => candidates.find((c) => c.name === n)!;
const TOP = ['Layla H.', 'Nadia R.', 'Sara M.', 'Olivia G.'].map(byName).filter(Boolean);
const MAX_STRIP = ['Karim A.', 'Lina M.', 'Omar S.', 'Zara K.', 'Leo P.', 'Ali R.', 'Yusuf N.'].map(byName).filter(Boolean);

function ProgressCard() {
  const { profile, plan } = useSeeker();
  const comp = completeness(profile);
  const ICONS: Record<string, IconName> = { photo: 'user', photos: 'camera', video: 'play', about: 'edit', languages: 'globe', experience: 'briefcase', education: 'file' };
  const plus = Math.round(100 / comp.items.length);
  if (comp.percent >= 100)
    return (
      <Card pad={20} style={{ gap: 14 }}>
        <div className="row g14">
          <span className="tile display" style={{ width: 60, height: 60, borderRadius: 18, background: 'var(--success-back)', color: 'var(--success-text)', fontSize: 18, flex: 'none' }}>
            #7
          </span>
          <div className="grow">
            <div className="s16 strong">Your place in Hospitality</div>
            <div className="s14 muted lh" style={{ marginTop: 2 }}>
              ↑ 3 this week. Profile 100% complete — keep it fresh with new photos.
            </div>
          </div>
        </div>
        {plan !== 'max' ? (
          <Btn h={44} to="/profile/plans" kind="ink">
            Go to the top with Max
          </Btn>
        ) : null}
      </Card>
    );
  const steps = comp.items.filter((x) => !x.done).slice(0, 3);
  return (
    <Card pad={20} style={{ gap: 12 }}>
      <div className="row g14">
        <span className="tile s16 strong" style={{ width: 60, height: 60, borderRadius: '50%', flex: 'none', background: `conic-gradient(var(--primary) ${comp.percent * 3.6}deg, var(--back-darker) 0)` }}>
          <span className="tile" style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--surface)' }}>{comp.percent}%</span>
        </span>
        <div className="grow">
          <div className="s16 strong">
            {steps.length} step{steps.length === 1 ? '' : 's'} to join the top
          </div>
          <div className="s14 muted lh" style={{ marginTop: 2 }}>
            Profiles at 100% get up to 4× more invites in Hospitality.
          </div>
        </div>
      </div>
      {steps.map((x) => (
        <Link key={x.key} to="/profile/general" className="row g10 inset" style={{ height: 48, padding: '0 12px', borderRadius: 14, color: 'var(--text-headline)' }}>
          <span className="tile" style={{ width: 26, height: 26, borderRadius: 8, background: 'var(--primary-secondary)', color: 'var(--link)' }}>
            <Icon name={ICONS[x.key] ?? 'add'} size={14} />
          </span>
          <span className="grow s14 semi">{x.hint}</span>
          <span className="small strong" style={{ color: 'var(--success-text)' }}>
            +{plus}%
          </span>
        </Link>
      ))}
      <Btn h={48} to="/profile/edit">
        Complete my profile
      </Btn>
    </Card>
  );
}

const TOP_META: Record<string, [number, string]> = { 'Layla H.': [12, 'EN · AR'], 'Nadia R.': [10, 'EN · FR · AR'], 'Sara M.': [9, 'EN · PT'], 'Olivia G.': [11, 'EN · RU'] };

/** Top profiles in the seeker's field: the app's ranked carousel (big outlined numbers, photo cards). */
function TopCarousel() {
  const ref = useRef<HTMLDivElement>(null);
  const by = (d: number) => ref.current?.scrollBy({ left: d * 230, behavior: 'smooth' });
  return (
    <section>
      <div className="row g8 between">
        <div>
          <div className="row g8">
            <h2 className="s20 strong">Top in Hospitality</h2>
            <Pill tone="blue">Your field</Pill>
          </div>
          <div className="s14 muted" style={{ marginTop: 2 }}>
            The most complete profiles this week
          </div>
        </div>
        <div className="row g8 desk-only">
          <button className="iconbtn soft" aria-label="Previous" onClick={() => by(-1)}>
            <Icon name="chevron-left" />
          </button>
          <button className="iconbtn soft" aria-label="Next" onClick={() => by(1)}>
            <Icon name="chevron-right" />
          </button>
        </div>
      </div>
      <div className="topcar" ref={ref}>
        {TOP.map((c, i) => {
          const [ph, langs] = TOP_META[c.name] ?? [6, 'EN'];
          return (
            <Link key={c.id} to={`/people/${c.id}`} className="topcard" aria-label={`Number ${i + 1}: ${c.name}, ${c.role}`}>
              <span className="topnum" aria-hidden="true">
                {i + 1}
              </span>
              <span className="topimg">
                <img src={c.photo} alt="" />
                <span className="topgrad" />
                <span className="toptags">
                  <TierBadge tier={c.tier} size={24} />
                  <span className="pill" style={{ background: 'var(--urgent)', color: '#18191C', height: 24 }}>
                    <Icon name="check" size={12} />
                    100%
                  </span>
                  {c.video ? (
                    <span className="pill" style={{ marginLeft: 'auto', background: 'rgba(14,26,43,.55)', color: '#fff', height: 24 }}>
                      <Icon name="play-filled" size={10} />
                      {c.video.duration}
                    </span>
                  ) : null}
                </span>
                <span className="topinfo">
                  <span className="s16 strong ellipsis" style={{ display: 'block' }}>
                    {FULL_NAMES[c.name] ?? c.name}
                  </span>
                  <span className="small" style={{ opacity: 0.86 }}>
                    {c.role} · {c.city}
                  </span>
                  <span className="row g10 small semi" style={{ marginTop: 6, opacity: 0.9 }}>
                    <span className="row g4">
                      <Icon name="camera" size={13} />
                      {ph}
                    </span>
                    <span className="row g4">
                      <Icon name="globe" size={13} />
                      {langs}
                    </span>
                  </span>
                </span>
                <FrameRing frame={c.frame} radius={24} />
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export function People() {
  const [sphere, setSphere] = useState<'all' | TalentSphere>('all');
  const [count, setCount] = useState(12);
  const everyone = useMemo(() => candidates.filter((x) => sphere === 'all' || x.sphere === sphere).sort((a, b) => tierRank(b.tier) - tierRank(a.tier)), [sphere]);
  return (
    <main className="page">
      <section className="hero" style={{ height: 'auto', padding: '28px 36px', alignItems: 'center' }}>
        <img className="bg" src={pattern} alt="" aria-hidden="true" />
        <div className="grow">
          <h1 className="display d2">People on 919</h1>
          <p style={{ marginTop: 6, opacity: 0.92 }}>See how the best profiles look and make yours stand out.</p>
        </div>
        <div className="row desk-only">
          {TOP.slice(0, 3).map((x, i) => (
            <img key={x.id} src={x.photo} alt="" className="avatar" style={{ width: 40, height: 40, border: '2px solid var(--primary)', marginLeft: i ? -10 : 0 }} />
          ))}
          <span className="strong s14" style={{ marginLeft: 10 }}>
            4 000+
          </span>
        </div>
      </section>
      <div className="layout-r w360 mt24">
        <div className="stack">
          <TopCarousel />
          <div className="narrow-only">
            <ProgressCard />
          </div>
          <section className="card" style={{ background: 'var(--panel-dark)', color: '#fff' }}>
            <div className="row g8">
              <TierBadge tier="max" size={22} />
              <span className="s16 strong">Max profiles go first</span>
            </div>
            <div className="row g12" style={{ overflowX: 'auto', paddingBottom: 4 }}>
              {MAX_STRIP.map((c) => (
                <Link key={c.id} to={`/people/${c.id}`} className="col g6" style={{ color: '#fff', width: 96, flex: 'none', alignItems: 'center', textAlign: 'center' }}>
                  <span className="rel" style={{ display: 'block', width: 84, height: 84, borderRadius: '50%', padding: 3, background: 'conic-gradient(from 200deg, #FFD84D, #FF9F1A, #FFE9A8, #FFD84D)' }}>
                    <img src={c.photo} alt="" className="avatar" style={{ width: 78, height: 78, border: '3px solid var(--panel-dark)' }} />
                  </span>
                  <span className="s14 strong">{c.name}</span>
                  <span className="small" style={{ color: 'var(--panel-dark-muted)' }}>
                    {c.role}
                  </span>
                </Link>
              ))}
            </div>
          </section>
          <H2>Everyone</H2>
          <div className="chips scroll">
            <button className={`chip${sphere === 'all' ? ' on' : ''}`} onClick={() => setSphere('all')}>
              All
            </button>
            {talentSphereOrder.map((s) => (
              <button key={s} className={`chip${sphere === s ? ' on' : ''}`} onClick={() => setSphere(s)}>
                {talentSphereLabels[s]}
              </button>
            ))}
          </div>
          <div className="grid4">{everyone.slice(0, count).map((c) => candidateCard(c, `/people/${c.id}`))}</div>
          {count < everyone.length ? (
            <Btn kind="secondary" onClick={() => setCount(count + 12)} style={{ alignSelf: 'center' }}>
              Show more
            </Btn>
          ) : null}
        </div>
        <aside className="stack wide-only">
          <ProgressCard />
        </aside>
      </div>
    </main>
  );
}

// ---------- Profile view (People → person, Talent → candidate) ----------
export function ProfileView({ c, actions, back }: { c: Candidate; actions?: ReactNode; back: { to: string; label: string } }) {
  const p = profileOf(c);
  const [viewer, setViewer] = useState<number | null>(null);
  const [player, setPlayer] = useState<number | null>(null);
  // Web: a gallery of distinct licensed photos of the same gender, starting with the profile photo.
  const media = mediaOf(c, c.gender === 'male' ? MALE : FEMALE);
  const gallery = media.photos;
  const videos = media.videos;
  const linkHref = (v: string) => (v.startsWith('@') ? `https://instagram.com/${v.slice(1)}` : `https://${v.replace(/^https?:\/\//, '')}`);
  return (
    <main className="page">
      <Crumbs back={back} items={[p.fullName]} />
      <section className="card prof-head mt16">
        <div className="row g20">
          <span className="rel" style={{ display: 'inline-flex', borderRadius: '50%', padding: c.frame ? 4 : 0, flex: 'none', isolation: 'isolate' }}>
            {c.frame ? <FrameRing frame={c.frame} radius={999} /> : null}
            <img src={c.photo} alt="" className="avatar prof-ava" />
          </span>
          <div className="grow" style={{ minWidth: 0 }}>
            <div className="row g8 display d3 prof-name">
              {p.fullName}
              <TierBadge tier={c.tier} size={22} />
            </div>
            <div className="s15 muted" style={{ marginTop: 4 }}>
              {c.age} years · {c.gender === 'female' ? 'Female' : 'Male'} · {c.city}, {c.country}
            </div>
            <div className="row wrap g6" style={{ marginTop: 10 }}>
              <Pill tone="blue">{sphereChip(c)}</Pill>
              {c.today ? (
                <Pill tone="urgent" icon="flash">
                  Available today · {c.today}
                </Pill>
              ) : null}
            </div>
          </div>
        </div>
        {actions ? (
          <div className="stack prof-actions" style={{ gap: 8 }}>
            {actions}
          </div>
        ) : (
          <div className="prof-deco desk-only" aria-hidden="true">
            <img src={pattern} alt="" />
          </div>
        )}
      </section>
      <div className="layout-r mt16">
        <div className="stack">
          <Card>
            <H2
              right={
                gallery.length > 5 ? (
                  <button className="link s14" onClick={() => setViewer(0)}>
                    See all {gallery.length}
                  </button>
                ) : undefined
              }
            >
              Photos <span className="muted semi">{gallery.length}</span>
            </H2>
            <MediaGrid n={gallery.length} kind="photo" stage={gallery[0]}>
              {(i, more) => (
                <button key={i} className="rel ovh" onClick={() => setViewer(i)} style={{ width: '100%', height: '100%', borderRadius: 'inherit' }} aria-label={more ? `Show all ${gallery.length} photos` : `Photo ${i + 1}`}>
                  <img src={gallery[i]} alt="" className="ph-cover" style={{ height: '100%' }} />
                  {more ? <span className="more">+{more}</span> : null}
                </button>
              )}
            </MediaGrid>
          </Card>
          {videos.length ? (
            <Card>
              <H2 right={<span className="s14 muted">{videos.length === 1 ? `${videos[0].views} views` : `${videos.length} videos`}</span>}>{videos.length === 1 ? 'Video presentation' : 'Videos'}</H2>
              <VideoGrid videos={videos} onOpen={setPlayer} main="Presentation" />
            </Card>
          ) : null}
          {p.experience.length ? (
            <Card style={{ gap: 4 }}>
              <H2>
                Experience <span className="muted semi">{p.total}</span>
              </H2>
              {p.experience.map((x) => (
                <div key={x.role + x.place} className="row top g14 sep" style={{ padding: '14px 0' }}>
                  <Initials text={x.place.slice(0, 2).toUpperCase()} size={44} />
                  <div>
                    <div className="strong">{x.role}</div>
                    <div className="s14 muted">{x.place}</div>
                    <div className="small muted">{x.period}</div>
                  </div>
                </div>
              ))}
            </Card>
          ) : null}
          <Card>
            <H2 right={<span className="s14 muted">{p.field.roles.join(' · ')}</span>}>{p.field.title}</H2>
            <div className="grid4" style={{ gap: 8 }}>
              {p.field.rows.map(([a, b]) => (
                <div key={a} className="inset" style={{ padding: '12px 14px', borderRadius: 14 }}>
                  <div className="small muted">{a}</div>
                  <div className="strong" style={{ marginTop: 2 }}>
                    {b}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
        <aside className="stack">
          <Card>
            <H2>About</H2>
            <p className="primary-text lh">{p.about}</p>
          </Card>
          <Card style={{ gap: 12 }}>
            <H2>Languages</H2>
            {p.languages.map((l) => (
              <div key={l.code} className="row g12">
                <Initials text={l.code} size={36} radius={10} />
                <span className="grow semi">{l.name}</span>
                <span className="s14 muted">{l.level}</span>
              </div>
            ))}
          </Card>
          {p.education ? (
            <Card style={{ gap: 12 }}>
              <H2>Education</H2>
              <div>
                <div className="strong">{p.education.title}</div>
                <div className="s14 muted" style={{ marginTop: 2 }}>
                  {p.education.school} · {p.education.years}
                </div>
              </div>
            </Card>
          ) : null}
          {p.links.length ? (
            <Card style={{ gap: 12 }}>
              <H2>Portfolio and socials</H2>
              {p.links.map((l) => (
                <div key={l.kind + l.value} className="row between">
                  <span className="muted">{l.label}</span>
                  <a href={linkHref(l.value)} target="_blank" rel="noreferrer" className="semi">
                    {l.value}
                  </a>
                </div>
              ))}
            </Card>
          ) : null}
        </aside>
      </div>
      {viewer !== null ? <PhotoViewer photos={gallery} index={viewer} title={p.fullName} onClose={() => setViewer(null)} /> : null}
      {player !== null ? <VideoPlayer videos={videos} index={player} owner={{ name: p.fullName, subtitle: `${c.role} · ${c.city}`, avatar: c.photo, tier: c.tier }} onClose={() => setPlayer(null)} /> : null}
    </main>
  );
}

/**
 * Desktop media layout that adapts to the count:
 * 1–2 photos: centred on a blurred full-width stage; 3–4: one even row of 3:4 tiles; 5+: a big tile and four small, the last one shows "+N".
 * Videos: 1 is a wide player, 2–3 an even row, 4 a 2×2 grid, 5+ the same mosaic as photos.
 */
function MediaGrid({ n, kind, stage, children }: { n: number; kind: 'photo' | 'video'; stage?: string; children: (i: number, more: number) => ReactNode }) {
  const cell = (i: number, style: CSSProperties, more = 0) => (
    <div key={i} style={{ borderRadius: i === 0 && n >= 5 ? 24 : 18, overflow: 'hidden', minWidth: 0, ...style }}>
      {children(i, more)}
    </div>
  );
  if (n >= 5) {
    const rows = kind === 'photo' ? '220px 220px' : '170px 170px';
    return (
      <div className="media-grid mosaic" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gridTemplateRows: rows, gap: 10 }}>
        {[0, 1, 2, 3, 4].map((i) => cell(i, i === 0 ? { gridRow: '1 / 3' } : {}, i === 4 && n > 5 ? n - 5 : 0))}
      </div>
    );
  }
  if (kind === 'photo' && n <= 2) {
    // 1–2 photos: a full-width stage with the first photo blurred behind, so the card never looks half empty.
    return (
      <div className="media-stage">
        {stage ? <img src={stage} alt="" aria-hidden="true" className="media-stage-bg" /> : null}
        {Array.from({ length: n }, (_, i) => cell(i, { height: '100%', aspectRatio: '3 / 4', boxShadow: '0 12px 32px rgba(14,26,43,.25)' }))}
      </div>
    );
  }
  if (kind === 'photo') {
    return (
      <div className="media-grid" style={{ display: 'grid', gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))`, gap: 10 }}>
        {Array.from({ length: n }, (_, i) => cell(i, { aspectRatio: '3 / 4' }))}
      </div>
    );
  }
  if (n === 1) return <div className="media-grid">{cell(0, { height: 320, borderRadius: 20 })}</div>;
  const cols = n === 4 ? 2 : n;
  return (
    <div className="media-grid" style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gap: 10 }}>
      {Array.from({ length: n }, (_, i) => cell(i, { aspectRatio: '16 / 10' }))}
    </div>
  );
}

export function PhotoViewer({ photos, index, title, onClose }: { photos: string[]; index: number; title: string; onClose: () => void }) {
  const [i, setI] = useState(index);
  const go = (d: number) => setI((i + d + photos.length) % photos.length);
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Photos"
      tabIndex={-1}
      ref={(el) => el?.focus()}
      onKeyDown={(e) => (e.key === 'Escape' ? onClose() : e.key === 'ArrowRight' ? go(1) : e.key === 'ArrowLeft' ? go(-1) : undefined)}
      style={{ position: 'fixed', inset: 0, zIndex: 150, background: '#0B0F16', color: '#fff', outline: 'none' }}
    >
      <div className="row between" style={{ position: 'absolute', left: 24, right: 24, top: 20 }}>
        <span className="s16 strong">
          {title} <span style={{ opacity: 0.7, fontWeight: 500 }}>· {i + 1} / {photos.length}</span>
        </span>
        <button aria-label="Close" onClick={onClose} style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(255,255,255,.14)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="cancel" size={22} />
        </button>
      </div>
      <img src={photos[i]} alt="" style={{ position: 'absolute', left: '50%', top: 90, transform: 'translateX(-50%)', height: 'calc(100vh - 220px)', maxWidth: 'calc(100vw - 32px)', aspectRatio: '3 / 4', borderRadius: 20, objectFit: 'cover' }} />
      {(['left', 'right'] as const).map((d) => (
        <button key={d} aria-label={d === 'left' ? 'Previous' : 'Next'} onClick={() => go(d === 'left' ? -1 : 1)} style={{ position: 'absolute', [d]: 32, top: '50%', transform: 'translateY(-50%)', width: 56, height: 56, borderRadius: '50%', background: 'rgba(255,255,255,.14)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={`chevron-${d}`} size={28} />
        </button>
      ))}
      <div className="row g10 thumbs" style={{ position: 'absolute', left: 24, right: 24, bottom: 24 }}>
        {photos.map((p, k) => (
          <button key={k} onClick={() => setI(k)} aria-label={`Photo ${k + 1}`} ref={k === i ? (el) => el?.scrollIntoView({ block: 'nearest', inline: 'center' }) : undefined} style={{ flex: 'none' }}>
            <img src={p} alt="" style={{ width: 56, height: 74, borderRadius: 12, objectFit: 'cover', opacity: k === i ? 1 : 0.5, outline: k === i ? '2px solid #fff' : undefined, outlineOffset: 2 }} />
          </button>
        ))}
      </div>
    </div>
  );
}

export function PersonPage() {
  const { id = '' } = useParams();
  const c = findCandidate(id);
  if (!c) return <Navigate to="/seeker/people" replace />;
  // Seekers look at other profiles for reference only: no share or report here.
  return <ProfileView c={c} back={{ to: '/seeker/people', label: 'People' }} />;
}
