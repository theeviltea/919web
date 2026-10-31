// Design-system atoms for the 919 web app (same look as the app and the "919 Web" design canvas).
import { createContext, useCallback, useContext, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Link } from '../lib/links';
import { lockScroll } from '../lib/scrollLock';
import { icons, type IconName } from '../lib/icon';
import { LOGO_PATHS, LOGO_VIEWBOX } from '../lib/logo';
import type { FrameStyle, Tier } from '../data/tiers';

export type { IconName };

export function Icon({ name, size = 20, style }: { name: IconName; size?: number; style?: CSSProperties }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ flex: 'none', ...style }} dangerouslySetInnerHTML={{ __html: icons[name] }} />;
}

export function Logo({ h = 26, color = 'var(--primary)' }: { h?: number; color?: string }) {
  return (
    <svg role="img" aria-label="919" width={Math.round((h * 525) / 290)} height={h} viewBox={LOGO_VIEWBOX} style={{ display: 'block', flex: 'none' }}>
      {LOGO_PATHS.map((d, i) => (
        <path key={i} d={d} fill={color} />
      ))}
    </svg>
  );
}

type BtnKind = 'primary' | 'secondary' | 'tonal' | 'ink' | 'urgent' | 'premium' | 'premium-soft' | 'danger' | 'ghost';
export function Btn({
  children,
  kind = 'primary',
  h,
  icon,
  full,
  to,
  onClick,
  disabled,
  type = 'button',
  style,
  label,
}: {
  children?: ReactNode;
  kind?: BtnKind;
  h?: 40 | 44 | 48 | 52 | 56;
  icon?: IconName;
  full?: boolean;
  to?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit';
  style?: CSSProperties;
  label?: string;
}) {
  const cls = `btn ${kind}${h && h !== 48 ? ` h${h}` : ''}${full ? ' full' : ''}`;
  const inner = (
    <>
      {icon ? <Icon name={icon} size={h === 40 ? 16 : 18} /> : null}
      {children}
    </>
  );
  if (to && !disabled)
    return (
      <Link to={to} className={cls} style={style} aria-label={label}>
        {inner}
      </Link>
    );
  return (
    <button type={type} className={cls} onClick={onClick} disabled={disabled} style={style} aria-label={label}>
      {inner}
    </button>
  );
}

export function IconBtn({ icon, label, onClick, to, dot, soft, size = 20 }: { icon: IconName; label: string; onClick?: () => void; to?: string; dot?: boolean; soft?: boolean; size?: number }) {
  const inner = (
    <>
      <Icon name={icon} size={size} />
      {dot ? <span className="dot" /> : null}
    </>
  );
  if (to)
    return (
      <Link to={to} className={`iconbtn${soft ? ' soft' : ''}`} aria-label={label} title={label}>
        {inner}
      </Link>
    );
  return (
    <button className={`iconbtn${soft ? ' soft' : ''}`} aria-label={label} title={label} onClick={onClick}>
      {inner}
    </button>
  );
}

export type PillTone = 'blue' | 'green' | 'gray' | 'urgent' | 'orange' | 'yellow' | 'red' | 'purple' | 'max' | 'white';
export function Pill({ children, tone = 'gray', icon, h }: { children: ReactNode; tone?: PillTone; icon?: IconName; h?: number }) {
  return (
    <span className={`pill ${tone}`} style={h ? { height: h, fontSize: h > 26 ? 13 : 12 } : undefined}>
      {icon ? <Icon name={icon} size={14} /> : null}
      {children}
    </span>
  );
}

export function Chip({ children, on, urgent, count, icon, onClick, soft }: { children: ReactNode; on?: boolean; urgent?: boolean; count?: number; icon?: IconName; onClick?: () => void; soft?: boolean }) {
  return (
    <button className={`chip${on ? ' on' : ''}${urgent ? ' urgent' : ''}${soft ? ' soft' : ''}`} aria-pressed={on || urgent || soft} onClick={onClick}>
      {icon ? <Icon name={icon} size={16} /> : null}
      {children}
      {count !== undefined ? <span className="n">{count}</span> : null}
    </button>
  );
}

