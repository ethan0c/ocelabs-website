/*
 * The client-facing emails from client-workflow.txt, Part 3, written the way
 * a person writes: short, first person, contractions, one thing per email.
 * Anything only a human can write (the recap bullets, the Friday lists, the
 * day-30 observation) is a parameter or is left for a draft.
 *
 * Sent from "OCE Labs <hello@ocelabs.xyz>", so subjects don't repeat the name.
 */

import { usd, weeksLabel, type Quote } from '@/lib/pricing';

export type Email = { subject: string; text: string };

/** First name, first letter capitalised however they typed it. "there" if unknown. */
export function first(name?: string | null) {
  const w = name?.trim().split(/\s+/)[0];
  if (!w) return 'there';
  return w.charAt(0).toUpperCase() + w.slice(1);
}

const sign = (signer: string) => `\n\n${signer.trim() || 'OCE Labs'}${signer.trim() ? '\nOCE Labs' : ''}`;

/** "September 29", or "September 29, 2027" when it isn't this year. */
export function fmtDate(d: Date) {
  const sameYear = d.getFullYear() === new Date().getFullYear();
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', ...(sameYear ? {} : { year: 'numeric' }) });
}

const bullets = (items: string[]) => items.map((b) => `• ${b}`).join('\n');

/* ── A: reply to an inquiry ──────────────────────────────────────────────── */

export function emailA(o: { name?: string | null; topic: string; calLink: string; signer: string }): Email {
  return {
    subject: 'Re: your project',
    text:
      `Hi ${first(o.name)},\n\n` +
      `Thanks for reaching out about ${o.topic}.\n\n` +
      `The easiest next step is a quick 30-minute call. I'll ask a few questions, tell you honestly whether we're the right people for it, and give you a rough range on the spot. Grab a time here:\n\n` +
      `${o.calLink}\n\n` +
      `If nothing there works, just reply with a couple of times that do.` +
      sign(o.signer),
  };
}

export function emailA2(o: { name?: string | null; calLink: string; signer: string }): Email {
  return {
    subject: 'Re: your project',
    text:
      `Hi ${first(o.name)},\n\n` +
      `Bumping this in case it got buried. The link to grab a call is below, and if the timing's changed on your end, no worries at all, just let me know.\n\n` +
      `${o.calLink}` +
      sign(o.signer),
  };
}

/* ── B: recap after the call ─────────────────────────────────────────────── */

export function emailB(o: {
  name?: string | null;
  bullets: string[];
  packageLabel: string;
  range: string;
  weeks: string;
  questionnaireLink: string;
  signer: string;
}): Email {
  return {
    subject: 'Recap from our call',
    text:
      `Hi ${first(o.name)},\n\n` +
      `Good talking today. Here's what I took away, so tell me if I've got anything wrong:\n\n` +
      bullets(o.bullets) +
      `\n\nBased on that, I'd point you at the ${o.packageLabel}. It usually runs ${o.range} and takes ${o.weeks} from kickoff.\n\n` +
      `From here:\n` +
      `1. Fill in this short questionnaire. Ten minutes, short answers are fine: ${o.questionnaireLink}\n` +
      `2. Within two business days I'll send you a fixed price, a launch date, and a short agreement you can sign online.\n` +
      `3. Once that's signed and the deposit's in, we start.\n\n` +
      `The questionnaire page also has a bit about how we work and what you get at the end.` +
      sign(o.signer),
  };
}

export function emailQuestionnaireNudge(o: { name?: string | null; questionnaireLink: string; signer: string }): Email {
  return {
    subject: 'Re: Recap from our call',
    text:
      `Hi ${first(o.name)},\n\n` +
      `Quick nudge on the questionnaire. It's what I need to put a fixed price and a launch date in front of you:\n\n` +
      `${o.questionnaireLink}\n\n` +
      `Short answers are fine, and skip anything that doesn't apply.` +
      sign(o.signer),
  };
}

/* ── C: the proposal ─────────────────────────────────────────────────────── */

