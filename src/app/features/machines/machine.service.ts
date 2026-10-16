import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../../core/config/api.config';
import {
  MachineCreateRequest,
  MachineDetailsResponse,
  MachineResponse,
  MachineUpdateRequest,
} from './machine.models';

@Injectable({ providedIn: 'root' })
export class MachineService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  list(companyId: number, city?: string | null): Observable<MachineResponse[]> {
    let params = new HttpParams();
    if (city?.trim()) {
      params = params.set('city', city.trim());
    }
    return this.http.get<MachineResponse[]>(this.url(companyId), { params });
  }

  get(companyId: number, machineId: number): Observable<MachineDetailsResponse> {
    return this.http.get<MachineDetailsResponse>(`${this.url(companyId)}/${machineId}`);
  }

  create(companyId: number, request: MachineCreateRequest): Observable<MachineResponse> {
    return this.http.post<MachineResponse>(this.url(companyId), request);
  }

  update(companyId: number, machineId: number, request: MachineUpdateRequest): Observable<MachineResponse> {
    return this.http.patch<MachineResponse>(`${this.url(companyId)}/${machineId}`, request);
  }

  /** Soft removal: the machine is deactivated and disappears from the list. */
  remove(companyId: number, machineId: number): Observable<void> {
    return this.http.delete<void>(`${this.url(companyId)}/${machineId}`);
  }

  private url(companyId: number): string {
    return `${this.apiBaseUrl}/companies/${companyId}/machines`;
  }
}
