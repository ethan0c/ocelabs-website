import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import SmoothScroll from '@/components/SmoothScroll';

/*
 * One typeface, one weight. Geist is a grotesque with tighter apertures than
 * the usual default sans, so it reads as a deliberate choice at display sizes
 * while staying neutral in body copy. The wordmark leans on letter-spacing
 * rather than a second weight, which keeps this to a single font file.
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
  /* Favicon comes from app/icon.svg — it adapts to the OS theme. */
  openGraph: {
    title: 'OCE Labs',
    description: 'A studio building fast, search-ready websites, apps, and brand systems.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" className={geist.variable}>
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
