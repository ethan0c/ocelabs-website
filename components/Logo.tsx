type LogoProps = {
  /** Height of the glyph in px. The wordmark scales from the nav's own type size. */
  size?: number;
  /** Render the glyph alone — for favicons, app icons, tight corners. */
  glyphOnly?: boolean;
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
export default function Logo({ size = 14, glyphOnly = false, className }: LogoProps) {
  const glyph = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden={!glyphOnly}
      role={glyphOnly ? 'img' : undefined}
      aria-label={glyphOnly ? 'OCE LABS' : undefined}
      style={{ display: 'block', flexShrink: 0 }}
    >
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
      <span>OCE LABS</span>
    </span>
  );
}
