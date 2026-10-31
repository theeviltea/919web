// Notification list rows (job seeker and employer notification centres).
import type { ReactNode } from 'react';
import { Icon, type IconName } from './kit';

export function NIcon({ icon, bg = 'var(--back)', fg = 'var(--text-primary)' }: { icon: IconName; bg?: string; fg?: string }) {
  return (
    <span className="tile" style={{ width: 44, height: 44, background: bg, color: fg, borderRadius: 14 }}>
      <Icon name={icon} size={20} />
    </span>
  );
}

export function NotifRow({ lead, title, time, text, quote, actions, unread, onOpen }: { lead: ReactNode; title: string; time: string; text: string; quote?: string; actions?: ReactNode; unread?: boolean; onOpen?: () => void }) {
  return (
    <div className="notif" onClick={onOpen} style={{ cursor: onOpen ? 'pointer' : undefined }}>
      {unread ? <span className="unread" aria-label="Unread" /> : null}
      {lead}
      <div className="grow">
        <div className="row between top g12">
          <span className="s15 strong">{title}</span>
          <span className="small muted" style={{ flex: 'none' }}>
            {time}
          </span>
        </div>
        <div className="s14 muted" style={{ marginTop: 4 }}>
          {text}
        </div>
        {quote ? (
          <div className="inset s14 primary-text lh" style={{ marginTop: 8, padding: '10px 12px', borderRadius: 12 }}>
            {quote}
          </div>
        ) : null}
        {actions ? (
          <div className="row g8 wrap" style={{ marginTop: 12 }} onClick={(e) => e.stopPropagation()}>
            {actions}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function NGroup({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <div className="ngrp">
      {children}
      {right}
    </div>
  );
}
