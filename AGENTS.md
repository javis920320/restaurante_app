# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Core development commands
- Install dependencies:
  - `composer install`
  - `npm install`
- Run the full local dev stack (Laravel server + queue worker + Vite): `composer run dev`
- Frontend only:
  - Dev server: `npm run dev`
  - Production build: `npm run build`
  - SSR build: `npm run build:ssr`
- Backend tests:
  - Full suite: `php artisan test` (or `composer test`)
  - Single test file: `php artisan test tests/Feature/CajaModuleTest.php`
  - Filter to one test name: `php artisan test --filter="nombre_del_test"`
- Frontend quality checks:
  - ESLint (auto-fix enabled by script): `npm run lint`
  - TypeScript check: `npm run types`
  - Prettier check: `npm run format:check`
  - Prettier write: `npm run format`
- PHP formatting: `vendor/bin/pint`

## Bootstrapping and runtime assumptions
- This is a Laravel 12 + Inertia React (TypeScript) monolith.
- Initial project setup follows `README.md`: copy `.env`, generate app key, run migrations, then start app/services.
- API tests are configured to use in-memory SQLite via `phpunit.xml`; keep this in mind when adding DB-dependent tests.
- Vite is configured with React + Tailwind v4 and Ziggy aliasing (`vite.config.ts`), and uses `resources/js/app.tsx` + `resources/js/ssr.tsx` as entrypoints.

## High-level architecture
- **Routing split**
  - `routes/web.php`: Inertia-rendered pages and authenticated back-office screens.
  - `routes/api.php`: JSON endpoints for polling/action flows (dashboard metrics, KDS boards, cashier operations, order actions).
- **Backend layering**
  - Controllers in `app/Http/Controllers` are mostly orchestration + validation/authorization.
  - Core business logic is concentrated in `app/Services` (`PedidoService`, `DashboardService`, `CajaService`, `PaymentService`, etc.).
  - Domain models and state enums/scopes live in `app/Models`.
- **Frontend layering**
  - Inertia pages in `resources/js/pages/*` map closely to modules (Dashboard, Cocina, Bar, Caja, Pedidos, Configuración).
  - Data-fetching and polling logic lives in `resources/js/hooks/*`.
  - API wrappers for modules live in `resources/js/services/*`.

## Domain model and workflow notes (important)
- Orders (`Pedido`) use **two state axes**:
  - Operational flow (`estado`): e.g. `pendiente -> confirmado -> en_preparacion -> listo -> entregado`.
  - Payment flow (`payment_status`): e.g. `pending` / `paid`.
- Order item flow (`PedidoDetalle.estado`) is tracked separately and used by kitchen/bar Kanban views; item transitions can auto-sync parent order state in `PedidoService`.
- Production area separation (`production_area` = `kitchen` / `bar`) drives Cocina/Bar views and Kanban grouping.
- Cashier/cash register operations are handled by dedicated cash entities (`cash_registers`, openings, closings, movements, payments) and services (`CajaService`, `PaymentService`), not by ad-hoc updates.
- The payment-before-preparation rule is configurable in `config/restaurant.php` (`REQUIRE_PAYMENT_BEFORE_PREPARATION`) and enforced in service logic.

## Auth, permissions, and shared frontend context
- Authenticated API routes use Sanctum (`auth:sanctum` group in `routes/api.php`).
- Role/permission setup relies on `spatie/laravel-permission`; current user roles/permissions are shared to the frontend in `HandleInertiaRequests`.
- Policies exist for key entities (`Pedido`, `Mesa`, `Plato`) and are invoked from controllers (`$this->authorize(...)`), so preserve authorization checks when adding endpoints.

## Event-driven behavior to keep in mind
- Application events/listeners are registered in `AppServiceProvider` for order lifecycle notifications:
  - `PedidoCreado` -> `NotificarPedidoCreado`
  - `PedidoEstadoActualizado` -> `NotificarCambioEstado`
- When changing order state logic, verify these events still fire correctly.
