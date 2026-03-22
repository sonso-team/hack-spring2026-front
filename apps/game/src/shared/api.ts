import axios from 'axios';

const api = axios.create({ baseURL: 'http://127.0.0.1:8080/api' });

export interface RegisterPayload {
    first_name: string;
    last_name: string;
    phone: string;
    email: string;
    invite_code: string;
}

export interface RegisterResponse {
    player_id: string;
    registered: boolean;
    can_play: boolean;
    attempts_left: number;
}

export interface StartResponse {
    session_token: string;
    difficulty: string;
    duration_seconds: number;
}

export const registerPlayer = (payload: RegisterPayload) =>
    api.post<RegisterResponse>('/play/register', payload).then((r: { data: RegisterResponse }) => r.data);

export const startGame = (player_id: string) =>
    api.post<StartResponse>('/play/game/start', { player_id }).then((r: { data: StartResponse }) => r.data);

export const finishGame = (session_token: string, final_score: number) =>
    api.post('/play/game/finish', { session_token, final_score, snapshots: [] });
