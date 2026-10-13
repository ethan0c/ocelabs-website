import type { Point } from '@/lib/dashboard';
import { usd } from '@/lib/pricing';

/*
 * The dashboard's charts, drawn as SVG on the server. One series each, in
 * the text colour: the current period in full, the rest lighter. Values sit
 * on the marks that matter (the last and the largest), show on hover for the
 * rest, and are in a table under every chart for anyone who wants them all.
 */

const W = 360;

/** 1,284 → 1.3K, 12,900 → 13K. Chart labels only; the tables print the full number. */
export function compact(n: number, money = false) {
  const s = n >= 10000 ? `${Math.round(n / 1000)}K` : n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, '')}K` : String(n);
  return money ? `$${s}` : s;
}

const full = (n: number, money?: boolean) => (money ? usd.format(n) : String(n));

function Table({ rows, money }: { rows: Point[]; money?: boolean }) {
  return (
    <details className="chart-table">
      <summary>As a table</summary>
      <table>
        <tbody>
          {rows.map((r) => (
            <tr key={r.key}>
              <th scope="row">{r.label}</th>
              <td>{full(r.value, money)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </details>
  );
}

/** A rectangle grown from a baseline with the far end rounded, as a path. */
function roundedBar(x: number, y: number, w: number, h: number, up: boolean) {
  const r = Math.min(4, up ? h : w);
  return up
    ? `M${x} ${y + h} v${-(h - r)} a${r} ${r} 0 0 1 ${r} ${-r} h${w - 2 * r} a${r} ${r} 0 0 1 ${r} ${r} v${h - r} z`
    : `M${x} ${y} h${w - r} a${r} ${r} 0 0 1 ${r} ${r} v${h - 2 * r} a${r} ${r} 0 0 1 ${-r} ${r} h${-(w - r)} z`;
}

/** Columns over time. The last point is the current period and is drawn in full. */
export function Columns({ title, points, money }: { title: string; points: Point[]; money?: boolean }) {
  const H = 150;
  const top = 18;
  const bottom = 22;
  const plotH = H - top - bottom;
  const base = H - bottom;
  const max = Math.max(1, ...points.map((p) => p.value));
  const slot = W / points.length;
  const bw = Math.min(24, slot - 4);
  const last = points.length - 1;
  const biggest = points.findIndex((p) => p.value === max);

  return (
    <figure className="chart">
      <figcaption className="eyebrow">{title}</figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${title}, by month`}>
        <line className="chart-base" x1={0} x2={W} y1={base} y2={base} />
        {points.map((p, i) => {
          const x = i * slot + (slot - bw) / 2;
          const h = (p.value / max) * plotH;
          const labelled = p.value > 0 && (i === last || i === biggest);
          return (
            <g key={p.key}>
              <title>{`${p.label}: ${full(p.value, money)}`}</title>
              {/* The whole slot is the hover target, not just the bar. */}
              <rect x={i * slot} y={top} width={slot} height={plotH} fill="transparent" />
              {h > 0 && <path className="chart-bar" d={roundedBar(x, base - h, bw, h, true)} data-current={i === last || undefined} />}
              {labelled && (
                <text className="chart-val" x={x + bw / 2} y={base - h - 5} textAnchor="middle">
                  {compact(p.value, money)}
                </text>
              )}
              <text className="chart-tick" x={x + bw / 2} y={H - 6} textAnchor="middle">
                {p.label}
              </text>
            </g>
          );
        })}
      </svg>
      <Table rows={points} money={money} />
    </figure>
  );
}

/** Horizontal bars, one per category, in the order given. Every non-zero bar carries its value. */
export function Bars({ title, rows }: { title: string; rows: Point[] }) {
  const rowH = 22;
  const bh = 12;
  const labelW = 104;
  const H = rows.length * rowH;
  const plotW = W - labelW - 36;
  const max = Math.max(1, ...rows.map((r) => r.value));

  return (
    <figure className="chart">
      <figcaption className="eyebrow">{title}</figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={title}>
        <line className="chart-base" x1={labelW} x2={labelW} y1={0} y2={H} />
        {rows.map((r, i) => {
          const y = i * rowH + (rowH - bh) / 2;
          const w = (r.value / max) * plotW;
          return (
            <g key={r.key}>
              <title>{`${r.label}: ${r.value}`}</title>
              <rect x={0} y={i * rowH} width={W} height={rowH} fill="transparent" />
              <text className="chart-tick" x={labelW - 8} y={y + bh - 2} textAnchor="end">
                {r.label}
              </text>
              {w > 0 && <path className="chart-bar" d={roundedBar(labelW, y, w, bh, false)} />}
              {r.value > 0 && (
                <text className="chart-val" x={labelW + w + 6} y={y + bh - 2}>
                  {r.value}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <Table rows={rows} />
    </figure>
  );
}
