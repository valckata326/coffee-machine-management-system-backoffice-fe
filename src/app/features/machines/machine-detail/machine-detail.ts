import { Component, effect, inject, input, numberAttribute, signal, untracked } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { CompanyContextService } from '../../../core/company/company-context.service';
import { toErrorMessage } from '../../../core/http/api-error';
import { CompanyRequired } from '../../../shared/ui/company-required';
import { MachineDetailsResponse } from '../machine.models';
import { MachineService } from '../machine.service';

@Component({
  selector: 'app-machine-detail',
  imports: [RouterLink, CompanyRequired],
  templateUrl: './machine-detail.html',
})
export class MachineDetail {
  private readonly machinesApi = inject(MachineService);
  private readonly router = inject(Router);
  protected readonly context = inject(CompanyContextService);

  /** Bound from the `:machineId` route param. */
  readonly machineId = input.required({ transform: numberAttribute });

  protected readonly machine = signal<MachineDetailsResponse | null>(null);
  protected readonly error = signal<string | null>(null);

  constructor() {
    effect(() => {
      const companyId = this.context.companyId();
      const machineId = this.machineId();
      untracked(() => {
        this.machine.set(null);
        this.error.set(null);
        if (!companyId) {
          return;
        }
        this.machinesApi.get(companyId, machineId).subscribe({
          next: (machine) => this.machine.set(machine),
          error: (err: unknown) => this.error.set(toErrorMessage(err)),
        });
      });
    });
  }

  protected remove(machine: MachineDetailsResponse): void {
    if (!confirm(`Remove machine ${machine.serialNumber} from the catalog?`)) {
      return;
    }
    this.machinesApi.remove(machine.companyId, machine.id).subscribe({
      next: () => void this.router.navigate(['/machines']),
      error: (err: unknown) => this.error.set(toErrorMessage(err)),
    });
  }
}
