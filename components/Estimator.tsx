'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import {
  ADDONS,
  CONTENT_DEADLINE_DAYS,
  DISCOUNTS,
  DISCOUNT_CAP,
  EXTRA_PROJECT_SHARE,
  GROUPS,
  MOBILE_DEPOSIT_PCT,
  MOBILE_MAX_MILESTONES,
  MOBILE_MIN_MILESTONES,
  PACKAGES,
  RETAINERS,
  RUSH,
  computeQuote,
  defaultInput,
  scheduleFor,
  encodeInput,
  summaryText,
  usd,
  weeksLabel,
  type Kind,
  type QuoteInput,
} from '@/lib/pricing';
import { createInvoice, type InvoiceResult } from '@/app/pricing/stripe';
import { saveQuoteToLead } from '@/app/pricing/actions';

export default function Estimator({ initial, leadId }: { initial?: QuoteInput | null; leadId?: string | null }) {
  const [input, setInput] = useState<QuoteInput>(() => initial ?? defaultInput());
  const [copied, setCopied] = useState(false);
  // Keyed by quote and stage, so any edit to the quote leaves the drafted
  // invoices behind: their amounts may no longer match.
  const [invoices, setInvoices] = useState<Record<string, InvoiceResult | 'pending'>>({});
  const [, startTransition] = useTransition();

  const set = <K extends keyof QuoteInput>(key: K, value: QuoteInput[K]) =>
    setInput((s) => ({ ...s, [key]: value }));

  const { kind } = input;
  const pkg = PACKAGES[kind];
  const visible = ADDONS.filter((a) => !a.not?.includes(kind));
  const est = useMemo(() => computeQuote(input), [input]);
  const encoded = useMemo(() => encodeInput(input), [input]);

  // The quote lives in the URL, so a reload, a bookmark, or a link pasted
  // into the tracker brings back exactly this form.
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set('q', encoded);
    window.history.replaceState(null, '', url);
  }, [encoded]);

  const setCount = (id: string, n: number) =>
    set('qty', { ...input.qty, [id]: Math.max(0, Math.floor(n)) });

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(summaryText(est));
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* Clipboard blocked; the summary is still on screen. */
    }
  };

  const draft = (i: number) => {
    const key = `${encoded}:${i < 0 ? 'full' : i}`;
    setInvoices((s) => ({ ...s, [key]: 'pending' }));
    startTransition(async () => {
      const result = await createInvoice(encoded, i);
      setInvoices((s) => ({ ...s, [key]: result }));
    });
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
                onChange={() => setInput((s) => ({ ...s, kind: k, pages: PACKAGES[k].pages }))}
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
                value={input.pages}
                onChange={(e) => set('pages', Math.max(1, Number(e.target.value) || 1))}
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
              value={input.projects}
              onChange={(e) => set('projects', Math.max(1, Number(e.target.value) || 1))}
              className="est-num"
            />
          </div>
          {kind === 'mobile' && (
            <div className="est-row est-row--input">
              <span className="est-row-main">
                <span className="est-row-label">Payments after the deposit</span>
                <span className="est-row-note">
                  {MOBILE_DEPOSIT_PCT}% down, then equal milestones. The last one is due before
                  store submission.
                </span>
              </span>
              <input
                type="number"
                min={MOBILE_MIN_MILESTONES}
                max={MOBILE_MAX_MILESTONES}
                value={input.milestones}
                onChange={(e) =>
                  set(
                    'milestones',
                    Math.min(
                      MOBILE_MAX_MILESTONES,
                      Math.max(MOBILE_MIN_MILESTONES, Number(e.target.value) || 1),
                    ),
                  )
                }
                className="est-num"
              />
            </div>
          )}
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
                const n = input.qty[a.id] ?? 0;
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
            <label key={r.id} className="est-row" data-on={input.rush === r.id || undefined}>
              <input
                type="radio"
                name="rush"
                checked={input.rush === r.id}
                onChange={() => set('rush', r.id)}
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
          {DISCOUNTS.map((d) => {
            const on = input.discounts.includes(d.id);
            return (
              <label key={d.id} className="est-row" data-on={on || undefined}>
                <input
                  type="checkbox"
                  checked={on}
                  onChange={(e) =>
                    set(
                      'discounts',
                      e.target.checked
                        ? [...input.discounts, d.id]
                        : input.discounts.filter((id) => id !== d.id),
                    )
                  }
                />
                <span className="est-row-main">
                  <span className="est-row-label">{d.label}</span>
                </span>
                <span className="est-row-price">-{d.pct}%</span>
              </label>
            );
          })}
          <div className="est-row est-row--input" data-on={input.customPct > 0 || undefined}>
            <span className="est-row-main">
              <span className="est-row-label">Custom discount</span>
              <span className="est-row-note">Percentages add up, to {DISCOUNT_CAP}% at most.</span>
            </span>
            <span className="est-pct">
              <input
                type="number"
                min={0}
                max={DISCOUNT_CAP}
                value={input.customPct}
                onChange={(e) =>
                  set('customPct', Math.min(DISCOUNT_CAP, Math.max(0, Number(e.target.value) || 0)))
                }
                className="est-num"
                aria-label="Custom discount percent"
              />
              %
            </span>
          </div>
          <div className="est-row est-row--input" data-on={input.customAmount > 0 || undefined}>
            <span className="est-row-main">
              <span className="est-row-label">Amount off</span>
              <span className="est-row-note">A flat amount, taken off after the percentages.</span>
            </span>
            <span className="est-pct">
              $
              <input
                type="number"
                min={0}
                step={50}
                value={input.customAmount}
                onChange={(e) => set('customAmount', Math.max(0, Math.floor(Number(e.target.value) || 0)))}
                className="est-num est-num--wide"
                aria-label="Discount amount in dollars"
              />
            </span>
          </div>
        </fieldset>

        {/* Payment plan */}
        <fieldset className="est-block">
          <legend className="est-legend">Payment plan</legend>
          <label className="est-row" data-on={input.plan === 'standard' || undefined}>
            <input type="radio" name="plan" checked={input.plan === 'standard'} onChange={() => set('plan', 'standard')} />
            <span className="est-row-main">
              <span className="est-row-label">Standard schedule</span>
              <span className="est-row-note">
                {scheduleFor(kind, input.milestones).map((st) => `${st.pct}% ${st.label.toLowerCase()}`).join(', ')}
              </span>
            </span>
            <span className="est-row-price">—</span>
          </label>
          <label className="est-row" data-on={input.plan === 'full' || undefined}>
            <input type="radio" name="plan" checked={input.plan === 'full'} onChange={() => set('plan', 'full')} />
            <span className="est-row-main">
              <span className="est-row-label">Pay in full</span>
              <span className="est-row-note">One invoice for the whole amount, due on signature.</span>
            </span>
            <span className="est-row-price">100%</span>
          </label>
        </fieldset>

        {/* Retainer */}
        <fieldset className="est-block">
          <legend className="est-legend">After launch</legend>
          {RETAINERS.map((r) => (
            <label key={r.id} className="est-row" data-on={input.retainer === r.id || undefined}>
              <input
                type="radio"
                name="retainer"
                checked={input.retainer === r.id}
                onChange={() => set('retainer', r.id)}
              />
              <span className="est-row-main">
                <span className="est-row-label">{r.label}</span>
              </span>
              <span className="est-row-price">
                {r.id === 'custom' ? 'Your price' : r.monthly ? `${usd.format(r.monthly)}/mo` : '—'}
              </span>
            </label>
          ))}
          {input.retainer === 'custom' && (
            <div className="est-row est-row--input" data-on>
              <span className="est-row-main">
                <span className="est-row-label">Custom retainer</span>
                <span className="est-row-note">Monthly price, billed as a subscription.</span>
              </span>
              <span className="est-pct">
                $
                <input
                  type="number"
                  min={0}
                  step={50}
                  value={input.customRetainer}
                  onChange={(e) => set('customRetainer', Math.max(0, Math.floor(Number(e.target.value) || 0)))}
                  className="est-num est-num--wide"
                  aria-label="Custom retainer per month"
                />
                /mo
              </span>
            </div>
          )}
        </fieldset>

        {/* Client and notes */}
        <fieldset className="est-block">
          <legend className="est-legend">For the proposal</legend>
          <div className="field">
            <label htmlFor="est-client">Client</label>
            <input
              id="est-client"
              type="text"
              value={input.client}
              onChange={(e) => set('client', e.target.value)}
              placeholder="Legal business name, as it should read on the contract"
            />
          </div>
          <div className="field">
            <label htmlFor="est-email">Client email</label>
            <input
              id="est-email"
              type="email"
              value={input.email}
              onChange={(e) => set('email', e.target.value)}
              placeholder="Where Stripe sends the invoices"
            />
          </div>
          <div className="field">
            <label htmlFor="est-notes">Notes</label>
            <textarea
              id="est-notes"
              rows={3}
              value={input.notes}
              onChange={(e) => set('notes', e.target.value)}
              placeholder="Assumptions, exclusions, what the questionnaire said"
            />
          </div>
        </fieldset>
      </div>

      {/* Summary */}
      <aside className="est-summary" aria-live="polite">
        <p className="eyebrow">Summary{input.client ? ` · ${input.client}` : ''}</p>

        <div className="est-actions">
          {leadId && (
            <button type="button" className="btn btn--primary" onClick={() => startTransition(() => saveQuoteToLead(leadId, encoded))}>
              Save to lead
            </button>
          )}
          <a className={`btn${leadId ? '' : ' btn--primary'}`} href={`/pricing/proposal/pdf?q=${encoded}`}>
            Download proposal PDF
          </a>
          <a className="btn" href={`/pricing/proposal?q=${encoded}`}>
            Preview proposal
          </a>
          <button type="button" className="btn" onClick={copy}>
            {copied ? 'Copied' : 'Copy summary'}
          </button>
        </div>

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

        <p className="eyebrow">Payments</p>
        <ul className="est-pay">
          {est.payments.map((p, i) => {
            const state = invoices[`${encoded}:${i}`];
            return (
              <li key={i}>
                <span className="est-pay-main">
                  <span>
                    {p.label} {p.pct}%
                  </span>
                  <span className="est-row-note">{p.trigger}</span>
                  {state && state !== 'pending' && 'error' in state && (
                    <span className="form-note" data-kind="error">
                      {state.error}
                    </span>
                  )}
                </span>
                <span className="est-pay-side">
                  <span>{usd.format(p.amount)}</span>
                  {state && state !== 'pending' && 'url' in state ? (
                    <a
                      className="btn btn--sm btn--primary"
                      href={state.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Open in Stripe <span aria-hidden="true">&#8599;</span>
                    </a>
                  ) : (
                    <button
                      type="button"
                      className="btn btn--sm"
                      disabled={state === 'pending'}
                      onClick={() => draft(i)}
                    >
                      {state === 'pending' ? 'Drafting…' : 'Draft in Stripe'}
                    </button>
                  )}
                </span>
              </li>
            );
          })}
        </ul>

        {input.plan === 'standard' && (
          <div className="est-full">
            <span className="est-row-note">Or bill it all at once:</span>
            {(() => {
              const state = invoices[`${encoded}:full`];
              return state && state !== 'pending' && 'url' in state ? (
                <a className="btn btn--sm btn--primary" href={state.url} target="_blank" rel="noopener noreferrer">
                  Open in Stripe <span aria-hidden="true">&#8599;</span>
                </a>
              ) : (
                <>
                  <button type="button" className="btn btn--sm" disabled={state === 'pending'} onClick={() => draft(-1)}>
                    {state === 'pending' ? 'Drafting…' : `Draft full amount (${usd.format(est.total)}) in Stripe`}
                  </button>
                  {state && state !== 'pending' && 'error' in state && (
                    <span className="form-note act-note" data-kind="error">{state.error}</span>
                  )}
                </>
              );
            })()}
          </div>
        )}
      </aside>
    </div>
  );
}
