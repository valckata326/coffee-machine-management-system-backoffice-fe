import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../../core/config/api.config';
import { UserCreateRequest, UserResponse, UserUpdateRequest } from './user.models';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  create(companyId: number, request: UserCreateRequest): Observable<UserResponse> {
    return this.http.post<UserResponse>(this.url(companyId), request);
  }

  update(companyId: number, userId: number, request: UserUpdateRequest): Observable<UserResponse> {
    return this.http.patch<UserResponse>(`${this.url(companyId)}/${userId}`, request);
  }

  private url(companyId: number): string {
    return `${this.apiBaseUrl}/companies/${companyId}/users`;
  }
}
