import { Component } from '@angular/core';

/** Shown by company-scoped pages while no company is selected. */
@Component({
  selector: 'app-company-required',
  template: `
    <p class="alert alert-info">
      Select a company first: enter its id in the <strong>Company #</strong> field at the top.
    </p>
  `,
})
export class CompanyRequired {}
