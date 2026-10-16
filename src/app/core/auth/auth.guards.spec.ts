import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, provideRouter, Router, RouterStateSnapshot, UrlTree } from '@angular/router';

import { authGuard, roleGuard } from './auth.guards';
import { AuthService } from './auth.service';
import { Role } from './role';

describe('auth guards', () => {
  const role = signal<Role | null>(null);
  const authStub = {
    isAuthenticated: () => role() !== null,
    hasAnyRole: (roles?: readonly Role[]) => !!role() && (!roles?.length || roles.includes(role()!)),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AuthService, useValue: authStub }],
    });
  });

  const run = (guard: typeof authGuard, data: Record<string, unknown> = {}) =>
    TestBed.runInInjectionContext(() =>
      guard({ data } as unknown as ActivatedRouteSnapshot, { url: '/machines' } as RouterStateSnapshot),
    );

  it('authGuard redirects anonymous users to login', () => {
    role.set(null);
    const result = run(authGuard) as UrlTree;
    expect(TestBed.inject(Router).serializeUrl(result)).toBe('/login?returnUrl=%2Fmachines');
  });

  it('roleGuard allows matching roles and blocks others', () => {
    role.set(Role.Manager);
    expect(run(roleGuard, { roles: [Role.Admin, Role.Manager] })).toBe(true);

    const blocked = run(roleGuard, { roles: [Role.Operator] }) as UrlTree;
    expect(TestBed.inject(Router).serializeUrl(blocked)).toBe('/forbidden');
  });
});
