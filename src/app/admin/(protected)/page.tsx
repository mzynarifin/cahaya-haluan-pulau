import Link from "next/link";
import { ArrowUpRight, Building2, Images, Newspaper, UsersRound } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function Dashboard() {
  const client = await createClient();
  const [draft, published, albums, applicants] = await Promise.all([
    client!.from("news").select("id", { count: "exact", head: true }).eq("status", "draft"),
    client!.from("news").select("id", { count: "exact", head: true }).eq("status", "published"),
    client!.from("albums").select("id", { count: "exact", head: true }),
    client!.from("applicants").select("id", { count: "exact", head: true }).in("status", ["Baru", "Dihubungi", "Diproses"]),
  ]);
  const stats = [
    { label: "Draft berita", value: draft.count, icon: Newspaper },
    { label: "Berita terbit", value: published.count, icon: Newspaper },
    { label: "Album", value: albums.count, icon: Images },
    { label: "Calon penghuni aktif", value: applicants.count, icon: UsersRound },
  ];
  const shortcuts = [
    { title: "Berita", description: "Tulis, pratinjau, dan terbitkan kabar terbaru.", href: "/admin/berita", icon: Newspaper, action: "Kelola berita" },
    { title: "Informasi asrama", description: "Perbarui informasi tempat tinggal yang sudah diverifikasi.", href: "/admin/asrama", icon: Building2, action: "Ubah informasi" },
    { title: "Calon penghuni", description: "Lihat pendaftaran dan catat tindak lanjutnya.", href: "/admin/pendaftar", icon: UsersRound, action: "Lihat daftar" },
  ];

  return <>
    <div className="admin-page-head">
      <div><span className="eyebrow">Ringkasan</span><h1>Selamat datang</h1>
        <p>Pantau konten website dan pencatatan calon penghuni dari satu tempat.</p></div>
    </div>
    <section aria-label="Ringkasan data" className="stat-grid">
      {stats.map(({ label, value, icon: Icon }) => <div className="stat" key={label}>
        <span className="admin-stat-icon"><Icon size={20} strokeWidth={1.9} aria-hidden="true" /></span>
        <strong>{value ?? "—"}</strong><span>{label}</span>
      </div>)}
    </section>
    <section className="admin-quick-section" aria-labelledby="admin-quick-title">
      <div className="admin-section-head"><div><span className="eyebrow">Akses cepat</span><h2 id="admin-quick-title">Mulai mengelola</h2></div></div>
      <div className="admin-quick-grid">{shortcuts.map(({ title, description, href, icon: Icon, action }) =>
        <Link className="admin-quick-card" href={href} key={href}>
          <span className="admin-quick-icon"><Icon size={21} strokeWidth={1.9} aria-hidden="true" /></span>
          <h3>{title}</h3><p>{description}</p>
          <span className="admin-quick-action">{action}<ArrowUpRight size={17} aria-hidden="true" /></span>
        </Link>)}</div>
    </section>
  </>;
}
