# OCE Labs

The studio's website at [ocelabs.xyz](https://www.ocelabs.xyz), and the studio itself: the client workflow — leads, questionnaire, proposal and e-signature, invoices, follow-ups — built into the same app.

## Stack

- Next.js 16 (App Router), React 19, TypeScript
- Neon Postgres via Drizzle ORM
- Gmail API for outbound mail (sends as hello@)
- Stripe for invoices, `@react-pdf/renderer` for the agreement PDF
- GSAP for the site's motion
- Hosted on Vercel; DNS at Porkbun; email on Google Workspace

## Routes

Public:

- `/` — home
- `/work` — projects, with hover previews
- `/contact` — the contact form → `/api/inquiry`
- `/privacy`, `/terms`
- `/q/<token>` — a client's questionnaire
- `/p/<token>` — a client's proposal: read, download, sign

Studio (Google sign-in, allow-listed):

- `/studio` — leads, ordered by what is due
- `/studio/leads/<id>` — one lead: stage actions, quote, proposals, payments, questionnaire, log
- `/studio/leads/new` — a lead that did not come through the form
- `/studio/settings` — what is connected; Gmail connect; webhook URLs
- `/pricing` — the estimator; `?lead=` saves to a lead
- `/pricing/proposal` — preview of a proposal from the estimator

Machine:

- `/api/inquiry` — the contact form's target
- `/api/webhooks/stripe` — `invoice.paid`
- `/api/webhooks/cal` — Cal.com `BOOKING_CREATED`
- `/api/cron/daily` — nudges, expiry, Friday drafts, day 30 (`vercel.json`, 13:00 UTC)
- `/api/auth/*`, `/api/gmail/*` — sign-in and the mailbox connection

## How the workflow runs

The stages are the ones in `docs/client-workflow.txt`; this is what happens at each.

| Trigger | What happens |
| --- | --- |
| Contact form | Lead created · Email A from hello@ with the booking link · inbox pinged |
| Cal.com booking | Stage → Call booked |
| No booking after 3 business days | Email A2; closed lost after 7 more days of silence |
| *Send recap* on the lead (four bullets, package, range) | Email B with the questionnaire link |
| Client submits the questionnaire | Answers on the lead; nudge once if it stays out 5 business days |
| *Save to lead* in the estimator, then *Send proposal* | Email C with the proposal link |
| Client signs at `/p/<token>` | Signed PDF (with the e-signature record) sent with Email D · deposit invoice sent from Stripe · payment schedule recorded |
| Days 5 and 12 unsigned; day 14 | Nudges; then expiry |
| Stripe `invoice.paid` on the deposit | Kickoff item ticked; when questionnaire, brand files and copy are also in → Email E with computed dates, stage Building |
| Fridays while building | Email F drafted into Gmail |
| *Design approved* / *Staging approved* | Milestone or final invoice sent (change orders folded in) · Email G |
| *Live* with the domain | Email H; day 30 later, Email I drafted |

What stays manual on purpose: the call, the recap bullets, the quote, review feedback, change-order approval, the Friday lists, and the day-30 observation.

## Code map

```text
app/
  page.tsx, work/, contact/, privacy/, terms/   public site
  q/[token]/            questionnaire (form, action, questions.ts)
  p/[token]/            client proposal + signing; pdf/ route
  studio/               sign-in page; (app)/ = leads, lead page, settings
  pricing/              estimator, proposal preview, pdf route, Stripe draft action
  api/                  inquiry, webhooks, cron, auth, gmail
lib/
  pricing.ts            price book, quote maths, URL encoding
  proposal.ts           the agreement's wording as data
  proposal-pdf.tsx      the agreement as PDF (+ signature page)
  emails.ts             the nine workflow emails
  studio.ts             every stage transition and the daily job
  db/schema.ts          leads, events, proposals, payments, settings
  auth.ts               Google OAuth, session cookie, allow-list
  gmail.ts              MIME builder, Gmail send/draft
  stripe.ts             customers, invoices, webhook signature
components/             site and studio UI
docs/
  client-workflow.txt   the process, with what is automatic per stage
  client-onboarding.txt the questionnaire and how-we-work text (source for /q)
  checklist.txt         one-time setup and the deploy smoke test
public/brand/           logo PNG set and the social card
public/fonts/           Geist TTFs for the PDF
drizzle/                generated migration SQL
```

## Setup

```bash
npm install
cp .env.example .env     # fill it in; every key says where it comes from
npm run db:push          # creates the tables in Neon (once, and after schema changes)
npm run dev
```

Then sign in at `/studio`, and on Settings connect Gmail as hello@. The Settings page lists the URLs to give Stripe and Cal.com for their webhooks.

Scripts: `dev`, `build`, `start`, `lint`, `db:push`, `db:studio`.

## Deploying

Vercel builds from `main`. Environment variables in Vercel mirror `.env.example`; `DATABASE_URL` is injected by the Neon integration. Fonts for the PDF are traced into the serverless bundle by `next.config.ts`.

## Notes

- Theme resolves before first paint in `app/layout.tsx` (saved choice → OS preference → dark).
- The proposal wording lives once, in `lib/proposal.ts`; the on-screen view and the PDF both render it.
- Favicon and Apple icon are cut from `public/brand/oce-icon.png`.

Copyright (c) OCE Labs. All rights reserved.
