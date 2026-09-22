import Link from 'next/link';
import { requireSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/** Everything under /studio except sign-in: signed in, or sent to sign in. */
export default async function StudioLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession('/studio');
  return (
    <div className="studio">
      <nav className="shell studio-nav" aria-label="Studio">
        <div className="studio-nav-links">
          <Link href="/studio">Leads</Link>
          <Link href="/pricing">Estimator</Link>
          <Link href="/studio/settings">Settings</Link>
        </div>
        <form action="/api/auth/signout" method="post" className="studio-nav-user">
          <span>{session.email}</span>
          <button type="submit" className="ulink ulink--muted studio-signout">
            Sign out
          </button>
        </form>
      </nav>
      {children}
    </div>
  );
}
