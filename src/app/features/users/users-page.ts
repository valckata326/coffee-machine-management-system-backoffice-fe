import { Component, inject, signal } from '@angular/core';

import { CompanyContextService } from '../../core/company/company-context.service';
import { CompanyRequired } from '../../shared/ui/company-required';
import { UserResult } from './user-result';
import { UserCreate } from './user-create/user-create';
import { UserUpdate } from './user-update/user-update';
import { UserResponse } from './user.models';

@Component({
  selector: 'app-users-page',
  imports: [CompanyRequired, UserCreate, UserUpdate, UserResult],
  template: `
    <h1>Users</h1>
    @if (context.companyId(); as companyId) {
      <p class="muted">
        Company #{{ companyId }}. Role ids refer to the company's roles (managed in the database).
      </p>
      <div class="grid-2">
        <app-user-create [companyId]="companyId" (saved)="lastSaved.set($event)" />
        <app-user-update [companyId]="companyId" (saved)="lastSaved.set($event)" />
      </div>
      @if (lastSaved(); as user) {
        <app-user-result [user]="user" />
      }
    } @else {
      <app-company-required />
    }
  `,
})
export class UsersPage {
  protected readonly context = inject(CompanyContextService);
  protected readonly lastSaved = signal<UserResponse | null>(null);
}
