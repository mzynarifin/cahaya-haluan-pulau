"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { Photo } from "@/lib/data";

export function GalleryLightbox({ photos }: { photos: Photo[] }) {
  const [active, setActive] = useState<number | null>(null);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const close = useRef<HTMLButtonElement>(null);
  const lastActive = useRef(0);
  const isOpen = active !== null;

  useEffect(() => {
    if (active !== null) lastActive.current = active;
  }, [active]);

  useEffect(() => {
    if (!isOpen) return;

    close.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

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
      buttons.current[lastActive.current]?.focus();
    };
  }, [isOpen, photos.length]);

  return <>
    <div className="gallery-photo-grid" style={{ maxWidth: Math.min(1120, photos.length * 280) }}>
      {photos.map((photo, index) => <button
          className="gallery-tile"
          ref={element => { buttons.current[index] = element; }}
          key={photo.id}
          onClick={() => setActive(index)}
          aria-label={`Perbesar foto: ${photo.alt}`}
        >
          <span className="gallery-tile-media"><Image src={photo.image_url} alt={photo.alt} fill sizes="(max-width: 430px) 85vw, (max-width: 700px) 50vw, (max-width: 1050px) 33vw, 25vw" /></span>
        </button>)}
    </div>
    {active !== null && <div className="lightbox" role="dialog" aria-modal="true" aria-label={`Foto ${active + 1} dari ${photos.length}`}>
      <div className="lightbox-panel">
        <div className="lightbox-top">
          <span>Foto {active + 1} dari {photos.length}</span>
          <button className="lightbox-close" ref={close} onClick={() => setActive(null)}>Tutup ×</button>
        </div>
        <div className="lightbox-stage">
          <Image src={photos[active].image_url} alt={photos[active].alt} fill sizes="(max-width: 800px) 100vw, 90vw" />
        </div>
        <p className="lightbox-caption">{photos[active].caption || photos[active].alt}</p>
        <div className="lightbox-controls">
          <button onClick={() => setActive((active - 1 + photos.length) % photos.length)}>← Sebelumnya</button>
          <button onClick={() => setActive((active + 1) % photos.length)}>Berikutnya →</button>
        </div>
      </div>
    </div>}
  </>;
}
