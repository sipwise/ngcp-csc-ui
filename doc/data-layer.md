# Data Layer Design and Implementation

This document describes the data-layer used in ngcp-csc-ui. It explains the responsibilities, contracts, patterns. Use this doc when adding new APIs, handling pagination, caching, or wiring data into Vuex.

## Key files

- `src/api/common.js` — main HTTP client and helpers (axios instance `httpApi`, `getList`, `get`, `post`, `put`, `patch`, `del`, `apiGet`, `apiPost`).
- `src/helpers/http-error.js` — `: getHttpErrorMessage(err, fallbackMessage)`, the single shared helper that turns an axios error into a user-facing message. Used by `common.js`, `src/api/user.js`, `src/helpers/ui.js`, and `src/store/user.js`.
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

2. Error transformation (central): The place for mapping server responses to application errors is `handleResponseError(err)` in `common.js`. It handles three situations, depending on what the axios error actually contains:

   **1. A structured error body is present** (`err.response.data` has `code`/`message`) — two messages get translated first (`code === 403 && message === 'Invalid license'` → a friendlier i18n string; `code === 403 && message === 'Password expired'` → sets an i18n message and does `this.$router?.push({ path: PATH_CHANGE_PASSWORD })`, then returns *without throwing*, since there's nothing further to do). Everything else becomes `throw new ApiResponseError(code, message)` (the class carries `code`, `status`, `message`).

   **2. A response exists but there's no structured `{ code, message }`** — this is the nginx-rendered case: a 502/503/504 comes back as an HTML error page instead of JSON, or the body is a plain string or empty. There's no `code`/`message` to build an `ApiResponseError` from here, so instead `err.message` is rewritten in place via `getHttpErrorMessage(err, fallbackMessage)`, and the *same* `err` object is rethrown — not wrapped in a new error type. Rethrowing the original object (rather than constructing a fresh error) matters because some callers read other fields off it directly, e.g. `src/store/user.js`'s `getOTPSecret` reads `err.response.data` (a Blob) directly via `parseErrorPayload`/`resolveBlobPayload` (`src/helpers/parse-error-payload.js`), and a replacement error without `.response` would break that.

   **3. No response at all** (network failure, request never reached the server) — rethrow the original `err` untouched; there's nothing to transform.

   Many domain API helpers call `handleResponseError(err)` when catching axios errors; some API wrappers return or rethrow the result so callers (store actions) get the transformed error.

   #### `getHttpErrorMessage(err, fallbackMessage)` (`src/helpers/http-error.js`)

   This is the single place that turns an axios error into a user-facing string, in priority order:
   1. `err.response.data.message` — a structured JSON error body's own message, if present (checked unconditionally, even when `response.status` is missing — some mocked/edge-case responses carry a message with no status).
   2. If there's no `response.status` at all, return `fallbackMessage`.
   3. The `<title>` of an HTML error page in `err.response.data`, but only if that title starts with the actual status code — this stops an unrelated HTML page (e.g. the SPA's own fallback page) from being mistaken for the real reason phrase.
   4. `err.response.statusText`, or failing that `err.message`, or failing that a small built-in fallback for the common 5xx statuses (`STATUS_TEXT_FALLBACK`: `500`/`502`/`503`/`504`), formatted as `"<status> <text>"`.
   5. Just `"<status>"` if nothing else is available.

   Outside of that small 5xx table, there's no general status-code → reason-phrase lookup: the function only trusts signals actually present in the response, and falls back honestly rather than guessing a reason phrase for a status it hasn't seen.

   Besides `common.js`, this same helper is called directly (without any local `err.response.data?.message ||` prefix — that extraction now lives inside the helper) from:
   - `src/api/user.js` — `login`, `loginByExchangeToken`, `getPreLoginPasswordInfo`, `getUserData`, `changeExpiredPassword`.
   - `src/helpers/ui.js` — `showGlobalError`, the app-wide error notification shown for exceptions bubbling out of components/actions.
   - `src/store/user.js` — `getOTPSecret` only, as the final fallback once its own 400-specific handling (below) doesn't apply or the body fails to parse. `getOTPSecretAsText` goes through `get()`/`handleResponseError` instead, so `err.message` is already set by the time it reaches the action's `catch`.

   **Why those `user.js` functions bypass `handleResponseError`:** they call `httpApi` directly instead of `common.js`'s `get`/`post`, and build their own message with `getHttpErrorMessage` rather than funneling through `handleResponseError`. This isn't incidental — going through `handleResponseError` would break them. `store/user.js`'s `login` action branches on the *exact, untranslated* backend message (`'Invalid OTP'` opens the two-factor flow, `'Password expired'` redirects to the change-password page, `'Banned'` shows a dedicated notice). `handleResponseError` rewrites `'Password expired'` into a translated string and redirects *and returns without throwing at all* — so if `login()` went through it, a password-expired response wouldn't surface as an error at all; the promise would resolve with `undefined` and the login action would never see the case it needs to react to. `changeExpiredPassword` has a similar reason: it needs to tell a `401` (wrong current password) apart from a `422` (new password fails policy) and show a distinct message for each, which it can only do by inspecting the raw status itself. `loginByExchangeToken` and `getPreLoginPasswordInfo` run before there's a session to speak of, for the same category of reason. `getUserData` is simpler — it just fans out several already-`common.js`-backed calls via `Promise.all` and wraps whatever throws in one consistent plain `Error`, so the login action always gets the same shape back regardless of which sub-call failed.

#### OTP / 2FA login flow (`src/store/user.js`)

An `'Invalid OTP'` error from `login()` is ambiguous by itself — it can mean "this account needs a code, and we don't yet know if that's first-time setup or a repeat entry". That distinction lives in `state.loginWaitingOTPCode`, which the `login` action snapshots into a local `wasWaitingForOTP` **before** calling `commit('loginRequesting')`, so it reflects the state as it was when the user submitted, regardless of whether this particular submission happened to include an `otp` value (a resubmit with a blank/wrong code looks identical to a fresh attempt from the payload alone):

- `wasWaitingForOTP` false: first attempt this session; dispatch `getOTPSecret` to find out whether the account needs first-time setup (server returns a QR-code PNG blob) or already has 2FA configured (`400` with a `'no OTP'` message → prompt for a code only, no new secret).
- `wasWaitingForOTP` true: we already know a code is required; any further `'Invalid OTP'` — including a resubmit with a blank or wrong code — surfaces directly as `loginFailed('Invalid OTP Code')` instead of re-running discovery.

`getOTPSecret`'s own `catch` mirrors this: a `400` status means the account already has 2FA, so it parses the body with `parseErrorPayload` and only commits `loginWaitingForOTPCode` (prompt for a code, no QR) when the message includes `'no OTP'` **and** we're not already waiting — any other message is a real failure (`loginFailed`). Any other status, or a body that fails to parse, falls through to `resolveBlobPayload` + `getHttpErrorMessage` for a real message instead of a blind `'Unexpected error'`.

`loginWaitingOTPCode` and `OTPSecret` are only ever reset by mutations representing an actual terminal outcome — `loginSucceeded`, `logout`, and (for `OTPSecret` only) `loginWaitingForOTPCode` once the account is confirmed to already have 2FA set up. `loginRequesting` and `loginFailed` deliberately leave both alone: resetting them there previously made a blank/wrong-code retry loop back into the discovery flow instead of showing `'Invalid OTP Code'`, and wiped the just-fetched QR secret out from under the user before they'd finished scanning it.

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
- `handleResponseError` mutates and rethrows the *original* error object rather than replacing it, specifically so that `.response`/`.response.data` survive for callers that read the raw response body (see the OTP blob-parsing note above). Don't change this back to constructing a new error type without auditing those callers first.

#### Open gap: other direct `httpApi.*` call sites still need review

The `user.js` bypasses above are deliberate and justified (see explanation above). That is **not** true of the rest of the codebase — a number of domain wrappers and a couple of store actions call `httpApi.get/post/put/patch/delete` directly instead of going through `common.js`'s `get`/`post`/`put`/`patch`/`del`, with no equivalent replacement for what `handleResponseError` gives you. As of this writing that includes at least `src/api/subscriber.js`, `src/api/call-blocking.js`, `src/api/conversations.js`, `src/api/pbx-auto-attendants.js`, `src/api/pbx-config.js`, `src/api/pbx-devices.js`, `src/api/pbx-soundsets.js`, `src/api/reminder.js`, `src/api/speed-dial.js`, `src/store/call-recordings.js`, and a few actions in `src/store/user.js` (`removeSubscriberRegistration`, `removeCustomerPhonebook`, `getPhonebookCustomerDetails`).

Unlike the `user.js` login/OTP cases, there's no known reason for most of these to bypass `common.js` — they mostly just `reject(err)`/rethrow the raw axios error, so on failure `err.message` ends up being axios's generic `"Request failed with status code 404"` instead of anything from `getHttpErrorMessage`, and an nginx HTML error page or a network failure gets no special handling at all. A few (e.g. `subscriber.js`'s `createSubscriber`/`deleteSubscriber`) hand-roll their own partial version of the structured-error branch (`err.response.data.message`) without the HTML/network fallbacks. This hasn't been audited call-site by call-site — treat it as a known inconsistency rather than an intentional pattern, and don't copy it into new code.

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
