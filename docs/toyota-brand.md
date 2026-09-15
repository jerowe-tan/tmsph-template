# Toyota interface design reference

Use this document when designing or reviewing Toyota-branded forms, controls, navigation, content, or feedback. It is independent of programming language, framework, and styling library.

## Identity and scope

Aim for clear, confident, approachable interfaces. Use strong hierarchy, readable typography, generous white space, and purposeful red accents. Help people understand their next action.

The four core colors and Toyota Type family below are official Toyota brand guidance. UI status colors, dimensions, interaction timings, and responsive thresholds in this document are application conventions, not universal Toyota mandates. The primary brand source is Toyota's US Brand Hub; local-market requirements take precedence where they differ.

## Color roles

| Role | Value | Use |
| --- | --- | --- |
| Brand primary / Toyota Red | #EB0A1E | Primary action and recognizable brand accents |
| On primary | #FFFFFF | Text and icons over primary red |
| Brand secondary / black | #000000 | Strong text, secondary action backgrounds |
| On secondary | #FFFFFF | Text on black |
| Canvas / surface / white | #FFFFFF | Page and component backgrounds |
| Muted text / Toyota Gray | #58595B | Supporting copy |
| Muted surface | #F5F5F5 | Quiet grouping and read-only fields |
| Control border | #767676 | Visible input boundaries |
| Divider | #DEDEDE | Decorative separation, not essential control boundaries |
| Primary hover | #C90819 | Hover feedback |
| Primary pressed | #A80715 | Press feedback |
| Focus | #000000 | Focus outline, separated by a white gap |

Toyota Red should be the strongest brand accent without overwhelming the composition. Pair red with white, black, and gray. A primary red action does not indicate an error.

| Status | Text / border | Background |
| --- | --- | --- |
| Error | #B42318 | #FFF1F0 |
| Success | #176B3A | #EDF8F0 |
| Warning | #805500 | #FFF8E6 |
| Information | #175A8A | #EEF6FC |

Always accompany status color with meaningful text. Keep brand and error roles distinct even when both are red. Use the named roles consistently; change shared values at their source rather than inventing per-screen shades.

The initial interface theme is light. A dark theme needs its own complete set of paired surfaces, text, boundaries, and focus states before adoption.

## Typography

Toyota Type is the brand family. Official primary weights are Book, Semibold, and Bold. The available Toyota Europe web bundle supplies Regular, Semibold, and Bold; this project's body text uses genuine Regular, not an approximation labeled Book. Use only assets approved for Toyota work.

| Purpose | Application default |
| --- | --- |
| Body and editable values | Regular, 16px equivalent, 1.5 line height |
| Labels and supporting text | 14px equivalent; labels Semibold |
| Buttons | Semibold, 16px equivalent |
| Small badges | Semibold, 12px equivalent; not long instructions |
| Page headings | Semibold or Bold, 28–40px equivalent, 1.2 line height |

Allow user text scaling. Keep letter spacing natural. Use sentence case for interface copy; reserve uppercase for short expressive headings, at most seven words. Make action labels specific, such as “Save changes” or “Sign in.” Avoid text effects and artificial stretching.

The UI line heights above deliberately allow more room than the brand's advertising headline treatments. Prioritize legibility and unclipped multiline labels in functional interfaces.

## Shape, spacing, and layout

- Use a 4px spacing unit. Typical gaps: 8px within a field, 16px between related items, 24px between groups, 32px between sections.
- Use 4px corner radii for controls and 8px for cards. Prefer flat surfaces and clear boundaries.
- Make buttons and text fields at least 44px tall. Checkbox and radio marks may be 20px, with an associated label expanding the clickable area to at least 44px high.
- Keep editable text at 16px equivalent. Allow labels, errors, and button text to wrap.
- Build for narrow screens first. Stack fields until available width supports columns. Use flexible widths and sensible maximum content widths.
- Application width thresholds: extra-small-2 360px, extra-small 480px, small 640px, medium 768px, large 1024px, extra-large 1280px, extra-large-2 1536px. These are minimum widths, not device detection. Base styles must also work below 360px.
- For reading order, prefer left alignment in left-to-right languages and logical start alignment when supporting other scripts.

