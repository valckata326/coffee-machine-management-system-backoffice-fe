import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Observable } from 'rxjs';

import { CompanyContextService } from '../../../core/company/company-context.service';
import { toErrorMessage } from '../../../core/http/api-error';
import { CompanyRequired } from '../../../shared/ui/company-required';
import {
  ConsumableLoadItemRequest,
  ConsumableLoadResponse,
  ConsumableLoadUpdateRequest,
} from '../consumable-load.models';
import { ConsumableLoadService } from '../consumable-load.service';

type Mode = 'create' | 'update';

/** A consumable may appear only once per refill (mirrors the backend rule). */
function uniqueConsumables(array: AbstractControl): ValidationErrors | null {
  const ids = (array.value as { consumableId: number | null }[])
    .map((item) => item.consumableId)
    .filter((id) => id != null);
  return new Set(ids).size === ids.length ? null : { duplicateConsumable: true };
}

/**
 * Operator page: log a refill visit (consumables loaded into a machine)
 * or amend an existing one.
 */
@Component({
  selector: 'app-consumable-load-form',
  imports: [ReactiveFormsModule, CompanyRequired, DatePipe, DecimalPipe],
  templateUrl: './consumable-load-form.html',
})
export class ConsumableLoadForm {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly loadsApi = inject(ConsumableLoadService);
  protected readonly context = inject(CompanyContextService);

  protected readonly mode = signal<Mode>('create');
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly saved = signal<ConsumableLoadResponse | null>(null);

  protected readonly form = this.fb.group({
    machineId: [null as number | null, [Validators.required, Validators.min(1)]],
    consumableLoadId: [null as number | null],
    totalCost: [null as number | null, Validators.min(0)],
    items: this.fb.array([this.createItem()], { validators: uniqueConsumables }),
  });

  constructor() {
    this.applyModeValidators();
  }

  protected get items() {
    return this.form.controls.items;
  }

  protected setMode(mode: Mode): void {
    this.mode.set(mode);
    this.error.set(null);
    this.applyModeValidators();
  }

  protected addItem(): void {
    this.items.push(this.createItem());
  }

  protected removeItem(index: number): void {
    this.items.removeAt(index);
  }

  /** Switch to update mode prefilled with the visit that was just saved. */
  protected editSaved(load: ConsumableLoadResponse): void {
    this.setMode('update');
    this.items.clear();
    this.form.reset({ machineId: load.machineId, consumableLoadId: load.id, totalCost: load.totalCost });
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

    const { machineId, consumableLoadId, totalCost, items } = this.form.getRawValue();
    const itemRequests: ConsumableLoadItemRequest[] = items.map((item) => ({
      consumableId: item.consumableId!,
      quantity: item.quantity!,
    }));
    let request$: Observable<ConsumableLoadResponse>;

    if (this.mode() === 'create') {
      if (itemRequests.length === 0) {
        this.error.set('Add at least one consumable.');
        return;
      }
      request$ = this.loadsApi.create(companyId, machineId!, { totalCost: totalCost!, items: itemRequests });
    } else {
      const request: ConsumableLoadUpdateRequest = {};
      if (totalCost != null) {
        request.totalCost = totalCost;
      }
      if (itemRequests.length > 0) {
        request.items = itemRequests;
      }
      if (Object.keys(request).length === 0) {
        this.error.set('Change the total cost or add consumables.');
        return;
      }
      request$ = this.loadsApi.update(companyId, machineId!, consumableLoadId!, request);
    }

    this.saving.set(true);
    this.error.set(null);
    request$.subscribe({
      next: (load) => {
        this.saved.set(load);
        this.saving.set(false);
        if (this.mode() === 'create') {
          this.items.clear();
          this.items.push(this.createItem());
          this.form.controls.totalCost.reset();
        }
      },
      error: (err: unknown) => {
        this.error.set(toErrorMessage(err));
        this.saving.set(false);
      },
    });
  }

  private createItem() {
    return this.fb.group({
      consumableId: [null as number | null, [Validators.required, Validators.min(1)]],
      quantity: [null as number | null, [Validators.required, Validators.min(0.001)]],
    });
  }

  /** Total cost is mandatory when creating; the visit id is mandatory when updating. */
  private applyModeValidators(): void {
    const { consumableLoadId, totalCost } = this.form.controls;
    if (this.mode() === 'create') {
      consumableLoadId.clearValidators();
      totalCost.setValidators([Validators.required, Validators.min(0)]);
    } else {
      consumableLoadId.setValidators([Validators.required, Validators.min(1)]);
      totalCost.setValidators(Validators.min(0));
    }
    consumableLoadId.updateValueAndValidity();
    totalCost.updateValueAndValidity();
  }
}
