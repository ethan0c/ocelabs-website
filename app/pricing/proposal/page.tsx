import type { Metadata } from 'next';
import Link from 'next/link';
import ProposalView from '@/components/ProposalView';
import { requireSession } from '@/lib/auth';
import { computeQuote, decodeInput, encodeInput } from '@/lib/pricing';
import { buildProposal } from '@/lib/proposal';

export const metadata: Metadata = {
  title: 'Proposal — OCE Labs',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

/*
 * Internal preview of a proposal from the estimator's quote. The client's
 * copy is /p/<token>, created from a lead in the studio.
 */

type Props = { searchParams: Promise<{ q?: string }> };

export default async function ProposalPage({ searchParams }: Props) {
  const q = (await searchParams).q;
  await requireSession(`/pricing/proposal${q ? `?q=${q}` : ''}`);
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

  const pr = buildProposal(computeQuote(input));
  const encoded = encodeInput(input);

  return (
    <>
      <div className="shell prop-bar">
        <Link href={`/pricing?q=${encoded}`} className="btn">
          &larr; Edit quote
        </Link>
        <a className="btn btn--primary" href={`/pricing/proposal/pdf?q=${encoded}`}>
          Download PDF
        </a>
      </div>
      <div className="shell">
        <ProposalView pr={pr} />
      </div>
    </>
  );
}
