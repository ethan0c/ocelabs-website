'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

type Props = {
  name: string;
  /** Poster image in /public/work. */
  shot: string;
  /** Optional loop in /public/work. Absent = still only. */
  clip?: string;
  priority?: boolean;
};

/**
 * Shows the still until the visitor shows interest, then plays the loop over it.
 *
 * Pointer devices trigger on hover. Touch devices have no hover, so the clip
 * arms when the card scrolls into view instead. Either way the video element
 * is only mounted once armed — nothing downloads on first paint.
 */
export default function WorkPreview({ name, shot, clip, priority }: Props) {
  const [armed, setArmed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Touch/coarse pointers: arm when mostly on screen.
  useEffect(() => {
    if (!clip || armed) return;
    if (window.matchMedia('(hover: hover)').matches) return;

    const el = wrapRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setArmed(true);
          io.disconnect();
        }
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [clip, armed]);

  const enter = () => {
    if (!clip) return;
    setArmed(true);
    const v = videoRef.current;
    if (v) void v.play().catch(() => {});
  };

  const leave = () => {
    const v = videoRef.current;
    if (!v) return;
    v.pause();
    v.currentTime = 0;
    setPlaying(false);
  };

  return (
    <div
      ref={wrapRef}
      className="work-shot"
      onMouseEnter={enter}
      onMouseLeave={leave}
      data-playing={playing}
    >
      <Image
        src={`/work/${shot}`}
        alt={`${name} screenshot`}
        width={1200}
        height={750}
        sizes="(max-width: 68rem) 100vw, 64rem"
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
          preload="auto"
          autoPlay
          aria-hidden="true"
          tabIndex={-1}
          onPlaying={() => setPlaying(true)}
        />
      )}
    </div>
  );
}
