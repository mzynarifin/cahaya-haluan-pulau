import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { getSection } from "@/lib/data";
import { whatsappHref, whatsappMessage } from "@/lib/config";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata(
  "/kontak",
  "Kontak Pengurus",
  "Temukan cara menghubungi pengurus Cahaya Haluan Pulau melalui WhatsApp dan informasi kontak resmi lainnya.",
);

export default async function Contact() {
  const contact = await getSection("contact");
  const message = typeof contact.whatsappMessage === "string" && contact.whatsappMessage.trim()
    ? contact.whatsappMessage.trim()
    : whatsappMessage;
  const wa = whatsappHref(typeof contact.whatsapp === "string" ? contact.whatsapp : null, message);
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
          {wa ? <a className="btn contact-whatsapp-cta" href={wa} target="_blank" rel="noopener noreferrer">
            Hubungi Pengurus via WhatsApp <ArrowUpRight size={18} aria-hidden="true" />
          </a> : <div className="notice">Nomor WhatsApp resmi belum tersedia. Silakan gunakan informasi kontak lain yang tercantum di halaman ini.</div>}
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
            <div className="contact-info-row"><dt>Alamat</dt><dd>{String(contact.publicAddress || "Perlu dilengkapi")}</dd></div>
            <div className="contact-info-row"><dt>Jam kontak</dt><dd>{String(contact.contactHours || "Perlu dilengkapi")}</dd></div>
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
