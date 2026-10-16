import { Routes } from '@angular/router';

export default [
  {
    path: '',
    title: 'Users · CoffeeOps',
    loadComponent: () => import('./users-page').then((m) => m.UsersPage),
  },
] satisfies Routes;
