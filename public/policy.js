/* Plain-language policies shown in Profile > Privacy, safety and data. {operator} and {contact} come from config.js.
   These are templates written to match what the app really does. They are not legal advice: have a lawyer review them
   before you charge customers or serve people in regulated places. */
window.POLICY = {
  privacy: {
    title: "Privacy policy",
    note: "Last updated 19 November 2026. Plain-language template, not legal advice.",
    sections: [
      ["Who runs Schritt", "Schritt is operated by {operator}. Questions or requests about your data: {contact}."],
      ["What Schritt stores", "Your lessons, progress, streak, gems, settings, chosen avatar and, if you create one, a profile name and email. Your lessons and progress stay in this browser's local storage on this device and we do not receive them. When you create a profile, or apply for a job, the name and email you type (and, for a job, the other details and files you choose to send) are sent to the Schritt team by email so we can reply to you, and for profiles to know who has registered."],
      ["If you sign in with Google", "Schritt receives your name, email address and a Google account id from Google, to identify your account. We also email your name and email to the Schritt team the first time you sign in. Your Google password is never shared with Schritt. Your progress is then stored on our server so it syncs between devices, and a login cookie keeps you signed in for up to 30 days. Signing out removes the cookie and the local copy from this device."],
      ["What leaves your device", "Your browser loads the app files from the website that hosts it, and that host keeps ordinary server logs. Spoken lessons use your browser's or system's text-to-speech; some voices are online voices run by the browser vendor and may send the spoken text to them. Google's sign-in script loads only after you choose to sign in. There is no analytics, no advertising tracking, no tracking cookies and no third-party fonts."],
      ["Health information and HIPAA", "Schritt does not ask for, collect or store health information. HIPAA applies to US healthcare providers, health plans and their business associates handling protected health information, so it does not apply to Schritt and we do not claim HIPAA compliance. Please do not enter health information in profile names or custom language packs."],
      ["Data we collect, why, and who processes it", "Google sign-in: your name, email address, profile picture and Google account id, used only to create and recognise your Schritt account and to sync your progress. Profile registration: the name and email you type, used for the same purpose and to let the Schritt team know a new learner joined. Learning data: lessons completed, streak, gems and settings, used to show your progress. Job applications: the details and files you submit on the Careers page, used only to consider your application. Service providers that process this data for us: Google (sign-in), Vercel (hosting), Upstash (database that stores cloud accounts and progress) and Resend (email delivery). We do not sell your data, we do not show ads, and we do not use your data for advertising or profiling."],
      ["Google user data and Limited Use", "Schritt's use and transfer of information received from Google APIs adheres to the Google API Services User Data Policy, including the Limited Use requirements. We request only the basic profile and email scopes (openid, email, profile). We use them only to sign you in and to run your account. We do not share Google user data with third parties except the service providers listed above that store or deliver it for us, we do not use it for advertising, and no person reads it unless you ask us for support, we need to investigate abuse, or the law requires it. You can revoke Schritt's access at any time at myaccount.google.com/permissions."],
      ["Security of your data", "Data is sent over HTTPS. Login cookies are signed, HttpOnly, Secure and SameSite. Cloud data is stored with a managed database provider and access is limited to the Schritt operator. No system is perfectly secure, so keep your own device and browser up to date."],
      ["Deleting your data", "Email {contact} from the address on your account and ask us to delete it. We delete the cloud account and its progress within 30 days and confirm by email. Local data on your device is removed with Erase all data on this device in Profile."],
      ["Children","Schritt is not designed to collect personal information from children. If you are under 13, or under the age of digital consent where you live, use it without an account, or with a parent or guardian. If you believe a child has signed in, contact {contact} and we will delete the account."],
      ["Job applications", "If you apply through the Careers page, the details and files you submit are emailed to the Schritt team and handled by our email provider on their way. We use them only to consider your application and to reply to you, and we delete them when the hiring process ends unless you ask us to keep them. Please send only what you are comfortable sharing, and do not include government ID numbers or health information."],
      ["Your choices", "Download my data and Erase all data on this device are in Profile > Privacy, safety and data. To delete a cloud account and its server copy, email {contact} from the address on the account. Deleting a local profile removes it from this device immediately."],
      ["How long we keep data", "On your device until you erase it. Cloud account data until you ask us to delete it or the account has been unused for two years."],
      ["Changes", "If this policy changes in a way that matters, the date above changes and the app will say so."]
    ]
  },
  terms: {
    title: "Terms of use",
    note: "Last updated 19 November 2026. Plain-language template, not legal advice.",
    sections: [
      ["Using Schritt", "Schritt is a language-learning app provided by {operator}. You may use it for personal learning. Do not try to break, overload or gain unauthorised access to the app, its servers or other people's accounts."],
      ["Learning content", "Lessons are written as study aids. Translations and pronunciations may contain mistakes and have not all been checked by native speakers. Do not rely on them for legal, medical or safety-critical communication."],
      ["Free for everyone", "Schritt is free to use. There are no paid plans and no ads. We may change this in future and will say so here before we do."],
      ["Your content", "Language packs and backups you import stay yours. Only import files from sources you trust; they are treated as plain text and never run as code."],
      ["No warranty", "Schritt is provided as is, without promises that it will always be available or error free. To the extent the law allows, {operator} is not liable for indirect or consequential losses. Nothing here limits liability that cannot be limited by law."],
      ["Changes and contact", "We may update these terms; continued use after a change means you accept it. Contact: {contact}."]
    ]
  },
  security: {
    title: "Security and safety",
    note: "What Schritt does to protect you, and what it cannot do.",
    sections: [
      ["What we do", "Sign-in uses Google, so Schritt never stores a password. Login cookies are signed, HttpOnly (scripts cannot read them), Secure and SameSite, and expire after 30 days. Requests that change data must come from the app's own site. Google sign-in tokens are checked for signature, audience, issuer and expiry on the server. Payment webhooks must carry a valid Stripe signature."],
      ["How the app is hardened", "A strict content-security policy blocks scripts and frames from other sites. All text from imports, profile names and language packs is escaped before display and imported files cannot run code. Backups and packs are checked and size-limited. Nothing is sent to third parties for analytics or ads tracking."],
      ["What we cannot do", "A local profile on a shared computer is not locked: anyone using that browser can open it, so sign in with Google or use your own device account. If your device or browser is infected with malware, no web app can protect you. Passwords for your Google account are protected by Google, so use a strong one with two-step verification."],
      ["Staying safe", "Keep your browser and device updated. Log out on shared computers (this also removes the local copy). Only import language packs and backups from people you trust. Schritt has no chat or user-to-user messages. Ads are labelled and open external sites; do not enter personal details on a site you reached through an ad unless you trust it."],
      ["Report a problem", "Found a security issue? Email {contact} with the steps to reproduce it. Please give us time to fix it before sharing details publicly."]
    ]
  }
};
