import { redirect } from 'next/navigation';
import { beginGoogleOAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/** Studio sign-in: send the browser to Google. */
export async function GET() {
  redirect(
    await beginGoogleOAuth({
      redirectPath: '/api/auth/callback',
      scope: 'openid email',
    }),
  );
}
