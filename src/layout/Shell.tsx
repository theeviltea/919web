// Top navigation (desktop) + bottom tab bar (mobile) for guests, job seekers and employers.
import { useCallback, useState } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Link, NavLink } from '../lib/links';
import { useTheme, type ThemePref } from '../lib/theme';
import { useSession } from '../data/session';
import { useSeeker } from '../data/seeker';
import { company, me, useEmployer } from '../data/employer';
import { Avatar, Btn, Icon, IconBtn, Initials, Logo, TierBadge, useOutside, type IconName } from '../ui/kit';

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
  const opts: { k: ThemePref; label: string }[] = [
    { k: 'light', label: 'Light' },
    { k: 'dark', label: 'Dark' },
    { k: 'system', label: 'System' },
  ];
  return (
    <div className="tabs full" role="radiogroup" aria-label="Theme" style={{ margin: '4px 4px 8px' }}>
      {opts.map((o) => (
        <button key={o.k} role="radio" aria-checked={pref === o.k} className={`tab${pref === o.k ? ' on' : ''}`} style={{ height: 34, fontSize: 13 }} onClick={() => setPref(o.k)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

function AccountMenu({ trigger, links }: { trigger: React.ReactNode; links: { to?: string; label: string; icon: IconName; onClick?: () => void; danger?: boolean }[] }) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const ref = useOutside<HTMLDivElement>(open, close);
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(!open)} style={{ display: 'flex' }}>
        {trigger}
      </button>
      {open ? (
        <div className="menu" role="menu" onClick={close}>
          <ThemeSwitch />
          {links.map((l) =>
            l.to ? (
              <Link key={l.label} to={l.to}>
                <Icon name={l.icon} />
                {l.label}
              </Link>
            ) : (
              <button key={l.label} onClick={l.onClick} style={l.danger ? { color: 'var(--danger-text)' } : undefined}>
                <Icon name={l.icon} />
                {l.label}
              </button>
            ),
          )}
        </div>
      ) : null}
    </div>
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
            <IconBtn icon="notification" label="Notifications" to="/notifications" dot={s.unreadNotifs > 0} />
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
                { label: 'Log out', icon: 'logout', onClick: out, danger: true },
              ]}
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
            <IconBtn icon="notification" label="Notifications" to="/hire/notifications" dot={e.unreadNotifs > 0} />
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
                { label: `Log out · ${me.firstName}`, icon: 'logout', onClick: out, danger: true },
              ]}
            />
          </>
        }
      />
      <Outlet />
      <TabBar items={items} />
    </>
  );
}
