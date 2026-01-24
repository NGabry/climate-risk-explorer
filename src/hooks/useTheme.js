import { useMemo } from 'react';

/**
 * Hook that provides theme colors for D3 components.
 * Uses the dusty blue Weather-style theme.
 */
export function useTheme() {
  return useMemo(() => ({
    text: {
      primary: 'rgba(255,255,255,0.95)',
      secondary: 'rgba(255,255,255,0.75)',
      muted: 'rgba(255,255,255,0.55)',
      subtle: 'rgba(255,255,255,0.4)',
    },
    grid: 'rgba(255,255,255,0.15)',
    axis: 'rgba(255,255,255,0.6)',
    tooltip: {
      bg: 'rgba(40,50,60,0.85)',
      text: 'rgba(255,255,255,0.95)',
      textMuted: 'rgba(255,255,255,0.7)',
    },
    stroke: 'rgba(255,255,255,0.9)',
    pointStroke: 'rgba(255,255,255,0.9)',
  }), []);
}
