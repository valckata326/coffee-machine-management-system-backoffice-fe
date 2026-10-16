import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../../core/config/api.config';
import {
  ConsumableCreateRequest,
  ConsumableResponse,
  ConsumableUpdateRequest,
} from './consumable.models';

@Injectable({ providedIn: 'root' })
export class ConsumableService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${inject(API_BASE_URL)}/consumables`;

  /** Active consumables, ordered by name. */
  list(): Observable<ConsumableResponse[]> {
    return this.http.get<ConsumableResponse[]>(this.baseUrl);
  }

  get(consumableId: number): Observable<ConsumableResponse> {
    return this.http.get<ConsumableResponse>(`${this.baseUrl}/${consumableId}`);
  }

  create(request: ConsumableCreateRequest): Observable<ConsumableResponse> {
    return this.http.post<ConsumableResponse>(this.baseUrl, request);
  }

  update(consumableId: number, request: ConsumableUpdateRequest): Observable<ConsumableResponse> {
    return this.http.patch<ConsumableResponse>(`${this.baseUrl}/${consumableId}`, request);
  }

  /** Soft removal: the consumable is deactivated and disappears from the catalog. */
  remove(consumableId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${consumableId}`);
  }
}
