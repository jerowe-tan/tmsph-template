# Deploying to Cloud Run with gcloud

Getting this app running on Cloud Run, in three layers. Each section
assumes the previous one's result. Auth0 callback wiring
(`<base>/auth/callback` in Allowed Callback URLs) is covered in
`docs/auth0-client.md`; secret storage mechanics in
`docs/gcloud-secrets.md`.

Region below is `asia-southeast1` (closest to PH users) — keep the
Artifact repo, secrets, and service in the same region. Replace `PROJECT`
with your GCP project id.

## 1. Easy deploy (no Dockerfile needed)

One command builds (Cloud Buildpacks auto-detects Next.js), pushes, and
deploys. Use this to get a live URL fast.

```bash
gcloud run deploy auth-frontend \
  --source . \
  --region asia-southeast1 \
  --allow-unauthenticated
```

Run from `authentication-app-frontend/`. Output ends with a
`https://<service>-<hash>.a.run.app` URL — that URL is what the next
sections (and Auth0's callback list) build on.

## 2. Deploying with our Dockerfile

Same destination, but the image is built from `Dockerfile` (multi-stage,
non-root, standalone server) instead of auto-detection.

```bash
# Once: a shelf for the image
gcloud artifacts repositories create tmsph \
  --repository-format=docker --location=asia-southeast1

# Every deploy: build, then release
gcloud builds submit \
  --tag asia-southeast1-docker.pkg.dev/PROJECT/tmsph/auth-frontend .

gcloud run deploy auth-frontend \
  --image asia-southeast1-docker.pkg.dev/PROJECT/tmsph/auth-frontend \
  --region asia-southeast1 \
  --allow-unauthenticated
```

Prefer this over section 1 for anything real: reproducible layers, smaller
image, no root user. (This mirrors the `cloudbuild.yaml` pattern from the
youtube-automation project — a `gcloud builds submit` equivalent for this
frontend can be added later.)

## 3. Adding secrets (the easy version)

Secrets are bound at deploy time, never baked into the image. Full
mechanics — create/rotate, `.env` splitting, IAM, `:latest` vs pinned —
live in `docs/gcloud-secrets.md`. Here is only the deploy wiring:

```bash
gcloud run deploy auth-frontend \
  --image asia-southeast1-docker.pkg.dev/PROJECT/tmsph/auth-frontend \
  --region asia-southeast1 \
  --allow-unauthenticated \
  --set-env-vars=APP_BASE_URL=https://<service>.a.run.app,AUTH0_DOMAIN=<tenant>.auth0.com,AUTH0_CLIENT_ID=<id> \
  --set-secrets=AUTH0_CLIENT_SECRET=auth0-client-secret:latest,AUTH0_SECRET=auth0-secret:latest
```

That is the whole contract:

- `--set-env-vars` — public config, visible in redirects anyway.
- `--set-secrets` — `VAR=secret-name:version`, resolved from Secret
  Manager at container boot. The two names are independent (see
  `gcloud-secrets.md` §3).
- First deploy chicken-and-egg: deploy once to learn the `*.run.app` URL,
  add `https://<that>/auth/callback` to Auth0's Allowed Callback URLs,
  set it as `APP_BASE_URL`, redeploy.
