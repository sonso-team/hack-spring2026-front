import type { PlayerResult } from '@/shared/types';

export const fmtTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

export const avgDuration = (results: PlayerResult[]): string => {
  if (!results.length) {
    return '—';
  }
  const avg = results.reduce((sum, r) => sum + r.duration_seconds, 0) / results.length;
  return fmtTime(Math.round(avg));
};
