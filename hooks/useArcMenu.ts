'use client';

import { useEffect, useRef, useState } from 'react';

export function useArcMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const initialized = useRef(false);

  useEffect(() => {
    let gsapInstance: typeof import('gsap').gsap;

    (async () => {
      const { gsap } = await import('gsap');
      gsapInstance = gsap;

      const panel = document.getElementById('scene-arc-panel');
      const toggle = document.getElementById('scene-menu-toggle');
      const openIcon = toggle?.querySelector('.menu-icon-open') ?? null;
      const closeIcon = toggle?.querySelector('.menu-icon-close') ?? null;

      if (!panel || !toggle) return;

      const items = gsap.utils.toArray<HTMLElement>('.scene-arc-item');
      const dividerLines = gsap.utils.toArray<HTMLElement>('.scene-arc-line');

      gsap.set(panel, { autoAlpha: 0, y: -10, transformOrigin: '50% 0%', pointerEvents: 'none' });
      gsap.set(items, { autoAlpha: 0, y: -6 });
      if (dividerLines.length) gsap.set(dividerLines, { scaleX: 0.12, autoAlpha: 0.3 });
      if (openIcon && closeIcon) {
        gsap.set(openIcon, { autoAlpha: 1, scale: 1, rotate: 0 });
        gsap.set(closeIcon, { autoAlpha: 0, scale: 0.74, rotate: -24 });
      }

      const tl = gsap.timeline({
        paused: true,
        defaults: { ease: 'power3.out' },
        onStart: () => {
          panel.style.pointerEvents = 'auto';
          panel.setAttribute('aria-hidden', 'false');
        },
        onReverseComplete: () => {
          panel.style.pointerEvents = 'none';
          panel.setAttribute('aria-hidden', 'true');
        },
      });

      tl.to(panel, { autoAlpha: 1, y: 0, duration: 0.2, ease: 'power2.out' })
        .to(dividerLines, { scaleX: 1, autoAlpha: 1, duration: 0.28, stagger: 0.06 }, '-=0.1')
        .to(items, { autoAlpha: 1, y: 0, stagger: 0.05, duration: 0.2, ease: 'power2.out' }, '-=0.2');

      if (openIcon && closeIcon) {
        tl.to(openIcon, { autoAlpha: 0, scale: 0.74, rotate: 24, duration: 0.18 }, '<')
          .to(closeIcon, { autoAlpha: 1, scale: 1, rotate: 0, duration: 0.18 }, '<');
      }

      timelineRef.current = tl;
      initialized.current = true;
    })();

    return () => {
      timelineRef.current?.kill();
    };
  }, []);

  const open = () => {
    if (!initialized.current) return;
    setIsOpen(true);
    timelineRef.current?.play(0);
  };

  const close = () => {
    if (!initialized.current) return;
    setIsOpen(false);
    // Restore icons manually on reverse
    (async () => {
      const { gsap } = await import('gsap');
      const toggle = document.getElementById('scene-menu-toggle');
      const openIcon = toggle?.querySelector('.menu-icon-open') ?? null;
      const closeIcon = toggle?.querySelector('.menu-icon-close') ?? null;
      if (openIcon && closeIcon) {
        gsap.to(openIcon, { autoAlpha: 1, scale: 1, rotate: 0, duration: 0.16, overwrite: true });
        gsap.to(closeIcon, { autoAlpha: 0, scale: 0.74, rotate: -24, duration: 0.16, overwrite: true });
      }
      timelineRef.current?.reverse();
    })();
  };

  const toggle = () => {
    isOpen ? close() : open();
  };

  return { isOpen, open, close, toggle };
}
