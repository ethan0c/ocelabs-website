import 'server-only';
import type { Lead } from '@/lib/db';
import { fromAddress, gmailConfigured, sendMail } from '@/lib/gmail';
import { siteUrl } from '@/lib/auth';

/*
 * "New lead" alerts for the two of you. Email goes to NOTIFY_EMAILS (comma
 * separated; defaults to the hello@ inbox) through Gmail. SMS goes through
 * Twilio when TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM and
 * NOTIFY_SMS are set; otherwise it is skipped silently.
 */

const list = (v?: string) =>
  (v || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

export async function notifyNewLead(lead: Lead, o: { emailASent: boolean }) {
  const who = lead.company || lead.name || lead.email;
  const link = `${siteUrl()}/studio/leads/${lead.id}`;
  const line = lead.summary || (lead.message ? lead.message.replace(/\s+/g, ' ').slice(0, 140) : 'No message');

  const results = { email: false, sms: 0 };

  if (await gmailConfigured()) {
    const to = list(process.env.NOTIFY_EMAILS);
    const recipients = to.length ? to : [await fromAddress()];
    try {
      await sendMail({
        to: recipients.join(', '),
        replyTo: lead.email,
        subject: `New lead: ${who}${lead.budget ? ` · ${lead.budget}` : ''}`,
        text:
          `${line}\n\n` +
          `${o.emailASent ? 'Email A went out with the booking link.' : 'Email A has not been sent yet.'}\n` +
          `${link}\n\n` +
          (lead.message ? `— Their message —\n${lead.message}\n\n` : '') +
          `${lead.name ? `${lead.name} · ` : ''}${lead.email}${lead.budget ? ` · budget ${lead.budget}` : ''} · via ${lead.source}`,
      });
      results.email = true;
    } catch (e) {
      console.error('notifyNewLead email failed', e);
    }
  }

  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM;
  const numbers = list(process.env.NOTIFY_SMS);
  if (sid && token && from && numbers.length) {
    const body = `New lead: ${who}${lead.budget ? ` (${lead.budget})` : ''}. ${line.slice(0, 120)} ${link}`;
    for (const to of numbers) {
      try {
        const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
          method: 'POST',
          headers: {
            Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({ To: to, From: from, Body: body }),
        });
        if (res.ok) results.sms++;
        else console.error('notifyNewLead sms failed', res.status, await res.text());
      } catch (e) {
        console.error('notifyNewLead sms failed', e);
      }
    }
  }

  return results;
}
