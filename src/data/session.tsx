import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

export type Role = 'seeker' | 'employer';

export type CompanyStatus = 'pending' | 'approved' | 'none';
type User = { id: string; role: Role; phone?: string; email?: string; firstName?: string; company?: { name: string; status: CompanyStatus } };

/** A signed-in account kept in this browser. Each one has its own profile, chats and subscription. Same model as the app. */
export type Account = User & {
  /** Person's name for a seeker, company name for an employer. */
  name: string;
  /** Second line under the name: the email for a seeker, the role in the company for an employer. */
  detail: string;
};

/** Up to 5 accounts in one browser (WAccAdd). */
export const MAX_ACCOUNTS = 5;

/** Prototype identity: which account a sign-in lands on. A number of all 8s (or hr@…) is the demo employer, anything else the demo seeker. */
export const accountIdFor = (role: Role) => (role === 'employer' ? 'emp-skyline' : 'seeker-mia');

function toAccount(u: User): Account {
  if (u.role === 'employer') return { ...u, name: u.company?.name || 'Your company', detail: 'Recruiter' };
  const demo = u.id === 'seeker-mia';
  return { ...u, name: demo ? 'Mia Dakaskos' : u.firstName || 'New account', detail: u.email ?? (demo ? 'mia.dakaskos@gmail.com' : (u.phone?.replace('|', ' ') ?? '')) };
}

type Session = {
  /** The account in use right now. */
  user: Account | null;
  /** Every account signed in in this browser, in the order they were added. */
  accounts: Account[];
  /** Where to return after sign-in (e.g. the vacancy a guest tried to respond to). */
  returnTo: string | null;
  /** Role the next new account gets — set by the guest action that triggered sign-up. */
  pendingRole: Role | null;
  setReturn: (path: string | null, role?: Role | null) => void;
  /** Role picked on the "Who are you here as?" screen at the start of sign-up. */
  setPendingRole: (role: Role | null) => void;
  /** Signs in and makes the account current; an account already in the browser is reused. */
  signIn: (u: User) => Account;
  /** Logs out of the current account (the next one becomes current) or of all of them. */
  signOut: (scope?: 'current' | 'all') => Account | null;
  /** True while the user goes through "Add account": the sign-in that follows adds an account next to the current one. */
  adding: boolean;
  setAdding: (v: boolean) => void;
  /** Makes another account current. */
  switchTo: (id: string) => Account | null;
  /** Logs out of an account you're not in (Settings → Accounts → Log out). */
  forget: (id: string) => void;
};

const Ctx = createContext<Session | null>(null);

/** Prototype session with several accounts. Replaced by the real auth client (tokens per account, refresh) once the backend exists. */
export function SessionProvider({ children }: { children: ReactNode }) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [returnTo, setReturnTo] = useState<string | null>(null);
  const [pendingRole, setPendingRole] = useState<Role | null>(null);
  const [adding, setAdding] = useState(false);

  const signIn = useCallback((u: User) => {
    const id = u.id === 'me' ? accountIdFor(u.role) : u.id;
    const acc = toAccount({ ...u, id });
    setAccounts((xs) => (xs.some((x) => x.id === id) ? xs.map((x) => (x.id === id ? { ...x, ...acc } : x)) : [...xs, acc].slice(-MAX_ACCOUNTS)));
    setCurrentId(id);
    setAdding(false);
    return acc;
  }, []);

  const user = accounts.find((a) => a.id === currentId) ?? null;

  const value = useMemo<Session>(
    () => ({
      user,
      accounts,
      returnTo,
      pendingRole,
      setReturn: (path, role = null) => {
        setReturnTo(path);
        setPendingRole(role);
      },
      setPendingRole,
      signIn,
      signOut: (scope = 'current') => {
        setAdding(false);
        const rest = scope === 'all' ? [] : accounts.filter((a) => a.id !== currentId);
        setAccounts(rest);
        setCurrentId(rest[0]?.id ?? null);
        return rest[0] ?? null;
      },
      adding,
      setAdding,
      switchTo: (id) => {
        const to = accounts.find((a) => a.id === id) ?? null;
        if (to) setCurrentId(to.id);
        return to;
      },
      forget: (id) => setAccounts((xs) => xs.filter((a) => a.id !== id || a.id === currentId)),
    }),
    [user, accounts, currentId, returnTo, pendingRole, signIn, adding],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSession() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useSession must be used inside <SessionProvider>');
  return v;
}
