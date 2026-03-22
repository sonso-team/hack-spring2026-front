import { create } from 'zustand';
import type { RegisterResponse, StartResponse } from '../shared/api';

interface GameStore {
    user: RegisterResponse | null;
    session: StartResponse | null;
    setUser: (user: RegisterResponse) => void;
    setSession: (session: StartResponse) => void;
}

export const useGameStore = create<GameStore>((set) => ({
    user: null,
    session: null,
    setUser: (user) => set({ user }),
    setSession: (session) => set({ session }),
}));
