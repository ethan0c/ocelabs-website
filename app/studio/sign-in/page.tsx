import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Studio — OCE Labs',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ error?: string; next?: string }> }) {
  if (await getSession()) redirect('/studio');
  const { error } = await searchParams;
  return (
    <header className="shell page-head">
      <p className="eyebrow rise rise-1">Internal</p>
      <h1 className="h1 rise rise-2">Studio.</h1>
      <div className="rise rise-3 signin">
        <a className="block block--primary" href="/api/auth/google">
          Sign in with Google <span className="arrow" aria-hidden="true">&rarr;</span>
        </a>
        <p className="form-note" data-kind={error ? 'error' : undefined} role="status">
          {error}
        </p>
      </div>
    </header>
  );
}
