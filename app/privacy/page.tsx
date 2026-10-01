import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy — OCE Labs',
  description: 'What OCE Labs collects, why, and how to reach us about it.',
};

const UPDATED = 'October 1, 2026';

export default function PrivacyPage() {
  return (
    <>
      <header className="shell page-head">
        <p className="eyebrow rise rise-1">Privacy</p>
        <h1 className="h1 rise rise-2">What we collect.</h1>
        <p className="lede rise rise-3">
          Not much, and it&rsquo;s all listed here. Last updated {UPDATED}.
        </p>
      </header>

      <section className="shell legal">
        <h2>When you contact us</h2>
        <p>
          The contact form sends us your name, email, message and the budget range you pick. We
          save it in our database and it lands in our inbox at <a href="mailto:hello@ocelabs.xyz" className="text-link">hello@ocelabs.xyz</a>.
          To help us reply faster, your message is passed to an AI service, which writes a
          one-line summary for our notes. It isn&rsquo;t used to train AI models. If you book a
          call, our booking service handles it and shares your name, email and the time with us.
        </p>

        <h2>Browsing the site</h2>
        <p>
          There are no analytics and no tracking cookies. The site remembers whether you picked
          light or dark mode, and that setting stays in your browser. Our hosting company keeps
          ordinary server logs (IP address, the page you asked for, the time) for a short while to
          keep the site secure and running.
        </p>

        <h2>If we work together</h2>
        <p>
          We keep what the project needs: your contact details, your questionnaire answers, the
          signed proposal, the files you send us and the code we write. When you sign a proposal
          online we record your typed name, email, the time, your IP address and browser, so
          there&rsquo;s a clear record of who signed and when. Invoices go through our payment
          provider, which handles your card or bank details under its own privacy policy. We
          never see the full numbers.
        </p>

        <h2>Who else sees it</h2>
        <p>
          Only the kinds of services described on this page (hosting, our database, email,
          call booking, payments and the AI summary), and only to do the job we use them for. If
          you want to know which companies handle your information, email us and we&rsquo;ll tell
          you. We don&rsquo;t sell or share your information with anyone else. The one exception
          is if the law requires us to hand something over.
        </p>

        <h2>How long we keep it</h2>
        <p>
          If we don&rsquo;t end up working together, we delete your details on request, or after
          a year of no contact. If we do, we keep project records for as long as tax and contract
          law ask us to.
        </p>

        <h2>Your choices</h2>
        <p>
          Email <a href="mailto:hello@ocelabs.xyz" className="text-link">hello@ocelabs.xyz</a> to see what we have about you, fix it, or ask us to delete it.
          We&rsquo;ll get it done within a few days, except for anything we&rsquo;re required to
          keep, like a signed contract or a payment record.
        </p>

        <h2>Changes</h2>
        <p>
          If we change this page, we&rsquo;ll update the date at the top. If a change affects a
          current client, we&rsquo;ll tell you by email.
        </p>
      </section>
    </>
  );
}
