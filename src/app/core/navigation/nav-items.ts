import { Role } from '../auth/role';

export interface NavItem {
  label: string;
  path: string;
  /** Roles that see the item. Keep in sync with the `roles` data of the matching route. */
  roles: readonly Role[];
  description: string;
}

const MANAGEMENT: readonly Role[] = [Role.Admin, Role.Manager];

/** Single source of truth for the sidebar and dashboard tiles. Add new features here. */
export const NAV_ITEMS: readonly NavItem[] = [
  {
    label: 'Companies',
    path: '/companies',
    roles: [Role.Admin],
    description: 'Register new companies.',
  },
  {
    label: 'Users',
    path: '/users',
    roles: MANAGEMENT,
    description: 'Create company users, change roles, deactivate accounts.',
  },
  {
    label: 'Machines',
    path: '/machines',
    roles: MANAGEMENT,
    description: 'Manage the coffee machines of a company.',
  },
  {
    label: 'Consumables',
    path: '/consumables',
    roles: MANAGEMENT,
    description: 'Maintain the consumable catalog (coffee, milk, cups...).',
  },
  {
    label: 'Refill visits',
    path: '/consumable-loads',
    roles: [Role.Operator],
    description: 'Log consumables loaded into a machine.',
  },
];
