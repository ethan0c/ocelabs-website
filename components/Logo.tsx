import { useId } from 'react';

type LogoProps = {
  /** Height of the glyph in px. The wordmark scales from the nav's own type size. */
  size?: number;
  /** Render the glyph alone — for favicons, app icons, tight corners. */
  glyphOnly?: boolean;
  /**
   * Stroke the glyph with the brushed-metal sweep instead of currentColor.
   * Off by default so the favicon and any monochrome context stay flat.
   */
  metal?: boolean;
  className?: string;
};

/**
 * OCE LABS mark.
 *
 * The glyph is an aperture: a ring interrupted at 3 o'clock, with the gap
 * closed by a single radial tick. Stroke weight matches the site hairline,
 * so at nav scale it reads as part of the same drawing as the rules and
 * the theme toggle. currentColor throughout — no theme branching.
 */
export default function Logo({
  size = 14,
  glyphOnly = false,
  metal = false,
  className,
}: LogoProps) {
  // Two instances of the mark (nav and footer) would otherwise collide on a
  // hardcoded gradient id, and the second would inherit the first's stops.
  const gid = `metal-${useId().replace(/:/g, '')}`;

  const glyph = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={metal ? `url(#${gid})` : 'currentColor'}
      strokeWidth="1.5"
      aria-hidden={!glyphOnly}
      role={glyphOnly ? 'img' : undefined}
      aria-label={glyphOnly ? 'OCE LABS' : undefined}
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
      {/* Aperture: ring open at 3 o'clock, 42° of arc removed. */}
      <path d="M20.6 8.4A10 10 0 1 0 20.6 15.6" strokeLinecap="butt" />
      {/* The stop: one radial tick bridging the gap. */}
      <path d="M14 12h8" strokeLinecap="butt" />
    </svg>
  );

  if (glyphOnly) return <span className={className}>{glyph}</span>;

  return (
    <span className={className} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.55em' }}>
      {glyph}
      <span className={metal ? 'wordmark-text' : undefined}>OCE LABS</span>
    </span>
  );
}
