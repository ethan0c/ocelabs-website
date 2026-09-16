'use client';

import { useMemo, useState } from 'react';

/* ──────────────────────────────────────────────────────────────────────────
   Price book. Edit numbers here; nothing below depends on specific values.
   ────────────────────────────────────────────────────────────────────────── */

type Kind = 'website' | 'brand' | 'webapp' | 'mobile';

const PACKAGES: Record<
  Kind,
  {
    label: string;
    base: number;
    pages: number;
    extraPage: number;
    blurb: string;
    /** Calendar weeks from kickoff, low and high. */
    weeks: [number, number];
  }
> = {
  website: {
    label: 'Website Package',
    base: 3000,
    pages: 5,
    extraPage: 350,
    blurb: 'Custom site, up to five pages, full setup.',
    weeks: [4, 6],
  },
  brand: {
    label: 'Brand Website Package',
    base: 6000,
    pages: 10,
    extraPage: 450,
    blurb: 'Art direction, motion, video, up to ten pages.',
    weeks: [6, 10],
  },
  webapp: {
    label: 'Web App with Dashboard',
    base: 12000,
    pages: 10,
    extraPage: 450,
    blurb: 'Accounts, CMS, dashboard, integrations.',
    weeks: [10, 16],
  },
  mobile: {
    label: 'Mobile App',
    base: 25000,
    pages: 0,
    extraPage: 0,
    blurb: 'iOS and Android from one codebase, plus marketing site.',
    weeks: [16, 26],
  },
};

/** Each additional site or app adds this many weeks to both ends. */
const WEEKS_PER_EXTRA_PROJECT = 2;

/** Days after kickoff by which missing assets must arrive or launch slips. */
const CONTENT_DEADLINE_DAYS = 7;

type Addon = {
  id: string;
  label: string;
  price: number;
  /** Charged per unit when set; the UI shows a count instead of a checkbox. */
  unit?: string;
  /** Packages that already include this. Shown as "Included", costs nothing. */
  includedIn?: Kind[];
  /** Packages this does not apply to. Hidden. */
  not?: Kind[];
  group: 'Content & brand' | 'Features' | 'Product' | 'Search & reach';
};

const ADDONS: Addon[] = [
  // Content & brand
  { id: 'copy', label: 'Copywriting', price: 600, unit: 'per 5 pages', group: 'Content & brand' },
  { id: 'logo', label: 'Logo and identity', price: 1200, group: 'Content & brand' },
  { id: 'imagery', label: 'Image sourcing and art direction', price: 400, includedIn: ['brand', 'webapp'], group: 'Content & brand' },
  { id: 'motion', label: 'Motion and custom interactions', price: 1500, includedIn: ['brand', 'webapp'], not: ['mobile'], group: 'Content & brand' },
  { id: 'video', label: 'Video hero or showreel', price: 500, not: ['mobile'], group: 'Content & brand' },
  { id: 'themes', label: 'Light and dark themes', price: 300, includedIn: ['brand', 'webapp'], group: 'Content & brand' },

  // Features
  { id: 'cms', label: 'Blog or content system', price: 1500, includedIn: ['webapp', 'mobile'], group: 'Features' },
  { id: 'booking', label: 'Booking and scheduling', price: 800, group: 'Features' },
  { id: 'newsletter', label: 'Newsletter signup and automation', price: 300, group: 'Features' },
  { id: 'payments', label: 'Payments or simple e-commerce', price: 2500, group: 'Features' },
  { id: 'shop', label: 'Full store with inventory', price: 5000, not: ['mobile'], group: 'Features' },
  { id: 'i18n', label: 'Additional language', price: 1000, unit: 'per language', group: 'Features' },
  { id: 'integration', label: 'Third-party integration (CRM, calendar, email)', price: 600, unit: 'each', group: 'Features' },
  { id: 'forms', label: 'Advanced forms (multi-step, uploads, quotes)', price: 500, group: 'Features' },

  // Product
  { id: 'accounts', label: 'User accounts and login', price: 2500, includedIn: ['webapp', 'mobile'], not: ['website'], group: 'Product' },
  { id: 'dashboard', label: 'Admin dashboard', price: 3000, includedIn: ['webapp', 'mobile'], not: ['website'], group: 'Product' },
  { id: 'customerportal', label: 'Customer portal (orders, documents, billing)', price: 3500, not: ['website', 'brand'], group: 'Product' },
  { id: 'push', label: 'Push notifications', price: 800, includedIn: ['mobile'], not: ['website', 'brand', 'webapp'], group: 'Product' },
  { id: 'offline', label: 'Offline mode and sync', price: 2500, not: ['website', 'brand', 'webapp'], group: 'Product' },
  { id: 'ai', label: 'AI feature (chat, recommendations, generation)', price: 4000, not: ['website'], group: 'Product' },
  { id: 'api', label: 'Public API for partners', price: 3000, not: ['website', 'brand'], group: 'Product' },

  // Search & reach
  { id: 'localseo', label: 'Local SEO (Business Profile, citations, location pages)', price: 800, group: 'Search & reach' },
  { id: 'contentplan', label: 'Keyword research and content plan', price: 700, group: 'Search & reach' },
  { id: 'migration', label: 'Migration with redirects from an existing site', price: 600, group: 'Search & reach' },
  { id: 'a11y', label: 'Accessibility audit and fixes', price: 500, group: 'Search & reach' },
  { id: 'reporting', label: 'Monthly analytics report setup', price: 400, group: 'Search & reach' },
];

