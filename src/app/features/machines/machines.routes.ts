import { Routes } from '@angular/router';

export default [
  {
    path: '',
    title: 'Machines · CoffeeOps',
    loadComponent: () => import('./machine-list/machine-list').then((m) => m.MachineList),
  },
  {
    path: 'new',
    title: 'New machine · CoffeeOps',
    loadComponent: () => import('./machine-form/machine-form').then((m) => m.MachineForm),
  },
  {
    path: ':machineId',
    title: 'Machine · CoffeeOps',
    loadComponent: () => import('./machine-detail/machine-detail').then((m) => m.MachineDetail),
  },
  {
    path: ':machineId/edit',
    title: 'Edit machine · CoffeeOps',
    loadComponent: () => import('./machine-form/machine-form').then((m) => m.MachineForm),
  },
] satisfies Routes;
