import { Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';

import { CompanyContextService } from '../../../core/company/company-context.service';
import { toErrorMessage } from '../../../core/http/api-error';
import { CompanyRequired } from '../../../shared/ui/company-required';
import { MachineDetailsResponse, MachineResponse, MachineUpdateRequest } from '../machine.models';
import { MachineService } from '../machine.service';

/** Create (`/machines/new`) and edit (`/machines/:machineId/edit`) form. */
@Component({
  selector: 'app-machine-form',
  imports: [ReactiveFormsModule, RouterLink, CompanyRequired],
  templateUrl: './machine-form.html',
})
export class MachineForm {
  private readonly machinesApi = inject(MachineService);
  private readonly router = inject(Router);
  protected readonly context = inject(CompanyContextService);

  /** Bound from the `:machineId` route param; absent in create mode. */
  readonly machineId = input<string>();
  protected readonly isEdit = computed(() => !!this.machineId());

  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);
  private original: MachineDetailsResponse | null = null;

  protected readonly form = inject(NonNullableFormBuilder).group({
    locationId: [null as number | null, [Validators.required, Validators.min(1)]],
    serialNumber: ['', [Validators.required, Validators.maxLength(100)]],
    model: ['', Validators.maxLength(100)],
  });

  constructor() {
    effect(() => {
      const companyId = this.context.companyId();
      const machineId = Number(this.machineId());
      if (!companyId || !machineId) {
        return;
      }
      untracked(() =>
        this.machinesApi.get(companyId, machineId).subscribe({
          next: (machine) => {
            this.original = machine;
            this.form.reset({
              locationId: machine.locationId,
              serialNumber: machine.serialNumber,
              model: machine.model ?? '',
            });
          },
          error: (err: unknown) => this.error.set(toErrorMessage(err)),
        }),
      );
    });
  }

  protected submit(): void {
    const companyId = this.context.companyId();
    if (!companyId) {
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const serialNumber = value.serialNumber.trim();
    const model = value.model.trim();
    let request$: Observable<MachineResponse>;

    if (this.isEdit()) {
      const changes = this.changedFields(value.locationId!, serialNumber, model);
      if (Object.keys(changes).length === 0) {
        this.error.set('Nothing to update.');
        return;
      }
      request$ = this.machinesApi.update(companyId, this.original!.id, changes);
    } else {
      request$ = this.machinesApi.create(companyId, {
        locationId: value.locationId!,
        serialNumber,
        model: model || null,
      });
    }

    this.saving.set(true);
    this.error.set(null);
    request$.subscribe({
      next: (machine) => void this.router.navigate(['/machines', machine.id]),
      error: (err: unknown) => {
        this.error.set(toErrorMessage(err));
        this.saving.set(false);
      },
    });
  }

  /** PATCH semantics: only send what actually changed. */
  private changedFields(locationId: number, serialNumber: string, model: string): MachineUpdateRequest {
    const changes: MachineUpdateRequest = {};
    if (locationId !== this.original?.locationId) {
      changes.locationId = locationId;
    }
    if (serialNumber !== this.original?.serialNumber) {
      changes.serialNumber = serialNumber;
    }
    if (model !== (this.original?.model ?? '')) {
      changes.model = model;
    }
    return changes;
  }
}
