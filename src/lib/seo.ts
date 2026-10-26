import type { Metadata } from "next";
import { siteName } from "@/lib/config";

const defaultSocialImage = { url: "/opengraph-image", width: 1200, height: 630, alt: siteName };

export function pageMetadata(path: string, title: string, description: string): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { type: "website", title, description, url: path, siteName, locale: "id_ID", images: [defaultSocialImage] },
    twitter: { card: "summary_large_image", title, description, images: [defaultSocialImage.url] },
  };
}
