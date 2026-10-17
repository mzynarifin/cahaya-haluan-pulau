import { getImageProps } from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function HomeHero({ profile }: { profile: Record<string, unknown> }) {
  const desktopUpload = typeof profile.heroImage === "string" && profile.heroImage.trim() ? profile.heroImage : null;
  const mobileUpload = typeof profile.heroImageMobile === "string" && profile.heroImageMobile.trim() ? profile.heroImageMobile : null;
  const desktopImage = desktopUpload || "/hero-lighthouse.webp";
  const mobileImage = mobileUpload || (desktopUpload ? desktopImage : "/hero-lighthouse-mobile.webp");
  const { props: desktopProps } = getImageProps({ src: desktopImage, alt: "", fill: true, sizes: "100vw", priority: true });
  const { props: mobileProps } = getImageProps({ src: mobileImage, alt: "", fill: true, sizes: "100vw" });

  return <section className="hero home-hero">
    <div className="hero-visual has-photo" aria-hidden="true">
      <picture className="hero-artwork">
        <source media="(max-width: 800px)" srcSet={mobileProps.srcSet} sizes={mobileProps.sizes} />
        <img {...desktopProps} className="hero-visual-image" alt="" />
      </picture>
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
