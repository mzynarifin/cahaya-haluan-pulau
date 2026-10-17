import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { type News } from "@/lib/data";
import { formatDate } from "@/lib/config";
import { imageAspectFromUrl } from "@/lib/image-presets";

export function Photo({ src, alt, label = "Dokumentasi asli perlu dilengkapi", fallbackLogo = false, aspectRatio }: { src?: string | null; alt?: string | null; label?: string; fallbackLogo?: boolean; aspectRatio?: number }) {
  return <div className="photo-frame" style={{ aspectRatio: aspectRatio ?? imageAspectFromUrl(src, 4 / 3) }}>{src ? <Image src={src} alt={alt || "Dokumentasi kegiatan Cahaya Haluan Pulau"} fill sizes="(max-width: 800px) 100vw, 50vw" priority={fallbackLogo}/> : fallbackLogo ? <div className="hero-logo-frame"><Image src="/logo-cahaya-haluan-pulau.jpg" alt="Logo Cahaya Haluan Pulau" width={1600} height={1600} priority/></div> : <div className="photo-placeholder"><span className="photo-caption">Cahaya Haluan Pulau</span><div className="visual-lines" aria-hidden="true">{[45,70,54,86,61,75,50].map((n,i)=><span key={i} style={{"--h":`${n}%`} as React.CSSProperties}/>)}</div><span className="photo-caption">{label}</span></div>}</div>;
}
export function ContactCta() {
  return <section className="section editorial-band"><div className="container split"><div><span className="eyebrow" style={{color:"#b9d8f7"}}>Langkah berikutnya</span><h2>Ingin bertanya tentang tempat tinggal?</h2></div><div><p>Lihat informasi kontak resmi dan buka percakapan WhatsApp dengan pengurus melalui halaman Kontak.</p><Link className="btn" href="/kontak">Lihat Kontak <ArrowRight size={17}/></Link></div></div></section>;
}
export function NewsCards({ items }: { items: News[] }) {
  return items.length ? <div className="card-grid">{items.map(news => {
    const aspect = imageAspectFromUrl(news.cover_url, 16 / 10);
    return <article className="content-card" key={news.id}>
      {news.cover_url && <div className="card-image" style={{ aspectRatio: aspect }}><Image src={news.cover_url} alt={news.cover_alt || ""} width={600} height={Math.round(600 / aspect)} /></div>}
      <span className="eyebrow">{formatDate(news.published_at)}</span><h3>{news.title}</h3><p>{news.excerpt}</p>
      <Link href={`/berita/${news.slug}`} className="link-arrow">Baca berita <ArrowRight size={17}/></Link>
    </article>;
  })}</div> : <div className="empty"><h3>Belum ada berita terbit</h3><p>Pengurus akan menambahkan kabar terbaru setelah kontennya siap.</p></div>;
}
