import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import Link from 'next/link';
import PinForm from '@/components/PinForm';
import { COOKIE, isValid } from '../auth';
import { computeQuote, decodeInput, encodeInput } from '@/lib/pricing';
import { STUDIO_EMAIL, buildProposal, type Block } from '@/lib/proposal';

export const metadata: Metadata = {
  title: 'Proposal — OCE Labs',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

/*
 * On-screen preview of the proposal. The wording comes from lib/proposal.ts,
 * the same source the PDF route renders, so what is read here is what gets
 * signed. Download gives the PDF; nothing is printed from the browser.
 */

type Props = { searchParams: Promise<{ q?: string }> };

export default async function ProposalPage({ searchParams }: Props) {
  const jar = await cookies();
  if (!isValid(jar.get(COOKIE)?.value)) {
    return (
      <header className="shell page-head">
        <p className="eyebrow rise rise-1">Internal</p>
        <h1 className="h1 rise rise-2">Proposal.</h1>
        <div className="rise rise-3">
          <PinForm />
        </div>
      </header>
    );
  }

  const q = (await searchParams).q;
  const input = decodeInput(q);
  if (!input) {
    return (
      <header className="shell page-head">
        <p className="eyebrow rise rise-1">Internal</p>
        <h1 className="h1 rise rise-2">No quote.</h1>
        <p className="lede rise rise-3">
          Build one in the <Link href="/pricing" className="ulink">estimator</Link> and open the
          proposal from there.
        </p>
      </header>
    );
  }

  const pr = buildProposal(computeQuote(input));
  const encoded = encodeInput(input);

  return (
    <>
      <div className="shell prop-bar">
        <Link href={`/pricing?q=${encoded}`} className="btn">
          &larr; Edit quote
        </Link>
        <a className="btn btn--primary" href={`/pricing/proposal/pdf?q=${encoded}`}>
          Download PDF
        </a>
      </div>

      <article className="shell prop">
        <header className="prop-head">
          <p className="eyebrow">OCE Labs · Proposal and agreement</p>
          <h1 className="prop-title">{pr.client}</h1>
          <dl className="prop-facts">
            <div>
              <dt>Date</dt>
              <dd>{pr.date}</dd>
            </div>
            <div>
              <dt>Valid until</dt>
              <dd>{pr.validUntil}</dd>
            </div>
            <div>
              <dt>Fixed price</dt>
              <dd>{pr.total}</dd>
            </div>
            <div>
              <dt>Timeline</dt>
              <dd>{pr.timeline}</dd>
            </div>
          </dl>
        </header>

        {pr.sections.map((sec) => (
          <section key={sec.n} className="prop-sec">
            <h2>
              {sec.n}. {sec.title}
            </h2>
            {sec.blocks.map((b, i) => (
              <BlockView key={i} b={b} />
            ))}
          </section>
        ))}

        <section className="prop-sec">
          <h2>{pr.sections.length + 1}. Signatures</h2>
          <div className="prop-sign">
            <div>
              <p className="prop-sign-line" />
              <p>{pr.studio}</p>
              <p className="prop-sign-meta">Name, title, date</p>
            </div>
            <div>
              <p className="prop-sign-line" />
              <p>{pr.client}</p>
              <p className="prop-sign-meta">Name, title, date</p>
            </div>
          </div>
        </section>

        <footer className="prop-foot">
          <p>
            {pr.studio} · {STUDIO_EMAIL}
          </p>
        </footer>
      </article>
    </>
  );
}

function BlockView({ b }: { b: Block }) {
  if (b.kind === 'p') {
    if (b.strong) {
      return (
        <p>
          <strong>{b.text}</strong>
        </p>
      );
    }
    return <p className={b.muted ? 'prop-notes' : undefined}>{b.text}</p>;
  }
  return (
    <table className="prop-table">
      <tbody>
        {b.rows.map((r, i) => (
          <tr key={i} className={r.total ? 'prop-table-total' : undefined}>
            <td>
              {r.label}
              {r.note && <span className="prop-table-note">{r.note}</span>}
            </td>
            <td>{r.amount}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
