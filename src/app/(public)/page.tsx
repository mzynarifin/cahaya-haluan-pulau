import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getAlbums, getNews, getSection } from "@/lib/data";
import { ContactCta, NewsCards, Photo } from "@/components/public-parts";
import { HomeHero } from "@/components/home-hero";
import { AlbumCards } from "@/components/album-cards";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "/",
  "Informasi Center dan Kegiatan",
  "Kenali Cahaya Haluan Pulau: profil, informasi Center, fasilitas, kegiatan, berita terbaru, dan kontak resmi pengurus.",
);

export default async function Home() {
  const [profile, accommodation, news, albums] = await Promise.all([
    getSection("profile"),
    getSection("accommodation"),
    getNews(1),
    getAlbums(),
  ]);
  const publicFacilities = Array.isArray(accommodation.facilities)
    ? (accommodation.facilities as { name?: string; visible?: boolean }[])
      .filter(facility => facility.visible && typeof facility.name === "string" && facility.name.trim())
      .slice(0, 3)
      .map(facility => typeof facility.name === "string" ? facility.name.trim() : "")
      .filter(Boolean)
      .join(", ")
    : "";
  const accommodationFacts = [
    { label: "Lokasi", value: typeof accommodation.publicAddress === "string" ? accommodation.publicAddress.trim() : "" },
    { label: "Fasilitas utama", value: publicFacilities },
    { label: "Sasaran penghuni", value: typeof accommodation.targetResidents === "string" ? accommodation.targetResidents.trim() : "" },
  ].filter(fact => fact.value);

  return <div className="home-page">
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
            <h2>Kenali Center sebelum menghubungi pengurus</h2>
            <p className="lead accommodation-description">{String(accommodation.description || "Penjelasan kondisi Center sedang dilengkapi oleh pengurus.")}</p>
            {accommodationFacts.length > 0 && <dl className="accommodation-facts">
              {accommodationFacts.map(fact => <div key={fact.label}><dt>{fact.label}</dt><dd>{fact.value}</dd></div>)}
            </dl>}
            <Link href="/asrama" className="btn btn-primary accommodation-cta">Lihat Center & Fasilitas <ArrowRight size={17} aria-hidden="true" /></Link>
          </div>
          <div className="accommodation-visual">
            <Photo aspectRatio={4 / 3} src={typeof accommodation.image === "string" ? accommodation.image : null} alt="Dokumentasi bangunan atau ruang Center" label="Foto Center perlu dilengkapi" />
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
  </div>;
}
