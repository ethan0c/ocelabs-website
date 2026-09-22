import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/** Who is signed in, for the nav's profile button. Public pages stay static. */
export async function GET() {
  const s = await getSession();
  return Response.json(s ? { email: s.email } : null, { headers: { 'Cache-Control': 'no-store' } });
}
