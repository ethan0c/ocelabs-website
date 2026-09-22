# OCE Labs Website

A Next.js App Router site for OCE Labs, with the studio's client workflow (leads, proposals, e-signature, invoices, follow-ups) built in.

## Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- GSAP + ScrollTrigger
- react-icons

## Routes

- `/` - Home
- `/services` - Services + quote estimator modal
- `/work` - Project portfolio
- `/contact` - Contact form (supports query-prefill from services estimator)

## Project Structure

```txt
oce-labs-website/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── contact/page.tsx
│   ├── services/page.tsx
│   └── work/page.tsx
├── components/
│   ├── Nav.tsx
│   ├── ScreenIntro.tsx
│   ├── PageAtmosphere.tsx
│   ├── Footer.tsx
│   ├── BodyClassSetter.tsx
│   ├── GsapPageEffects.tsx
│   ├── contact/ContactForm.tsx
│   ├── home/HomeHeroTitle.tsx
│   └── services/
│       ├── ServiceCard.tsx
│       ├── PriceEstimatorModal.tsx
│       └── ServicesInteractive.tsx
├── hooks/
│   ├── useGsapAnimations.ts
│   ├── useTheme.ts
│   ├── useMobileMenu.ts
│   └── useArcMenu.ts
├── public/
│   ├── brand/           # PNG logo set: app icon, mark, lockups, OG card
│   └── fonts/           # Geist TTFs for the PDF
├── package.json
└── MIGRATION.md
```

## Setup

```bash
npm install
```

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Migration Status

- Phases 0-4: In progress separately
- Phases 5-10: Implemented
   - Screen intro with session gate (`sessionStorage`)
   - Dynamic GSAP imports in client hooks/components
   - ScrollTrigger setup and cleanup
   - Home hero title choreography converted to React state flow
   - Services estimator now routes to contact using URL query params
   - Contact page pre-fills form from query params
   - Notification flow converted to React state-driven UI

## Contact Form

The contact form posts to `/api/inquiry`, which creates the lead in the studio and replies from hello@. Honeypot field plus a per-IP limit; no third-party form service.

## Studio: the client workflow, automated

`/studio` (Google sign-in, allow-listed) is the tracker and the control panel. The workflow in `docs/client-workflow.txt` runs like this:

| Step | What happens | Where |
|---|---|---|
| Inquiry | Contact form → lead row, Email A auto-reply from hello@, ping to the inbox | `app/api/inquiry` |
| Booking | Cal.com webhook → stage "Call booked" | `app/api/webhooks/cal` |
| Recap | Button on the lead: Email B with a questionnaire link (`/q/<token>`) | lead page |
| Questionnaire | Client fills the web form → answers on the lead, next action set | `app/q/[token]` |
| Quote | Estimator opened from the lead saves to it | `/pricing?lead=` |
| Proposal | Button: Email C with `/p/<token>`; client reads, downloads, signs in place | `app/p/[token]` |
| Signature | Signed PDF (with e-signature record) emailed with Email D; deposit invoice sent from Stripe | `lib/studio.ts` signProposal |
| Deposit paid | Stripe webhook → when all four kickoff items are in, Email E with computed dates | `app/api/webhooks/stripe` |
| Build | Fridays: Email F drafted into Gmail; buttons for design/staging approval send the next invoices + Email G | daily cron, lead page |
| Launch | Button: Email H; day 30: Email I drafted | lead page, daily cron |
| Nudges | A2, questionnaire, proposal day 5/12, expiry day 14, closed-lost after silence | `app/api/cron/daily` |

Code map: `lib/db/schema.ts` (tables), `lib/studio.ts` (every transition), `lib/emails.ts` (the nine emails), `lib/gmail.ts`, `lib/stripe.ts`, `lib/auth.ts`, `lib/pricing.ts` (price book), `lib/proposal.ts` + `lib/proposal-pdf.tsx` (the agreement).

Setup: fill `.env.example`, run `npm run db:push` once against the Neon database, then Studio → Settings → Connect Gmail. Settings lists the webhook URLs for Stripe and Cal.com.

## Notes

- Theme is initialized early in `app/layout.tsx` to reduce theme flash on first paint.
- Intro animation is shown once per browser session.
- Build is currently passing.
- If `npm run lint` fails, verify your ESLint configuration matches ESLint 9 flat-config requirements.

## License

Copyright (c) OCE Labs. All rights reserved.
