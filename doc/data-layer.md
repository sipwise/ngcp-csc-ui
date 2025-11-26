# Data Layer Design and Implementation

This document describes the data-layer used in ngcp-csc-ui. It explains the responsibilities, contracts, patterns. Use this doc when adding new APIs, handling pagination, caching, or wiring data into Vuex.

## Key files

- `src/api/common.js` — main HTTP client and helpers (axios instance `httpApi`, `getList`, `get`, `post`, `put`, `patch`, `del`, `apiGet`, `apiPost`).
- `src/api/utils.js` — minor helpers such as `getJsonBody`.
- `src/api/*` — domain wrappers that call `src/api/common.js` helpers (e.g., `src/api/communication.js`, `src/api/fax.js`, `src/api/ngcp-call.js` for SIP control).
- `src/store/` — Vuex modules that consume API functions and convert responses to application state.
- `src/storage.js` and `src/auth.js` — storage and JWT helpers used by `src/api/common.js`.

## API contract and conventions

- Function inputs: option objects use these common fields: `path`, `resource`, `resourceId`, `params`, `body`, `headers`, `blob`, `responseType`, and `config`.
- For convenience, providing `resource`/`resourceId` automatically maps the path to `api/<resource>/` or `api/<resource>/<resourceId>`.
- Functions return either:
  - A parsed entity (from JSON body),
  - A generated id (when server responds with `Location` header but no body),
  - A URL object for blobs (when `blob === true`).
- Error semantics: `ApiResponseError` is thrown when server returns structured `{ code, message }`. Otherwise axios/network errors are rethrown.

## Error Handling

Error handling is centralized for HTTP in `common.js` (axios instance + handleResponseError + ApiResponseError), propagated into Vuex modules (actions commit failed mutations with `error.message`), and SIP/WebRTC errors surface via callEvent events handled in `ngcp-call.js` which convert SIP events into store actions/mutations.

### Responsibilities by layer

#### HTTP / API:
`common.js` — http client (httpApi), ApiResponseError class, initAPI, request interceptor, handleResponseError, and API helpers (get, post, getList, apiGet, apiPost, cancel helpers).
`utils.js` — getJsonBody used when parsing bodies.
domain wrappers: `src/api/*.js` (e.g., `src/api/communication.js::createFax`) — call the above helpers and rely on errors thrown/propagated by `common.js`.

**Behaviour**

1. Request setup: `initAPI({ baseURL })` sets `httpApi.defaults.baseURL`. A request interceptor adds `Authorization` header when `hasJwt()` is true (calls `getJwt()` in `auth.js`).

2. Error transformation (central): The place for mapping server responses to application errors is `handleResponseError(err)` in `common.js`.
    What does it do?
    Extract code and message from err.response.data (if present).

   SCENARIO 1 - Error is present:
   - *Special cases*:
```js
   code === 403 && message === 'Invalid license' → translate to user friendly i18n message.
   code === 403 && message === 'Password expired' → set i18n message and perform this.$router?.push({ path: PATH_CHANGE_PASSWORD }) (note: uses optional this which depends on calling scope).
```

   - Otherwise throws new ApiResponseError(code, message) (class includes code, status, message).

   SCENARIO 2 - Error is not present: rethrow original err.
   Many domain API helpers call `handleResponseError(err)` when catching axios errors; some API wrappers return or rethrow the result so callers (store actions) get the transformed error.

3. axios cancellation detection

`apiCreateCancelObject()` produces a CancelToken source; `apiIsCanceledRequest(exception)` uses `axios.isCancel(exception)`. Domain/store code can use that to ignore canceled requests.

4. Return shapes on success vs error
**Success**: parsed JSON (via getJsonBody and normalizeEntity) or blob/url, or identifier from Location header.
**Error**: either `ApiResponseError` (structured) or axios/network error.

#### Vuex / UI:
`src/store/*` modules — follow a request/mutation pattern; on error they commit `*Failed` and often pass `err.message` to store state/getters (example: `fax.js`).

