import { useState, useEffect, useMemo } from 'react';

/**
 * Hook that provides theme-aware colors for D3 components.
 * Listens to system dark/light mode preference and returns
 * computed color values for text, grids, tooltips, etc.
 */
export function useTheme() {
  const [isDark, setIsDark] = useState(() =>
    window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? true
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => setIsDark(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return useMemo(() => ({
    isDark,
    text: {
      primary: isDark ? 'white' : '#333',
      secondary: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)',
      muted: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
      subtle: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)',
    },
    grid: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)',
    axis: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.5)',
    tooltip: {
      bg: isDark ? 'rgba(0,0,0,0.9)' : 'rgba(40,40,60,0.95)',
      text: 'white',
      textMuted: 'rgba(255,255,255,0.8)',
    },
    stroke: isDark ? 'white' : '#333',
    pointStroke: isDark ? 'white' : '#f5f5f5',
  }), [isDark]);
}
