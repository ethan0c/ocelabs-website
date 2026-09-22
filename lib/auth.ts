import 'server-only';
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

/*
 * Sign-in for the studio: Google OAuth, allow-listed to the addresses in
 * STUDIO_ALLOWED_EMAILS. No library — the flow is three requests, and the
 * same OAuth client is reused to connect the hello@ mailbox for sending.
 *
 * The session is a signed cookie: `<base64 payload>.<hmac>`, payload
 * {email, exp}. Nothing to store, and rotating AUTH_SECRET signs everyone out.
 */

export const SESSION_COOKIE = 'studio_session';
const SESSION_DAYS = 14;

const secret = () => {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error('AUTH_SECRET is not set.');
  return s;
};

export const siteUrl = () => (process.env.SITE_URL || 'http://localhost:3000').replace(/\/$/, '');

export function allowedEmails(): string[] {
  return (process.env.STUDIO_ALLOWED_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAllowed(email: string) {
  return allowedEmails().includes(email.toLowerCase());
}

/* ── Session cookie ─────────────────────────────────────────────────────── */

type SessionPayload = { email: string; exp: number };

function sign(data: string) {
  return createHmac('sha256', secret()).update(data).digest('base64url');
}

export function encodeSession(email: string) {
  const payload: SessionPayload = { email, exp: Date.now() + SESSION_DAYS * 86400_000 };
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${data}.${sign(data)}`;
}

export function decodeSession(value: string | undefined): SessionPayload | null {
  if (!value) return null;
  const [data, sig] = value.split('.');
  if (!data || !sig) return null;
  const expected = sign(data);
  if (sig.length !== expected.length) return null;
  if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  try {
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString()) as SessionPayload;
    if (typeof payload.email !== 'string' || payload.exp < Date.now()) return null;
    if (!isAllowed(payload.email)) return null;
    return payload;
  } catch {
    return null;
  }
}

/** The signed-in studio user, or null. */
export async function getSession() {
  const jar = await cookies();
  return decodeSession(jar.get(SESSION_COOKIE)?.value);
}

/** For pages and actions that require sign-in. Redirects to the sign-in page. */
export async function requireSession(next = '/studio') {
  const s = await getSession();
  if (!s) redirect(`/studio/sign-in?next=${encodeURIComponent(next)}`);
  return s;
}

export async function setSessionCookie(email: string) {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, encodeSession(email), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_DAYS * 86400,
  });
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.delete({ name: SESSION_COOKIE, path: '/' });
}

/* ── Google OAuth ───────────────────────────────────────────────────────── */

const google = () => {
  const id = process.env.GOOGLE_CLIENT_ID;
  const secret = process.env.GOOGLE_CLIENT_SECRET;
  if (!id || !secret) throw new Error('GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET are not set.');
  return { id, secret };
};

export const STATE_COOKIE = 'oauth_state';

/** Build the consent URL and remember the state to check on return. */
export async function beginGoogleOAuth(opts: {
  redirectPath: string;
  scope: string;
  offline?: boolean;
  loginHint?: string;
}) {
  const state = randomBytes(16).toString('base64url');
  const jar = await cookies();
  jar.set(STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 600,
  });
  const params = new URLSearchParams({
    client_id: google().id,
    redirect_uri: `${siteUrl()}${opts.redirectPath}`,
    response_type: 'code',
    scope: opts.scope,
    state,
    ...(opts.offline ? { access_type: 'offline', prompt: 'consent' } : { prompt: 'select_account' }),
    ...(opts.loginHint ? { login_hint: opts.loginHint } : {}),
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

export type GoogleTokens = {
  access_token: string;
  refresh_token?: string;
  id_token?: string;
  expires_in: number;
};

/** Exchange the code Google sent back. Verifies the state cookie first. */
export async function finishGoogleOAuth(req: Request, redirectPath: string): Promise<GoogleTokens> {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const jar = await cookies();
  const expected = jar.get(STATE_COOKIE)?.value;
  jar.delete({ name: STATE_COOKIE, path: '/' });
  if (!code || !state || !expected || state !== expected) {
    throw new Error('OAuth state mismatch. Start the sign-in again.');
  }
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: google().id,
      client_secret: google().secret,
      redirect_uri: `${siteUrl()}${redirectPath}`,
      grant_type: 'authorization_code',
    }),
  });
  if (!res.ok) throw new Error(`Google token exchange failed: ${res.status}`);
  return (await res.json()) as GoogleTokens;
}

/** Google's own check of an ID token: audience, signature, expiry. */
export async function verifyIdToken(idToken: string): Promise<{ email: string; verified: boolean }> {
  const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
  if (!res.ok) throw new Error('Could not verify the Google ID token.');
  const info = (await res.json()) as { aud?: string; email?: string; email_verified?: string | boolean };
  if (info.aud !== google().id || !info.email) throw new Error('ID token is not for this app.');
  return { email: info.email, verified: info.email_verified === true || info.email_verified === 'true' };
}

/** A fresh access token from a stored refresh token. */
export async function refreshAccessToken(refreshToken: string): Promise<string> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: google().id,
      client_secret: google().secret,
      grant_type: 'refresh_token',
    }),
  });
  if (!res.ok) throw new Error(`Google refresh failed: ${res.status}. Reconnect Gmail in the studio.`);
  return ((await res.json()) as { access_token: string }).access_token;
}
