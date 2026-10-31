// Notification list rows (job seeker and employer notification centres).
import type { ReactNode } from 'react';
import { Link } from '../lib/links';
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

/** Notification centre frame: a full page, or the desktop dropdown under the bell (same list, compact). */
export function NotifLayout({ dropdown, tabs, onReadAll, hasUnread, children, allTo, onClose }: { dropdown?: boolean; tabs: ReactNode; onReadAll: () => void; hasUnread: boolean; children: ReactNode; allTo: string; onClose?: () => void }) {
  const readAll = hasUnread ? (
    <button className="link s14" onClick={onReadAll}>
      Mark all as read
    </button>
  ) : null;
  if (dropdown)
    return (
      <div className="ndrop">
        <div className="row between g12" style={{ padding: '14px 16px 10px' }}>
          <span className="s17 strong">Notifications</span>
          {readAll}
        </div>
        <div style={{ padding: '0 12px 8px' }}>{tabs}</div>
        <div className="ndrop-list">{children}</div>
        <Link to={allTo} className="ndrop-all" onClick={onClose}>
          See all notifications
          <Icon name="chevron-right" size={16} />
        </Link>
      </div>
    );
  return (
    <main className="page narrow">
      <div className="row between wrap g16" style={{ marginTop: 8 }}>
        <h1 className="display d2">Notifications</h1>
        {tabs}
      </div>
      <div className="row end mt16" style={{ minHeight: 20 }}>
        {readAll}
      </div>
      <div className="mt8">{children}</div>
    </main>
  );
}
