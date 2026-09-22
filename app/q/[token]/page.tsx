import type { Metadata } from 'next';
import { leadByQuestionnaireToken } from '@/lib/studio';
import QForm from './QForm';

export const metadata: Metadata = {
  title: 'Questionnaire — OCE Labs',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

/*
 * The project questionnaire (docs/client-onboarding.txt, Part 1) as a page
 * the client fills in from the recap email. Answers land on the lead. The
 * "how we work" material from the same doc sits underneath.
 */
export default async function QuestionnairePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const lead = await leadByQuestionnaireToken(token);

  if (!lead) {
    return (
      <header className="shell page-head">
        <h1 className="h1 rise rise-1">This link isn&rsquo;t valid.</h1>
        <p className="lede rise rise-2">Reply to our email and we will send a fresh one.</p>
      </header>
    );
  }

  const done = Boolean(lead.questionnaireAt);

  return (
    <>
      <header className="shell page-head">
        <h1 className="h1 rise rise-1">{done ? 'Thanks, we have your answers.' : 'A few questions.'}</h1>
        <p className="lede rise rise-2">
          {done
            ? 'Within two business days you will get a fixed quote, a launch date, and a short agreement to sign.'
            : 'Short answers are fine. Skip anything that does not apply. We write a first draft of every page from what you tell us here.'}
        </p>
      </header>

      {!done && (
        <section className="shell q-wrap">
          <QForm token={token} name={lead.name ?? ''} company={lead.company ?? ''} />
        </section>
      )}

      <section className="shell legal q-how">
        <h2>Before we start</h2>
        <p>
          The project begins, and the timeline starts counting, on the kickoff day. Kickoff happens
          when all four of these are in: the deposit is paid, this questionnaire is returned, your
          logo, brand files and any photography are shared, and any existing copy you want kept is
          shared. Anything still missing one week after kickoff moves the launch date by the same
          number of days.
        </p>
        <h2>How we work</h2>
        <p>
          Every page is delivered as complete, readable HTML before any script runs, so Google and AI
          assistants read the same clean page a person does. Each page has one clear title, one honest
          description, structured data, a sitemap and a preview image. We build with Next.js and host
          on Vercel; the code is written for you and lives in a private repository you can be given
          access to at any time. No platform subscription: hosting at typical traffic is free or a
          few dollars a month, the domain is registered in your name, and you own the site outright.
        </p>
        <h2>What you get at handover</h2>
        <p>
          The live site on your domain with HTTPS, redirects and analytics; access to the code
          repository and hosting account; a sitemap, robots file and structured data submitted to
          Google Search Console; a short written guide to updating content; and thirty days of fixes
          for anything we missed. After that, an optional monthly retainer keeps it looked after.
        </p>
        <p>Questions? hello@ocelabs.xyz</p>
      </section>
    </>
  );
}
