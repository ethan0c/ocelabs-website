import { getSession } from '@/lib/auth';
import { computeQuote, decodeInput } from '@/lib/pricing';
import { buildProposal, proposalFileName } from '@/lib/proposal';
import { renderProposalPdf } from '@/lib/proposal-pdf';
import { getLead } from '@/lib/studio';

export const dynamic = 'force-dynamic';

/** GET /pricing/proposal/pdf?q=…[&lead=…] → the (unsigned) proposal as a PDF, with the lead's wording edits. Internal. */
export async function GET(req: Request) {
  if (!(await getSession())) return new Response('Signed out', { status: 401 });

  const params = new URL(req.url).searchParams;
  const input = decodeInput(params.get('q'));
  if (!input) return new Response('No quote', { status: 400 });

  const leadId = params.get('lead');
  const lead = leadId ? await getLead(leadId) : null;
  const pr = buildProposal(computeQuote(input), new Date(), lead?.proposalEdits);
  const pdf = await renderProposalPdf(pr);

  return new Response(new Uint8Array(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${proposalFileName(pr.client)}"`,
      'Cache-Control': 'no-store',
    },
  });
}
