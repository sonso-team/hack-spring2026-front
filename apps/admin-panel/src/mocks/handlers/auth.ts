import { http, HttpResponse } from 'msw';

import { db, mockCredentials } from '../db';

export const authHandlers = [
  http.post('http://localhost:8080/api/auth/login', async ({ request }) => {
    const { email, password } = (await request.json()) as { email: string; password: string };

    const cred = mockCredentials[email];
    if (!cred || password !== 'admin123') {
      return HttpResponse.json(
        { error: 'Unauthorized', message: 'Неверный email или пароль' },
        { status: 401 },
      );
    }

    const admin = db.getAdminByToken(cred.token);
    return HttpResponse.json({ token: cred.token, admin });
  }),
];
