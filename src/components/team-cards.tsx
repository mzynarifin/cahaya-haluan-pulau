"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState } from "react";

export type TeamMember = { name: string; role?: string; image?: string; visible?: boolean };

export function TeamCards({ items }: { items: TeamMember[] }) {
  const members = items.filter(member => member.visible && member.name?.trim());
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  function scrollTo(index: number) {
    const track = trackRef.current;
    const card = track?.children[index] as HTMLElement | undefined;
    if (!track || !card) return;
    const left = card.offsetLeft - (track.clientWidth - card.clientWidth) / 2;
    track.scrollTo({ left, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
    setActive(index);
  }

  function updateActive() {
    const track = trackRef.current;
    if (!track) return;
    const center = track.scrollLeft + track.clientWidth / 2;
    let nearest = 0;
    let distance = Infinity;
    Array.from(track.children).forEach((child, index) => {
      const card = child as HTMLElement;
      const gap = Math.abs(card.offsetLeft + card.clientWidth / 2 - center);
      if (gap < distance) { distance = gap; nearest = index; }
    });
    setActive(nearest);
  }

  if (!members.length) return <div className="empty"><h3>Data pengurus perlu dilengkapi</h3><p>Nama dan foto akan tampil setelah mendapat persetujuan publikasi.</p></div>;

  return <div className="team-gallery">
    <div ref={trackRef} className="team-grid" role="region" aria-label="Daftar pengurus" tabIndex={0} onScroll={updateActive}>
      {members.map((member, index) => <article className="team-card" key={`${member.name}-${index}`}>
        <div className="team-card-media">
          {member.image
            ? <Image src={member.image} alt={`Foto ${member.name}`} fill sizes="(max-width: 640px) 230px, 240px" />
            : <span className="team-card-initials" aria-hidden="true">{member.name.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join("").toUpperCase()}</span>}
        </div>
        <div className="team-card-body"><h3>{member.name}</h3><p>{member.role?.trim() || "Pengurus"}</p></div>
      </article>)}
    </div>
    {members.length > 1 && <div className="team-controls" aria-label="Navigasi pengurus">
      <button type="button" onClick={() => scrollTo(active - 1)} disabled={active === 0} aria-label="Pengurus sebelumnya"><ChevronLeft size={20} /></button>
      <span aria-live="polite">{active + 1} / {members.length}</span>
      <button type="button" onClick={() => scrollTo(active + 1)} disabled={active === members.length - 1} aria-label="Pengurus berikutnya"><ChevronRight size={20} /></button>
    </div>}
  </div>;
}
