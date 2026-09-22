import { redirect } from 'next/navigation';
import { finishGoogleOAuth, isAllowed, setSessionCookie, verifyIdToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/** Google sends the browser back here. Allow-listed emails get a session. */
export async function GET(req: Request) {
  let email: string;
  try {
    const tokens = await finishGoogleOAuth(req, '/api/auth/callback');
    if (!tokens.id_token) throw new Error('No ID token.');
    const who = await verifyIdToken(tokens.id_token);
    if (!who.verified) throw new Error('Email not verified with Google.');
    email = who.email;
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Sign-in failed.';
    redirect(`/studio/sign-in?error=${encodeURIComponent(msg)}`);
  }
  if (!isAllowed(email)) {
    redirect(`/studio/sign-in?error=${encodeURIComponent(`${email} is not on the studio list.`)}`);
  }
  await setSessionCookie(email);
  redirect('/studio');
}
