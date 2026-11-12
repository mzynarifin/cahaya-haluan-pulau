"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { type NewsPreview } from "@/lib/data";
import { imageAspectFromUrl } from "@/lib/image-presets";
import { LocalizedText, useEnglishLanguage } from "@/components/language-runtime";
import { LocalizedDate } from "@/components/localized-date";

export function Photo({ src, alt, label = "Dokumentasi asli perlu dilengkapi", aspectRatio }: { src?: string | null; alt?: string | null; label?: string; aspectRatio?: number }) {
  return <div className="photo-frame" style={{ aspectRatio: aspectRatio ?? imageAspectFromUrl(src, 4 / 3) }}>{src ? <Image src={src} alt={alt || "Dokumentasi kegiatan Cahaya Haluan Pulau"} fill sizes="(max-width: 800px) 100vw, 50vw" /> : <div className="photo-placeholder"><span className="photo-caption">Cahaya Haluan Pulau</span><div className="visual-lines" aria-hidden="true">{[45,70,54,86,61,75,50].map((n,i)=><span key={i} style={{"--h":`${n}%`} as React.CSSProperties}/>)}</div><span className="photo-caption">{label}</span></div>}</div>;
}
export function ContactCta() {
  return <section className="section editorial-band next-step-section" aria-labelledby="next-step-title">
    <div className="container next-step-layout">
      <div className="next-step-heading">
        <span className="eyebrow next-step-eyebrow">Langkah berikutnya</span>
        <h2 id="next-step-title">Ingin bertanya tentang tempat tinggal?</h2>
      </div>
      <div className="next-step-content">
        <p>Lihat informasi kontak resmi dan buka percakapan WhatsApp dengan pengurus melalui halaman Kontak.</p>
        <Link className="btn next-step-link" href="/kontak">Lihat Kontak <ArrowRight size={17} aria-hidden="true" /></Link>
      </div>
    </div>
  </section>;
}
export function NewsCards({ items }: { items: NewsPreview[] }) {
  const english = useEnglishLanguage();
  return items.length ? <div className="card-grid">{items.map(news => {
    const aspect = imageAspectFromUrl(news.cover_url, 16 / 10);
    return <article className="content-card" key={news.id}>
        {news.cover_url && <div className="card-image" style={{ aspectRatio: aspect }}><Image src={news.cover_url} alt={english ? news.cover_alt_en || news.cover_alt || "" : news.cover_alt || ""} width={600} height={Math.round(600 / aspect)} sizes="(max-width: 560px) calc(100vw - 120px), (max-width: 800px) calc((100vw - 152px) / 2), (max-width: 1240px) calc((100vw - 220px) / 3), 320px" /></div>}
        <span className="eyebrow"><LocalizedDate value={news.published_at} /></span><h3><LocalizedText id={news.title} en={news.title_en} /></h3><p><LocalizedText id={news.excerpt || ""} en={news.excerpt_en} /></p>
      <Link href={`/berita/${news.slug}`} className="link-arrow">Baca berita <ArrowRight size={17}/></Link>
    </article>;
  })}</div> : <div className="empty"><h3>Belum ada berita terbit</h3><p>Pengurus akan menambahkan kabar terbaru setelah kontennya siap.</p></div>;
}
