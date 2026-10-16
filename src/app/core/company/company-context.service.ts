import { computed, inject, Injectable, signal } from '@angular/core';

import { AuthService } from '../auth/auth.service';

const STORAGE_KEY = 'coffeeops.activeCompanyId';

/**
 * Holds the company the user currently works in.
 * Managers/Operators are bound to their own company; Admins pick one
 * (the backend has no company listing endpoint yet, so it is entered by id).
 */
@Injectable({ providedIn: 'root' })
export class CompanyContextService {
  private readonly auth = inject(AuthService);
  private readonly selectedCompanyId = signal<number | null>(readStoredCompanyId());

  /** Effective company id used by company-scoped API calls. */
  readonly companyId = computed(() => this.auth.session()?.companyId ?? this.selectedCompanyId());

  /** Whether the user may switch between companies. */
  readonly canSwitch = computed(() => this.auth.session()?.companyId == null);

  select(companyId: number | null): void {
    this.selectedCompanyId.set(companyId);
    try {
      if (companyId == null) {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        localStorage.setItem(STORAGE_KEY, String(companyId));
      }
    } catch {
      // Storage unavailable - keep in memory only.
    }
  }
}

function readStoredCompanyId(): number | null {
  try {
    const value = Number(localStorage.getItem(STORAGE_KEY));
    return Number.isInteger(value) && value > 0 ? value : null;
  } catch {
    return null;
  }
}
