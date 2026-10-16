import { InjectionToken } from '@angular/core';

/**
 * Base URL of the CoffeeOps backend REST API.
 * In development requests go through the Angular dev-server proxy (see proxy.conf.json),
 * so a relative path avoids CORS. Override this token to point at another host.
 */
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {
  providedIn: 'root',
  factory: () => '/api/v1',
});