export function Option({ children, on, onClick, dark, icon }: { children: ReactNode; on?: boolean; onClick?: () => void; dark?: boolean; icon?: IconName }) {
  return (
    <button className={`option${on ? ' on' : ''}${dark ? ' dark' : ''}`} aria-pressed={!!on} onClick={onClick}>
      {on && !dark ? <Icon name="check" size={16} /> : icon ? <Icon name={icon} size={16} /> : null}
      {children}
    </button>
  );
}

export function Tabs<T extends string>({ items, value, onChange, full }: { items: { key: T; label: ReactNode; n?: number }[]; value: T; onChange: (k: T) => void; full?: boolean }) {
  return (
    <div className={`tabs${full ? ' full' : ''}`} role="tablist">
      {items.map((it) => (
        <button key={it.key} role="tab" aria-selected={it.key === value} className={`tab${it.key === value ? ' on' : ''}`} onClick={() => onChange(it.key)}>
          {it.label}
          {it.n !== undefined ? <span className="n">{it.n}</span> : null}
        </button>
      ))}
    </div>
  );
}

export function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return <button role="switch" aria-checked={on} aria-label={label} className="toggle" onClick={() => onChange(!on)} />;
}

export function Check({ on }: { on: boolean }) {
  return <span className={`check${on ? ' on' : ''}`}>{on ? <Icon name="check" size={14} /> : null}</span>;
}

export function CheckRow({ on, onChange, children, right }: { on: boolean; onChange: (v: boolean) => void; children: ReactNode; right?: ReactNode }) {
  return (
    <button className="row g10" style={{ height: 36, fontSize: 15, width: '100%', textAlign: 'left' }} role="checkbox" aria-checked={on} onClick={() => onChange(!on)}>
      <Check on={on} />
      <span className="grow">{children}</span>
      {right ? <span className="small muted">{right}</span> : null}
    </button>
  );
}

export function Avatar({ src, size = 40, radius, ring }: { src?: string; size?: number; radius?: number | string; ring?: string }) {
  const img = <img className="avatar" src={src} alt="" style={{ width: size, height: size, borderRadius: radius ?? '50%' }} />;
  if (!ring) return img;
  return (
    <span className="ring" style={{ background: ring, borderRadius: radius ?? '50%', display: 'inline-flex' }}>
      <span style={{ display: 'inline-flex', padding: 2, background: 'var(--surface)', borderRadius: radius ?? '50%' }}>{img}</span>
    </span>
  );
}

export function Initials({ text, size = 40, radius = 12, bg }: { text: string; size?: number; radius?: number; bg?: string }) {
  return (
    <span className="ini" style={{ width: size, height: size, borderRadius: radius, fontSize: Math.round(size * 0.34), background: bg }}>
      {text}
    </span>
  );
}

export const FRAMES: Record<FrameStyle, string> = {
  neon: 'conic-gradient(from 200deg, #FF1E54, #7A3FD1, #3589F2, #FF1E54)',
  gold: 'conic-gradient(from 200deg, #FFD84D, #FF9F1A, #FFE9A8, #FFD84D)',
  ocean: 'conic-gradient(from 200deg, #7CF2D4, #00C2FF, #3589F2, #7CF2D4)',
};

export function TierBadge({ tier, size = 20 }: { tier?: Tier | 'prem'; size?: number }) {
  if (!tier || tier === 'free') return null;
  const max = tier === 'max';
  return (
    <span className="tier" role="img" aria-label={max ? 'Max' : 'Premium'} style={{ width: size, height: size, background: max ? 'var(--gold)' : 'var(--primary)' }}>
      <svg width={Math.round(size * 0.62)} height={Math.round(size * 0.62)} viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 4.6l2.2 4.5 4.9.7-3.6 3.5.9 4.9L12 15.9l-4.4 2.3.9-4.9-3.6-3.5 4.9-.7L12 4.6Z" fill="currentColor" />
      </svg>
    </span>
  );
}

