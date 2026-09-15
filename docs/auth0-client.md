# Auth0 client-side guide

Client-side authentication in this app: what the browser can link to, and
what each endpoint does. Server-side topics (`getSession()`,
`getAccessToken()`, middleware, tenant setup) are out of scope for this doc.

> These routes exist because `proxy.ts` mounts `auth0.middleware()`. They
> are SDK-owned — never implement them yourself.

## 1. Auth endpoints and links

| Link | What happens |
|---|---|
| `/auth/login` | Redirects to hosted Universal Login. On success Auth0 returns to `/auth/callback`, then to `returnTo` (default `/`). |
| `/auth/login?returnTo=/dashboard` | Same, but lands on `/dashboard` after login. Use for deep links ("continue to checkout"). |
| `/auth/login?prompt=login` | Forces re-authentication even with a live SSO session (sensitive actions). |
| `/auth/logout` | Ends the app session and the Auth0 session, then returns to the app base URL (must be in Allowed Logout URLs). Render as a plain `<a>` — never `next/link`, its prefetch would fire the logout on hover. |
| `/auth/callback` | OAuth callback. Never link to it; the SDK owns it. Must be in Allowed Callback URLs (`<base>/auth/callback`). |
| `/auth/profile` | GET returns the logged-in user's profile JSON. Fetchable from client code when a component needs the profile without `useUser()`. |

Notes:

- v4 paths are `/auth/*` (the old `/api/auth/*` prefix is gone).
- Extra `/authorize` parameters (e.g. `screen_hint=signup`) can be appended
  to `/auth/login` and are forwarded to Auth0.
- The SDK's canonical markup is a plain anchor (`<a href="/auth/login">`);
  our `ButtonLink` renders `next/link`, which is fine for login links.

## 2. Changing auth behavior

How common "what if we want to …" requests map to a change. **Link** means
edit the URL our UI points to — no tenant work. **Dashboard** means a tenant
setting — no code. **Ours** means our UI must change alongside it.

| Want | Type | Change | Frontend effect |
|---|---|---|---|
| Disable SSO, force fresh credentials | Link | `/auth/login?prompt=login` | User always types credentials, even with a live SSO session. Use before sensitive actions. |
| Force re-auth older than N seconds (step-up) | Link | `/auth/login?max_age=300` (plus `acr_values` for MFA levels) | Same as above, but only when the session is stale. See skill `feature-mfa`. |
| Open signup instead of login | Link | `/auth/login?screen_hint=signup` | Universal Login lands on the registration screen. |
| Skip login chooser, go straight to Google/etc. | Link | `/auth/login?connection=google-oauth2` | Bypasses the identifier/password form entirely. |
| Log out of Google/Entra too, not just us | Link | `/auth/logout?federated` | Ends the upstream IdP session. Default logout ends only app + Auth0 sessions. |
| Log in on behalf of one company (B2B) | Link | `/auth/login?organization=org_xxx` | Scoped enterprise login. Our UI must supply the org (picker or stored value). See skill `feature-organizations`. |
| Disable signups entirely | Dashboard | Database connection > Disable Sign Ups | Registration screens disappear — hide our signup CTAs too (**Ours**). |
| Add/remove Google, Facebook, Entra ID … | Dashboard | Enable/disable connections per application | Universal Login buttons update automatically; update our landing copy if it names providers (**Ours**, minor). |
| Require MFA (always, never, adaptive) | Dashboard | Security > MFA policy | Auth0 injects the extra step; no code. Keep loading states honest — the flow gets longer. See skill `feature-mfa`. |
| Switch passwordless on/off | Dashboard | Enable/disable email/SMS connections | Available methods on Universal Login change; adjust any "use password" guidance copy (**Ours**, minor). |
| Email-first vs combined login screens | Dashboard | Authentication Profile: Identifier First vs Classic | One two-step flow vs one combined form. No code either way. |
| How long "remember me" lasts | SDK config | `session.rolling` / `session.absoluteDuration` in `Auth0Client` | Pure UX: how often users re-login. Server-side knob, listed here because users feel it. |
| Move to `login.<domain>` | Tenant | Custom domain (see `docs/auth0-customization.md`) | Transparent to links (`/auth/*` unchanged), but callback/logout URLs and SDK domain must be updated. |

Rules of thumb:

- If the change is per-click intent (fresh auth, signup-first, org,
  provider), it belongs in the **link**. Our `ButtonLink` takes these as
  plain `href` query strings.
- If it is policy (who may register, which providers exist, MFA), it belongs
  in the **dashboard** — Universal Login picks it up with zero deploys.
- Whenever Auth0 stops offering something (signups off, provider removed),
  remove our UI that promises it in the same change.
