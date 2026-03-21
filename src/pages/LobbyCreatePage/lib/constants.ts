import type { Difficulty, GameType } from '@/shared/types';

export const GAMES: { value: GameType; label: string; hasDifficulty: boolean }[] = [
  { value: 'ddos_ninja', label: 'Server Defenders', hasDifficulty: false },
];

export const DIFFICULTIES: { value: Difficulty; label: string }[] = [
  { value: 'easy', label: 'Лёгкий' },
  { value: 'medium', label: 'Средний' },
  { value: 'hard', label: 'Сложный' },
];
