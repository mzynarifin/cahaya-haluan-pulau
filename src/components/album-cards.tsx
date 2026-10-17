"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { formatDate } from "@/lib/config";
import type { Album } from "@/lib/data";

export function AlbumCards({ items }: { items: Album[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const trackId = useId();
  const [canScroll, setCanScroll] = useState({ previous: false, next: false });
  const [activeAlbum, setActiveAlbum] = useState(1);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    function updateButtons() {
      if (!track) return;
      const maxScroll = Math.max(0, track.scrollWidth - track.clientWidth);
      const previous = track.scrollLeft > 1;
      const next = track.scrollLeft < maxScroll - 1;
      setCanScroll(current => current.previous === previous && current.next === next ? current : { previous, next });
      const card = track.firstElementChild as HTMLElement | null;
      const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 0;
      const step = (card?.getBoundingClientRect().width || 1) + gap;
      setActiveAlbum(Math.min(items.length, Math.max(1, Math.ceil((track.scrollLeft - 8) / step) + 1)));
    }

    updateButtons();
    const observer = new ResizeObserver(updateButtons);
    observer.observe(track);
    track.addEventListener("scroll", updateButtons, { passive: true });
    window.addEventListener("resize", updateButtons);
    return () => {
      observer.disconnect();
      track.removeEventListener("scroll", updateButtons);
      window.removeEventListener("resize", updateButtons);
    };
  }, [items.length]);

  function scroll(direction: -1 | 1) {
    const track = trackRef.current;
    const card = track?.firstElementChild as HTMLElement | null;
    if (!track || !card) return;
    const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 0;
    track.scrollBy({
      left: direction * (card.getBoundingClientRect().width + gap),
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
    });
  }

  if (!items.length) return <div className="empty"><h3>Dokumentasi belum tersedia</h3><p>Album kegiatan akan ditampilkan setelah foto dan izin publikasinya dilengkapi.</p></div>;

  return <div className="album-carousel">
    <div id={trackId} ref={trackRef} className="album-grid" role="region" aria-label="Album kegiatan" tabIndex={0}>
      {items.map(album => <article className="album-card" key={album.id}>
        <Link href={`/galeri/${album.slug}`} className="album-card-media" aria-label={`Buka album ${album.title}`}>
          {album.cover_url
            ? <Image src={album.cover_url} alt={`Sampul album ${album.title}`} fill sizes="225px" />
            : <span className="album-card-placeholder">Cahaya Haluan Pulau</span>}
        </Link>
        <div className="album-card-body">
          <span className="album-card-date">{album.event_date ? formatDate(album.event_date) : "Dokumentasi kegiatan"}</span>
          <h3><Link href={`/galeri/${album.slug}`}>{album.title}</Link></h3>
          {album.description && <p>{album.description}</p>}
          <Link href={`/galeri/${album.slug}`} className="album-card-link">Lihat album <ArrowRight size={17} aria-hidden="true" /></Link>
        </div>
      </article>)}
    </div>
    {items.length > 1 && <div className="album-carousel-controls" aria-label="Navigasi album">
      <button type="button" aria-label="Album sebelumnya" aria-controls={trackId} disabled={!canScroll.previous} onClick={() => scroll(-1)}><ChevronLeft size={20} aria-hidden="true" /></button>
      <span className="album-carousel-count" aria-live="polite"><span aria-hidden="true">{activeAlbum}/{items.length}</span><span className="sr-only">Album {activeAlbum} dari {items.length}</span></span>
      <button type="button" aria-label="Album berikutnya" aria-controls={trackId} disabled={!canScroll.next} onClick={() => scroll(1)}><ChevronRight size={20} aria-hidden="true" /></button>
    </div>}
  </div>;
}
