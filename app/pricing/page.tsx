import type { Metadata } from 'next';
import Link from 'next/link';
import Estimator from '@/components/Estimator';
import { decodeInput, sanitise, type QuoteInput } from '@/lib/pricing';
import { getLead } from '@/lib/studio';

export const metadata: Metadata = {
  title: 'Pricing — OCE Labs',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

type Props = { searchParams: Promise<{ q?: string; lead?: string }> };

/*
 * The estimator. Signed-in only. Opened from a lead, it loads that lead's
 * saved quote and offers "Save to lead"; opened bare, it is a calculator
 * whose state lives in the URL.
 */
export default async function PricingPage({ searchParams }: Props) {
  const { q, lead: leadId } = await searchParams;

  let initial: QuoteInput | null = decodeInput(q);
  let leadName: string | null = null;
  if (leadId) {
    const lead = await getLead(leadId);
    if (lead) {
      leadName = lead.company || lead.name || lead.email;
      // Saved quotes may predate fields the estimator now expects.
      if (!initial && lead.quote) initial = sanitise(lead.quote);
      if (initial) {
        initial = {
          ...initial,
          email: initial.email || lead.email,
          client: initial.client || lead.company || '',
        };
      } else {
        initial = null;
      }
    }
  }

  return (
    <>
      <header className="shell page-head est-head">
        <div>
          <p className="eyebrow rise rise-1">
            {leadId ? (
              <>
                <Link href={`/studio/leads/${leadId}`}>&larr; {leadName ?? 'Lead'}</Link>
              </>
            ) : (
              'Internal'
            )}
          </p>
          <h1 className="h1 rise rise-2">Estimate.</h1>
          <p className="lede rise rise-3">
            Work through the questionnaire answers top to bottom. The summary updates
            as you go{leadId ? ' and saves to the lead' : ', opens as a proposal, and drafts each payment in Stripe'}.
          </p>
        </div>
      </header>

      <section className="shell">
        <Estimator initial={initial} leadId={leadId ?? null} />
      </section>
    </>
  );
}
