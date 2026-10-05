# OCE Labs

The studio's website at [ocelabs.xyz](https://www.ocelabs.xyz), and the studio itself: the client workflow — leads, questionnaire, proposal and e-signature, invoices, retainers, follow-ups — built into the same app.

## Stack

- Next.js 16 (App Router), React 19, TypeScript
- Neon Postgres via Drizzle ORM
- Gmail API for outbound mail (sends as hello@)
- Stripe for invoices and retainer subscriptions, `@react-pdf/renderer` for the agreement PDF
- Claude (`@anthropic-ai/sdk`) for the inquiry summary and the recap draft; optional
- GSAP and Lenis for the site's motion
- Hosted on Vercel; DNS at Porkbun; email on Google Workspace

## Routes

Public:

- `/` — home
- `/work` — projects, with hover previews, and the Starter layout demos
- `/starter` — the Starter Site, the small-business tier
- `/contact` — the contact form → `/api/inquiry`
- `/privacy`, `/terms`
- `/q/<token>` — a client's questionnaire, pre-filled with what was covered on the call
- `/p/<token>` — a client's proposal: read, download, sign

Studio (Google sign-in, allow-listed):

- `/studio` — leads, ordered by what is due
- `/studio/leads/<id>` — one lead: stage actions, call notes and recap, quote, proposals, payments, retainer, questionnaire, log
- `/studio/leads/new` — a lead that did not come through the form
- `/studio/settings` — what is connected; Gmail connect; webhook URLs
- `/pricing` — the estimator; `?lead=` saves to a lead
- `/pricing/proposal` — preview of a proposal from the estimator

Machine:

- `/api/inquiry` — the contact form's target
- `/api/webhooks/stripe` — `invoice.paid`, `customer.subscription.deleted`
- `/api/webhooks/cal` — Cal.com `BOOKING_CREATED`
- `/api/cron/daily` — nudges, expiry, Friday drafts, day 30 (`vercel.json`, 13:00 UTC)
- `/api/auth/*`, `/api/gmail/*` — sign-in and the mailbox connection

## How the workflow runs

The stages are the ones in `docs/client-workflow.txt`; this is what happens at each.

| Trigger | What happens |
| --- | --- |
| Contact form | Lead created, with a one-line summary · Email A from hello@ with the booking link · alert emailed to everyone who can sign in |
| Cal.com booking | Stage → Call booked |
| No booking after 3 business days | Email A2; closed lost after 7 more days of silence |
| Call notes pasted on the lead, *Draft the recap*, then *Send recap* | Email B with the questionnaire link; the answers from the call are pre-filled |
| Client submits the questionnaire | Answers on the lead; nudge once if it stays out 5 business days |
| *Save to lead* in the estimator, then *Send proposal* | Email C with the proposal link |
| Client signs at `/p/<token>` | Signed PDF (with the e-signature record) sent with Email D · deposit invoice (or the full amount, on the pay-in-full plan) sent from Stripe · payment schedule recorded |
| Days 5 and 12 unsigned; day 14 | Nudges; then expiry |
| Stripe `invoice.paid` on the deposit | Kickoff item ticked; when questionnaire, brand files and copy are also in → Email E with computed dates, stage Building |
| Stripe `invoice.paid` on an invoice made by hand | Recorded on the lead (matched by its lead tag, else the client's email); signing later bills only the balance |
| Fridays while building | Email F drafted into Gmail |
| *Design approved* / *Staging approved* | Milestone or final invoice sent (change orders folded in) · Email G |
| *Live* with the domain | Email H; day 30 later, Email I drafted |
| *Start retainer* / *Cancel retainer* | Monthly Stripe subscription and Email J; cancelling ends it at the close of the paid month and confirms by email |

What stays manual on purpose: the call, checking the recap, the quote, review feedback, change-order approval, the Friday lists, and the day-30 observation.

## Code map

```text
app/
  page.tsx, work/, starter/, contact/, privacy/, terms/   public site
  q/[token]/            questionnaire (form, action, questions.ts)
  p/[token]/            client proposal + signing; pdf/ route
  studio/               sign-in page; (app)/ = leads, lead page, settings
  pricing/              estimator, proposal preview, pdf route, Stripe draft action
  api/                  inquiry, webhooks, cron, auth, gmail
lib/
  pricing.ts            price book, quote maths, URL encoding (tests in pricing.test.ts)
  proposal.ts           the agreement's wording as data
  proposal-pdf.tsx      the agreement as PDF (+ signature page)
  emails.ts             the workflow emails, A to J, and their nudges
  studio.ts             every stage transition and the daily job
  recap.ts              the recap draft, from pasted call notes
  summarize.ts          the one-line summary of an inquiry
  notify.ts             alerts to the studio (new lead, signed, paid)
  logo.ts               the logo's outlines, shared by the site and the PDF
  db/schema.ts          leads, events, proposals, payments, settings
  auth.ts               Google OAuth, session cookie, allow-list
  gmail.ts              MIME builder, Gmail send/draft
  stripe.ts             customers, invoices, subscriptions, webhook signature
components/             site and studio UI
docs/
  client-workflow.txt   the process, with what is automatic per stage
  client-onboarding.txt the questionnaire and how-we-work text, as a document
  pricing-guide.txt     how to quote: the rules, what to ask, common requests
public/brand/           logo PNG set, the social card, and the Google Workspace images
public/work/            a still and a hover clip per project and Starter demo
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

Scripts: `dev`, `build`, `start`, `lint`, `test`, `db:push`, `db:studio`.

## Deploying

Vercel builds from `main`. Environment variables in Vercel mirror `.env.example`; `DATABASE_URL` is injected by the Neon integration. Fonts for the PDF are traced into the serverless bundle by `next.config.ts`.

## Notes

- Theme resolves before first paint in `app/layout.tsx` (saved choice → OS preference → dark).
- The proposal wording lives once, in `lib/proposal.ts`; the on-screen view and the PDF both render it. A signed proposal's PDF is drawn again from that wording on each download, so check for signed proposals before changing a clause.
- Anything a visitor or client reads (the public pages, the emails, the signing page, `docs/client-onboarding.txt`) never names the tools the studio runs on: it says "our payment provider" or "a separate email with the invoice". Tools a client signs up for themselves are named in their proposal. On `/work`, a project still on its host's shared address is captioned "Live demo" instead of the address.
- The questionnaire's questions live in `app/q/[token]/questions.ts`; `docs/client-onboarding.txt` carries the same list as a document.
- The logo is drawn from the outlines in `lib/logo.ts`, on the site and in the PDF, so the site loads one font weight. The PNGs in `public/brand` are rendered from the same outlines.
- Favicon and Apple icon are cut from `public/brand/oce-icon.png`. `oce-avatar.png` is the profile picture (safe under a round crop); `oce-workspace-logo.png` is the organisation logo for the Google Admin console.
- Work previews are a 2400×1500 still and a 12-second 1600×1000 clip per project, same name, in `public/work`. Optimised stills are cached for up to four hours, so a replaced file can take that long to show.

Copyright (c) OCE Labs. All rights reserved.
