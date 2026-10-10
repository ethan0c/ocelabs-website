/*
 * The proposal's wording (client workflow, Part 4), built from a quote. Both
 * the on-screen preview and the PDF render this structure, so the two can't
 * say different things. Edit the default copy here.
 *
 * Before a proposal is sent, its wording can be changed per lead in the
 * studio (Edit wording on the lead page). Those changes are a ProposalEdits
 * object keyed by the block ids below; applyEdits lays them over the
 * generated document. Prices and tables always come from the quote.
 */

import {
  CONTENT_DEADLINE_DAYS,
  PROPOSAL_VALID_DAYS,
  packageIncludes,
  warrantyDays,
  usd,
  weeksLabel,
  type Quote,
} from './pricing';

export type Row = { label: string; note?: string; amount: string; total?: boolean };

export type Block =
  | { kind: 'p'; id?: string; text: string; strong?: boolean; muted?: boolean }
  | { kind: 'table'; id?: string; rows: Row[] }
  | { kind: 'list'; id?: string; items: string[] };

export type Section = { n: number; key: string; title: string; blocks: Block[] };

/**
 * Per-lead changes to the generated wording, made in the studio before the
 * proposal goes out and frozen onto the proposal row when it is sent.
 *
 * blocks: block id → the replacement text; null hides the block. A paragraph's
 *   text may hold several paragraphs (blank line between) and lists (lines
 *   starting with "- "). A list block's text is one item per line.
 * extra: section key → text appended to the end of that section, same format.
 * timeline: replaces the timeline shown in the header ("4 to 6 weeks from kickoff").
 */
export type ProposalEdits = {
  blocks?: Record<string, string | null>;
  extra?: Record<string, string>;
  timeline?: string;
};

export type Proposal = {
  client: string;
  legalName: string;
  /** "Legal name, doing business as OCE Labs" */
  studio: string;
  date: string;
  validUntil: string;
  total: string;
  timeline: string;
  sections: Section[];
};

export const STUDIO_EMAIL = 'hello@ocelabs.xyz';

const longDate = new Intl.DateTimeFormat('en-US', { dateStyle: 'long' });

function plusDays(d: Date, n: number) {
  const out = new Date(d);
  out.setDate(out.getDate() + n);
  return out;
}

