import { HttpClient, HttpContext, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, map, Observable, of, tap, throwError } from 'rxjs';

import { API_BASE_URL } from '../config/api.config';
import { SKIP_AUTH_REDIRECT } from '../http/http-context';
import { isRole, Role } from './role';
import { CurrentUserResponse, Session } from './session.model';

const STORAGE_KEY = 'coffeeops.session';

export class InvalidCredentialsError extends Error {
  constructor() {
    super('Invalid username or password');
  }
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  private readonly _session = signal<Session | null>(readStoredSession());

  readonly session = this._session.asReadonly();
  readonly isAuthenticated = computed(() => this._session() !== null);
  readonly role = computed(() => this._session()?.role ?? null);

  hasAnyRole(roles: readonly Role[] | undefined): boolean {
    const role = this.role();
    if (!role) {
      return false;
    }
    return !roles || roles.length === 0 || roles.includes(role);
  }

  /**
   * Validates the credentials against the backend (HTTP Basic, stateless)
   * and resolves the user's authority.
   */
  login(username: string, password: string): Observable<Session> {
    const credentials = encodeBase64(`${username}:${password}`);
    const options = {
      headers: new HttpHeaders({ Authorization: `Basic ${credentials}` }),
      context: new HttpContext().set(SKIP_AUTH_REDIRECT, true),
    };

    return this.http.get<CurrentUserResponse>(`${this.apiBaseUrl}/auth/me`, options).pipe(
      map((me): Session => {
        if (!isRole(me.role)) {
          throw new Error(`Unsupported role: ${me.role}`);
        }
        return {
          username: me.username ?? username,
          role: me.role,
          companyId: me.companyId ?? null,
          userId: me.userId ?? null,
          credentials,
        };
      }),
      catchError((error: unknown) => {
        if (isStatus(error, 401)) {
          return throwError(() => new InvalidCredentialsError());
        }
        // `/auth/me` is not available on the backend yet -> fall back to probing.
        return this.probeRole(options).pipe(
          map((role): Session => ({ username, role, companyId: null, userId: null, credentials })),
        );
      }),
      tap((session) => this.storeSession(session)),
    );
  }

  logout(): void {
    this.storeSession(null);
    void this.router.navigate(['/login']);
  }

  /**
   * Fallback role resolution while the backend has no "current user" endpoint:
   * the consumable catalog is readable by Admin/Manager only, so 200 means a
   * management user and 403 means an Operator. Admin and Manager cannot be told
   * apart this way; the backend currently only ships an in-memory Admin user.
   */
  private probeRole(options: { headers: HttpHeaders; context: HttpContext }): Observable<Role> {
    return this.http.get<unknown>(`${this.apiBaseUrl}/consumables`, options).pipe(
      map(() => Role.Admin as Role),
      catchError((error: unknown) => {
        if (isStatus(error, 403)) {
          return of(Role.Operator as Role);
        }
        if (isStatus(error, 401)) {
          return throwError(() => new InvalidCredentialsError());
        }
        return throwError(() => error);
      }),
    );
  }

  private storeSession(session: Session | null): void {
    this._session.set(session);
    try {
      if (session) {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      } else {
        sessionStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // Storage unavailable (private mode etc.) - session stays in memory only.
    }
  }
}

function readStoredSession(): Session | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as Session;
    return isRole(parsed.role) && parsed.credentials ? parsed : null;
  } catch {
    return null;
  }
}

function isStatus(error: unknown, status: number): boolean {
  return error instanceof HttpErrorResponse && error.status === status;
}

/** UTF-8 safe base64 (plain `btoa` fails on non-Latin1 characters). */
function encodeBase64(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary);
}
