import { HttpContextToken } from '@angular/common/http';

/** When set, a 401 response does not end the session (used by the login request itself). */
export const SKIP_AUTH_REDIRECT = new HttpContextToken<boolean>(() => false);
