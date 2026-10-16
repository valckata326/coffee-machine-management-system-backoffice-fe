import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { toErrorMessage } from '../../../core/http/api-error';
import { ConsumableResponse } from '../consumable.models';
import { ConsumableService } from '../consumable.service';

@Component({
  selector: 'app-consumable-list',
  imports: [RouterLink],
  templateUrl: './consumable-list.html',
})
export class ConsumableList {
  private readonly consumablesApi = inject(ConsumableService);

  protected readonly consumables = signal<ConsumableResponse[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  constructor() {
    this.consumablesApi.list().subscribe({
      next: (consumables) => {
        this.consumables.set(consumables);
        this.loading.set(false);
      },
      error: (err: unknown) => {
        this.error.set(toErrorMessage(err));
        this.loading.set(false);
      },
    });
  }

  protected remove(consumable: ConsumableResponse): void {
    if (!confirm(`Remove "${consumable.name}" from the catalog?`)) {
      return;
    }
    this.consumablesApi.remove(consumable.id).subscribe({
      next: () => this.consumables.update((list) => list.filter((c) => c.id !== consumable.id)),
      error: (err: unknown) => this.error.set(toErrorMessage(err)),
    });
  }
}
