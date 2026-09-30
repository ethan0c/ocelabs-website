/*
 * The price book and the arithmetic behind a quote, shared by the estimator
 * (client), the proposal page (server) and the Stripe invoice action
 * (server). Nothing here touches React or the network, so all three agree
 * on every number by construction.
 *
 * Edit numbers in the price book; nothing below depends on specific values.
 */

export type Kind = 'starter' | 'website' | 'brand' | 'webapp' | 'mobile';

export const PACKAGES: Record<
  Kind,
  {
    label: string;
    base: number;
    pages: number;
    extraPage: number;
    blurb: string;
    /**
     * What the proposal lists as included, in the client's words. {pages} is
     * the page count on the quote. Add-ons marked includedIn are added after.
     */
    includes: string[];
    /** Calendar weeks from kickoff, low and high. */
    weeks: [number, number];
  }
> = {
  starter: {
    label: 'Starter Site',
    base: 1500,
    pages: 3,
    extraPage: 250,
    blurb: 'One of our layouts in your logo and colours, with your words and photos.',
    includes: [
      'Up to {pages} pages on one of our layouts, in your logo and colours',
      'Your words and photos, placed and checked on phones, tablets and computers',
      'A contact form that sends to your inbox',
      'Set up on your web address, with a secure connection',
    ],
    weeks: [2, 3],
  },
  website: {
    label: 'Website Package',
    base: 3000,
    pages: 5,
    extraPage: 350,
    blurb: 'Custom site, up to five pages, full setup.',
    includes: [
      'A custom design for up to {pages} pages',
      'Built to work on phones, tablets and computers',
      'A contact form that sends to your inbox',
      'Hosting, your web address connected with a secure connection, and redirects from any old pages',
      'Search basics: page titles and descriptions, a sitemap, and Google Search Console',
      'Visitor analytics',
    ],
    weeks: [4, 6],
  },
  brand: {
    label: 'Brand Website Package',
    base: 6000,
    pages: 10,
    extraPage: 450,
    blurb: 'Art direction, motion, video, up to ten pages.',
    includes: [
      'A custom design for up to {pages} pages, with art direction',
      'Built to work on phones, tablets and computers',
      'A contact form that sends to your inbox',
      'Hosting, your web address connected with a secure connection, and redirects from any old pages',
      'Search basics: page titles and descriptions, a sitemap, and Google Search Console',
      'Visitor analytics',
    ],
    weeks: [6, 10],
  },
  webapp: {
    label: 'Web App with Dashboard',
    base: 12000,
    pages: 10,
    extraPage: 450,
    blurb: 'Accounts, content system and admin dashboard.',
    includes: [
      'Design and build of up to {pages} pages and screens',
      'A design review before development starts',
      'Built to work on phones, tablets and computers',
      'Hosting, your web address connected with a secure connection, and visitor analytics',
    ],
    weeks: [10, 16],
  },
  mobile: {
    label: 'Mobile App',
    base: 25000,
    pages: 0,
    extraPage: 0,
    blurb: 'iOS and Android from one codebase, plus marketing site.',
    includes: [
      'One app for iPhone and Android',
      'A marketing site for the app',
      'Submission to the App Store and Google Play',
    ],
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

/** Starter gets a shorter window; it is part of what keeps its price down. */
export const STARTER_WARRANTY_DAYS = 14;

export function warrantyDays(kind: Kind) {
  return kind === 'starter' ? STARTER_WARRANTY_DAYS : WARRANTY_DAYS;
}

/**
 * How a feature gets delivered. Most of our sites connect a tool the client
 * signs up for (Cal.com, Stripe, Shopify); a web app may need it built into
 * the product instead, which is a different job at a different price.
 */
export type Build = 'tool' | 'custom';

/** Only these packages can take a custom build. A website that needs one is a web app. */
export const CUSTOM_KINDS: Kind[] = ['webapp', 'mobile'];

export type Addon = {
  id: string;
  label: string;
  /** The price as a tool we set up, or the only price when there is no tool. */
  price: number;
  /** The price built into the product. Only on packages in CUSTOM_KINDS. */
  custom?: number;
  /** The tools we'd use, named on the proposal. The client pays their subscriptions. */
  tools?: string;
  /** Charged per unit when set; the UI shows a count instead of a checkbox. */
  unit?: string;
  /** What to find out before quoting it. Shown in the estimator only. */
  ask?: string;
  /** Packages that already include this. Shown as "Included", costs nothing. */
  includedIn?: Kind[];
  /** Packages this does not apply to. Hidden. */
  not?: Kind[];
  group: 'Content & brand' | 'Features' | 'Product' | 'Search & reach';
};

export const ADDONS: Addon[] = [
  // Content & brand
  { id: 'copy', label: 'Copywriting', price: 900, unit: 'per 5 pages', ask: 'Do they have anything written? Interview-based writing, one unit per five pages.', group: 'Content & brand' },
  { id: 'logo', label: 'Logo and identity', price: 2500, ask: 'A new logo, or a clean-up of one they have? A clean-up is a custom line at about half.', group: 'Content & brand' },
  { id: 'imagery', label: 'Image sourcing and art direction', price: 600, includedIn: ['brand', 'webapp'], not: ['starter'], ask: 'Stock and art direction only. A photo shoot is a separate vendor.', group: 'Content & brand' },
  { id: 'motion', label: 'Motion and custom interactions', price: 1500, includedIn: ['brand', 'webapp'], not: ['starter', 'mobile'], group: 'Content & brand' },
  { id: 'video', label: 'Video hero or showreel', price: 600, not: ['mobile'], ask: 'Editing and placing footage they supply. Filming is a separate vendor.', group: 'Content & brand' },
  { id: 'themes', label: 'Light and dark themes', price: 400, includedIn: ['brand', 'webapp'], group: 'Content & brand' },

  // Features
  // Starter only. Delivered with a third-party content editor on top of the
  // site, not something we build ourselves; tool not chosen yet.
  { id: 'selfedit', label: 'Edit it yourself (text, photos, hours, prices)', price: 400, not: ['website', 'brand', 'webapp', 'mobile'], group: 'Features' },
  { id: 'cms', label: 'Blog or content system', price: 1500, includedIn: ['webapp', 'mobile'], not: ['starter'], ask: 'Who posts, and how often? Moving old posts over is Migration.', group: 'Features' },
  { id: 'booking', label: 'Online booking', price: 500, custom: 4000, tools: 'Cal.com, Calendly, Acuity or Square Appointments', ask: 'One calendar or several staff? Deposits or no-show fees? If a booking tool already does it, it is the tool price.', group: 'Features' },
  { id: 'payments', label: 'Take payments (deposits, invoices, simple checkout)', price: 750, custom: 4500, tools: 'Stripe', ask: 'One-off, deposits or subscriptions? Stripe-hosted checkout is the tool price; a checkout inside their app is custom.', group: 'Features' },
  { id: 'shop', label: 'Online store', price: 3000, custom: 9000, tools: 'Shopify', not: ['mobile'], ask: 'How many products, with sizes or colours? Over 50 products to enter, add a custom line for product entry.', group: 'Features' },
  { id: 'membership', label: 'Members-only area (gated pages, paid memberships)', price: 1500, custom: 5000, tools: 'Memberstack or Outseta', not: ['mobile'], ask: 'Free or paid? Is it just hidden pages, or do members have profiles and data? The second is a web app.', group: 'Features' },
  { id: 'events', label: 'Events and ticket sales', price: 500, custom: 5000, tools: 'Luma, Eventbrite or Tito', ask: 'How many events a year, and seated or general admission?', group: 'Features' },
  { id: 'newsletter', label: 'Email list signup and welcome email', price: 350, tools: 'Mailchimp, Kit or Beehiiv', ask: 'Which email tool do they use now? Writing a longer sequence is Copywriting.', group: 'Features' },
  { id: 'forms', label: 'Advanced forms (multi-step, file uploads, quote requests)', price: 400, custom: 1200, tools: 'Tally or Typeform', group: 'Features' },
  { id: 'calculator', label: 'Price calculator or product configurator', price: 2500, not: ['mobile'], ask: 'How many inputs, and are the rules written down? If they can\u2019t explain the pricing on a call, quote after they do.', group: 'Features' },
  { id: 'chat', label: 'Live chat', price: 250, tools: 'Crisp, Tidio or Intercom', ask: 'Who answers it? An AI assistant is under Product.', group: 'Features' },
  { id: 'reviews', label: 'Reviews shown on the site (Google, Yelp, Trustpilot)', price: 300, tools: 'Elfsight or Trustindex', group: 'Features' },
  { id: 'i18n', label: 'Additional language', price: 1000, unit: 'per language', not: ['starter'], ask: 'Who translates? We build it; translation is theirs or a separate vendor.', group: 'Features' },
  { id: 'integration', label: 'Connect another service (CRM, accounting, email)', price: 600, custom: 2000, unit: 'each', tools: 'Zapier or the service\u2019s own connector', ask: 'Which service, and which way does data go? A ready connector is the tool price; a direct API build is custom.', group: 'Features' },
  { id: 'email', label: 'Business email on their domain', price: 250, tools: 'Google Workspace', ask: 'How many mailboxes? They pay Google per mailbox.', group: 'Features' },

  // Product
  { id: 'accounts', label: 'User accounts and login', price: 2500, includedIn: ['webapp', 'mobile'], not: ['starter', 'website'], ask: 'On a brand site, gated pages alone are the Members-only area instead.', group: 'Product' },
  { id: 'dashboard', label: 'Admin dashboard', price: 3000, includedIn: ['webapp', 'mobile'], not: ['starter', 'website'], group: 'Product' },
  { id: 'customerportal', label: 'Customer portal (orders, documents, billing)', price: 3500, not: ['starter', 'website', 'brand'], group: 'Product' },
  { id: 'push', label: 'Push notifications', price: 800, includedIn: ['mobile'], not: ['starter', 'website', 'brand', 'webapp'], group: 'Product' },
  { id: 'offline', label: 'Offline mode and sync', price: 2500, not: ['starter', 'website', 'brand', 'webapp'], group: 'Product' },
  { id: 'ai', label: 'AI feature (chat, recommendations, generation)', price: 6000, unit: 'each', not: ['starter', 'website'], ask: 'One feature per unit. An assistant that answers from their own content is one; anything that takes actions for users, quote as a custom line.', group: 'Product' },
  { id: 'api', label: 'Public API for partners', price: 3000, not: ['starter', 'website', 'brand'], group: 'Product' },

  // Search & reach
  { id: 'localseo', label: 'Local search (Google Business listing, directories, location pages)', price: 1000, ask: 'How many locations? Each extra location page is an extra page.', group: 'Search & reach' },
  { id: 'contentplan', label: 'Keyword research and content plan', price: 1000, not: ['starter'], group: 'Search & reach' },
  { id: 'migration', label: 'Move an existing site over, with redirects', price: 750, unit: 'per 25 pages or posts', ask: 'How many pages and posts are on the old site, and on what platform? One unit per 25.', group: 'Search & reach' },
  { id: 'a11y', label: 'Accessibility audit and fixes', price: 800, group: 'Search & reach' },
  { id: 'reporting', label: 'Monthly analytics report setup', price: 400, group: 'Search & reach' },
];

/** Whether this add-on can be built custom on this package. */
export function canBuildCustom(a: Addon, kind: Kind) {
  return a.custom != null && CUSTOM_KINDS.includes(kind);
}

/** The way an add-on is delivered on this quote, after the package rules. */
export function buildOf(a: Addon, input: Pick<QuoteInput, 'kind' | 'build'>): Build {
  return canBuildCustom(a, input.kind) && input.build?.[a.id] === 'custom' ? 'custom' : 'tool';
}

export function addonPrice(a: Addon, build: Build) {
  return build === 'custom' && a.custom != null ? a.custom : a.price;
}

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

/*
 * Rush shortens the package's own timeline rather than naming a fixed one,
 * so it always buys something. The fastest option is off for packages where
 * halving the build isn't a promise we can keep in writing.
 */
export const RUSH: Array<{ id: string; label: string; pct: number; factor: number; not?: Kind[] }> = [
  { id: 'none', label: 'Standard timeline', pct: 0, factor: 1 },
  { id: 'fast', label: 'Faster, about 30% sooner', pct: 25, factor: 0.7 },
  { id: 'urgent', label: 'Fastest, about half the time', pct: 50, factor: 0.5, not: ['starter', 'webapp', 'mobile'] },
];

export function rushOptions(kind: Kind) {
  return RUSH.filter((r) => !r.not?.includes(kind));
}

export function rushWeeks(weeks: [number, number], factor: number): [number, number] {
  const lo = Math.max(1, Math.round(weeks[0] * factor));
  return [lo, Math.max(lo, Math.round(weeks[1] * factor))];
}

export const RETAINERS = [
  { id: 'none', label: 'No retainer', monthly: 0 },
  { id: 'care', label: 'Starter care: small edits within two business days', monthly: 150 },
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
  starter: [
    { label: 'Deposit', pct: 50, trigger: DEPOSIT_TRIGGER, dueDays: 0 },
    { label: 'Balance', pct: 50, trigger: LAUNCH_TRIGGER, dueDays: 7 },
  ],
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
  /** Add-on id to how it's delivered. Missing means a tool. */
  build: Record<string, Build>;
  /** Work the price book doesn't list, priced by hand. Counted like an add-on. */
  extras: Line[];
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
    build: {},
    extras: [],
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
  /** Tools on this quote whose subscriptions the client pays. */
  thirdParty: string[];
  /** Signs the quote is in the wrong package or missing something. Studio only. */
  warnings: string[];
};

/** The proposal's "included" list: the package's own items, then add-ons it includes. */
export function packageIncludes(kind: Kind, pages: number) {
  return [
    ...PACKAGES[kind].includes.map((t) => t.replace('{pages}', String(pages))),
    ...ADDONS.filter((a) => a.includedIn?.includes(kind)).map((a) => a.label),
  ];
}

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

  const thirdParty: string[] = [];
  for (const a of visibleAddons(kind)) {
    const n = qty[a.id] ?? 0;
    if (n <= 0 || a.includedIn?.includes(kind)) continue;
    const build = buildOf(a, input);
    const how = build === 'custom' ? ', built custom' : a.tools ? `, set up with ${a.tools}` : '';
    lines.push({
      label: `${a.label}${how}${a.unit ? ` × ${n}` : ''}`,
      amount: addonPrice(a, build) * n,
    });
    if (build === 'tool' && a.tools) thirdParty.push(a.tools);
  }

  for (const x of input.extras ?? []) {
    if (x.label.trim() && x.amount > 0) lines.push({ label: x.label.trim(), amount: Math.round(x.amount) });
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

  const rushOpt = rushOptions(kind).find((r) => r.id === rush) ?? RUSH[0];
  const rushPct = rushOpt.pct;
  const rushAmt = Math.round(subtotal * (rushPct / 100));

  // Extra projects extend the package timeline; rush then shortens the result.
  const weeks = rushWeeks(
    [pkg.weeks[0] + extraProjects * WEEKS_PER_EXTRA_PROJECT, pkg.weeks[1] + extraProjects * WEEKS_PER_EXTRA_PROJECT],
    rushOpt.factor,
  );

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
    thirdParty,
    warnings: warningsFor(input, perProject),
  };
}

/**
 * Quotes that look like the wrong package. A cheap package loaded with
 * add-ons undersells the work and teaches the client our packages are
 * padding; a premium studio moves them up instead.
 */
function warningsFor(input: QuoteInput, perProject: number): string[] {
  const { kind } = input;
  const out: string[] = [];
  const on = (id: string) => (input.qty[id] ?? 0) > 0;
  if (kind === 'starter' && perProject >= PACKAGES.website.base) {
    out.push(`This Starter quote is ${usd.format(perProject)}, at or above the Website Package (${usd.format(PACKAGES.website.base)}). Quote the Website Package instead.`);
  }
  const pkg = PACKAGES[kind];
  if (pkg.pages > 0 && input.pages > pkg.pages * 2) {
    out.push(`${input.pages} pages is more than twice what ${pkg.label} includes. Check whether a bigger package fits, or whether many pages share one template (a custom line is fairer then).`);
  }
  if ((kind === 'website' || kind === 'brand') && ['membership', 'shop', 'booking', 'payments', 'events'].filter(on).length >= 3) {
    out.push('Three or more tools on one site. If they need to talk to each other (members who book and pay), this is a web app.');
  }
  if (on('shop') && on('payments')) {
    out.push('The online store already takes payments. Keep Take payments only if they also need deposits or invoices outside the store.');
  }
  if (on('accounts') && on('membership')) {
    out.push('User accounts and a Members-only area overlap. Pick one.');
  }
  if (on('calculator') && !input.notes.trim()) {
    out.push('Write the calculator rules into the notes, so the scope is clear on the proposal.');
  }
  return out;
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
    ...(q.thirdParty.length ? [`Tools you subscribe to directly: ${q.thirdParty.join('; ')}`] : []),
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
export function sanitise(raw: Partial<QuoteInput>): QuoteInput {
  const kind: Kind = raw.kind && raw.kind in PACKAGES ? raw.kind : 'website';
  const base = defaultInput(kind);
  const qty: Record<string, number> = {};
  if (raw.qty && typeof raw.qty === 'object') {
    for (const a of ADDONS) {
      const n = Number(raw.qty[a.id]);
      if (Number.isFinite(n) && n > 0) qty[a.id] = clampInt(n, 0, 99);
    }
  }
  const build: Record<string, Build> = {};
  if (raw.build && typeof raw.build === 'object') {
    for (const a of ADDONS) if (raw.build[a.id] === 'custom') build[a.id] = 'custom';
  }
  const extras: Line[] = Array.isArray(raw.extras)
    ? raw.extras
        .slice(0, 20)
        .map((x) => ({ label: str(x?.label, 200), amount: clampInt(Number(x?.amount) || 0, 0, 1_000_000) }))
    : [];
  return {
    kind,
    pages: clampInt(Number(raw.pages) || base.pages, 1, 500),
    projects: clampInt(Number(raw.projects) || 1, 1, 50),
    qty,
    build,
    extras,
    discounts: Array.isArray(raw.discounts)
      ? DISCOUNTS.filter((d) => raw.discounts!.includes(d.id)).map((d) => d.id)
      : [],
    customPct: clampInt(Number(raw.customPct) || 0, 0, DISCOUNT_CAP),
    rush: rushOptions(kind).some((r) => r.id === raw.rush) ? String(raw.rush) : 'none',
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
