import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    // Cross-fades route changes via the native View Transitions API.
    // Browsers without support just navigate instantly — no fallback needed.
    viewTransition: true,
  },
};

export default nextConfig;
