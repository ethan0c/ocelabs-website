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
  const prefill = (!done && lead.questionnaire) || {};
  const prefilled = Object.keys(prefill).length > 0;

  return (
    <>
      <header className="shell page-head">
        <h1 className="h1 rise rise-1">{done ? 'Thanks, we have your answers.' : 'A few questions.'}</h1>
        <p className="lede rise rise-2">
          {done
            ? 'Within two business days you will get a fixed quote, a launch date, and a short agreement to sign.'
            : `Short answers are fine, and skip anything that doesn\u2019t apply.${prefilled ? ' We\u2019ve filled in a few from our call; change anything that\u2019s off.' : ''} Your answers save on this device as you type, so you can come back to it later.`}
        </p>
      </header>

      {!done && (
        <section className="shell q-wrap">
          <QForm token={token} name={lead.name ?? ''} company={lead.company ?? ''} prefill={prefill} />
        </section>
      )}

      <section className="shell legal q-how">
        <h2>Before we start</h2>
        <p>
          We start work, and the timeline starts counting, once four things are in: the deposit,
          this questionnaire, your logo and any photos, and any existing text you want to keep. If
          something is still missing a week after we start, the launch date moves back by the same
          number of days.
        </p>
        <h2>How we work</h2>
        <p>
          We build every site from scratch for you, so it loads fast and reads well to both people
          and Google. There&rsquo;s no website-builder subscription. Hosting usually costs nothing
          or a few dollars a month, the web address is registered in your name, and the site is
          yours outright.
        </p>
        <h2>When it&rsquo;s done</h2>
        <p>
          You get the live site on your own web address, logins to everything it runs on, and a
          short guide to making updates. We fix anything we missed for a set time after launch
          (your proposal says how long). After that, you can keep us on a monthly plan to look
          after it.
        </p>
        <p>Questions? <a href="mailto:hello@ocelabs.xyz" className="text-link">hello@ocelabs.xyz</a></p>
      </section>
    </>
  );
}
