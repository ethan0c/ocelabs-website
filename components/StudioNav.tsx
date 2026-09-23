'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/studio', label: 'Leads', match: (p: string) => p === '/studio' || p.startsWith('/studio/leads') },
  { href: '/pricing', label: 'Estimator', match: (p: string) => p.startsWith('/pricing') },
  { href: '/studio/settings', label: 'Settings', match: (p: string) => p.startsWith('/studio/settings') },
];

/** The studio's own bar, under the site nav. Shared by /studio/* and /pricing/*. */
export default function StudioNav({ email }: { email: string }) {
  const pathname = usePathname();
  return (
    <nav className="shell studio-nav" aria-label="Studio">
      <div className="studio-nav-links">
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href} aria-current={l.match(pathname) ? 'page' : undefined}>
            {l.label}
          </Link>
        ))}
      </div>
      <form action="/api/auth/signout" method="post" className="studio-nav-user">
        <span>{email}</span>
        <button type="submit" className="ulink ulink--muted studio-signout">
          Sign out
        </button>
      </form>
    </nav>
  );
}
