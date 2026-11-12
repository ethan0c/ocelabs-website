'use client';

import { useMemo, useState, useTransition } from 'react';
import { emailCTemplate, emailCWithEdits } from '@/lib/emails';
import { usd, type Quote } from '@/lib/pricing';
import { blockText, quoteWithProposalEdits, type Block, type EditablePayment, type Proposal, type ProposalEdits, type Row } from '@/lib/proposal';
import { clearEdits, saveEdits, type EditState } from './actions';

/** What each generated block is, in the editor's labels. Anything else is "Paragraph". */
const LABELS: Record<string, string> = {
  'parties.p': 'Who the agreement is between',
  'scope.intro': 'Opening line',
  'scope.includes-intro': 'Lead-in to the included list',
  'scope.includes': 'What is included, one item per line',
  'scope.notes': 'Notes from the estimator',
  'scope.third-party': 'Outside services',
  'scope.outside': 'Outside-scope line',
  'price.intro': 'How the price is paid',
  'price.retainer': 'Retainer',
  'timeline.kickoff': 'Kickoff',
  'timeline.content': 'Content deadline',
  'validity.p': 'Validity (the date is set on the day it is sent; leave this as generated unless you must)',
};

const HELP = 'Blank line between paragraphs. Start lines with "- " for a list. Empty removes it.';

type Field = { id: string; block: Block; text: string };

/**
 * One textarea per paragraph or list of the generated proposal, prefilled
 * with the current wording, plus an "add to this section" box per section.
 * Saving sends only what differs from the generated text; the server checks
 * that again before it keeps anything.
 */
