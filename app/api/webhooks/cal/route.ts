import { createHmac, timingSafeEqual } from 'node:crypto';
import { handleCalBooking } from '@/lib/studio';

export const dynamic = 'force-dynamic';

/*
 * Cal.com → studio. In Cal.com: Settings → Developer → Webhooks, subscriber
 * URL = this route, trigger BOOKING_CREATED, and a secret that goes in
 * CALCOM_WEBHOOK_SECRET. A booking moves the lead to "Call booked".
 */
type CalPayload = {
  triggerEvent: string;
  payload?: {
    startTime?: string;
    endTime?: string;
    attendees?: Array<{ email?: string; name?: string }>;
    responses?: { email?: { value?: string }; name?: { value?: string } };
  };
};

export async function POST(req: Request) {
  const raw = await req.text();
  const secret = process.env.CALCOM_WEBHOOK_SECRET;
  if (secret) {
    const sig = req.headers.get('x-cal-signature-256') || '';
    const expected = createHmac('sha256', secret).update(raw).digest('hex');
    if (sig.length !== expected.length || !timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
      return new Response('Bad signature', { status: 400 });
    }
  }
  const body = JSON.parse(raw) as CalPayload;
  if (body.triggerEvent !== 'BOOKING_CREATED' || !body.payload) return Response.json({ ignored: true });

  const a = body.payload.attendees?.[0];
  const email = a?.email || body.payload.responses?.email?.value;
  const name = a?.name || body.payload.responses?.name?.value || null;
  if (!email || !body.payload.startTime) return Response.json({ ignored: 'no attendee' });

  const lead = await handleCalBooking(
    email,
    name,
    new Date(body.payload.startTime),
    body.payload.endTime ? new Date(body.payload.endTime) : null,
  );
  return Response.json({ lead: lead.id });
}
