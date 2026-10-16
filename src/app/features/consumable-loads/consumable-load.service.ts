import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../../core/config/api.config';
import {
  ConsumableLoadCreateRequest,
  ConsumableLoadResponse,
  ConsumableLoadUpdateRequest,
} from './consumable-load.models';

@Injectable({ providedIn: 'root' })
export class ConsumableLoadService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  create(
    companyId: number,
    machineId: number,
    request: ConsumableLoadCreateRequest,
  ): Observable<ConsumableLoadResponse> {
    return this.http.post<ConsumableLoadResponse>(this.url(companyId, machineId), request);
  }

  update(
    companyId: number,
    machineId: number,
    consumableLoadId: number,
    request: ConsumableLoadUpdateRequest,
  ): Observable<ConsumableLoadResponse> {
    return this.http.patch<ConsumableLoadResponse>(
      `${this.url(companyId, machineId)}/${consumableLoadId}`,
      request,
    );
  }

  private url(companyId: number, machineId: number): string {
    return `${this.apiBaseUrl}/companies/${companyId}/machines/${machineId}/consumable-loads`;
  }
}
