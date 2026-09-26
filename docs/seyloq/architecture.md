# SEY-001 Architecture

## Repository Structure

- `apps/seyloq/src`: React/TypeScript product UI.
- `apps/seyloq/src-tauri`: Tauri 2 Rust shell and least-privilege platform boundary.
- `packages/protocol`: future shared protocol contracts.
- `packages/shared`: future cross-runtime utilities.
- `packages/ui-contracts`: future reusable UI behavior contracts.
- `packages/testing`: future shared test utilities.
- `services`: reserved for later backend services.
- `infra`: reserved for later infrastructure and non-GitHub-Actions CI/CD.

## Frontend Architecture

The first slice is intentionally local and deterministic. State is component-local because there is no backend, realtime state, authentication, local database, or optimistic mutation flow yet.

The app separates:

- deterministic entities and seed data
- primitives
- shell/messaging composition
- Live Object presentation
- semantic design tokens

## Tauri Boundary

The Tauri app exposes only a small `platform_summary` command and grants `core:default` to the main window. No filesystem, notification, shell, network, contacts, location, camera, or mobile plugin permissions are granted.

## Testing Strategy

SEY-001 uses TypeScript checks, ESLint, Vitest component tests, Rust formatting/check/tests, and production build as the baseline gates.
