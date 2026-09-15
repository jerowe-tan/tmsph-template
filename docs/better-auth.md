# Better Auth evaluation and integration plan

Why Better Auth entered the picture, what it covers, and how it would fit
this project (Next.js frontend, NestJS backend, TypeORM/Postgres,
mobile clients). Status: **evaluation — Auth0 remains wired until a spike
proves this out.** Nothing here is implemented yet.

Auth0 context this builds on: `docs/auth0-client.md`,
`docs/auth0-customization.md`. Deployment/secrets context:
`docs/gcloud-cloudrun.md`, `docs/gcloud-secrets.md`, `docs/docker-image.md`.

## 1. Why Better Auth (vs Auth0)

Auth0 is a managed *service*: login happens on its hosted Universal Login
page, and our `/login` can only ever be a branded front door (see the
Auth0 docs for the redirect model and ACUL limits). Better Auth is a
TypeScript *library*: our own `LoginForm`/`RegisterForm` call
`signIn.email()` / `signUp.email()` directly — the "plug auth behind our
form" shape Auth0 can't do.

| Auth0 (service) | Better Auth (library) |
|---|---|
| Users/sessions/credentials in Auth0's cloud | In **your** Postgres (four core tables + plugin tables) |
| MFA, anomaly/bot detection, breach monitoring included | MFA/passkeys are plugins; anomaly/bot detection is **yours to build** (rate-limit plugin + discipline) |
| Verification/reset emails handled | You wire `sendVerificationEmail` / `sendResetPassword` to Postmark/SES |
| Per-MAU pricing, SOC2 inherited | MIT-licensed, infra cost only; **you** own the audit burden |

Choose Better Auth for full UI ownership and zero per-user cost; keep
Auth0 if managed protections and zero auth-ops matter more. Either/or —
the two session models don't mix.

## 2. Capabilities (beyond signup/login/logout)

Plugin catalog, one line each. Enablement = import + `plugins: [...]` +
schema generate. Recommended order for us: phase 1 (email/password +
verification + reset, `jwt`), phase 2 (phone OTP for mobile, passkeys),
phase 3 (`organization` + `sso`/Entra when B2B appears), ops maturity
(`admin`, rate limits, breached-password screening).

- **Sign-in methods:** `magicLink`, `emailOTP`, `phoneNumber` (native-idiomatic
  mobile), `passkey`/WebAuthn (phishing-proof, best UX on modern devices),
  `username`, `anonymous` (guest → convertible, funnel-friendly),
  `genericOAuth` + social providers (Google/Apple/Microsoft/… — **Entra ID
  corporate login lands here**), `sso` (SAML/OIDC, dealer/fleet story),
  `oneTap`.
- **Authorization/management:** `organization` (multi-tenant orgs, roles,
  teams, invitations, per-org sessions — fleet/dealer-company accounts),
  `admin` (user management, bans, impersonation — ops console backing),
  `apiKeys` (scoped machine credentials — telematics/partner ingestion).
- **Tokens/sessions:** `jwt` (stateless signed tokens + JWKS — **required**
  for any non-TS verifier), `multiSession` (account switcher on shared
  devices), `lastLoginMethod`, `bearer`.
- **Lifecycle/security:** email verification, password reset/change-email/
  delete-user, `twoFactor` (TOTP/SMS/backup codes, trusted devices —
  staff accounts, financing step-up), `captcha`, breached-password
  screening, rate limiting, `scim` (directory provisioning at scale).
- **Extension points:** endpoint hooks, middleware, custom endpoints,
  `additionalFields`, database hooks (`user.create.after` =
  profile-row creation, welcome email).

## 3. Client library: optional by design

Every capability exists twice: as REST endpoints on
`/api/auth/[...all]` (+ `auth.api.*` server calls) and as the
`createAuthClient` typed wrapper with reactive session state. A
Server-Action-only app, a script, or a non-TS caller can skip the client
entirely and speak HTTP.

