import { useId } from 'react';
import { LOCKUP_WIDTH, LOGO_SIZE, MARK_PATH, WORDMARK_PATH } from '@/lib/logo';

type LogoProps = {
  /** Height in px — the disc's diameter. The lettering scales with it. */
  size?: number;
  /** Render the mark alone — for favicons, app icons, tight corners. */
  glyphOnly?: boolean;
  /**
   * Fill with the brushed-metal sweep instead of currentColor.
   * Off by default so the favicon and any monochrome context stay flat.
   */
  metal?: boolean;
  className?: string;
};

/**
 * OCE Labs logo.
 *
 * The mark is a disc cut into three bands with the middle one stopped short:
 * an O in outline, a C in the opening, an E in the bands. Mark and lettering
 * are one drawing (see lib/logo.ts), so they scale together and never depend
 * on a font having loaded. currentColor throughout — no theme branching.
 */
export default function Logo({
  size = 18,
  glyphOnly = false,
  metal = false,
  className,
}: LogoProps) {
  // Two instances of the logo (nav and footer) would otherwise collide on a
  // hardcoded gradient id, and the second would inherit the first's stops.
  const gid = `metal-${useId().replace(/:/g, '')}`;
  const width = glyphOnly ? LOGO_SIZE : LOCKUP_WIDTH;

  return (
    <span className={className}>
      <svg
        width={(size * width) / LOGO_SIZE}
        height={size}
        viewBox={`0 0 ${width} ${LOGO_SIZE}`}
        fill={metal ? `url(#${gid})` : 'currentColor'}
        role="img"
        aria-label="OCE Labs"
        style={{ display: 'block', flexShrink: 0 }}
        // Marks the stops as themeable — see .logo-metal in globals.css.
        className={metal ? 'logo-metal' : undefined}
      >
        {metal && (
          <defs>
            {/*
              Mirrors --metal: same banded sweep, expressed in gradient space.
              x1/y1→x2/y2 approximates 105deg over a square viewBox. The stop
              colours are set in CSS so light and dark themes can diverge.
            */}
            <linearGradient id={gid} x1="0" y1="0.13" x2="1" y2="0.87">
              <stop className="ms ms-0" offset="0%" />
              <stop className="ms ms-1" offset="18%" />
              <stop className="ms ms-2" offset="34%" />
              <stop className="ms ms-3" offset="50%" />
              <stop className="ms ms-2" offset="66%" />
              <stop className="ms ms-4" offset="82%" />
              <stop className="ms ms-0" offset="100%" />
            </linearGradient>
          </defs>
        )}
        <path d={MARK_PATH} />
        {!glyphOnly && <path d={WORDMARK_PATH} />}
      </svg>
    </span>
  );
}
