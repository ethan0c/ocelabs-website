import { getSession } from '@/lib/auth';
import { proposalFileName } from '@/lib/proposal';
import { renderProposalPdf } from '@/lib/proposal-pdf';
import { getLead, leadProposalDoc } from '@/lib/studio';

export const dynamic = 'force-dynamic';

/** The proposal as it would be sent now, with the lead's wording edits. Internal. */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!(await getSession())) return new Response('Signed out', { status: 401 });
  const { id } = await ctx.params;
  const lead = await getLead(id);
  const pr = lead && leadProposalDoc(lead);
  if (!pr) return new Response('No quote', { status: 400 });

  const pdf = await renderProposalPdf(pr);
  return new Response(new Uint8Array(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${proposalFileName(pr.client)}"`,
      'Cache-Control': 'no-store',
    },
  });
}
