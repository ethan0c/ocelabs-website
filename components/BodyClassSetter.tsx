'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const pathToBodyClass: Record<string, string> = {
  '/': 'landing-page',
  '/services': 'subpage services-page',
  '/work': 'subpage work-page',
  '/contact': 'subpage contact-page',
};

export default function BodyClassSetter() {
  const pathname = usePathname();

  useEffect(() => {
    const cls = (pathname ? pathToBodyClass[pathname] : undefined) ?? 'subpage';
    document.body.className = cls;
  }, [pathname]);

  return null;
}
