import type { Metadata } from 'next';
import { allowedEmails, siteUrl } from '@/lib/auth';
import { fromAddress, gmailConfigured } from '@/lib/gmail';
import { stripeLive } from '@/lib/stripe';

export const metadata: Metadata = { title: 'Settings — OCE Labs Studio', robots: { index: false } };
export const dynamic = 'force-dynamic';

/** What is connected, and the URLs the outside services need. */
export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ ok?: string; error?: string }> }) {
  const { ok, error } = await searchParams;
  const gmail = await gmailConfigured();
  const from = await fromAddress();
  const base = siteUrl();
  const env = (k: string) => Boolean(process.env[k]);

  const rows: Array<[string, string, boolean]> = [
    ['Database', env('DATABASE_URL') ? 'Neon connected' : 'DATABASE_URL missing', env('DATABASE_URL')],
    ['Gmail', gmail ? `Sending as ${from}` : 'Not connected', gmail],
    ['Stripe', env('STRIPE_SECRET_KEY') ? (stripeLive() ? 'Live key' : 'Test key') : 'STRIPE_SECRET_KEY missing', env('STRIPE_SECRET_KEY')],
    ['Stripe webhook', env('STRIPE_WEBHOOK_SECRET') ? 'Secret set' : 'STRIPE_WEBHOOK_SECRET missing', env('STRIPE_WEBHOOK_SECRET')],
    ['Cal.com', env('CAL_LINK') ? process.env.CAL_LINK! : 'CAL_LINK missing (Email A uses a placeholder)', env('CAL_LINK')],
    ['Cal.com webhook', env('CALCOM_WEBHOOK_SECRET') ? 'Secret set' : 'CALCOM_WEBHOOK_SECRET missing (unsigned bookings accepted)', env('CALCOM_WEBHOOK_SECRET')],
    ['Cron', env('CRON_SECRET') ? 'Daily at 13:00 UTC' : 'CRON_SECRET missing', env('CRON_SECRET')],
    ['Legal name', process.env.OCE_LEGAL_NAME || 'OCE_LEGAL_NAME missing', env('OCE_LEGAL_NAME')],
    ['Signer', process.env.STUDIO_SIGNER || 'STUDIO_SIGNER missing (emails sign "The OCE Labs team")', env('STUDIO_SIGNER')],
    ['Studio users', allowedEmails().join(', ') || 'STUDIO_ALLOWED_EMAILS missing', allowedEmails().length > 0],
  ];

  return (
    <>
      <header className="shell page-head">
        <p className="eyebrow rise rise-1">Studio</p>
        <h1 className="h1 rise rise-2">Settings.</h1>
        {(ok || error) && (
          <p className="form-note rise rise-3" data-kind={error ? 'error' : 'ok'} role="status">
            {error ?? ok}
          </p>
        )}
      </header>

      <section className="shell studio-body">
        <ul className="studio-check">
          {rows.map(([k, v, good]) => (
            <li key={k} data-done={good || undefined}>
              <span>{good ? '✓' : '○'} {k}</span>
              <span className="tbl-sub">{v}</span>
            </li>
          ))}
        </ul>

        <div className="act-row" style={{ marginTop: '2rem' }}>
          <a className="btn btn--primary" href="/api/gmail/connect">
            {gmail ? 'Reconnect Gmail' : 'Connect Gmail'}
          </a>
        </div>
        <p className="tbl-sub" style={{ marginTop: '0.75rem' }}>
          Choose the hello@ account at Google&rsquo;s prompt. The studio sends and drafts as that address.
        </p>

        <h2 className="eyebrow" style={{ marginTop: '3rem' }}>URLs the outside services need</h2>
        <ul className="studio-list">
          <li><span>Stripe webhook (invoice.paid)</span><code>{base}/api/webhooks/stripe</code></li>
          <li><span>Cal.com webhook (BOOKING_CREATED)</span><code>{base}/api/webhooks/cal</code></li>
          <li><span>Google OAuth redirect URIs</span><code>{base}/api/auth/callback, {base}/api/gmail/callback</code></li>
          <li><span>Daily cron (Vercel calls it)</span><code>{base}/api/cron/daily</code></li>
        </ul>
      </section>
    </>
  );
}
