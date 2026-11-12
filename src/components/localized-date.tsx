"use client";

import { useEnglishLanguage } from "@/components/language-runtime";

export function LocalizedDate({ value, withTime = false }: { value?: string | null; withTime?: boolean }) {
  const english = useEnglishLanguage();
  if (!value) return <>{english ? "Date unavailable" : "Tanggal belum tersedia"}</>;
  return <>{new Intl.DateTimeFormat(english ? "en-US" : "id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    ...(withTime ? { hour: "2-digit" as const, minute: "2-digit" as const, timeZoneName: "short" as const } : {}),
    timeZone: "Asia/Jakarta",
  }).format(new Date(value))}</>;
}
