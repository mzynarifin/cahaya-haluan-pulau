"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getProgramCopy, type ProgramSlug } from "@/lib/program-content";

export function ProgramPage({ slug, content }: { slug: ProgramSlug; content: Record<string, unknown> }) {
  const [english, setEnglish] = useState(false);

  useEffect(() => {
    const sync = () => setEnglish(document.documentElement.dataset.language === "en" || localStorage.getItem("chp-language") === "en");
    sync();
    window.addEventListener("chp-language-change", sync);
    return () => window.removeEventListener("chp-language-change", sync);
  }, []);

  const copy = getProgramCopy(slug, content, english ? "en" : "id");
  const desktopUpload = typeof content.heroImage === "string" && content.heroImage.trim() ? content.heroImage : null;
  const mobileUpload = typeof content.heroImageMobile === "string" && content.heroImageMobile.trim() ? content.heroImageMobile : null;
  const desktopImage = desktopUpload || "/hero-lighthouse.webp";
  const mobileImage = mobileUpload || (desktopUpload ? desktopImage : "/hero-lighthouse-mobile.webp");

  return <div className="program-page">
    <section className="program-hero">
      <div className="program-hero-visual" aria-hidden="true">
        <picture className="program-hero-artwork">
          <source media="(max-width: 800px)" srcSet={mobileImage} />
          <img src={desktopImage} className="program-hero-image" alt="" fetchPriority="high" />
        </picture>
      </div>
      <div className="container program-hero-inner">
        <span className="eyebrow">{copy.eyebrow}</span>
        <p className="program-kicker">{copy.kicker}</p>
        <h1>{copy.title}</h1>
        <p className="program-subtitle">{copy.subtitle}</p>
        <p className="program-description">{copy.description}</p>
        <Link href="/kontak" className="btn btn-primary">{copy.heroButton}</Link>
      </div>
    </section>
    <section className="section">
      <div className="container program-content">
        <div>
          <span className="eyebrow">{copy.focusEyebrow}</span>
          <h2>{copy.focusTitle}</h2>
          <p>{copy.focusDescription}</p>
        </div>
        <div className="program-focus-grid">
          {copy.focusItems.map((item, index) => <article className="program-focus-card" key={`${index}-${item}`}>
            <span>0{index + 1}</span>
            <h3>{item}</h3>
          </article>)}
        </div>
      </div>
    </section>
    <section className="program-cta">
      <div className="container">
        <span className="eyebrow">{copy.ctaEyebrow}</span>
        <h2>{copy.ctaTitle}</h2>
        <Link href="/kontak" className="btn btn-outline">{copy.ctaButton}</Link>
      </div>
    </section>
  </div>;
}
