# Next.js layouts, metadata, and fonts

Source paths and commands in this guide are relative to `authentication-app-frontend/` at the project root.

Use this guide when changing shared page structure, search metadata, or font setup. The project uses the App Router. Implement shared route structure in `src/app/**/layout.tsx`; no separate reusable layout wrapper is required.

## Route layouts and ownership

The root `src/app/layout.tsx` owns the document's `html lang="en"`, body, global CSS import, and global font application. Next.js generates the doctype, UTF-8 charset, and default responsive viewport. Nested layouts wrap their descendants without adding another html or body.

Place a nested `layout.tsx` at the nearest route segment that shares the structure or defaults. Route groups such as `(public)` and `(private)` organize routes without adding URL segments. Introduce groups only when actual routes need them.

Keep one main landmark in the rendered page tree. If a route layout owns main, its pages supply the contents. Build headers, navigation, and footers where the feature needs them.

## Why metadata uses route exports

Next.js discovers `metadata` or `generateMetadata` exports on server route layouts and pages. This gives metadata an explicit root-to-page resolution order and integrates it with server rendering, navigation, and asynchronous data.

Rendering an ordinary component that exports a metadata object does not register that object. React 19 can move literal meta elements rendered by components into head, but those tags do not participate in Next.js Metadata API inheritance. Use the Metadata API consistently for fields it manages to avoid competing tags.

Shared metadata values and helper functions may live elsewhere; the route must export their result. Interactive UI may remain in client components beneath that server route.

## Inherit, override, or remove

Metadata is evaluated from the root layout through nested layouts to the final page.

| Child declaration | Effect |
| --- | --- |
| Omit a field | Inherit the parent field |
| Supply a new value | Replace the parent value |
| Set a supported nullable field to null | Clear that inherited field |

For example, a page can exclude itself from indexing and remove inherited description, canonical/alternate links, and social metadata:

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  description: null,
  alternates: null,
  openGraph: null,
  twitter: null,
};
```

These nullable fields are supported by the installed Next.js types and resolvers. This is not a blanket rule that every metadata field accepts null.

Nested objects are shallowly replaced, not deeply merged. Defining `openGraph: { title: "Help" }` replaces the inherited Open Graph object, including its description and images. If those values should remain, explicitly include them or merge the relevant parent field in `generateMetadata`.

To remove only the canonical link while preserving language alternates, supply the desired complete alternates object with `canonical: null`. Clearing all alternates uses `alternates: null`.

File-based metadata such as `opengraph-image.*`, `twitter-image.*`, and icons has higher priority than configuration-based metadata. Scope those files to the routes that should inherit them; an object set to null does not promise to suppress a file-based asset.

## Indexing policy

This authentication app's root currently uses `createPrivateMetadata`, so routes inherit `noindex, nofollow` unless they explicitly replace robots metadata.

- Private pages: export `createPrivateMetadata({ title, description })` from `@/lib/metadata` when setting their own generic title and description. This also clears inherited alternates and social metadata.
- Public pages: export `createPublicMetadata({ title, description, url, image? })`. This adds index/follow, an absolute canonical URL, Open Graph, and Twitter card metadata.
- For a simple indexing override without the helper, export `robots: { index: true, follow: true }` as part of the page's metadata.
- Use `generateMetadata` when values depend on route data. Export either metadata or generateMetadata from a given route file, not both.

Public canonical URLs belong to individual pages, not a shared layout with multiple distinct descendants. Supply the actual deployment URL without tracking parameters. The helper removes hash fragments and rejects non-HTTP(S) page URLs. Images are optional; only reference real assets. The helpers use absolute branded titles, so their titles bypass inherited title templates.

Noindex requests exclusion from search results; it does not prevent access. Authentication and authorization protect sensitive content. Crawlers must fetch an accessible page to read its noindex directive, so robots.txt blocking is not a substitute. Already indexed pages require recrawling before removal. Parent noindex is an inherited default, not an immutable rule: child metadata can override it.

## Fonts

Keep the existing `next/font/local` declaration in the root layout. Font binaries remain in `src/assets/fonts/`; they are not embedded in the layout source.

The loader supplies generated font CSS, self-hosted assets, preload integration, and fallback adjustments. Its CSS variable is applied to html. Existing base styles and Tailwind's font-sans token consume that variable to select Toyota Type.

Root placement applies the font throughout the app. Font configuration can be extracted into a module if real reuse warrants it, but extraction is not required for correct Next.js usage. Font selection is CSS inheritance, separate from metadata inheritance: a descendant can choose another font-family without modifying metadata.

Plain CSS @font-face is also supported. It would make the application responsible for font URLs, weights, display behavior, and preload decisions. This project retains next/font/local; do not move or duplicate its declarations into global CSS.

## Verification

Run `npm run test:metadata` for metadata helper tests (Node.js 22.6+ with TypeScript stripping), `npm run lint`, and `npm run build`. For changes to metadata inheritance, inspect generated HTML for the affected route, including parent/child combinations, rather than relying only on helper return values.

## References

- [Next.js route layouts](https://nextjs.org/docs/app/api-reference/file-conventions/layout)
- [Next.js metadata resolution](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
- [Next.js font optimization](https://nextjs.org/docs/app/getting-started/fonts)
- [React meta elements](https://react.dev/reference/react-dom/components/meta)
- [Google noindex behavior](https://developers.google.com/search/docs/crawling-indexing/block-indexing)

