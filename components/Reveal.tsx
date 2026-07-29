'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

type RevealProps = {
  children: React.ReactNode;
  /** Stagger direct children instead of moving the wrapper as one block. */
  stagger?: boolean;
  /** Seconds to hold before starting. Use for above-the-fold sequencing. */
  delay?: number;
  /** Skip ScrollTrigger and play immediately — for content already in view on load. */
  immediate?: boolean;
  /** Travel distance in px. */
  y?: number;
  as?: 'div' | 'section' | 'header' | 'ul';
  className?: string;
};

/**
 * Fade-and-rise on scroll entry.
 *
 * The hidden state is set in the same effect that builds the tween rather than
 * in CSS, so content stays visible if JS never runs. gsap.context() scopes the
 * selector and gives one-call cleanup on unmount.
 */
export default function Reveal({
  children,
  stagger = false,
  delay = 0,
  immediate = false,
  y = 18,
  as: Tag = 'div',
  className,
}: RevealProps) {
  const scope = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scope.current;
    if (!el) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      const targets = stagger ? Array.from(el.children) : el;
      if (stagger && !el.children.length) return;

      gsap.set(targets, { opacity: 0, y });

      gsap.to(targets, {
        opacity: 1,
        y: 0,
        duration: 0.9,
        delay,
        ease: 'expo.out',
        stagger: stagger ? 0.08 : 0,
        // force3D keeps the transform on the compositor for the whole tween.
        force3D: true,
        // clearProps hands styling back to CSS so hover states aren't fighting
        // an inline transform left behind by GSAP.
        clearProps: 'opacity,transform',
        ...(immediate
          ? {}
          : {
              scrollTrigger: {
                trigger: el,
                start: 'top 88%',
                once: true,
              },
            }),
      });
    }, scope);

    return () => ctx.revert();
  }, [stagger, delay, immediate, y]);

  return (
    <Tag ref={scope as React.Ref<never>} className={className}>
      {children}
    </Tag>
  );
}
