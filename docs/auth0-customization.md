# Auth0 Universal Login customization

Where everything in this guide lives in the dashboard: **Branding > Universal
Login**. The three cards in your screenshot are under
**Branding > Universal Login > Pro-code customizations**.

For skill-driven workflows (CLI commands, API payloads), see the vendored
Auth0 skill: `.agents/skills/auth0/references/feature-branding`,
`feature-acul`, and `feature-custom-domains`.

## The customization ladder

Each rung buys more control and costs more maintenance. Start at the top and
stop as soon as the result looks Toyota enough.

| # | Surface | What it changes | Requires | Toyota use |
|---|---|---|---|---|
| 1 | No-code theme | Colors, Toyota Type (`font_url`), font sizes/bold per element, borders, widget layout, backgrounds | Universal Login on the flows you brand | Always: primary red, logo, typography |
| 2 | Custom text | Every string per prompt/screen/language (`login`, `login-id`, `login-password`, `signup`, …) | None beyond Universal Login | Always: sentence-case Toyota voice |
| 3 | Page template | Liquid HTML **around** the login box (header, footer, background, layout) | Custom domain; Management API to publish | Recommended: Toyota page chrome |
| 4 | Partials | Custom fields/content **inside** login & signup screens | Custom domain + page template; screens on STANDARD rendering | Only if a screen needs an extra field (e.g. consent checkbox) |
| 5 | ACUL custom screens | Pixel-perfect React/JS screens replacing Auth0's UI | Custom domain, dev tenant, CDN + CI pipeline | Only if the redirect UI itself must be bespoke |

## 1. Enhance screens with partials

Inserts custom fields and content into the login and signup screens while
keeping Auth0's default widget.

- **Dashboard:** Branding > Universal Login > Enhance screens with partials.
  Pick a screen, pick entry points, add code snippets and template variables,
  optionally attach Actions for custom logic on your fields, then Save & Publish.
- **Programmatic:** Management API `GET/PUT /prompts/{prompt}/partials`
  (every call specifies the screen; max 10,000 characters), or
  `auth0 ul customize` in the CLI.
- **Prerequisites:** custom domain configured, Universal Login enabled for
  those prompts, and the legacy "Customize Login Page" toggle off.
- **Rendering modes matter:** `STANDARD` screens accept partials;
  `ADVANCED` (ACUL) screens ignore them; `ADVANCED (FILTERED)` screens accept
  partials only for requests excluded from the ACUL filters.
- **Localization:** partial copy goes through `var-` custom-text variables
  (e.g. API key `var-tos`, referenced in the partial as camelCase), so one
  partial serves every language.

Use partials when the screen is 95% right and you need one more thing inside
it. If you are rewriting the whole screen, skip to ACUL.

## 2. Build advanced custom screens (ACUL)

Replaces Auth0's hosted UI with your own React (`@auth0/auth0-acul-react`)
or Vanilla JS (`@auth0/auth0-acul-js`) app. Auth0 still drives the
authentication state machine (including passkeys, bot detection, MFA) — your
code only renders the screens and calls SDK actions such as `login()`,
`signup()`, `federatedLogin()`, or `continueWithMfaOtp()`.

- **How it deploys:** you build static JS/CSS, host it on your own CDN via
  CI, and Auth0 serves a minimal host page that loads your bundles
  (integrity-checked with SRI hashes). Configure per screen in the dashboard
  (screen > Settings > Rendering mode: Advanced), via
  `PATCH /v2/prompts/{prompt}/screen/{screen}/rendering`, or Terraform
  `auth0_prompt_screen_renderer`.
- **Prerequisites:** custom domain, a dev/stage tenant (never develop against
  production), a first-party application, and a CDN with CI.
- **Local workflow:** `auth0 acul init` / `auth0 acul screen add` scaffolds
  screens; `auth0 acul dev` previews locally. The skill's ACUL reference
  documents the full phased workflow.
- **Toyota angle:** our design tokens and Tailwind components can be reused
  inside an ACUL project, but it is a **separate app deployed to Auth0** —
  our Next.js `/login` and `/register` routes cannot host these screens.

## 3. Core configuration

Tenant-wide switches under Pro-code customizations > Core configuration.
Covers Login, Password Reset, and MFA screens.

- **Login engine:** Universal vs Classic. Stay on **Universal** — Classic
  receives no updates, and themes, templates, the no-code editor, partials,
  and ACUL only apply to Universal flows. Tenants can run hybrid per flow,
  so verify each flow you care about is actually on Universal before
  branding it.
- **Iframe embedding:** allows login flows inside iframes for development
  environments and generative-UI platforms (allow-listed origins). Dev-only:
  enabling it disables the security headers that protect against
  clickjacking, so never a production login pattern.
- **Classic login pages:** direct links to customize the legacy login,
  password-reset, and MFA pages — only relevant if a flow is still on
  Classic, which ours won't be.

## Practical rules

- Text and theme changes need no custom domain; templates, partials, and
  ACUL do. Set up the custom domain (`login.<your-domain>`) early.
- Custom-text `PUT` replaces **all** text for a prompt+language: always GET,
  merge, then PUT. `login-id` and `login-password` are separate prompts, not
  one `login` call.
- Theme `PATCH` requires all top-level sections (`colors`, `fonts`,
  `borders`, `widget`, `page_background`): GET, merge, then PATCH.
- Never develop branding against production. Verify with `auth0 test login`
  on the dev tenant.

## Source provenance

All links below were verified live against the current Auth0 docs.

- Auth0 skill v2.2.0, vendored at `.agents/skills/auth0/` (references used:
  `feature-branding`, `feature-acul`, `feature-custom-domains`).
- [Manage Core Configuration](https://auth0.com/docs/customize/login-pages/manage-core-configuration) — login engine switch, iframe embedding rules.
- [Customize Signup and Login Prompts (partials)](https://auth0.com/docs/customize/login-pages/universal-login/customize-signup-and-login-prompts) — entry points, 10,000-char limit, rendering modes, `var-` variables, `ulp-` input prefix.
- [Customize Page Templates](https://auth0.com/docs/customize/login-pages/universal-login/customize-templates) — Liquid, `auth0:widget` / `auth0:head` tags, custom-domain requirement.
- [Advanced Customizations (ACUL)](https://auth0.com/docs/customize/login-pages/advanced-customizations) — requirements, build-time vs run-time model.
- [Customize Page Themes](https://auth0.com/docs/customize/login-pages/universal-login/customize-themes) — no-code editor, WOFF `font_url` (CORS-enabled host), per-element sizes.
- [Customize Text Elements](https://auth0.com/docs/customize/login-pages/universal-login/customize-text-elements) — per-prompt/screen/language keys, PUT-replaces-all rule.
