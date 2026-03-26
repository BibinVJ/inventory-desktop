# Desktop Agent Guide

This repository is the Electron desktop/POS client for Atom Suit.

For background, review [README.md](/home/bibin/websites/atomsuit/desktop/README.md).

## Stack

- Electron
- React
- Vite
- TypeScript

## Core Desktop Rules

- Follow the current implemented structure first.
- Keep renderer/UI code in `src/`.
- Keep native/Electron code in `electron/`.
- Only cross the renderer/native boundary when the feature truly needs IPC, local database, sync, device, or OS integration.

## Current Structure To Follow

- pages in `src/pages`
- reusable UI in `src/components`
- services in `src/services`
- routing in `src/router`
- shared renderer types in `src/types`
- native handlers in `electron/ipcHandlers`
- native services in `electron/services`

The README contains a broader preferred future structure. Treat that as directional guidance, not a reason to ignore the current implemented layout.

## Multi-Tenant Rules

- The desktop client sends tenant context through the `x-tenant` header.
- Reuse the existing API client in `src/services/api.ts`.
- Keep auth/token/tenant behavior aligned with the current desktop flow.

## File Placement

For a new desktop feature, review whether you need:

- a page in `src/pages`
- reusable UI in `src/components`
- a renderer API/service in `src/services`
- route updates in `src/router`
- type updates in `src/types`
- IPC handlers or native services in `electron/` only when necessary

## Working Conventions

- Do not put normal UI concerns into Electron services.
- Do not duplicate auth, tenant header, or API handling when the shared client already covers it.
- Match the current router/page/component structure before introducing a new module layout.
- If a feature affects offline sync or local DB behavior, keep the separation between renderer code and Electron services explicit.

## Validation

Run relevant checks before finishing desktop work:

- `npm run lint`
- `npm run type-check`
