import 'server-only';
import Anthropic from '@anthropic-ai/sdk';
import { PACKAGES, weeksLabel, type Kind } from '@/lib/pricing';

/*
 * Turns call notes (a notetaker's summary, a transcript, or your own
 * scribbles) into the recap email's four bullets and the package, range and
 * timeline said on the call. A draft for a person to check, never sent as is.
 */

export type RecapDraft = {
  bullets: [string, string, string, string];
  kind: Kind;
  packageLabel: string;
  range: string;
  weeks: string;
};

const RANGES: Record<Kind, string> = {
  starter: '$1,500 to $2,500',
  website: '$3,000 to $6,000',
  brand: '$6,000 to $12,000',
  webapp: '$12,000 to $25,000',
  mobile: '$25,000 and up',
};

const SYSTEM = `You help a small web studio write the recap email after an intro call with a prospective client. From the notes you are given, reply with JSON only:

{"bullets": ["...", "...", "...", "..."], "kind": "starter" | "website" | "brand" | "webapp" | "mobile"}

The four bullets, in this order, each one sentence, written to the client in plain English ("you", "your"):
1. Their business and who the site is for
2. The main problem with what they have now
3. What a visitor should do on the new site
4. Deadline, and who gives final approval

"kind" is the package that fits: "starter" (a small business site on our existing layouts, up to three pages, for a tight budget), "website" (a custom site up to five pages), "brand" (design-led site with motion and video, up to ten pages), "webapp" (accounts, dashboard, CMS, integrations), "mobile" (iOS and Android app).

If the notes don't say something, write what was said and no more; never invent a deadline or a name. No markdown, no quotes inside strings.`;

export async function draftRecap(notes: string): Promise<RecapDraft> {
  const text = notes.trim();
  if (!text) throw new Error('Paste some notes from the call first.');
  if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY is not set, so the draft cannot be written.');

  const client = new Anthropic();
  const res = await client.beta.messages.create({
    model: 'claude-opus-5',
    max_tokens: 1024,
    output_config: { effort: 'low' },
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    system: SYSTEM,
    messages: [{ role: 'user', content: text.slice(0, 20000) }],
  });
  if (res.stop_reason === 'refusal') throw new Error('The draft was declined; write the bullets by hand.');
  const out = res.content.find((b) => b.type === 'text')?.text ?? '';
  const parsed = JSON.parse(out.slice(out.indexOf('{'), out.lastIndexOf('}') + 1)) as { bullets?: unknown; kind?: unknown };

  const bullets = Array.isArray(parsed.bullets) ? parsed.bullets.map((b) => String(b).trim()) : [];
  while (bullets.length < 4) bullets.push('');
  const kind: Kind = typeof parsed.kind === 'string' && parsed.kind in PACKAGES ? (parsed.kind as Kind) : 'website';

  return {
    bullets: [bullets[0], bullets[1], bullets[2], bullets[3]],
    kind,
    packageLabel: PACKAGES[kind].label,
    range: RANGES[kind],
    weeks: weeksLabel(PACKAGES[kind].weeks),
  };
}
