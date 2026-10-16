import type { Metadata } from "next";
import "./globals.css";
import { siteName, siteUrl } from "@/lib/config";

const siteDescription = "Informasi Cahaya Haluan Pulau, asrama, fasilitas, kegiatan, berita, dan cara menghubungi pengurus.";
export const metadata: Metadata = {
  title: { default: "Cahaya Haluan Pulau | Informasi Asrama", template: `%s | ${siteName}` },
  description: siteDescription,
  metadataBase: new URL(siteUrl),
  applicationName: siteName,
  icons: { icon: "/logo-cahaya-haluan-pulau.jpg", apple: "/logo-cahaya-haluan-pulau.jpg" },
  alternates: { canonical: "/" },
  openGraph: { type: "website", locale: "id_ID", siteName, title: "Cahaya Haluan Pulau | Informasi Asrama", description: siteDescription },
  twitter: { card: "summary_large_image", title: "Cahaya Haluan Pulau | Informasi Asrama", description: siteDescription },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="id"><body><a href="#main" className="skip">Lewati ke konten</a>{children}</body></html>; }
