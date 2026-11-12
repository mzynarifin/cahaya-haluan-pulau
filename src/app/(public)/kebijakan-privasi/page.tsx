import type { Metadata } from "next";
import { LocalizedText } from "@/components/language-runtime";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata(
  "/kebijakan-privasi",
  "Kebijakan Privasi",
  "Informasi tentang data yang digunakan pada website Cahaya Haluan Pulau dan cara menghubungi pengurus terkait privasi.",
);

export default function Privacy() {
  return <>
    <div className="page-hero"><div className="container">
      <span className="eyebrow"><LocalizedText id="Privasi" en="Privacy" /></span>
      <h1><LocalizedText id="Kebijakan Privasi" en="Privacy Policy" /></h1>
      <p className="lead"><LocalizedText id="Ringkasan pengelolaan data pada website ini. Pengurus perlu menyetujui kebijakan final sebelum peluncuran." en="This page summarizes how data is handled on this website. The team must approve the final policy before launch." /></p>
    </div></div>
    <section className="section"><div className="container article">
      <h2><LocalizedText id="Pengunjung website" en="Website visitors" /></h2>
      <p><LocalizedText id="Halaman publik dapat dibaca tanpa akun. Website ini tidak menyediakan formulir pendaftaran penghuni atau pelacakan status secara publik." en="Public pages can be read without an account. This website does not provide a public resident application form or application status tracking." /></p>
      <h2><LocalizedText id="Kontak melalui WhatsApp" en="Contacting us on WhatsApp" /></h2>
      <p><LocalizedText id="Tombol kontak membuka layanan WhatsApp milik pihak ketiga. Informasi yang Anda kirim melalui WhatsApp mengikuti ketentuan layanan tersebut dan pengelolaan pengurus." en="The contact button opens the third-party WhatsApp service. Information you send through WhatsApp is subject to that service's terms and the team's handling practices." /></p>
      <h2><LocalizedText id="Data calon penghuni" en="Prospective resident information" /></h2>
      <p><LocalizedText id="Pengurus hanya mencatat data calon penghuni di area admin setelah persetujuan pencatatan. Data itu digunakan untuk tindak lanjut penerimaan dan tidak ditampilkan pada website publik." en="The team records prospective resident information in the admin area only after receiving consent. The information is used for admissions follow-up and is not shown on the public website." /></p>
      <h2><LocalizedText id="Permintaan terkait data" en="Requests about your information" /></h2>
      <p><LocalizedText id="Hubungi pengurus melalui halaman Kontak untuk menanyakan, memperbaiki, atau meminta penghapusan data. Rincian retensi dan kontak penanggung jawab perlu ditetapkan pengurus sebelum website menerima data nyata." en="Contact the team through the Contact page to ask about, correct, or request deletion of your information. The team must define retention details and a responsible contact before the website collects real information." /></p>
    </div></section>
  </>;
}
