import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../../core/config/api.config';
import { CompanyCreateRequest, CompanyResponse } from './company.models';

@Injectable({ providedIn: 'root' })
export class CompanyService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${inject(API_BASE_URL)}/companies`;

  register(request: CompanyCreateRequest): Observable<CompanyResponse> {
    return this.http.post<CompanyResponse>(this.baseUrl, request);
  }
}
