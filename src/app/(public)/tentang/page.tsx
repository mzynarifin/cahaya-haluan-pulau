import type { Metadata } from "next";
import { getSection } from "@/lib/data";
import { ContactCta, Photo } from "@/components/public-parts";
import { TeamCards, type TeamMember } from "@/components/team-cards";
import { pageMetadata } from "@/lib/seo";
import { siteName, siteUrl } from "@/lib/config";

export const metadata: Metadata = pageMetadata("/tentang", "Profil, Visi, Misi, dan Pengurus", "Pelajari profil, sejarah, visi, misi, dan pengurus Cahaya Haluan Pulau melalui halaman resmi lembaga.");

export default async function About() {
  const [profile, team] = await Promise.all([getSection("profile"), getSection("team")]);
  const members = Array.isArray(team.members) ? team.members as TeamMember[] : [];

  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "AboutPage", "@id": `${siteUrl}/tentang#about`, url: `${siteUrl}/tentang`, name: `Tentang ${siteName}`, inLanguage: "id-ID", about: { "@id": `${siteUrl}/#organization` }, isPartOf: { "@id": `${siteUrl}/#website` } }).replace(/</g, "\\u003c") }} />
    <div className="page-hero"><div className="container">
      <span className="eyebrow">Tentang kami</span>
      <h1>Mengenal Cahaya Haluan Pulau</h1>
      <p className="lead">Profil lembaga dan orang-orang yang mengelola informasi tempat tinggal.</p>
    </div></div>
    <section className="section"><div className="container split about-profile">
      <div>
        <span className="eyebrow">Profil</span>
        <h2>{String(profile.name || "Cahaya Haluan Pulau")}</h2>
        <p className="lead">{String(profile.description || "Informasi profil resmi sedang disiapkan oleh pengurus.")}</p>
        {Boolean(profile.history) && <><h3>Sejarah</h3><p>{String(profile.history)}</p></>}
        {Boolean(profile.vision) && <><h3>Visi</h3><p>{String(profile.vision)}</p></>}
        {Boolean(profile.mission) && <><h3>Misi</h3><p>{String(profile.mission)}</p></>}
      </div>
      <Photo src={typeof profile.aboutImage === "string" ? profile.aboutImage : null} aspectRatio={4 / 3}
        alt="Dokumentasi kegiatan Cahaya Haluan Pulau" label="Foto kegiatan perlu dilengkapi" />
    </div></section>
    <section className="section accent-section" id="pengurus"><div className="container">
      <div className="section-head"><div><span className="eyebrow">Pengurus</span><h2>Kenali pengurus</h2></div></div>
      <TeamCards items={members} />
    </div></section>
    <ContactCta />
  </>;
}
