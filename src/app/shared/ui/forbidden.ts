import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-forbidden',
  imports: [RouterLink],
  template: `
    <div class="card">
      <h1>Access denied</h1>
      <p>Your role does not allow you to open this page.</p>
      <a routerLink="/" class="btn">Back to dashboard</a>
    </div>
  `,
})
export class Forbidden {}
