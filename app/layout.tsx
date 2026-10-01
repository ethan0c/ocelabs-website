import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import SmoothScroll from '@/components/SmoothScroll';

/*
 * One typeface, one weight. Geist is a grotesque with tighter apertures than
 * the usual default sans, so it reads as a deliberate choice at display sizes
 * while staying neutral in body copy. The logo's heavier lettering is drawn
 * as outlines (lib/logo.ts), which keeps this to a single font file.
 */
const geist = Geist({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://ocelabs.xyz'),
  title: 'OCE Labs',
  description: 'A studio building fast, search-ready websites, apps, and brand systems.',
  /* Favicon and Apple touch icon come from app/icon.png and app/apple-icon.png,
     both cut from public/brand/oce-icon.png. */
  openGraph: {
    title: 'OCE Labs',
    description: 'A studio building fast, search-ready websites, apps, and brand systems.',
    type: 'website',
    images: [
      {
        url: '/brand/oce-og.png',
        width: 1200,
        height: 630,
        alt: 'OCE Labs. The whole thing, not just the website.',
      },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // data-theme is set by the inline script before hydration, so the server's
  // value and the client's legitimately differ; React is told to expect it.
  return (
    <html lang="en" data-theme="dark" className={geist.variable} suppressHydrationWarning>
      <head>
        {/* Resolve theme before first paint so there is no flash. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem('theme');var p=window.matchMedia('(prefers-color-scheme:dark)').matches;document.documentElement.setAttribute('data-theme',s||(p?'dark':'light'));}catch(e){}})();`,
          }}
        />
      </head>
      <body>
        <SmoothScroll />
        <Nav />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