Pattern:
1. commit `*Requesting`
2. call API helper (e.g., createFax)
3. on error: commit `*Failed` passing `err.message` often used by getter to provide i18n fallback text

Example: fax.js (excerpt)
- action `createFax` commits `createFaxRequesting()`,
- then calls `createFax(...)`
- On catch, commits `createFaxFailed(err.message)`.
- Getter `createFaxError` returns either `state.createFaxError` or fallback i18n string.


#### SIP:
`ngcp-call.js` — JsSIP UA, emits events on error/failed/ended/ice errors via `callEvent`.
`ngcp-call.js` — listens to `callEvent` and maps events to store commits/dispatches (e.g., `callFailed()` maps some events to `store.dispatch('call/end', { cause })`).

Pattern: SIP errors are mapped to store actions which update UI state (call ended/failed).

`ngcp-call.js` uses JsSIP and emits events via callEvent
`ngcp-call.js` sets up high-level handlers like:

```js
callEvent.on('connected', ...) → store.commit('call/enableCall')
callEvent.on('disconnected', ({ error, code }) => { store.commit('call/disableCall', { error: errorMessage }) })
callEvent.on('outgoingFailed', callFailed) and callFailed extracts cause and does store.dispatch('call/end', { cause })
```

#### Special behavior & notable code decisions

- Password expiry: `handleResponseError` code inspects `code === 403` and `message === 'Password expired'` and redirects to change-password. This is done inside `handleResponseError` with `this.$router?.push(...)`. That coupling is somewhat fragile because `handleResponseError` is a plain function and this depends on invocation context, maybe we should refactor to use a response interceptor instead.
- Mapping of server error strings ('Invalid license') to i18n-friendly messages occurs inside `handleResponseError`.
- Many store modules expect `err.message` to be a user-friendly string (they often pass it directly to `createXFailed` mutations), so how `handleResponseError` sets message is important.


#### Storage & Auth:
`auth.js`, `storage.js` — used to attach Authorization header; errors from auth or expired password are handled in `handleResponseError` (see redirect behavior).

## Patterns for Vuex modules

1. Single responsibility: modules should only know how to transform API results into state, and orchestrate actions/mutations for requests.
2. Action pattern:
   - commit a "requesting" mutation (sets RequestState.requesting)
   - call domain API function
   - on success, commit a "succeeded" mutation with normalized data
   - on failure, commit a "failed" mutation and surface user-friendly message from store getters

3. Example (based on `src/store/fax.js`/`src/store/*`):
   - `actions.createFax` builds options (incl. subscriber id), commits `createFaxRequesting`, calls `createFax` and commits success/failure mutations.

## Pagination and client-side lists

- Use `getList({ resource: 'resourceName', page, rows, headers, params, all })`.
- For `all === true`, `getList` will first fetch default rows, check `total_count` and re-request with a large `rows` value if necessary.
- Use the returned `{ items, lastPage, totalCount }` shape.

## Implementation guidelines (how to add a new endpoint)

1. If the endpoint is a standard REST resource (GET/POST/PUT/DELETE):
   - Add a domain API wrapper in `src/api/your-resource.js` with functions that call `get/post/put/del`.
   - Use `resource` and `resourceId` options whenever possible to benefit from path mapping.

2. If the endpoint requires special content-type (e.g., multipart or a blob):
   - Build `FormData` or set `responseType`/`blob` appropriately and call `post` or `apiGet` directly.

3. Add Vuex module changes:
   - Add a new module under `src/store/` or extend an existing one.
   - Follow the request/action/mutation pattern, and use store getters to return user-facing messages (i18n keys can be used here).

## Cancellation example

```javascript
import { apiCreateCancelObject, apiIsCanceledRequest } from 'src/api/common'

const canceler = apiCreateCancelObject()
httpApi.get('/api/resource', { cancelToken: canceler.token })
// To cancel:
canceler.cancel('user navigation')

// In error handlers:
if (apiIsCanceledRequest(err)) {
  // ignore or handle graceful cancellation
}
```

## Caching and invalidation

- The codebase currently does not implement a client-side cache layer (beyond Vuex state). For lists, the store is the cache.
