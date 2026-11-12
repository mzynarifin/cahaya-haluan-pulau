"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, Building2, Images, Newspaper, UsersRound } from "lucide-react";

export function DashboardContent({ counts }: { counts: [number | null, number | null, number | null, number | null] }) {
  const [en, setEn] = useState(false);
  useEffect(() => { const sync = () => setEn(document.documentElement.dataset.language === "en"); sync(); window.addEventListener("chp-language-change", sync); return () => window.removeEventListener("chp-language-change", sync); }, []);
  const stats = [
    { label: en ? "News drafts" : "Draft berita", value: counts[0], icon: Newspaper },
    { label: en ? "Published news" : "Berita terbit", value: counts[1], icon: Newspaper },
    { label: en ? "Albums" : "Album", value: counts[2], icon: Images },
    { label: en ? "Active applicants" : "Calon penghuni aktif", value: counts[3], icon: UsersRound },
  ];
  const cards = [
    { title: en ? "News" : "Berita", description: en ? "Write, preview, and publish the latest updates." : "Tulis, pratinjau, dan terbitkan kabar terbaru.", href: "/admin/berita", icon: Newspaper, action: en ? "Manage news" : "Kelola berita" },
    { title: en ? "Center information" : "Informasi Center", description: en ? "Update verified Center information." : "Perbarui informasi Center yang sudah diverifikasi.", href: "/admin/asrama", icon: Building2, action: en ? "Edit information" : "Ubah informasi" },
    { title: en ? "Applicants" : "Calon penghuni", description: en ? "Review applications and record follow-ups." : "Lihat pendaftaran dan catat tindak lanjutnya.", href: "/admin/pendaftar", icon: UsersRound, action: en ? "View applicants" : "Lihat daftar" },
  ];
  return <>
    <div className="admin-page-head"><div><span className="eyebrow">{en ? "OVERVIEW" : "RINGKASAN"}</span><h1>{en ? "Welcome back" : "Selamat datang"}</h1><p>{en ? "Manage website content and applicant records from one place." : "Pantau konten website dan pencatatan calon penghuni dari satu tempat."}</p></div></div>
    <section aria-label={en ? "Data overview" : "Ringkasan data"} className="stat-grid">{stats.map(({ label, value, icon: Icon }) => <div className="stat" key={label}><span className="admin-stat-icon"><Icon size={20} strokeWidth={1.9} aria-hidden="true" /></span><strong>{value ?? "—"}</strong><span>{label}</span></div>)}</section>
    <section className="admin-quick-section" aria-labelledby="admin-quick-title"><div className="admin-section-head"><div><span className="eyebrow">{en ? "QUICK ACCESS" : "AKSES CEPAT"}</span><h2 id="admin-quick-title">{en ? "Manage your workspace" : "Mulai mengelola"}</h2></div></div><div className="admin-quick-grid">{cards.map(({ title, description, href, icon: Icon, action }) => <Link className="admin-quick-card" href={href} key={href}><span className="admin-quick-icon"><Icon size={21} strokeWidth={1.9} aria-hidden="true" /></span><h3>{title}</h3><p>{description}</p><span className="admin-quick-action">{action}<ArrowUpRight size={17} aria-hidden="true" /></span></Link>)}</div></section>
  </>;
}
