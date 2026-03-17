# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**ojnext** is the frontend for an Online Judge platform. Built with Vue 3 + TypeScript using Rsbuild (Rust-based bundler), Naive UI component library, Pinia for state management, and Vue Router.

## Commands

```bash
npm start              # Start dev server on port 5173
npm run build          # Production build
npm run build:staging  # Staging build
npm run build:test     # Test build
npm fmt                # Format with Prettier
```

No test suite is configured. Linting is via Prettier only.

## Architecture

### Directory Structure

```
src/
├── shared/        # Cross-cutting concerns: layout, stores, composables, API
├── oj/            # User-facing features (problems, submissions, contests, etc.)
├── admin/         # Admin panel features
├── utils/         # Constants, types, HTTP client, helpers
├── routes.ts      # Route definitions (two top-level: ojs, admins)
├── main.ts        # App entry point
└── App.vue        # Root component with Naive UI theme setup
```

### Module Pattern

Each feature module (under `oj/` or `admin/`) typically has:
- `views/` — page-level Vue components
- `components/` — feature-specific components
- `api.ts` — API calls specific to the feature

Shared logic lives in `shared/`:
- `store/` — Pinia stores: `user` (auth/roles), `config` (site-wide settings), `authModal` (login/signup form state), `screenMode` (problem split-screen layout), `loginSummary` (AI activity summary)
- `composables/` — `pagination` (URL-synced), `websocket` (reconnect + heartbeat), `sync` (Yjs/y-webrtc for collaborative editing), `configUpdate` (WS-pushed config sync), `useMermaid` (lazy Mermaid render), `breakpoints`, `maxkb`
- `layout/` — `default.vue` and `admin.vue` layout wrappers
- `api.ts` — shared API calls (auth, profile, tags, captcha)

### Auto-Imports

Configured via `unplugin-auto-import` and `unplugin-vue-components`. You do **not** need to manually import:
- Vue APIs (`ref`, `computed`, `watch`, etc.)
- Vue Router (`useRouter`, `useRoute`)
- Pinia (`defineStore`, `storeToRefs`)
- VueUse composables
- Naive UI composables (`useDialog`, `useMessage`, `useNotification`, `useLoadingBar`)
- Naive UI components (all `N*` components)
- Naive UI types (`DataTableColumn`, `FormRules`, `FormItemRule`, `SelectOption`, `UploadCustomRequestOptions`, `UploadFileInfo`, `MenuOption`, `DropdownOption`)

Generated type declaration files: `src/auto-imports.d.ts`, `src/components.d.ts`.

### Path Aliases

```
utils  →  ./src/utils
oj     →  ./src/oj
admin  →  ./src/admin
shared →  ./src/shared
```

### HTTP Client

`utils/http.ts` — Axios instance with interceptors. All API calls proxy through the dev server:
- `/api` and `/public` → `PUBLIC_OJ_URL` (backend)
- `/ws` → `PUBLIC_WS_URL` (WebSocket backend)

### Key Utilities

- `utils/constants.ts` — Judge status codes, language IDs, difficulty levels, contest types
- `utils/types.ts` — TypeScript interfaces for all domain models
- `utils/permissions.ts` — Permission check helpers
- `utils/judge.ts` — Judge-related utilities
- `utils/renders.ts` — Table column render helpers for Naive UI DataTable

### Environment Variables

Variables prefixed with `PUBLIC_` are injected at build time. Env files: `.env`, `.env.staging`, `.env.test`.

| Variable | Purpose |
|---|---|
| `PUBLIC_OJ_URL` | Backend REST API base URL |
| `PUBLIC_WS_URL` | WebSocket server URL |
| `PUBLIC_ENV` | Environment name (dev/staging/production) |
| `PUBLIC_CODE_URL` | Code execution service |
| `PUBLIC_JUDGE0_URL` | Judge0 API |
| `PUBLIC_MAXKB_URL` | Knowledge base service |
| `PUBLIC_SIGNALING_URL` | WebRTC signaling server |
| `PUBLIC_ICONIFY_URL` | Iconify icon CDN |

### Routing

Routes are defined in `src/routes.ts` with two root routes: `ojs` (user-facing) and `admins` (admin panel). Route meta fields used:
- `requiresAuth` — redirect to login if not authenticated
- `requiresSuperAdmin` — super admin only
- `requiresProblemPermission` — problem management access

### Real-time Features

- WebSocket via composable in `shared/composables/` for submission status updates
- Yjs + y-webrtc for collaborative editing in the flowchart editor

## Related Repository

The backend is at `../OnlineJudge` — a Django 5 + DRF project. See its CLAUDE.md for backend details.
