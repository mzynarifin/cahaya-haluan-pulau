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
  const email = typeof contact.email === "string" && /^[^@]+@[^@]+\.[^@]+$/.test(contact.email)
    ? contact.email : null;

  return <>
    <div className="page-hero"><div className="container">
      <span className="eyebrow">Hubungi kami</span>
      <h1>Bicara dengan pengurus</h1>
      <p className="lead">Tanyakan informasi tempat tinggal dan penerimaan secara langsung.</p>
    </div></div>
    <section className="section"><div className="container split">
      <div>
        <h2>WhatsApp pengurus</h2>
        <p>Klik tombol untuk menghubungi pengurus melalui WhatsApp.</p>
        {wa ? <>
          <a className="btn btn-primary" href={wa} target="_blank" rel="noopener noreferrer">
            Hubungi Pengurus via WhatsApp <ArrowUpRight size={18}/>
          </a>
        </> : <div className="notice">Nomor WhatsApp resmi belum tersedia. Silakan gunakan informasi kontak lain yang tercantum di halaman ini.</div>}
      </div>
      <div className="content-card contact-details-card"><h3>Informasi lain</h3><dl className="contact-info-list">
        <div className="contact-info-row"><dt>Email</dt><dd>{email ? <a href={`mailto:${email}`} className="link-arrow contact-email">{email.split(/([@.])/).map((part, index) => <span key={index}>{part}{(part === "@" || part === ".") && <wbr/>}</span>)}</a> : "Perlu dilengkapi"}</dd></div>
        <div className="contact-info-row"><dt>Alamat</dt><dd>{String(contact.publicAddress || "Perlu dilengkapi")}</dd></div>
        <div className="contact-info-row"><dt>Jam kontak</dt><dd>{String(contact.contactHours || "Perlu dilengkapi")}</dd></div>
      </dl></div>
    </div></section>
    {map && <section id="lokasi" className="section" aria-labelledby="contact-location-title" style={{ paddingTop: 0 }}>
      <div className="container"><h2 id="contact-location-title">Lokasi</h2>
        <iframe title="Peta lokasi Cahaya Haluan Pulau" src={map} loading="lazy" referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen style={{ width: "100%", height: "clamp(280px, 42vw, 460px)", border: 0, borderRadius: 12 }} />
      </div>
    </section>}
  </>;
}
