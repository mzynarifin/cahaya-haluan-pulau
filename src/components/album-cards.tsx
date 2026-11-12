"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Album } from "@/lib/data";
import { imageAspectFromUrl } from "@/lib/image-presets";
import { LocalizedText, useEnglishLanguage } from "@/components/language-runtime";
import { LocalizedDate } from "@/components/localized-date";

export function AlbumCards({ items }: { items: Album[] }) {
  const english = useEnglishLanguage();
  if (!items.length) return <div className="empty"><h3>Dokumentasi belum tersedia</h3><p>Album kegiatan akan ditampilkan setelah foto dan izin publikasinya dilengkapi.</p></div>;

  return <div className="card-grid">
    {items.map(album => {
      const aspect = imageAspectFromUrl(album.cover_url, 16 / 10);
      const albumHref = `/galeri/${album.slug}`;

      return <article className="content-card album-card" key={album.id}>
        <Link href={albumHref} className="card-image album-card-image album-card-media" style={{ aspectRatio: aspect }} aria-label={`${english ? "Open album" : "Buka album"} ${english ? album.title_en || album.title : album.title}`}>
          {album.cover_url
            ? <Image src={album.cover_url} alt={`${english ? "Album cover" : "Sampul album"} ${english ? album.title_en || album.title : album.title}`} width={600} height={Math.round(600 / aspect)} sizes="(max-width: 560px) calc(100vw - 120px), (max-width: 800px) calc((100vw - 152px) / 2), (max-width: 1240px) calc((100vw - 220px) / 3), 320px" />
            : <span className="album-card-placeholder">Cahaya Haluan Pulau</span>}
        </Link>
        <span className="eyebrow album-card-date">{album.event_date ? <LocalizedDate value={album.event_date} /> : <LocalizedText id="Dokumentasi kegiatan" en="Activity documentation" />}</span>
        <h3><Link href={albumHref}><LocalizedText id={album.title} en={album.title_en} /></Link></h3>
        {album.description && <p><LocalizedText id={album.description} en={album.description_en} /></p>}
        <Link href={albumHref} className="link-arrow album-card-link">Lihat album <ArrowRight size={17} aria-hidden="true" /></Link>
      </article>;
    })}
  </div>;
}
