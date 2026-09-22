/*
 * The nine client-facing emails from client-workflow.txt, Part 3, as
 * functions. Short, plain, and they fit on a phone. Anything a person must
 * write (the recap bullets, the Friday items, the day-30 observation) is a
 * parameter or is left for a draft.
 */

import { usd, weeksLabel, type Quote } from '@/lib/pricing';

const SIGN = (signer: string) => `\n\n${signer}\nOCE Labs\nhello@ocelabs.xyz`;

const longDate = new Intl.DateTimeFormat('en-US', { dateStyle: 'long' });
export const fmtDate = (d: Date) => longDate.format(d);

export type Email = { subject: string; text: string };

const first = (name?: string | null) => (name ? name.trim().split(/\s+/)[0] : 'there');

export function emailA(o: { name?: string | null; topic: string; calLink: string; signer: string }): Email {
  return {
    subject: 'Re: your project, a time to talk',
    text:
      `Hi ${first(o.name)},\n\n` +
      `Thanks for getting in touch about ${o.topic}.\n\n` +
      `The best next step is a 30-minute call so we can understand what you need and tell you honestly whether we are the right fit. You can pick a time here:\n\n` +
      `${o.calLink}\n\n` +
      `If none of those times work, reply with two or three that do and we will make one happen.` +
      SIGN(o.signer),
  };
}

export function emailA2(o: { name?: string | null; calLink: string; signer: string }): Email {
  return {
    subject: 'Re: your project, a time to talk',
    text:
      `Hi ${first(o.name)},\n\n` +
      `Following up in case this got buried. The link to book a call is below. If the timing has changed on your side, no problem; just let us know and we will close the loop.\n\n` +
      `${o.calLink}` +
      SIGN(o.signer),
  };
}

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
    subject: 'OCE Labs: recap and next steps',
    text:
      `Hi ${first(o.name)},\n\n` +
      `Good to speak with you today. Here is what we heard, so you can correct anything we got wrong:\n\n` +
      o.bullets.map((b) => `• ${b}`).join('\n') +
      `\n\nBased on that, we would recommend the ${o.packageLabel}, which typically runs ${o.range} and takes ${o.weeks} from kickoff.\n\n` +
      `Next steps:\n` +
      `1. You fill in the short questionnaire here: ${o.questionnaireLink}\n` +
      `2. Within two business days of getting it back, we send a fixed quote, a launch date, and a short agreement to sign.\n` +
      `3. Once that is signed and the deposit is paid, we start.\n\n` +
      `The questionnaire page also explains how we work and what you get at the end.` +
      SIGN(o.signer),
  };
}

export function emailQuestionnaireNudge(o: { name?: string | null; questionnaireLink: string; signer: string }): Email {
  return {
    subject: 'OCE Labs: the questionnaire',
    text:
      `Hi ${first(o.name)},\n\n` +
      `A quick nudge on the questionnaire, so we can get you a fixed quote and a launch date:\n\n${o.questionnaireLink}\n\n` +
      `Short answers are fine, and you can skip anything that does not apply.` +
      SIGN(o.signer),
  };
}

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
    subject: `OCE Labs: proposal for ${o.company}`,
    text:
      `Hi ${first(o.name)},\n\n` +
      `Thank you for the questionnaire. Your proposal is ready to read and sign here:\n\n${o.proposalLink}\n\n` +
      `In short:\n` +
      `• Scope: ${q.lines.map((l) => l.label).join(', ')}\n` +
      `• Fixed price: ${usd.format(q.total)}\n` +
      `• Timeline: ${weeksLabel(q.weeks)} from kickoff\n` +
      `• Payment: ${pay}\n\n` +
      `The price and the start date are held until ${fmtDate(o.validUntil)}. If anything looks off or you want to adjust the scope, reply here or book a call: ${o.calLink}` +
      SIGN(o.signer),
  };
}

export function emailCNudge(o: { name?: string | null; proposalLink: string; validUntil: Date; last: boolean; signer: string }): Email {
  return {
    subject: 'Re: OCE Labs: proposal',
    text:
      `Hi ${first(o.name)},\n\n` +
      (o.last
        ? `The proposal is held until ${fmtDate(o.validUntil)}; after that the price and the start date are released. If you would like to go ahead, it takes a minute to sign here:\n\n`
        : `Checking in on the proposal. If you have questions or want to change the scope, reply here; if it looks right, it takes a minute to sign:\n\n`) +
      `${o.proposalLink}` +
      SIGN(o.signer),
  };
}

