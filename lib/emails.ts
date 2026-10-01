/*
 * The client-facing emails from client-workflow.txt, Part 3: warm but
 * professional, first person, full sentences, one thing per email.
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

/**
 * "Best regards," then the person and the studio. A signer that already names
 * the studio ("The OCE Labs team") stands on its own.
 */
const sign = (signer: string) => {
  const who = signer.trim() || 'The OCE Labs team';
  return `\n\nBest regards,\n${who}${/oce labs/i.test(who) ? '' : '\nOCE Labs'}\nocelabs.xyz`;
};

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
      `Thank you for getting in touch with us about ${o.topic}.\n\n` +
      `The best next step is a short 30-minute call. I'll ask a few questions about what you need, let you know honestly whether we're a good fit for the project, and give you a rough price range before we hang up. You can book a time here:\n\n` +
      `${o.calLink}\n\n` +
      `If none of those times suit you, reply with a few that do and I'll make it work.` +
      sign(o.signer),
  };
}

export function emailA2(o: { name?: string | null; calLink: string; signer: string }): Email {
  return {
    subject: 'Re: your project',
    text:
      `Hi ${first(o.name)},\n\n` +
      `I wanted to follow up in case my last email got lost in your inbox. If you'd still like to talk, you can book a call here:\n\n` +
      `${o.calLink}\n\n` +
      `And if the timing no longer works on your end, that's completely fine. Just let me know.` +
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
  prefilled?: boolean;
  signer: string;
}): Email {
  return {
    subject: 'Recap from our call',
    text:
      `Hi ${first(o.name)},\n\n` +
      `Thank you for your time today. Here's a summary of what we discussed. Please let me know if I've missed or misunderstood anything:\n\n` +
      bullets(o.bullets) +
      `\n\nBased on this, I'd recommend our ${o.packageLabel}. Projects like this typically cost ${o.range} and take ${o.weeks} from the start date.\n\n` +
      `Next steps:\n` +
      `1. Complete this short questionnaire. ${o.prefilled ? "I've already filled in what we covered on the call, so please check those answers and add the rest" : 'It takes about fifteen minutes, and brief answers are fine'}: ${o.questionnaireLink}\n` +
      `2. Within two business days of receiving it, I'll send you a fixed price, a launch date, and a short agreement you can sign online.\n` +
      `3. Once the agreement is signed and the deposit is paid, we begin.\n\n` +
      `The questionnaire page also explains how we work and what you'll receive at the end.` +
      sign(o.signer),
  };
}

export function emailQuestionnaireNudge(o: { name?: string | null; questionnaireLink: string; signer: string }): Email {
  return {
    subject: 'Re: Recap from our call',
    text:
      `Hi ${first(o.name)},\n\n` +
      `A quick reminder about the questionnaire. Once it's in, I can send you a fixed price and a launch date:\n\n` +
      `${o.questionnaireLink}\n\n` +
      `Brief answers are fine, and feel free to skip anything that doesn't apply.` +
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
      `Thank you for completing the questionnaire. It was very helpful. Your proposal is ready:\n\n` +
      `${o.proposalLink}\n\n` +
      `In summary:\n` +
      bullets([
        `What we're building: ${q.lines.map((l) => l.label).join(', ')}`,
        `Price: ${usd.format(q.total)}, fixed`,
        `Timeline: ${weeksLabel(q.weeks)} from the start date`,
        `Payment: ${pay}`,
      ]) +
      `\n\nYou can review the proposal, download a PDF copy, and sign it on the same page in about a minute. This price and start date are held until ${fmtDate(o.validUntil)}.\n\n` +
      `If you have questions or would like to adjust anything, reply to this email or book a call: ${o.calLink}` +
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
        ? `A final reminder that the price and start date in your proposal are held until ${fmtDate(o.validUntil)}. After that, I'd need to prepare a new quote. If you'd like to go ahead, you can sign here:\n\n${o.proposalLink}\n\nWhatever you decide, thank you for considering us.`
        : `I wanted to check in on the proposal. If you have any questions or would like to change anything, just reply to this email. If everything looks right, signing takes about a minute:\n\n${o.proposalLink}`) +
      sign(o.signer),
  };
}

/* ── D: signed ───────────────────────────────────────────────────────────── */

