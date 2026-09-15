# Building the frontend Docker image

How the `authentication-app-frontend/` image is built, verified, and kept
lean. Deploying the result is covered in `docs/gcloud-cloudrun.md`; secret
handling in `docs/gcloud-secrets.md`. Run all commands from
`authentication-app-frontend/`.

## 1. Build it

```bash
docker build -t tmsph-auth-frontend .
```

That is the whole command. The `Dockerfile` (multi-stage, `node:22-alpine`)
does the rest:

| Stage | Job | Ships? |
|---|---|---|
| `base` | Shared foundation: Node 22 on Alpine | No (nickname only) |
| `deps` | `npm ci` from the lockfile — cached unless manifests change | No |
| `builder` | Copies `node_modules`, copies source, `npm run build` | No |
| `runner` | Copies only `public/`, `.next/standalone`, `.next/static`; runs as non-root `nextjs` via `node server.js` on port 3000 | **Yes — this is the image** |

Rules:

- The image carries behavior only: no `.env*` files (see `.dockerignore`),
  no Auth0 values. Everything secret enters at run time (section 3).
- `output: "standalone"` in `next.config.ts` is what makes the slim
  `runner` stage possible — don't remove it.
- First build downloads the base image and npm packages (slow); rebuilds
  reuse cached layers (fast) until `package.json`/`package-lock.json` change.

## 2. Verify it

Build green is not proof — boot it with dummy credentials and probe it:

```bash
docker run -d --rm --name tmsph-verify -p 3100:3000 \
  -e APP_BASE_URL=http://localhost:3100 \
  -e AUTH0_DOMAIN=example.auth0.com \
  -e AUTH0_CLIENT_ID=dummy \
  -e AUTH0_CLIENT_SECRET=dummy \
  -e AUTH0_SECRET=0123456789abcdef0123456789abcdef \
  tmsph-auth-frontend

curl -o NUL -w "root:%{http_code}\n" http://localhost:3100/
curl -o NUL -w "login:%{http_code}\n" http://localhost:3100/auth/login
docker stop tmsph-verify
```

Expected: `/` → `200`, `/auth/login` → `307` redirect toward the tenant.
The 307 is the money result — it proves the standalone server, `proxy.ts`
middleware, and SDK session chain all work inside the container. Dummy
values are fine here; the redirect target doesn't need to exist.

## 3. Run it for real

Same image, real values — injected at boot, never baked in:

```bash
docker run --rm -p 3000:3000 \
  --env-file .env \
  tmsph-auth-frontend
```

(`--env-file` reads your local `.env`; the file itself never enters the
image. One secret per line, standard `NAME=value` format — this is the one
place that format is safe, because the file stays on your machine.)

## 4. Storage and upkeep

Every build downloads (base image, npm packages) and creates (one layer
per instruction, plus build cache). It all lives in Docker's data root
(`Settings > Resources` shows where — ours is `D:\Files\Docker\wsl`):

```bash
docker system df    # what images, containers, cache cost right now
docker system prune # reclaim anything unused (dangling layers, old cache)
```

- Keep the cache: it is what makes rebuilds fast. Prune when disk
  pressure demands it, not by habit.
- Tag releases you intend to keep (`:v1.2.0`, not just `:latest`) before
  pruning, or the prune takes them too.

## 5. No local daemon? Build in the cloud

`gcloud builds submit` needs no local engine and accepts the same
`Dockerfile` with no modifications:

```bash
gcloud builds submit \
  --tag asia-southeast1-docker.pkg.dev/PROJECT/tmsph/auth-frontend .
```

This is the same pattern as the youtube-automation project's
`cloudbuild.yaml`. Prefer local builds for iteration speed, cloud builds
for releases and CI.
