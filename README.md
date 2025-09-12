# Inventory Manager
This is the **desktop application** for the **Inventory Manager**, built with **Electron**, **React**, **Vite**, **TailwindCSS**, and **TypeScript**.

## System Requirements
- **Node.js** v20.0 or higher (**LTS recommended**)
- **npm** v10.x.x

## Key Features
- POS for fast billing.
- need to include offline compatibily as well


## Installation
### 1. Install Dependencies:
```bash
npm install
# or
yarn install
```
> **Tip:** If you face dependency resolution issues, try:
>
> ```bash
> npm install --legacy-peer-deps
> ```

### 2. Start Development Server:
```bash
npm run dev
# or for production build
npm start
```


## Contribution Guidelines
To maintain code quality and consistency, please adhere to the following guidelines when contributing to the project.

### General Principles
- **Keep it DRY:** Don't repeat yourself. Utilize existing services, components, and helpers where possible.
- **Permissions over Roles:** Whenever checking for authorization, prefer using specific permissions, hasPermissions("update-customer"). This makes the system more flexible.

### Git Workflow & Commit Guidelines
Follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) for clear commit history.


#### Commit and PR Types Guide (Conventional Commits)
| **Type**    | **Usage**                                          | **Example Commit Message**                                  |
|-------------|----------------------------------------------------|-------------------------------------------------------------|
| **feat**    | A new feature                                      | `feat(user): add user export API endpoint`                  |
| **fix**     | A bug fix                                          | `fix(order): correct invalid status code on approval`       |
| **docs**    | Documentation only changes                         | `docs(contributing): add guidelines for new contributors`   |
| **style**   | Code style changes (formatting, spacing, etc.)     | `style: apply Pint fixes to inventory module`               |
| **refactor**| Code refactoring (no bug fix or new feature)       | `refactor(batch): optimize FIFO stock retrieval logic`      |
| **perf**    | Performance improvements                           | `perf(sale): improve sale item lookup performance`          |
| **test**    | Adding or fixing tests                             | `test(item): add unit tests for stockOnHand calculation`    |
| **build**   | Build system or dependency changes                 | `build: update npm dependencies`                            |
| **ci**      | CI/CD pipeline or automation related changes       | `ci(github): add CI workflow for PR validation`             |
| **chore**   | Routine tasks, maintenance (non-code affecting)    | `chore: clean up unused services`                           |
| **revert**  | Reverting a previous commit                        | `revert: revert 'feat(user): add user export API endpoint'` |

#### Branch Naming Conventions
```bash
git checkout -b feature/user-export-endpoint
git checkout -b bug/fix-status-code
git checkout -b enhancement/optimize-export-performance
```

### Coding Standards
- Run **ESLint** before pushing code:
    ```bash
    npm run lint
    ```
- Run **Tests** before pushing code:
    ```bash
    npm run test -- --run
    ```
- Maintain UI consistency by following patterns defined in `/components` and `/layouts`.
---


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
├── electron-builder.config.js  # Electron Builder config
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

---

## 📄 License
[MIT](LICENSE)

---

## 🤝 Contributing
Feel free to fork, submit PRs, and raise issues. For major changes, please open an issue first to discuss what you'd like to change.

---

## ✨ Made with ❤️ by the Inventory Manager Team ✨
