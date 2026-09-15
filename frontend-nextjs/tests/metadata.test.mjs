import assert from "node:assert/strict";
import { test } from "node:test";
import { createPrivateMetadata, createPublicMetadata } from "../src/lib/metadata.ts";

const details = { title: "Account help", description: "Help with your Toyota account." };

test("public metadata opts into indexing and uses one canonical URL for search and sharing", () => {
  const metadata = createPublicMetadata({
    ...details,
    url: "https://example.com/help#contact",
  });
  assert.deepEqual(metadata.robots, { index: true, follow: true });
  assert.deepEqual(metadata.title, { absolute: "Account help | Toyota" });
  assert.equal(metadata.description, details.description);
  assert.equal(metadata.alternates.canonical, "https://example.com/help");
  assert.equal(metadata.openGraph.url, "https://example.com/help");
  assert.equal(metadata.twitter.card, "summary");
  assert.deepEqual(metadata.openGraph.images, []);
  assert.deepEqual(metadata.twitter.images, []);
});

test("an optional share image resolves to an absolute URL with alternative text", () => {
  const metadata = createPublicMetadata({
    ...details,
    url: "https://example.com/help",
    image: { url: "/images/help.jpg", alt: "Account help" },
  });
  const expected = [{ url: "https://example.com/images/help.jpg", alt: "Account help" }];
  assert.deepEqual(metadata.openGraph.images, expected);
  assert.deepEqual(metadata.twitter.images, expected);
  assert.equal(metadata.twitter.card, "summary_large_image");
});

test("public metadata requires an absolute HTTP(S) canonical URL", () => {
  for (const url of ["/help", "not a URL", "mailto:help@example.com"]) {
    assert.throws(() => createPublicMetadata({ ...details, url }));
  }
});

test("private metadata replaces inherited public indexing and sharing fields", () => {
  const publicMetadata = createPublicMetadata({ ...details, url: "https://example.com/help" });
  const privateMetadata = createPrivateMetadata({
    title: "Sign in",
    description: "Sign in to your Toyota account.",
  });
  // Next.js merges metadata shallowly across route segments.
  const merged = { ...publicMetadata, ...privateMetadata };
  assert.deepEqual(merged.robots, { index: false, follow: false });
  assert.equal(merged.alternates, null);
  assert.equal(merged.openGraph, null);
  assert.equal(merged.twitter, null);
  assert.deepEqual(merged.title, { absolute: "Sign in | Toyota" });
});
