import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Img } from './asset';

import type { Field } from './registration';

export type Photo = { id: string; source: Img; progress?: number };

export type FieldEntry = {
  field: Field;
  roles: string[];
  details: Record<string, string>;
  tattoos?: boolean;
  piercing?: boolean;
  links: string[];
};

export type SeekerDraft = {
  photo?: Img;
  firstName: string;
  lastName: string;
  gender?: string;
  dob?: Date;
  country?: string;
  city?: string;
  occupations: FieldEntry[];
  photos: Photo[];
  video?: { poster: Img; duration: string; progress?: number };
  /** Existing demo account (signed in rather than registered): profile extras come from the demo data. */
  demo?: boolean;
};

export type EmployerMode = 'company' | 'join' | 'private';
export type EmployerDraft = {
  mode?: EmployerMode;
  photo?: Img;
  firstName: string;
  lastName: string;
  position?: string;
  email: string;
  phone: string;
  phoneLocked: boolean;
  company: { logo?: Img; name: string; phone: string; website: string; country?: string; city?: string };
  /** Trade licence PDF picked on step 3 (optional: without it the company gets no verified badge). */
  licence?: { name: string; size: string; uri?: string };
  joinCompanyId?: string;
};

type Ctx = {
  seeker: SeekerDraft;
  setSeeker: (u: Partial<SeekerDraft> | ((s: SeekerDraft) => Partial<SeekerDraft>)) => void;
  employer: EmployerDraft;
  setEmployer: (u: Partial<EmployerDraft> | ((s: EmployerDraft) => Partial<EmployerDraft>)) => void;
  reset: () => void;
};

const emptySeeker: SeekerDraft = { firstName: '', lastName: '', occupations: [], photos: [] };
const emptyEmployer: EmployerDraft = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  phoneLocked: false,
  company: { name: '', phone: '', website: '' },
};

const SignupCtx = createContext<Ctx | null>(null);

/** Registration drafts that live across the sign-up steps. Sent to the API on Finish / Send for verification. */
export function SignupProvider({ children }: { children: ReactNode }) {
  const [seeker, setS] = useState<SeekerDraft>(emptySeeker);
  const [employer, setE] = useState<EmployerDraft>(emptyEmployer);
  // Prototype upload: new photos and the video advance to 100% in the background, on any screen.
  const uploading = seeker.photos.some((p) => p.progress !== undefined) || seeker.video?.progress !== undefined;
  useEffect(() => {
    if (!uploading) return;
    const t = setInterval(() => {
      setS((s) => ({
        ...s,
        photos: s.photos.map((p) => (p.progress === undefined ? p : p.progress >= 100 ? { ...p, progress: undefined } : { ...p, progress: Math.min(100, p.progress + 20) })),
        video: s.video && s.video.progress !== undefined ? { ...s.video, progress: s.video.progress >= 100 ? undefined : Math.min(100, s.video.progress + 6) } : s.video,
      }));
    }, 300);
    return () => clearInterval(t);
  }, [uploading]);

  const value = useMemo<Ctx>(
    () => ({
      seeker,
      employer,
      setSeeker: (u) => setS((s) => ({ ...s, ...(typeof u === 'function' ? u(s) : u) })),
      setEmployer: (u) => setE((s) => ({ ...s, ...(typeof u === 'function' ? u(s) : u) })),
      reset: () => {
        setS(emptySeeker);
        setE(emptyEmployer);
      },
    }),
    [seeker, employer],
  );
  return <SignupCtx.Provider value={value}>{children}</SignupCtx.Provider>;
}

export function useSignup() {
  const v = useContext(SignupCtx);
  if (!v) throw new Error('useSignup must be used inside <SignupProvider>');
  return v;
}
