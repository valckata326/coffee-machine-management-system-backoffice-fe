import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { CompanyContextService } from '../../../core/company/company-context.service';
import { toErrorMessage } from '../../../core/http/api-error';
import { CompanyResponse } from '../company.models';
import { CompanyService } from '../company.service';

@Component({
  selector: 'app-company-create',
  imports: [ReactiveFormsModule],
  templateUrl: './company-create.html',
})
export class CompanyCreate {
  private readonly companies = inject(CompanyService);
  protected readonly context = inject(CompanyContextService);

  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly created = signal<CompanyResponse | null>(null);

  protected readonly form = inject(NonNullableFormBuilder).group({
    name: ['', [Validators.required, Validators.maxLength(255)]],
  });

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.error.set(null);
    this.companies.register({ name: this.form.getRawValue().name.trim() }).subscribe({
      next: (company) => {
        this.created.set(company);
        this.form.reset();
        this.saving.set(false);
      },
      error: (err: unknown) => {
        this.error.set(toErrorMessage(err));
        this.saving.set(false);
      },
    });
  }
}
