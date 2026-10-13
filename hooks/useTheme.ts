'use client';

import { useEffect } from 'react';

type Theme = 'dark' | 'light';

/**
 * The theme is never chosen on the site. It follows the device's light/dark
 * setting, and when the browser reports no preference it follows the clock:
 * dark from 7pm to 7am. Nothing is stored.
 *
 * Keep this in step with the inline script in app/layout.tsx, which runs the
 * same rule before first paint so there is no flash.
 */
export function resolveTheme(now = new Date()): Theme {
  if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    if (window.matchMedia('(prefers-color-scheme: light)').matches) return 'light';
  }
  const h = now.getHours();
  return h >= 19 || h < 7 ? 'dark' : 'light';
}

function apply() {
  document.documentElement.setAttribute('data-theme', resolveTheme());
}

/** Keeps <html data-theme> in step with the device setting and the time. */
export function useSystemTheme() {
  useEffect(() => {
    apply();

    // Follow the device if the setting changes while the page is open.
    const dark = window.matchMedia('(prefers-color-scheme: dark)');
    const light = window.matchMedia('(prefers-color-scheme: light)');
    dark.addEventListener('change', apply);
    light.addEventListener('change', apply);

    // Re-check on the minute so the clock fallback crosses 7am/7pm without a
    // reload, and when the tab comes back after being hidden.
    const timer = window.setInterval(apply, 60_000);
    const onVisible = () => {
      if (document.visibilityState === 'visible') apply();
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      dark.removeEventListener('change', apply);
      light.removeEventListener('change', apply);
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);
}