const GROUPS = ['Content & brand', 'Features', 'Product', 'Search & reach'] as const;

/** A second site or app on the same engagement, priced as a share of the base. */
const EXTRA_PROJECT_SHARE = 0.6;

/** Bulk discount on the whole subtotal, by number of sites or apps. */
const BULK = [
  { min: 2, pct: 10 },
  { min: 3, pct: 15 },
  { min: 5, pct: 20 },
];

const DISCOUNTS = [
  { id: 'friends', label: 'Friends and family', pct: 20 },
  { id: 'nonprofit', label: 'Nonprofit', pct: 15 },
  { id: 'referral', label: 'Referral', pct: 10 },
  { id: 'firstclient', label: 'Launch client (testimonial in exchange)', pct: 10 },
];

/** Discounts add together but never exceed this. */
const DISCOUNT_CAP = 50;

const RUSH = [
  { id: 'none', label: 'Standard timeline', pct: 0, weeks: null as [number, number] | null },
  { id: 'fast', label: 'Under 3 weeks', pct: 25, weeks: [2, 3] as [number, number] },
  { id: 'urgent', label: 'Under 10 days', pct: 50, weeks: [1, 2] as [number, number] },
];

const RETAINERS = [
  { id: 'none', label: 'No retainer', monthly: 0 },
  { id: 'basic', label: 'Basic: updates and monitoring', monthly: 300 },
  { id: 'standard', label: 'Standard: plus quarterly SEO review', monthly: 600 },
  { id: 'priority', label: 'Priority: same-day response, ongoing work', monthly: 1200 },
];

const DEPOSIT_PCT = 50;

/* ────────────────────────────────────────────────────────────────────────── */

const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

type Line = { label: string; amount: number };

function weeksLabel([lo, hi]: [number, number]) {
  // Past three months, weeks stop meaning much; say months.
  if (lo >= 13) return `${Math.round(lo / 4.33)} to ${Math.round(hi / 4.33)} months`;
  return `${lo} to ${hi} weeks`;
}

