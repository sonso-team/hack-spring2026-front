import { http, HttpResponse } from 'msw';

import type { Lobby } from '@/shared/types';

import { db, mockResults } from '../db';

const BASE = 'http://localhost:8080/api/admin/lobby';

const makeFakeQrSvg = (inviteCode: string): string => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
  <rect width="200" height="200" fill="white" rx="4"/>
  <!-- Top-left finder pattern -->
  <rect x="10" y="10" width="55" height="55" fill="none" stroke="#000" stroke-width="4"/>
  <rect x="22" y="22" width="31" height="31" fill="#000"/>
  <!-- Top-right finder pattern -->
  <rect x="135" y="10" width="55" height="55" fill="none" stroke="#000" stroke-width="4"/>
  <rect x="147" y="22" width="31" height="31" fill="#000"/>
  <!-- Bottom-left finder pattern -->
  <rect x="10" y="135" width="55" height="55" fill="none" stroke="#000" stroke-width="4"/>
  <rect x="22" y="147" width="31" height="31" fill="#000"/>
  <!-- Data dots (static placeholder pattern) -->
  <rect x="75" y="10" width="9" height="9" fill="#000"/>
  <rect x="94" y="10" width="9" height="9" fill="#000"/>
  <rect x="113" y="10" width="9" height="9" fill="#000"/>
  <rect x="75" y="29" width="9" height="9" fill="#000"/>
  <rect x="113" y="29" width="9" height="9" fill="#000"/>
  <rect x="94" y="48" width="9" height="9" fill="#000"/>
  <rect x="75" y="75" width="9" height="9" fill="#000"/>
  <rect x="94" y="75" width="9" height="9" fill="#000"/>
  <rect x="113" y="75" width="9" height="9" fill="#000"/>
  <rect x="75" y="94" width="9" height="9" fill="#000"/>
  <rect x="94" y="94" width="9" height="9" fill="#000"/>
  <rect x="113" y="94" width="9" height="9" fill="#000"/>
  <rect x="75" y="113" width="9" height="9" fill="#000"/>
  <rect x="113" y="113" width="9" height="9" fill="#000"/>
  <rect x="135" y="75" width="9" height="9" fill="#000"/>
  <rect x="154" y="75" width="9" height="9" fill="#000"/>
  <rect x="173" y="75" width="9" height="9" fill="#000"/>
  <rect x="135" y="94" width="9" height="9" fill="#000"/>
  <rect x="173" y="94" width="9" height="9" fill="#000"/>
  <rect x="154" y="113" width="9" height="9" fill="#000"/>
  <rect x="135" y="135" width="9" height="9" fill="#000"/>
  <rect x="154" y="135" width="9" height="9" fill="#000"/>
  <rect x="135" y="154" width="9" height="9" fill="#000"/>
  <rect x="154" y="173" width="9" height="9" fill="#000"/>
  <rect x="173" y="154" width="9" height="9" fill="#000"/>
  <!-- Invite code label -->
  <text x="100" y="192" text-anchor="middle" font-size="11" font-family="monospace" font-weight="bold" fill="#333">${inviteCode}</text>
</svg>`;

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
    if (db.getLobby()?.status === 'active') {
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
      duration_minutes: body.duration_minutes ?? 60,
      max_attempts: body.max_attempts ?? 1,
      game_over_text: body.game_over_text ?? '',
      status: 'active',
      invite_code: Math.random().toString(36).slice(2, 8).toUpperCase(),
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
    } else {
      lobby.closed_at = null;
    }
    return HttpResponse.json({ id: lobby.id, status: lobby.status });
  }),

  http.get(`${BASE}/link`, () => {
    const lobby = db.getLobby();
    if (!lobby) {
      return HttpResponse.json({ error: 'Not Found', message: 'Нет лобби' }, { status: 404 });
    }
    return HttpResponse.json({ url: `http://localhost:5174/play?code=${lobby.invite_code}` });
  }),

  http.get(`${BASE}/online`, () => {
    const lobby = db.getLobby();
    if (!lobby) {
      return HttpResponse.json({ online: 0 });
    }
    // Simulate fluctuating online count
    const online = Math.floor(Math.random() * 8) + 1;
    return HttpResponse.json({ online });
  }),

  http.get(`${BASE}/qr`, () => {
    const lobby = db.getLobby();
    if (!lobby) {
      return HttpResponse.json({ error: 'Not Found', message: 'Нет лобби' }, { status: 404 });
    }
    const svg = makeFakeQrSvg(lobby.invite_code);
    return new HttpResponse(svg, {
      status: 200,
      headers: { 'Content-Type': 'image/svg+xml' },
    });
  }),

  http.get(`${BASE}/results`, ({ request }) => {
    const url = new URL(request.url);
    const search = url.searchParams.get('search')?.toLowerCase() ?? '';
    const sortBy = url.searchParams.get('sort_by') ?? 'score';
    const order = url.searchParams.get('order') ?? 'desc';
    const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1'));
    const limit = Math.max(1, parseInt(url.searchParams.get('limit') ?? '20'));

    let results = [...mockResults];

    if (search) {
      results = results.filter((r) =>
        [r.first_name, r.last_name, r.phone, r.email, String(r.score), String(r.rank)].some(
          (field) => field.toLowerCase().includes(search),
        ),
      );
    }

    results.sort((a, b) => {
      const key = sortBy === 'duration' ? 'duration_seconds' : (sortBy as keyof typeof a);
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

    const total = results.length;
    const offset = (page - 1) * limit;
    results = results.slice(offset, offset + limit);

    return HttpResponse.json({ results, total });
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
