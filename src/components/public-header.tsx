"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { LanguageToggle } from "@/components/language-toggle";

const links = [["/", "Beranda", "Home"], ["/tentang", "Tentang", "About"], ["/asrama", "Center & Fasilitas", "Center & Facilities"], ["/cahaya-anak-pulau", "Cahaya Anak Pulau", "Cahaya Anak Pulau"], ["/urx1", "URX1", "URX1"], ["/berita", "Berita", "News"], ["/galeri", "Galeri", "Gallery"], ["/kontak", "Kontak", "Contact"]];
export function Brand() { return <Link href="/" className="brand" aria-label="Cahaya Haluan Pulau, beranda"><span className="brand-logo"><Image src="/logo-cahaya-haluan-pulau.jpg" alt="" width={56} height={56} priority/></span><span className="brand-name">Cahaya Haluan Pulau</span></Link>; }
export function PublicHeader() {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  const [english, setEnglish] = useState(false);
  useEffect(() => { setOpen(false); }, [path]);
  useEffect(() => { const sync = () => setEnglish(document.documentElement.dataset.language === "en" || localStorage.getItem("chp-language") === "en"); sync(); window.addEventListener("chp-language-change", sync); return () => window.removeEventListener("chp-language-change", sync); }, []);
  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  return <header className="site-header">
    {open && <button type="button" className="site-nav-backdrop" aria-label="Tutup menu" onClick={() => setOpen(false)} />}
    <div className="container header-row">
      <Brand />
      <div className={`site-navigation ${open ? "open" : ""}`}>
        <nav id="primary-navigation" className={`site-nav ${open ? "open" : ""}`} aria-label="Navigasi utama">
          {links.map(([href, label, en]) => {
            const active = path === href || (href !== "/" && path.startsWith(`${href}/`));
            return <a key={href} href={href} onClick={() => setOpen(false)}
              className={active ? "active" : ""} aria-current={active ? "page" : undefined}>{english ? en : label}</a>;
          })}
        </nav>
      </div>
      <LanguageToggle />
      <button type="button" className="menu-button" aria-label={open ? "Tutup menu" : "Buka menu"}
        aria-expanded={open} aria-controls="primary-navigation" onClick={() => setOpen(value => !value)}>
        {open ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
      </button>
    </div>
  </header>;
}
