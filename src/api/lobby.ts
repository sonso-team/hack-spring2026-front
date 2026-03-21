import axios from 'axios';

import { api } from '@/shared/axios.config';
import type { Difficulty, GameType, Lobby, LobbyStatus, PlayerResult } from '@/shared/types';

export interface CreateLobbyBody {
  name: string;
  game: GameType;
  difficulty?: Difficulty;
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
    if (axios.isAxiosError(err) && err.response?.status === 404) {
      return null;
    }
    throw err;
  }
};

export const createLobby = async (body: CreateLobbyBody): Promise<Lobby> => {
  const { data } = await api.post<Lobby>('/admin/lobby', body);
  return data;
};

export const toggleLobby = async (): Promise<{ id: number; status: LobbyStatus }> => {
  const { data } = await api.patch<{ id: number; status: LobbyStatus }>('/admin/lobby/toggle');
  return data;
};

export const getLobbyLink = async (): Promise<{ url: string }> => {
  const { data } = await api.get<{ url: string }>('/admin/lobby/link');
  return data;
};

export const getOnlinePlayers = async (): Promise<{ online: number }> => {
  const { data } = await api.get<{ online: number }>('/admin/lobby/online');
  return data;
};

export const getLobbyResults = async (params?: ResultsParams): Promise<ResultsResponse> => {
  const { data } = await api.get<ResultsResponse>('/admin/lobby/results', { params });
  return data;
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
  player_id: number;
  first_name: string;
  last_name: string;
  score: number;
}> => {
  const { data } = await api.get('/admin/lobby/random');
  return data;
};
