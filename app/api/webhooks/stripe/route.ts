import { handleInvoicePaid, handleRetainerEnded, type PaidInvoice } from '@/lib/studio';
import { verifyWebhook } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

/*
 * Stripe → studio. Subscribe this endpoint to `invoice.paid` in the Stripe
 * dashboard (Developers → Webhooks), plus `customer.subscription.deleted`
 * for retainers, and put its signing secret in
 * STRIPE_WEBHOOK_SECRET. A paid deposit is one of the four kickoff items.
 */
export async function POST(req: Request) {
  const raw = await req.text();
  if (!verifyWebhook(raw, req.headers.get('stripe-signature'))) {
    return new Response('Bad signature', { status: 400 });
  }
  const event = JSON.parse(raw) as { type: string; data: { object: PaidInvoice & { object: string } } };
  if (event.type === 'invoice.paid' && event.data.object.object === 'invoice') {
    await handleInvoicePaid(event.data.object);
  }
  if (event.type === 'customer.subscription.deleted') {
    await handleRetainerEnded(event.data.object.id);
  }
  return Response.json({ received: true });
}
