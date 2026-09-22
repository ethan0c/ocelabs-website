# OCE Labs Website

A Next.js App Router site for OCE Labs with animated page transitions, GSAP scroll effects, services quote flow, and a Formspree-powered contact form.

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

The contact form submits to Formspree endpoint `https://formspree.io/f/xeaojwdr` and performs basic client-side validation before submit.

## Internal: quote → proposal → invoices

`/pricing` (PIN-gated) is the estimator. The whole quote lives in its `?q=` URL, so a link is a saved quote. From it:

- `/pricing/proposal?q=…` previews the agreement (docs/client-workflow.txt, Part 4) from the same quote; `/pricing/proposal/pdf?q=…` renders it as a PDF with `@react-pdf/renderer` (wording in `lib/proposal.ts`, layout in `app/pricing/proposal/pdf/ProposalPdf.tsx`). Send that PDF for signature.
- "Draft in Stripe" on each payment line creates a draft invoice for that stage via the Stripe API. Drafts are reviewed and sent from the dashboard; nothing is sent automatically.

The price book and the arithmetic are in `lib/pricing.ts`; the estimator, the proposal and the invoice action all read from it. Environment variables are listed in `.env.example`.

## Notes

- Theme is initialized early in `app/layout.tsx` to reduce theme flash on first paint.
- Intro animation is shown once per browser session.
- Build is currently passing.
- If `npm run lint` fails, verify your ESLint configuration matches ESLint 9 flat-config requirements.

## License

Copyright (c) OCE Labs. All rights reserved.
