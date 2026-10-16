import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAlbumBySlug } from "@/lib/data";
import { formatDate, siteName } from "@/lib/config";
import { GalleryLightbox } from "@/components/gallery-lightbox";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const album = await getAlbumBySlug(slug);
  if (!album) return { title: "Album tidak ditemukan", robots: { index: false, follow: false } };

  const description = album.description || `Dokumentasi kegiatan Cahaya Haluan Pulau: ${album.title}.`;
  const canonical = `/galeri/${album.slug}`;
  const image = album.cover_url || album.album_photos?.[0]?.image_url;
  return {
    title: album.title,
    description,
    alternates: { canonical },
    openGraph: { type: "website", title: album.title, description, url: canonical, siteName, locale: "id_ID", images: image ? [{ url: image, alt: `Dokumentasi ${album.title}` }] : [] },
    twitter: { card: "summary_large_image", title: album.title, description, images: image ? [image] : [] },
  };
}

export default async function GalleryDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const album = await getAlbumBySlug(slug);
  if (!album) notFound();

  const photos = album.album_photos || [];
  return <>
    <div className="page-hero album-detail-hero">
      <div className="container">
        <Link href="/galeri" className="link-arrow">← Kembali ke galeri</Link>
        <span className="eyebrow album-detail-date">{formatDate(album.event_date)}</span>
        <h1>{album.title}</h1>
        {album.description && <p className="lead">{album.description}</p>}
      </div>
    </div>
    <section className="section album-detail-section">
      <div className="container">
        {photos.length ? <>
          <div className="album-detail-head"><h2>Foto kegiatan</h2><span>{photos.length} foto</span></div>
          <GalleryLightbox photos={photos} />
        </> : <div className="empty"><h3>Foto belum tersedia</h3></div>}
      </div>
    </section>
  </>;
}
