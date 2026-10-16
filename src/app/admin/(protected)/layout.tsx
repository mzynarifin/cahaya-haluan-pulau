import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminShell } from "@/components/admin/admin-shell";
export const metadata:Metadata={robots:{index:false,follow:false}};
export default async function ProtectedLayout({children}:{children:React.ReactNode}){const client=await createClient();if(!client)redirect("/admin/login");const {data:{user}}=await client.auth.getUser();if(!user)redirect("/admin/login?next=/admin");const {data:role}=await client.from("admin_users").select("user_id").eq("user_id",user.id).maybeSingle();if(!role)return <main id="main" className="section"><div className="container"><h1>Akses ditolak</h1><p>Akun Anda tidak memiliki izin admin. Hubungi pengelola sistem.</p><a href="/admin/login" className="btn btn-outline">Kembali ke login</a></div></main>;return <AdminShell email={user.email||"Admin"}>{children}</AdminShell>}