export function FlashTile({ size = 40 }: { size?: number }) {
  return (
    <span className="tile flash" style={{ width: size, height: size, borderRadius: Math.round(size * 0.3) }}>
      <Icon name="flash" size={Math.round(size * 0.5)} />
    </span>
  );
}

export function IconTile({ icon, size = 44, bg = 'var(--back)', fg = 'var(--text-headline)' }: { icon: IconName; size?: number; bg?: string; fg?: string }) {
  return (
    <span className="tile" style={{ width: size, height: size, background: bg, color: fg, borderRadius: Math.round(size * 0.32) }}>
      <Icon name={icon} size={Math.round(size * 0.46)} />
    </span>
  );
}

export function Card({ children, pad, className = '', style, as = 'section' }: { children: ReactNode; pad?: 16 | 20 | 28 | 36; className?: string; style?: CSSProperties; as?: 'section' | 'div' | 'article' }) {
  const Tag = as;
  return (
    <Tag className={`card${pad ? ` p${pad}` : ''} ${className}`} style={style}>
      {children}
    </Tag>
  );
}

export function H2({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <div className="row between g12">
      <h2 className="h2">{children}</h2>
      {right}
    </div>
  );
}

export function PageTitle({ title, sub, size = 30 }: { title: ReactNode; sub?: ReactNode; size?: 22 | 26 | 28 | 30 | 34 }) {
  return (
    <div>
      <h1 className="display" style={{ fontSize: size }}>
        {title}
      </h1>
      {sub ? (
        <p className="primary-text s16 lh" style={{ marginTop: 10, maxWidth: 560 }}>
          {sub}
        </p>
      ) : null}
    </div>
  );
}

export function Crumbs({ back, items }: { back: { to: string; label: string }; items: string[] }) {
  return (
    <div className="crumbs">
      <Link to={back.to}>
        <Icon name="chevron-left" size={16} />
        {back.label}
      </Link>
      {items.map((t) => (
        <span key={t}>/ {t}</span>
      ))}
    </div>
  );
}

// ---------- inputs ----------
export function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  prefix,
  suffix,
  area,
  rows = 4,
  autoFocus,
  error,
  hint,
  maxLength,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  prefix?: ReactNode;
  suffix?: ReactNode;
  area?: boolean;
  rows?: number;
  autoFocus?: boolean;
  error?: string;
  hint?: ReactNode;
  maxLength?: number;
  inputMode?: 'numeric' | 'tel' | 'email' | 'text';
}) {
  return (
    <div>
      <label className={`field${area ? ' area' : ''}${error ? ' error' : ''}`}>
        {prefix}
        <span className="grow col">
          {value || area ? <span className="lab">{label}</span> : null}
          {area ? (
            <textarea value={value} rows={rows} placeholder={placeholder ?? label} onChange={(e) => onChange(e.target.value)} maxLength={maxLength} autoFocus={autoFocus} />
          ) : (
            <input value={value} type={type} placeholder={placeholder ?? label} aria-label={label} onChange={(e) => onChange(e.target.value)} autoFocus={autoFocus} maxLength={maxLength} inputMode={inputMode} />
          )}
        </span>
        {suffix ? <span className="suffix">{suffix}</span> : null}
      </label>
      {error ? <div className="hint err">{error}</div> : hint ? <div className="hint">{hint}</div> : null}
      {area && maxLength ? (
        <div className="hint" style={{ textAlign: 'right', marginTop: 4 }}>
          {value.length} / {maxLength}
        </div>
      ) : null}
    </div>
  );
}

export function Select({ label, value, options, onChange, placeholder = 'Select' }: { label: string; value: string; options: string[]; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="field">
      <span className="grow col">
        <span className="lab">{label}</span>
        <select value={value} onChange={(e) => onChange(e.target.value)} aria-label={label}>
          {!value ? <option value="">{placeholder}</option> : null}
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </span>
      <span className="suffix">
        <Icon name="chevron-down" size={18} />
      </span>
    </label>
  );
}

