import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function HomeHero({ profile }: { profile: Record<string, unknown> }) {
  const heroImage = typeof profile.heroImage === "string" && profile.heroImage.trim() ? profile.heroImage : null;

  return <section className="hero home-hero">
    <div className="hero-visual has-photo" aria-hidden="true">
      {heroImage
        ? <Image src={heroImage} alt="" fill priority sizes="100vw" className="hero-visual-image" />
        : <picture className="hero-artwork">
            <source media="(max-width: 800px)" srcSet="/hero-lighthouse-mobile.webp" />
            <img src="/hero-lighthouse.webp" alt="" className="hero-visual-image" fetchPriority="high" />
          </picture>}
    </div>
    <div className="container hero-content">
      <span className="eyebrow">Cahaya Haluan Pulau · Informasi Asrama</span>
      <h1>{String(profile.heroTitle || "Tempat tinggal untuk melanjutkan pendidikan di Pulau Jawa.")}</h1>
      <p className="lead">{String(profile.heroDescription || "Kenali Cahaya Haluan Pulau, informasi asrama, kegiatan, dan cara menghubungi pengurus dalam satu tempat.")}</p>
      <div className="hero-actions">
        <Link className="btn btn-primary" href="/kontak">Lihat Kontak <ArrowRight size={18}/></Link>
        <Link className="btn btn-outline" href="/asrama">Lihat Asrama</Link>
      </div>
      <p className="hero-note">Informasi biaya, lokasi, dan persyaratan akan dilengkapi oleh pengurus.</p>
    </div>
  </section>;
}
