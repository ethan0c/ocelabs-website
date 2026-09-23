import 'server-only';
import Anthropic from '@anthropic-ai/sdk';

/*
 * Turns a contact-form message into two things: the phrase that completes
 * "Thanks for reaching out about ___" in Email A, and a one-line summary for
 * the inbox ping and the lead page. One small Claude call; without an API
 * key it degrades to a neutral phrase so nothing depends on it.
 */

export type Gist = { topic: string; summary: string };

const FALLBACK: Gist = { topic: 'your project', summary: '' };

const SYSTEM = `You read a message someone sent through a web design studio's contact form and reply with JSON only: {"topic": "...", "summary": "..."}.

"topic" completes the sentence "Thanks for reaching out about ___." Four to twelve words, natural English, lowercase except proper nouns, no trailing punctuation, no quotes. Name what they want built and for whom, e.g. "a new site for your dental practice in Austin" or "the app you're planning for gym members". Never copy their sentence verbatim; never mention budget or price.

"summary" is one sentence, under 30 words, for the studio's own notes: what they want, any deadline, anything notable.

If the message is empty, spam, or not about a project, reply {"topic": "your project", "summary": ""}.`;

export async function gistOf(message: string | null | undefined): Promise<Gist> {
  const text = (message ?? '').trim();
  if (!text || !process.env.ANTHROPIC_API_KEY) return FALLBACK;

  try {
    const client = new Anthropic();
    const res = await client.beta.messages.create({
      model: 'claude-opus-5',
      max_tokens: 256,
      output_config: { effort: 'low' },
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      system: SYSTEM,
      messages: [{ role: 'user', content: text.slice(0, 4000) }],
    });
    if (res.stop_reason === 'refusal') return FALLBACK;
    const out = res.content.find((b) => b.type === 'text')?.text ?? '';
    const json = out.slice(out.indexOf('{'), out.lastIndexOf('}') + 1);
    const parsed = JSON.parse(json) as Partial<Gist>;
    const topic = typeof parsed.topic === 'string' ? parsed.topic.trim().replace(/[.!]+$/, '') : '';
    const summary = typeof parsed.summary === 'string' ? parsed.summary.trim() : '';
    return { topic: topic || FALLBACK.topic, summary };
  } catch (e) {
    console.error('gistOf failed', e);
    return FALLBACK;
  }
}
