import type { Admin, AdminFull, Lobby, PlayerResult } from '@/shared/types';

export const MOCK_TOKEN = 'mock-jwt-superadmin';
export const MOCK_TOKEN_ADMIN = 'mock-jwt-admin';

export const mockAdmins: AdminFull[] = [
  {
    id: 1,
    first_name: 'Иван',
    last_name: 'Суперов',
    position: 'Технический директор',
    email: 'super@ddos-guard.net',
    role: 'superadmin',
  },
  {
    id: 2,
    first_name: 'Мария',
    last_name: 'Менеджерова',
    position: 'Event Manager',
    email: 'manager@ddos-guard.net',
    role: 'admin',
  },
  {
    id: 3,
    first_name: 'Алексей',
    last_name: 'Стендов',
    position: 'DevRel',
    email: 'devrel@ddos-guard.net',
    role: 'admin',
  },
];

export const mockCredentials: Record<string, { token: string; adminId: number }> = {
  'super@ddos-guard.net': { token: MOCK_TOKEN, adminId: 1 },
  'manager@ddos-guard.net': { token: MOCK_TOKEN_ADMIN, adminId: 2 },
};

let _lobby: Lobby | null = {
  id: 1,
  name: 'DDoS Ninja: Хакатон 2026',
  game: 'ddos_ninja',
  difficulty: 'medium',
  duration_minutes: 5,
  max_attempts: 1,
  game_over_text: 'Спасибо за участие! Ждите результатов на стенде DDoS-Guard.',
  status: 'active',
  invite_code: 'HACK2026',
  players_count: 12,
  created_at: new Date(Date.now() - 3_600_000).toISOString(),
  closed_at: null,
};

let _nextAdminId = 4;

export const db = {
  getLobby: () => _lobby,
  setLobby: (lobby: Lobby | null) => {
    _lobby = lobby;
  },

  getAdmins: () => mockAdmins,
  addAdmin: (data: Omit<AdminFull, 'id' | 'role'>) => {
    const admin: AdminFull = { ...data, id: _nextAdminId++, role: 'admin' };
    mockAdmins.push(admin);
    return admin;
  },
  removeAdmin: (id: number) => {
    const idx = mockAdmins.findIndex((a) => a.id === id);
    if (idx !== -1) {
      mockAdmins.splice(idx, 1);
    }
  },

  getAdminByToken: (token: string): Admin | null => {
    if (token === MOCK_TOKEN) {
      return mockAdmins[0];
    }
    if (token === MOCK_TOKEN_ADMIN) {
      return mockAdmins[1];
    }
    return null;
  },
};

export const mockResults: PlayerResult[] = [
  {
    rank: 1,
    player_id: 101,
    first_name: 'Артём',
    last_name: 'Быстров',
    phone: '+7 900 111 2233',
    email: 'artem@mail.ru',
    score: 4820,
    duration_seconds: 300,
    status: 'completed',
    played_at: new Date(Date.now() - 1_200_000).toISOString(),
  },
  {
    rank: 2,
    player_id: 102,
    first_name: 'Дарья',
    last_name: 'Кодова',
    phone: '+7 900 222 3344',
    email: 'dasha@gmail.com',
    score: 4150,
    duration_seconds: 298,
    status: 'completed',
    played_at: new Date(Date.now() - 1_000_000).toISOString(),
  },
  {
    rank: 3,
    player_id: 103,
    first_name: 'Михаил',
    last_name: 'Серверов',
    phone: '+7 900 333 4455',
    email: 'misha@yandex.ru',
    score: 3900,
    duration_seconds: 295,
    status: 'completed',
    played_at: new Date(Date.now() - 900_000).toISOString(),
  },
  {
    rank: 4,
    player_id: 104,
    first_name: 'Елена',
    last_name: 'Хакова',
    phone: '+7 900 444 5566',
    email: 'lena@mail.ru',
    score: 3410,
    duration_seconds: 300,
    status: 'suspicious',
    played_at: new Date(Date.now() - 800_000).toISOString(),
  },
  {
    rank: 5,
    player_id: 105,
    first_name: 'Никита',
    last_name: 'Запросов',
    phone: '+7 900 555 6677',
    email: 'nikita@inbox.ru',
    score: 2980,
    duration_seconds: 287,
    status: 'completed',
    played_at: new Date(Date.now() - 700_000).toISOString(),
  },
  {
    rank: 6,
    player_id: 106,
    first_name: 'Анна',
    last_name: 'Пакетова',
    phone: '+7 900 666 7788',
    email: 'anna@gmail.com',
    score: 2560,
    duration_seconds: 301,
    status: 'completed',
    played_at: new Date(Date.now() - 600_000).toISOString(),
  },
  {
    rank: 7,
    player_id: 107,
    first_name: 'Пётр',
    last_name: 'Файрволов',
    phone: '+7 900 777 8899',
    email: 'petr@yandex.ru',
    score: 2100,
    duration_seconds: 260,
    status: 'completed',
    played_at: new Date(Date.now() - 500_000).toISOString(),
  },
];