export default function Estimator() {
  const [kind, setKind] = useState<Kind>('website');
  const [pages, setPages] = useState(5);
  const [projects, setProjects] = useState(1);
  const [qty, setQty] = useState<Record<string, number>>({});
  const [discounts, setDiscounts] = useState<Record<string, boolean>>({});
  const [customPct, setCustomPct] = useState(0);
  const [rush, setRush] = useState('none');
  const [retainer, setRetainer] = useState('none');
  const [client, setClient] = useState('');
  const [notes, setNotes] = useState('');
  const [copied, setCopied] = useState(false);

  const pkg = PACKAGES[kind];

  const visible = ADDONS.filter((a) => !a.not?.includes(kind));

  const est = useMemo(() => {
    const lines: Line[] = [{ label: pkg.label, amount: pkg.base }];

    const extraPages = Math.max(0, pages - pkg.pages);
    if (pkg.pages > 0 && extraPages > 0) {
      lines.push({
        label: `${extraPages} extra page${extraPages === 1 ? '' : 's'}`,
        amount: extraPages * pkg.extraPage,
      });
    }

    for (const a of visible) {
      const n = qty[a.id] ?? 0;
      if (n <= 0 || a.includedIn?.includes(kind)) continue;
      lines.push({
        label: a.unit ? `${a.label} × ${n}` : a.label,
        amount: a.price * n,
      });
    }

    const perProject = lines.reduce((s, l) => s + l.amount, 0);
    const extraProjects = Math.max(0, projects - 1);
    if (extraProjects > 0) {
      lines.push({
        label: `${extraProjects} additional site${extraProjects === 1 ? '' : 's'} or app${extraProjects === 1 ? '' : 's'} at ${Math.round(EXTRA_PROJECT_SHARE * 100)}%`,
        amount: Math.round(perProject * EXTRA_PROJECT_SHARE * extraProjects),
      });
    }

    const subtotal = lines.reduce((s, l) => s + l.amount, 0);

    const rushOpt = RUSH.find((r) => r.id === rush) ?? RUSH[0];
    const rushPct = rushOpt.pct;
    const rushAmt = Math.round(subtotal * (rushPct / 100));

    // Rush overrides the package timeline; otherwise extra projects extend it.
    const weeks: [number, number] = rushOpt.weeks ?? [
      pkg.weeks[0] + extraProjects * WEEKS_PER_EXTRA_PROJECT,
      pkg.weeks[1] + extraProjects * WEEKS_PER_EXTRA_PROJECT,
    ];

    const bulkPct = BULK.filter((b) => projects >= b.min).map((b) => b.pct).pop() ?? 0;
    const chosen = DISCOUNTS.filter((d) => discounts[d.id]);
    const rawPct = bulkPct + chosen.reduce((s, d) => s + d.pct, 0) + customPct;
    const pct = Math.min(DISCOUNT_CAP, Math.max(0, rawPct));
    const discountAmt = Math.round((subtotal + rushAmt) * (pct / 100));

    const total = subtotal + rushAmt - discountAmt;
    const monthly = RETAINERS.find((r) => r.id === retainer)?.monthly ?? 0;

    const discountLabels = [
      ...(bulkPct ? [`Bulk (${projects} projects) ${bulkPct}%`] : []),
      ...chosen.map((d) => `${d.label} ${d.pct}%`),
      ...(customPct ? [`Custom ${customPct}%`] : []),
    ];

    return {
      lines,
      subtotal,
      rushPct,
      rushAmt,
      pct,
      capped: rawPct > DISCOUNT_CAP,
      discountAmt,
      discountLabels,
      total,
      deposit: Math.round(total * (DEPOSIT_PCT / 100)),
      monthly,
      // Quoted as a range so the fixed price can land above the estimate
      // once the questionnaire surfaces scope the call didn't.
      low: Math.round(total / 100) * 100,
      high: Math.round((total * 1.15) / 100) * 100,
      weeks,
    };
  }, [pkg, pages, visible, qty, kind, projects, rush, discounts, customPct, retainer]);

  const setCount = (id: string, n: number) =>
    setQty((q) => ({ ...q, [id]: Math.max(0, Math.floor(n)) }));

  const summaryText = () => {
    const rows = [
      `OCE Labs estimate${client ? ` — ${client}` : ''}`,
      '',
      ...est.lines.map((l) => `${l.label}: ${usd.format(l.amount)}`),
      `Subtotal: ${usd.format(est.subtotal)}`,
      ...(est.rushAmt ? [`Rush (${est.rushPct}%): ${usd.format(est.rushAmt)}`] : []),
      ...(est.discountAmt
        ? [`Discount (${est.discountLabels.join(', ')}): -${usd.format(est.discountAmt)}`]
        : []),
      `Total: ${usd.format(est.total)}`,
      `Quote range: ${usd.format(est.low)} to ${usd.format(est.high)}`,
      `Deposit (${DEPOSIT_PCT}%): ${usd.format(est.deposit)}`,
      ...(est.monthly ? [`Retainer: ${usd.format(est.monthly)} per month`] : []),
      '',
      `Timeline: ${weeksLabel(est.weeks)} from kickoff`,
      `Kickoff: deposit paid, questionnaire returned, logo and brand files, existing copy shared`,
      `Content deadline: ${CONTENT_DEADLINE_DAYS} days after kickoff; anything later moves launch by the same number of days`,
      ...(notes.trim() ? ['', 'Notes:', notes.trim()] : []),
    ];
    return rows.join('\n');
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(summaryText());
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* Clipboard blocked; the summary is still on screen. */
    }
  };

  return (
    <div className="est">
      <div className="est-form">
        {/* Package */}
        <fieldset className="est-block">
          <legend className="est-legend">Package</legend>
          {(Object.keys(PACKAGES) as Kind[]).map((k) => (
            <label key={k} className="est-row" data-on={kind === k || undefined}>
              <input
                type="radio"
                name="kind"
                value={k}
                checked={kind === k}
                onChange={() => {
                  setKind(k);
                  setPages(PACKAGES[k].pages);
                }}
              />
              <span className="est-row-main">
                <span className="est-row-label">{PACKAGES[k].label}</span>
                <span className="est-row-note">{PACKAGES[k].blurb}</span>
              </span>
              <span className="est-row-price">{usd.format(PACKAGES[k].base)}</span>
            </label>
          ))}
        </fieldset>

        {/* Scope */}
        <fieldset className="est-block">
          <legend className="est-legend">Scope</legend>
          {pkg.pages > 0 && (
            <div className="est-row est-row--input">
              <span className="est-row-main">
                <span className="est-row-label">Pages</span>
                <span className="est-row-note">
                  {pkg.pages} included, then {usd.format(pkg.extraPage)} each
                </span>
              </span>
              <input
                type="number"
                min={1}
                value={pages}
                onChange={(e) => setPages(Math.max(1, Number(e.target.value) || 1))}
                className="est-num"
              />
            </div>
          )}
          <div className="est-row est-row--input">
            <span className="est-row-main">
              <span className="est-row-label">Sites or apps on this engagement</span>
              <span className="est-row-note">
                Each additional one at {Math.round(EXTRA_PROJECT_SHARE * 100)}% of the first.
                Bulk discount applies from two.
              </span>
            </span>
            <input
              type="number"
              min={1}
              value={projects}
              onChange={(e) => setProjects(Math.max(1, Number(e.target.value) || 1))}
              className="est-num"
            />
          </div>
        </fieldset>

        {/* Add-ons by group */}
        {GROUPS.map((g) => {
          const items = visible.filter((a) => a.group === g);
          if (!items.length) return null;
          return (
            <fieldset key={g} className="est-block">
              <legend className="est-legend">{g}</legend>
              {items.map((a) => {
                const included = a.includedIn?.includes(kind);
                const n = qty[a.id] ?? 0;
                if (a.unit && !included) {
                  return (
                    <div key={a.id} className="est-row est-row--input" data-on={n > 0 || undefined}>
                      <span className="est-row-main">
                        <span className="est-row-label">{a.label}</span>
                        <span className="est-row-note">
                          {usd.format(a.price)} {a.unit}
                        </span>
                      </span>
                      <input
                        type="number"
                        min={0}
                        value={n}
                        onChange={(e) => setCount(a.id, Number(e.target.value) || 0)}
                        className="est-num"
                        aria-label={`${a.label} count`}
                      />
                    </div>
                  );
                }
                return (
                  <label
                    key={a.id}
                    className="est-row"
                    data-on={(included || n > 0) || undefined}
                    data-included={included || undefined}
                  >
                    <input
                      type="checkbox"
                      checked={included || n > 0}
                      disabled={included}
                      onChange={(e) => setCount(a.id, e.target.checked ? 1 : 0)}
                    />
                    <span className="est-row-main">
                      <span className="est-row-label">{a.label}</span>
                    </span>
                    <span className="est-row-price">
                      {included ? 'Included' : usd.format(a.price)}
                    </span>
                  </label>
                );
              })}
            </fieldset>
          );
        })}

        {/* Timeline */}
        <fieldset className="est-block">
          <legend className="est-legend">Timeline</legend>
          {RUSH.map((r) => (
            <label key={r.id} className="est-row" data-on={rush === r.id || undefined}>
              <input
                type="radio"
                name="rush"
                checked={rush === r.id}
                onChange={() => setRush(r.id)}
              />
              <span className="est-row-main">
                <span className="est-row-label">{r.label}</span>
                <span className="est-row-note">
                  {r.weeks ? weeksLabel(r.weeks) : weeksLabel(pkg.weeks)} from kickoff
                </span>
              </span>
              <span className="est-row-price">{r.pct ? `+${r.pct}%` : '—'}</span>
            </label>
          ))}
        </fieldset>

        {/* Discounts */}
        <fieldset className="est-block">
          <legend className="est-legend">Discounts</legend>
          {DISCOUNTS.map((d) => (
            <label key={d.id} className="est-row" data-on={discounts[d.id] || undefined}>
              <input
                type="checkbox"
                checked={Boolean(discounts[d.id])}
                onChange={(e) => setDiscounts((s) => ({ ...s, [d.id]: e.target.checked }))}
              />
              <span className="est-row-main">
                <span className="est-row-label">{d.label}</span>
              </span>
              <span className="est-row-price">-{d.pct}%</span>
            </label>
          ))}
          <div className="est-row est-row--input" data-on={customPct > 0 || undefined}>
            <span className="est-row-main">
              <span className="est-row-label">Custom discount</span>
              <span className="est-row-note">
                All discounts add up, capped at {DISCOUNT_CAP}%.
              </span>
            </span>
            <span className="est-pct">
              <input
                type="number"
                min={0}
                max={DISCOUNT_CAP}
                value={customPct}
                onChange={(e) =>
                  setCustomPct(Math.min(DISCOUNT_CAP, Math.max(0, Number(e.target.value) || 0)))
                }
                className="est-num"
                aria-label="Custom discount percent"
              />
              %
            </span>
          </div>
        </fieldset>

        {/* Retainer */}
        <fieldset className="est-block">
          <legend className="est-legend">After launch</legend>
          {RETAINERS.map((r) => (
            <label key={r.id} className="est-row" data-on={retainer === r.id || undefined}>
              <input
                type="radio"
                name="retainer"
                checked={retainer === r.id}
                onChange={() => setRetainer(r.id)}
              />
              <span className="est-row-main">
                <span className="est-row-label">{r.label}</span>
              </span>
              <span className="est-row-price">
                {r.monthly ? `${usd.format(r.monthly)}/mo` : '—'}
              </span>
            </label>
          ))}
        </fieldset>

        {/* Client and notes */}
        <fieldset className="est-block">
          <legend className="est-legend">For the quote</legend>
          <div className="field">
            <label htmlFor="est-client">Client</label>
            <input
              id="est-client"
              type="text"
              value={client}
              onChange={(e) => setClient(e.target.value)}
              placeholder="Name or company"
            />
          </div>
          <div className="field">
            <label htmlFor="est-notes">Notes</label>
            <textarea
              id="est-notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Assumptions, exclusions, what the questionnaire said"
            />
          </div>
        </fieldset>
      </div>

      {/* Summary */}
      <aside className="est-summary" aria-live="polite">
        <p className="eyebrow">Summary{client ? ` · ${client}` : ''}</p>

        <ul className="est-lines">
          {est.lines.map((l, i) => (
            <li key={i}>
              <span>{l.label}</span>
              <span>{usd.format(l.amount)}</span>
            </li>
          ))}
          <li className="est-sub">
            <span>Subtotal</span>
            <span>{usd.format(est.subtotal)}</span>
          </li>
          {est.rushAmt > 0 && (
            <li>
              <span>Rush +{est.rushPct}%</span>
              <span>{usd.format(est.rushAmt)}</span>
            </li>
          )}
          {est.discountAmt > 0 && (
            <li>
              <span>
                Discount {est.pct}%{est.capped ? ' (capped)' : ''}
                <span className="est-row-note"> {est.discountLabels.join(', ')}</span>
              </span>
              <span>-{usd.format(est.discountAmt)}</span>
            </li>
          )}
        </ul>

        <p className="est-total">
          <span>Total</span>
          <span>{usd.format(est.total)}</span>
        </p>

        <dl className="est-meta">
          <div>
            <dt>Quote as</dt>
            <dd>
              {usd.format(est.low)} to {usd.format(est.high)}
            </dd>
          </div>
          <div>
            <dt>Deposit {DEPOSIT_PCT}%</dt>
            <dd>{usd.format(est.deposit)}</dd>
          </div>
          <div>
            <dt>Balance at launch</dt>
            <dd>{usd.format(est.total - est.deposit)}</dd>
          </div>
          {est.monthly > 0 && (
            <div>
              <dt>Retainer</dt>
              <dd>{usd.format(est.monthly)} per month</dd>
            </div>
          )}
          <div>
            <dt>Timeline</dt>
            <dd>{weeksLabel(est.weeks)} from kickoff</dd>
          </div>
          <div>
            <dt>Content deadline</dt>
            <dd>{CONTENT_DEADLINE_DAYS} days after kickoff</dd>
          </div>
        </dl>

        <button type="button" className="send" onClick={copy}>
          {copied ? 'Copied' : 'Copy summary'} <span aria-hidden="true">&rarr;</span>
        </button>
      </aside>
    </div>
  );
}
