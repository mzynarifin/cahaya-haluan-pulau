import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Masuk Admin",
  robots: { index: false, follow: false },
  alternates: { canonical: null },
};

export default function LegacyAdminLogin() {
  redirect("/admin-chppanel");
}