export function emailC(o: {
  name?: string | null;
  company: string;
  q: Quote;
  proposalLink: string;
  validUntil: Date;
  calLink: string;
  signer: string;
}): Email {
  const { q } = o;
  const pay = q.payments.map((p) => `${p.pct}% ${p.label.toLowerCase()}`).join(', ');
  return {
    subject: `Proposal for ${o.company}`,
    text:
      `Hi ${first(o.name)},\n\n` +
      `Thanks for the questionnaire, that was really helpful. Your proposal's ready:\n\n` +
      `${o.proposalLink}\n\n` +
      `The short version:\n` +
      bullets([
        `What we're building: ${q.lines.map((l) => l.label).join(', ')}`,
        `Price: ${usd.format(q.total)}, fixed`,
        `Timeline: ${weeksLabel(q.weeks)} from kickoff`,
        `Payment: ${pay}`,
      ]) +
      `\n\nYou can read it, download the PDF, and sign it right on that page. It takes about a minute. The price and start date are held until ${fmtDate(o.validUntil)}.\n\n` +
      `If anything looks off or you'd like to change the scope, just reply, or grab a call: ${o.calLink}` +
      sign(o.signer),
  };
}

export function emailCNudge(o: {
  name?: string | null;
  company: string;
  proposalLink: string;
  validUntil: Date;
  last: boolean;
  signer: string;
}): Email {
  return {
    subject: `Re: Proposal for ${o.company}`,
    text:
      `Hi ${first(o.name)},\n\n` +
      (o.last
        ? `Last nudge from me. The price and start date in the proposal are held until ${fmtDate(o.validUntil)}; after that I'd need to re-quote. If you'd like to go ahead, it's here:\n\n${o.proposalLink}\n\nEither way, thanks for considering us.`
        : `Checking in on the proposal. Any questions, or want to tweak the scope? Just reply. If it looks right, signing takes a minute:\n\n${o.proposalLink}`) +
      sign(o.signer),
  };
}

/* ── D: signed ───────────────────────────────────────────────────────────── */

export function emailD(o: { name?: string | null; depositAmount: number; full?: boolean; folderLink?: string | null; signer: string }): Email {
  return {
    subject: 'Welcome aboard, and what happens next',
    text:
      `Hi ${first(o.name)},\n\n` +
      `Thanks for signing. Glad to be working with you. Your signed copy is attached.\n\n` +
      `You'll get a separate email from Stripe with the ${o.full ? 'invoice' : 'deposit invoice'} for ${usd.format(o.depositAmount)}. Bank transfer or card, whichever's easier.\n\n` +
      `We start the day these four things are in:\n` +
      bullets([o.full ? 'The payment' : 'The deposit', 'The questionnaire (done)', 'Your logo, brand files, and any photos you want used', 'Any existing copy you want to keep']) +
      `\n\nSend files by replying to this email${o.folderLink ? `, or drop them in this folder: ${o.folderLink}` : ''}. As soon as the last one lands I'll confirm your kickoff and launch dates.` +
      sign(o.signer),
  };
}

/* ── E: kickoff ──────────────────────────────────────────────────────────── */

export function emailE(o: {
  name?: string | null;
  company: string;
  kickoff: Date;
  launch: Date;
  contentDeadline: Date;
  designReview: Date;
  stagingReview: Date;
  signer: string;
}): Email {
  return {
    subject: `${o.company} has kicked off`,
    text:
      `Hi ${first(o.name)},\n\n` +
      `Everything's in, so today's day one: ${fmtDate(o.kickoff)}.\n\n` +
      bullets([
        `Launch: ${fmtDate(o.launch)}`,
        `Content deadline: ${fmtDate(o.contentDeadline)}. Anything that arrives after this moves the launch by the same number of days`,
        `Design review: around ${fmtDate(o.designReview)}`,
        `Staging review: around ${fmtDate(o.stagingReview)}`,
      ]) +
      `\n\nYou'll hear from me every Friday: what got done, what's next, and anything I need from you.` +
      sign(o.signer),
  };
}

/* ── F: Friday update (drafted, never sent as is) ───────────────────────── */

export function emailF(o: { name?: string | null; company: string; week: number; launch: Date | null; signer: string }): Email {
  return {
    subject: `${o.company}, week ${o.week}`,
    text:
      `Hi ${first(o.name)},\n\n` +
      `Done this week:\n• \n\n` +
      `Next week:\n• \n\n` +
      `Needed from you:\n• Nothing this week\n\n` +
      (o.launch ? `Still on track for ${fmtDate(o.launch)}.` : '') +
      sign(o.signer),
  };
}

