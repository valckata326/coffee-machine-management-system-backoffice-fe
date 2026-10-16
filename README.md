# CoffeeOps Backoffice

Angular 21 backoffice for the **coffee-machine-management-system** backend (Spring Boot, `../coffee-machine-management-system`).

## Getting started

```bash
npm install
npm start            # http://localhost:4200
npm test             # unit tests (Vitest)
npm run build        # production build -> dist/
```

Requirements: Node `^20.19 || ^22.12 || >=24`. Angular 21 is used because Angular 22 needs Node 22+.

The dev server proxies `/api/**` to `http://localhost:8080` (`proxy.conf.json`), so the backend needs no CORS setup.
Start the backend (and its Postgres via `docker-compose up`) first. Local login: **admin / admin**.

## Features (mirrors the backend API)

| Area | Route | Roles | Backend endpoints |
|---|---|---|---|
| Companies | `/companies` | Admin | `POST /companies` |
| Users | `/users` | Admin, Manager | `POST`, `PATCH /companies/{id}/users` |
| Machines | `/machines` | Admin, Manager | list (city filter), details, create, update, soft remove |
| Consumables | `/consumables` | Admin, Manager | list, get, create, update, soft remove |
| Refill visits | `/consumable-loads` | Operator | `POST`, `PATCH .../machines/{id}/consumable-loads` |

Company-scoped pages use the **active company** shown in the top bar. Managers and Operators are fixed to their own
company; Admins enter a company id (the backend has no endpoint that lists companies yet).

## Project structure

```
src/app/
├── core/                      # App-wide singletons, no UI
│   ├── auth/                  # AuthService, guards, Basic-auth interceptor, Role, Session
│   ├── company/               # CompanyContextService (active company)
│   ├── config/                # API_BASE_URL token
│   ├── http/                  # 401 handling, error -> message helper
│   └── navigation/nav-items.ts   # Sidebar + dashboard entries (role-filtered)
├── layout/shell/              # Top bar, sidebar, <router-outlet>
├── shared/ui/                 # Small reusable components
└── features/<feature>/        # One folder per backend area
    ├── <feature>.models.ts    # TS types matching the backend DTOs
    ├── <feature>.service.ts   # HttpClient calls
    ├── <feature>.routes.ts    # Lazy-loaded routes
    └── <component>/           # Page components (.ts + .html)
```

Styling is plain global SCSS (`src/styles.scss`) with the coffee palette in CSS variables on `:root`.

## Authentication

The backend uses stateless **HTTP Basic** auth. On login the app:

1. Calls `GET /api/v1/auth/me` (backend 1.6.0+) and reads `{ username, role, companyId, userId }`.
   A `401` means wrong credentials.
2. Against an older backend without that endpoint, it falls back to probing `GET /api/v1/consumables`:
   `200` → Admin, `403` → Operator.

The session (including the encoded credentials) is kept in `sessionStorage`, so it is cleared when the tab closes.
`authInterceptor` adds the `Authorization` header plus `X-Requested-With`, which stops the browser's native Basic-auth popup.
Any `401` afterwards logs the user out.

## Adding a feature

1. Create `features/<name>/` with models, service and routes like the existing features.
2. Register the lazy route in `app.routes.ts` with `data: { roles: [...] }`. `roleGuard` enforces it.
3. Add an entry to `core/navigation/nav-items.ts` so it shows in the sidebar and on the dashboard.

## Backend gaps worth closing

These limits come from the current API, not from this app:

- **Only the in-memory `admin` user can log in.** Users in the database have no passwords.
- **No list endpoints** for companies, users, locations, unit types, company roles or consumable loads,
  so those are entered by id.
- **Operators can't read machines or consumables** (`403`), so they type machine and consumable ids by hand.
- The default Spring error body has no `message`, so the app shows a generic message for each status code.