- Keep the client for browser-interactive code (types + `useSession()`).
- Skip it for servers, scripts, and simple mobile flows.
- Treat it as **mandatory where passkeys are used** — the client wraps the
  multi-round WebAuthn ceremony (SimpleWebAuthn); hand-rolling that from
  raw endpoints is painful and easy to get subtly wrong.

## 4. Placement: Better Auth lives in NestJS, Next.js stays presentational

NestJS (TypeScript, Express-compatible) owns `betterAuth({...})`, the
database, and all plugins, mounted at `/api/auth/*`. Next.js keeps the UI
components and session-aware rendering only — no auth decisions.

```
POST /auth/register   → shared by ALL clients (one user-creation path, ever)
POST /auth/login      → web only: verifies credentials, sets HttpOnly session cookie
POST /auth/token      → mobile/services only: same check, returns JWT pair (never cookies)
POST /auth/refresh    → rotates the pair (old refresh dies; reuse = theft signal)
POST /auth/logout     → revokes (session destroy + refresh-family kill)
```

Next.js integration points: forms POST to these endpoints (direct or via
thin Next routes), Server Components validate by asking NestJS, `proxy.ts`
becomes a "does NestJS see a valid session?" gate redirecting to `/login`
on no. If the whole spec ever shrinks to "verify password, sign JWT,"
that's ~50 lines of `bcrypt` + `jsonwebtoken` and Better Auth should be
dropped — it earns its keep via MFA/passkeys/social/orgs/reset emails.

## 5. Tokens: cookies for web, bearer JWTs for mobile

- **Web:** HttpOnly session cookies, DB-backed, instantly revocable. Default.
- **Mobile/services:** JWT access (short, e.g. 15 min) + rotating refresh
  (days–weeks), `aud`-separated per client class (a mobile token is never
  valid on admin APIs).
- **Where Next.js keeps tokens (if it holds any):** BFF pattern recommended
  — tokens in httpOnly cookies via Next route handlers, browser never
  touches them. `localStorage` is simplest but XSS-readable; JS memory is
  safest but dies on reload.
- **Rotation invariant:** pair in, pair out, old refresh dead. Exactly one
  live refresh token per family — a dead one's reappearance can only mean
  copying (theft detector for free).
- **Mobile client contract:** `TOKEN_EXPIRED` 401 → single-flight refresh
  (concurrent 401s share one refresh call) → retry original once →
  any further failure wipes tokens → login screen. Never refresh on
  `INVALID_CREDENTIALS`/`TOKEN_INVALID`/403. Full endpoint map (register →
  token → calls → refresh → logout → forced logout) is approved in planning;
  see the conversation record before implementing.
- **Revocation caveat:** stateless JWTs can't be individually killed before
  expiry without a denylist — short TTLs + rotation keep the window small;
  instant-revocation requirements (bans, theft) need the denylist (sessions
  with extra steps).

## 6. Topology: subdomains, mirrored locally

```
https://frontend.example.com  → Next.js
https://api.example.com       → NestJS (+ Better Auth + Postgres)
```

- Cookies: `Domain=.example.com`, `HttpOnly`, `Secure` (HTTPS-only envs),
  `SameSite=Lax` (same-site subdomains ride along on API XHR — no
  `None` gymnastics).
- CORS: exact-origin allow-list
  (`Access-Control-Allow-Origin: https://frontend.example.com`, never `*`)
  + `Allow-Credentials`, client sends `credentials: "include"`.
- **Local parity via Compose:** `app.test` → Next.js :3000,
  `api.app.test` → NestJS :3001 (hosts entries → 127.0.0.1), Caddy front
  door with two hostname blocks, `frontend` + `api` + `postgres` (+ optional
  Redis for secondary storage) on one network, service-name routing.
  Plain HTTP + non-Secure cookies locally is acceptable; staging is the
  first HTTPS gate.
- All of §5–§6 aligns with OWASP (Session Management, REST Security/CORS,
  CSRF Prevention, Transport Layer Protection cheat sheets); the BFF
  custody is defense-in-depth layering (XSS impact reduction) on top.

