// Company page for job seekers: header, active vacancies, about, website and socials.
import { Navigate, useParams } from 'react-router-dom';
import { companyProfile, companyVacancies } from '../../data/companies';
import { useSeeker } from '../../data/seeker';
import { city } from '../../data/asset';
import { VacancyRow } from '../../ui/domain';
import { Btn, Card, Crumbs, H2, Icon, Initials, Pill, useToast } from '../../ui/kit';

export function CompanyPage() {
  const { id = '' } = useParams();
  const c = companyProfile(id);
  const s = useSeeker();
  const toast = useToast();
  if (!c) return <Navigate to="/seeker" replace />;
  const list = companyVacancies(id);
  const links: [string, string, string | undefined][] = [
    ['WW', 'Website', c.website],
    ['IG', 'Instagram', c.instagram],
    ['IN', 'LinkedIn', c.linkedin],
    ['FB', 'Facebook', c.facebook],
  ];
  return (
    <main className="page">
      <Crumbs back={{ to: '/seeker', label: 'Vacancies' }} items={[c.name]} />
      <section className="card mt16" style={{ padding: 0, overflow: 'hidden', gap: 0, borderRadius: 28 }}>
        <img src={city.dubai1} alt="" className="ph-cover" style={{ height: 200 }} />
        <div className="row g20 wrap" style={{ position: 'relative', zIndex: 1, padding: '0 32px 28px', marginTop: -48, alignItems: 'flex-start' }}>
          <span className="ini" style={{ width: 112, height: 112, borderRadius: 28, fontSize: 34, border: '4px solid var(--surface)' }}>
            {c.initials}
          </span>
          <div className="grow hdr-text" style={{ minWidth: 220 }}>
            <div className="row g10 display d3">
              {c.name}
              {c.verified ? (
                <span style={{ color: 'var(--primary)', display: 'flex' }}>
                  <Icon name="verified" size={24} />
                </span>
              ) : null}
            </div>
            <div className="row g8 s15 muted" style={{ marginTop: 6 }}>
              {c.industry} · {c.city}
              {c.verified ? (
                <Pill tone="blue" icon="shield">
                  Verified employer
                </Pill>
              ) : null}
            </div>
          </div>
          <span className="hdr-act"><Btn kind="secondary" icon="share" onClick={() => (navigator.clipboard?.writeText(location.href).catch(() => undefined), toast('Link copied', 'link'))}>
            Share
          </Btn></span>
        </div>
      </section>
      <div className="layout-r w380 mt24">
        <div className="stack">
          <H2>
            {list.length} active vacanc{list.length === 1 ? 'y' : 'ies'}
          </H2>
          {list.map((v) => (
            <VacancyRow key={v.id} v={v} to={`/vacancy/${v.id}`} status={s.appFor(v.id)?.status} saved={s.saved.includes(v.id)} onSave={() => s.toggleSaved(v.id)} />
          ))}
        </div>
        <aside className="stack">
          <Card>
            <H2>About the company</H2>
            <p className="primary-text lh">{c.about}</p>
          </Card>
          <Card style={{ gap: 8 }}>
            <H2>Website and social</H2>
            <div>
              {links
                .filter(([, , v]) => v)
                .map(([a, b, v]) => (
                  <div key={a} className="row g14" style={{ padding: '14px 0', borderTop: '1px solid var(--divider)' }}>
                    <Initials text={a} size={40} />
                    <div>
                      <div className="small muted">{b}</div>
                      <div className="s15 semi" style={{ color: 'var(--link)' }}>
                        {v}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </Card>
        </aside>
      </div>
    </main>
  );
}
