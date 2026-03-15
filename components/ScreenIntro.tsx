'use client';

import { useEffect, useRef, useState } from 'react';

export default function ScreenIntro() {
  const introRef = useRef<HTMLDivElement | null>(null);
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    const intro = introRef.current;
    if (!intro) {
      return;
    }

    let mounted = true;
    let removePageShow: (() => void) | null = null;
    let teardownGsap: (() => void) | null = null;

    const hideImmediately = () => {
      if (!mounted) {
        return;
      }
      setIsHidden(true);
      intro.style.pointerEvents = 'none';
      intro.setAttribute('aria-hidden', 'true');
      intro.style.opacity = '0';
      intro.style.visibility = 'hidden';
    };

    if (typeof window !== 'undefined' && window.sessionStorage.getItem('introShown')) {
      hideImmediately();
    } else {
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem('introShown', '1');
      }

      const introStartTime = performance.now();

      void import('gsap').then((mod) => {
        if (!mounted) {
          return;
        }

        const gsap = mod.gsap || mod.default;
        if (!gsap) {
          window.setTimeout(hideImmediately, 1000);
          return;
        }

        const inner = intro.querySelector('.screen-intro-inner');
        const logo = intro.querySelector('.screen-intro-logo');
        const wordmark = intro.querySelector('.screen-intro-wordmark');
        const caption = intro.querySelector('.screen-intro-caption');
        const line = intro.querySelector('.screen-intro-rule');

        const dismiss = () => {
          const elapsed = performance.now() - introStartTime;
          const remaining = Math.max(1000 - elapsed, 0);
          const timeoutId = window.setTimeout(() => {
            gsap.to(intro, {
              autoAlpha: 0,
              duration: 0.34,
              onComplete: hideImmediately
            });
          }, remaining);

          teardownGsap = () => {
            window.clearTimeout(timeoutId);
          };
        };

        gsap.set(intro, { autoAlpha: 1 });
        gsap.set(inner, { autoAlpha: 1, y: 0, scale: 1 });

        const tl = gsap
          .timeline({ defaults: { ease: 'power3.out' } })
          .from(logo, { autoAlpha: 0, scale: 0.74, rotation: -14, duration: 0.4 })
          .from(wordmark, { autoAlpha: 0, y: 9, duration: 0.25 }, '-=0.2')
          .from(line, { scaleX: 0, transformOrigin: '50% 50%', duration: 0.26 }, '-=0.18')
          .from(caption, { autoAlpha: 0, y: 6, duration: 0.22 }, '-=0.14')
          .call(dismiss);

        const previousTeardown = teardownGsap;
        teardownGsap = () => {
          previousTeardown?.();
          tl.kill();
        };
      });
    }

    const pageShowHandler = (event: PageTransitionEvent) => {
      if (event.persisted) {
        hideImmediately();
      }
    };
    window.addEventListener('pageshow', pageShowHandler);
    removePageShow = () => window.removeEventListener('pageshow', pageShowHandler);

    return () => {
      mounted = false;
      removePageShow?.();
      teardownGsap?.();
    };
  }, []);

  return (
    <div
      className="screen-intro"
      id="screen-intro"
      aria-hidden={isHidden}
      ref={introRef}
      style={isHidden ? { opacity: 0, visibility: 'hidden', pointerEvents: 'none' } : undefined}
    >
      <div className="screen-intro-inner">
        <img src="/icon-logo.png" alt="" className="screen-intro-logo" />
        <p className="screen-intro-wordmark">OCE LABS</p>
        <div className="screen-intro-rule" />
        <p className="screen-intro-caption">CREATIVE ENGINEERING STUDIO</p>
      </div>
    </div>
  );
}
