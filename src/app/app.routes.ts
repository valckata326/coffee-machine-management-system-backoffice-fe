import { Routes } from '@angular/router';

import { authGuard, guestGuard, roleGuard } from './core/auth/auth.guards';
import { Role } from './core/auth/role';
import { Shell } from './layout/shell/shell';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    title: 'Login · CoffeeOps',
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
  },
  {
    path: '',
    component: Shell,
    canActivate: [authGuard],
    canActivateChild: [roleGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        title: 'Dashboard · CoffeeOps',
        loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'companies',
        data: { roles: [Role.Admin] },
        loadChildren: () => import('./features/companies/companies.routes'),
      },
      {
        path: 'users',
        data: { roles: [Role.Admin, Role.Manager] },
        loadChildren: () => import('./features/users/users.routes'),
      },
      {
        path: 'machines',
        data: { roles: [Role.Admin, Role.Manager] },
        loadChildren: () => import('./features/machines/machines.routes'),
      },
      {
        path: 'consumables',
        data: { roles: [Role.Admin, Role.Manager] },
        loadChildren: () => import('./features/consumables/consumables.routes'),
      },
      {
        path: 'consumable-loads',
        data: { roles: [Role.Operator] },
        loadChildren: () => import('./features/consumable-loads/consumable-loads.routes'),
      },
      {
        path: 'forbidden',
        title: 'Access denied · CoffeeOps',
        loadComponent: () => import('./shared/ui/forbidden').then((m) => m.Forbidden),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
