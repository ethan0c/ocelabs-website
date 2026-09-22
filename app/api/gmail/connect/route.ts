import { redirect } from 'next/navigation';
import { beginGoogleOAuth, requireSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/*
 * Connect the mailbox the studio sends from. Done once, signed in, choosing
 * the hello@ account at Google's prompt. The refresh token is kept in
 * settings and every send uses it.
 */
export async function GET() {
  await requireSession('/studio/settings');
  redirect(
    await beginGoogleOAuth({
      redirectPath: '/api/gmail/callback',
      scope: 'https://www.googleapis.com/auth/gmail.compose openid email',
      offline: true,
      loginHint: process.env.STUDIO_FROM_EMAIL,
    }),
  );
}
