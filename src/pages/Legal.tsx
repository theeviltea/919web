// User agreement / Privacy policy, for job seekers and for business accounts. /legal/:doc
import { useNavigate, useParams } from 'react-router-dom';
import { DOCS, type DocKey } from '../data/legal';
import { useSession } from '../data/session';
import { Link } from '../lib/links';
import { Icon, Logo } from '../ui/kit';

const SLUG: Record<string, DocKey> = { terms: 'terms', privacy: 'privacy', 'business-terms': 'bizTerms', 'business-privacy': 'bizPrivacy' };

export function LegalPage() {
  const { doc = 'privacy' } = useParams();
  const nav = useNavigate();
  const { user } = useSession();
  const key = SLUG[doc] ?? 'privacy';
  const d = DOCS[key];
  const biz = key === 'bizTerms' || key === 'bizPrivacy';
  const other = key === 'terms' ? 'privacy' : key === 'privacy' ? 'terms' : key === 'bizTerms' ? 'business-privacy' : 'business-terms';
  const home = user ? (user.role === 'employer' ? '/company/settings' : '/profile/settings') : '/';
  return (
    <>
      <header className="topnav">
        <div className="topnav-in">
          <Link to={home} aria-label="919 home">
            <Logo h={26} />
          </Link>
          <span className="grow" />
          <button className="btn secondary h44" onClick={() => (window.history.length > 1 ? nav(-1) : nav(home))}>
            <Icon name="chevron-left" size={18} />
            Back
          </button>
        </div>
      </header>
      <main className="page">
        <article className="card legal" style={{ maxWidth: 760, margin: '8px auto 0', padding: 'clamp(20px, 4vw, 44px)', gap: 18 }}>
          <div className="small strong muted">{biz ? 'For business accounts' : 'For job seekers'}</div>
          <h1 className="display d2">{d.title}</h1>
          <span className="pill gray" style={{ alignSelf: 'flex-start' }}>
            <Icon name="calendar" size={14} />
            Updated 1 October 2026
          </span>
          <p className="s16 lh primary-text">{d.intro}</p>
          {d.sections.map(([h, ps], i) => (
            <section key={h} className="col g8">
              <h2 className="s17 strong">
                {i + 1}. {h}
              </h2>
              {ps.map((p) => (
                <p key={p} className="lh primary-text">
                  {p}
                </p>
              ))}
            </section>
          ))}
          <div className="row g12 wrap sep" style={{ paddingTop: 18 }}>
            <span className="s14 muted grow">Questions? Write to info@919app.net</span>
            <Link to={`/legal/${other}`} className="link s14">
              {key === 'terms' || key === 'bizTerms' ? 'Privacy policy' : 'User agreement'}
            </Link>
          </div>
        </article>
      </main>
    </>
  );
}
