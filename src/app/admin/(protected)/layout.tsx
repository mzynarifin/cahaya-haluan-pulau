import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminShell } from "@/components/admin/admin-shell";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const client = await createClient();
  if (!client) redirect("/admin/login");

  // Validate the cookie-backed JWT before using its identity for authorization.
  const { data, error } = await client.auth.getClaims();
  const userId = typeof data.claims?.sub === "string" ? data.claims.sub : null;
  if (error || !userId) {
    redirect("/admin/login?next=/admin&error=session");
  }

  const { data: role } = await client.from("admin_users").select("user_id").eq("user_id", userId).maybeSingle();
  if (!role) {
    return <main id="main" className="section"><div className="container">
      <h1>Akses ditolak</h1>
      <p>Akun ini berhasil masuk, tetapi belum diberi izin admin. Minta pengelola menambahkan UUID akun ke tabel admin_users.</p>
      <a href="/admin/login" className="btn btn-outline">Kembali ke login</a>
    </div></main>;
  }

  const email = typeof data.claims?.email === "string" ? data.claims.email : "Admin";
  return <AdminShell email={email}>{children}</AdminShell>;
}
