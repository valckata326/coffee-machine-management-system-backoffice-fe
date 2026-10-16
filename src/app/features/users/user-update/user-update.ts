import { Component, inject, input, output, signal } from '@angular/core';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';

import { toErrorMessage } from '../../../core/http/api-error';
import { UserResponse, UserUpdateRequest } from '../user.models';
import { UserService } from '../user.service';

type ActiveChoice = '' | 'true' | 'false';

/** The backend requires at least one of roleId / active. */
function atLeastOneChange(group: AbstractControl): ValidationErrors | null {
  const { roleId, active } = group.value as { roleId: number | null; active: ActiveChoice };
  return roleId == null && active === '' ? { noChange: true } : null;
}

@Component({
  selector: 'app-user-update',
  imports: [ReactiveFormsModule],
  templateUrl: './user-update.html',
})
export class UserUpdate {
  private readonly users = inject(UserService);

  readonly companyId = input.required<number>();
  readonly saved = output<UserResponse>();

  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly form = inject(NonNullableFormBuilder).group(
    {
      userId: [null as number | null, [Validators.required, Validators.min(1)]],
      roleId: [null as number | null, Validators.min(1)],
      active: ['' as ActiveChoice],
    },
    { validators: atLeastOneChange },
  );

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { userId, roleId, active } = this.form.getRawValue();
    const request: UserUpdateRequest = {};
    if (roleId != null) {
      request.roleId = roleId;
    }
    if (active !== '') {
      request.active = active === 'true';
    }

    this.saving.set(true);
    this.error.set(null);
    this.users.update(this.companyId(), userId!, request).subscribe({
      next: (user) => {
        this.saved.emit(user);
        this.saving.set(false);
      },
      error: (err: unknown) => {
        this.error.set(toErrorMessage(err));
        this.saving.set(false);
      },
    });
  }
}
