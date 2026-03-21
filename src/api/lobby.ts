import { api } from '@/shared/axios.config';
import type { Difficulty, GameType, Lobby } from '@/shared/types';

export interface CreateLobbyBody {
  name: string;
  game: GameType;
  difficulty?: Difficulty;
  duration_minutes: number;
  max_attempts: number;
  game_over_text: string;
}

export const getLobby = async (): Promise<Lobby> => {
  const { data } = await api.get<Lobby>('/admin/lobby');
  return data;
};

export const createLobby = async (body: CreateLobbyBody): Promise<Lobby> => {
  const { data } = await api.post<Lobby>('/admin/lobby', body);
  return data;
};
