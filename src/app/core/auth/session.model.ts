import { Role } from './role';

/** The authenticated user as known by the backoffice. */
export interface Session {
  username: string;
  role: Role;
  /** Company the user belongs to. `null` for Admins (they work across companies). */
  companyId: number | null;
  /** Backend user id (set for Operators). */
  userId: number | null;
  /** Base64 encoded `username:password` used for HTTP Basic auth. */
  credentials: string;
}

/**
 * Shape expected from `GET /auth/me` once the backend exposes it.
 * Until then the role is resolved by probing protected endpoints (see AuthService).
 */
export interface CurrentUserResponse {
  username: string;
  role: string;
  companyId: number | null;
  userId: number | null;
}
