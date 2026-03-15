'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { IoMoon, IoSunny, IoGrid, IoClose } from 'react-icons/io5';
import { useTheme } from '@/hooks/useTheme';
import { useMobileMenu } from '@/hooks/useMobileMenu';
import { useArcMenu } from '@/hooks/useArcMenu';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/services', label: 'Services' },
  { href: '/work', label: 'Work' },
  { href: '/contact', label: 'Contact' },
];

export default function Nav() {
  const pathname = usePathname();
  const { theme, toggle: toggleTheme } = useTheme();
  const { isOpen: mobileOpen, close: closeMobile, toggle: toggleMobile } = useMobileMenu();
  const arcMenu = useArcMenu();

  // Close mobile menu on route change
  useEffect(() => {
    closeMobile();
  }, [pathname, closeMobile]);

  // Close arc menu on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const panel = document.getElementById('scene-arc-panel');
      const toggle = document.getElementById('scene-menu-toggle');
      if (
        arcMenu.isOpen &&
        panel &&
        toggle &&
        !panel.contains(e.target as Node) &&
        !toggle.contains(e.target as Node)
      ) {
        arcMenu.close();
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [arcMenu]);

  // Escape key closes everything
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeMobile();
        arcMenu.close();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [closeMobile, arcMenu]);

  return (
    <>
      <nav className="nav" id="top-nav">
        <div
          className={`nav-overlay${mobileOpen ? ' active' : ''}`}
          id="nav-overlay"
          onClick={closeMobile}
        />
        <div className="nav-container">
          <Link className="nav-logo" href="/">
            <Image src="/icon-logo.png" alt="OCE Labs" width={32} height={32} className="logo-image" />
            <span className="logo-text">OCE LABS</span>
          </Link>

          <div className={`nav-menu${mobileOpen ? ' active' : ''}`} id="nav-menu">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`nav-link${pathname === href ? ' active' : ''}`}
                onClick={closeMobile}
              >
                {label}
              </Link>
            ))}
          </div>

          <div className="nav-actions">
            <button
              className="theme-toggle"
              id="theme-toggle"
              aria-label="Toggle dark mode"
              onClick={toggleTheme}
            >
              <IoMoon className={`theme-icon dark-icon${theme === 'dark' ? '' : ''}`} />
              <IoSunny className={`theme-icon light-icon`} />
            </button>

            <button
              className={`scene-menu-toggle scene-menu-toggle--nav${arcMenu.isOpen ? ' is-open' : ''}`}
              id="scene-menu-toggle"
              aria-expanded={arcMenu.isOpen}
              aria-controls="scene-arc-panel"
              aria-label="Toggle quick navigation"
              onClick={arcMenu.toggle}
            >
              <IoGrid className="scene-menu-icon menu-icon-open" />
              <IoClose className="scene-menu-icon menu-icon-close" />
            </button>

            <button
              className={`nav-toggle${mobileOpen ? ' active' : ''}`}
              id="nav-toggle"
              aria-label="Toggle navigation menu"
              onClick={toggleMobile}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </nav>

      <div
        className="scene-arc-panel scene-arc-panel--nav"
        id="scene-arc-panel"
        aria-hidden={!arcMenu.isOpen}
      >
        <div className="scene-arc-line scene-arc-line--top" aria-hidden="true" />
        <div className="scene-arc-items">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="scene-arc-link scene-arc-item"
              onClick={arcMenu.close}
            >
              {label}
            </Link>
          ))}
        </div>
        <div className="scene-arc-line scene-arc-line--bottom" aria-hidden="true" />
      </div>
    </>
  );
}
