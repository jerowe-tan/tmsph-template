import type { Metadata } from "next";

type PageDetails = {
  title: string;
  description: string;
};

type PublicPageDetails = PageDetails & {
  /** Absolute canonical URL of this page, using the real deployment domain. */
  url: string;
  /** Optional real share image. Root-relative paths resolve against the page URL. */
  image?: { url: string; alt: string };
};

export function createPublicMetadata({
  title,
  description,
  url,
  image,
}: PublicPageDetails): Metadata {
  const canonical = new URL(url);
  if (!["https:", "http:"].includes(canonical.protocol)) {
    throw new Error("Public metadata requires an absolute HTTP(S) URL.");
  }
  canonical.hash = "";

  const images = image
    ? [{ url: new URL(image.url, canonical).href, alt: image.alt }]
    : [];
  const pageTitle = `${title} | Toyota`;

  return {
    title: { absolute: pageTitle },
    description,
    robots: { index: true, follow: true },
    alternates: { canonical: canonical.href },
    openGraph: {
      type: "website",
      siteName: "Toyota",
      title: pageTitle,
      description,
      url: canonical.href,
      images,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: pageTitle,
      description,
      images,
    },
  };
}

export function createPrivateMetadata({ title, description }: PageDetails): Metadata {
  return {
    title: { absolute: `${title} | Toyota` },
    description,
    robots: { index: false, follow: false },
    // Clear public metadata inherited from an enclosing route layout.
    alternates: null,
    openGraph: null,
    twitter: null,
  };
}
