import { useEffect } from 'react';
import { BrowserRouter, MemoryRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { SessionProvider } from './data/session';
import { SignupProvider } from './data/signup';
import { SeekerProvider } from './data/seeker';
import { EmployerProvider } from './data/employer';
import { applyTheme } from './lib/theme';
import { releaseIfIdle } from './lib/scrollLock';
import { ToastProvider } from './ui/kit';
import { ErrorBoundary } from './ui/ErrorBoundary';
import { AppPromoSheet } from './ui/appPromo';
import { EmployerShell, GuestShell, SeekerShell } from './layout/Shell';
import { About, Code, EmailSignIn, Forgot, NewPassword, Register, RolePick, SignIn } from './pages/auth/Auth';
import { Details, Media, Occupation, Review } from './pages/onboarding/Seeker';
import { EmpCompany, EmpJoin, EmpJoinSent, EmpLicence, EmpRep, EmpReview, EmpType } from './pages/onboarding/Employer';
import { GuestFeed, GuestTalent } from './pages/seeker/Feed';
import { SeekerFeed, SeekerSearch } from './pages/seeker/Feed';
import { VacancyPage } from './pages/seeker/Vacancy';
import { Applications } from './pages/seeker/Applications';
import { People, PersonPage } from './pages/seeker/People';
import { SeekerMessages } from './pages/seeker/Messages';
import { SeekerProfilePage } from './pages/seeker/Profile';
import { SeekerNotifications } from './pages/seeker/Notifications';
import { CompanyPage } from './pages/seeker/Company';
import { EditHub, EditGeneral, EditPersonal, EditProfessional, ProfileLook, Plans, SeekerSettings, SeekerSubscription } from './pages/settings/SeekerSettings';
import { FindTalent, CandidatePage } from './pages/employer/Talent';
import { MyVacancies, MyVacancyPage, ApplicantsPage } from './pages/employer/Vacancies';
import { EmployerMessages } from './pages/employer/Messages';
import { CompanyHome, EmployerNotifications } from './pages/employer/Company';
import { PostVacancy } from './pages/employer/Post';
import { CompanyDetails, CompanySettings, CompanySubscription, Team, Verification } from './pages/settings/EmployerSettings';

// The single-file preview runs inside the artifact viewer, which doesn't allow URL changes, so routing stays in memory.
const PREVIEW = import.meta.env.MODE === 'preview';
const Router = PREVIEW ? MemoryRouter : BrowserRouter;

function ScrollTop() {
  const { pathname } = useLocation();
  // Braces matter: in the artifact viewer scrollTo returns a value, and React would treat it as a cleanup.
  useEffect(() => {
    window.scrollTo(0, 0);
    releaseIfIdle();
  }, [pathname]);
  return null;
}

export default function App() {
  useEffect(() => {
    try {
      const v = localStorage.getItem('919-theme');
      applyTheme(v === 'dark' || v === 'light' ? v : 'system');
    } catch {
      applyTheme('system');
    }
  }, []);
  return (
    <ErrorBoundary>
    <Router>
      <ScrollTop />
      <AppPromoSheet />
      <ToastProvider>
        <SessionProvider>
          <SignupProvider>
            <SeekerProvider>
              <EmployerProvider>
                <Routes>
                  <Route element={<GuestShell />}>
                    <Route index element={<GuestFeed />} />
                    <Route path="talent-preview" element={<GuestTalent />} />
                    <Route path="v/:id" element={<VacancyPage guest />} />
                  </Route>
                  <Route path="auth/sign-in" element={<SignIn />} />
                  <Route path="auth/email" element={<EmailSignIn />} />
                  <Route path="auth/code" element={<Code />} />
                  <Route path="auth/forgot" element={<Forgot />} />
                  <Route path="auth/new-password" element={<NewPassword />} />
                  <Route path="auth/role" element={<RolePick />} />
                  <Route path="auth/register" element={<Register />} />
                  <Route path="auth/about" element={<About />} />
                  <Route path="signup/occupation" element={<Occupation />} />
                  <Route path="signup/details" element={<Details />} />
                  <Route path="signup/media" element={<Media />} />
                  <Route path="signup/review" element={<Review />} />
                  <Route path="employer/type" element={<EmpType />} />
                  <Route path="employer/rep" element={<EmpRep />} />
                  <Route path="employer/company" element={<EmpCompany />} />
                  <Route path="employer/join" element={<EmpJoin />} />
                  <Route path="employer/sent" element={<EmpJoinSent />} />
                  <Route path="employer/licence" element={<EmpLicence />} />
                  <Route path="employer/review" element={<EmpReview />} />

                  <Route element={<SeekerShell />}>
                    <Route path="seeker" element={<SeekerFeed />} />
                    <Route path="seeker/search" element={<SeekerSearch />} />
                    <Route path="vacancy/:id" element={<VacancyPage />} />
                    <Route path="seeker/applications" element={<Applications />} />
                    <Route path="seeker/people" element={<People />} />
                    <Route path="people/:id" element={<PersonPage />} />
                    <Route path="seeker/messages" element={<SeekerMessages />} />
                    <Route path="seeker/messages/:id" element={<SeekerMessages />} />
                    <Route path="seeker/profile" element={<SeekerProfilePage />} />
                    <Route path="notifications" element={<SeekerNotifications />} />
                    <Route path="org/:id" element={<CompanyPage />} />
                    <Route path="profile/edit" element={<EditHub />} />
                    <Route path="profile/personal" element={<EditPersonal />} />
                    <Route path="profile/general" element={<EditGeneral />} />
                    <Route path="profile/professional" element={<EditProfessional />} />
                    <Route path="profile/look" element={<ProfileLook />} />
                    <Route path="profile/plans" element={<Plans />} />
                    <Route path="profile/subscription" element={<SeekerSubscription />} />
                    <Route path="profile/settings" element={<SeekerSettings />} />
                  </Route>

                  <Route element={<EmployerShell />}>
                    <Route path="hire" element={<FindTalent />} />
                    <Route path="talent/:id" element={<CandidatePage />} />
                    <Route path="hire/vacancies" element={<MyVacancies />} />
                    <Route path="my-vacancy/:id" element={<MyVacancyPage />} />
                    <Route path="my-vacancy/:id/applicants" element={<ApplicantsPage />} />
                    <Route path="hire/messages" element={<EmployerMessages />} />
                    <Route path="hire/messages/:id" element={<EmployerMessages />} />
                    <Route path="hire/company" element={<CompanyHome />} />
                    <Route path="hire/notifications" element={<EmployerNotifications />} />
                    <Route path="company/details" element={<CompanyDetails />} />
                    <Route path="company/team" element={<Team />} />
                    <Route path="company/verification" element={<Verification />} />
                    <Route path="company/subscription" element={<CompanySubscription />} />
                    <Route path="company/settings" element={<CompanySettings />} />
                  </Route>
                  <Route path="post" element={<PostVacancy />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </EmployerProvider>
            </SeekerProvider>
          </SignupProvider>
        </SessionProvider>
      </ToastProvider>
    </Router>
    </ErrorBoundary>
  );
}