export function emailD(o: { name?: string | null; depositAmount: number; folderLink?: string | null; signer: string }): Email {
  return {
    subject: 'OCE Labs: welcome, and what happens next',
    text:
      `Hi ${first(o.name)},\n\n` +
      `Thank you for signing. We are glad to be working with you. The signed agreement is attached for your records.\n\n` +
      `You will get a separate email from Stripe with the deposit invoice for ${usd.format(o.depositAmount)}. You can pay by bank transfer or card from the link in it.\n\n` +
      `The project starts on the day these four things are in:\n` +
      `• The deposit\n` +
      `• The questionnaire (done)\n` +
      `• Your logo, brand files, and any photography you want used\n` +
      `• Any existing copy you want kept\n\n` +
      (o.folderLink
        ? `You can send files by replying here or adding them to this folder: ${o.folderLink}\n\n`
        : `You can send files by replying to this email.\n\n`) +
      `As soon as the last one arrives we will confirm your kickoff and launch dates.` +
      SIGN(o.signer),
  };
}

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
    subject: `OCE Labs: ${o.company} has kicked off`,
    text:
      `Hi ${first(o.name)},\n\n` +
      `Everything is in, so your project officially started today, ${fmtDate(o.kickoff)}.\n\n` +
      `• Launch date: ${fmtDate(o.launch)}\n` +
      `• Content deadline: ${fmtDate(o.contentDeadline)}. Anything that arrives after this moves the launch by the same number of days.\n` +
      `• Design review: around ${fmtDate(o.designReview)}\n` +
      `• Staging review: around ${fmtDate(o.stagingReview)}\n\n` +
      `You will hear from us every Friday with what was done, what is next, and anything we need from you.` +
      SIGN(o.signer),
  };
}

/** Drafted, never sent: the items are the week's real work. */
export function emailF(o: { name?: string | null; company: string; week: number; launch: Date | null; signer: string }): Email {
  return {
    subject: `OCE Labs: ${o.company} update, week ${o.week}`,
    text:
      `Hi ${first(o.name)},\n\n` +
      `Done this week:\n• \n\n` +
      `Next week:\n• \n\n` +
      `Needed from you:\n• Nothing this week\n\n` +
      (o.launch ? `On track for ${fmtDate(o.launch)}.` : '') +
      SIGN(o.signer),
  };
}

export function emailG(o: { name?: string | null; company: string; amount: number; changeOrders?: string | null; signer: string }): Email {
  return {
    subject: `OCE Labs: ${o.company} is ready to launch`,
    text:
      `Hi ${first(o.name)},\n\n` +
      `Thank you for approving the site. The final invoice for ${usd.format(o.amount)} is on its way from Stripe.` +
      (o.changeOrders ? ` It includes the approved additions: ${o.changeOrders}.` : '') +
      `\n\nAs soon as it is paid we will connect your domain and go live, usually the same day. Tell us if there is a particular day or time you want the launch to happen.` +
      SIGN(o.signer),
  };
}

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
  const line = (label: string, link?: string | null) => `• ${label}${link ? `: ${link}` : ''}`;
  return {
    subject: `OCE Labs: ${o.domain} is live`,
    text:
      `Hi ${first(o.name)},\n\n` +
      `${o.domain} is live. Here is everything that is now yours:\n\n` +
      line('The live site, with HTTPS, redirects, and analytics', o.analyticsLink) + '\n' +
      line('The code repository, access granted to your email', o.repoLink) + '\n' +
      line('The hosting account, access granted to your email', o.hostingLink) + '\n' +
      line('Google Search Console, with the sitemap submitted', o.searchConsoleLink) + '\n' +
      `• A short guide to updating content: attached\n\n` +
      `For the next 30 days, until ${fmtDate(o.until)}, we fix anything we missed at no charge. Just reply to this email.` +
      SIGN(o.signer),
  };
}

/** Drafted: the observation has to be real. */
export function emailI(o: { name?: string | null; domain: string; signer: string }): Email {
  return {
    subject: 'OCE Labs: one month in',
    text:
      `Hi ${first(o.name)},\n\n` +
      `It has been a month since ${o.domain} went live. [One real observation from analytics or Search Console.]\n\n` +
      `The 30 days of included fixes end today. If you would like us to keep looking after the site, including updates, monitoring, and a search review each quarter, the monthly retainer starts at $300 and can be cancelled any time. Reply and we will set it up.\n\n` +
      `Two small asks, only if you are happy with the work:\n` +
      `• Two or three sentences we could quote on our site\n` +
      `• An introduction to anyone you know who needs a site built\n\n` +
      `Thank you for trusting us with this.` +
      SIGN(o.signer),
  };
}
