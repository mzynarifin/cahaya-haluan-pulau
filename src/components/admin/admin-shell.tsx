"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowUpRight, Building2, ContactRound, Images, LayoutDashboard,
  LogOut, Menu, Newspaper, Phone, UsersRound, X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/browser";

const navigation = [
  { title: "Utama", items: [{ href: "/admin", label: "Ringkasan", icon: LayoutDashboard }] },
  { title: "Konten website", items: [
    { href: "/admin/berita", label: "Berita", icon: Newspaper },
    { href: "/admin/galeri", label: "Galeri", icon: Images },
    { href: "/admin/profil", label: "Profil", icon: ContactRound },
    { href: "/admin/asrama", label: "Asrama", icon: Building2 },
    { href: "/admin/pengurus", label: "Pengurus", icon: UsersRound },
    { href: "/admin/kontak", label: "Kontak", icon: Phone },
  ] },
  { title: "Administrasi", items: [{ href: "/admin/pendaftar", label: "Calon penghuni", icon: ContactRound }] },
];

export function AdminShell({ children, email }: { children: React.ReactNode; email: string }) {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  const router = useRouter();

  async function logout() {
    await createClient()?.auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  }

  return <>
    <div className="admin-mobile-top">
      <Link href="/admin" className="admin-mobile-brand">Cahaya Haluan Pulau <small>Admin</small></Link>
      <button className="menu-button" type="button" onClick={() => setOpen(!open)}
        aria-label={open ? "Tutup menu admin" : "Buka menu admin"} aria-controls="admin-sidebar" aria-expanded={open}>
        {open ? <X size={21} /> : <Menu size={21} />}
      </button>
    </div>
    {open && <button type="button" className="admin-backdrop" aria-label="Tutup menu admin" onClick={() => setOpen(false)} />}
    <div className="admin-shell">
      <aside id="admin-sidebar" className={`admin-sidebar ${open ? "open" : ""}`}>
        <Link href="/admin" className="admin-brand" onClick={() => setOpen(false)}>
          <span className="admin-brand-image"><Image src="/logo-cahaya-haluan-pulau.jpg" alt="" width={46} height={46} priority /></span>
          <span><strong>Cahaya Haluan Pulau</strong><small>Panel pengelola</small></span>
        </Link>
        <nav className="admin-nav" aria-label="Navigasi admin">
          {navigation.map(group => <div className="admin-nav-group" key={group.title}>
            <span className="admin-nav-heading">{group.title}</span>
            {group.items.map(({ href, label, icon: Icon }) => {
              const active = path === href || (href !== "/admin" && path.startsWith(`${href}/`));
              return <Link href={href} key={href} className={active ? "active" : ""}
                aria-current={active ? "page" : undefined} onClick={() => setOpen(false)}>
                <Icon size={18} strokeWidth={1.9} aria-hidden="true" /><span>{label}</span>
              </Link>;
            })}
          </div>)}
        </nav>
        <div className="admin-sidebar-footer">
          <Link href="/" onClick={() => setOpen(false)}>Lihat situs <ArrowUpRight size={16} aria-hidden="true" /></Link>
        </div>
      </aside>
      <div className="admin-main">
        <div className="admin-main-inner">
          <header className="admin-top">
            <div><span className="admin-workspace-label">Ruang kerja</span><strong>Panel admin</strong></div>
            <div className="admin-account"><span className="admin-account-email" title={email}>{email}</span>
              <button onClick={logout} className="btn btn-quiet" type="button"><LogOut size={17} aria-hidden="true" /> Keluar</button>
            </div>
          </header>
          <main id="main"><div key={path} className="admin-page-enter">{children}</div></main>
        </div>
      </div>
    </div>
  </>;
}