## 7. Dual-lane gateway (the hinge)

One verifier, two credential lanes — the industry-standard shape (Auth0's
own SPA-vs-native split, GitHub/Google web-vs-token tracks, the BFF
best practice):

```
request in
  ├─ Authorization: Bearer present? → JWT lane (signature + expiry + aud → attach user)
  └─ else → session lane (cookie session via NestJS/shared store → attach user)
  └─ neither valid → 401 (web → login page, mobile → refresh-or-login)
```

Bearer wins when both present (explicit beats ambient); each lane fails
closed; the gateway never issues (issuance stays in `/auth/*`).

## 8. Data: two databases, both with a `user` table

```text
auth_db.user.id  ────string copy────▶  app_db.user.identityId   (unique, indexed)
                                      app_db.user.id            (the app's own PK)
```

- **Auth DB** (Better Auth, CLI-managed): `user` (id, name, email unique,
  emailVerified, image, timestamps), `session` (token unique, expiresAt,
  ipAddress, userAgent, userId FK, + activeOrganizationId with orgs),
  `account` (one row per method — identity is the (`providerId`,
  `accountId`) pair; `credential` rows hold the hash, default scrypt,
  Argon2 swappable), `verification` (tokens/OTPs), plus per-plugin tables
  (`passkey`, `organization`/`member`/`invitation`, `apikey`, `jwks`…).
- **App DB** (product, own migrations): `user` + `profile` + domain tables.
  Same table name is fine — databases disambiguate; never import both
  unqualified in one file (gateway aliases `authUser`/`appUser`).
