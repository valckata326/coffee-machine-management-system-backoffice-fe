import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthService } from '../../core/auth/auth.service';
import { CompanyContextService } from '../../core/company/company-context.service';
import { NAV_ITEMS } from '../../core/navigation/nav-items';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './shell.html',
})
export class Shell {
  protected readonly auth = inject(AuthService);
  protected readonly company = inject(CompanyContextService);

  protected readonly navItems = computed(() =>
    NAV_ITEMS.filter((item) => this.auth.hasAnyRole(item.roles)),
  );

  protected onCompanyChange(value: string): void {
    const id = Number(value);
    this.company.select(Number.isInteger(id) && id > 0 ? id : null);
  }
}
