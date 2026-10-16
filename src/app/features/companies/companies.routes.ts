import { Routes } from '@angular/router';

export default [
  {
    path: '',
    title: 'Companies · CoffeeOps',
    loadComponent: () => import('./company-create/company-create').then((m) => m.CompanyCreate),
  },
] satisfies Routes;
