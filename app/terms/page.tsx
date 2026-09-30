import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms — OCE Labs',
  description: 'Terms for using the OCE Labs website and how project work is agreed.',
};

const UPDATED = 'September 30, 2026';

export default function TermsPage() {
  return (
    <>
      <header className="shell page-head">
        <p className="eyebrow rise rise-1">Terms</p>
        <h1 className="h1 rise rise-2">Using this site.</h1>
        <p className="lede rise rise-3">
          These terms cover the website. Paid work is covered by the proposal you sign with us.
          Last updated {UPDATED}.
        </p>
      </header>

      <section className="shell legal">
        <h2>This site</h2>
        <p>
          <Link href="/" className="text-link">ocelabs.xyz</Link> is run by OCE Labs. Feel free to read it, link to it and use the contact form.
          Please don&rsquo;t scrape it, try to break into it, or send anything through the form
          that&rsquo;s illegal or that isn&rsquo;t yours to send.
        </p>

        <h2>Our content</h2>
        <p>
          The words, design and code of this site belong to OCE Labs. The projects on the Work
          page belong to the clients we made them for, and we show them with their permission.
          Please ask before reusing any of it.
        </p>

        <h2>Estimates and quotes</h2>
        <p>
          Any price you see on this site, in an email or hear on a call is an estimate. The price
          only becomes fixed in a written proposal, and it holds until the date on that proposal.
        </p>

        <h2>Project work</h2>
        <p>
          Every project has a proposal that you sign before we start. It covers what we&rsquo;re
          building, the price, when payments are due, the timeline, rounds of changes, who owns
          what, how to cancel and what happens after launch. If anything on this page disagrees
          with your signed proposal, the proposal wins.
        </p>

        <h2>No guarantees for this site</h2>
        <p>
          We do our best to keep this site accurate and online, but we can&rsquo;t promise it
          always will be, and we aren&rsquo;t responsible for losses from relying on it. Nothing
          here limits any responsibility the law doesn&rsquo;t allow us to limit.
        </p>

        <h2>Privacy</h2>
        <p>
          What we collect and why is on our <Link href="/privacy" className="ulink">privacy page</Link>.
        </p>

        <h2>Contact</h2>
        <p>Questions about any of this? Email <a href="mailto:hello@ocelabs.xyz" className="text-link">hello@ocelabs.xyz</a>.</p>
      </section>
    </>
  );
}
