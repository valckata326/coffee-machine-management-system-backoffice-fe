import { Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';

import { toErrorMessage } from '../../../core/http/api-error';
import { ConsumableResponse, ConsumableUpdateRequest } from '../consumable.models';
import { ConsumableService } from '../consumable.service';

/** Create (`/consumables/new`) and edit (`/consumables/:consumableId/edit`) form. */
@Component({
  selector: 'app-consumable-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './consumable-form.html',
})
export class ConsumableForm {
  private readonly consumablesApi = inject(ConsumableService);
  private readonly router = inject(Router);

  /** Bound from the `:consumableId` route param; absent in create mode. */
  readonly consumableId = input<string>();
  protected readonly isEdit = computed(() => !!this.consumableId());

  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);
  private original: ConsumableResponse | null = null;

  protected readonly form = inject(NonNullableFormBuilder).group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    unitTypeId: [null as number | null, [Validators.required, Validators.min(1)]],
  });

  constructor() {
    effect(() => {
      const id = Number(this.consumableId());
      if (!id) {
        return;
      }
      untracked(() =>
        this.consumablesApi.get(id).subscribe({
          next: (consumable) => {
            this.original = consumable;
            this.form.reset({ name: consumable.name, unitTypeId: consumable.unitTypeId });
          },
          error: (err: unknown) => this.error.set(toErrorMessage(err)),
        }),
      );
    });
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const name = this.form.controls.name.value.trim();
    const unitTypeId = this.form.controls.unitTypeId.value!;
    let request$: Observable<ConsumableResponse>;

    if (this.isEdit()) {
      const changes: ConsumableUpdateRequest = {};
      if (name !== this.original?.name) {
        changes.name = name;
      }
      if (unitTypeId !== this.original?.unitTypeId) {
        changes.unitTypeId = unitTypeId;
      }
      if (Object.keys(changes).length === 0) {
        this.error.set('Nothing to update.');
        return;
      }
      request$ = this.consumablesApi.update(this.original!.id, changes);
    } else {
      request$ = this.consumablesApi.create({ name, unitTypeId });
    }

    this.saving.set(true);
    this.error.set(null);
    request$.subscribe({
      next: () => void this.router.navigate(['/consumables']),
      error: (err: unknown) => {
        this.error.set(toErrorMessage(err));
        this.saving.set(false);
      },
    });
  }
}
