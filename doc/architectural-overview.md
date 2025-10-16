
# Architectural Overview

This document describes the architecture of the ngcp-csc-ui project (Customer Self-Care Web Interface).

## High-level summary

- SPA built with Vue 2 + Quasar (see `package.json`).
- Migration to Vue 3 was started but was left unfinished.
- Uses Vuex 4 for centralized state management (`src/store/index.js` + many modules under `src/store/`).
- Communicates with a REST backend via an axios wrapper in `src/api/common.js`.
- Integrates real-time VoIP (SIP) using JsSIP over WebSocket (see `src/api/ngcp-call.js` and `src/boot/ngcp-call.js`).
- Internationalization via `vue-i18n` with boot registration in `src/boot/i18n.js`.
- Local persistence uses Quasar `LocalStorage` / `SessionStorage` helper in `src/storage.js`.

## Build and runtime

- Project scripts are defined in `package.json`. Development: `quasar dev`. Production build: `quasar build`.
- App configuration (base HTTP/WS URLs) is provided via `src/config/app.template.js` / `src/config/app.template.root.js` and runtime-injected `appConfig` (used in `src/boot/ngcp-call.js` and `src/boot/api.js`).

## Application structure

- `src/` contains the application source.
	- `App.vue`: root component.
	- `boot/`: Quasar boot files that initialize global subsystems (store, i18n, API client, SIP integration). **Note:  The latest Quasar has dropped support for Vuex. We can still use Vuex as any Vue plugin, but we have to manage everything (installing the store, no store parameter in boot files, etc.).**	Notable files:
		- `src/boot/api.js` — initializes API base URL by calling `initAPI` from `src/api/common.js`.
		- `src/boot/ngcp-call.js` — wires the JsSIP-based call module into the store and configures the WebSocket URL used for SIP registration.
		- `src/boot/i18n.js` — creates and registers `vue-i18n` and watches for language changes to reload language-dependent store data.
		- `src/boot/store.js` — creates and registers the Vuex store instance with the app.
	- `store/`: Vuex modules (split by feature). The store is assembled in `src/store/index.js` and has modules such as `call`, `conversations`, `pbx*`, `user`, `communication`, `fax`, `voicebox`, etc.
	- `api/`: small wrappers for domain APIs and a robust HTTP API layer in `src/api/common.js`.
	- `router/`: route definitions and meta configuration in `src/router/routes.js`.
	- `components/`, `pages/`, `layouts/`: UI building blocks and pages organized by feature.
	- `assets/`, `helpers/`, `mixins/`, `validators/`: supporting libraries and utilities.

## HTTP API layer (src/api/common.js)

- Single axios instance `httpApi` with defaults and request/response handling.
- Request configuration helpers for GET/POST/PUT/PATCH/DELETE with consistent headers (Content-Type, Prefer, Accept) and helper functions `getList`, `get`, `post`, `put`, `del`, `apiGet`, `apiPost`, `apiDownloadFile`, etc.
- Adds Authorization header automatically when a JWT is present (uses `src/auth.js` helpers which read JWT from `src/storage.js`).
- Centralized error handling in `handleResponseError` that translates some backend error codes/messages into UI actions (for example, password expired redirects to `PATH_CHANGE_PASSWORD` — route defined in `src/router/routes.js`).
- Utilities: `normalizeEntity` removes HAL `_links`, `getJsonBody` (in `src/api/utils.js`) ensures JSON bodies are parsed.

Contract of API functions:
- Inputs: high-level options objects describing resource/path/params/body.
- Outputs: parsed JSON entities, blobs, or identifiers.
- Errors: throws `ApiResponseError` with `code` and `message` when backend returns structured errors; otherwise rethrows network/axios errors.

## Authentication and storage

- JWT is stored in LocalStorage via `src/storage.js` and `src/auth.js` provides `getJwt`, `hasJwt`, `setJwt`, `deleteJwt`.
- `src/api/common.js` attaches `Authorization: Bearer <jwt>` automatically when present.

## Real-time VoIP integration (JsSIP)

- The app integrates SIP over WebSocket using JsSIP (package `jssip`, referenced in `package.json`).
- Core SIP logic implemented in `src/api/ngcp-call.js`:
	- Manages a JsSIP UA and WebSocket interface to Kamailio (or other SIP-over-WS proxy).
	- Configures PC/RTCP/ICE options and handles trickle ICE via SIP INFO (sends/receives `application/trickle-ice-sdpfrag`).
	- Emits domain events through an EventEmitter `callEvent` for the rest of the app to react to (incoming calls, remote/local streams, ICE events, registration state).
	- Exposes functions: `callConfigure`, `callInitialize`, `callRegister`, `callUnregister`, `callStart`, `callAccept`, `callSendVideo`, `callGetRemoteMediaStream`, etc.
