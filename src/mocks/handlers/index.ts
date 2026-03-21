import { adminsHandlers } from './admins';
import { authHandlers } from './auth';
import { lobbyHandlers } from './lobby';

export const handlers = [...authHandlers, ...lobbyHandlers, ...adminsHandlers];
