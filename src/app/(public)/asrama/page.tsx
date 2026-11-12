import type { Metadata } from "next";
import Image from "next/image";
import { getSection } from "@/lib/data";
import { imageAspectFromUrl } from "@/lib/image-presets";
import { ContactCta, Photo } from "@/components/public-parts";
import { LocalizedText } from "@/components/language-runtime";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata(
  "/asrama",
  "Center & Fasilitas",
  "Kenali Center Cahaya Haluan Pulau, fasilitas yang tersedia, sasaran penghuni, dan informasi resmi dari pengurus.",
);

export default async function Accommodation() {
  const data = await getSection("accommodation");
  const facilities = Array.isArray(data.facilities)
    ? data.facilities as { name?: string; nameEn?: string; description?: string; descriptionEn?: string; visible?: boolean; image?: string }[]
    : [];
  const visibleFacilities = facilities.filter(facility => facility.visible && typeof facility.name === "string" && facility.name.trim());
  const primaryFacilities = visibleFacilities.slice(0, 3).map(facility => ({
    id: typeof facility.name === "string" ? facility.name.trim() : "",
    en: facility.nameEn?.trim() || facility.name?.trim() || "",
  })).filter(facility => facility.id);
  const accommodationFacts = [
    { label: "Lokasi", value: typeof data.publicAddress === "string" ? data.publicAddress.trim() : "", en: typeof data.publicAddressEn === "string" ? data.publicAddressEn.trim() : "" },
    { label: "Fasilitas utama", value: primaryFacilities.map(facility => facility.id).join(", "), en: primaryFacilities.map(facility => facility.en).join(", ") },
    { label: "Sasaran penghuni", value: typeof data.targetResidents === "string" ? data.targetResidents.trim() : "", en: typeof data.targetResidentsEn === "string" ? data.targetResidentsEn.trim() : "" },
  ].filter(fact => fact.value);
  const faqs = Array.isArray(data.faqs) ? data.faqs as { question: string; questionEn?: string; answer: string; answerEn?: string }[] : [];

  return <div className="accommodation-page">
    <div className="page-hero">
      <div className="container">
        <span className="eyebrow">Tempat tinggal</span>
        <h1>Center & Fasilitas</h1>
        <p className="lead">Kenali lokasi, fasilitas, dan sasaran penghuni sebelum menghubungi pengurus.</p>
      </div>
    </div>
    <section className="section accommodation-overview-section">
      <div className="container accommodation-layout">
        <div className="accommodation-copy">
          <h2>Gambaran Center</h2>
          <p className="lead accommodation-description"><LocalizedText id={String(data.description || "Penjelasan kondisi Center sedang dilengkapi oleh pengurus.")} en={typeof data.descriptionEn === "string" ? data.descriptionEn : undefined} /></p>
          {accommodationFacts.length > 0 && <dl className="accommodation-facts">
            {accommodationFacts.map(fact => <div key={fact.label}><dt>{fact.label}</dt><dd><LocalizedText id={fact.value} en={fact.en} /></dd></div>)}
          </dl>}
        </div>
        <div className="accommodation-visual">
          <Photo src={typeof data.image === "string" ? data.image : null} aspectRatio={4 / 3}
            alt="Dokumentasi kondisi Center" label="Foto bangunan perlu dilengkapi" />
        </div>
      </div>
    </section>
    <section className="section accent-section">
      <div className="container">
        <span className="eyebrow">Informasi terverifikasi</span>
        <h2>Fasilitas</h2>
        {visibleFacilities.length ? <div className="card-grid">
          {visibleFacilities.map((facility, index) => {
            const aspect = imageAspectFromUrl(facility.image, 16 / 10);

            return <div className="content-card" key={index}>
              {facility.image && <div className="card-image" style={{ aspectRatio: aspect }}>
                <Image src={facility.image} alt={`Foto fasilitas ${facility.name}`} width={600} height={Math.round(600 / aspect)}
                  sizes="(max-width: 560px) calc(100vw - 120px), (max-width: 800px) calc((100vw - 152px) / 2), (max-width: 1240px) calc((100vw - 220px) / 3), 320px" />
              </div>}
              <h3><LocalizedText id={facility.name || ""} en={facility.nameEn} /></h3>
              <p><LocalizedText id={facility.description || ""} en={facility.descriptionEn} /></p>
            </div>;
          })}
        </div> : <div className="empty">
          <h3>Daftar fasilitas sedang diverifikasi</h3>
          <p>Pengurus akan menerbitkan fasilitas setelah informasi dan dokumentasinya tersedia.</p>
        </div>}
      </div>
    </section>
    <section className="section">
      <div className="container" style={{ maxWidth: 860 }}>
        <span className="eyebrow">Pertanyaan umum</span>
        <h2>Hal yang sering ditanyakan</h2>
        {faqs.length ? <div className="faq">
          {faqs.map((faq, index) => <details key={index}>
            <summary><LocalizedText id={faq.question} en={faq.questionEn} /></summary>
            <p><LocalizedText id={faq.answer} en={faq.answerEn} /></p>
          </details>)}
        </div> : <div className="empty">
          <h3>Pertanyaan umum belum tersedia</h3>
          <p>Silakan hubungi pengurus untuk informasi lebih lanjut.</p>
        </div>}
      </div>
    </section>
    <ContactCta />
  </div>;
}
