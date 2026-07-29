'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';

type Props = {
  name: string;
  /** Poster image in /public/work. */
  shot: string;
  /** Optional loop in /public/work. Absent = still only. */
  clip?: string;
  priority?: boolean;
  /** Width hint for the srcset, since items are no longer all full-bleed. */
  sizes?: string;
};

/**
 * Shows the still until the visitor shows interest, then plays the loop over it.
 *
 * Intent is an explicit signal only — hover or keyboard focus. Touch gets the
 * still and nothing else: arming on scroll downloaded a clip per project over
 * cellular just for scrolling past, and arming on tap fights the link the card
 * wraps. The dot cue is CSS-only, so it costs touch users nothing.
 */
export default function WorkPreview({ name, shot, clip, priority, sizes }: Props) {
  const [armed, setArmed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hostRef = useRef<HTMLDivElement | null>(null);

  const start = useCallback(() => {
    if (!clip) return;
    setArmed(true);
    const v = videoRef.current;
    // Already mounted from an earlier hover — rewind so the loop reads as a
    // fresh start, then play. On first hover the element does not exist yet and
    // autoPlay covers it.
    if (v) {
      v.currentTime = 0;
      void v.play().catch(() => {});
    }
  }, [clip]);

  const stop = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.pause();
    v.currentTime = 0;
    // Drop back to the still. The element stays mounted so the file is cached.
    setPlaying(false);
  }, []);

  // A loop left running off-screen or in a hidden tab burns decode work for
  // nobody. Pointer-leave covers the desktop case; these cover the rest —
  // scrolling away mid-hover, switching tabs, or a tap-armed clip on touch.
  useEffect(() => {
    if (!armed) return;

    const onHidden = () => {
      if (document.hidden) stop();
    };
    document.addEventListener('visibilitychange', onHidden);

    const host = hostRef.current;
    const io = host
      ? new IntersectionObserver(
          ([entry]) => {
            if (!entry.isIntersecting) stop();
          },
          { threshold: 0.15 },
        )
      : null;
    io?.observe(host!);

    return () => {
      document.removeEventListener('visibilitychange', onHidden);
      io?.disconnect();
    };
  }, [armed, stop]);

  return (
    <div
      ref={hostRef}
      className="work-shot"
      data-playing={playing}
      data-has-clip={Boolean(clip)}
      onMouseEnter={start}
      onMouseLeave={stop}
      // Keyboard parity: tabbing to the card should preview it too. Focus lands
      // on the <a> ancestor, and native focus/blur don't bubble — but React
      // routes onFocus/onBlur through focusin/focusout, which do.
      onFocus={start}
      onBlur={stop}
    >
      <Image
        src={`/work/${shot}`}
        alt={`${name} screenshot`}
        width={1200}
        height={900}
        sizes={sizes ?? '(max-width: 68rem) 100vw, 64rem'}
        priority={priority}
      />

      {clip && armed && (
        <video
          ref={videoRef}
          className="work-clip"
          src={`/work/${clip}`}
          muted
          loop
          playsInline
          preload="none"
          autoPlay
          aria-hidden="true"
          tabIndex={-1}
          onPlaying={() => setPlaying(true)}
        />
      )}
    </div>
  );
}
