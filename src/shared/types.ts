export type AdminRole = 'superadmin' | 'admin';
export type LobbyStatus = 'active' | 'closed';
export type GameType = 'ddos-ninja';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type PlayerStatus = 'completed' | 'suspicious';

export interface Admin {
  id: string;
  first_name: string;
  last_name: string;
  role: AdminRole;
}

export interface AdminFull extends Admin {
  position: string;
  email: string;
}

export interface Lobby {
  id: string;
  name: string;
  game: GameType;
  difficulty: Difficulty | null;
  duration_minutes: number;
  max_attempts: number;
  game_over_text: string;
  status: LobbyStatus;
  invite_code: string;
  players_count: number;
  online_players_count: number;
  created_at: string;
  closed_at: string | null;
}

export interface PlayerResult {
  rank: number;
  player_id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  score: number;
  duration_seconds: number;
  status: PlayerStatus;
  played_at: string;
}

export interface ApiError {
  error: string;
  message: string;
}
