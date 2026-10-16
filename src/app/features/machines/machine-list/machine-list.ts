import { Component, effect, inject, signal, untracked } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { CompanyContextService } from '../../../core/company/company-context.service';
import { toErrorMessage } from '../../../core/http/api-error';
import { CompanyRequired } from '../../../shared/ui/company-required';
import { MachineResponse } from '../machine.models';
import { MachineService } from '../machine.service';

@Component({
  selector: 'app-machine-list',
  imports: [ReactiveFormsModule, RouterLink, CompanyRequired],
  templateUrl: './machine-list.html',
})
export class MachineList {
  private readonly machinesApi = inject(MachineService);
  protected readonly context = inject(CompanyContextService);

  protected readonly city = new FormControl('', { nonNullable: true });
  protected readonly machines = signal<MachineResponse[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  constructor() {
    // Reload whenever the active company changes.
    effect(() => {
      const companyId = this.context.companyId();
      untracked(() => (companyId ? this.load() : this.machines.set([])));
    });
  }

  protected load(): void {
    const companyId = this.context.companyId();
    if (!companyId) {
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    this.machinesApi.list(companyId, this.city.value).subscribe({
      next: (machines) => {
        this.machines.set(machines);
        this.loading.set(false);
      },
      error: (err: unknown) => {
        this.machines.set([]);
        this.error.set(toErrorMessage(err));
        this.loading.set(false);
      },
    });
  }

  protected clearFilter(): void {
    this.city.setValue('');
    this.load();
  }

  protected remove(machine: MachineResponse): void {
    const companyId = this.context.companyId();
    if (!companyId || !confirm(`Remove machine ${machine.serialNumber} from the catalog?`)) {
      return;
    }
    this.machinesApi.remove(companyId, machine.id).subscribe({
      next: () => this.machines.update((list) => list.filter((m) => m.id !== machine.id)),
      error: (err: unknown) => this.error.set(toErrorMessage(err)),
    });
  }
}
