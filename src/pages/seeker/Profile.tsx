// Job seeker's own profile: how employers see it, stats, Available today, visibility.
import { useState } from 'react';
import { useSeeker, jobPeriod, totalExperience, studyPeriod, linkKinds, completeness } from '../../data/seeker';
import { fieldByKey, occupationRows } from '../../data/registration';
import { city } from '../../data/asset';
import { AvailCard, AvailModal } from './Feed';
import { PhotoViewer } from './People';
import { VideoGrid, VideoPlayer } from '../../ui/video';
import { useNavigate } from 'react-router-dom';
import { Btn, Card, FRAMES, H2, Icon, Initials, Pill, TierBadge, Toggle, useToast } from '../../ui/kit';

export function SeekerProfilePage() {
  const s = useSeeker();
  const toast = useToast();
  const p = s.profile;
  const [viewer, setViewer] = useState<number | null>(null);
  const [player, setPlayer] = useState<number | null>(null);
  const nav = useNavigate();
  const videos = [...(p.video ? [{ ...p.video, views: p.stats.videoViews }] : []), ...(s.plan === 'max' ? (p.moreVideos ?? []) : [])];
  const photos = p.photos.map((x) => x.source);
  const frame = s.plan === 'max' ? s.look.frame : undefined;
  const c = completeness(p);
  const toggles = (
    <>
      <AvailCard />
      <Card pad={20} style={{ gap: 12 }}>
        <div className="row g12">
          <span className="tile" style={{ width: 40, height: 40, background: 'var(--back)', borderRadius: 12 }}>
            <Icon name={s.hidden ? 'eye-off' : 'view'} />
          </span>
          <div className="grow">
            <div className="strong">Visible to employers</div>
            <div className="small muted">Show my profile in talent search</div>
          </div>
          <Toggle on={!s.hidden} label="Visible to employers" onChange={(v) => (s.setHidden(!v), toast(v ? 'Profile is visible' : 'Profile hidden from search', v ? 'view' : 'eye-off'))} />
        </div>
        {c.percent < 100 ? (
          <div className="small muted">
            Profile {c.percent}% complete · {c.next?.hint}
          </div>
        ) : null}
      </Card>
    </>
  );
  return (
    <main className="page">
      <section className="card" style={{ padding: 0, overflow: 'hidden', gap: 0 }}>
        <div className="rel" style={{ height: 200, background: 'var(--primary)' }}>
          {s.plan === 'max' && s.look.header ? <img src={city.dubai2} alt="" className="ph-cover" style={{ height: '100%' }} /> : null}
        </div>
        <div className="row g20 wrap" style={{ position: 'relative', zIndex: 1, padding: '0 32px 28px', marginTop: -48, alignItems: 'flex-start' }}>
          <span style={{ borderRadius: '50%', padding: frame ? 5 : 0, background: frame ? FRAMES[frame] : undefined, flex: 'none' }}>
            <img src={p.photo} alt="" className="avatar" style={{ width: 112, height: 112, border: '4px solid var(--surface)' }} />
          </span>
          <div className="grow hdr-text" style={{ minWidth: 220 }}>
            <div className="row g10 display d3">
              {p.firstName} {p.lastName}
              <TierBadge tier={s.plan} size={24} />
            </div>
            <div className="s15 muted" style={{ marginTop: 6 }}>
              {[p.age ? `${p.age} years` : null, p.gender, p.city].filter(Boolean).join(' · ')}
            </div>
          </div>
          <div className="row g8 wrap hdr-act">
            <Btn kind="secondary" h={48} icon="share" onClick={() => (navigator.clipboard?.writeText(location.href).catch(() => undefined), toast('Link copied', 'link'))}>
              Share
            </Btn>
            {s.plan === 'max' ? (
              <Btn kind="secondary" h={48} icon="sparkles" to="/profile/look">
                Profile look
              </Btn>
            ) : null}
            <Btn h={48} icon="edit" to="/profile/edit">
              Edit profile
            </Btn>
          </div>
        </div>
      </section>
      <div className="narrow-only mt16">
        <div className="stack">{toggles}</div>
      </div>
      <div className="grid4 mt16">
        {(
          [
            [p.stats.views, 'Profile views', 'this week'],
            [p.stats.applications, 'Applications', 'this month'],
            [p.stats.invites, 'Invitations', 'from employers'],
            [p.stats.videoViews, 'Video views', 'all time'],
          ] as const
        ).map(([n, a, b]) => (
          <div key={a} className="stat">
            <div className="n">{n}</div>
            <div className="s14 semi" style={{ marginTop: 4 }}>
              {a}
            </div>
            <div className="small muted">{b}</div>
          </div>
        ))}
      </div>
      <div className="layout-r mt16">
        <div className="stack">
          <Card>
            <H2 right={<span className="s14 muted">{photos.length}</span>}>Photos</H2>
            <div className="grid6 keep6" style={{ gap: 10 }}>
              {photos.map((ph, i) => (
                <button key={i} onClick={() => setViewer(i)} aria-label={`Photo ${i + 1}`}>
                  <img src={ph} alt="" className="ph-cover" style={{ aspectRatio: '3 / 4', borderRadius: 16 }} />
                </button>
              ))}
            </div>
          </Card>
          {videos.length ? (
            <Card>
              <H2 right={<span className="s14 muted">{videos.length === 1 ? `${p.stats.videoViews} views` : `${videos.length} videos · ${p.stats.videoViews} views`}</span>}>{videos.length === 1 ? 'Video presentation' : 'Videos'}</H2>
              <VideoGrid videos={videos} onOpen={setPlayer} />
            </Card>
          ) : null}
          <Card>
            <H2>About</H2>
            <p className="primary-text lh">{p.about || 'A few lines about you help employers decide.'}</p>
          </Card>
          {p.occupations.map((o) => (
            <Card key={o.field}>
              <H2 right={<span className="s14 muted">{o.roles.join(' · ')}</span>}>{fieldByKey(o.field).label}</H2>
              <div className="grid4" style={{ gap: 8 }}>
                {occupationRows(o).map(([a, b]) => (
                  <div key={a} className="inset" style={{ padding: '12px 14px', borderRadius: 14 }}>
                    <div className="small muted">{a}</div>
                    <div className="strong" style={{ marginTop: 2 }}>
                      {b}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
          {p.experience.length ? (
            <Card style={{ gap: 4 }}>
              <H2>
                Experience <span className="muted semi">{totalExperience(p.experience)}</span>
              </H2>
              {p.experience.map((j) => (
                <div key={j.id} className="row top g14 sep" style={{ padding: '14px 0' }}>
                  <Initials text={j.company.slice(0, 2).toUpperCase()} size={44} />
                  <div>
                    <div className="strong">{j.role}</div>
                    <div className="s14 muted">
                      {j.company} · {j.city}
                    </div>
                    <div className="small muted">{jobPeriod(j)}</div>
                  </div>
                </div>
              ))}
            </Card>
          ) : null}
        </div>
        <aside className="stack">
          <div className="stack wide-only">{toggles}</div>
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
          {p.education.length ? (
            <Card style={{ gap: 12 }}>
              <H2>Education</H2>
              {p.education.map((e) => (
                <div key={e.id}>
                  <div className="strong">
                    {e.degree}, {e.field}
                  </div>
                  <div className="s14 muted" style={{ marginTop: 2 }}>
                    {e.institution} · {studyPeriod(e)}
                  </div>
                </div>
              ))}
            </Card>
          ) : null}
          {p.links.length ? (
            <Card style={{ gap: 12 }}>
              <H2>Portfolio and socials</H2>
              {p.links.map((l) => (
                <div key={l.id} className="row between">
                  <span className="muted">{linkKinds[l.kind].label}</span>
                  <span className="semi" style={{ color: 'var(--link)' }}>
                    {l.value}
                  </span>
                </div>
              ))}
            </Card>
          ) : null}
          {s.plan === 'free' ? (
            <Pill tone="max" icon="star">
              Free plan · <a href="/profile/plans">upgrade</a>
            </Pill>
          ) : null}
        </aside>
      </div>
      {viewer !== null ? <PhotoViewer photos={photos} index={viewer} title={`${p.firstName} ${p.lastName}`} onClose={() => setViewer(null)} /> : null}
      <AvailModal />
      {player !== null ? <VideoPlayer videos={videos} index={player} owner={{ name: `${p.firstName} ${p.lastName}`, subtitle: 'Your video presentation', avatar: p.photo, tier: s.plan, own: true, onReplace: () => (setPlayer(null), nav('/profile/general')) }} onClose={() => setPlayer(null)} /> : null}
    </main>
  );
}
