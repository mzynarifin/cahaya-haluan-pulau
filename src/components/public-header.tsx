"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { LanguageToggle } from "@/components/language-toggle";

const links = [["/", "Beranda", "Home"], ["/tentang", "Tentang", "About"], ["/asrama", "Center & Fasilitas", "Center & Facilities"], ["/berita", "Berita", "News"], ["/galeri", "Galeri", "Gallery"], ["/kontak", "Kontak", "Contact"]];
export function Brand() { return <Link href="/" className="brand" aria-label="Cahaya Haluan Pulau, beranda"><span className="brand-logo"><Image src="/logo-cahaya-haluan-pulau.jpg" alt="" width={56} height={56} priority/></span><span className="brand-name">Cahaya Haluan Pulau</span></Link>; }
export function PublicHeader() {
  const [open, setOpen] = useState(false);
  const [programOpen, setProgramOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const path = usePathname();
  const [english, setEnglish] = useState(false);
  const closeNavigation = () => { setOpen(false); setProgramOpen(false); };
  useEffect(() => { setOpen(false); setProgramOpen(false); }, [path]);
  useEffect(() => { const sync = () => setEnglish(document.documentElement.dataset.language === "en" || localStorage.getItem("chp-language") === "en"); sync(); window.addEventListener("chp-language-change", sync); return () => window.removeEventListener("chp-language-change", sync); }, []);
  useEffect(() => {
    if (!open && !programOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") { setOpen(false); setProgramOpen(false); } };
    const closeOnOutsideClick = (event: PointerEvent) => { if (!headerRef.current?.contains(event.target as Node)) { setOpen(false); setProgramOpen(false); } };
    window.addEventListener("keydown", closeOnEscape);
    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () => { window.removeEventListener("keydown", closeOnEscape); document.removeEventListener("pointerdown", closeOnOutsideClick); };
  }, [open, programOpen]);

  return <header ref={headerRef} className="site-header">
    {open && <button type="button" className="site-nav-backdrop" aria-label="Tutup menu" onClick={closeNavigation} />}
    <div className="container header-row">
      <Brand />
      <div className={`site-navigation ${open ? "open" : ""}`}>
        <nav id="primary-navigation" className={`site-nav ${open ? "open" : ""}`} aria-label="Navigasi utama">
          {links.map(([href, label, en], index) => {
            const active = path === href || (href !== "/" && path.startsWith(`${href}/`));
            return <span className="nav-item-fragment" key={href}>
              <Link href={href} onClick={closeNavigation} className={active ? "active" : ""} aria-current={active ? "page" : undefined}>{english ? en : label}</Link>
              {index === 2 && <div className={`program-nav ${programOpen ? "is-open" : ""}`}>
                <button type="button" className={`program-nav-trigger ${path === "/cahaya-anak-pulau" || path.startsWith("/cahaya-anak-pulau/") || path === "/urx1" || path.startsWith("/urx1/") ? "active" : ""}`} aria-haspopup="menu" aria-expanded={programOpen} aria-controls="program-submenu" onClick={() => setProgramOpen(value => !value)}>
                  {english ? "Programs" : "Program"}<ChevronDown size={15} aria-hidden="true" />
                </button>
                <div className="program-submenu" id="program-submenu" role="menu" hidden={!programOpen}>
                  <span className="program-submenu-heading">{english ? "Choose a program" : "Pilih program"}</span>
                  <Link href="/cahaya-anak-pulau" data-no-translate role="menuitem" aria-current={path.startsWith("/cahaya-anak-pulau") ? "page" : undefined} onClick={closeNavigation}>
                    <strong>Suara Anak Pulau</strong><small>{english ? "Education and opportunities for island children" : "Pendidikan dan kesempatan untuk anak pulau"}</small>
                  </Link>
                  <Link href="/urx1" role="menuitem" aria-current={path.startsWith("/urx1") ? "page" : undefined} onClick={closeNavigation}>
                    <strong>URX1</strong><small>{english ? "Humanitarian action and literacy" : "Aksi kemanusiaan dan literasi"}</small>
                  </Link>
                </div>
              </div>}
            </span>;
          })}
        </nav>
      </div>
      <LanguageToggle />
      <button type="button" className="menu-button" aria-label={open ? "Tutup menu" : "Buka menu"}
        aria-expanded={open} aria-controls="primary-navigation" onClick={() => { setOpen(value => !value); setProgramOpen(false); }}>
        {open ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
      </button>
    </div>
  </header>;
}
