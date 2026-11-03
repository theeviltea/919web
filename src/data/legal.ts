// User agreement and privacy policy texts (same as the app, profile/legal).
type Doc = { title: string; intro: string; sections: [string, string[]][] };

export type DocKey = 'privacy' | 'terms' | 'bizTerms' | 'bizPrivacy';

export const DOCS: Record<DocKey, Doc> = {
  bizTerms: {
    title: 'User agreement',
    intro: 'This agreement sets the rules for using 919 by companies and recruiters who post vacancies and contact candidates in the UAE. By creating a business account you accept these terms.',
    sections: [
      ['Who can use 919 for business', ['You must represent a company registered in the UAE or work as a licensed private recruiter. One person can belong to one company at a time.', 'The company admin is responsible for the team: who joins, which role they get and what they publish.']],
      ['Company verification', ['Before your first vacancy we check the company details and the contact person. Until this check is complete you can browse talent but cannot publish vacancies.', 'The verified badge is given only to companies that upload a valid trade licence (PDF) and pass the check by the 919 team. The licence is seen only by the 919 team and is never shown to candidates. Without it you can still post vacancies, but without the badge.']],
      ['Vacancies and content', ['Vacancies must describe a real job with the actual pay, location and schedule. Discriminatory requirements, fees charged to candidates and misleading offers are not allowed.', 'We may hide or remove a vacancy that breaks these rules and will tell you why.']],
      ['Contacting candidates', ['Use candidate contacts and video presentations only to discuss work you offer. Do not share them outside your company or use them for advertising.']],
      ['Subscription and payments', ['Premium is purchased in the app through Apple Pay and renews automatically each period. You can cancel any time in your Apple ID settings; access stays until the end of the paid period.', 'Refunds are handled by Apple under its rules.']],
      ['Suspension and termination', ['We may limit or close an account that violates this agreement, the law or the safety of candidates. You can delete your account at any time in Privacy and security.']],
      ['Changes to the agreement', ['We will notify you in the app at least 14 days before material changes take effect.']],
    ],
  },
  bizPrivacy: {
    title: 'Privacy policy',
    intro: 'This policy explains which data 919 collects from business accounts, why we need it and how you can control it.',
    sections: [
      ['Data we collect', ['Account data: your name, phone number, email and role in the company.', 'Company data: name, trade licence (seen only by the 919 team), logo, address and links you add.', 'Activity: vacancies you post, applicants you review and messages you send in 919.']],
      ['How we use it', ['To verify your company, show your vacancies to candidates, deliver messages and notifications, and keep the service safe from fraud.']],
      ['What candidates see', ['Candidates see your company profile, your vacancies and, if you allow it in Privacy and security, your name and phone number.']],
      ['Sharing with third parties', ['We do not sell personal data. We share it only with providers that run 919 for us — hosting, SMS delivery and analytics — under contracts that protect it, and with authorities when the law requires.']],
      ['Storage and security', ['Data is stored on servers in the UAE and encrypted in transit and at rest. We keep it while your account is active and up to 12 months after deletion for legal reasons.']],
      ['Your rights', ['You can view, correct or download your data and delete your account at any time. Write to us and we will reply within 30 days.']],
    ],
  },
  privacy: {
    title: 'Privacy policy',
    intro: 'This policy explains which data 919 collects from job seekers, why we need it and how you can control it.',
    sections: [
      ['Data we collect', ['Account data: your name, phone number, email, date of birth and city.', 'Profile data: photos, video presentation, measurements, experience, education and links you add.', 'Activity: vacancies you view, save and apply to, and messages you send in 919.']],
      ['How we use it', ['To show your profile to employers, match you with vacancies, deliver messages and notifications, and keep the service safe from fraud.']],
      ['What employers see', ['Employers see your public profile in talent search unless you hide it in Edit profile. Your phone and email are shared only after you apply or accept an invite.']],
      ['Sharing with third parties', ['We do not sell personal data. We share it only with providers that run 919 for us — hosting, SMS delivery and analytics — under contracts that protect it, and with authorities when the law requires.']],
      ['Storage and security', ['Data is stored on servers in the UAE and encrypted in transit and at rest. We keep it while your account is active and up to 12 months after deletion for legal reasons.']],
      ['Your rights', ['You can view, correct or download your data and delete your account at any time. Write to us and we will reply within 30 days.']],
    ],
  },
  terms: {
    title: 'User agreement',
    intro: 'These terms apply when you use 919 to find work. By creating an account you agree to them.',
    sections: [
      ['Your account', ['You must be 18 or older. One person — one account. Keep your sign-in code private; actions from your account are considered yours.']],
      ['Your profile', ['Photos, video and details must be yours, recent and truthful. No nudity, no contacts in photos, no misleading information. We may hide content that breaks these rules.']],
      ['Applications and chats', ['Be respectful to employers. Don’t send spam, requests for payment or links to other services in messages. Report anything suspicious from the chat menu.']],
      ['Payments', ['Applying to vacancies is free. Premium features are paid in advance for the selected period and renew until you cancel.']],
      ['Blocking and termination', ['We may limit or block an account that breaks these terms. You can delete your account at any time in Settings.']],
      ['Liability', ['919 connects job seekers and employers. Terms of a job are agreed between you and the employer; we check companies but are not a party to the work agreement.']],
    ],
  },
};

