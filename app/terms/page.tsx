import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms — OCE Labs',
  description: 'Terms for using the OCE Labs website and how project work is agreed.',
};

const UPDATED = 'September 22, 2026';

export default function TermsPage() {
  return (
    <>
      <header className="shell page-head">
        <p className="eyebrow rise rise-1">Terms</p>
        <h1 className="h1 rise rise-2">The short version.</h1>
        <p className="lede rise rise-3">
          These cover this website. Project work is covered by a signed proposal. Last updated{' '}
          {UPDATED}.
        </p>
      </header>

      <section className="shell legal">
        <h2>This site</h2>
        <p>
          ocelabs.xyz is run by OCE Labs. You can read it, link to it, and use the contact form to
          get in touch. Please do not scrape it, probe it, or send anything through the form that
          is unlawful or that you do not have the right to send.
        </p>

        <h2>Our content</h2>
        <p>
          The text, design, and code of this site belong to OCE Labs. Work shown on the Work page
          belongs to the clients it was made for and is shown with their permission. Ask before
          reusing any of it.
        </p>

        <h2>Estimates and quotes</h2>
        <p>
          Prices mentioned on this site, in an email, or on a call are estimates. A fixed price
          exists only in a written proposal, and it is held for the period stated in that proposal.
        </p>

        <h2>Project work</h2>
        <p>
          Every project runs under a proposal that both sides sign. It sets out the scope, the
          fixed price, the payment schedule, the timeline, revisions, ownership, cancellation, and
          what happens after launch. Where these terms and a signed proposal differ, the proposal
          wins.
        </p>

        <h2>No warranty for the site</h2>
        <p>
          The site is provided as is. We try to keep it accurate and available, but we do not
          promise either, and we are not liable for loss that comes from relying on it. Nothing
          here limits liability that cannot be limited by law.
        </p>

        <h2>Privacy</h2>
        <p>
          What we collect and why is on the <Link href="/privacy" className="ulink">privacy page</Link>.
        </p>

        <h2>Contact</h2>
        <p>Questions about any of this: hello@ocelabs.xyz.</p>
      </section>
    </>
  );
}
