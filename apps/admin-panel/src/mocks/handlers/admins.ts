import { http, HttpResponse } from 'msw';

import type { AdminFull } from '@/shared/types';

import { db } from '../db';

const BASE = 'http://localhost:8080/api/admin/admins';

export const adminsHandlers = [
  http.get(BASE, () => HttpResponse.json({ admins: db.getAdmins() })),

  http.post(BASE, async ({ request }) => {
    const body = (await request.json()) as Omit<AdminFull, 'id' | 'role'>;
    const admin = db.addAdmin(body);
    return HttpResponse.json(admin, { status: 201 });
  }),

  http.delete(`${BASE}/:id`, ({ params }) => {
    const id = Number(params.id);
    const admins = db.getAdmins();
    const target = admins.find((a) => a.id === id);

    if (!target) {
      return HttpResponse.json({ error: 'Not Found', message: 'Админ не найден' }, { status: 404 });
    }
    if (target.role === 'superadmin') {
      return HttpResponse.json(
        { error: 'Forbidden', message: 'Нельзя удалить суперадмина' },
        { status: 403 },
      );
    }

    db.removeAdmin(id);
    return HttpResponse.json({ success: true });
  }),
];
