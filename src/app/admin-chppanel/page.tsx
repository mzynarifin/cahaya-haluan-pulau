import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/admin/auth-forms";
import { AuthFrame } from "@/components/admin/auth-frame";

export const metadata: Metadata = {
  title: "Masuk Admin",
  robots: { index: false, follow: false },
  alternates: { canonical: null },
};

export default function AdminLogin() {
  return <AuthFrame><Suspense fallback={<p>Memuat formulir masuk...</p>}><LoginForm /></Suspense></AuthFrame>;
}
