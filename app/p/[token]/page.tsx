import type { Metadata } from 'next';
import { nowMs } from '@/lib/now';
import ProposalView from '@/components/ProposalView';
import { getLead, markProposalViewed, proposalByToken, proposalDoc } from '@/lib/studio';
import SignForm from './SignForm';

export const metadata: Metadata = {
  title: 'Proposal — OCE Labs',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

/*
 * The client's copy of the proposal: read it, download it, sign it. Opening
 * the page records a view; signing records the e-signature and starts the
 * deposit invoice and the welcome email (lib/studio.ts, signProposal).
 */
export default async function ClientProposalPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const p = await proposalByToken(token);
  if (!p || p.status === 'void') {
    return (
      <header className="shell page-head">
        <h1 className="h1 rise rise-1">This proposal link isn&rsquo;t current.</h1>
        <p className="lede rise rise-2">
          Check your email for the latest one, or reply and we will resend it.
        </p>
      </header>
    );
  }
  const lead = await getLead(p.leadId);
  await markProposalViewed(p);

  const pr = proposalDoc(p);
  const expired = p.status === 'expired' || (p.status === 'sent' && p.expiresAt.getTime() < nowMs());
  const signed =
    p.status === 'signed' && p.signedAt && p.signerName
      ? {
          signerName: p.signerName,
          signedAt: p.signedAt,
          studioSigner: process.env.OCE_LEGAL_NAME || 'OCE Labs',
        }
      : null;

  return (
    <>
      <div className="shell prop-bar">
        <p className="prop-bar-note">
          {signed
            ? `Signed ${p.signedAt!.toLocaleDateString('en-US', { dateStyle: 'long' })}.`
            : expired
              ? 'This proposal has expired. Reply to our email and we will re-quote.'
              : `Read it through, then sign at the bottom. Held until ${pr.validUntil}.`}
        </p>
        <div className="prop-bar-actions">
          <a className="btn" href={`/p/${token}/pdf`}>
            {signed ? 'Download signed PDF' : 'Download PDF'}
          </a>
          {!signed && !expired && (
            <a className="btn btn--primary" href="#sign">
              Sign
            </a>
          )}
        </div>
      </div>

      <div className="shell">
        <ProposalView pr={pr} signed={signed} />
      </div>

      {!signed && !expired && (
        <section className="shell sign-wrap">
          <SignForm token={token} name={lead?.name ?? ''} email={lead?.email ?? ''} client={pr.client} />
        </section>
      )}
    </>
  );
}
