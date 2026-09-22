import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // react-pdf reads font files and does its own layout in Node; bundling it
  // breaks both. Leave it as a plain server dependency.
  serverExternalPackages: ['@react-pdf/renderer'],
  // The PDF route reads the Geist TTFs from disk at runtime by a computed
  // path, which the bundler cannot trace. On Vercel that would leave the
  // serverless function without the fonts, so include them explicitly.
  outputFileTracingIncludes: {
    '/pricing/proposal/pdf': ['./public/fonts/*.ttf'],
  },
  experimental: {
    // Cross-fades route changes via the native View Transitions API.
    // Browsers without support just navigate instantly — no fallback needed.
    viewTransition: true,
  },
};

export default nextConfig;
