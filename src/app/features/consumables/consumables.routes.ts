import { Routes } from '@angular/router';

export default [
  {
    path: '',
    title: 'Consumables · CoffeeOps',
    loadComponent: () => import('./consumable-list/consumable-list').then((m) => m.ConsumableList),
  },
  {
    path: 'new',
    title: 'New consumable · CoffeeOps',
    loadComponent: () => import('./consumable-form/consumable-form').then((m) => m.ConsumableForm),
  },
  {
    path: ':consumableId/edit',
    title: 'Edit consumable · CoffeeOps',
    loadComponent: () => import('./consumable-form/consumable-form').then((m) => m.ConsumableForm),
  },
] satisfies Routes;
