import { redirect } from 'next/navigation';
import { finishGoogleOAuth, requireSession, verifyIdToken } from '@/lib/auth';
import { setSetting } from '@/lib/settings';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  await requireSession('/studio/settings');
  let msg = '';
  try {
    const tokens = await finishGoogleOAuth(req, '/api/gmail/callback');
    if (!tokens.refresh_token) {
      throw new Error('Google did not return a refresh token. Remove the app at myaccount.google.com/permissions and connect again.');
    }
    const who = tokens.id_token ? await verifyIdToken(tokens.id_token) : null;
    await setSetting('gmail_refresh_token', tokens.refresh_token);
    if (who) await setSetting('gmail_address', who.email);
    msg = `Connected ${who?.email ?? 'Gmail'}.`;
  } catch (e) {
    msg = e instanceof Error ? e.message : 'Could not connect Gmail.';
    redirect(`/studio/settings?error=${encodeURIComponent(msg)}`);
  }
  redirect(`/studio/settings?ok=${encodeURIComponent(msg)}`);
}
