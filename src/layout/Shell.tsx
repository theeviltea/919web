// Top navigation (desktop) + bottom tab bar (mobile) for guests, job seekers and employers.
import { useCallback, useState } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Link, NavLink } from '../lib/links';
import { ABOUT_URL } from '../lib/site';
import { useTheme, type ThemePref } from '../lib/theme';
import { useSession } from '../data/session';
import { useSeeker } from '../data/seeker';
import { company, me, useEmployer } from '../data/employer';
import { SeekerNotifications } from '../pages/seeker/Notifications';
import { EmployerNotifications } from '../pages/employer/Company';
import { Avatar, Btn, Icon, IconBtn, Initials, Logo, TierBadge, useOutside, type IconName } from '../ui/kit';

/** ↗ next to links that open the landing in a new tab. */
function ExtMark({ size = 12 }: { size?: number }) {
  return (
    <svg className="ext-mark" width={size} height={size} viewBox="0 0 12 12" aria-hidden="true">
      <path d="M3.5 2.5h6v6M9.5 2.5 2.5 9.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type Item = { to: string; label: string; icon: IconName; badge?: number; end?: boolean };

function TopNav({ items, right }: { items: Item[]; right: React.ReactNode }) {
  return (
    <header className="topnav">
      <div className="topnav-in">
        <Link to={items[0].to} aria-label="919 home">
          <Logo h={26} />
        </Link>
        <nav aria-label="Main">
          {items.map((it) => (
            <NavLink key={it.to} to={it.to} end={it.end} className={({ isActive }) => `navlink${isActive ? ' active' : ''}`}>
              {it.label}
              {it.badge ? <span className="badge">{it.badge}</span> : null}
            </NavLink>
          ))}
          <a href={ABOUT_URL} className="navlink ext" target="_blank" rel="noopener noreferrer">
            About 919
            <ExtMark />
          </a>
        </nav>
        <span className="grow" />
        <div className="row g10">{right}</div>
      </div>
    </header>
  );
}

function TabBar({ items }: { items: Item[] }) {
  return (
    <nav className="tabbar" aria-label="Tabs">
      {items.map((it) => (
        <NavLink key={it.to} to={it.to} end={it.end} className={({ isActive }) => (isActive ? 'active' : '')}>
          <Icon name={it.icon} size={24} />
          {it.label}
          {it.badge ? <span className="badge">{it.badge}</span> : null}
        </NavLink>
      ))}
    </nav>
  );
}

function ThemeSwitch() {
  const [pref, setPref] = useTheme();
  const opts: { k: ThemePref; label: string; icon: IconName }[] = [
    { k: 'light', label: 'Light', icon: 'sparkles' },
    { k: 'dark', label: 'Dark', icon: 'moon' },
    { k: 'system', label: 'System', icon: 'settings' },
  ];
  return (
    <div className="menu-theme" onClick={(e) => e.stopPropagation()}>
      <span className="menu-label">Theme</span>
      <div className="tabs full" role="radiogroup" aria-label="Theme">
        {opts.map((o) => (
          <button key={o.k} role="radio" aria-checked={pref === o.k} className={`tab${pref === o.k ? ' on' : ''}`} onClick={() => setPref(o.k)}>
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

type MenuLink = { to?: string; href?: string; label: string; icon: IconName; onClick?: () => void; danger?: boolean };

function AccountMenu({ trigger, head, links, signOut }: { trigger: React.ReactNode; head: React.ReactNode; links: MenuLink[]; signOut: MenuLink }) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const ref = useOutside<HTMLDivElement>(open, close);
  const item = (l: MenuLink) =>
    l.href ? (
      <a key={l.label} href={l.href} className="mi" onClick={close} target="_blank" rel="noopener noreferrer">
        <span className="mi-ico">
          <Icon name={l.icon} size={18} />
        </span>
        <span className="grow">{l.label}</span>
        <span style={{ color: 'var(--text-light-secondary)', display: 'flex' }}>
          <ExtMark size={14} />
        </span>
      </a>
    ) : l.to ? (
      <Link key={l.label} to={l.to} className="mi" onClick={close}>
        <span className="mi-ico">
          <Icon name={l.icon} size={18} />
        </span>
        <span className="grow">{l.label}</span>
        <Icon name="chevron-right" size={16} style={{ color: 'var(--text-light-secondary)' }} />
      </Link>
    ) : (
      <button key={l.label} className={`mi${l.danger ? ' danger' : ''}`} onClick={l.onClick}>
        <span className="mi-ico">
          <Icon name={l.icon} size={18} />
        </span>
        <span className="grow">{l.label}</span>
      </button>
    );
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(!open)} style={{ display: 'flex' }}>
        {trigger}
      </button>
      {open ? (
        <div className="menu account" role="menu" onClick={close}>
          <div className="menu-head">{head}</div>
          <div className="menu-sep" />
          <div className="menu-list">{links.map(item)}</div>
          <div className="menu-sep" />
          <ThemeSwitch />
          <div className="menu-sep" />
          <div className="menu-list">{item(signOut)}</div>
        </div>
      ) : null}
    </div>
  );
}

/** Bell: a dropdown with the notification centre on desktop, the full page on mobile. */
function NotifMenu({ to, unread, children }: { to: string; unread: boolean; children: (close: () => void) => React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const ref = useOutside<HTMLDivElement>(open, close);
  return (
    <>
      <span className="mob-only">
        <IconBtn icon="notification" label="Notifications" to={to} dot={unread} />
      </span>
      <div ref={ref} className="desk-only" style={{ position: 'relative' }}>
        <button className="iconbtn" aria-label="Notifications" aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(!open)} style={open ? { background: 'var(--primary-secondary)', color: 'var(--link)', borderColor: 'transparent' } : undefined}>
          <Icon name="notification" />
          {unread ? <span className="dot" /> : null}
        </button>
        {open ? <div className="menu notif-menu" role="dialog" aria-label="Notifications">{children(close)}</div> : null}
      </div>
    </>
  );
}

export function GuestShell() {
  const { user } = useSession();
  if (user) return <Navigate to={user.role === 'seeker' ? '/seeker' : '/hire'} replace />;
  const items: Item[] = [
    { to: '/', label: 'Vacancies', icon: 'briefcase', end: true },
    { to: '/talent-preview', label: 'Talent', icon: 'users' },
  ];
  return (
    <>
      <TopNav
        items={items}
        right={
          <>
            <a href={ABOUT_URL} className="link s14 mob-only ext" style={{ padding: '0 6px' }} target="_blank" rel="noopener noreferrer">
              About 919
              <ExtMark />
            </a>
            <Btn kind="secondary" h={44} to="/auth/sign-in">
              Sign in
            </Btn>
            <span className="desk-only">
              <Btn h={44} to="/auth/role">
                Create account
              </Btn>
            </span>
          </>
        }
      />
      <Outlet />
      <TabBar items={[...items, { to: '/auth/sign-in', label: 'Sign in', icon: 'user' }]} />
    </>
  );
}

function useSignOut() {
  const { signOut } = useSession();
  const nav = useNavigate();
  return () => {
    signOut();
    nav('/', { replace: true });
  };
}

export function SeekerShell() {
  const { user } = useSession();
  const s = useSeeker();
  const out = useSignOut();
  const loc = useLocation();
  if (!user) return <Navigate to="/auth/sign-in" replace state={{ from: loc.pathname }} />;
  if (user.role !== 'seeker') return <Navigate to="/hire" replace />;
  const items: Item[] = [
    { to: '/seeker', label: 'Vacancies', icon: 'briefcase', end: true },
    { to: '/seeker/applications', label: 'Applications', icon: 'file' },
    { to: '/seeker/people', label: 'People', icon: 'users' },
    { to: '/seeker/messages', label: 'Messages', icon: 'message', badge: s.unreadTotal },
  ];
  const onProfile = loc.pathname.startsWith('/seeker/profile') || loc.pathname.startsWith('/profile');
  const p = s.profile;
  return (
    <>
      <TopNav
        items={items}
        right={
          <>
            <NotifMenu to="/notifications" unread={s.unreadNotifs > 0}>
              {(close) => <SeekerNotifications dropdown onClose={close} />}
            </NotifMenu>
            <AccountMenu
              trigger={
                <span className="row g10" style={{ height: 44, padding: '0 6px 0 4px', borderRadius: 999, border: `1px solid ${onProfile ? 'var(--stroke-blue)' : 'var(--stroke)'}`, background: onProfile ? 'var(--primary-secondary)' : 'var(--surface)' }}>
                  <Avatar src={p.photo} size={34} />
                  <span className="s14 semi desk-only">{p.firstName}</span>
                  <TierBadge tier={s.plan} size={18} />
                  <span className="muted desk-only" style={{ display: 'flex' }}>
                    <Icon name="chevron-down" size={16} />
                  </span>
                </span>
              }
              links={[
                { to: '/seeker/profile', label: 'My profile', icon: 'user' },
                { to: '/profile/edit', label: 'Edit profile', icon: 'edit' },
                { to: s.plan === 'free' ? '/profile/plans' : '/profile/subscription', label: 'Subscription', icon: 'star' },
                { to: '/profile/settings', label: 'Settings', icon: 'settings' },
                { href: ABOUT_URL, label: 'About 919', icon: 'globe' },
              ]}
              signOut={{ label: 'Log out', icon: 'logout', onClick: out, danger: true }}
              head={
                <>
                  <Avatar src={p.photo} size={44} />
                  <div className="grow">
                    <div className="row g6 s15 strong">
                      {p.firstName} {p.lastName}
                      <TierBadge tier={s.plan} size={16} />
                    </div>
                    <div className="small muted ellipsis">{s.plan === 'max' ? 'Max plan' : s.plan === 'premium' ? 'Premium plan' : 'Free plan'} · {p.city}</div>
                  </div>
                </>
              }
            />
          </>
        }
      />
      <Outlet />
      <TabBar items={[...items, { to: '/seeker/profile', label: 'Profile', icon: 'user' }]} />
    </>
  );
}

export function EmployerShell() {
  const { user } = useSession();
  const e = useEmployer();
  const out = useSignOut();
  const loc = useLocation();
  if (!user) return <Navigate to="/auth/sign-in" replace state={{ from: loc.pathname }} />;
  if (user.role !== 'employer') return <Navigate to="/seeker" replace />;
  const items: Item[] = [
    { to: '/hire', label: 'Talent', icon: 'users', end: true },
    { to: '/hire/vacancies', label: 'Vacancies', icon: 'briefcase', badge: e.freshTotal },
    { to: '/hire/messages', label: 'Messages', icon: 'message', badge: e.unreadTotal },
    { to: '/hire/company', label: 'Company', icon: 'building' },
  ];
  return (
    <>
      <TopNav
        items={items}
        right={
          <>
            <span className="desk-only">
              <Btn icon="add" h={44} to="/post">
                Post a vacancy
              </Btn>
            </span>
            <NotifMenu to="/hire/notifications" unread={e.unreadNotifs > 0}>
              {(close) => <EmployerNotifications dropdown onClose={close} />}
            </NotifMenu>
            <AccountMenu
              trigger={
                <span className="row g10" style={{ height: 44, padding: '0 12px 0 4px', borderRadius: 999, border: '1px solid var(--stroke)', background: 'var(--surface)' }}>
                  <Initials text={company.initials} size={34} radius={17} />
                  <span className="s14 semi desk-only">{e.info.name || company.name}</span>
                  {e.verified ? (
                    <span style={{ color: 'var(--primary)', display: 'flex' }}>
                      <Icon name="verified" size={16} />
                    </span>
                  ) : null}
                  <span className="muted desk-only" style={{ display: 'flex' }}>
                    <Icon name="chevron-down" size={16} />
                  </span>
                </span>
              }
              links={[
                { to: '/company/details', label: 'Company details', icon: 'building' },
                { to: '/company/team', label: 'Team and roles', icon: 'users' },
                { to: '/company/subscription', label: 'Subscription', icon: 'star' },
                { to: '/company/settings', label: 'Settings', icon: 'settings' },
                { href: ABOUT_URL, label: 'About 919', icon: 'globe' },
              ]}
              signOut={{ label: 'Log out', icon: 'logout', onClick: out, danger: true }}
              head={
                <>
                  <Initials text={company.initials} size={44} radius={14} />
                  <div className="grow">
                    <div className="row g6 s15 strong">
                      {e.info.name || company.name}
                      {e.verified ? (
                        <span style={{ color: 'var(--primary)', display: 'flex' }}>
                          <Icon name="verified" size={16} />
                        </span>
                      ) : null}
                    </div>
                    <div className="small muted ellipsis">
                      {me.firstName} {me.lastName} · {me.title}
                    </div>
                  </div>
                </>
              }
            />
          </>
        }
      />
      <Outlet />
      <TabBar items={items} />
    </>
  );
}
