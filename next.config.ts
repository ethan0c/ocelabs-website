import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // react-pdf reads font files and does its own layout in Node; bundling it
  // breaks both. Leave it as a plain server dependency.
  serverExternalPackages: ['@react-pdf/renderer'],
  experimental: {
    // Cross-fades route changes via the native View Transitions API.
    // Browsers without support just navigate instantly — no fallback needed.
    viewTransition: true,
  },
};

export default nextConfig;