export default function ProposalEditor({
  id, generated, quote, edits, emailContext,
}: {
  id: string;
  generated: Proposal;
  quote: Quote;
  edits: ProposalEdits | null;
  emailContext: { name: string | null; company: string; signer: string; bookingLink: string; validUntil: string };
}) {
  const fields = useMemo(() => {
    const out = new Map<string, Field>();
    for (const sec of generated.sections) {
      for (const b of sec.blocks) if (b.id && b.kind !== 'table') out.set(b.id, { id: b.id, block: b, text: blockText(b) });
    }
    return out;
  }, [generated]);

  const [values, setValues] = useState<Record<string, string>>(() => {
    const v: Record<string, string> = {};
    for (const f of fields.values()) {
      const e = edits?.blocks?.[f.id];
      v[f.id] = e === undefined ? f.text : (e ?? '');
    }
    return v;
  });
  const [extra, setExtra] = useState<Record<string, string>>(() => ({ ...(edits?.extra ?? {}) }));
  const [timeline, setTimeline] = useState(edits?.timeline ?? generated.timeline);
  const [customSchedule, setCustomSchedule] = useState(Boolean(edits?.payments?.length));
  const [payments, setPayments] = useState<EditablePayment[]>(() =>
    edits?.payments?.map((p) => ({ ...p })) ?? quote.payments.map((p) => ({ label: p.label, amount: p.amount, trigger: p.trigger, dueDays: p.dueDays })),
  );
  const [emailSubject, setEmailSubject] = useState<string | null>(edits?.email?.subject ?? null);
  const [emailBody, setEmailBody] = useState<string | null>(edits?.email?.body ?? null);
  const [state, setState] = useState<EditState>({});
  const [pending, start] = useTransition();
  const customPriceIntro = `The price is fixed at ${usd.format(quote.total)}, payable by emailed invoice according to the custom payment schedule below. Bank transfer or card, from the link in each invoice.`;
  const toggleCustomSchedule = (on: boolean) => {
    setCustomSchedule(on);
    setValues((current) => {
      const next = { ...current };
      const original = fields.get('price.intro')?.text;
      if (on && original && next['price.intro'] === original) next['price.intro'] = customPriceIntro;
      if (!on && next['price.intro'] === customPriceIntro && original) next['price.intro'] = original;
      return next;
    });
  };

  const scheduleTotal = payments.reduce((sum, p) => sum + (Number.isFinite(p.amount) ? p.amount : 0), 0);
  const scheduleValid = !customSchedule || (payments.length > 0 && payments.length <= 12 && scheduleTotal === quote.total && payments.every((p) => p.label.trim() && p.trigger.trim() && Number.isInteger(p.amount) && p.amount > 0 && Number.isInteger(p.dueDays) && p.dueDays >= 0 && p.dueDays <= 90));
  const liveQuote = useMemo(() => {
    if (!customSchedule || !scheduleValid) return quote;
    return quoteWithProposalEdits(quote, { payments });
  }, [quote, customSchedule, scheduleValid, payments]);
  const defaultEmail = useMemo(() => emailCTemplate({
    name: emailContext.name,
    company: emailContext.company,
    q: liveQuote,
    signer: emailContext.signer,
    timeline,
  }), [emailContext.name, emailContext.company, emailContext.signer, liveQuote, timeline]);
  const subject = emailSubject ?? defaultEmail.subject;
  const body = emailBody ?? defaultEmail.text;
  const emailReady = Boolean(subject.trim()) && body.includes('{{proposal_link}}');
  const emailPreview = emailReady ? emailCWithEdits({
    name: emailContext.name,
    company: emailContext.company,
    q: liveQuote,
    signer: emailContext.signer,
    timeline,
    proposalLink: 'https://www.ocelabs.xyz/p/[created-when-sent]',
    validUntil: emailContext.validUntil,
    calLink: emailContext.bookingLink,
  }, { subject, body }) : null;

  const changed = (f: Field) => (values[f.id] ?? '').trim() !== f.text.trim();
  const dirty =
    [...fields.values()].some(changed) ||
    Object.values(extra).some((v) => v.trim()) ||
    timeline.trim() !== generated.timeline ||
    customSchedule || Boolean(edits?.payments?.length) ||
    Boolean(edits?.email) ||
    (emailSubject !== null && emailSubject.trim() !== defaultEmail.subject) ||
    (emailBody !== null && emailBody.trim() !== defaultEmail.text);

  const save = () =>
    start(async () => {
      const blocks: Record<string, string | null> = {};
      for (const f of fields.values()) {
        if (!changed(f)) continue;
        const t = (values[f.id] ?? '').trim();
        blocks[f.id] = t ? t : null;
      }
      const email = {
        ...(emailSubject !== null && emailSubject.trim() !== defaultEmail.subject ? { subject: emailSubject } : {}),
        ...(emailBody !== null && emailBody.trim() !== defaultEmail.text ? { body: emailBody } : {}),
      };
      setState(await saveEdits(id, {
        blocks, extra, timeline,
        ...(customSchedule ? { payments } : {}),
        ...(Object.keys(email).length ? { email } : {}),
      }));
    });

  const reset = () => {
    if (!window.confirm('Drop every change and go back to the generated wording?')) return;
    start(async () => {
      const r = await clearEdits(id);
      if (!r.error) {
        const v: Record<string, string> = {};
        for (const f of fields.values()) v[f.id] = f.text;
        setValues(v);
        setExtra({});
        setTimeline(generated.timeline);
        setCustomSchedule(false);
        setPayments(quote.payments.map((p) => ({ label: p.label, amount: p.amount, trigger: p.trigger, dueDays: p.dueDays })));
        setEmailSubject(null);
        setEmailBody(null);
      }
      setState(r);
    });
  };

  const rows = (t: string) => Math.min(14, Math.max(2, Math.ceil(t.length / 90) + (t.match(/\n/g)?.length ?? 0)));

  return (
    <div className="ped">
      <div className="ped-bar">
        <button type="button" className="btn btn--primary" onClick={save} disabled={pending || !dirty || !scheduleValid || !emailReady}>
          {pending ? 'Working…' : 'Save wording'}
        </button>
        <button type="button" className="btn" onClick={reset} disabled={pending}>
          Reset all to generated
        </button>
        {(state.ok || state.error) && (
          <p className="form-note act-note" data-kind={state.error ? 'error' : 'ok'} role="status">
            {state.error ?? state.ok}
          </p>
        )}
      </div>

      <section className="studio-sec">
        <h2 className="eyebrow">Header</h2>
        <div className="field ped-field" data-changed={timeline.trim() !== generated.timeline || undefined}>
          <label htmlFor="ped-timeline">Timeline, as shown at the top{timeline.trim() !== generated.timeline ? ' · edited' : ''}</label>
          <input id="ped-timeline" type="text" value={timeline} onChange={(e) => setTimeline(e.target.value)} />
          {timeline.trim() !== generated.timeline && (
            <div className="ped-tools">
              <button type="button" className="btn btn--sm" onClick={() => setTimeline(generated.timeline)}>
                Reset
              </button>
              <span className="tbl-sub">Generated: {generated.timeline}</span>
            </div>
          )}
        </div>
      </section>

      <section className="studio-sec">
        <h2 className="eyebrow">Payment schedule</h2>
        <p className="tbl-sub">These amounts appear in the agreement and become the Stripe invoice schedule after signing. Total: {usd.format(quote.total)}.</p>
        <label className="field field--inline">
          <input type="checkbox" checked={customSchedule} onChange={(e) => toggleCustomSchedule(e.target.checked)} />
          Use custom payments for this proposal
        </label>
        {customSchedule && (
          <>
            {payments.map((payment, i) => (
              <div className="studio-sec" key={i}>
                <p className="eyebrow">Payment {i + 1}</p>
                <div className="field"><label htmlFor={`ped-pay-label-${i}`}>Label</label><input id={`ped-pay-label-${i}`} value={payment.label} onChange={(e) => setPayments((rows) => rows.map((row, j) => j === i ? { ...row, label: e.target.value } : row))} /></div>
                <div className="field"><label htmlFor={`ped-pay-amount-${i}`}>Amount ($)</label><input id={`ped-pay-amount-${i}`} type="number" min={1} step={1} value={payment.amount} onChange={(e) => setPayments((rows) => rows.map((row, j) => j === i ? { ...row, amount: Number(e.target.value) || 0 } : row))} /></div>
                <div className="field"><label htmlFor={`ped-pay-trigger-${i}`}>When to invoice</label><input id={`ped-pay-trigger-${i}`} value={payment.trigger} onChange={(e) => setPayments((rows) => rows.map((row, j) => j === i ? { ...row, trigger: e.target.value } : row))} /></div>
                <div className="field"><label htmlFor={`ped-pay-due-${i}`}>Days until due (0 = on receipt)</label><input id={`ped-pay-due-${i}`} type="number" min={0} max={90} step={1} value={payment.dueDays} onChange={(e) => setPayments((rows) => rows.map((row, j) => j === i ? { ...row, dueDays: Number(e.target.value) || 0 } : row))} /></div>
                <button type="button" className="btn btn--sm" onClick={() => setPayments((rows) => rows.filter((_, j) => j !== i))}>Remove payment</button>
              </div>
            ))}
            <button type="button" className="btn btn--sm" disabled={payments.length >= 12} onClick={() => setPayments((rows) => [...rows, { label: '', amount: 0, trigger: '', dueDays: 7 }])}>Add payment</button>
            <p className="tbl-sub" role="status">Entered: {usd.format(scheduleTotal)} of {usd.format(quote.total)}{scheduleValid ? ' · ready to save' : ' · amounts and fields must be complete before saving'}</p>
            <p className="tbl-sub">After signing, the first invoice goes out automatically unless a payment was already recorded. Send remaining invoices from the lead page when each phase is approved.</p>
          </>
        )}
      </section>

      <section className="studio-sec">
        <h2 className="eyebrow">Proposal email (Email C)</h2>
        <p className="tbl-sub">Edit the subject and body sent with the proposal. Keep <code>{'{{proposal_link}}'}</code> in the body. <code>{'{{valid_until}}'}</code> and <code>{'{{booking_link}}'}</code> are filled when the email is sent.</p>
        <div className="field"><label htmlFor="ped-email-subject">Subject</label><input id="ped-email-subject" value={subject} onChange={(e) => setEmailSubject(e.target.value)} /></div>
        <div className="field"><label htmlFor="ped-email-body">Body</label><textarea id="ped-email-body" rows={14} value={body} onChange={(e) => setEmailBody(e.target.value)} /></div>
        {!emailReady && <p className="form-note" role="alert">Add a subject and keep {'{{proposal_link}}'} in the body.</p>}
        <button type="button" className="btn btn--sm" onClick={() => { setEmailSubject(null); setEmailBody(null); }}>Reset email to generated</button>
        {emailPreview && <div className="studio-sec"><p className="eyebrow">Preview if sent today</p><p><strong>Subject:</strong> {emailPreview.subject}</p><pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{emailPreview.text}</pre></div>}
      </section>

      {generated.sections.map((sec) => (
        <section key={sec.key} className="studio-sec">
          <h2 className="eyebrow">
            {sec.n}. {sec.title}
          </h2>
          {sec.blocks.map((b, i) => {
            if (b.kind === 'table') {
              const rows: Row[] = b.id === 'price.payments' && scheduleValid
                ? liveQuote.payments.map((p) => ({
                    label: p.pct ? `${p.label}, ${p.pct}%` : p.label,
                    note: `${p.trigger}. Due ${p.dueDays === 0 ? 'on receipt' : `in ${p.dueDays} days`}.`,
                    amount: usd.format(p.amount),
                  }))
                : b.rows;
              return (
                <div key={b.id ?? i} className="ped-table">
                  <table className="prop-table">
                    <tbody>
                      {rows.map((r, j) => (
                        <tr key={j} className={r.total ? 'prop-table-total' : undefined}>
                          <td>
                            {r.label}
                            {r.note && <span className="prop-table-note">{r.note}</span>}
                          </td>
                          <td>{r.amount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="tbl-sub">{b.id === 'price.payments' ? 'Edit the schedule above.' : 'Scope prices come from the estimator.'}</p>
                </div>
              );
            }
            const f = b.id ? fields.get(b.id) : undefined;
            if (!f) return null;
            const isChanged = changed(f);
            const v = values[f.id] ?? '';
            return (
              <div key={f.id} className="field ped-field" data-changed={isChanged || undefined}>
                <label htmlFor={`ped-${f.id}`}>
                  {LABELS[f.id] ?? 'Paragraph'}
                  {isChanged ? (v.trim() ? ' · edited' : ' · removed') : ''}
                </label>
                <textarea
                  id={`ped-${f.id}`}
                  rows={rows(v || f.text)}
                  value={v}
                  onChange={(e) => setValues((s) => ({ ...s, [f.id]: e.target.value }))}
                  placeholder="Empty: this paragraph is left out."
                />
                {isChanged && (
                  <div className="ped-tools">
                    <button type="button" className="btn btn--sm" onClick={() => setValues((s) => ({ ...s, [f.id]: f.text }))}>
                      Reset
                    </button>
                    <span className="tbl-sub ped-gen">Generated: {f.text}</span>
                  </div>
                )}
              </div>
            );
          })}
          <div className="field ped-field ped-extra" data-changed={(extra[sec.key] ?? '').trim() ? true : undefined}>
            <label htmlFor={`ped-extra-${sec.key}`}>Add to the end of this section</label>
            <textarea
              id={`ped-extra-${sec.key}`}
              rows={rows(extra[sec.key] ?? '')}
              value={extra[sec.key] ?? ''}
              onChange={(e) => setExtra((s) => ({ ...s, [sec.key]: e.target.value }))}
              placeholder={HELP}
            />
          </div>
        </section>
      ))}

      <div className="ped-bar">
        <button type="button" className="btn btn--primary" onClick={save} disabled={pending || !dirty || !scheduleValid || !emailReady}>
          {pending ? 'Working…' : 'Save wording'}
        </button>
        <p className="tbl-sub">{HELP}</p>
      </div>
    </div>
  );
}
