import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { API_BASE_URL } from '../config/api.config';
import { AuthService } from './auth.service';

/**
 * Attaches HTTP Basic credentials to backend calls.
 * `X-Requested-With` makes Spring Security answer 401 without a `WWW-Authenticate`
 * challenge, so the browser does not show its native login popup.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(inject(API_BASE_URL))) {
    return next(req);
  }

  const session = inject(AuthService).session();
  let headers = req.headers.set('X-Requested-With', 'XMLHttpRequest');
  if (session && !headers.has('Authorization')) {
    headers = headers.set('Authorization', `Basic ${session.credentials}`);
  }
  return next(req.clone({ headers }));
};
