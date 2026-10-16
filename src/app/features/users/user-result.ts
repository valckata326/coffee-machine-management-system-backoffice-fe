import { Component, input } from '@angular/core';

import { UserResponse } from './user.models';

@Component({
  selector: 'app-user-result',
  template: `
    <div class="card">
      <h2>Saved user</h2>
      <table class="table">
        <thead>
          <tr><th>Id</th><th>Name</th><th>Role</th><th>Status</th></tr>
        </thead>
        <tbody>
          <tr>
            <td>{{ user().id }}</td>
            <td>{{ user().name }}</td>
            <td>{{ user().companyRole }} (#{{ user().roleId }})</td>
            <td>
              <span class="badge" [class.badge-muted]="!user().active">
                {{ user().active ? 'Active' : 'Inactive' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
})
export class UserResult {
  readonly user = input.required<UserResponse>();
}
