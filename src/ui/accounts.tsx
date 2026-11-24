// Several accounts in one browser: avatar, rows, "Add account" dialog, switch dialog and the banner after a switch.
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEmployer } from '../data/employer';
import { useSeeker } from '../data/seeker';
import { MAX_ACCOUNTS, useSession, type Account } from '../data/session';
import { Avatar, Btn, CloseX, Icon, Initials, Modal } from './kit';

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('');

/** Seeker: round photo (or initials). Employer: rounded dark tile with the company initials. */
export function AccountAvatar({ account, size = 40, ring }: { account: Account; size?: number; ring?: boolean }) {
  const s = useSeeker();
  if (account.role === 'seeker' && account.id === 'seeker-mia' && s.profile.photo) return <Avatar src={s.profile.photo} size={size} ring={ring ? 'var(--primary)' : undefined} />;
  const radius = account.role === 'seeker' ? size / 2 : Math.round(size * 0.3);
  const tile = <Initials text={initials(account.name)} size={size} radius={radius} bg={account.role === 'seeker' ? 'var(--avatar-2, #FFF0B8)' : undefined} />;
  if (!ring) return tile;
  return (
    <span style={{ display: 'inline-flex', padding: 2, borderRadius: radius + 4, boxShadow: '0 0 0 2px var(--primary)' }}>
      {tile}
    </span>
  );
}

export function RoleTag({ role }: { role: Account['role'] }) {
  const seeker = role === 'seeker';
  return (
    <span className="acc-tag" style={seeker ? { background: 'var(--primary-secondary)', color: 'var(--link)' } : { background: 'var(--label-orange-back)', color: 'var(--info-text)' }}>
      {seeker ? 'Job seeker' : 'Employer'}
    </span>
  );
}

/** Unread messages waiting in an account; shown next to the accounts you're not in. */
export function useAccountUnread() {
  const e = useEmployer();
  const s = useSeeker();
  return (a: Account) => (a.role === 'employer' ? e.unreadTotal : s.unreadTotal);
}

export function Badge({ n }: { n: number }) {
  return n ? (
    <span className="acc-badge" aria-label={`${n} new`}>
      {n}
    </span>
  ) : null;
}

export function AccountText({ account }: { account: Account }) {
  return (
    <span className="grow" style={{ minWidth: 0 }}>
      <span className="s15 strong ellipsis" style={{ display: 'block' }}>
        {account.name}
      </span>
      <span className="row g6" style={{ marginTop: 4, minWidth: 0 }}>
        <RoleTag role={account.role} />
        <span className="small muted ellipsis">{account.detail}</span>
      </span>
    </span>
  );
}

export function CurrentPill() {
  return (
    <span className="pill green">
      <Icon name="check" size={14} />
      Current
    </span>
  );
}

/** Current account first, then the others. */
export function useOrderedAccounts() {
  const { user, accounts } = useSession();
  return user ? [user, ...accounts.filter((a) => a.id !== user.id)] : accounts;
}

// ---------- switch, add, banner ----------

type Ctx = { switchTo: (id: string) => void; announce: (a: Account) => void; openAdd: () => void; openSwitcher: () => void; logOut: (scope?: 'current' | 'all') => void };
const AccountsCtx = createContext<Ctx>({ switchTo: () => {}, announce: () => {}, openAdd: () => {}, openSwitcher: () => {}, logOut: () => {} });
export const useAccounts = () => useContext(AccountsCtx);

const home = (a: Account) => (a.role === 'seeker' ? '/seeker' : '/hire');

function Banner({ account, onSwitch, onDone }: { account: Account; onSwitch: () => void; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 4500);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div className="acc-banner" role="status">
      <AccountAvatar account={account} size={32} />
      <span className="grow" style={{ minWidth: 0 }}>
        <b style={{ display: 'block' }}>{account.name}</b>
        <span style={{ opacity: 0.8 }}>{account.role === 'seeker' ? 'You’re now in the job seeker account' : 'You’re now in the employer account'}</span>
      </span>
      <button className="acc-banner-link" onClick={onSwitch}>
        Switch
      </button>
    </div>
  );
}

