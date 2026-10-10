'use client';

import { useMemo, useState, useTransition } from 'react';
import { blockText, type Block, type Proposal, type ProposalEdits } from '@/lib/proposal';
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
export default function ProposalEditor({ id, generated, edits }: { id: string; generated: Proposal; edits: ProposalEdits | null }) {
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
  const [state, setState] = useState<EditState>({});
  const [pending, start] = useTransition();

  const changed = (f: Field) => (values[f.id] ?? '').trim() !== f.text.trim();
  const dirty =
    [...fields.values()].some(changed) ||
    Object.values(extra).some((v) => v.trim()) ||
    timeline.trim() !== generated.timeline;

  const save = () =>
    start(async () => {
      const blocks: Record<string, string | null> = {};
      for (const f of fields.values()) {
        if (!changed(f)) continue;
        const t = (values[f.id] ?? '').trim();
        blocks[f.id] = t ? t : null;
      }
      setState(await saveEdits(id, { blocks, extra, timeline }));
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
      }
      setState(r);
    });
  };

  const rows = (t: string) => Math.min(14, Math.max(2, Math.ceil(t.length / 90) + (t.match(/\n/g)?.length ?? 0)));

  return (
    <div className="ped">
      <div className="ped-bar">
        <button type="button" className="btn btn--primary" onClick={save} disabled={pending || !dirty}>
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

      {generated.sections.map((sec) => (
        <section key={sec.key} className="studio-sec">
          <h2 className="eyebrow">
            {sec.n}. {sec.title}
          </h2>
          {sec.blocks.map((b, i) => {
            if (b.kind === 'table') {
              return (
                <div key={b.id ?? i} className="ped-table">
                  <table className="prop-table">
                    <tbody>
                      {b.rows.map((r, j) => (
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
                  <p className="tbl-sub">From the quote. Change it in the estimator.</p>
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
        <button type="button" className="btn btn--primary" onClick={save} disabled={pending || !dirty}>
          {pending ? 'Working…' : 'Save wording'}
        </button>
        <p className="tbl-sub">{HELP}</p>
      </div>
    </div>
  );
}
