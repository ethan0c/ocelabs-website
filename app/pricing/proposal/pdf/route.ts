import { getSession } from '@/lib/auth';
import { computeQuote, decodeInput } from '@/lib/pricing';
import { buildProposal, proposalFileName } from '@/lib/proposal';
import { renderProposalPdf } from '@/lib/proposal-pdf';

export const dynamic = 'force-dynamic';

/** GET /pricing/proposal/pdf?q=… → the (unsigned) proposal as a PDF. Internal. */
export async function GET(req: Request) {
  if (!(await getSession())) return new Response('Signed out', { status: 401 });

  const input = decodeInput(new URL(req.url).searchParams.get('q'));
  if (!input) return new Response('No quote', { status: 400 });

  const pr = buildProposal(computeQuote(input));
  const pdf = await renderProposalPdf(pr);

  return new Response(new Uint8Array(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${proposalFileName(pr.client)}"`,
      'Cache-Control': 'no-store',
    },
  });
}
