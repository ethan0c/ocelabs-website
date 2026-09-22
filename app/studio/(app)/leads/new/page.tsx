import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createLead } from '@/lib/studio';

export const metadata: Metadata = { title: 'New lead — OCE Labs Studio', robots: { index: false } };

async function create(form: FormData) {
  'use server';
  const email = String(form.get('email') ?? '').trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
  const lead = await createLead({
    name: String(form.get('name') ?? ''),
    company: String(form.get('company') ?? ''),
    email,
    message: String(form.get('message') ?? ''),
    source: String(form.get('source') ?? 'referral') || 'referral',
  });
  redirect(`/studio/leads/${lead.id}`);
}

/** For leads that arrive by referral, phone, or a DM rather than the form. */
export default function NewLeadPage() {
  return (
    <>
      <header className="shell page-head">
        <p className="eyebrow rise rise-1">Studio</p>
        <h1 className="h1 rise rise-2">Add a lead.</h1>
      </header>
      <section className="shell studio-body">
        <form action={create} className="studio-form">
          <div className="field">
            <label htmlFor="name">Name</label>
            <input id="name" name="name" type="text" />
          </div>
          <div className="field">
            <label htmlFor="company">Company</label>
            <input id="company" name="company" type="text" />
          </div>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" required />
          </div>
          <div className="field">
            <label htmlFor="source">Source</label>
            <input id="source" name="source" type="text" placeholder="referral, LinkedIn, phone" />
          </div>
          <div className="field">
            <label htmlFor="message">What they want</label>
            <textarea id="message" name="message" rows={3} />
          </div>
          <button type="submit" className="btn btn--primary">
            Create
          </button>
        </form>
      </section>
    </>
  );
}
