"use client";

import Image from "next/image";
import { useEnglishLanguage } from "@/components/language-runtime";

export function NewsCoverImage({ src, alt, altEn, ...props }: {
  src: string;
  alt?: string | null;
  altEn?: string | null;
  width: number;
  height: number;
  sizes?: string;
  style?: React.CSSProperties;
}) {
  const english = useEnglishLanguage();
  return <Image src={src} alt={english ? altEn || alt || "" : alt || ""} {...props} />;
}
