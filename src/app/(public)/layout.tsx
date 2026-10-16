import Link from "next/link";
import { PublicHeader, Brand } from "@/components/public-header";
import { PublicPageMotion } from "@/components/public-page-motion";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <>
    <PublicHeader/>
    <PublicPageMotion>{children}</PublicPageMotion>
    <footer className="site-footer"><div className="container"><div className="footer-grid">
      <div><Brand/><p style={{maxWidth:370,marginTop:20}}>Informasi tentang Cahaya Haluan Pulau dan tempat tinggal untuk melanjutkan pendidikan di Pulau Jawa.</p></div>
      <div><strong>Jelajahi</strong><div className="footer-links" style={{marginTop:14}}><Link href="/tentang">Tentang</Link><Link href="/asrama">Asrama & Fasilitas</Link><Link href="/berita">Berita</Link><Link href="/galeri">Galeri</Link></div></div>
      <div><strong>Informasi</strong><div className="footer-links" style={{marginTop:14}}><Link href="/kontak">Kontak</Link><Link href="/kebijakan-privasi">Kebijakan Privasi</Link><Link href="/admin/login">Masuk Admin</Link></div></div>
    </div><div className="footer-bottom"><span>© {new Date().getFullYear()} Cahaya Haluan Pulau</span><span>Informasi operasional dilengkapi oleh pengurus.</span></div></div></footer>
  </>;
}