export function buildProposal(q: Quote, now = new Date(), edits?: ProposalEdits | null): Proposal {
  const { input } = q;
  const legalName = process.env.OCE_LEGAL_NAME || '[Legal name]';
  const studio = `${legalName}, doing business as OCE Labs`;
  const client = input.client.trim() || '[Client legal business name]';
  const validUntil = longDate.format(plusDays(now, PROPOSAL_VALID_DAYS));
  const total = usd.format(q.total);
  const timeline = `${weeksLabel(q.weeks)} from kickoff`;
  const starter = input.kind === 'starter';
  const thing = input.projects > 1 ? 'sites or apps' : input.kind === 'mobile' ? 'app' : 'site';

  const scope: Row[] = [
    ...q.lines.map((l) => ({ label: l.label, amount: usd.format(l.amount) })),
    ...(q.rushAmt > 0
      ? [{ label: `Rush timeline, ${q.rushPct}%`, amount: usd.format(q.rushAmt) }]
      : []),
    ...(q.discountAmt > 0
      ? [
          {
            label: `Discount, ${q.pct}% (${q.discountLabels.join(', ')})`,
            amount: `-${usd.format(q.discountAmt)}`,
          },
        ]
      : []),
    { label: 'Fixed price', amount: total, total: true },
  ];

  const payments: Row[] = q.payments.map((p) => ({
    label: `${p.label}, ${p.pct}%`,
    note: `${p.trigger}. Due ${p.dueDays === 0 ? 'on receipt' : `in ${p.dueDays} days`}.`,
    amount: usd.format(p.amount),
  }));

  const sections: Section[] = [
    {
      n: 1,
      key: 'parties',
      title: 'Parties',
      blocks: [
        p(
          `This agreement is between ${studio} ("we", "us"), and ${client} ("you"). It covers the work described below and nothing else.`,
          { id: 'parties.p' },
        ),
      ],
    },
    {
      n: 2,
      key: 'scope',
      title: 'Scope',
      blocks: [
        p(`We will design, build and launch the following. ${q.pkg.blurb}`, { id: 'scope.intro' }),
        { kind: 'table', id: 'scope.lines', rows: scope },
        p(`The ${q.pkg.label} includes:`, { id: 'scope.includes-intro' }),
        { kind: 'list', id: 'scope.includes', items: packageIncludes(input.kind, input.pages) },
        ...(input.notes.trim() ? [p(input.notes.trim(), { id: 'scope.notes', muted: true })] : []),
        ...((q.thirdParty ?? []).length
          ? [
              p(
                `Some features run on services you sign up for: ${q.thirdParty.join('; ')}. We set them up in your name and connect them to the ${thing}. Their fees are billed to you by the provider and are not part of this price.`,
                { id: 'scope.third-party' },
              ),
            ]
          : []),
        p('Anything not listed here is outside the scope and is quoted separately.', { id: 'scope.outside', strong: true }),
      ],
    },
    {
      n: 3,
      key: 'price',
      title: 'Price and payment schedule',
      blocks: [
        p(
          q.payments.length === 1
            ? `The price is fixed at ${total}, payable in full on signature by emailed invoice. Bank transfer or card, from the link in the invoice.`
            : `The price is fixed at ${total}, payable in ${q.payments.length} parts by emailed invoice. Bank transfer or card, from the link in the invoice.`,
          { id: 'price.intro' },
        ),
        { kind: 'table', id: 'price.payments', rows: payments },
        ...(q.monthly > 0
          ? [
              p(
                `After launch, an optional retainer of ${usd.format(q.monthly)} per month covers updates, monitoring and support. It is billed monthly by subscription, starts only when you ask for it, and can be cancelled at any time.`,
                { id: 'price.retainer' },
              ),
            ]
          : []),
      ],
    },
    {
      n: 4,
      key: 'timeline',
      title: 'Timeline',
      blocks: [
        p(
          `The project takes ${timeline}. Kickoff is the day all four of these are in: the deposit has cleared, the questionnaire is returned, your logo and brand files are shared, and any existing copy you want kept is shared. We confirm the kickoff date and the launch date in writing on that day.`,
          { id: 'timeline.kickoff' },
        ),
        p(
          `Any remaining content is due ${CONTENT_DEADLINE_DAYS} days after kickoff. Anything that arrives after that moves the launch date by the same number of days.`,
          { id: 'timeline.content' },
        ),
      ],
    },
    {
      n: 5,
      key: 'reviews',
      title: 'Reviews and revisions',
      blocks: [
        p(
          starter
            ? `There is one review point: a staging review of the full ${thing} on a private link before launch, with one round of changes. Feedback is collected in one email or one document from the one approver you name in the questionnaire.`
            : `There are two review points: a design review of the direction and key pages before development, and a staging review of the full ${thing} on a private link before launch. Each includes two rounds of revisions. Feedback for each round is collected in one email or one document from the one approver you name in the questionnaire.`,
          { id: 'reviews.p' },
        ),
      ],
    },
    {
      n: 6,
      key: 'changes',
      title: 'Changes',
      blocks: [
        p(
          'Work outside the scope in section 2 is quoted as a written change order stating what it is, its price, and its effect on the launch date. It starts once you reply "approved" in writing, and it is added to the final invoice.',
          { id: 'changes.p' },
        ),
      ],
    },
    {
      n: 7,
      key: 'ownership',
      title: 'Ownership',
      blocks: [
        p(
          `Once the final invoice is paid, you own the ${thing}, its code and its content. Until then it remains ours. Third-party fonts, libraries and services stay under their own licences. We may show the work in our portfolio and describe it publicly unless you ask us not to.`,
          { id: 'ownership.p' },
        ),
      ],
    },
    {
      n: 8,
      key: 'cancellation',
      title: 'Cancellation',
      blocks: [
        p(
          'Either side can end this agreement with written notice. The deposit is non-refundable once work has started. Work completed beyond the deposit is billed at the point of cancellation, and anything paid for is handed over in its current state.',
          { id: 'cancellation.p' },
        ),
      ],
    },
    {
      n: 9,
      key: 'late',
      title: 'Late payment',
      blocks: [
        p(
          `If an invoice is more than 7 days overdue, work pauses until it is paid, and the launch date moves by the length of the pause. The ${thing} goes live, and domain, repository and hosting access are transferred, only after the final invoice is paid.`,
          { id: 'late.p' },
        ),
      ],
    },
    {
      n: 10,
      key: 'after',
      title: 'After launch',
      blocks: [
        p(
          `For ${warrantyDays(input.kind)} days after launch we fix anything we missed at no charge. Ongoing updates and support after that are covered by an optional monthly retainer, which is separate from this agreement.`,
          { id: 'after.p' },
        ),
      ],
    },
    {
      n: 11,
      key: 'validity',
      title: 'Validity',
      blocks: [
        p(
          `This proposal, its price and its start date are held until ${validUntil}, ${PROPOSAL_VALID_DAYS} days from the date above. After that we will re-quote.`,
          { id: 'validity.p' },
        ),
      ],
    },
  ];

  const pr: Proposal = {
    client,
    legalName,
    studio,
    date: longDate.format(now),
    validUntil,
    total,
    timeline,
    sections,
  };
  return edits ? applyEdits(pr, edits) : pr;
}

function p(text: string, opts: { id?: string; strong?: boolean; muted?: boolean } = {}): Block {
  return { kind: 'p', text, ...opts };
}

/* ── Edits ─────────────────────────────────────────────────────────────── */

const MAX_TEXT = 8000;

