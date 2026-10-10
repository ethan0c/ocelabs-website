/*
 * The proposal's wording edits: what the studio editor saves and how it lays
 * over the generated document. Run with `npm test`.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeQuote, defaultInput } from './pricing';
import { applyEdits, blockText, buildProposal, hasEdits, parseBlocks, sanitiseEdits } from './proposal';

const base = () => buildProposal(computeQuote({ ...defaultInput('website'), client: 'Closet Six', notes: 'A note.' }), new Date('2026-10-10T12:00:00Z'));
const find = (pr: ReturnType<typeof buildProposal>, id: string) => pr.sections.flatMap((s) => s.blocks).find((b) => b.id === id);

test('every paragraph and list carries an id; tables too', () => {
  const pr = base();
  for (const sec of pr.sections) {
    assert.ok(sec.key);
    for (const b of sec.blocks) assert.ok(b.id, `${sec.key}: block without id`);
  }
});

test('parseBlocks: paragraphs, lists, and list-shaped originals', () => {
  assert.deepEqual(parseBlocks('One.\n\nTwo.'), [
    { kind: 'p', text: 'One.' },
    { kind: 'p', text: 'Two.' },
  ]);
  assert.deepEqual(parseBlocks('Intro.\n\n- a\n- b'), [
    { kind: 'p', text: 'Intro.' },
    { kind: 'list', items: ['a', 'b'] },
  ]);
  assert.deepEqual(parseBlocks('Home\nWork\n- About', { kind: 'list', items: [] }), [{ kind: 'list', items: ['Home', 'Work', 'About'] }]);
  assert.deepEqual(parseBlocks('Still bold.', { kind: 'p', text: 'x', strong: true }), [{ kind: 'p', text: 'Still bold.', strong: true, muted: undefined }]);
  assert.deepEqual(parseBlocks('   '), []);
});

test('applyEdits replaces, removes and appends; tables and other sections are untouched', () => {
  const pr = base();
  const out = applyEdits(pr, {
    blocks: { 'scope.intro': 'A calm portfolio.\n\nPhotos first.', 'scope.notes': null, 'scope.includes': 'Home\nWork\nAbout' },
    extra: { timeline: 'Finished site on a private link by week 3 or 4.' },
    timeline: '4 to 6 weeks, aiming for 4',
  });
  const scope = out.sections.find((s) => s.key === 'scope')!;
  assert.deepEqual(
    scope.blocks.filter((b) => b.id === 'scope.intro').map((b) => blockText(b)),
    ['A calm portfolio.', 'Photos first.'],
  );
  assert.equal(find(out, 'scope.notes'), undefined);
  assert.deepEqual(find(out, 'scope.includes'), { kind: 'list', id: 'scope.includes', items: ['Home', 'Work', 'About'] });
  assert.deepEqual(find(out, 'scope.lines'), find(pr, 'scope.lines'));
  const tl = out.sections.find((s) => s.key === 'timeline')!;
  assert.equal(blockText(tl.blocks.at(-1)!), 'Finished site on a private link by week 3 or 4.');
  assert.equal(out.timeline, '4 to 6 weeks, aiming for 4');
  assert.deepEqual(out.sections.find((s) => s.key === 'ownership'), pr.sections.find((s) => s.key === 'ownership'));
  const outside = find(out, 'scope.outside');
  assert.ok(outside?.kind === 'p' && outside.strong, 'the outside-scope line stays bold');
});

test('sanitiseEdits keeps only real changes to known blocks', () => {
  const pr = base();
  const same = blockText(find(pr, 'scope.intro')!);
  assert.equal(sanitiseEdits({ blocks: { 'scope.intro': same, 'scope.lines': 'nope', 'made.up': 'x' }, extra: { nowhere: 'x', scope: '  ' }, timeline: pr.timeline }, pr), null);
  const e = sanitiseEdits({ blocks: { 'scope.intro': '  New.  ', 'timeline.content': '' }, extra: { scope: 'Added.' }, timeline: ' 4 weeks ' }, pr);
  assert.deepEqual(e, { blocks: { 'scope.intro': 'New.', 'timeline.content': null }, extra: { scope: 'Added.' }, timeline: '4 weeks' });
  assert.equal(hasEdits(e), true);
  assert.equal(hasEdits({ extra: { scope: ' ' } }), false);
});

test('buildProposal with edits is applyEdits of buildProposal without', () => {
  const q = computeQuote({ ...defaultInput('website'), client: 'Closet Six' });
  const now = new Date('2026-10-10T12:00:00Z');
  const edits = { blocks: { 'reviews.p': 'One approver: Rodney.' } };
  assert.deepEqual(buildProposal(q, now, edits), applyEdits(buildProposal(q, now), edits));
});
