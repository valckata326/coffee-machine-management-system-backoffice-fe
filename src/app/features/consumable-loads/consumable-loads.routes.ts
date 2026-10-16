import { Routes } from '@angular/router';

export default [
  {
    path: '',
    title: 'Refill visits · CoffeeOps',
    loadComponent: () =>
      import('./consumable-load-form/consumable-load-form').then((m) => m.ConsumableLoadForm),
  },
] satisfies Routes;
