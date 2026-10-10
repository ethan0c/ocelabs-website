import type { Metadata } from 'next';
import Link from 'next/link';
import ProposalView from '@/components/ProposalView';
import { computeQuote, decodeInput, encodeInput } from '@/lib/pricing';
import { buildProposal, hasEdits } from '@/lib/proposal';
import { getLead } from '@/lib/studio';

export const metadata: Metadata = {
  title: 'Proposal — OCE Labs',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

/*
 * Internal preview of a proposal from the estimator's quote. Opened from a
 * lead, it also applies that lead's wording edits. The client's copy is
 * /p/<token>, created from a lead in the studio.
 */

type Props = { searchParams: Promise<{ q?: string; lead?: string }> };

export default async function ProposalPage({ searchParams }: Props) {
  const { q, lead: leadId } = await searchParams;
  const input = decodeInput(q);
  if (!input) {
    return (
      <header className="shell page-head">
        <p className="eyebrow rise rise-1">Internal</p>
        <h1 className="h1 rise rise-2">No quote.</h1>
        <p className="lede rise rise-3">
          Build one in the <Link href="/pricing" className="ulink">estimator</Link> and open the
          proposal from there.
        </p>
      </header>
    );
  }

  const lead = leadId ? await getLead(leadId) : null;
  const pr = buildProposal(computeQuote(input), new Date(), lead?.proposalEdits);
  const encoded = encodeInput(input);
  const tail = lead ? `&lead=${lead.id}` : '';

  return (
    <>
      <div className="shell prop-bar">
        <div className="prop-bar-actions">
          <Link href={`/pricing?q=${encoded}${tail}`} className="btn">
            &larr; Edit quote
          </Link>
          {lead && (
            <Link href={`/studio/leads/${lead.id}/proposal`} className="btn">
              {hasEdits(lead.proposalEdits) ? 'Edit wording · edited' : 'Edit wording'}
            </Link>
          )}
        </div>
        <a className="btn btn--primary" href={`/pricing/proposal/pdf?q=${encoded}${tail}`}>
          Download PDF
        </a>
      </div>
      <div className="shell">
        <ProposalView pr={pr} />
      </div>
    </>
  );
}
