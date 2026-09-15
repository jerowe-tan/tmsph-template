# Toyota UI components

Source paths in this guide are relative to `authentication-app-frontend/` at the project root.

For Next.js route layouts, metadata inheritance, and fonts, see [Layouts and metadata](layouts-and-metadata.md).

Import components directly from their files. Each accepts native element props, including `className`, native event handlers, accessibility attributes, and React 19 `ref`. No provider or extra runtime package is needed.

| Component | Import suffix under `@/components/ui/` | Added props |
| --- | --- | --- |
| Button | button/button | `variant`: primary, secondary, outline, ghost; `size`: sm, md, lg; `loading` |
| ButtonLink | button/button-link | Same `variant`/`size` as Button, rendered as `next/link`; requires `href`. `isActive` marks the current-page link (`aria-current="page"` + pressed look) — match the route yourself (e.g. `usePathname()`) and pass it explicitly. No `loading`/disabled states — links navigate, they don't submit |
| Input | form/input | Native input props; `size`: sm, md, lg; `isError` shows the error border |
| Label | form/label | `required` adds visible “(required)” text |
| LabeledInput | form/labeled-input | `label`, `hint`, `error`, `wrapperClassName`, `isError`, `gap` (gap-0–gap-6, default gap-2) |
| Textarea | form/textarea | Native textarea props; `size`: sm, md, lg; `isError` shows the error border |
| Select | form/select | Native select props and option children; `size`: sm, md, lg; `isError` shows the error border |
| Checkbox | form/checkbox | Native input props except type; `isError` shows the error outline |
| Radio | form/radio | Native input props except type; `isError` shows the error outline |
| FieldError | form/field-error | `error` text; `size`: sm, md, lg; always reserves one line, `invisible` until set |
| Card | card/card | Native div props |
| Badge | badge/badge | `tone`: neutral, success, warning, error, info; `size`: sm, md, lg |
| Display | typography/display | Page title (`h1`); `size`: sm, md, lg (28–40px band, bold); `margin`: none, sm (default), md, lg, xl |
| Heading | typography/heading | Section heading; `level`: 1–6 (default 2); `size`: sm, md, lg; `margin`: none, sm (default), md, lg, xl |
| Body | typography/body | Reading text (16/1.5); `size`: sm, md, lg; `margin`: none, sm (default), md, lg, xl |
| Caption | typography/caption | Muted supporting copy; `size`: sm, md, lg; `margin`: none, sm (default), md, lg, xl |
| Eyebrow | typography/eyebrow | Semibold kicker above a heading; `size`: sm, md, lg; `margin`: none, sm (default), md, lg, xl |
| Quote | typography/quote | `blockquote` with brand-accent rule; `size`: sm, md, lg; `margin`: none, sm (default), md, lg, xl |
| ViewportBody | layout/viewport-body | Page wrapper with responsive gutters (16→24→32px); `size`: sm (forms), md (reading), lg (page, default), full |
| FramedImage | image/framed-image | `next/image` in a clipped wrapper; `aspect`: 16/9 (default), 4/3, 3/2, 1/1, 21/9; `width`: full (default), xs–xl, or px number — always fluid below the cap; `fit`: cover (default), contain; `wrapperClassName` for the frame |
| Alert | alert/alert | `tone`: info, success, warning, error |
| Spinner | spinner/spinner | Native span props; default status role and Loading label |

## Form composition

```tsx
import { Button } from "@/components/ui/button/button";
import { LabeledInput } from "@/components/ui/form/labeled-input";
import { Checkbox } from "@/components/ui/form/checkbox";
import { Label } from "@/components/ui/form/label";

export function SignInFields() {
  return (
    <div className="grid gap-4">
      <LabeledInput
        label="Email"
        name="email"
        type="email"
        autoComplete="username"
        required
        hint="Use your work email address."
      />
      <LabeledInput
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
      />
      <Label className="flex min-h-11 items-center gap-2">
        <Checkbox name="remember" />
        Remember me
      </Label>
      <Button type="submit">Sign in</Button>
    </div>
  );
}
```

Mount these fields inside your feature's form. That feature owns submission, pending state, and validation. Add `"use client"` to consumers using hooks or event handlers. LabeledInput is already a client boundary because it creates stable IDs with `useId`; the other primitives work in either server or client component trees.

Button defaults to `type="button"` to prevent accidental submission. Use `type="submit"` explicitly. Set `loading` from your form state; it disables the button, retains its text, adds a decorative spinner, and sets `aria-busy`. Icon-only buttons require an accessible name.

