'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTheme } from '@/hooks/useTheme';

const links = [
  { href: '/work', label: 'Work' },
  { href: '/contact', label: 'Contact' },
];

export default function Nav() {
  const pathname = usePathname();
  const { theme, toggle } = useTheme();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className="nav" data-scrolled={scrolled}>
      <div className="shell nav-inner">
        <Link href="/" className="wordmark">
          OCE LABS
        </Link>

        <div className="nav-right">
          <div className="nav-links">
            {links.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="nav-link"
                aria-current={pathname === href ? 'page' : undefined}
              >
                {label}
              </Link>
            ))}
          </div>

          <button
            type="button"
            className="theme-btn"
            onClick={toggle}
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            {/* A filled circle for dark, hollow for light. */}
            <svg width="13" height="13" viewBox="0 0 13 13" aria-hidden="true">
              <circle
                cx="6.5"
                cy="6.5"
                r="5.5"
                fill={theme === 'dark' ? 'currentColor' : 'none'}
                stroke="currentColor"
              />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
}
