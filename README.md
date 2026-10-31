# 919 Web

Web version of 919 for job seekers and employers. Same flows, screens and rules as the mobile app; the design is the "919 Web" canvas (desktop + mobile pair for every screen).

- Stack: Vite, React 18, TypeScript, React Router. Same setup as `919admin`.
- `src/data` is the app's data layer (`919-app/src/data`) ported to the web: stores for session, sign-up, job seeker and employer, mock data and business rules. Replace the mocks with the API when the backend is ready.
- `src/data/asset.ts`: licensing rule for the accelerator. People are shown only with the 11 purchased stock photos in `src/assets/people`; every mock image path from the app resolves to one of them (by gender) or to a city photo. Never add other photos of people.
- Desktop layout from 861 px (top navigation), mobile layout below it (bottom tab bar, app-like screens).
- Light / Dark / System theme, the same `919-theme` key as the app prototype.

## Run

```bash
npm install
npm run dev          # http://localhost:5173
npm run typecheck && npm run lint
npm run build        # dist/
npm run build:preview  # single-file preview with in-memory routing (dist-preview/index.html)
```

## Demo accounts

- Job seeker: sign in with any phone number (code: any 6 digits, `000000` is a wrong code).
- Employer: phone `88 888 8888`, or email starting with `hr@`.
- Sign-up flows: Create account → role → phone → code → onboarding (seeker: 5 steps, employer: representative, company or join, trade licence).

## Routes

Guest: `/`, `/talent-preview`, `/v/:id`, `/auth/*`, `/signup/*`, `/employer/*`.
Job seeker: `/seeker`, `/seeker/search`, `/vacancy/:id`, `/seeker/applications`, `/seeker/people`, `/people/:id`, `/seeker/messages/:id?`, `/seeker/profile`, `/notifications`, `/org/:id`, `/profile/{edit,personal,general,professional,look,plans,subscription,settings}`.
Employer: `/hire`, `/talent/:id`, `/hire/vacancies`, `/my-vacancy/:id`, `/my-vacancy/:id/applicants`, `/hire/messages/:id?`, `/hire/company`, `/hire/notifications`, `/post`, `/company/{details,team,verification,subscription,settings}`.
