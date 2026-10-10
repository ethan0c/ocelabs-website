import type { Metadata } from 'next';
import { nowMs } from '@/lib/now';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { STAGES, STAGE_LABEL } from '@/lib/db/schema';
import { PACKAGES, computeQuote, encodeInput, usd, weeksLabel, type Kind } from '@/lib/pricing';
import { hasEdits } from '@/lib/proposal';
import { leadDetail, proposalLink, questionnaireLink, quoteSummary, retainerDashboard } from '@/lib/studio';
import { QUESTIONS } from '@/app/q/[token]/questions';
import Action from './Action';
import RecapForm from './RecapForm';

export const metadata: Metadata = { title: 'Lead — OCE Labs Studio', robots: { index: false } };
export const dynamic = 'force-dynamic';

const when = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' });
const day = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' });

/*
 * One lead, top to bottom: who, where they are, what happens next, and the
 * record of everything so far. Buttons appear for the stage the lead is in;
 * the doc's ten stages map to the sections below.
 */
export default async function LeadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const d = await leadDetail(id);
  if (!d) notFound();
  const { lead, log, proposals, payments } = d;
  const q = quoteSummary(lead.quote);
  const deposit = payments.find((p) => p.stageIndex === 0);
  const live = proposals.find((p) => p.status === 'sent' || p.status === 'signed');
  const sentA = log.some((e) => e.kind === 'email:A');
  const kickoffReady = [
    { label: 'Deposit paid', done: deposit?.status === 'paid' },
    { label: 'Questionnaire returned', done: Boolean(lead.questionnaireAt) },
    { label: 'Brand files received', done: Boolean(lead.brandFilesAt), action: 'brandFiles' },
    { label: 'Existing copy received', done: Boolean(lead.copyAt), action: 'copy' },
  ];
  const estimatorHref = lead.quote
    ? `/pricing?lead=${lead.id}&q=${encodeInput(lead.quote)}`
    : `/pricing?lead=${lead.id}`;

  return (
    <>
      <header className="shell page-head studio-head">
        <div>
          <p className="eyebrow rise rise-1">
            <Link href="/studio">Leads</Link> · {STAGE_LABEL[lead.stage]}
          </p>
          <h1 className="h1 rise rise-2">{lead.company || lead.name || lead.email}</h1>
          <p className="lede rise rise-3">
            {lead.name && lead.company ? `${lead.name} · ` : ''}
            <a href={`mailto:${lead.email}`} className="ulink">{lead.email}</a>
            {lead.budget ? ` · budget ${lead.budget}` : ''} · via {lead.source} · {day.format(lead.createdAt)}
          </p>
        </div>
        <div className="studio-next">
          <p className="eyebrow">Next</p>
          <p>{lead.nextAction ?? '—'}</p>
          {lead.nextActionAt && (
            <p className="tbl-sub" data-overdue={lead.nextActionAt.getTime() <= nowMs() || undefined}>
              {when.format(lead.nextActionAt)}
            </p>
          )}
        </div>
      </header>

      <div className="shell studio-body studio-grid">
        <div className="studio-main">
          {(lead.message || lead.summary) && (
            <section className="studio-sec">
              <h2 className="eyebrow">What they want</h2>
              {lead.summary && <p className="studio-summary">{lead.summary}</p>}
              {lead.message && <p className="studio-msg">{lead.message}</p>}
            </section>
          )}

          {/* Stage 1–2 */}
          {(lead.stage === 'new' || lead.stage === 'call_booked') && (
            <section className="studio-sec">
              <h2 className="eyebrow">Inquiry and call</h2>
              <div className="act-row">
                {!sentA && (
                  <Action id={id} action="emailA" label="Send Email A (booking link)" primary>
                    <div className="field field--inline">
                      <label htmlFor="topic">What they wrote about</label>
                      <input id="topic" name="topic" type="text" placeholder="a site for the dental practice" />
                    </div>
                  </Action>
                )}
                {sentA && lead.stage === 'new' && <Action id={id} action="emailA2" label="Send nudge (A2)" />}
                <Action id={id} action="bookCall" label="Set call time">
                  <div className="field field--inline">
                    <label htmlFor="callAt">Call (if booked outside Cal.com)</label>
                    <input id="callAt" name="callAt" type="datetime-local" defaultValue={lead.callAt ? lead.callAt.toISOString().slice(0, 16) : ''} />
                  </div>
                </Action>
              </div>
            </section>
          )}

          {/* Stage 3 */}
          {(lead.stage === 'call_booked' || lead.stage === 'recap_sent') && !lead.questionnaireAt && (
            <section className="studio-sec">
              <h2 className="eyebrow">Recap (Email B)</h2>
              {lead.questionnaireToken && (
                <p className="tbl-sub">Questionnaire link: <a className="ulink" href={questionnaireLink(lead.questionnaireToken)}>{questionnaireLink(lead.questionnaireToken)}</a></p>
              )}
              {lead.stage === 'call_booked' && <RecapForm id={id} saved={lead.questionnaire ?? {}} />}
            </section>
          )}

          {/* Stage 4 */}
          {!['closed_won', 'closed_lost'].includes(lead.stage) && (
            <section className="studio-sec">
              <h2 className="eyebrow">Quote and proposal</h2>
              {q ? (
                <p>
                  <strong>{q.total}</strong> · {q.pkg} · {q.weeks} · deposit {q.deposit}
                </p>
              ) : (
                <p className="tbl-sub">No quote yet. Build it in the estimator from the questionnaire answers; it saves to this lead.</p>
              )}
              {q && hasEdits(lead.proposalEdits) && (
                <p className="tbl-sub">The wording has been edited for this lead; the next proposal goes out with those changes.</p>
              )}
              <div className="act-row">
                <Link href={estimatorHref} className="btn">
                  {q ? 'Edit quote' : 'Build quote'}
                </Link>
                {q && (
                  <>
                    <Link href={`/studio/leads/${id}/proposal`} className="btn">
                      {hasEdits(lead.proposalEdits) ? 'Edit wording · edited' : 'Edit wording'}
                    </Link>
                    <Link href={`/studio/leads/${id}/proposal?preview=1`} className="btn">
                      Preview proposal
                    </Link>
                  </>
                )}
                {q && !live?.signedAt && (
                  <Action
                    id={id}
                    action="proposal"
                    label={live ? 'Send a new proposal' : 'Send proposal (Email C)'}
                    primary
                    confirm={live ? 'This voids the current unsigned proposal and sends a fresh one. Continue?' : undefined}
                  />
                )}
              </div>
              {proposals.length > 0 && (
                <ul className="studio-list">
                  {proposals.map((p) => (
                    <li key={p.id}>
                      <span>
                        {p.status} · {day.format(p.createdAt)} · held until {day.format(p.expiresAt)}
                        {p.viewedAt ? ` · viewed ${day.format(p.viewedAt)}` : ''}
                        {p.signedAt ? ` · signed by ${p.signerName} on ${day.format(p.signedAt)}` : ''}
                      </span>
                      <span className="studio-list-links">
                        <a className="ulink" href={proposalLink(p.token)}>link</a>
                        <a className="ulink" href={`/p/${p.token}/pdf`}>pdf</a>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {/* Stage 5–6 */}
          {['signed', 'kickoff'].includes(lead.stage) && (
            <section className="studio-sec">
              <h2 className="eyebrow">Kickoff — starts by itself when all four are in</h2>
              <ul className="studio-check">
                {kickoffReady.map((k) => (
                  <li key={k.label} data-done={k.done || undefined}>
                    <span>{k.done ? '✓' : '○'} {k.label}</span>
                    {!k.done && k.action && <Action id={id} action={k.action} label="Mark received" />}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Stage 7–8 */}
          {['building', 'review'].includes(lead.stage) && (
            <section className="studio-sec">
              <h2 className="eyebrow">Build</h2>
              <p className="tbl-sub">
                Kickoff {lead.kickoffAt ? day.format(lead.kickoffAt) : '—'} · launch {lead.launchAt ? day.format(lead.launchAt) : '—'}. Friday updates are drafted into Gmail.
              </p>
              <div className="act-row">
                {!lead.designApprovedAt && <Action id={id} action="designApproved" label="Design approved" />}
                {!lead.stagingApprovedAt && (
                  <Action id={id} action="stagingApproved" label="Staging approved → final invoice + Email G" primary confirm="This sends the final invoice. Continue?">
                    {[1, 2, 3].map((n) => (
                      <div key={n} className="field field--inline field--pair">
                        <input name={`co${n}`} type="text" placeholder={`Change order ${n} (optional)`} aria-label={`Change order ${n}`} />
                        <input name={`co${n}a`} type="number" min={0} placeholder="$" aria-label={`Change order ${n} amount`} />
                      </div>
                    ))}
                  </Action>
                )}
                {lead.stagingApprovedAt && (
                  <Action id={id} action="launched" label="Live → send handover (Email H)" primary>
                    {[
                      ['domain', 'Live domain', 'example.com'],
                      ['analyticsLink', 'Analytics link', ''],
                      ['repoLink', 'Repository link', ''],
                      ['hostingLink', 'Hosting link', ''],
                      ['searchConsoleLink', 'Search Console link', ''],
                    ].map(([n, l, ph]) => (
                      <div key={n} className="field field--inline">
                        <label htmlFor={n}>{l}</label>
                        <input id={n} name={n} type="text" placeholder={ph} defaultValue={n === 'domain' ? lead.domain ?? '' : ''} />
                      </div>
                    ))}
                  </Action>
                )}
              </div>
            </section>
          )}

          {lead.stage === 'launched' && (
            <section className="studio-sec">
              <h2 className="eyebrow">Live</h2>
              <p className="tbl-sub">
                {lead.domain ? (
                  <a href={`https://${lead.domain.replace(/^https?:\/\//, '')}`} target="_blank" rel="noopener noreferrer" className="ulink">
                    {lead.domain}
                  </a>
                ) : (
                  'The site'
                )}{' '}
                live since {lead.handoverAt ? day.format(lead.handoverAt) : '—'}. The day-30 email is drafted into Gmail on the day.
              </p>
              <Action id={id} action="closeWon" label="Close, won" />
            </section>
          )}

          {/* Retainer */}
          {(['launched', 'closed_won'].includes(lead.stage) || lead.retainerSubId) && (
            <section className="studio-sec">
              <h2 className="eyebrow">Retainer</h2>
              {lead.retainerSubId && lead.retainerStatus !== 'ended' ? (
                <>
                  <p>
                    {usd.format(lead.retainerMonthly ?? 0)}/mo · {lead.retainerStatus === 'ending' ? 'cancelled, runs to the end of the paid month' : 'active'}
                    {lead.retainerStartAt ? ` · from ${day.format(lead.retainerStartAt)}` : ''}
                  </p>
                  <div className="act-row">
                    <a className="btn" href={retainerDashboard(lead.retainerSubId)} target="_blank" rel="noopener noreferrer">
                      Open in Stripe <span aria-hidden="true">&#8599;</span>
                    </a>
                    {lead.retainerStatus === 'active' && (
                      <Action id={id} action="retainerStop" label="Cancel retainer" confirm="Cancel at the end of the current paid month and email the client?" />
                    )}
                  </div>
                </>
              ) : (
                <Action id={id} action="retainerStart" label="Start retainer" primary confirm="Create the subscription in Stripe and email the client the terms?">
                  <div className="field field--inline field--pair">
                    <input name="monthly" type="number" min={1} step={50} defaultValue={lead.quote ? computeQuote(lead.quote).monthly || 300 : 300} aria-label="Monthly price" />
                    <input name="startAt" type="date" defaultValue={retainerStartDefault(lead.handoverAt)} aria-label="Start date" />
                  </div>
                  <p className="tbl-sub">Monthly price and start date. Stripe emails an invoice on that date each month, due in 7 days.</p>
                </Action>
              )}
            </section>
          )}

          {/* Payments */}
          {payments.length > 0 && (
            <section className="studio-sec">
              <h2 className="eyebrow">Payments</h2>
              <ul className="studio-list">
                {payments.map((p) => (
                  <li key={p.id}>
                    <span>
                      {p.label} {p.pct}% · {usd.format(p.amount)} · {p.status}
                      {p.paidAt ? ` ${day.format(p.paidAt)}` : p.sentAt ? ` ${day.format(p.sentAt)}` : ''}
                    </span>
                    {p.stripeUrl && (
                      <a className="ulink" href={p.stripeUrl} target="_blank" rel="noopener noreferrer">
                        Stripe
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Questionnaire */}
          {lead.questionnaire && (
            <section className="studio-sec">
              <h2 className="eyebrow">
                {lead.questionnaireAt ? `Questionnaire · ${day.format(lead.questionnaireAt)}` : 'Questionnaire · pre-filled by us, not returned yet'}
              </h2>
              <dl className="studio-qa">
                {lead.questionnaire._call_notes && (<><dt>Call notes (ours)</dt><dd>{lead.questionnaire._call_notes}</dd></>)}
                {lead.questionnaire.contact_name && (<><dt>Name</dt><dd>{lead.questionnaire.contact_name}</dd></>)}
                {lead.questionnaire.company && (<><dt>Legal name</dt><dd>{lead.questionnaire.company}</dd></>)}
                {QUESTIONS.flatMap((g) => g.items).map((qq) =>
                  lead.questionnaire?.[qq.id] ? (
                    <div key={qq.id}>
                      <dt>{qq.text}</dt>
                      <dd>{lead.questionnaire[qq.id]}</dd>
                    </div>
                  ) : null,
                )}
              </dl>
            </section>
          )}
        </div>

        <aside className="studio-side">
          <section className="studio-sec">
            <h2 className="eyebrow">Details</h2>
            <Action id={id} action="details" label="Save details">
              {[
                ['name', 'Name', lead.name],
                ['company', 'Company', lead.company],
                ['email', 'Email', lead.email],
                ['source', 'Source', lead.source],
                ['budget', 'Budget', lead.budget],
              ].map(([n, l, v]) => (
                <div key={n} className="field field--inline">
                  <label htmlFor={`d-${n}`}>{l}</label>
                  <input id={`d-${n}`} name={n as string} type={n === 'email' ? 'email' : 'text'} defaultValue={v ?? ''} placeholder={n === 'budget' ? '$3,000 to $6,000' : ''} />
                </div>
              ))}
            </Action>
          </section>

          <section className="studio-sec">
            <h2 className="eyebrow">Notes</h2>
            <Action id={id} action="notes" label="Save notes">
              <textarea name="notes" rows={5} defaultValue={lead.notes ?? ''} aria-label="Notes" />
            </Action>
          </section>

          <section className="studio-sec">
            <h2 className="eyebrow">Stage</h2>
            <Action id={id} action="stage" label="Set">
              <select name="stage" defaultValue={lead.stage} aria-label="Stage">
                {STAGES.map((s) => (
                  <option key={s} value={s}>{STAGE_LABEL[s]}</option>
                ))}
              </select>
              <input name="nextAction" type="text" placeholder="Next action" aria-label="Next action" />
            </Action>
            {!lead.closedAt && (
              <Action id={id} action="closeLost" label="Close, lost" confirm="Close this lead as lost?" />
            )}
          </section>

          <section className="studio-sec">
            <h2 className="eyebrow">Log</h2>
            <ul className="studio-log">
              {log.map((e) => (
                <li key={e.id}>
                  <span className="tbl-sub">{when.format(e.at)}</span>
                  <span>{e.kind}</span>
                  {e.detail && 'error' in e.detail && <span className="tbl-sub">{String(e.detail.error)}</span>}
                  {e.detail && 'reason' in e.detail && <span className="tbl-sub">{String(e.detail.reason)}</span>}
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </>
  );
}

/** Day 30 after handover (when the included fixes end), or today if that has passed. */
function retainerStartDefault(handoverAt: Date | null) {
  const d = handoverAt ? new Date(handoverAt.getTime() + 30 * 86400_000) : new Date();
  const start = d.getTime() < nowMs() ? new Date(nowMs()) : d;
  return start.toISOString().slice(0, 10);
}
