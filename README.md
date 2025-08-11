Electron for desktop shell
React + Vite for UI
SQLite for offline storage
Background sync service for online updates

## preferred structure:
desktop/
│
├── electron/               # Electron main process code
│   ├── main.ts              # Creates windows, handles lifecycle
│   ├── preload.ts           # Secure bridge for IPC
│   ├── ipcHandlers/         # IPC request handlers
│   │   ├── auth.ts
│   │   ├── sales.ts
│   │   └── sync.ts
│   ├── services/            # Native services
│   │   ├── database.ts      # SQLite init & queries
│   │   ├── syncService.ts   # Push/pull with backend
│   │   └── offlineGuard.ts  # Enforce offline time limit
│   └── utils/
│
├── src/                     # React/Vite frontend
│   ├── components/
│   ├── modules/             # Auth, Sales, Sync UI
│   ├── store/               # Zustand/Redux
│   ├── api/
│   ├── App.tsx
│   └── main.tsx
│
├── shared/                  # Shared types/helpers
│
├── forge.config.js          # Electron Forge config
├── package.json
├── vite.config.ts           # Vite config for React
└── tsconfig.json


## Key Concepts Behind This Structure:

### Separation of Concerns
electron/ = Everything native (window creation, DB, sync engine, file system access).
src/ = The actual UI your users see.
shared/ = Common code between the two (e.g., type definitions for sync data).

### IPC Bridge (Secure)
UI never directly touches SQLite or the file system.
It sends requests to Electron’s main process via IPC, and gets responses back.
Prevents security nightmares.

### Offline-First Pattern
Transactions → Saved to SQLite immediately (works even if offline).
Sync service → Runs in background, pushes queued transactions, pulls updated items.
Sync can be auto-triggered or manual (button in UI).

### Tenant-Aware Logic
offlineGuard.ts in electron/services/ checks if tenant’s offline time limit is exceeded before letting a sale happen.

### Auto-Updates
updater.ts handles Electron’s auto-updater to keep the POS fresh without user intervention.

## Suggested Libraries
Electron tooling: electron-builder, electron-is-dev
IPC: Built-in Electron IPC (ipcMain, ipcRenderer)
Offline DB: better-sqlite3 (fast) or sqlite3
API requests: axios
State management: Zustand (simpler) or Redux Toolkit
Background jobs: node-cron or custom timers
Types: TypeScript everywhere