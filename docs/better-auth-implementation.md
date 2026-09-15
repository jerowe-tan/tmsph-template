# Better Auth + NestJS: implementation record

What was actually built, broken, and fixed wiring Better Auth into the
NestJS backend — not the evaluation (that's `docs/better-auth.md`), but
the work log: Fastify constraints, TypeScript/ESM fights, and the
self-managed migration pipeline. Status: auth tables live in local
Postgres; no plugins, no emails, no app-side tables yet.

## 1. Stack (pinned at implementation time)

| Piece | Version / choice | Notes |
|---|---|---|
| NestJS | 12.x (`common`, `core`, `cli`, `platform-fastify`) | Fastify adapter, not Express (see §3) |
| `better-auth` | ^1.7.4 | Core; instance built once in `src/auth.ts` |
| `@thallesp/nestjs-better-auth` | ^2.8.0 | NestJS integration: module, global guard, decorators, hooks |
| `@hedystia/better-auth-typeorm` | ^1.1.1 | TypeORM adapter (model-map style); verified curried factory `(dataSource) => (authOptions) => adapter` against its `dist/index.d.mts` |
| `typeorm` / `pg` | ^1.1.1 / ^8.23.0 | Postgres 17 (Compose, `authentication-identity-server/`) |
| `ts-node` | added as devDependency | Was missing; every `migration:*` script depends on it (`typeorm-ts-node-esm`) |
| `qs` | present | Fastify peer dep for `urlencoded: { extended: true }` |
| `@nestjs/swagger` + `@fastify/static` | present | Docs UI; Swagger assets served via fastify-static |

## 2. File map (what lives where)

```text
src/
  auth.ts                        # builds + exports const auth (betterAuth instance)
  app.module.ts                  # DatabaseModule, IdentityModule, BetterAuthModule
  main.ts                        # FastifyAdapter + bodyParser:false + (swagger wiring, in progress)
  lib/
    better-auth.ts               # BetterAuthModule = AuthModule.forRoot({ auth, bodyParser }) — module kept thin
    swagger.ts                   # configSwagger(app: INestApplication) — adapter-agnostic on purpose
  database/
    typeorm.config.ts            # single DataSource, explicit entities, cwd-relative migrations path
    database.module.ts           # TypeOrmModule.forRoot(datasource.options), re-exported
  identity/
    identity.module.ts           # forFeature([User, Account, Session, Verification]) + re-export
    user/user.entity.ts          # auth_db user (canonical Better Auth columns)
    account/account.entity.ts    # credential/OAuth rows, FK cascade, indexed userId
    session/session.entity.ts    # token unique, FK cascade, indexed userId
    verification/verification.entity.ts  # identifier indexed, value, expiries
  migrations/
    <timestamp>-InitIdentity.ts  # the four CREATE TABLEs + indexes + FKs (+ sane down())
```

## 3. Fastify constraints (not Express assumptions)

`main.ts` runs `NestFactory.create<NestFastifyApplication>(AppModule,
new FastifyAdapter())`. Consequences, all verified against the installed
`@thallesp/nestjs-better-auth` README (`node_modules/.../README.md`):

- **Body parsing**: `bodyParser: false` in `create()` is mandatory — the
  auth module re-adds JSON/urlencoded parsers for non-auth routes itself.
  Without it, auth endpoints misbehave on raw bodies.
- **`lib/swagger.ts` types against `INestApplication`** (`@nestjs/common`),
  not `NestFastifyApplication` — both adapters satisfy it, so a future
  Express switch touches zero lib code. An unconstrained generic (`<T>`)
  was rejected for the same reason (less safe, same keystrokes).
- **Better Auth route CORS on Fastify** goes through the module's
  `trustedOrigins` handling (routes are middleware-mounted; app-level
  `@fastify/cors` alone doesn't cover them). Manage CORS in one place or
  set `disableTrustedOriginsCors` and own it fully.
- **Global guard is on**: the module registers `AuthGuard` globally, so
  *every* route (including future `/api` docs) is protected unless marked
  `@AllowAnonymous()` / `@OptionalAuth()` or the guard is disabled
  (`disableGlobalAuthGuard: true` + per-route guards). Verify the Swagger
  UI stays reachable logged-out; exempt the docs path if it 401s.

## 4. The `forRoot` shape (verified, corrected once)

`AuthModuleOptions` (installed `dist/index.d.ts`) **requires**
`auth: A` — a pre-built `betterAuth({...})` instance. Raw options are a
type error. An early sketch showed `useFactory` returning raw options;
the package source corrected it: the factory (or module scope) must call
`betterAuth()` and hand over the result. Ours builds it in `src/auth.ts`:

```ts
if (!dataSource.isInitialized) await dataSource.initialize();
export const auth = betterAuth({
  database: typeormAdapter(dataSource),  // curried factory verified in adapter-base.mjs
  emailAndPassword: { enabled: true },   // phase-1 baseline, nothing else
});
```

`lib/better-auth.ts` then wraps it as `BetterAuthModule =
AuthModule.forRoot({ auth, bodyParser })`, keeping `app.module.ts` to
three imports. Known simplification debt: **two connection pools**
(`DatabaseModule`'s `forRoot` pool + the adapter's `DataSource` pool, same
database). Works; consolidate to one shared instance later.

## 5. TypeScript/ESM fights (all in `typeorm.config.ts` / entities)

The backend is `"type": "module"` + `nodenext` — ESM rules apply everywhere:

1. **`__dirname` doesn't exist in ESM.** The config used it → crash
   (`ERR: __dirname is not defined in ES module scope`). Interim fix was
   `import.meta.dirname`; final fix removed path magic instead (below).
2. **Entity glob was blind.** `__dirname + '/**/*.entity…'` resolved to
   `src/database/**` only — the identity entities were invisible to both
   migrations *and* runtime repos. Fixed by **explicit entity imports**
   (`[User, Account, Session, Verification]`), which also behave
   identically under ts-node, compiled `dist`, and every OS. A commented
   glob alternative stays in the config, marked non-preferred (cwd-relative
   globs break from `dist/` and foreign cwds).
3. **Circular-import TDZ crash** (`Cannot access 'User' before
   initialization`): bidirectional `User ↔ Account/Session` relations +
   `emitDecoratorMetadata` evaluate the referenced class at definition
   time under ESM. Fixed by keeping **owning-side-only relations**
   (`ManyToOne` with `onDelete: 'CASCADE'` on Account/Session; no
   `OneToMany` back-refs on User). FKs and cascades land in the migration
   unchanged — nothing was lost but the cycle.

## 6. Self-managed migration pipeline

Scripts (already in `package.json`, kept as-is): `migration:create`
(empty file), `migration:generate` (diff entities → file),
`migration:run` / `revert` / `show`, `migrate` alias. Conventions:

- **Generate, review, run.** The `InitIdentity` output was read line by
  line before execution (four tables, unique/indexes, FK cascades, sane
  `down()`). Nothing applies unreviewed — ever.
- **Migrations live in `src/migrations/`** (moved out of
  `src/database/`), path cwd-relative (`src/migrations/*.{js,ts}`) with a
  comment explaining why that's safe (CLI/CI always run from the package
  root, never from `dist`).
- **`synchronize: false` always** (outside local scratch); `migrationsRun:
  false` — CI runs migrations as a pre-deploy step, never app boot.
- **Ledger-backed safety:** `migration:run` applies only pending files
  (tracked in the `migrations` table) — replays are no-ops, fresh DBs get
  full history, data is never in the blast radius of a normal deploy.

## 7. Database reality (local)

Compose Postgres 17 (`authentication-identity-server/compose.yaml`),
localhost-only port, `pgdata` volume. Two gotchas hit for real:

- **`POSTGRES_DB` is first-boot-only.** Renaming `tmsph_identity` →
  `tmsph` in compose did nothing until `down -v` + `up` re-ran init.
  Config and reality diverge silently here — verify with a database list,
  not the file.
- **Current state (verified):** databases `postgres` + `tmsph`; `tmsph`
  holds `user`, `account`, `session`, `verification` + `migrations`
  ledger with `InitIdentity`. Zero product tables yet.

## 8. Verification record

- `nest build` clean (after each change set).
- `oxlint`: 0 warnings, 0 errors.
- `migration:generate` output byte-compared sane across the glob →
  explicit-entity switch (same DDL, fresh timestamp) — proof the new
  resolution finds exactly what the old one did.
- Live DB probes: table list + ledger row, read-only, after every
  migration run.

## 9. Deliberately not done (next steps, in order)

1. `betterAuth` options beyond baseline: verification/reset emails
   (needs sender), `jwt` plugin (mobile lane), `twoFactor`/`passkey`/
   `organization` per phase plan.
2. App-side tables (`app.user` + `identityId`, `profile`) + creation saga
   (`user.create.after` hook) — see `docs/better-auth.md` §8–§9.
3. Second connection (`auth`/`app` split) if the two-database decision
   lands; until then the single unnamed connection stands.
4. Swagger docs route vs global guard: boot, curl logged-out, exempt if
   401 (see §3).
5. Pool consolidation (single shared `DataSource`, §4 debt).
6. `.env.example` for the backend (shape documented, values never).

## Source provenance

- Installed sources read directly (not guessed): `@thallesp/nestjs-better-auth`
  README + `dist/index.d.ts` (`forRoot`/`forRootAsync` contract, global
  guard, bodyParser, decorators); `@hedystia/better-auth-typeorm`
  `dist/index.d.mts` (curried factory); `better-auth/dist/db/adapter-base.mjs`
  (function-valued `database` support).
- Better Auth docs: [database concepts](https://better-auth.com/docs/concepts/database)
  (core schema column lists transcribed into `docs/better-auth.md` §13),
  custom adapter guide.
- Plan + evaluation: `docs/better-auth.md` (topology, tokens, gateway,
  data split, field taxonomy, open decisions).
- Local runbook: `authentication-identity-server/compose.yaml`,
  backend `package.json` migration scripts.
