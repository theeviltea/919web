// Mobile web: a bottom sheet that recommends the 919 app.
// Shows on phones once per visit (browser session). "Continue in the browser" or closing hides it until the next visit.
// A browser can't tell whether the app is installed (iOS never says); on Android Chrome we ask getInstalledRelatedApps
// and switch the button to "Open the app". Hidden inside the installed web app (standalone) and on desktop widths.
import { useEffect, useState } from 'react';
import { stock } from '../data/asset';
import { STORE_LINKS, APP_OPEN_URL } from '../lib/stores';
import pattern from '../assets/img/pattern-3d.jpg';
import { Icon, Logo } from './kit';

const KEY = '919-app-sheet';
type Platform = 'ios' | 'android' | 'other';

function platform(): Platform {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/i.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return 'ios';
  if (/Android/i.test(ua)) return 'android';
  return 'other';
}

function dismissedThisVisit() {
  try {
    return sessionStorage.getItem(KEY) === 'closed';
  } catch {
    return false;
  }
}

export function AppPromoSheet({ force = false }: { force?: boolean }) {
  const [state, setState] = useState<'hidden' | 'open' | 'closing'>('hidden');
  const [installed, setInstalled] = useState(false);
  const os = platform();

  useEffect(() => {
    if (!force) {
      const phone = window.matchMedia('(max-width: 860px)').matches;
      const standalone = window.matchMedia('(display-mode: standalone)').matches;
      if (!phone || standalone || dismissedThisVisit()) return;
    }
    type RelatedApps = { getInstalledRelatedApps?: () => Promise<unknown[]> };
    (navigator as Navigator & RelatedApps)
      .getInstalledRelatedApps?.()
      .then((apps) => setInstalled(apps.length > 0))
      .catch(() => undefined);
    const t = window.setTimeout(() => setState('open'), 900);
    return () => window.clearTimeout(t);
  }, [force]);

  useEffect(() => {
    if (state !== 'open') return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  });

  const close = () => {
    try {
      sessionStorage.setItem(KEY, 'closed');
    } catch {
      /* private mode: it just shows again */
    }
    setState('closing');
    window.setTimeout(() => setState('hidden'), 320);
  };

  if (state === 'hidden') return null;
  const store = os === 'android' ? STORE_LINKS.android : STORE_LINKS.ios;
  const storeName = os === 'android' ? 'Google Play' : 'the App Store';
  return (
    <div className={`apsheet-wrap ${state}`} role="dialog" aria-modal="true" aria-labelledby="apsheet-title">
      <div className="apsheet-backdrop" onClick={close} aria-hidden="true" />
      <section className="apsheet">
        <span className="apsheet-handle" aria-hidden="true" />
        <button className="apsheet-x" aria-label="Close" onClick={close}>
          <Icon name="cancel" size={20} />
        </button>
        <div className="apsheet-hero" aria-hidden="true">
          <img className="apsheet-bg" src={pattern} alt="" />
          <span className="apsheet-ring r1" />
          <span className="apsheet-ring r2" />
          <span className="apsheet-phone">
            <span className="apsheet-island" />
            <span className="apsheet-screen">
              <span className="apsheet-icon">
                <Logo h={20} color="#fff" />
              </span>
              <span className="apsheet-line w1" />
              <span className="apsheet-line w2" />
              <span className="apsheet-tile" />
              <span className="apsheet-tile" />
            </span>
          </span>
          <span className="apsheet-chip c1">
            <span className="apsheet-dot" style={{ background: 'var(--urgent)', color: '#18191C' }}>
              <Icon name="fire" size={14} />
            </span>
            Urgent · AED 120 / h
          </span>
          <span className="apsheet-chip c2">
            <img src={stock['f-yellow-suit']} alt="" />
            New message
          </span>
          <span className="apsheet-chip c3">
            <span className="apsheet-dot" style={{ background: '#1DB954', color: '#fff' }}>
              <Icon name="check" size={14} />
            </span>
            You’re invited
          </span>
        </div>
        <div className="apsheet-body">
          <h2 id="apsheet-title" className="display">
            919 is better in the app
          </h2>
          <p>Get invitations and messages the moment they arrive, record your video presentation and apply in one tap.</p>
          {installed ? (
            <a className="btn primary h56 apsheet-cta" href={APP_OPEN_URL} onClick={close}>
              Open the app
            </a>
          ) : (
            <a className="btn primary h56 apsheet-cta" href={store} target="_blank" rel="noreferrer" onClick={close}>
              <Icon name="download" />
              Get it on {storeName}
            </a>
          )}
          <button className="apsheet-skip" onClick={close}>
            Continue in the browser
          </button>
          <div className="apsheet-note">Available on iOS and Android</div>
        </div>
      </section>
    </div>
  );
}
