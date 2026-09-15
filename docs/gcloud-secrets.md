# gcloud secrets (Secret Manager)

Where this app's Auth0 credentials live once they leave your laptop: Google
Secret Manager, bound to Cloud Run at boot. Plain config (`APP_BASE_URL`,
`AUTH0_DOMAIN`, `AUTH0_CLIENT_ID`) travels as `--set-env-vars`; anything
that must never leak (`AUTH0_CLIENT_SECRET`, `AUTH0_SECRET`) travels as
`--set-secrets`. The frontend Dockerfile bakes in neither (see
`authentication-app-frontend/Dockerfile` and `.dockerignore`).

## 1. Storing a secret, simply

The command, bare:

```bash
gcloud secrets create my-secret --data-file=-
```

It looks incomplete — and it is. `--data-file=-` means "read the value
from stdin", so something must feed it. The obvious first attempt:

```bash
echo 'the-value' | gcloud secrets create my-secret --data-file=-
```

> ⚠️ Looks right, broken subtly: the moment you hit Enter and the command
> runs, `echo` terminates its own output with a `\n` — that newline flows
> through the pipe and becomes part of the stored secret, so what lands is
> `the-value\n`, not `the-value`. Exact-match consumers (tokens, client
> secrets, hashes) then fail with errors that never mention the newline.
> This is the trap — so do this instead:

```bash
printf '%s' 'the-value' | gcloud secrets create my-secret --data-file=-
```

Same shape, one swap: `printf '%s'` emits exactly your bytes, no more.
(`%s` = "substitute a string here", and quoting the value as a slot keeps
`%` and backslashes inside it literal. `--data-file=-` means "read the
value from stdin" — `-` is the Unix convention for standard input — and
the pipe flows left to right, producer into consumer.)

There is deliberately no `gcloud secrets create NAME=data` form: CLI
arguments persist in shell history, so gcloud only accepts secret values
via stdin or file. The pipe *is* the simple version.

```bash
# Read back metadata only (names, versions — never values)
gcloud secrets describe my-secret
gcloud secrets versions list my-secret

# Rotate: same shape, lands as a new version (old ones stay for rollback)
printf '%s' 'new-value' | gcloud secrets versions add my-secret --data-file=-
```

One rule: `printf '%s'`, not `echo` — `echo` smuggles a trailing newline
into the value and exact-match secrets (tokens, client secrets) fail
silently downstream.

## 2. Storing env from your `.env`

Split first, store second. Only real secrets become Secret Manager secrets;
everything else stays plain environment.

| `.env` key | Goes to | Why |
|---|---|---|
| `AUTH0_CLIENT_SECRET` | Secret `auth0-client-secret` | OAuth credential — leaks impersonate your app |
| `AUTH0_SECRET` | Secret `auth0-secret` (fresh value per environment) | Session encryption — leaks forge logins |
| `APP_BASE_URL` | Plain `--set-env-vars` | Public URL, visible in redirects anyway |
| `AUTH0_DOMAIN` | Plain `--set-env-vars` | Appears in authorize URLs anyway |
| `AUTH0_CLIENT_ID` | Plain `--set-env-vars` | Public identifier, not a credential |

```bash
# One command per secret; run from the folder holding .env (values stay local)
printf '%s' "$(grep '^AUTH0_CLIENT_SECRET=' .env | cut -d= -f2-)" \
  | gcloud secrets create auth0-client-secret --data-file=-
printf '%s' "$(grep '^AUTH0_SECRET=' .env | cut -d= -f2-)" \
  | gcloud secrets create auth0-secret --data-file=-

# Wire everything into Cloud Run in one deploy
gcloud run deploy auth-frontend \
  --image asia-southeast1-docker.pkg.dev/PROJECT/tmsph/auth-frontend \
  --region asia-southeast1 \
  --set-env-vars=APP_BASE_URL=https://<service>.a.run.app,AUTH0_DOMAIN=<tenant>.auth0.com,AUTH0_CLIENT_ID=<id> \
  --set-secrets=AUTH0_CLIENT_SECRET=auth0-client-secret:latest,AUTH0_SECRET=auth0-secret:latest
```

Rules:

- The `.env` file itself is never uploaded, committed, or copied into the
  image — it is read locally, line by line, and only the two secret values
  leave the machine (over TLS, into Secret Manager).
- Name secrets after the service that consumes them when they differ per
  environment (e.g. `auth-frontend-auth0-secret` vs
  `api-auth0-secret`), or keep one name and rely on separate projects per
  environment (dev/staging/prod). Pick one convention per project.
- `AUTH0_SECRET` must differ per environment — sharing one across dev and
  prod means a dev leak forges prod sessions.

## 3. Scoping: secrets belong to a project, access belongs to a resource

A secret is **not** global and **not** automatically visible. Three layers
decide who can use it:

1. **Project + location.** Secrets live in one project
   (`gcloud secrets create … --project=PROJECT`) with a replication policy
   (automatic = Google-managed regions; user-managed = pinned regions —
   keep secrets in the same region as the service, e.g.
   `asia-southeast1`). A service in another project cannot see them without
   explicit cross-project IAM.
2. **IAM: who may read.** Nobody gets values by default, not even editors.
   Grant the *least* role that works, to the *service's own identity*:
   ```bash
   # Cloud Run's runtime service account gets read-only access to one secret
   gcloud secrets add-iam-policy-binding auth0-secret \
     --member="serviceAccount:<run-sa>@PROJECT.iam.gserviceaccount.com" \
     --role="roles/secretmanager.secretAccessor"
   ```
   Humans get `viewer` (metadata) for debugging, `admin` only for the
   rotation owner. Developers do not need `accessor` just because they
   deploy — the service account does the reading at boot.
3. **Binding: which revision the resource resolves.** `--set-secrets=
   ENV_VAR_NAME=secret-name:version` mounts the secret as an env var when
   each container starts — and the two names are independent. The secret
   can be called `frontend-auth0-domain-prod` while the app reads it as
   `AUTH0_DOMAIN`; two services can even mount the *same* secret under
   *different* var names. Matching names (`AUTH0_SECRET=auth0-secret`) is
   pure convention for readability, not a requirement. `:latest` floats to
   the newest *enabled* version on every new revision/instance; pinning
   (`:3`) freezes it for rollback safety. Rotating = add a version, then
   deploy (or let `:latest` pick it up on next rollout) — the old version
   stays enabled until you disable it, so rollback is one command.

Rules of thumb:

- One secret per credential per environment — never one mega-secret holding
  a whole `.env` (rotation becomes all-or-nothing, and every consumer sees
  every value).
- If two services need the same credential, grant both service accounts
  `secretAccessor` on the one secret — don't copy the value into two
  secrets that drift.
- Audit with `gcloud secrets get-iam-policy <name>`; if a human
  `accessor` binding has no rotation duty attached, remove it.
