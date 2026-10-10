import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ProposalView from '@/components/ProposalView';
import { computeQuote } from '@/lib/pricing';
import { buildProposal, hasEdits } from '@/lib/proposal';
import { getLead, leadQuote } from '@/lib/studio';
import ProposalEditor from './ProposalEditor';

export const metadata: Metadata = { title: 'Proposal wording — OCE Labs Studio', robots: { index: false } };
export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ preview?: string }> };

/*
 * Change the proposal's wording for this lead before it is sent. The quote
 * stays in the estimator; this page is only the words around it. Preview
 * shows the result exactly as the client's page and the PDF will.
 */
export default async function ProposalEditPage({ params, searchParams }: Props) {
  const [{ id }, { preview }] = await Promise.all([params, searchParams]);
  const lead = await getLead(id);
  if (!lead) notFound();
  const who = lead.company || lead.name || lead.email;
  const quote = leadQuote(lead);

  if (!quote) {
    return (
      <header className="shell page-head">
        <p className="eyebrow rise rise-1">
          <Link href={`/studio/leads/${id}`}>&larr; {who}</Link>
        </p>
        <h1 className="h1 rise rise-2">No quote yet.</h1>
        <p className="lede rise rise-3">
          Build it in the <Link href={`/pricing?lead=${id}`} className="ulink">estimator</Link> and press Save to lead. The
          wording can be edited once there is a quote to write it around.
        </p>
      </header>
    );
  }

  const q = computeQuote(quote);
  const generated = buildProposal(q);
  const edited = buildProposal(q, new Date(), lead.proposalEdits);
  const showing = preview === '1';

  return (
    <>
      <header className="shell page-head studio-head">
        <div>
          <p className="eyebrow rise rise-1">
            <Link href={`/studio/leads/${id}`}>&larr; {who}</Link> · Proposal wording
          </p>
          <h1 className="h1 rise rise-2">{showing ? 'Preview.' : 'Edit the words.'}</h1>
          <p className="lede rise rise-3">
            {showing
              ? 'This is what the client sees on their page and in the PDF. Send it from the lead page.'
              : 'Rewrite any paragraph, clear one to drop it, or add to the end of a section. Prices and tables come from the quote; change those in the estimator.'}
          </p>
        </div>
      </header>

      <div className="shell prop-bar">
        <p className="prop-bar-note">
          {hasEdits(lead.proposalEdits) ? 'This lead has edited wording. It goes out with the next proposal.' : 'Generated wording, unchanged.'}
        </p>
        <div className="prop-bar-actions">
          {showing ? (
            <Link href={`/studio/leads/${id}/proposal`} className="btn">
              Edit
            </Link>
          ) : (
            <Link href={`/studio/leads/${id}/proposal?preview=1`} className="btn">
              Preview
            </Link>
          )}
          <Link href={`/pricing?lead=${id}`} className="btn">
            Edit quote
          </Link>
          <a className="btn" href={`/studio/leads/${id}/proposal/pdf`}>
            Download PDF
          </a>
        </div>
      </div>

      <div className="shell">
        {showing ? <ProposalView pr={edited} /> : <ProposalEditor id={id} generated={generated} edits={lead.proposalEdits ?? null} />}
      </div>
    </>
  );
}