function AddDialog({ onClose }: { onClose: () => void }) {
  const nav = useNavigate();
  const { user, setAdding, setPendingRole } = useSession();
  const start = (to: string) => {
    setAdding(true);
    setPendingRole(null);
    onClose();
    nav(to);
  };
  return (
    <Modal onClose={onClose} label="Add another account" width={440}>
      <div className="row end" style={{ marginBottom: -30 }}>
        <CloseX onClick={onClose} />
      </div>
      <div className="col center g14" style={{ textAlign: 'center', alignItems: 'center' }}>
        <div className="row" style={{ alignItems: 'center' }}>
          {user ? (
            <span style={{ display: 'inline-flex', borderRadius: user.role === 'seeker' ? '50%' : 22, boxShadow: '0 0 0 4px var(--surface)', position: 'relative', zIndex: 1 }}>
              <AccountAvatar account={user} size={64} />
            </span>
          ) : null}
          <span className="acc-plus" style={{ marginLeft: -14 }}>
            <Icon name="add" size={24} />
          </span>
        </div>
        <h2 className="display d4">Add another account</h2>
        <p className="muted lh s15">
          Keep a job seeker and an employer account in one browser and switch in a click. You stay signed in to <b style={{ color: 'var(--text-headline)' }}>{user?.name}</b>.
        </p>
      </div>
      <Btn h={52} full onClick={() => start('/auth/sign-in')}>
        Sign in to an existing account
      </Btn>
      <Btn kind="secondary" h={52} full onClick={() => start('/auth/role')} style={{ marginTop: -6 }}>
        Create a new account
      </Btn>
      <div className="small muted" style={{ textAlign: 'center' }}>
        Up to {MAX_ACCOUNTS} accounts in one browser
      </div>
    </Modal>
  );
}

function SwitchDialog({ onClose, onSwitch, onAdd }: { onClose: () => void; onSwitch: (id: string) => void; onAdd: () => void }) {
  const nav = useNavigate();
  const { user, accounts } = useSession();
  const list = useOrderedAccounts();
  const unread = useAccountUnread();
  return (
    <Modal onClose={onClose} label="Switch account" width={460}>
      <div className="row between">
        <h2 className="display d4">Switch account</h2>
        <button className="link s14 semi" onClick={() => (onClose(), nav(user?.role === 'employer' ? '/company/settings' : '/profile/settings'))}>
          Manage
        </button>
      </div>
      <div className="col">
        {list.map((a) =>
          a.id === user?.id ? (
            <div key={a.id} className="acc-row" aria-current="true">
              <AccountAvatar account={a} size={44} ring />
              <AccountText account={a} />
              <CurrentPill />
            </div>
          ) : (
            <button key={a.id} className="acc-row" onClick={() => (onClose(), onSwitch(a.id))} aria-label={`Switch to ${a.name}`}>
              <AccountAvatar account={a} size={44} />
              <AccountText account={a} />
              <Badge n={unread(a)} />
              <Icon name="chevron-right" size={18} style={{ color: 'var(--text-light-secondary)' }} />
            </button>
          ),
        )}
        {accounts.length < MAX_ACCOUNTS ? (
          <button className="acc-row add" onClick={() => (onClose(), onAdd())}>
            <span className="acc-plus sm">
              <Icon name="add" size={20} />
            </span>
            <span className="grow s15 semi">Add account</span>
          </button>
        ) : null}
      </div>
      {accounts.length > 1 ? (
        <div className="row g8 small muted lh" style={{ padding: '12px 14px', borderRadius: 16, background: 'var(--back)', alignItems: 'flex-start' }}>
          <Icon name="notification" size={16} />
          <span>You get notifications from {accounts.length === 2 ? 'both accounts' : 'all accounts'}. Click one to open it in that account.</span>
        </div>
      ) : null}
    </Modal>
  );
}

