import { isAxiosError } from 'axios';

import { api } from '@/shared/axios.config';
import type { Difficulty, GameType, Lobby, PlayerResult } from '@/shared/types';

export interface CreateLobbyBody {
  name: string;
  game: GameType;
  difficulty: Difficulty;
  duration_minutes: number;
  max_attempts: number;
  game_over_text: string;
}

export interface ResultsParams {
  search?: string;
  sort_by?: 'score' | 'duration' | 'created_at';
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface ResultsResponse {
  results: PlayerResult[];
  total: number;
}

export const getLobby = async (): Promise<Lobby | null> => {
  try {
    const { data } = await api.get<Lobby>('/admin/lobby');
    return data;
  } catch (err) {
    if (isAxiosError(err) && err.response?.status === 404) {
      return null;
    }
    throw err;
  }
};

export const createLobby = async (body: CreateLobbyBody): Promise<Lobby> => {
  const { data } = await api.post<Lobby>('/admin/lobby', body);
  return data;
};

export const toggleLobby = async (): Promise<Lobby> => {
  const { data } = await api.patch<Lobby>('/admin/lobby/toggle');
  return data;
};

export const getLobbyResults = async (params?: ResultsParams): Promise<ResultsResponse> => {
  const { data } = await api.get<PlayerResult[]>('/admin/lobby/results', {
    params: { search: params?.search, sort_by: params?.sort_by, order: params?.order },
  });
  const total = data.length;
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 20;
  const offset = (page - 1) * limit;
  return { results: data.slice(offset, offset + limit), total };
};

export const exportResults = async (): Promise<void> => {
  const response = await api.get('/admin/lobby/results/export', { responseType: 'blob' });
  const url = URL.createObjectURL(response.data);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'results.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const getRandomWinner = async (): Promise<{
  player_id: string;
  first_name: string;
  last_name: string;
  score: number;
}> => {
  const { data } = await api.get('/admin/lobby/random');
  return data;
};
