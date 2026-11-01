import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getAlbums, getNews, getSection } from "@/lib/data";
import { ContactCta, NewsCards, Photo } from "@/components/public-parts";
import { HomeHero } from "@/components/home-hero";
import { AlbumCards } from "@/components/album-cards";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "/",
  "Informasi Asrama dan Kegiatan",
  "Kenali Cahaya Haluan Pulau: profil, informasi asrama, fasilitas, kegiatan, berita terbaru, dan kontak resmi pengurus.",
);

export default async function Home() {
  const [profile, accommodation, news, albums] = await Promise.all([
    getSection("profile"),
    getSection("accommodation"),
    getNews(1),
    getAlbums(),
  ]);

  return <>
    <HomeHero profile={profile} />
    <section className="section accent-section home-intro-section" aria-labelledby="home-intro-title">
      <div className="container home-intro-grid">
        <div className="home-intro-heading">
          <span className="eyebrow">Mengenal kami</span>
          <h2 id="home-intro-title">Informasi yang jelas untuk calon penghuni dan keluarga.</h2>
        </div>
        <div className="home-intro-copy">
          <p>{String(profile.description || "Cahaya Haluan Pulau menyediakan informasi tentang tempat tinggal bagi mereka yang ingin melanjutkan pendidikan di Pulau Jawa.")}</p>
          <Link href="/tentang" className="link-arrow">Baca profil lembaga <ArrowRight size={18} aria-hidden="true" /></Link>
        </div>
      </div>
    </section>
    <section className="section home-accommodation-section">
      <div className="container">
        <div className="accommodation-layout">
          <div className="accommodation-copy">
            <span className="eyebrow">Tempat tinggal</span>
            <h2>Kenali asrama sebelum menghubungi pengurus</h2>
            <p className="lead accommodation-description">{String(accommodation.description || "Penjelasan kondisi asrama sedang dilengkapi oleh pengurus.")}</p>
            <dl className="accommodation-facts">
              <div><dt>Lokasi</dt><dd>{String(accommodation.publicAddress || "Perlu dilengkapi oleh pengurus")}</dd></div>
              <div><dt>Biaya</dt><dd>{String(accommodation.feeDescription || "Perlu dikonfirmasi kepada pengurus")}</dd></div>
              <div><dt>Syarat</dt><dd>{String(accommodation.requirements || "Perlu dikonfirmasi kepada pengurus")}</dd></div>
            </dl>
            <Link href="/asrama" className="btn btn-primary accommodation-cta">Lihat Asrama & Fasilitas <ArrowRight size={17} aria-hidden="true" /></Link>
          </div>
          <div className="accommodation-visual">
            <Photo aspectRatio={4 / 3} src={typeof accommodation.image === "string" ? accommodation.image : null} alt="Dokumentasi bangunan atau ruang asrama" label="Foto asrama perlu dilengkapi" />
          </div>
        </div>
      </div>
    </section>
    <section className="section accent-section">
      <div className="container">
        <div className="section-head">
          <div><span className="eyebrow">Dokumentasi</span><h2>Kegiatan dan kebersamaan</h2></div>
          <Link href="/galeri" className="link-arrow">Semua album <ArrowRight size={18} /></Link>
        </div>
        <AlbumCards items={albums.slice(0, 3)} />
      </div>
    </section>
    <section className="section">
      <div className="container">
        <div className="section-head">
          <div><span className="eyebrow">Kabar terbaru</span><h2>Berita dari pengurus</h2></div>
          <Link href="/berita" className="link-arrow">Semua berita <ArrowRight size={18} /></Link>
        </div>
        <NewsCards items={news.items.slice(0, 3)} />
      </div>
    </section>
    <ContactCta />
  </>;
}
