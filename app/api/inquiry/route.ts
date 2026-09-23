import { createLead, sendEmailA } from '@/lib/studio';
import { fromAddress, gmailConfigured, sendMail } from '@/lib/gmail';

export const dynamic = 'force-dynamic';

/*
 * The contact form posts here. Creates the lead, replies with Email A from
 * hello@ (unless AUTO_EMAIL_A=false), and pings the inbox.
 */

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Per-instance, resets on cold start: enough to blunt a script, not a defence.
const recent = new Map<string, number[]>();
function tooMany(ip: string) {
  const now = Date.now();
  const hits = (recent.get(ip) ?? []).filter((t) => now - t < 3600_000);
  hits.push(now);
  recent.set(ip, hits);
  return hits.length > 5;
}

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
  if (tooMany(ip)) return Response.json({ error: 'Too many messages from this address. Email us directly.' }, { status: 429 });

  const form = await req.formData();
  // Honeypot: real people never see this field.
  if (String(form.get('website') ?? '')) return Response.json({ ok: true });

  const email = String(form.get('email') ?? '').trim();
  const message = String(form.get('message') ?? '').trim();
  const budget = String(form.get('budget') ?? '').trim();
  const name = String(form.get('name') ?? '').trim();
  if (!EMAIL.test(email)) return Response.json({ error: 'Please enter a valid email address.' }, { status: 400 });
  if (!message) return Response.json({ error: 'Please add a message.' }, { status: 400 });

  let lead;
  try {
    lead = await createLead({ name: name || null, email, message, budget: budget || null });
  } catch (e) {
    // The page shows hello@ next to the form, so a failure still has a way through.
    console.error('inquiry: could not create the lead', e);
    return Response.json({ error: 'Something went wrong on our side. Email hello@ocelabs.xyz directly.' }, { status: 502 });
  }

  const auto = process.env.AUTO_EMAIL_A !== 'false';
  if (auto) {
    try {
      await sendEmailA(lead.id);
    } catch {
      /* logged on the lead; the studio shows it as pending */
    }
  }

  if (await gmailConfigured()) {
    try {
      const to = await fromAddress();
      await sendMail({
        to,
        replyTo: email,
        subject: `New inquiry: ${name || email}${budget ? ` (${budget})` : ''}`,
        text: `${message}\n\n—\n${name ? `${name} · ` : ''}${email}\nBudget: ${budget || 'not given'}\n\nOpen in the studio: ${(process.env.SITE_URL || '').replace(/\/$/, '')}/studio/leads/${lead.id}`,
      });
    } catch {
      /* the lead exists either way */
    }
  }

  return Response.json({ ok: true });
}