export function emailD(o: {
  name?: string | null;
  depositAmount: number;
  full?: boolean;
  /** Paid before signing, on an invoice made by hand. */
  paidAlready?: number;
  balance?: number;
  questionnaireDone: boolean;
  folderLink?: string | null;
  signer: string;
}): Email {
  const paid = (o.paidAlready ?? 0) > 0;
  return {
    subject: 'Welcome aboard: next steps',
    text:
      `Hi ${first(o.name)},\n\n` +
      `Thank you for signing. We're glad to be working with you, and your signed copy is attached.\n\n` +
      (paid
        ? `We've received your payment of ${usd.format(o.paidAlready!)}. Thank you.${o.balance ? ` The remaining ${usd.format(o.balance)} will be invoiced once you approve the finished site, before launch.` : ''}\n\n`
        : `You'll receive a separate email with the ${o.full ? 'invoice' : 'deposit invoice'} for ${usd.format(o.depositAmount)}. You can pay by bank transfer or card.\n\n`) +
      `We'll begin as soon as we have the following:\n` +
      bullets([
        paid ? 'The payment (done)' : o.full ? 'The payment' : 'The deposit',
        o.questionnaireDone ? 'The questionnaire (done)' : 'The questionnaire',
        'Your logo, brand files, and any photos you want used',
        'Any existing copy you want to keep',
      ]) +
      `\n\nYou can send files by replying to this email${o.folderLink ? ` or by uploading them to this folder: ${o.folderLink}` : ''}. Once everything is in, I'll confirm your start and launch dates.` +
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
    subject: `Work on ${o.company} has started`,
    text:
      `Hi ${first(o.name)},\n\n` +
      `We have everything we need, so work officially begins today, ${fmtDate(o.kickoff)}. Here are the key dates:\n\n` +
      bullets([
        `Launch: ${fmtDate(o.launch)}`,
        `Content deadline: ${fmtDate(o.contentDeadline)}. Anything received after this date moves the launch back by the same number of days`,
        `Design review: around ${fmtDate(o.designReview)}`,
        `Review of the working site: around ${fmtDate(o.stagingReview)}`,
      ]) +
      `\n\nI'll send you an update every Friday covering what we finished, what's coming next, and anything we need from you.` +
      sign(o.signer),
  };
}

/* ── F: Friday update (drafted, never sent as is) ───────────────────────── */

export function emailF(o: { name?: string | null; company: string; week: number; launch: Date | null; signer: string }): Email {
  return {
    subject: `${o.company}: week ${o.week} update`,
    text:
      `Hi ${first(o.name)},\n\n` +
      `Here's your update for week ${o.week}.\n\n` +
      `Completed this week:\n• \n\n` +
      `Planned for next week:\n• \n\n` +
      `Needed from you:\n• Nothing this week\n\n` +
      (o.launch ? `We're still on track to launch on ${fmtDate(o.launch)}.` : '') +
      sign(o.signer),
  };
}

/* ── G: final invoice ────────────────────────────────────────────────────── */

export function emailG(o: { name?: string | null; company: string; amount: number; changeOrders?: string | null; signer: string }): Email {
  return {
    subject: `${o.company} is ready to launch`,
    text:
      `Hi ${first(o.name)},\n\n` +
      `Thank you for approving the site. The final invoice for ${usd.format(o.amount)} will arrive shortly in a separate email` +
      (o.changeOrders ? `. It includes the additions we agreed on during the project: ${o.changeOrders}.` : '.') +
      `\n\nOnce it's paid, we'll connect your domain and take the site live, usually on the same day. If you'd prefer a particular day or time for the launch, just let me know.` +
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
      `Congratulations, ${o.domain} is now live. Here's everything that now belongs to you:\n\n` +
      bullets([
        line('The website, secured and with visitor analytics set up', o.analyticsLink),
        line('The source code, shared with your email address', o.repoLink),
        line('The hosting account, shared with your email address', o.hostingLink),
        line('Google Search Console, with your site submitted to Google', o.searchConsoleLink),
        'A short guide to updating your content (attached)',
      ]) +
      `\n\nIf you notice anything that isn't right before ${fmtDate(o.until)}, we'll fix it at no charge. Just reply to this email.\n\n` +
      `Thank you for working with us.` +
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
      `Your free fix period ends today. If you'd like us to continue looking after the site, including content updates, monitoring, and a quarterly search review, ${o.monthly ? `the retainer is ${usd.format(o.monthly)} a month` : 'the retainer starts at $300 a month'}, and you can cancel at any time. Just reply and I'll set it up.\n\n` +
      `If you've been happy with our work, I'd also be grateful for either of the following:\n` +
      bullets(['A sentence or two we could quote on our website', 'An introduction to anyone you know who needs a website']) +
      `\n\nThank you again for trusting us with this project.` +
      sign(o.signer),
  };
}

/* ── J: retainer confirmed ───────────────────────────────────────────────── */

export function emailJ(o: { name?: string | null; domain?: string | null; monthly: number; startAt: Date; signer: string }): Email {
  return {
    subject: 'Your retainer is set up',
    text:
      `Hi ${first(o.name)},\n\n` +
      `You're all set. We'll look after ${o.domain || 'your site'} starting ${fmtDate(o.startAt)}. Here's what's included:\n\n` +
      bullets([
        `${usd.format(o.monthly)} a month, invoiced by email on the ${ordinal(o.startAt.getDate())} of each month, due in 7 days`,
        'Content and image updates whenever you need them',
        'Monitoring, plus security and software updates',
        'A quarterly search review with recommendations',
        'Cancel any time by replying to this email; the retainer ends at the close of the month already paid',
      ]) +
      `\n\nWhenever you need something changed, just reply to this email.` +
      sign(o.signer),
  };
}

export function emailJEnd(o: { name?: string | null; until: Date; signer: string }): Email {
  return {
    subject: 'Re: Your retainer is set up',
    text:
      `Hi ${first(o.name)},\n\n` +
      `This confirms that your retainer has been cancelled. It remains active until ${fmtDate(o.until)}, the end of the month already paid, and you won't be invoiced again.\n\n` +
      `Thank you for letting us look after your site. If you need anything in the future, we're always happy to help.` +
      sign(o.signer),
  };
}

function ordinal(n: number) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
