import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AuthService, InvalidCredentialsError } from './auth.service';
import { Role } from './role';

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('uses /auth/me when the backend provides it', () => {
    let role: Role | undefined;
    service.login('mia', 'secret').subscribe((s) => (role = s.role));

    const req = http.expectOne('/api/v1/auth/me');
    expect(req.request.headers.get('Authorization')).toBe(`Basic ${btoa('mia:secret')}`);
    req.flush({ username: 'mia', role: 'Manager', companyId: 7, userId: null });

    expect(role).toBe(Role.Manager);
    expect(service.session()?.companyId).toBe(7);
    expect(service.isAuthenticated()).toBe(true);
  });

  it('rejects invalid credentials', () => {
    let error: unknown;
    service.login('admin', 'wrong').subscribe({ error: (e) => (error = e) });

    http.expectOne('/api/v1/auth/me').flush(null, { status: 401, statusText: 'Unauthorized' });

    expect(error).toBeInstanceOf(InvalidCredentialsError);
    expect(service.isAuthenticated()).toBe(false);
  });

  it('falls back to probing: 200 on consumables means Admin', () => {
    service.login('admin', 'admin').subscribe();

    http.expectOne('/api/v1/auth/me').flush(null, { status: 404, statusText: 'Not Found' });
    http.expectOne('/api/v1/consumables').flush([]);

    expect(service.role()).toBe(Role.Admin);
  });

  it('falls back to probing: 403 on consumables means Operator', () => {
    service.login('op', 'op').subscribe();

    http.expectOne('/api/v1/auth/me').flush(null, { status: 404, statusText: 'Not Found' });
    http.expectOne('/api/v1/consumables').flush(null, { status: 403, statusText: 'Forbidden' });

    expect(service.role()).toBe(Role.Operator);
  });

  it('checks roles', () => {
    service.login('op', 'op').subscribe();
    http.expectOne('/api/v1/auth/me').flush({ username: 'op', role: 'Operator', companyId: 1, userId: 3 });

    expect(service.hasAnyRole([Role.Operator])).toBe(true);
    expect(service.hasAnyRole([Role.Admin, Role.Manager])).toBe(false);
    expect(service.hasAnyRole([])).toBe(true);
  });
});
