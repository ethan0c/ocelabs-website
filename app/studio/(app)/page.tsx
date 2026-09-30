import type { Metadata } from 'next';
import { nowMs } from '@/lib/now';
import Link from 'next/link';
import { STAGE_LABEL } from '@/lib/db/schema';
import { listLeads, quoteSummary } from '@/lib/studio';

export const metadata: Metadata = {
  title: 'Leads — OCE Labs Studio',
  robots: { index: false, follow: false },
};

const when = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });

/** The tracker. Open leads first, ordered by what is due soonest. */
export default async function LeadsPage({ searchParams }: { searchParams: Promise<{ all?: string }> }) {
  const { all } = await searchParams;
  const rows = await listLeads();
  const now = nowMs();
  const open = rows.filter((l) => !l.closedAt);
  const closed = rows.filter((l) => l.closedAt);
  const shown = all ? rows : open;
  shown.sort((a, b) => {
    if (a.closedAt && !b.closedAt) return 1;
    if (!a.closedAt && b.closedAt) return -1;
    return (a.nextActionAt?.getTime() ?? Infinity) - (b.nextActionAt?.getTime() ?? Infinity);
  });
  const due = open.filter((l) => l.nextActionAt && l.nextActionAt.getTime() <= now).length;

  return (
    <>
      <header className="shell page-head studio-head">
        <div>
          <p className="eyebrow rise rise-1">Studio</p>
          <h1 className="h1 rise rise-2">Leads.</h1>
          <p className="lede rise rise-3">
            {open.length} open{due ? `, ${due} due now` : ''}. {closed.length} closed.{' '}
            {all ? <Link href="/studio" className="ulink">Hide closed</Link> : <Link href="/studio?all=1" className="ulink">Show closed</Link>}
          </p>
        </div>
        <Link href="/studio/leads/new" className="btn">
          Add a lead
        </Link>
      </header>

      <section className="shell studio-body">
        {!shown.length && <p className="empty">No leads yet. The contact form creates them.</p>}
        {shown.length > 0 && (
          <div className="tbl-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Lead</th>
                  <th>Stage</th>
                  <th>Next</th>
                  <th>Quote</th>
                  <th>Since</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((l) => {
                  const overdue = !l.closedAt && l.nextActionAt && l.nextActionAt.getTime() <= now;
                  const q = quoteSummary(l.quote);
                  return (
                    <tr key={l.id} data-closed={l.closedAt ? 'true' : undefined}>
                      <td>
                        <Link href={`/studio/leads/${l.id}`} className="tbl-link">
                          {l.company || l.name || l.email}
                        </Link>
                        <span className="tbl-sub">
                          {l.company && l.name ? `${l.name} · ` : ''}
                          <a href={`mailto:${l.email}`} className="ulink ulink--muted">{l.email}</a>
                        </span>
                        {l.summary && <span className="tbl-sub">{l.summary}</span>}
                      </td>
                      <td>
                        <span className="pill-stage" data-stage={l.stage}>
                          {STAGE_LABEL[l.stage]}
                        </span>
                      </td>
                      <td data-overdue={overdue || undefined}>
                        {l.nextAction ?? '—'}
                        {l.nextActionAt && <span className="tbl-sub">{when.format(l.nextActionAt)}</span>}
                      </td>
                      <td>{q ? `${q.total} · ${q.pkg}` : '—'}</td>
                      <td>{when.format(l.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
