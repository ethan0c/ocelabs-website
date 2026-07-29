'use client';

import { useCallback, useEffect, useSyncExternalStore } from 'react';

type Theme = 'dark' | 'light';

/**
 * The theme lives on <html data-theme>, written by the inline script in
 * layout.tsx before first paint. React subscribes to it rather than owning it,
 * which keeps the server render and the pre-paint value in agreement.
 */
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  });
  return () => observer.disconnect();
}

function getSnapshot(): Theme {
  return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
}

export function useTheme() {
  // Matches the server-rendered data-theme on <html>.
  const theme = useSyncExternalStore(subscribe, getSnapshot, () => 'dark' as Theme);

  // Follow the system preference until the visitor picks a theme themselves.
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) {
        document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
      }
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const toggle = useCallback(() => {
    const next: Theme = getSnapshot() === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  }, []);

  return { theme, toggle };
}
