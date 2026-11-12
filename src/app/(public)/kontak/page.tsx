import type { Metadata } from "next";
import { getSection } from "@/lib/data";
import { ContactWhatsAppLink } from "@/components/contact-whatsapp-link";
import { pageMetadata } from "@/lib/seo";
import { LocalizedText } from "@/components/language-runtime";

export const metadata: Metadata = pageMetadata(
  "/kontak",
  "Kontak Pengurus",
  "Temukan cara menghubungi pengurus Cahaya Haluan Pulau melalui WhatsApp dan informasi kontak resmi lainnya.",
);

export default async function Contact() {
  const contact = await getSection("contact");
  const map = typeof contact.mapUrl === "string" && /^https:\/\/(www\.)?google\.com\/maps\/embed\?/.test(contact.mapUrl)
    ? contact.mapUrl : null;
  const isEmail = (value: unknown): value is string => typeof value === "string" && /^[^@]+@[^@]+\.[^@]+$/.test(value.trim());
  const emailSuaraAnakPulau = Object.prototype.hasOwnProperty.call(contact, "emailSuaraAnakPulau")
    ? isEmail(contact.emailSuaraAnakPulau) ? contact.emailSuaraAnakPulau.trim() : null
    : isEmail(contact.email) ? contact.email.trim() : null;
  const emailUrx1 = isEmail(contact.emailUrx1) ? contact.emailUrx1.trim() : null;

  return <div className="contact-page">
    <div className="page-hero">
      <div className="container">
        <span className="eyebrow">Hubungi kami</span>
        <h1>Bicara dengan pengurus</h1>
        <p className="lead">Tanyakan informasi tempat tinggal dan penerimaan secara langsung.</p>
      </div>
    </div>
    <section className="section contact-overview-section">
      <div className="container contact-overview">
        <div className="contact-whatsapp-card">
          <span className="eyebrow">Kontak utama</span>
          <h2>WhatsApp pengurus</h2>
          <p>Hubungi pengurus melalui WhatsApp untuk bertanya tentang tempat tinggal dan penerimaan.</p>
          <ContactWhatsAppLink
            phone={typeof contact.whatsapp === "string" ? contact.whatsapp : null}
            message={typeof contact.whatsappMessage === "string" ? contact.whatsappMessage : null}
            messageEn={typeof contact.whatsappMessageEn === "string" ? contact.whatsappMessageEn : null}
          />
        </div>
        <div className="content-card contact-details-card">
          <span className="eyebrow">Informasi lainnya</span>
          <h3>Kontak resmi</h3>
          <div className="contact-email-grid" role="group" aria-label="Email resmi">
            {[
              { label: "Suara Anak Pulau", email: emailSuaraAnakPulau },
              { label: "URX1", email: emailUrx1 },
            ].map(({ label, email: address }) => <div className="contact-email-card" key={label}>
              <span className="contact-email-label">{label}</span>
              {address ? <a href={`mailto:${address}`} className="contact-email">{address.split(/([@.])/).map((part, index) => <span key={index}>{part}{(part === "@" || part === ".") && <wbr />}</span>)}</a> : <span className="contact-email-missing">Perlu dilengkapi</span>}
            </div>)}
          </div>
          <dl className="contact-info-list">
            <div className="contact-info-row"><dt>Alamat</dt><dd><LocalizedText id={String(contact.publicAddress || "Perlu dilengkapi")} en={typeof contact.publicAddressEn === "string" ? contact.publicAddressEn : undefined} /></dd></div>
            <div className="contact-info-row"><dt>Jam kontak</dt><dd><LocalizedText id={String(contact.contactHours || "Perlu dilengkapi")} en={typeof contact.contactHoursEn === "string" ? contact.contactHoursEn : undefined} /></dd></div>
          </dl>
        </div>
      </div>
    </section>
    {map && <section id="lokasi" className="section contact-location-section" aria-labelledby="contact-location-title">
      <div className="container">
        <div className="contact-location-heading">
          <span className="eyebrow">Lokasi</span>
          <h2 id="contact-location-title">Temukan kami</h2>
        </div>
        <div className="contact-map-frame">
          <iframe title="Peta lokasi Cahaya Haluan Pulau" src={map} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
        </div>
      </div>
    </section>}
  </div>;
}
