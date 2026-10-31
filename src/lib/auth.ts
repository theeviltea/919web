import { useNavigate } from 'react-router-dom';
import { demoDraft } from '../data/seeker';
import { useSession, type CompanyStatus, type Role } from '../data/session';
import { useSignup } from '../data/signup';

/** Signs the user in and returns them to the action that triggered auth (or home). Same rules as the app. */
export function useFinishAuth() {
  const nav = useNavigate();
  const { signIn, returnTo, pendingRole, setReturn } = useSession();
  const { seeker, setSeeker } = useSignup();
  return (data: { role?: Role; phone?: string; email?: string; firstName?: string; company?: { name: string; status: CompanyStatus } } = {}) => {
    const role = data.role ?? pendingRole ?? 'seeker';
    if (role === 'seeker' && !seeker.firstName) setSeeker(demoDraft);
    signIn({ id: 'me', role, phone: data.phone, email: data.email, firstName: data.firstName, company: data.company });
    const home = role === 'seeker' ? '/seeker' : '/hire';
    const to = returnTo && (!pendingRole || pendingRole === role) ? returnTo : home;
    setReturn(null);
    nav(to, { replace: true });
  };
}

/** Demo employer sign-in (phone of all 8s in the app). */
export const DEMO_EMPLOYER = { role: 'employer' as const, firstName: 'Emanuel', company: { name: 'Skyline Hospitality', status: 'approved' as const } };
