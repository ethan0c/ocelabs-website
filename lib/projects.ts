import 'server-only';
import fs from 'node:fs';
import path from 'node:path';

/*
 * The portfolio, shared by the Work page and the home page so the two can't
 * drift. Order matters: the first project is the shot in the home hero, and
 * the three after it make the strip under the services.
 *
 * Checks the filesystem for shots and clips, so server components only.
 */

export type Project = {
  name: string;
  desc: string;
  /** Who it's for, in a few words. Captions a shot where `desc` would run long. */
  client?: string;
  /** What we made, when it's more than a site. Tells a web app from a brochure at a glance. */
  kind?: string;
  href: string;
  /** File in /public/work. Rendered only if it actually exists. */
  shot: string;
};

export const projects: Project[] = [
  {
    name: 'Ada Palm',
    desc: 'A site for a New York marketing consultancy, with their showreel filling the screen. We moved them off a monthly website builder onto a site they own.',
    client: 'Marketing consultancy, New York',
    kind: 'Brand website',
    href: 'https://adapalm.com',
    shot: 'adapalm.png',
  },
  {
    name: 'Helthy',
    desc: 'An AI fitness and nutrition app. We designed the app itself, and the site that introduces it.',
    client: 'Fitness and nutrition app',
    kind: 'App design and website',
    href: 'https://helthy.app',
    shot: 'helthy.png',
  },
  {
    name: 'Temegs Engineering',
    desc: 'A new website and logo for a civil engineering contractor in Port Harcourt, Nigeria.',
    client: 'Civil engineering, Port Harcourt',
    kind: 'Website and logo',
    href: 'https://temegsengineering.com/',
    shot: 'temegs.png',
  },
  {
    name: 'JobScout',
    desc: 'An AI career agent that finds jobs to fit your resume and tracks every application, with accounts and a database behind it.',
    client: 'AI career agent',
    kind: 'Web app',
    href: 'https://jobscout-pi-pied.vercel.app',
    shot: 'jobscout.png',
  },
  {
    name: 'Concepta',
    desc: 'A site for an IT and cybersecurity firm serving government and regulated industries, with a page for each service and a quote request form.',
    client: 'IT and cybersecurity firm',
    kind: 'Website',
    href: 'https://www.conceptainnovation.com/',
    shot: 'concepta.png',
  },
];

/**
 * The Starter layouts, each a live demo of a made-up business. They sit in
 * their own group under the client work so nobody mistakes them for clients.
 * All three are served from one Vercel project (vercel.json in oce-starter).
 */
export const starters: Project[] = [
  {
    name: 'Restaurant',
    desc: 'La Palma Taquería. It opens with a tortilla press, and the menu is laid out like the printed one on the table.',
    href: 'https://oce-starter-services.vercel.app/restaurant',
    shot: 'starter-restaurant.png',
  },
  {
    name: 'Barbershop',
    desc: "Maceo's. Prices read like the board on the wall, and every barber has their own booking link.",
    href: 'https://oce-starter-services.vercel.app/barbershop',
    shot: 'starter-barbershop.png',
  },
  {
    name: 'Car detailing',
    desc: 'Sheen. Drag the slider to see a car before and after, then check the price for your size of car.',
    href: 'https://oce-starter-services.vercel.app/detailing',
    shot: 'starter-detailing.png',
  },
];

/**
 * Bare host as the caption — more informative than a repeated "Visit →".
 * Keeps the path when there is one. A project still on its host's shared
 * address gets a plain label instead: that address names the hosting
 * company, which client-facing copy never does.
 */
export function domainOf(href: string) {
  const url = new URL(href);
  if (url.hostname.endsWith('.vercel.app')) return 'Live demo';
  const path = url.pathname.replace(/\/$/, '');
  return url.hostname.replace(/^www\./, '') + path;
}

export function hasAsset(file: string) {
  return fs.existsSync(path.join(process.cwd(), 'public', 'work', file));
}

/**
 * A project gets a hover preview if a same-named .mp4 sits next to its shot.
 * Dropping `name.mp4` into /public/work is all it takes to enable one.
 */
export function clipFor(shot: string) {
  const clip = shot.replace(/\.[^.]+$/, '.mp4');
  return hasAsset(clip) ? clip : undefined;
}
