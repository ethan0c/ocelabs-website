import { runDaily } from '@/lib/studio';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/*
 * Runs once a day from vercel.json. Vercel sends `Authorization: Bearer
 * <CRON_SECRET>`; anything else is refused. Everything time-based lives in
 * lib/studio.ts runDaily: nudges, proposal expiry, Friday drafts, day 30.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return new Response('Unauthorized', { status: 401 });
  }
  const report = await runDaily();
  return Response.json({ ran: new Date().toISOString(), actions: report });
}