- The cross-DB pointer is exactly one column (`identityId`, never `userId`
  — that name would read as the row's own id). Product tables FK to
  `app_db.user.id` normally; the no-FK tax is quarantined to the pointer.
- **Creation saga:** auth creates identity → `user.create.after` hook
  creates the app row (idempotent, retried) → login tolerates
  "identity exists, app row missing" via the lazy path. No silent orphans.
- **Deletion:** `user.delete.before/after` orchestrates fan-out (no cross-DB
  cascade exists) — one call orchestrates everything for GDPR.
- **Reads:** gateway attaches `{ authUser }`; features fetch app rows by
  `identityId` where they render — never in hot loops.

## 9. Schema workflow (TypeORM, NestJS)

1. **Configure:** TypeORM `DataSource` (standard `TypeOrmModule.forRoot`
   or standalone; must initialize before first auth request —
   `onModuleInit`/async provider) wrapped by a TypeORM adapter
   (`typeormAdapter(dataSource, { provider: "postgres" })` — community
   package; no first-party adapter exists) into `database:`.
   Evaluate candidates on: transaction support, version lag vs core,
   `additionalFields` round-trip, hook coverage.
2. **Declare:** `additionalFields` (auth-driving flags only: `role`,
   `kycStatus`, `input: false` server-owned) + plugins in config. Product
   fields (birthday, phone) live in app entities, **not** here.
3. **Generate, don't hand-type:** adapter/CLI emits entities + migrations
   from config (core four + extensions). Review, commit, evolve manually
   after — generation is scaffolding, not an ongoing dependency.
4. **Migrate through TypeORM CLI** (`synchronize: false` above local dev),
   reviewed and CI-applied like any backend migration.
5. **Evolve:** new optional field = nullable column, zero-downtime, no
   backfill. `required: false` → `NULL`able; `required: true` → `NOT NULL`
   (flipping later needs backfill first). `defaultValue` applies at the JS
   layer only — no DB default is created.
6. **Field taxonomy per column** (record per field at plan time):
   home (auth-table vs profile-table) × registration (required vs
   optional) × gate (none vs feature). E.g. birthday =
   (profile, optional, gated-by-regulated-features); the gate lives in the
   feature/gateway, never in auth.
7. **Names:** `modelName`/`fields` map canonical → yours; TS keeps canonical
   names. Startup schema validation (default on) announces drift via logs —
   treat its warnings as CI failures.

## 10. Open decisions (blocking the build plan)

1. **.polyglot strictness:** "no TypeScript anywhere" kills Better Auth
   outright (alternatives: Keycloak, Ory, staying on Auth0). "TS auth
   service + polyglot consumers" keeps it with the JWT plugin as bridge.
2. **Token custody for Next.js:** BFF (recommended) vs bearer-in-browser.
3. **MFA/social/passkeys scope:** in-scope (Better Auth justified) vs
   genuinely out (consider the ~50-line custom NestJS version instead).
4. **Register-returns-tokens:** convenience vs surface; access TTL
   (proposed 15 min); push-triggered revocation vs fail-on-next-refresh.
5. **Local names:** `app.test`/`api.app.test` or Toyota-flavored.
6. **Compliance:** any residency/audit pressure forcing physical DB
   separation beyond the two-database split (currently single cluster
   assumed).

## 11. Common setups (pick one)

Three standard topologies, same Better Auth core. They differ only in
*where the `betterAuth({...})` instance lives* and *what credential each
client carries*.

### A. Next.js-only app (monolith)

```text
Browser ⇄ Next.js (Better Auth mounted at /api/auth/* + pages + DB)
```

- Auth instance lives in the Next.js app (`lib/auth.ts`), database reached
  directly (same VPC/proxy rules as any server code).
- Browser uses session cookies; Server Components call `auth.api.*`
  directly (no HTTP hop) with the `nextCookies()` plugin last.
- Route gating in `proxy.ts`: cheap cookie-presence check at the edge,
  full `getSession()` re-verification inside every Server Component,
  Route Handler, and Server Action that touches user data (matchers don't
  cover Server Actions — each one checks itself).
- Best for: single-team products, MVPs, everything behind one deploy.
- Limit: any non-TS consumer (mobile native SDK expectations, Go/Python
  services) talks raw REST with no typed client; fine, just less ergonomic.

### B. Separate backend + frontend (ours)

```text
Browser ⇄ Next.js (UI only) ⇄ NestJS (Better Auth + DB)
```

- Auth instance lives in NestJS; Next.js holds no auth logic — forms POST
  to `/auth/*`, Server Components validate by asking NestJS, `proxy.ts`
  gates on NestJS's answer. This is §4.
- Cookies need the subdomain contract (§6: `Domain=.example.com`,
  `SameSite=Lax`, exact-origin CORS + `credentials: "include"`).
- Best for: team split (backend owns identity), web-only or web-first
  products, when the frontend framework may change without touching auth.
- Cost vs A: one network hop per session check (mitigate with short cookie
  cache or the JWT plugin) plus the cookie-domain discipline.

### C. Backend + other services (mobile, partner APIs, jobs)

```text
Mobile / services ⇄ NestJS (Better Auth + DB)   [JWT pair / API keys]
Browser          ⇄ Next.js ⇄ NestJS              [session cookie]
```

- Same NestJS authority as B, plus token issuance for non-browser callers:
  `POST /auth/token` (login → JWT pair), `POST /auth/refresh` (rotation),
  `apikey` plugin for service-to-service.
- Mobile stores in Keychain/Keystore, short access TTL + rotating refresh
  (§5); services use scoped API keys, never user sessions.
- Best for: us — web + mobile + (later) telematics/partner ingestion off
  one identity, one `user.id` everywhere.
- Cost vs B: token lifecycle ops (rotation, reuse detection, denylist for
  instant revocation) and per-client-class `aud` enforcement.

Rule: start at A only if no second client will ever exist; we have mobile
on the roadmap, so **B now, C as the token layer lands** — same NestJS
instance grows from B to C without re-architecting.

## 12. Endpoint list (all clients)

Base `https://api.example.com` (`http://api.app.test` local). Bodies JSON.
Error bodies always carry a stable `code` (never bare messages), so clients
can branch: refresh only on `TOKEN_EXPIRED`, never on credential/permission
failures.

| Method + path | Caller | Request | Success | Notable failures |
|---|---|---|---|---|
| `POST /auth/register` | All (once per user) | `{ name, email, password, …extra }` | `201 { user }` + first token pair (mobile) or session cookie (web) | `409 EMAIL_TAKEN`, `422 WEAK_PASSWORD` |
| `POST /auth/login` | Web only | `{ email, password }` | Session cookie set, `200 { user }` | `401 INVALID_CREDENTIALS` (no refresh) |
| `POST /auth/token` | Mobile/services | `{ email, password }` | `200 { accessToken, refreshToken, expiresIn }` | `401 INVALID_CREDENTIALS` (no refresh) |
| `GET /api/…` + `Authorization: Bearer` | Mobile/services | — | `200 …` | `401 TOKEN_EXPIRED` → refresh; `TOKEN_INVALID` → logout; `403 FORBIDDEN` → permission UI |
| `POST /auth/refresh` | Mobile/services | `{ refreshToken }` | `200` new pair, old refresh dead | `REFRESH_EXPIRED`/`REFRESH_REUSED`/`REVOKED` → wipe + login screen |
| `POST /auth/logout` | All | Cookie or `{ refreshToken }` | Session destroyed + refresh family killed | Client wipes local state regardless |
| `POST /auth/request-password-reset` | All | `{ email }` | `200` (uniform even for unknown emails — no enumeration) | — |
| `POST /auth/reset-password` | All | `{ token, newPassword }` | `200`, other sessions optionally revoked | `INVALID_TOKEN` |
| `POST /auth/send-verification-email` | All | `{ email }` | `200` | Rate-limited |
| `GET /auth/session` (or NestJS equivalent) | Next.js SSR, services | Cookie / token | `200 { user, session }` | `401` → treat as signed out |

Client contracts: single-flight concurrent refreshes through one call;
retry the original request once, then stop; `REFRESH_REUSED` additionally
flags suspected theft server-side (kill family, force re-login).

## 13. Schema list (tables + columns)

Source: [Database concepts](https://better-auth.com/docs/concepts/database)
(core schema, custom tables, `additionalFields`, ID generation, hooks,
plugin schemas). Generated, never hand-written
(`npx @better-auth/cli generate` / `migrate`, or the TypeORM adapter's
generation → review → commit). Types below are TypeScript as documented;
map to DB-native types per adapter. Startup validation announces drift via
logs (treat as CI failure).

**Core (always).** Full definitions:
[`#user`](https://better-auth.com/docs/concepts/database#user),
[`#session`](https://better-auth.com/docs/concepts/database#session),
[`#account`](https://better-auth.com/docs/concepts/database#account),
[`#verification`](https://better-auth.com/docs/concepts/database#verification).

`user` — one row per human; the stable key the app joins on:

| Column | Type | Constraints |
|---|---|---|
| `id` | string | PK (UUID default; `serial`/custom via `generateId`) |
| `name` | string | Display name |
| `email` | string | Unique, login + communication |
| `emailVerified` | boolean | Gate for `requireEmailVerification` flows |
| `image` | string? | Avatar URL, optional |
| `createdAt` / `updatedAt` | Date | Managed timestamps |

`session` — one row per active login; instantly revocable:

| Column | Type | Constraints |
|---|---|---|
| `id` | string | PK |
| `userId` | string | FK → `user.id` (`onDelete: cascade`), indexed |
| `token` | string | Unique — what the cookie carries |
| `expiresAt` | Date | Rolling/sliding per session config |
| `ipAddress` / `userAgent` | string? | Device signals, optional |
| `createdAt` / `updatedAt` | Date | Managed timestamps |
| (+ `activeOrganizationId`, `impersonatedBy` with org/admin plugins) | | |

`account` — one row per authentication *method* linked to a user.
Provider identity is the (`providerId`, `accountId`) pair; `id` is only
the local row key (use it when an account API asks for `accountId`):

| Column | Type | Constraints |
|---|---|---|
| `id` | string | PK (local row only) |
| `userId` | string | FK → `user.id` (`onDelete: cascade`), indexed |
| `accountId` | string | Stable id assigned by the provider (for `credential`: the user's own stable id) |
| `providerId` | string | Which configuration authenticated it (`credential`, `google`, …) |
| `accessToken` / `refreshToken` / `idToken` | string? | Provider-issued, OAuth only |
| `accessTokenExpiresAt` / `refreshTokenExpiresAt` | Date? | OAuth only |
| `scope` | string? | Granted OAuth scopes |
| `password` | string? | Hash (scrypt default, Argon2 swappable) — email/password only |
| `createdAt` / `updatedAt` | Date | Managed timestamps |

One user, many rows: password + Google + passkey can share a `userId` —
account linking for free.

`verification` — short-lived tokens/codes (email verify, resets, OTPs):

| Column | Type | Constraints |
|---|---|---|
| `id` | string | PK |
| `identifier` | string | Request key (`email-verification:user@…`), indexed |
| `value` | string | The token/code to be verified |
| `expiresAt` | Date | — |
| `createdAt` / `updatedAt` | Date | Managed timestamps |

**Per plugin (only when enabled):** `twoFactor` → columns on `user`
(`twoFactorEnabled`, `twoFactorSecret`, `twoFactorBackupCodes`);
`passkey` → `passkey`; `organization` → `organization`, `member`,
`invitation` (+ `team`); `apiKeys` → `apikey`; `jwt`/`sso` → `jwks`,
`ssoProvider` (+ linking rows). Enable plugin → regenerate → review.

**App side (our migrations, not the CLI):** `app_db.user`
(`id` own PK + `identityId` unique pointer at `auth_db.user.id`) +
`profile` and domain tables FK'd to it. Naming: both tables called
`user`, databases disambiguate; never import both unqualified in one file.

## 14. Auth types: sessions vs access/refresh tokens

| | Session auth (cookies) | Access + refresh tokens (bearer) |
|---|---|---|
| What the client holds | Opaque session token in HttpOnly cookie | Short JWT (minutes) + rotating refresh (days–weeks) |
| Server state | Yes: `session` row per login — revocable instantly, inspectable | Minimal: refresh families (+ optional denylist); access verified statelessly via signature + expiry + `aud` |
| Transport | Auto-sent; needs `Domain`/`SameSite`/CORS discipline (§6) + CSRF posture on mutations | Manual `Authorization` header; no CSRF (not auto-sent); bearer must be guarded against XSS (secure storage / BFF custody) |
| Best for | Browsers (our Next.js) | Mobile, foreign-language backends, partner APIs, jobs |
| Revocation | Delete row → immediate | Refresh family kill (+ denylist window for access TTL); pure-stateless = wait out expiry |
| Refresh story | Rolling extension / sliding expiry server-side | Explicit `POST /auth/refresh` rotation: pair in, pair out, old refresh dead; reuse = theft |
| Failure mode | Stolen cookie usable until expiry/revocation (mitigate: `Secure`, short TTL, IP/UA binding signals) | Stolen access: minutes of use; stolen refresh: single use before reuse detection burns the family |

They compose, not compete: our plan runs **sessions for web (§4B) and
tokens for mobile/services (§4C)** off the same NestJS authority and the
same `user.id`, verified by the dual-lane gateway (§7). Pick per caller,
never per ideology.

## Source provenance

- Better Auth docs (verified live where cited): database/concepts
  (`/docs/concepts/database` — core schema, `additionalFields`,
  ID generation, hooks, plugin schemas, secondary storage), custom
  adapter guide (`/docs/guides/create-a-db-adapter` —
  `createAdapterFactory` contract), email-password, plugins catalog.
- Community TypeORM adapters evaluated at plan time (model-map and
  generation styles both exist; pin choice in the build plan).
- Prior decisions in-repo: Auth0 evaluation (`docs/auth0-client.md`,
  `docs/auth0-customization.md`), deployment (`docs/gcloud-cloudrun.md`,
  `docs/gcloud-secrets.md`, `docs/docker-image.md`), brand
  (`docs/toyota-brand.md`), components (`docs/components.md`).
