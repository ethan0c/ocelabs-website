import { proposalByToken, proposalDoc } from '@/lib/studio';
import { proposalFileName } from '@/lib/proposal';
import { renderProposalPdf } from '@/lib/proposal-pdf';

export const dynamic = 'force-dynamic';

/** The client's PDF: unsigned while open, with the signature record once signed. */
export async function GET(_req: Request, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;
  const p = await proposalByToken(token);
  if (!p || p.status === 'void') return new Response('Not found', { status: 404 });

  const pr = proposalDoc(p);
  const signed = p.status === 'signed' && p.signedAt && p.signerName && p.signerEmail && p.docHash;
  const pdf = await renderProposalPdf(
    pr,
    signed
      ? {
          signerName: p.signerName!,
          signerEmail: p.signerEmail!,
          signedAt: p.signedAt!,
          ip: p.signerIp || 'unknown',
          userAgent: p.signerUa || 'unknown',
          docHash: p.docHash!,
          studioSigner: process.env.OCE_LEGAL_NAME || 'OCE Labs',
        }
      : undefined,
  );
  const name = proposalFileName(pr.client).replace(/\.pdf$/, signed ? '-signed.pdf' : '.pdf');
  return new Response(new Uint8Array(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${name}"`,
      'Cache-Control': 'no-store',
    },
  });
}
