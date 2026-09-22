import { cookies } from 'next/headers';
import { renderToBuffer } from '@react-pdf/renderer';
import { COOKIE, isValid } from '../../auth';
import { computeQuote, decodeInput } from '@/lib/pricing';
import { buildProposal, proposalFileName } from '@/lib/proposal';
import ProposalPdf from './ProposalPdf';

export const dynamic = 'force-dynamic';

/** GET /pricing/proposal/pdf?q=… → the proposal as a downloadable PDF. */
export async function GET(req: Request) {
  const jar = await cookies();
  if (!isValid(jar.get(COOKIE)?.value)) {
    return new Response('Locked', { status: 401 });
  }

  const input = decodeInput(new URL(req.url).searchParams.get('q'));
  if (!input) return new Response('No quote', { status: 400 });

  const pr = buildProposal(computeQuote(input));
  const pdf = await renderToBuffer(<ProposalPdf pr={pr} />);

  return new Response(new Uint8Array(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${proposalFileName(pr.client)}"`,
      'Cache-Control': 'no-store',
    },
  });
}