## Component contracts

| Component | Design and behavior |
| --- | --- |
| Button | Primary red for the main action; black secondary, outline, and quiet alternatives. Distinguish default, hover, pressed, focused, disabled, and busy states. Keep the action name visible while busy. |
| Input / textarea | Persistent label, visible boundary, readable value, optional hint, explicit error. Placeholders supplement labels. Read-only remains readable and focusable; disabled is inactive. |
| Labeled input | Group label, input, hint, and error. Associate each programmatically and give every instance a unique identifier. Preserve user-entered data on failure. |
| Select | Use the platform's native selection interaction for straightforward lists. Keep its label visible. |
| Checkbox | Independent yes/no choice. Make the label clickable and retain native keyboard interaction. |
| Radio | One selection from a related set. Use a shared group name and a visible group legend. |
| Card | Quiet visual grouping. Use surrounding headings and semantic sections where needed; a card alone does not define a landmark. |
| Badge | Short visible status, not an action. Include the meaning in text. |
| Alert | Explain what happened and the useful next step. Use polite announcements for routine updates; urgent failures may need an assertive alert. |
| Spinner | Pair progress with an accessible name. When another control already communicates loading, the spinner is decorative. |

Use native behavior before building custom interactions. Compose small components around actual shared needs. Keep routing, business rules, network calls, and validation policy with the consuming feature. Add complex widgets only when a concrete screen requires them.

## Accessibility and feedback

Target WCAG 2.2 AA. Normal text needs at least 4.5:1 contrast; large text and meaningful non-text boundaries need at least 3:1. Validate actual foreground/background pairs, including custom overrides.

Provide a visible keyboard focus indicator with sufficient contrast against adjacent surfaces. A two-pixel outline, three-pixel offset, and white separation is the default treatment. Never rely on color alone for required fields, invalid values, or status.

Associate labels with controls. Connect hints and errors to the input's accessible description. Mark invalid fields programmatically. After a failed form submission, move focus to an error summary or first invalid field; announce errors without duplicate live regions. Keep validation in the form feature.

Use native disabled behavior for unavailable actions. During submission, prevent duplicate actions and expose busy state. Allow password managers, autocomplete, and paste in authentication fields.

Use short, stable color transitions around 150ms. Honor reduced-motion preferences by stopping decorative rotation and removing transitions while retaining status text. Motion and sound assets from Toyota's marketing system do not imply automatic animation or audio in application controls.

## Brand assets

Use supplied official logos with their prescribed proportions, clear space, and permitted color versions. Do not recreate the Toyota emblem from text, CSS, or generic icons. Dealer, product, and sub-brand identities have separate rules; a generic Toyota control does not imply those identities.

Toyota Type is for work on behalf of Toyota, including affiliates, and is available for global use. Preserve provenance when copying font assets. Use a readable system sans-serif fallback if the approved font cannot load.

## Design review

Verify the whole component in context: brand role, readable hierarchy, correct native semantics, keyboard use, label association, error recovery, busy/disabled states, narrow-screen wrapping, text scaling, contrast, and reduced motion. Check both component defaults and any overrides applied by its consumer.

## Source provenance

Reviewed 2026-09-10. This document is usable without opening these references; links support provenance and later updates.

- [Toyota color guidance](https://brand.toyota.com/guidelines/visual/brand-colors)
- [Toyota typography and usage rights](https://brand.toyota.com/guidelines/visual/typography)
- [Toyota Europe web font assets](https://dx-playbook.toyota-europe.com/cds/get-started/setup/static/)
- [Toyota visual system](https://brand.toyota.com/guidelines/visual)
- [Toyota dynamic system](https://brand.toyota.com/guidelines/dynamic)
- [Toyota sonic system](https://brand.toyota.com/guidelines/sonic)
- [Toyota brand extensions](https://brand.toyota.com/guidelines/extensions)
