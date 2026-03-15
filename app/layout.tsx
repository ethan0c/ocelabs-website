import type { Metadata } from 'next';
import { Space_Grotesk, Unbounded } from 'next/font/google';
import './globals.css';
import Nav from '@/components/Nav';
import ScreenIntro from '@/components/ScreenIntro';
import PageAtmosphere from '@/components/PageAtmosphere';
import Footer from '@/components/Footer';
import BodyClassSetter from '@/components/BodyClassSetter';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-primary',
  weight: ['300', '400', '500', '600', '700'],
});

const unbounded = Unbounded({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'OCE Labs',
  description: 'OCE Labs builds ambitious digital products with engineering precision and design-forward execution.',
  icons: { icon: '/icon-logo.png', shortcut: '/icon-logo.png' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className={`${spaceGrotesk.variable} ${unbounded.variable}`}
    >
      <head>
        {/* Anti-flicker: read saved theme before first paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var s=localStorage.getItem('theme');var p=window.matchMedia('(prefers-color-scheme:dark)').matches;document.documentElement.setAttribute('data-theme',s||(p?'dark':'light'));})();`,
          }}
        />
      </head>
      <body>
        <BodyClassSetter />
        <ScreenIntro />
        <PageAtmosphere />
        <Nav />
        {children}
        <Footer />
      </body>
    </html>
  );
}