/* ── G: final invoice ────────────────────────────────────────────────────── */

export function emailG(o: { name?: string | null; company: string; amount: number; changeOrders?: string | null; signer: string }): Email {
  return {
    subject: `${o.company} is ready to launch`,
    text:
      `Hi ${first(o.name)},\n\n` +
      `Thanks for the approval. The final invoice for ${usd.format(o.amount)} is on its way from Stripe` +
      (o.changeOrders ? `, and it includes what we added along the way: ${o.changeOrders}.` : '.') +
      `\n\nOnce it's paid we connect your domain and go live, usually the same day. If there's a day or time you'd prefer for the switch, tell me.` +
      sign(o.signer),
  };
}

/* ── H: handover ─────────────────────────────────────────────────────────── */

export function emailH(o: {
  name?: string | null;
  domain: string;
  analyticsLink?: string | null;
  repoLink?: string | null;
  hostingLink?: string | null;
  searchConsoleLink?: string | null;
  until: Date;
  signer: string;
}): Email {
  const line = (label: string, link?: string | null) => `${label}${link ? `: ${link}` : ''}`;
  return {
    subject: `${o.domain} is live`,
    text:
      `Hi ${first(o.name)},\n\n` +
      `${o.domain} is live. Here's everything that's now yours:\n\n` +
      bullets([
        line('The site itself, with HTTPS, redirects and analytics set up', o.analyticsLink),
        line('The code, with access on your email', o.repoLink),
        line('The hosting account, with access on your email', o.hostingLink),
        line('Google Search Console, sitemap submitted', o.searchConsoleLink),
        'A short guide to updating content, attached',
      ]) +
      `\n\nFor the next 30 days, until ${fmtDate(o.until)}, anything we missed gets fixed at no charge. Just reply here.` +
      sign(o.signer),
  };
}

/* ── I: day 30 (drafted) ─────────────────────────────────────────────────── */

export function emailI(o: { name?: string | null; domain: string; monthly?: number | null; signer: string }): Email {
  return {
    subject: 'One month in',
    text:
      `Hi ${first(o.name)},\n\n` +
      `It's been a month since ${o.domain} went live. [One real observation from analytics or Search Console.]\n\n` +
      `The 30 days of included fixes end today. If you'd like us to keep looking after the site (updates, monitoring, a search review each quarter), ${o.monthly ? `the retainer is ${usd.format(o.monthly)} a month` : 'the retainer starts at $300 a month'} and you can cancel any time. Just reply and I'll set it up.\n\n` +
      `Two small asks, only if you're happy with the work:\n` +
      bullets(['A sentence or two I could quote on our site', 'An intro to anyone you know who needs a site']) +
      `\n\nThanks for trusting us with this.` +
      sign(o.signer),
  };
}

/* ── J: retainer confirmed ───────────────────────────────────────────────── */

export function emailJ(o: { name?: string | null; domain?: string | null; monthly: number; startAt: Date; signer: string }): Email {
  return {
    subject: 'Your retainer is set up',
    text:
      `Hi ${first(o.name)},\n\n` +
      `You're all set. We'll keep looking after ${o.domain || 'the site'} from ${fmtDate(o.startAt)}.\n\n` +
      bullets([
        `${usd.format(o.monthly)} a month, invoiced by Stripe on the ${ordinal(o.startAt.getDate())} of each month, due in 7 days`,
        'Content and image updates whenever you need them',
        'Monitoring, security and dependency updates',
        'A search review each quarter, with recommendations',
        'Cancel any time by replying here; it stops at the end of the month already paid',
      ]) +
      `\n\nFor anything you need changed, just reply to this email.` +
      sign(o.signer),
  };
}

export function emailJEnd(o: { name?: string | null; until: Date; signer: string }): Email {
  return {
    subject: 'Re: Your retainer is set up',
    text:
      `Hi ${first(o.name)},\n\n` +
      `Done, the retainer is cancelled. It runs until ${fmtDate(o.until)}, the end of the month already paid, and there are no more invoices after that.\n\n` +
      `Thanks for having us look after the site. If you need anything later, just write.` +
      sign(o.signer),
  };
}

function ordinal(n: number) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
