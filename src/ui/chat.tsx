// Messenger building blocks shared by job seeker and employer chats.
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Link } from '../lib/links';
import { CHAT_TILE, chatTileXml } from '../lib/chatPattern';
import { Icon, useOutside, type IconName } from './kit';

export const clock = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

export function ThreadRow({ to, on, avatar, title, sub, last, time, unread, muted }: { to: string; on: boolean; avatar: ReactNode; title: ReactNode; sub?: ReactNode; last: ReactNode; time: string; unread?: number; muted?: boolean }) {
  return (
    <Link to={to} className={`thread${on ? ' on' : ''}`} aria-current={on ? 'page' : undefined}>
      {avatar}
      <span className="grow" style={{ opacity: muted ? 0.7 : 1 }}>
        <span className="row between g8">
          <span className="s15 strong ellipsis">{title}</span>
          <span className="small muted" style={{ flex: 'none' }}>
            {time}
          </span>
        </span>
        {sub ? <span className="small muted ellipsis" style={{ display: 'block' }}>{sub}</span> : null}
        <span className="row between g8" style={{ marginTop: 2 }}>
          <span className="s14 ellipsis" style={{ color: unread ? 'var(--text-headline)' : 'var(--text-body)', fontWeight: unread ? 600 : 400 }}>
            {last}
          </span>
          {unread ? <span className="badge" style={{ background: 'var(--primary)' }}>{unread}</span> : null}
        </span>
      </span>
    </Link>
  );
}

export function Bubble({ mine, time, children, quote }: { mine: boolean; time: string; children: ReactNode; quote?: { author: string; text: string } }) {
  return (
    <div className={`bubble${mine ? ' mine' : ''}`}>
      {quote ? (
        <div style={{ borderLeft: `3px solid ${mine ? '#fff' : 'var(--primary)'}`, padding: '2px 8px', marginBottom: 6, borderRadius: 4, background: mine ? 'rgba(255,255,255,.18)' : 'var(--back)', fontSize: 13 }}>
          <div className="strong">{quote.author}</div>
          <div className="ellipsis">{quote.text}</div>
        </div>
      ) : null}
      {children}
      <div className="tm">
        {time}
        {mine ? <Icon name="check-double" size={12} style={{ marginLeft: 4, verticalAlign: -2 }} /> : null}
      </div>
    </div>
  );
}

export function PhotoBubble({ mine, photos, time, text }: { mine: boolean; photos: string[]; time: string; text?: string }) {
  return (
    <div className={`bubble${mine ? ' mine' : ''}`} style={{ padding: 4 }}>
      <div style={{ display: 'grid', gridTemplateColumns: photos.length > 1 ? '1fr 1fr' : '1fr', gap: 4, width: 280, maxWidth: '100%' }}>
        {photos.slice(0, 4).map((p, i) => (
          <img key={i} src={p} alt="" className="ph-cover" style={{ height: photos.length > 1 ? 130 : 260, borderRadius: 14 }} />
        ))}
      </div>
      {text ? <div style={{ padding: '6px 10px 0' }}>{text}</div> : null}
      <div className="tm" style={{ padding: '0 10px 4px' }}>
        {time}
      </div>
    </div>
  );
}

export function Composer({ onSend, disabled, placeholder = 'Message', note }: { onSend: (t: string) => void; disabled?: boolean; placeholder?: string; note?: ReactNode }) {
  const [t, setT] = useState('');
  if (disabled) return <div className="composer small muted" style={{ justifyContent: 'center', minHeight: 64 }}>{note}</div>;
  const send = () => {
    if (!t.trim()) return;
    onSend(t.trim());
    setT('');
  };
  return (
    <form
      className="composer"
      onSubmit={(e) => {
        e.preventDefault();
        send();
      }}
    >
      <button type="button" className="iconbtn soft" aria-label="Attach">
        <Icon name="add" />
      </button>
      <input value={t} onChange={(e) => setT(e.target.value)} placeholder={placeholder} aria-label={placeholder} />
      <button type="submit" className="iconbtn" aria-label="Send" disabled={!t.trim()} style={{ background: t.trim() ? 'var(--primary)' : 'var(--back)', color: t.trim() ? '#fff' : 'var(--text-light-secondary)', border: 'none' }}>
        <Icon name="arrow-right" />
      </button>
    </form>
  );
}

export function ChatMenu({ items }: { items: { label: string; icon: IconName; onClick: () => void; danger?: boolean }[] }) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const ref = useOutside<HTMLDivElement>(open, close);
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button className="iconbtn" aria-label="Chat actions" aria-expanded={open} onClick={() => setOpen(!open)}>
        <Icon name="more" />
      </button>
      {open ? (
        <div className="menu" role="menu" onClick={close}>
          {items.map((i) => (
            <button key={i.label} onClick={i.onClick} style={i.danger ? { color: 'var(--danger-text)' } : undefined}>
              <Icon name={i.icon} />
              {i.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function useStickBottom(dep: unknown) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [dep]);
  return ref;
}

export const REPORT_REASONS = ['Asked me to pay a fee or deposit', 'Fake vacancy or company', 'Inappropriate messages', 'Unsafe working conditions', 'Pay or conditions differ from the vacancy', 'Something else'];

/** The 919 chat pattern behind messages (same tile as the app), recoloured for light and dark. */
/** The chat's 2D pattern as a background. `on` picks the ground colour token (chat: --back, cards: --surface). */
export function useChatPattern(on: '--back' | '--surface' = '--back', scale = 1) {
  const read = () => {
    const cs = getComputedStyle(document.documentElement);
    const fg = cs.getPropertyValue('--chat-pattern').trim() || '#E1E6ED';
    const bg = cs.getPropertyValue(on).trim() || (on === '--back' ? '#ECEFF4' : '#FFFFFF');
    return `url("data:image/svg+xml,${encodeURIComponent(chatTileXml(fg, bg))}")`;
  };
  const [bg, setBg] = useState(read);
  useEffect(() => {
    const update = () => setBg(read());
    const mo = new MutationObserver(update);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener('change', update);
    return () => {
      mo.disconnect();
      mq.removeEventListener('change', update);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- read only depends on the token name
  }, []);
  return { backgroundImage: bg, backgroundSize: `${CHAT_TILE.width * scale}px ${CHAT_TILE.height * scale}px` };
}
