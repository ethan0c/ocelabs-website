'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useSystemTheme } from '@/hooks/useTheme';
import Logo from './Logo';
import ProfileButton from './ProfileButton';

const links = [
  { href: '/work', label: 'Work' },
  { href: '/contact', label: 'Contact' },
];

export default function Nav() {
  const pathname = usePathname();
  useSystemTheme();
  const [scrolled, setScrolled] = useState(false);
  const sheet = useRef<HTMLDivElement>(null);

  // The sheet is tied to the route it was opened on, so navigating closes it
  // without an effect: a new pathname no longer matches openFor.
  const [openFor, setOpenFor] = useState<string | null>(null);
  const open = openFor === pathname;

  useEffect(() => {
    // rAF-gated so a fast scroll doesn't queue a setState per wheel event.
    let queued = false;
    const onScroll = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 8);
        queued = false;
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenFor(null);
    };
    window.addEventListener('keydown', onKey);
    // Lock the page behind the sheet.
    document.documentElement.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.documentElement.style.overflow = '';
    };
  }, [open]);

  // Stagger the sheet's links in. Runs only on open; the sheet unmounts on close.
  useEffect(() => {
    const el = sheet.current;
    if (!open || !el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      gsap.from('.sheet-link', {
        opacity: 0,
        y: 14,
        duration: 0.55,
        ease: 'expo.out',
        stagger: 0.06,
        delay: 0.08,
      });
    }, sheet);
    return () => ctx.revert();
  }, [open]);

  return (
    <>
      <nav className="nav" data-scrolled={scrolled}>
        <div className="shell nav-inner">
          <Link href="/" className="wordmark" aria-label="OCE Labs — home">
            <Logo />
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

            <ProfileButton />

            <button
              type="button"
              className="menu-btn"
              onClick={() => setOpenFor((v) => (v === pathname ? null : pathname))}
              aria-expanded={open}
              aria-controls="mobile-sheet"
              aria-label={open ? 'Close menu' : 'Open menu'}
            >
              {/* Two rules that cross into an X. */}
              <span className="menu-bar" data-open={open} />
              <span className="menu-bar" data-open={open} />
            </button>
          </div>
        </div>
      </nav>

      {open && (
        <div className="sheet" id="mobile-sheet" ref={sheet}>
          <div className="shell sheet-inner">
            {links.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="sheet-link"
                aria-current={pathname === href ? 'page' : undefined}
              >
                {label}
              </Link>
            ))}
            <a className="sheet-link sheet-link--dim" href="mailto:hello@ocelabs.xyz">
              hello@ocelabs.xyz
            </a>
          </div>
        </div>
      )}
    </>
  );
}
