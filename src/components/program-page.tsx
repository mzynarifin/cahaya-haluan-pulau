"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const programs = {
  "cahaya-anak-pulau": { title: "Cahaya Anak Pulau", subtitle: "Ruang tumbuh, belajar, dan saling menguatkan.", description: "Cahaya Anak Pulau adalah bagian dari perjalanan Cahaya Haluan Pulau dalam mendampingi generasi muda kepulauan meraih pendidikan dan masa depan yang lebih baik.", focus: ["Pendampingan pendidikan", "Pengembangan karakter", "Komunitas yang saling mendukung"], eyebrow: "Program · Pendidikan" },
  "urx1": { title: "URX1", subtitle: "Inisiatif kolaboratif untuk masa depan yang berdampak.", description: "URX1 menjadi ruang untuk mengembangkan gagasan, kolaborasi, dan kontribusi nyata bagi komunitas. Informasi kegiatan dan fokus program akan diperbarui seiring perkembangan inisiatif.", focus: ["Kolaborasi komunitas", "Ruang bertukar gagasan", "Aksi dan dampak berkelanjutan"], eyebrow: "Inisiatif · Kolaborasi" },
};

export function ProgramPage({ slug }: { slug: keyof typeof programs }) {
  const [english, setEnglish] = useState(false);
  useEffect(() => { const sync = () => setEnglish(document.documentElement.dataset.language === "en"); sync(); window.addEventListener("chp-language-change", sync); return () => window.removeEventListener("chp-language-change", sync); }, []);
  const data = programs[slug];
  return <main className="program-page">
    <section className="program-hero"><div className="container program-hero-inner"><span className="eyebrow">{english ? "OUR WORK · COMMUNITY" : data.eyebrow}</span><p className="program-kicker">Cahaya Haluan Pulau</p><h1>{data.title}</h1><p className="program-subtitle">{english ? (slug === "urx1" ? "A collaborative initiative for a future with lasting impact." : "A place to grow, learn, and support one another.") : data.subtitle}</p><p className="program-description">{english ? (slug === "urx1" ? "URX1 brings people together to develop ideas, collaboration, and meaningful contributions to the community. Program details will grow as the initiative develops." : "Cahaya Anak Pulau is part of Cahaya Haluan Pulau’s commitment to supporting young people from island communities as they pursue education and a brighter future.") : data.description}</p><Link href="/kontak" className="btn btn-primary">{english ? "Get in touch" : "Hubungi kami"}</Link></div></section>
    <section className="section"><div className="container program-content"><div><span className="eyebrow">{english ? "OUR FOCUS" : "FOKUS KAMI"}</span><h2>{english ? "Growing together" : "Bertumbuh bersama"}</h2><p>{english ? "We create opportunities for people and communities to learn, connect, and make a difference." : "Kami membuka ruang bagi individu dan komunitas untuk belajar, terhubung, dan menghadirkan perubahan."}</p></div><div className="program-focus-grid">{data.focus.map((item, index) => <article className="program-focus-card" key={item}><span>0{index + 1}</span><h3>{english ? (slug === "urx1" ? ["Community collaboration", "A space for ideas", "Sustainable action"][index] : ["Educational support", "Character development", "A supportive community"][index]) : item}</h3></article>)}</div></div></section>
    <section className="program-cta"><div className="container"><span className="eyebrow">{english ? "BE PART OF THE JOURNEY" : "JADI BAGIAN DARI PERJALANAN"}</span><h2>{english ? "Let’s create a brighter future together." : "Mari wujudkan masa depan yang lebih baik bersama."}</h2><Link href="/kontak" className="btn btn-outline">{english ? "Contact our team" : "Hubungi pengurus"}</Link></div></section>
  </main>;
}
