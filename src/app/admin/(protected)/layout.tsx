import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminShell } from "@/components/admin/admin-shell";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const client = await createClient();
  if (!client) redirect("/admin/login");

  // The cookie-backed session identifies the candidate account. The RLS-protected
  // admin_users query below is the authorization check and rejects invalid tokens.
  const { data, error } = await client.auth.getSession();
  const session = data.session;
  const userId = session?.user.id;
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

  const email = session?.user.email || "Admin";
  return <AdminShell email={email}>{children}</AdminShell>;
}