Pass error text to `LabeledInput error="Enter a valid email address."`. It connects label, hint, and error IDs, merges external `aria-describedby`, and marks the input invalid. `className` styles the input; `wrapperClassName` styles the field group. The form controls when errors appear and where focus moves after submission.

## Native selection

```tsx
import { Label } from "@/components/ui/form/label";
import { Select } from "@/components/ui/form/select";
import { Radio } from "@/components/ui/form/radio";
import { Textarea } from "@/components/ui/form/textarea";

export function Preferences() {
  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="location">Location</Label>
        <Select id="location" name="location" defaultValue="">
          <option value="" disabled>Select a location</option>
          <option value="manila">Manila</option>
        </Select>
      </div>
      <fieldset>
        <legend className="font-semibold">Contact preference</legend>
        <Label className="flex min-h-11 items-center gap-2">
          <Radio name="contact" value="email" defaultChecked />
          Email
        </Label>
        <Label className="flex min-h-11 items-center gap-2">
          <Radio name="contact" value="phone" />
          Phone
        </Label>
      </fieldset>
      <div className="grid gap-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" name="notes" />
      </div>
    </div>
  );
}
```

Raw Input, Select, Textarea, Checkbox, and Radio need an associated label. Use Checkbox and Radio for choices; Input's styling targets text-like inputs. Keep native file, date, and color picker behavior in mind when using specialized input types.

## Feedback and grouping

```tsx
import { Alert } from "@/components/ui/alert/alert";
import { Badge } from "@/components/ui/badge/badge";
import { Card } from "@/components/ui/card/card";
import { Spinner } from "@/components/ui/spinner/spinner";

<Card className="grid gap-4">
  <h2 className="text-xl font-semibold">Account</h2>
  <Badge tone="success">Active</Badge>
  <Alert tone="info">Your profile is ready to review.</Alert>
</Card>;

<Alert tone="error" role="alert">Save failed. Try again.</Alert>;
<Spinner aria-label="Loading account details" />;
```

Alert uses a polite status role by default; choose `role="alert"` for urgent dynamic failures or `role="note"` for static advisory content. Badge is plain text, not a live region. Use a visible heading or message to explain each status.

## Styles and extension

The global entry imports Tailwind, `_branding.css` (plain CSS values), `_tailwind.css` (utility mappings and breakpoints), and `_base.css` (document defaults). Component CSS stays next to its component.

CSS Modules use the `components` cascade layer, so Tailwind utilities in the later `utilities` layer can override defaults without class-merging packages. Maintain contrast and focus visibility when overriding. Use full literal utility names so Tailwind can detect them.

```tsx
<Button className="w-full xs:w-auto">Continue</Button>

<div className="bg-brand-primary text-brand-on-primary p-4">
  Toyota brand accent
</div>

<div className="grid grid-cols-1 xs2:gap-3 xs:grid-cols-2 xl2:grid-cols-4">
  {/* Content */}
</div>
```

Named pairs include `bg-surface text-foreground`, `bg-surface-muted text-muted`, and `bg-error-surface text-error`. Plain CSS can use the same values, such as `background: var(--brand-primary)`.

Breakpoints: xs2 360px, xs 480px, sm 640px, md 768px, lg 1024px, xl 1280px, xl2 and 2xl 1536px. Base utilities apply at every width, including below xs2; prefixed utilities apply from their minimum width upward.

Fonts live under `src/assets/fonts/` and load locally in the root layout. The initial theme is light. The starter home page is not a component catalog; integrate these primitives into actual feature screens as needed.

## Features

Feature code lives under `src/features/<feature>/` and is composed by routes
in `src/app/`. Only add the folders a feature actually needs:

```text
src/features/auth
└── components/      # feature-scoped UI (login-form, register-form)
    ├── login-form.tsx
    └── register-form.tsx
```

Import feature files directly — no barrel re-exports. Keep the dependency
direction one-way: shared (`components/ui`, `lib`, …) → features → app.
Features never import from each other or from `app`; compose features together
only at the route level.

```tsx
import { LoginForm } from "@/features/auth/components/login-form";
```

Architecture follows [Bulletproof React's project structure](https://github.com/alan2207/bulletproof-react/blob/master/docs/project-structure.md): small components, nearby styles, native composition, and feature-independent shared UI. No generic form engine, variant framework, or broad re-export barrel is required.