export function SearchBox({ value, onChange, placeholder, inset, onEnter, autoFocus }: { value: string; onChange: (v: string) => void; placeholder: string; inset?: boolean; onEnter?: () => void; autoFocus?: boolean }) {
  return (
    <label className={`search${inset ? ' inset' : ''}`}>
      <Icon name="search" />
      <input value={value} placeholder={placeholder} aria-label={placeholder} onChange={(e) => onChange(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && onEnter?.()} autoFocus={autoFocus} />
      {value ? (
        <button aria-label="Clear" onClick={() => onChange('')} style={{ display: 'flex', color: 'var(--text-body)' }}>
          <Icon name="cancel" />
        </button>
      ) : null}
    </label>
  );
}

// ---------- overlays ----------
function useEsc(onClose: () => void) {
  const ref = useRef(onClose);
  ref.current = onClose;
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === 'Escape' && ref.current();
    window.addEventListener('keydown', h);
    const unlock = lockScroll();
    return () => {
      window.removeEventListener('keydown', h);
      unlock();
    };
  }, []);
}

export function Modal({ children, onClose, width = 520, label }: { children: ReactNode; onClose: () => void; width?: number; label: string }) {
  useEsc(onClose);
  return (
    <div className="scrim" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="dialog" role="dialog" aria-modal="true" aria-label={label} style={{ width }}>
        {children}
      </div>
    </div>
  );
}

export function CloseX({ onClick }: { onClick: () => void }) {
  return <IconBtn icon="cancel" label="Close" soft onClick={onClick} />;
}

export function ModalHead({ title, sub, onClose, lead }: { title: ReactNode; sub?: ReactNode; onClose: () => void; lead?: ReactNode }) {
  return (
    <div className="row top g16">
      {lead}
      <div className="grow">
        <h2 className="display d4" style={{ lineHeight: 1.2 }}>
          {title}
        </h2>
        {sub ? (
          <p className="muted lh" style={{ marginTop: 6 }}>
            {sub}
          </p>
        ) : null}
      </div>
      <CloseX onClick={onClose} />
    </div>
  );
}

export function Drawer({ children, onClose, label }: { children: ReactNode; onClose: () => void; label: string }) {
  useEsc(onClose); // also locks page scroll while open
  return (
    <>
      <div className="drawer-scrim" onClick={onClose} />
      <aside className="drawer" role="dialog" aria-modal="true" aria-label={label}>
        {children}
      </aside>
    </>
  );
}

export function useOutside<T extends HTMLElement>(open: boolean, close: () => void) {
  const ref = useRef<T>(null);
  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && close();
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open, close]);
  return ref;
}

// ---------- toast ----------
const ToastCtx = createContext<(text: string, icon?: IconName) => void>(() => {});
export function ToastProvider({ children }: { children: ReactNode }) {
  const [t, setT] = useState<{ text: string; icon: IconName; k: number } | null>(null);
  const show = useCallback((text: string, icon: IconName = 'check') => setT({ text, icon, k: Date.now() }), []);
  useEffect(() => {
    if (!t) return;
    const id = setTimeout(() => setT(null), 2600);
    return () => clearTimeout(id);
  }, [t]);
  return (
    <ToastCtx.Provider value={show}>
      {children}
      {t ? (
        <div className="toast" role="status" key={t.k}>
          <Icon name={t.icon} size={18} />
          {t.text}
        </div>
      ) : null}
    </ToastCtx.Provider>
  );
}
export const useToast = () => useContext(ToastCtx);

export function Empty({ icon, title, text, action }: { icon: IconName; title: string; text: string; action?: ReactNode }) {
  return (
    <Card style={{ alignItems: 'center', textAlign: 'center', padding: 48 }}>
      <IconTile icon={icon} size={64} bg="var(--primary-secondary)" fg="var(--link)" />
      <div className="s17 strong">{title}</div>
      <p className="muted lh" style={{ maxWidth: 420 }}>
        {text}
      </p>
      {action}
    </Card>
  );
}
