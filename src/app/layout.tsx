import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./institutional.css";
import { siteName, siteUrl } from "@/lib/config";

const siteDescription = "Informasi resmi Cahaya Haluan Pulau tentang profil lembaga, asrama, fasilitas, kegiatan, berita, dan kontak pengurus.";
export const viewport: Viewport = { width: "device-width", initialScale: 1 };
export const metadata: Metadata = {
  title: { default: "Cahaya Haluan Pulau | Informasi Asrama", template: `%s | ${siteName}` },
  description: siteDescription,
  metadataBase: new URL(siteUrl),
  applicationName: siteName,
  icons: { icon: "/logo-cahaya-haluan-pulau.jpg", apple: "/logo-cahaya-haluan-pulau.jpg" },
  alternates: { canonical: "/" },
  openGraph: { type: "website", locale: "id_ID", siteName, title: "Cahaya Haluan Pulau | Informasi Asrama", description: siteDescription, images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Cahaya Haluan Pulau" }] },
  twitter: { card: "summary_large_image", title: "Cahaya Haluan Pulau | Informasi Asrama", description: siteDescription, images: ["/opengraph-image"] },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: siteName,
      url: siteUrl,
      logo: `${siteUrl}/logo-cahaya-haluan-pulau.jpg`,
      description: siteDescription,
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      name: siteName,
      url: siteUrl,
      inLanguage: "id-ID",
      publisher: { "@id": `${siteUrl}/#organization` },
    },
  ];

  return <html lang="id"><body>
    <a href="#main" className="skip">Lewati ke konten</a>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
    {children}
  </body></html>;
}
