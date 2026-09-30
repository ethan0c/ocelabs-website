'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/** Shared so anything else that needs to scroll (anchors, nav) goes through Lenis. */
let lenis: Lenis | null = null;

export function scrollTo(target: string | number | HTMLElement) {
  if (lenis) lenis.scrollTo(target, { offset: 0 });
  else if (typeof target !== 'number' && typeof target !== 'string') {
    target.scrollIntoView({ behavior: 'smooth' });
  }
}

/**
 * Owns the site's only requestAnimationFrame loop.
 *
 * Lenis and GSAP each ship their own rAF driver, and running both means two
 * loops fighting over the same frame — the classic source of scroll jank. So
 * Lenis is stepped from GSAP's ticker instead, and lag smoothing is off so a
 * dropped frame doesn't get "caught up" with a visible jump.
 */
export default function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    // Respect the OS setting — no hijacked scroll for people who asked for less motion.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const instance = new Lenis({
      duration: 1.05,
      // Slight ease-out; keeps the tail from feeling floaty at high scroll speed.
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 1.6,
      // Native momentum on touch already feels right; only smooth wheel input.
      syncTouch: false,
    });
    lenis = instance;

    instance.on('scroll', ScrollTrigger.update);

    const step = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(step);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(step);
      instance.destroy();
      lenis = null;
    };
  }, []);

  // A client-side nav keeps the old scroll offset otherwise, and any ScrollTrigger
  // measured against the previous page's height is now wrong. A link with a hash
  // (/work#templates) lands on that section instead, clear of the sticky nav.
  useEffect(() => {
    ScrollTrigger.refresh();
    const id = decodeURIComponent(window.location.hash.slice(1));
    const target = id ? document.getElementById(id) : null;
    // Both paths honour the target's scroll-margin-top.
    if (target) {
      if (lenis) lenis.scrollTo(target, { immediate: true });
      else target.scrollIntoView();
    } else {
      lenis?.scrollTo(0, { immediate: true });
    }
  }, [pathname]);

  return null;
}
