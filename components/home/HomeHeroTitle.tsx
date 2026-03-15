'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

const titleSets = [
  ['BUILD BOLD', 'DIGITAL WORLDS', 'THAT MOVE.'],
  ['LAUNCH FASTER', 'LOOK SHARPER', 'SCALE CLEAN.'],
  ['CRAFT MOTION', 'SHIP PRODUCTS', 'OWN ATTENTION.'],
  ['CREATE IMPACT', 'DESIGN SYSTEMS', 'CODE FEARLESS.']
];

export default function HomeHeroTitle() {
  const [currentSet, setCurrentSet] = useState(0);
  const lineRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const currentSetRef = useRef(0);

  const lines = useMemo(() => titleSets[currentSet], [currentSet]);

  useEffect(() => {
    let active = true;
    let killDelayedCall: (() => void) | undefined;

    const run = async () => {
      const mod = await import('gsap');
      if (!active) {
        return;
      }

      const gsap = mod.gsap || mod.default;
      if (!gsap) {
        return;
      }

      const swap = () => {
        const elements = lineRefs.current.filter(Boolean) as HTMLSpanElement[];
        if (!elements.length) {
          return;
        }

        const nextSet = (currentSetRef.current + 1) % titleSets.length;

        gsap
          .timeline()
          .to(elements, {
            opacity: 0,
            filter: 'blur(8px)',
            y: -10,
            stagger: 0.035,
            duration: 0.22,
            ease: 'power2.in',
            onComplete: () => {
              currentSetRef.current = nextSet;
              setCurrentSet(nextSet);
              requestAnimationFrame(() => {
                const nextElements = lineRefs.current.filter(Boolean) as HTMLSpanElement[];
                gsap.fromTo(
                  nextElements,
                  { opacity: 0, filter: 'blur(8px)', y: 10 },
                  {
                    opacity: 1,
                    filter: 'blur(0px)',
                    y: 0,
                    stagger: 0.05,
                    duration: 0.38,
                    ease: 'power3.out'
                  }
                );
              });
            }
          });

        const delayed = gsap.delayedCall(15, swap);
        killDelayedCall = () => delayed.kill();
      };

      const delayed = gsap.delayedCall(15, swap);
      killDelayedCall = () => delayed.kill();
    };

    void run();

    return () => {
      active = false;
      killDelayedCall?.();
    };
  }, []);

  return (
    <h1 className="hero-title">
      <span className="title-line" data-title-slot="0" ref={(el) => { lineRefs.current[0] = el; }}>
        {lines[0]}
      </span>
      <span className="title-line accent" data-title-slot="1" ref={(el) => { lineRefs.current[1] = el; }}>
        {lines[1]}
      </span>
      <span className="title-line" data-title-slot="2" ref={(el) => { lineRefs.current[2] = el; }}>
        {lines[2]}
      </span>
    </h1>
  );
}
