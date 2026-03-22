import type { EnemyType } from '../core/GameState';

export const HIT_SCORES: Record<EnemyType, number> = {
    red: 5, green: 20, blue: 5, orange: 5,
};

export const SCORE_MULTIPLIER_THRESHOLDS = [
    { fromMs: 210_000, value: 4 },
    { fromMs: 150_000, value: 3 },
    { fromMs:  90_000, value: 2 },
] as const;
