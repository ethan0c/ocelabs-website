import 'server-only';
import type { Lead } from '@/lib/db';
import { allowedEmails, siteUrl } from '@/lib/auth';
import { fromAddress, gmailConfigured, sendMail } from '@/lib/gmail';

/*
 * "New lead" alert, emailed through Gmail to everyone who can sign in to the
 * studio (STUDIO_ALLOWED_EMAILS). Falls back to the hello@ inbox if that
 * list is empty.
 */
export async function notifyNewLead(lead: Lead, o: { emailASent: boolean }) {
  if (!(await gmailConfigured())) return false;

  const who = lead.company || lead.name || lead.email;
  const link = `${siteUrl()}/studio/leads/${lead.id}`;
  const line = lead.summary || (lead.message ? lead.message.replace(/\s+/g, ' ').slice(0, 140) : 'No message');
  const to = allowedEmails();
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
    return true;
  } catch (e) {
    console.error('notifyNewLead failed', e);
    return false;
  }
}