/** The editable text of a block, as the studio's textarea shows it. */
export function blockText(b: Block): string {
  if (b.kind === 'p') return b.text;
  if (b.kind === 'list') return b.items.join('\n');
  return '';
}

const bullet = /^\s*(?:[-•*]|\d+[.)])\s+/;

/**
 * Text from a textarea → blocks. Paragraphs are separated by a blank line; a
 * paragraph whose every line starts with "- " (or "•", "*", "1.") is a list.
 * `like` carries the original block's styling (strong, muted) onto the first
 * paragraph, and makes bare lines items when the original was a list.
 */
export function parseBlocks(text: string, like?: Block): Block[] {
  const t = text.replace(/\r\n?/g, '\n').trim();
  if (!t) return [];
  if (like?.kind === 'list' && !/\n\s*\n/.test(t)) {
    const items = t
      .split('\n')
      .map((l) => l.replace(bullet, '').trim())
      .filter(Boolean);
    return items.length ? [{ kind: 'list', items }] : [];
  }
  const style = like?.kind === 'p' ? { strong: like.strong, muted: like.muted } : {};
  return t
    .split(/\n\s*\n/)
    .map((para) => para.trim())
    .filter(Boolean)
    .map((para, i): Block => {
      const lines = para.split('\n').map((l) => l.trim()).filter(Boolean);
      if (lines.length > 0 && lines.every((l) => bullet.test(l))) {
        return { kind: 'list', items: lines.map((l) => l.replace(bullet, '').trim()) };
      }
      return { kind: 'p', text: lines.join(' '), ...(i === 0 ? style : {}) };
    });
}

/** Lay per-lead edits over the generated document. Tables are never touched. */
export function applyEdits(pr: Proposal, edits: ProposalEdits): Proposal {
  const blocks = edits.blocks ?? {};
  const extra = edits.extra ?? {};
  const sections = pr.sections.map((sec) => {
    const out: Block[] = [];
    for (const b of sec.blocks) {
      if (b.kind !== 'table' && b.id && b.id in blocks) {
        const v = blocks[b.id];
        if (v === null) continue;
        out.push(...parseBlocks(v, b).map((nb) => ({ ...nb, id: b.id })));
      } else {
        out.push(b);
      }
    }
    const add = extra[sec.key];
    if (add?.trim()) out.push(...parseBlocks(add));
    return { ...sec, blocks: out };
  });
  const timeline = edits.timeline?.trim() ? edits.timeline.trim() : pr.timeline;
  return { ...pr, timeline, sections };
}

/** True when the edits would change anything. */
export function hasEdits(e: ProposalEdits | null | undefined): boolean {
  if (!e) return false;
  if (Object.keys(e.blocks ?? {}).length) return true;
  if (Object.values(e.extra ?? {}).some((v) => v.trim())) return true;
  return Boolean(e.timeline?.trim());
}

/**
 * Edits from the studio form, kept to known keys and sane lengths. Entries
 * that match the generated text are dropped, so a saved edit always means a
 * real change. Returns null when nothing is left.
 */
export function sanitiseEdits(raw: unknown, generated: Proposal): ProposalEdits | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const ids = new Map<string, Block>();
  const keys = new Set<string>();
  for (const sec of generated.sections) {
    keys.add(sec.key);
    for (const b of sec.blocks) if (b.id && b.kind !== 'table') ids.set(b.id, b);
  }

  const blocks: Record<string, string | null> = {};
  if (r.blocks && typeof r.blocks === 'object') {
    for (const [id, v] of Object.entries(r.blocks as Record<string, unknown>)) {
      const gen = ids.get(id);
      if (!gen) continue;
      if (v === null) {
        blocks[id] = null;
      } else if (typeof v === 'string') {
        const t = v.replace(/\r\n?/g, '\n').trim().slice(0, MAX_TEXT);
        if (!t) blocks[id] = null;
        else if (t !== blockText(gen).trim()) blocks[id] = t;
      }
    }
  }

  const extra: Record<string, string> = {};
  if (r.extra && typeof r.extra === 'object') {
    for (const [k, v] of Object.entries(r.extra as Record<string, unknown>)) {
      if (!keys.has(k) || typeof v !== 'string') continue;
      const t = v.replace(/\r\n?/g, '\n').trim().slice(0, MAX_TEXT);
      if (t) extra[k] = t;
    }
  }

  const timeline = typeof r.timeline === 'string' ? r.timeline.trim().slice(0, 200) : '';
  const out: ProposalEdits = {};
  if (Object.keys(blocks).length) out.blocks = blocks;
  if (Object.keys(extra).length) out.extra = extra;
  if (timeline && timeline !== generated.timeline) out.timeline = timeline;
  return hasEdits(out) ? out : null;
}

/** File name for the download: OCE-Labs-Proposal-Acme-Dental.pdf */
export function proposalFileName(client: string) {
  const slug = client
    .replace(/\[.*?\]/g, '')
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-|-$/g, '');
  return `OCE-Labs-Proposal${slug ? `-${slug}` : ''}.pdf`;
}