/** Mounted once inside the router: switching, the "Add account" and "Switch account" dialogs, and the banner after a switch. */
export function AccountsProvider({ children }: { children: ReactNode }) {
  const nav = useNavigate();
  const session = useSession();
  const [banner, setBanner] = useState<Account | null>(null);
  const [dialog, setDialog] = useState<'add' | 'switch' | null>(null);
  const hideBanner = useCallback(() => setBanner(null), []);
  const announce = (a: Account) => setBanner(a);
  const value: Ctx = {
    switchTo: (id) => {
      const to = session.switchTo(id);
      if (!to) return;
      nav(home(to), { replace: true });
      announce(to);
    },
    announce,
    openAdd: () => setDialog('add'),
    openSwitcher: () => setDialog('switch'),
    logOut: (scope = 'current') => {
      const next = session.signOut(scope);
      if (next) {
        nav(home(next), { replace: true });
        announce(next);
      } else nav('/', { replace: true });
    },
  };
  return (
    <AccountsCtx.Provider value={value}>
      {children}
      {banner && session.user?.id === banner.id ? <Banner key={banner.id} account={banner} onSwitch={() => (setBanner(null), setDialog('switch'))} onDone={hideBanner} /> : null}
      {dialog === 'add' ? <AddDialog onClose={() => setDialog(null)} /> : null}
      {dialog === 'switch' ? <SwitchDialog onClose={() => setDialog(null)} onSwitch={value.switchTo} onAdd={() => setDialog('add')} /> : null}
    </AccountsCtx.Provider>
  );
}

/** Settings → Accounts (WAccSettings / MAccSettings): every account in this browser; switch or log out of the others, add one. */
export function AccountsSection({ Sec }: { Sec: (p: { title: ReactNode; right?: ReactNode; children: ReactNode; gap?: number }) => ReactNode }) {
  const { user, accounts, forget } = useSession();
  const { switchTo, openAdd } = useAccounts();
  const unread = useAccountUnread();
  const list = useOrderedAccounts();
  const canAdd = accounts.length < MAX_ACCOUNTS;
  return (
    <Sec
      title="Accounts"
      gap={8}
      right={
        canAdd ? (
          <span className="desk-only">
            <Btn kind="tonal" h={40} icon="add" onClick={openAdd}>
              Add account
            </Btn>
          </span>
        ) : undefined
      }>
      <div className="col">
        {list.map((a) =>
          a.id === user?.id ? (
            <div key={a.id} className="acc-row" aria-current="true">
              <AccountAvatar account={a} size={44} ring />
              <AccountText account={a} />
              <CurrentPill />
            </div>
          ) : (
            <div key={a.id} className="acc-row">
              <button className="row g12 grow" style={{ minWidth: 0, textAlign: 'left' }} onClick={() => switchTo(a.id)} aria-label={`Switch to ${a.name}`}>
                <AccountAvatar account={a} size={44} />
                <AccountText account={a} />
              </button>
              <Badge n={unread(a)} />
              <span className="desk-only row g8">
                <Btn kind="secondary" h={40} onClick={() => switchTo(a.id)}>
                  Switch
                </Btn>
                <Btn kind="ghost" h={40} onClick={() => forget(a.id)} style={{ color: 'var(--danger-text)' }}>
                  Log out
                </Btn>
              </span>
              <span className="mob-only" style={{ color: 'var(--text-light-secondary)' }}>
                <Icon name="chevron-right" size={18} />
              </span>
            </div>
          ),
        )}
        {canAdd ? (
          <button className="acc-row add mob-only" onClick={openAdd}>
            <span className="acc-plus sm">
              <Icon name="add" size={20} />
            </span>
            <span className="grow s15 semi">Add account</span>
          </button>
        ) : null}
      </div>
      <p className="small muted lh">Each account keeps its own profile, chats and subscription. You get notifications from all accounts signed in here.</p>
    </Sec>
  );
}
