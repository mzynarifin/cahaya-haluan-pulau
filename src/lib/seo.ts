import type { Metadata } from "next";

export function pageMetadata(path: string, title: string, description: string): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { type: "website", title, description, url: path, siteName: "Cahaya Haluan Pulau", locale: "id_ID" },
    twitter: { card: "summary_large_image", title, description },
  };
}