- Boot file `src/boot/ngcp-call.js` calls `callConfigure` with `baseWebSocketUrl` built from `app.config.globalProperties.$appConfig.baseWsUrl` and registers handlers that commit or dispatch Vuex store mutations/actions.
- `callEvent` is used in boot to update `call` store state (e.g., `store.commit('call/enableCall')`, `store.commit('call/establishCall', {...})`). See `src/boot/ngcp-call.js`.

VoIP notes and constraints:
- SIP credentials (subscriber username/password) are supplied at runtime via the `callInitialize` flow (see `callInitialize` in `src/api/ngcp-call.js`).
- Trickle ICE is implemented by sending ICE candidates over SIP INFO messages, and parsing incoming SDP fragments to add candidates to the current PeerConnection.
- Media is handled via WebRTC getUserMedia, MediaStream tracks, transceivers and explicit renegotiation.
- Limitations:
	- Currently only one active call is supported at a time and video can be toggled only after the call has started.
	- Video and screen sharing cannot be used simultaneously.

## Routing and navigation

- Routes are declared in `src/router/routes.js` and use meta fields extensively to provide titles, subtitles, required licenses, features, and permissions such as `adminOnly`.
- The root route base path is `/user` and many feature pages live under it (dashboard, conversations, pbx settings, phonebooks, etc.).
- `App.vue` reads route meta to set the page title.
	- See document [Router Navigation Guard](router-navigation-guard.md) for details on adding new pages and menu items.

## State management (Vuex)

- The store is modular: each major feature has its own Vuex module under `src/store/` (e.g., `call.js`, `conversations.js`, `pbx-*`, `user.js`, `communication.js`).
- The store factory is in `src/store/index.js` and is bootstrapped via `src/boot/store.js`.
- The store contains some global getters for formatted dates, and actions for language reloads that can refresh language-dependent data.

## Internationalization

- Implemented with `vue-i18n` (`src/boot/i18n.js`) and messages are loaded from `src/i18n`.
- Store watches `i18n.locale` to trigger `reloadLanguageRelatedData` action that refreshes data dependent on UI language (see `src/store/index.js` action `reloadLanguageRelatedData`).

## Frontend UI patterns

- Quasar UI components are used across the app.
- The code follows a feature-based organization: pages, components, and store modules are grouped by feature (e.g., PBX, call features, phonebook).
- Reusable components and dialogs live in `src/components/`.

## Deployment and environment

- The app is built with Quasar using the Webpack-based CLI (the project depends on `@quasar/app-webpack`), running the `quasar build` script (`npm run build` / `yarn build`) produces a production bundle.
- Runtime configuration for backend endpoints (HTTP + WebSocket) is provided by `src/config/app.template.js` and `src/config/app.template.root.js`. These templates are used and can be manipulated at runtime by helper scripts such as `bin/config-create.sh` / `bin/config-create.js` and `env/run_csc_ui`.
- Docker helper artifacts exist in the repo (`env/Dockerfile`, `bin/run-docker.sh`) and there are package scripts that assist with Docker-related tasks (for example `dev:docker`, `docker:rebuild:local`, `docker:run:local` in `package.json`).

## Observability, errors and edge cases

- API errors are normalized in `src/api/common.js` and some server-side codes are translated into user-friendly messages (via `i18n`) or cause navigation changes (expired password -> change password route).
- Network interruptions in WebSocket/SIP are handled by JsSIP events (`connected`, `disconnected`, `registrationFailed`) and propagated to the store via `callEvent` handlers in `src/boot/ngcp-call.js`.
- Local storage keys are all prefixed (`csc_`) by `src/storage.js`.

## Security considerations

- Currently, JWT tokens are used for HTTP requests and stored in LocalStorage. This is convenient but exposes tokens to XSS; review needed if stronger protection is required (HttpOnly cookies, refresh tokens).
- SIP credentials (password) are passed into JsSIP configuration at runtime — ensure transport is over wss (the code uses `baseWsUrl` prefixed with `wss://`).

## Key files (quick reference)

- App entry and boots: `src/App.vue`, `src/boot/api.js`, `src/boot/ngcp-call.js`, `src/boot/i18n.js`, `src/boot/store.js`.
- API core: `src/api/common.js`, `src/api/utils.js`.
- SIP/VoIP integration: `src/api/ngcp-call.js`.
- Routing: `src/router/routes.js`.
- Store: `src/store/index.js` and modules under `src/store/`.
- Storage helpers: `src/storage.js`.
- Config templates: `src/config/app.template.js`, `src/config/app.template.root.js`.
