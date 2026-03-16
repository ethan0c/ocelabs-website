'use client';

import { useEffect, useRef } from 'react';

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) {
      return;
    }

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) {
      return;
    }

    let mouseX = -200;
    let mouseY = -200;
    let ringX = -200;
    let ringY = -200;
    let hasMoved = false;
    let rafId: number;

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!hasMoved) {
        hasMoved = true;
        ringX = mouseX;
        ringY = mouseY;
        dot.style.opacity = '1';
        ring.style.opacity = '1';
      }
    };

    const tick = () => {
      ringX += (mouseX - ringX) * 0.13;
      ringY += (mouseY - ringY) * 0.13;
      dot.style.transform = `translate(${mouseX}px,${mouseY}px) translate(-50%,-50%)`;
      ring.style.transform = `translate(${ringX}px,${ringY}px) translate(-50%,-50%)`;
      rafId = requestAnimationFrame(tick);
    };

    const onOver = (e: MouseEvent) => {
      if ((e.target as Element).closest('a,button,[role="button"],input,select,textarea,label')) {
        dot.dataset.hover = '1';
        ring.dataset.hover = '1';
      }
    };

    const onOut = (e: MouseEvent) => {
      const rel = e.relatedTarget as Element | null;
      if (!rel?.closest('a,button,[role="button"],input,select,textarea,label')) {
        delete dot.dataset.hover;
        delete ring.dataset.hover;
      }
    };

    window.addEventListener('mousemove', onMove);
    document.addEventListener('mouseover', onOver);
    document.addEventListener('mouseout', onOut);
    rafId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover', onOver);
      document.removeEventListener('mouseout', onOut);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <>
      <div className="cursor-dot" ref={dotRef} aria-hidden="true" />
      <div className="cursor-ring" ref={ringRef} aria-hidden="true" />
    </>
  );
}
