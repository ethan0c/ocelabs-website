import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy — OCE Labs',
  description: 'What OCE Labs collects, why, and how to reach us about it.',
};

const UPDATED = 'September 22, 2026';

export default function PrivacyPage() {
  return (
    <>
      <header className="shell page-head">
        <p className="eyebrow rise rise-1">Privacy</p>
        <h1 className="h1 rise rise-2">What we collect.</h1>
        <p className="lede rise rise-3">
          Very little. This page lists all of it. Last updated {UPDATED}.
        </p>
      </header>

      <section className="shell legal">
        <h2>The contact form</h2>
        <p>
          When you write to us through the form, we receive your email address, your message,
          and the budget range you pick. The form is processed by Formspree, which passes it to
          our inbox at hello@ocelabs.xyz. We use it to reply to you and for nothing else. We keep
          it as long as the conversation is live and for our records of the project afterwards.
        </p>

        <h2>Browsing the site</h2>
        <p>
          We run no analytics and set no tracking cookies. The site remembers your light or dark
          theme choice in your browser&rsquo;s local storage; that value never leaves your device.
          Our host, Railway, keeps standard server logs (IP address, pages requested, time) for a
          short period for security and uptime.
        </p>

        <h2>Clients</h2>
        <p>
          If we work together, we hold what the project needs: your contact details, the
          questionnaire, the signed proposal, the files you send us, and the code we write. Invoices
          are issued through Stripe, which processes your payment details under its own privacy
          policy; we never see your full card or bank numbers. Proposals may be sent for signature
          through an e-signature service, which stores the signed document.
        </p>

        <h2>Who else sees it</h2>
        <p>
          Nobody, beyond the services named above, which act on our instructions. We do not sell,
          rent, or share personal information. We would disclose it only if the law required it.
        </p>

        <h2>Your choices</h2>
        <p>
          Email hello@ocelabs.xyz to see what we hold about you, to correct it, or to have it
          deleted. We will do it within a few days unless we need to keep a record of a contract or
          a payment.
        </p>

        <h2>Changes</h2>
        <p>
          If this page changes, the date at the top changes with it. We do not send notices about
          it.
        </p>
      </section>
    </>
  );
}
