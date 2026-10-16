"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

const links = [["/", "Beranda"], ["/tentang", "Tentang"], ["/asrama", "Asrama & Fasilitas"], ["/berita", "Berita"], ["/galeri", "Galeri"], ["/kontak", "Kontak"]];
export function Brand() { return <Link href="/" className="brand" aria-label="Cahaya Haluan Pulau, beranda"><span className="brand-logo"><Image src="/logo-cahaya-haluan-pulau.jpg" alt="" width={56} height={56} priority/></span><span>Cahaya<br/>Haluan Pulau</span></Link>; }
export function PublicHeader() {
  const [open, setOpen] = useState(false); const [pendingPath, setPendingPath] = useState<string | null>(null); const path = usePathname();
  useEffect(() => { setPendingPath(null); }, [path]);
  const navigating = pendingPath !== null && pendingPath !== path;
  return <header className={`site-header ${navigating ? "is-navigating" : ""}`}><div className="container header-row"><Brand/><button className="menu-button" aria-label={open ? "Tutup menu" : "Buka menu"} aria-expanded={open} aria-controls="primary-navigation" onClick={() => setOpen(!open)}>{open ? <X size={22}/> : <Menu size={22}/>}</button><nav id="primary-navigation" className={`site-nav ${open ? "open" : ""}`} aria-label="Navigasi utama">{links.map(([href,label])=><Link key={href} href={href} onClick={()=>{setOpen(false);setPendingPath(href);}} className={path===href || (href!=="/" && path.startsWith(href+"/")) ? "active" : ""} aria-current={path===href ? "page" : undefined}>{label}</Link>)}</nav></div><span className="navigation-progress" aria-hidden="true"/></header>;
}
