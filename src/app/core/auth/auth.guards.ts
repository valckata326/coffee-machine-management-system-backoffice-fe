import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from './auth.service';
import { Role } from './role';

/** Route data key holding the roles allowed to open a route. */
export const ROLES_DATA_KEY = 'roles';

/** Only authenticated users may pass; others are sent to the login page. */
export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  if (auth.isAuthenticated()) {
    return true;
  }
  return inject(Router).createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};

/** Keeps logged-in users away from the login page. */
export const guestGuard: CanActivateFn = () => {
  return inject(AuthService).isAuthenticated() ? inject(Router).createUrlTree(['/']) : true;
};

/**
 * Checks `route.data.roles` against the current user's role.
 * Usage: `{ path: 'x', canActivate: [roleGuard], data: { roles: [Role.Admin] } }`
 */
export const roleGuard: CanActivateFn = (route) => {
  const roles = route.data[ROLES_DATA_KEY] as readonly Role[] | undefined;
  if (inject(AuthService).hasAnyRole(roles)) {
    return true;
  }
  return inject(Router).createUrlTree(['/forbidden']);
};
