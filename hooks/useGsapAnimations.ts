'use client';

import { useEffect } from 'react';

export type GsapPage = 'home' | 'services' | 'work' | 'contact';

export function useGsapAnimations(page: GsapPage) {
  useEffect(() => {
    let isActive = true;
    let cleanup: (() => void) | undefined;

    const run = async () => {
      const gsapModule = await import('gsap');
      const scrollTriggerModule = await import('gsap/ScrollTrigger');

      if (!isActive) {
        return;
      }

      const gsap = gsapModule.gsap || gsapModule.default;
      const ScrollTrigger =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (scrollTriggerModule as any).ScrollTrigger ||
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (scrollTriggerModule as any).default?.ScrollTrigger;

      if (!gsap || !ScrollTrigger) {
        return;
      }

      gsap.registerPlugin(ScrollTrigger);

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
      }

      const delayedCalls: Array<{ kill: () => void }> = [];
      const isLanding = page === 'home';

      const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      if (!isLanding) {
        heroTl.from('.nav', { y: -20, opacity: 0, duration: 0.5 });
      }

      heroTl
        .fromTo(
          '.hero-eyebrow',
          { opacity: 0, filter: 'blur(6px)', y: 8 },
          { opacity: 1, filter: 'blur(0px)', y: 0, duration: 0.5 },
          '-=0.15'
        )
        .fromTo(
          '.title-line',
          { opacity: 0, filter: 'blur(10px)', y: 18 },
          { opacity: 1, filter: 'blur(0px)', y: 0, stagger: 0.07, duration: 0.62 },
          '-=0.2'
        )
        .fromTo(
          '.hero-subtitle',
          { opacity: 0, filter: 'blur(6px)', y: 10 },
          { opacity: 1, filter: 'blur(0px)', y: 0, duration: 0.5 },
          '-=0.3'
        )
        .from('.hero-buttons .btn', { y: 12, opacity: 0, stagger: 0.08, duration: 0.38 }, '-=0.2');

      if (isLanding) {
        heroTl
          .fromTo(
            '.orbit-label',
            { opacity: 0, y: 6 },
            { opacity: 1, y: 0, duration: 0.5, stagger: 0.04 },
            '-=0.4'
          )
          .from(
            '.shape',
            {
              opacity: 0,
              scale: 0.82,
              duration: 0.65,
              stagger: 0.06,
              ease: 'power2.out'
            },
            '-=0.45'
          );

        gsap.to('.shape--ring', {
          rotation: 360,
          transformOrigin: '50% 50%',
          duration: 14,
          ease: 'none',
          repeat: -1
        });

        gsap.to('.shape--cube', {
          rotationY: '+=360',
          rotationX: '+=360',
          duration: 10,
          ease: 'none',
          repeat: -1
        });

        gsap.to('.shape--cube', {
          y: -16,
          duration: 4,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1
        });

        gsap.to('.shape--diamond', {
          rotation: '+=360',
          duration: 13,
          ease: 'none',
          repeat: -1
        });

        gsap.to('.shape--diamond', {
          x: 18,
          duration: 5,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1
        });

        gsap.to('.shape--orb', {
          y: -24,
          scale: 1.16,
          duration: 6.5,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1
        });

        gsap.to('.shape--grid', {
          rotationZ: 360,
          duration: 18,
          ease: 'none',
          repeat: -1
        });

        gsap.to('.orbit-label--tl, .orbit-label--br', {
          y: -10,
          opacity: 0.88,
          duration: 2.8,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true
        });

        gsap.to('.orbit-label--tr, .orbit-label--bl', {
          y: 10,
          opacity: 0.65,
          duration: 3.2,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true
        });

        gsap.to('.hero-copy--center', {
          y: -8,
          duration: 4.5,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1
        });
      }

      gsap.utils.toArray<HTMLElement>('[data-gsap="reveal-header"]').forEach((header) => {
        gsap.from(header, {
          y: 40,
          opacity: 0,
          duration: 0.7,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: header,
            start: 'top 80%'
          }
        });
      });

      gsap.utils.toArray<HTMLElement>('[data-gsap="service-card"]').forEach((card, index) => {
        gsap.from(card, {
          y: 50,
          opacity: 0,
          duration: 0.65,
          ease: 'power2.out',
          delay: index * 0.04,
          scrollTrigger: {
            trigger: card,
            start: 'top 86%'
          }
        });
      });

      gsap.utils.toArray<HTMLElement>('[data-gsap="work-item"]').forEach((item, index) => {
        gsap.from(item, {
          y: 48,
          opacity: 0,
          duration: 0.6,
          delay: index * 0.035,
          scrollTrigger: {
            trigger: item,
            start: 'top 88%'
          }
        });
      });

      gsap.from('[data-gsap="contact-left"]', {
        x: -30,
        opacity: 0,
        duration: 0.65,
        scrollTrigger: {
          trigger: '#contact',
          start: 'top 76%'
        }
      });

      gsap.from('[data-gsap="contact-right"]', {
        x: 30,
        opacity: 0,
        duration: 0.65,
        scrollTrigger: {
          trigger: '#contact',
          start: 'top 76%'
        }
      });

      gsap.to('.glow-a', {
        yPercent: 25,
        xPercent: 12,
        ...(isLanding
          ? { duration: 9, yoyo: true, repeat: -1, ease: 'sine.inOut' }
          : {
              ease: 'none',
              scrollTrigger: {
                trigger: 'body',
                start: 'top top',
                end: 'bottom bottom',
                scrub: 0.8
              }
            })
      });

      gsap.to('.glow-b', {
        yPercent: -18,
        xPercent: -8,
        ...(isLanding
          ? { duration: 7.5, yoyo: true, repeat: -1, ease: 'sine.inOut' }
          : {
              ease: 'none',
              scrollTrigger: {
                trigger: 'body',
                start: 'top top',
                end: 'bottom bottom',
                scrub: 0.9
              }
            })
      });

      delayedCalls.push(
        gsap.delayedCall(0, () => {
          ScrollTrigger.refresh();
        })
      );

      cleanup = () => {
        delayedCalls.forEach((call) => call.kill());
        ScrollTrigger.getAll().forEach((trigger: { kill: () => void }) => trigger.kill());
      };
    };

    void run();

    return () => {
      isActive = false;
      cleanup?.();
    };
  }, [page]);
}
