<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Working agreements

Proceed with authorized work, including implementation and verification, without a separate plan-approval gate. Permissions are governed by the agent tool controls and explicit user instructions; filesystem access alone does not authorize unrelated actions.

For Toyota branding or component design, read `../docs/toyota-brand.md`. For component APIs and examples, read `../docs/components.md`.

For route layouts, metadata defaults/overrides/removal, or font setup, read `../docs/layouts-and-metadata.md`. Use Next.js route layouts for shared page structure and metadata; keep the existing root `next/font/local` setup.

## Styling — Tailwind CSS only

- Style all components with Tailwind CSS utility classes (Tailwind v4, via `@import "tailwindcss"` in `src/app/globals.css`). Do NOT add `.css` / `.module.css` files for component styling.
- Use the semantic color tokens defined in `src/styles/_tailwind.css` (e.g. `bg-brand-primary`, `text-brand-on-primary`, `bg-surface-muted`, `text-muted`, `border-border`, `border-divider`, `text-error`, `bg-error-surface`, `text-success`, `bg-success-surface`, `text-warning`, `bg-warning-surface`, `text-info`, `bg-info-surface`, `outline-focus`, `accent-brand-primary`). These map to the Toyota palette in `src/styles/_branding.css` — never hardcode hex values.
- Use arbitrary-value utilities for token-backed metrics (e.g. `rounded-[var(--radius-control)]`, `min-h-[var(--control-height)]`, `duration-[var(--motion-fast)]`) instead of new CSS files.
- Share repeated class strings via `.ts` helpers (see `src/components/ui/tones.ts` and `src/components/ui/form/form-classes.ts`), not CSS classes.
- Global CSS is limited to `src/app/globals.css` + `src/styles/`: branding tokens, `@theme` mappings, and `@layer base` resets. Keep `hover` styles behind `[@media(hover:hover)]:`, preserve `focus-visible` rings, `disabled`/`aria-invalid` states, and `motion-reduce:` handling.
