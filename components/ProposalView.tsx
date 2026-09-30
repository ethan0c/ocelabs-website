import { STUDIO_EMAIL, type Block, type Proposal } from '@/lib/proposal';

/*
 * The agreement on screen, from lib/proposal.ts — the same structure the
 * PDF renders. Used by the internal preview and the client's signing page.
 */
export default function ProposalView({
  pr,
  signed,
}: {
  pr: Proposal;
  /** When signed, the signature blocks show who and when instead of lines. */
  signed?: { signerName: string; signedAt: Date; studioSigner: string } | null;
}) {
  const stamp = (d: Date) => d.toISOString().replace('T', ' ').slice(0, 16) + ' UTC';
  return (
    <article className="prop">
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
            {signed ? <p className="prop-signed">{signed.studioSigner}</p> : <p className="prop-sign-line" />}
            <p>{pr.studio}</p>
            <p className="prop-sign-meta">
              {signed ? `Accepted electronically, ${stamp(signed.signedAt)}` : 'Name, title, date'}
            </p>
          </div>
          <div>
            {signed ? <p className="prop-signed">{signed.signerName}</p> : <p className="prop-sign-line" />}
            <p>{pr.client}</p>
            <p className="prop-sign-meta">
              {signed ? `Signed electronically, ${stamp(signed.signedAt)}` : 'Name, title, date'}
            </p>
          </div>
        </div>
      </section>

      <footer className="prop-foot">
        <p>
          {pr.studio} ·{' '}
          <a href={`mailto:${STUDIO_EMAIL}`} className="text-link">
            {STUDIO_EMAIL}
          </a>
        </p>
      </footer>
    </article>
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
  if (b.kind === 'list') {
    return (
      <ul className="prop-list">
        {b.items.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
    );
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
