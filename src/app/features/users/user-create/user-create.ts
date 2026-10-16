import { Component, inject, input, output, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { toErrorMessage } from '../../../core/http/api-error';
import { UserResponse } from '../user.models';
import { UserService } from '../user.service';

@Component({
  selector: 'app-user-create',
  imports: [ReactiveFormsModule],
  templateUrl: './user-create.html',
})
export class UserCreate {
  private readonly users = inject(UserService);

  readonly companyId = input.required<number>();
  readonly saved = output<UserResponse>();

  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly form = inject(NonNullableFormBuilder).group({
    name: ['', [Validators.required, Validators.maxLength(255)]],
    roleId: [null as number | null, [Validators.required, Validators.min(1)]],
  });

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { name, roleId } = this.form.getRawValue();
    this.saving.set(true);
    this.error.set(null);
    this.users.create(this.companyId(), { name: name.trim(), roleId: roleId! }).subscribe({
      next: (user) => {
        this.saved.emit(user);
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
