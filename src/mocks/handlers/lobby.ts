import { http, HttpResponse } from 'msw';

import type { Lobby } from '@/shared/types';

import { db, mockResults } from '../db';

const BASE = 'http://localhost:8080/api/admin/lobby';

export const lobbyHandlers = [
  http.get(BASE, () => {
    const lobby = db.getLobby();
    if (!lobby) {
      return HttpResponse.json(
        { error: 'Not Found', message: 'Нет активного лобби' },
        { status: 404 },
      );
    }
    return HttpResponse.json(lobby);
  }),

  http.post(BASE, async ({ request }) => {
    if (db.getLobby()) {
      return HttpResponse.json(
        { error: 'Conflict', message: 'Активное лобби уже существует' },
        { status: 409 },
      );
    }
    const body = (await request.json()) as Partial<Lobby>;
    const lobby: Lobby = {
      id: Date.now(),
      name: body.name ?? 'Новое лобби',
      game: body.game ?? 'ddos_ninja',
      difficulty: body.difficulty ?? null,
      duration_minutes: body.duration_minutes ?? 5,
      max_attempts: body.max_attempts ?? 1,
      game_over_text: body.game_over_text ?? '',
      status: 'active',
      invite_code: Math.random().toString(36).slice(2, 10).toUpperCase(),
      players_count: 0,
      created_at: new Date().toISOString(),
      closed_at: null,
    };
    db.setLobby(lobby);
    return HttpResponse.json(lobby, { status: 201 });
  }),

  http.delete(BASE, () => {
    db.setLobby(null);
    return HttpResponse.json({ success: true });
  }),

  http.patch(`${BASE}/toggle`, () => {
    const lobby = db.getLobby();
    if (!lobby) {
      return HttpResponse.json({ error: 'Not Found', message: 'Нет лобби' }, { status: 404 });
    }
    lobby.status = lobby.status === 'active' ? 'closed' : 'active';
    if (lobby.status === 'closed') {
      lobby.closed_at = new Date().toISOString();
    }
    return HttpResponse.json({ id: lobby.id, status: lobby.status });
  }),

  http.get(
    `${BASE}/qr`,
    () =>
      new HttpResponse(null, {
        status: 200,
        headers: { 'Content-Type': 'image/png' },
      }),
  ),

  http.get(`${BASE}/results`, ({ request }) => {
    const url = new URL(request.url);
    const search = url.searchParams.get('search')?.toLowerCase() ?? '';
    const sortBy = url.searchParams.get('sort_by') ?? 'score';
    const order = url.searchParams.get('order') ?? 'desc';

    let results = [...mockResults];

    if (search) {
      results = results.filter(
        (r) =>
          r.first_name.toLowerCase().includes(search) || r.last_name.toLowerCase().includes(search),
      );
    }

    results.sort((a, b) => {
      const key = sortBy as keyof typeof a;
      const av = a[key] as number | string;
      const bv = b[key] as number | string;
      if (av < bv) {
        return order === 'asc' ? -1 : 1;
      }
      if (av > bv) {
        return order === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return HttpResponse.json({ results, total: results.length });
  }),

  http.get(`${BASE}/results/export`, () => {
    const header = 'Место,Фамилия,Имя,Телефон,Email,Очки,Время (сек),Статус\n';
    const rows = mockResults
      .map(
        (r) =>
          `${r.rank},${r.last_name},${r.first_name},${r.phone},${r.email},${r.score},${r.duration_seconds},${r.status}`,
      )
      .join('\n');
    return new HttpResponse(header + rows, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="results.csv"',
      },
    });
  }),

  http.get(`${BASE}/random`, () => {
    const completed = mockResults.filter((r) => r.status === 'completed');
    const winner = completed[Math.floor(Math.random() * completed.length)];
    return HttpResponse.json({
      player_id: winner.player_id,
      first_name: winner.first_name,
      last_name: winner.last_name,
      score: winner.score,
    });
  }),
];
