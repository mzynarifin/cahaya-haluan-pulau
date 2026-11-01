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
  const profileDetails = [
    { number: "01", title: "Sejarah", content: profile.history },
    { number: "02", title: "Visi", content: profile.vision },
    { number: "03", title: "Misi", content: profile.mission },
  ].filter((detail) => Boolean(detail.content));

  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "AboutPage", "@id": `${siteUrl}/tentang#about`, url: `${siteUrl}/tentang`, name: `Tentang ${siteName}`, inLanguage: "id-ID", about: { "@id": `${siteUrl}/#organization` }, isPartOf: { "@id": `${siteUrl}/#website` } }).replace(/</g, "\\u003c") }} />
    <div className="page-hero"><div className="container">
      <span className="eyebrow">Tentang kami</span>
      <h1>Mengenal Cahaya Haluan Pulau</h1>
      <p className="lead">Profil lembaga dan orang-orang yang mengelola informasi tempat tinggal.</p>
    </div></div>
    <section className="section about-profile-section" aria-labelledby="about-profile-title">
      <div className="container">
        <div className="about-profile">
          <div className="about-profile-copy">
            <span className="eyebrow">Profil lembaga</span>
            <h2 id="about-profile-title">{String(profile.name || "Cahaya Haluan Pulau")}</h2>
            <p className="about-profile-intro">{String(profile.description || "Informasi profil resmi sedang disiapkan oleh pengurus.")}</p>
          </div>
          <div className="about-profile-visual">
            <Photo src={typeof profile.aboutImage === "string" ? profile.aboutImage : null} aspectRatio={4 / 3}
              alt="Dokumentasi kegiatan Cahaya Haluan Pulau" label="Foto kegiatan perlu dilengkapi" />
          </div>
        </div>
        {profileDetails.length > 0 && <div className="about-profile-details">
          {profileDetails.map((detail) => <section className="about-profile-detail" key={detail.number}>
            <div className="about-profile-detail-heading">
              <span aria-hidden="true">{detail.number}</span>
              <h3>{detail.title}</h3>
            </div>
            <p>{String(detail.content)}</p>
          </section>)}
        </div>}
      </div>
    </section>
    <section className="section accent-section" id="pengurus"><div className="container">
      <div className="section-head"><div><span className="eyebrow">Pengurus</span><h2>Kenali pengurus</h2></div></div>
      <TeamCards items={members} />
    </div></section>
    <ContactCta />
  </>;
}
