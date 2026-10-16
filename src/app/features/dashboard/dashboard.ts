import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../core/auth/auth.service';
import { NAV_ITEMS } from '../../core/navigation/nav-items';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  template: `
    <h1>Welcome, {{ auth.session()?.username }}</h1>
    <p class="muted">You are signed in as <strong>{{ auth.role() }}</strong>.</p>

    <div class="tiles">
      @for (item of items(); track item.path) {
        <a class="card tile" [routerLink]="item.path">
          <h2>{{ item.label }}</h2>
          <p>{{ item.description }}</p>
        </a>
      }
    </div>
  `,
})
export class Dashboard {
  protected readonly auth = inject(AuthService);
  protected readonly items = computed(() =>
    NAV_ITEMS.filter((item) => this.auth.hasAnyRole(item.roles)),
  );
}
