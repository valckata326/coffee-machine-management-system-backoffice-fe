import { HttpErrorResponse } from '@angular/common/http';

const STATUS_MESSAGES: Record<number, string> = {
  0: 'Cannot reach the server. Is the backend running?',
  400: 'The request is invalid. Please check the entered values.',
  401: 'Your session has expired. Please log in again.',
  403: 'You are not allowed to perform this action.',
  404: 'The requested resource was not found.',
  409: 'The operation conflicts with existing data.',
};

/** Turns any error into a short, user friendly message. */
export function toErrorMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    const body = error.error as { message?: unknown } | null;
    if (body && typeof body.message === 'string' && body.message.trim()) {
      return body.message;
    }
    return STATUS_MESSAGES[error.status] ?? `Unexpected server error (${error.status}).`;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Something went wrong.';
}
