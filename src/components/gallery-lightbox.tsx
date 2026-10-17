"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { Photo } from "@/lib/data";

export function GalleryLightbox({ photos }: { photos: Photo[] }) {
  const [active, setActive] = useState<number | null>(null);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const close = useRef<HTMLButtonElement>(null);
  const lastActive = useRef(0);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const isOpen = active !== null;

  useEffect(() => {
    if (active !== null) lastActive.current = active;
  }, [active]);

  useEffect(() => {
    if (!isOpen) return;

    close.current?.focus();
    const previousOverflow = document.body.style.overflow;
    const previousRootOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActive(null);
      if (event.key === "ArrowRight") setActive(index => index === null ? index : (index + 1) % photos.length);
      if (event.key === "ArrowLeft") setActive(index => index === null ? index : (index - 1 + photos.length) % photos.length);
      if (event.key === "Tab") {
        const controls = Array.from(document.querySelectorAll<HTMLButtonElement>(".lightbox button"));
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      document.documentElement.style.overflow = previousRootOverflow;
      buttons.current[lastActive.current]?.focus();
    };
  }, [isOpen, photos.length]);

  return <>
    <div className={`gallery-photo-grid${photos.length === 1 ? " is-single" : ""}`} style={{ maxWidth: Math.min(1200, photos.length * 300) }}>
      {photos.map((photo, index) => <button
          className="gallery-tile"
          ref={element => { buttons.current[index] = element; }}
          key={photo.id}
          onClick={() => setActive(index)}
          aria-label={`Buka foto ${index + 1} dari ${photos.length}: ${photo.alt}`}
        >
          <Image src={photo.image_url} alt={photo.alt} fill sizes="(max-width: 640px) 50vw, (max-width: 900px) 33vw, 25vw" />
        </button>)}
    </div>
    {active !== null && createPortal(<div className="lightbox" role="dialog" aria-modal="true" aria-label={`Foto ${active + 1} dari ${photos.length}`}>
      <div className="lightbox-panel">
        <div className="lightbox-top">
          <span>Foto {active + 1} dari {photos.length}</span>
          <button className="lightbox-close" ref={close} onClick={() => setActive(null)} aria-label="Tutup foto"><X size={20} aria-hidden="true" /></button>
        </div>
        <div className="lightbox-viewer">
          <div className="lightbox-stage"
            onTouchStart={event => { touchStart.current = { x: event.touches[0].clientX, y: event.touches[0].clientY }; }}
            onTouchEnd={event => {
              const start = touchStart.current;
              touchStart.current = null;
              if (!start || photos.length < 2) return;
              const deltaX = event.changedTouches[0].clientX - start.x;
              const deltaY = event.changedTouches[0].clientY - start.y;
              if (Math.abs(deltaX) > 55 && Math.abs(deltaX) > Math.abs(deltaY) * 1.3) {
                setActive(index => index === null ? index : (index + (deltaX < 0 ? 1 : -1) + photos.length) % photos.length);
              }
            }}>
            <Image src={photos[active].image_url} alt={photos[active].alt} fill sizes="(max-width: 800px) 100vw, 90vw" />
          </div>
          {photos.length > 1 && <div className="lightbox-controls">
            <button type="button" onClick={() => setActive((active - 1 + photos.length) % photos.length)} aria-label="Foto sebelumnya"><ChevronLeft size={24} aria-hidden="true" /></button>
            <button type="button" onClick={() => setActive((active + 1) % photos.length)} aria-label="Foto berikutnya"><ChevronRight size={24} aria-hidden="true" /></button>
          </div>}
        </div>
        <p className="lightbox-caption">{photos[active].caption || photos[active].alt}</p>
      </div>
    </div>, document.body)}
  </>;
}
