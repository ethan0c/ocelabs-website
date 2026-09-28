/*
 * The price book and the arithmetic behind a quote, shared by the estimator
 * (client), the proposal page (server) and the Stripe invoice action
 * (server). Nothing here touches React or the network, so all three agree
 * on every number by construction.
 *
 * Edit numbers in the price book; nothing below depends on specific values.
 */

export type Kind = 'website' | 'brand' | 'webapp' | 'mobile';

export const PACKAGES: Record<
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
export const WEEKS_PER_EXTRA_PROJECT = 2;

/** Days after kickoff by which missing assets must arrive or launch slips. */
export const CONTENT_DEADLINE_DAYS = 7;

/** Days a proposal's price and start date are held. */
export const PROPOSAL_VALID_DAYS = 14;

/** Days of included fixes after launch. */
export const WARRANTY_DAYS = 30;

export type Addon = {
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

export const ADDONS: Addon[] = [
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

export const GROUPS = ['Content & brand', 'Features', 'Product', 'Search & reach'] as const;

/** A second site or app on the same engagement, priced as a share of the base. */
export const EXTRA_PROJECT_SHARE = 0.6;

/** Bulk discount on the whole subtotal, by number of sites or apps. */
export const BULK = [
  { min: 2, pct: 10 },
  { min: 3, pct: 15 },
  { min: 5, pct: 20 },
];

export const DISCOUNTS = [
  { id: 'friends', label: 'Friends and family', pct: 20 },
  { id: 'nonprofit', label: 'Nonprofit', pct: 15 },
  { id: 'referral', label: 'Referral', pct: 10 },
  { id: 'firstclient', label: 'Launch client (testimonial in exchange)', pct: 10 },
];

/** Percentage discounts add together up to this. A flat amount can come off on top. */
export const DISCOUNT_CAP = 100;

export const RUSH = [
  { id: 'none', label: 'Standard timeline', pct: 0, weeks: null as [number, number] | null },
  { id: 'fast', label: 'Under 3 weeks', pct: 25, weeks: [2, 3] as [number, number] },
  { id: 'urgent', label: 'Under 10 days', pct: 50, weeks: [1, 2] as [number, number] },
];

export const RETAINERS = [
  { id: 'none', label: 'No retainer', monthly: 0 },
  { id: 'basic', label: 'Basic: updates and monitoring', monthly: 300 },
  { id: 'standard', label: 'Standard: plus quarterly SEO review', monthly: 600 },
  { id: 'priority', label: 'Priority: same-day response, ongoing work', monthly: 1200 },
  { id: 'custom', label: 'Custom', monthly: 0 },
];

/*
 * Payment schedules, from the client workflow doc. Each stage is a share of
 * the fixed total with the event that triggers its invoice. The deposit is
 * due on receipt; everything after is due in 7 days.
 *
 * Mobile is 30% down and then equal milestones, the count agreed per
 * proposal, so its schedule is built from `milestones` rather than fixed.
 */
export type Stage = {
  label: string;
  pct: number;
  trigger: string;
  /** Days until due on the Stripe invoice. 0 is due on receipt. */
  dueDays: number;
};

const DEPOSIT_TRIGGER = 'On signature, before any work starts';
const LAUNCH_TRIGGER = 'On staging approval, before launch';

const FIXED_SCHEDULES: Record<Exclude<Kind, 'mobile'>, Stage[]> = {
  website: [
    { label: 'Deposit', pct: 50, trigger: DEPOSIT_TRIGGER, dueDays: 0 },
    { label: 'Balance', pct: 50, trigger: LAUNCH_TRIGGER, dueDays: 7 },
  ],
  brand: [
    { label: 'Deposit', pct: 50, trigger: DEPOSIT_TRIGGER, dueDays: 0 },
    { label: 'Balance', pct: 50, trigger: LAUNCH_TRIGGER, dueDays: 7 },
  ],
  webapp: [
    { label: 'Deposit', pct: 40, trigger: DEPOSIT_TRIGGER, dueDays: 0 },
    { label: 'Design approved', pct: 30, trigger: 'On written approval of the design review', dueDays: 7 },
    { label: 'Balance', pct: 30, trigger: LAUNCH_TRIGGER, dueDays: 7 },
  ],
};

export const MOBILE_DEPOSIT_PCT = 30;
export const MOBILE_MIN_MILESTONES = 1;
export const MOBILE_MAX_MILESTONES = 6;

/** One invoice for everything, on signature. */
export const FULL_PAYMENT: Stage = { label: 'Full payment', pct: 100, trigger: DEPOSIT_TRIGGER, dueDays: 0 };

export type Plan = 'standard' | 'full';

export function scheduleFor(kind: Kind, milestones: number, plan: Plan = 'standard'): Stage[] {
  if (plan === 'full') return [FULL_PAYMENT];
  if (kind !== 'mobile') return FIXED_SCHEDULES[kind];
  const n = clampInt(milestones, MOBILE_MIN_MILESTONES, MOBILE_MAX_MILESTONES);
  const rest = 100 - MOBILE_DEPOSIT_PCT;
  const stages: Stage[] = [
    { label: 'Deposit', pct: MOBILE_DEPOSIT_PCT, trigger: DEPOSIT_TRIGGER, dueDays: 0 },
  ];
  for (let i = 1; i <= n; i++) {
    const last = i === n;
    stages.push({
      label: last ? 'Final' : `Milestone ${i}`,
      // Percentages here are for display; amounts are split exactly below.
      pct: Math.round(rest / n),
      trigger: last ? 'On approval, before store submission' : `On approval of milestone ${i}, as set out in the proposal`,
      dueDays: 7,
    });
  }
  return stages;
}

/* ────────────────────────────────────────────────────────────────────────── */

/** Everything the estimator form holds. Serialisable, so a quote is a URL. */
export type QuoteInput = {
  kind: Kind;
  pages: number;
  projects: number;
  /** Add-on id to count. Checkbox add-ons are 0 or 1. */
  qty: Record<string, number>;
  /** Discount ids that are on. */
  discounts: string[];
  customPct: number;
  /** Flat dollars off, applied after the percentage discounts. */
  customAmount: number;
  rush: string;
  retainer: string;
  /** Monthly price when retainer is "custom". */
  customRetainer: number;
  /** Standard schedule, or one invoice for the full amount on signature. */
  plan: Plan;
  /** Mobile only: number of payments after the deposit. */
  milestones: number;
  client: string;
  email: string;
  notes: string;
};

export function defaultInput(kind: Kind = 'website'): QuoteInput {
  return {
    kind,
    pages: PACKAGES[kind].pages,
    projects: 1,
    qty: {},
    discounts: [],
    customPct: 0,
    customAmount: 0,
    rush: 'none',
    retainer: 'none',
    customRetainer: 0,
    plan: 'standard',
    milestones: 2,
    client: '',
    email: '',
    notes: '',
  };
}

export type Line = { label: string; amount: number };

export type Payment = Stage & { amount: number };

export type Quote = {
  input: QuoteInput;
  pkg: (typeof PACKAGES)[Kind];
  lines: Line[];
  subtotal: number;
  rushPct: number;
  rushAmt: number;
  pct: number;
  capped: boolean;
  discountAmt: number;
  discountLabels: string[];
  total: number;
  payments: Payment[];
  monthly: number;
  low: number;
  high: number;
  weeks: [number, number];
};

export function visibleAddons(kind: Kind) {
  return ADDONS.filter((a) => !a.not?.includes(kind));
}

export function computeQuote(input: QuoteInput): Quote {
  const { kind, pages, projects, qty, rush, retainer, customPct } = input;
  const pkg = PACKAGES[kind];
  const lines: Line[] = [{ label: pkg.label, amount: pkg.base }];

  const extraPages = Math.max(0, pages - pkg.pages);
  if (pkg.pages > 0 && extraPages > 0) {
    lines.push({
      label: `${extraPages} extra page${extraPages === 1 ? '' : 's'}`,
      amount: extraPages * pkg.extraPage,
    });
  }

  for (const a of visibleAddons(kind)) {
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
  const chosen = DISCOUNTS.filter((d) => input.discounts.includes(d.id));
  const rawPct = bulkPct + chosen.reduce((s, d) => s + d.pct, 0) + customPct;
  const pct = Math.min(DISCOUNT_CAP, Math.max(0, rawPct));
  const beforeDiscount = subtotal + rushAmt;
  const pctAmt = Math.round(beforeDiscount * (pct / 100));
  // A flat amount on top of the percentage, never taking the total below zero.
  const flat = Math.min(Math.max(0, Math.round(input.customAmount || 0)), beforeDiscount - pctAmt);
  const discountAmt = pctAmt + flat;

  const total = beforeDiscount - discountAmt;
  const monthly =
    retainer === 'custom'
      ? Math.max(0, Math.round(input.customRetainer || 0))
      : RETAINERS.find((r) => r.id === retainer)?.monthly ?? 0;

  const discountLabels = [
    ...(bulkPct ? [`Bulk (${projects} projects) ${bulkPct}%`] : []),
    ...chosen.map((d) => `${d.label} ${d.pct}%`),
    ...(customPct ? [`Custom ${customPct}%`] : []),
    ...(flat ? [`${usd.format(flat)} off`] : []),
  ];

  return {
    input,
    pkg,
    lines,
    subtotal,
    rushPct,
    rushAmt,
    pct,
    capped: rawPct > DISCOUNT_CAP,
    discountAmt,
    discountLabels,
    total,
    payments: splitPayments(total, scheduleFor(kind, input.milestones, input.plan)),
    monthly,
    // Quoted as a range so the fixed price can land above the estimate
    // once the questionnaire surfaces scope the call didn't.
    low: Math.round(total / 100) * 100,
    high: Math.round((total * 1.15) / 100) * 100,
    weeks,
  };
}

/**
 * Whole-dollar amounts that add up to the total exactly. The deposit takes
 * its stated share; the remainder is split evenly and the last payment
 * absorbs any rounding.
 */
function splitPayments(total: number, stages: Stage[]): Payment[] {
  const [deposit, ...rest] = stages;
  const depositAmt = Math.round(total * (deposit.pct / 100));
  const remaining = total - depositAmt;
  const each = rest.length ? Math.floor(remaining / rest.length) : 0;
  return stages.map((s, i) => {
    if (i === 0) return { ...s, amount: depositAmt };
    const last = i === stages.length - 1;
    return { ...s, amount: last ? remaining - each * (rest.length - 1) : each };
  });
}

/* ────────────────────────────────────────────────────────────────────────── */

export const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

export function weeksLabel([lo, hi]: [number, number]) {
  // Past three months, weeks stop meaning much; say months.
  if (lo >= 13) return `${Math.round(lo / 4.33)} to ${Math.round(hi / 4.33)} months`;
  return `${lo} to ${hi} weeks`;
}

/** The plain-text summary that goes in a quote email. */
export function summaryText(q: Quote) {
  const { input } = q;
  const rows = [
    `OCE Labs estimate${input.client ? ` — ${input.client}` : ''}`,
    '',
    ...q.lines.map((l) => `${l.label}: ${usd.format(l.amount)}`),
    `Subtotal: ${usd.format(q.subtotal)}`,
    ...(q.rushAmt ? [`Rush (${q.rushPct}%): ${usd.format(q.rushAmt)}`] : []),
    ...(q.discountAmt
      ? [`Discount (${q.discountLabels.join(', ')}): -${usd.format(q.discountAmt)}`]
      : []),
    `Total: ${usd.format(q.total)}`,
    `Quote range: ${usd.format(q.low)} to ${usd.format(q.high)}`,
    '',
    'Payments:',
    ...q.payments.map((p) => `${p.label} (${p.pct}%): ${usd.format(p.amount)} — ${p.trigger.toLowerCase()}`),
    ...(q.monthly ? [`Retainer: ${usd.format(q.monthly)} per month`] : []),
    '',
    `Timeline: ${weeksLabel(q.weeks)} from kickoff`,
    `Kickoff: deposit paid, questionnaire returned, logo and brand files, existing copy shared`,
    `Content deadline: ${CONTENT_DEADLINE_DAYS} days after kickoff; anything later moves launch by the same number of days`,
    ...(input.notes.trim() ? ['', 'Notes:', input.notes.trim()] : []),
  ];
  return rows.join('\n');
}

/* ────────────────────────────────────────────────────────────────────────────
   URL encoding. A quote is `?q=<base64url json>` so the estimator, the
   proposal page and the invoice action all read the same thing, and a quote
   can be bookmarked or pasted into the tracker.
   ────────────────────────────────────────────────────────────────────────── */

export function encodeInput(input: QuoteInput): string {
  const json = JSON.stringify(input);
  const bytes = new TextEncoder().encode(json);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function decodeInput(value: string | undefined | null): QuoteInput | null {
  if (!value) return null;
  try {
    const b64 = value.replace(/-/g, '+').replace(/_/g, '/');
    const bin = atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4));
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    const raw = JSON.parse(new TextDecoder().decode(bytes)) as Partial<QuoteInput>;
    return sanitise(raw);
  } catch {
    return null;
  }
}

/** Never trust the URL: every field is coerced back into a valid value. */
function sanitise(raw: Partial<QuoteInput>): QuoteInput {
  const kind: Kind = raw.kind && raw.kind in PACKAGES ? raw.kind : 'website';
  const base = defaultInput(kind);
  const qty: Record<string, number> = {};
  if (raw.qty && typeof raw.qty === 'object') {
    for (const a of ADDONS) {
      const n = Number(raw.qty[a.id]);
      if (Number.isFinite(n) && n > 0) qty[a.id] = clampInt(n, 0, 99);
    }
  }
  return {
    kind,
    pages: clampInt(Number(raw.pages) || base.pages, 1, 500),
    projects: clampInt(Number(raw.projects) || 1, 1, 50),
    qty,
    discounts: Array.isArray(raw.discounts)
      ? DISCOUNTS.filter((d) => raw.discounts!.includes(d.id)).map((d) => d.id)
      : [],
    customPct: clampInt(Number(raw.customPct) || 0, 0, DISCOUNT_CAP),
    rush: RUSH.some((r) => r.id === raw.rush) ? String(raw.rush) : 'none',
    retainer: RETAINERS.some((r) => r.id === raw.retainer) ? String(raw.retainer) : 'none',
    customRetainer: clampInt(Number(raw.customRetainer) || 0, 0, 1_000_000),
    customAmount: clampInt(Number(raw.customAmount) || 0, 0, 10_000_000),
    plan: raw.plan === 'full' ? 'full' : 'standard',
    milestones: clampInt(Number(raw.milestones) || base.milestones, MOBILE_MIN_MILESTONES, MOBILE_MAX_MILESTONES),
    client: str(raw.client, 200),
    email: str(raw.email, 200),
    notes: str(raw.notes, 4000),
  };
}

function clampInt(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, Math.floor(n)));
}

function str(v: unknown, max: number) {
  return typeof v === 'string' ? v.slice(0, max) : '';
}
