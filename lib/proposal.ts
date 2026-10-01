/*
 * The proposal's wording (client workflow, Part 4), built from a quote. Both
 * the on-screen preview and the PDF render this structure, so the two can't
 * say different things. Edit copy here.
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
  | { kind: 'p'; text: string; strong?: boolean; muted?: boolean }
  | { kind: 'table'; rows: Row[] }
  | { kind: 'list'; items: string[] };

export type Section = { n: number; title: string; blocks: Block[] };

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

export function buildProposal(q: Quote, now = new Date()): Proposal {
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
      title: 'Parties',
      blocks: [
        p(
          `This agreement is between ${studio} ("we", "us"), and ${client} ("you"). It covers the work described below and nothing else.`,
        ),
      ],
    },
    {
      n: 2,
      title: 'Scope',
      blocks: [
        p(`We will design, build and launch the following. ${q.pkg.blurb}`),
        { kind: 'table', rows: scope },
        p(`The ${q.pkg.label} includes:`),
        { kind: 'list', items: packageIncludes(input.kind, input.pages) },
        ...(input.notes.trim() ? [p(input.notes.trim(), { muted: true })] : []),
        ...((q.thirdParty ?? []).length
          ? [
              p(
                `Some features run on services you sign up for: ${q.thirdParty.join('; ')}. We set them up in your name and connect them to the ${thing}. Their fees are billed to you by the provider and are not part of this price.`,
              ),
            ]
          : []),
        p('Anything not listed here is outside the scope and is quoted separately.', { strong: true }),
      ],
    },
    {
      n: 3,
      title: 'Price and payment schedule',
      blocks: [
        p(
          q.payments.length === 1
            ? `The price is fixed at ${total}, payable in full on signature by emailed invoice. Bank transfer or card, from the link in the invoice.`
            : `The price is fixed at ${total}, payable in ${q.payments.length} parts by emailed invoice. Bank transfer or card, from the link in the invoice.`,
        ),
        { kind: 'table', rows: payments },
        ...(q.monthly > 0
          ? [
              p(
                `After launch, an optional retainer of ${usd.format(q.monthly)} per month covers updates, monitoring and support. It is billed monthly by subscription, starts only when you ask for it, and can be cancelled at any time.`,
              ),
            ]
          : []),
      ],
    },
    {
      n: 4,
      title: 'Timeline',
      blocks: [
        p(
          `The project takes ${timeline}. Kickoff is the day all four of these are in: the deposit has cleared, the questionnaire is returned, your logo and brand files are shared, and any existing copy you want kept is shared. We confirm the kickoff date and the launch date in writing on that day.`,
        ),
        p(
          `Any remaining content is due ${CONTENT_DEADLINE_DAYS} days after kickoff. Anything that arrives after that moves the launch date by the same number of days.`,
        ),
      ],
    },
    {
      n: 5,
      title: 'Reviews and revisions',
      blocks: [
        p(
          starter
            ? `There is one review point: a staging review of the full ${thing} on a private link before launch, with one round of changes. Feedback is collected in one email or one document from the one approver you name in the questionnaire.`
            : `There are two review points: a design review of the direction and key pages before development, and a staging review of the full ${thing} on a private link before launch. Each includes two rounds of revisions. Feedback for each round is collected in one email or one document from the one approver you name in the questionnaire.`,
        ),
      ],
    },
    {
      n: 6,
      title: 'Changes',
      blocks: [
        p(
          'Work outside the scope in section 2 is quoted as a written change order stating what it is, its price, and its effect on the launch date. It starts once you reply "approved" in writing, and it is added to the final invoice.',
        ),
      ],
    },
    {
      n: 7,
      title: 'Ownership',
      blocks: [
        p(
          `Once the final invoice is paid, you own the ${thing}, its code and its content. Until then it remains ours. Third-party fonts, libraries and services stay under their own licences. We may show the work in our portfolio and describe it publicly unless you ask us not to.`,
        ),
      ],
    },
    {
      n: 8,
      title: 'Cancellation',
      blocks: [
        p(
          'Either side can end this agreement with written notice. The deposit is non-refundable once work has started. Work completed beyond the deposit is billed at the point of cancellation, and anything paid for is handed over in its current state.',
        ),
      ],
    },
    {
      n: 9,
      title: 'Late payment',
      blocks: [
        p(
          `If an invoice is more than 7 days overdue, work pauses until it is paid, and the launch date moves by the length of the pause. The ${thing} goes live, and domain, repository and hosting access are transferred, only after the final invoice is paid.`,
        ),
      ],
    },
    {
      n: 10,
      title: 'After launch',
      blocks: [
        p(
          `For ${warrantyDays(input.kind)} days after launch we fix anything we missed at no charge. Ongoing updates and support after that are covered by an optional monthly retainer, which is separate from this agreement.`,
        ),
      ],
    },
    {
      n: 11,
      title: 'Validity',
      blocks: [
        p(
          `This proposal, its price and its start date are held until ${validUntil}, ${PROPOSAL_VALID_DAYS} days from the date above. After that we will re-quote.`,
        ),
      ],
    },
  ];

  return {
    client,
    legalName,
    studio,
    date: longDate.format(now),
    validUntil,
    total,
    timeline,
    sections,
  };
}

function p(text: string, opts: { strong?: boolean; muted?: boolean } = {}): Block {
  return { kind: 'p', text, ...opts };
}

/** File name for the download: OCE-Labs-Proposal-Acme-Dental.pdf */
export function proposalFileName(client: string) {
  const slug = client
    .replace(/\[.*?\]/g, '')
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-|-$/g, '');
  return `OCE-Labs-Proposal${slug ? `-${slug}` : ''}.pdf`;
}
