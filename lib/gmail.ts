import 'server-only';
import { refreshAccessToken } from '@/lib/auth';
import { getSetting } from '@/lib/settings';

/*
 * Sends from the hello@ mailbox through the Gmail API, so every message
 * sits in Sent and replies thread in the inbox the studio already reads.
 * Plain text only: the workflow's emails are short and personal, and plain
 * text is what a real person's reply looks like.
 */

export type Attachment = { filename: string; contentType: string; data: Buffer };

export type Mail = {
  to: string;
  subject: string;
  text: string;
  cc?: string;
  replyTo?: string;
  attachments?: Attachment[];
  /** Gmail thread to continue, so a nudge lands under the original. */
  threadId?: string;
};

const GMAIL = 'https://gmail.googleapis.com/gmail/v1/users/me';

export async function gmailConfigured() {
  return Boolean(await getSetting('gmail_refresh_token'));
}

export async function fromAddress() {
  return (await getSetting('gmail_address')) || process.env.STUDIO_FROM_EMAIL || 'hello@ocelabs.xyz';
}

async function token() {
  const refresh = await getSetting('gmail_refresh_token');
  if (!refresh) throw new Error('Gmail is not connected. Studio → Settings → Connect Gmail.');
  return refreshAccessToken(refresh);
}

function encodeHeader(s: string) {
  // RFC 2047 for anything outside ASCII (client names with accents, etc.)
  return /^[\x20-\x7e]*$/.test(s) ? s : `=?utf-8?B?${Buffer.from(s).toString('base64')}?=`;
}

function wrap76(b64: string) {
  return b64.replace(/(.{76})/g, '$1\r\n');
}

/** RFC 822 message, multipart/mixed when there are attachments. */
export async function buildRaw(mail: Mail) {
  const from = await fromAddress();
  const headers = [
    `From: OCE Labs <${from}>`,
    `To: ${mail.to}`,
    ...(mail.cc ? [`Cc: ${mail.cc}`] : []),
    ...(mail.replyTo ? [`Reply-To: ${mail.replyTo}`] : []),
    `Subject: ${encodeHeader(mail.subject)}`,
    'MIME-Version: 1.0',
  ];
  const textPart =
    'Content-Type: text/plain; charset="UTF-8"\r\nContent-Transfer-Encoding: base64\r\n\r\n' +
    wrap76(Buffer.from(mail.text, 'utf8').toString('base64'));

  let body: string;
  if (mail.attachments?.length) {
    const boundary = `oce_${Date.now().toString(36)}`;
    headers.push(`Content-Type: multipart/mixed; boundary="${boundary}"`);
    const parts = [
      textPart,
      ...mail.attachments.map(
        (a) =>
          `Content-Type: ${a.contentType}; name="${a.filename}"\r\n` +
          `Content-Disposition: attachment; filename="${a.filename}"\r\n` +
          'Content-Transfer-Encoding: base64\r\n\r\n' +
          wrap76(a.data.toString('base64')),
      ),
    ];
    body = parts.map((p) => `--${boundary}\r\n${p}\r\n`).join('') + `--${boundary}--\r\n`;
  } else {
    body = textPart;
  }
  const message = headers.join('\r\n') + '\r\n' + body;
  return Buffer.from(message).toString('base64url');
}

async function call(path: string, body: unknown) {
  const res = await fetch(`${GMAIL}${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${await token()}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = (await res.json()) as { id?: string; threadId?: string; error?: { message?: string } };
  if (!res.ok) throw new Error(data.error?.message ?? `Gmail returned ${res.status}`);
  return data;
}

/** Send now. Returns Gmail's message and thread ids. */
export async function sendMail(mail: Mail) {
  const raw = await buildRaw(mail);
  return call('/messages/send', { raw, ...(mail.threadId ? { threadId: mail.threadId } : {}) });
}

/** Leave it in Drafts for a person to finish — the Friday update, the day-30 note. */
export async function draftMail(mail: Mail) {
  const raw = await buildRaw(mail);
  return call('/drafts', { message: { raw, ...(mail.threadId ? { threadId: mail.threadId } : {}) } });
}
