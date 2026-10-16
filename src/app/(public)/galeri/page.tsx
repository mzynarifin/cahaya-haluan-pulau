import type { Metadata } from "next";
import { getAlbums } from "@/lib/data";
import { AlbumCards } from "@/components/public-parts";
import { pageMetadata } from "@/lib/seo";
export const metadata:Metadata=pageMetadata("/galeri","Galeri Kegiatan","Lihat dokumentasi kegiatan Cahaya Haluan Pulau yang telah disetujui untuk ditampilkan kepada publik.");
export default async function Gallery(){const albums=await getAlbums();return <><div className="page-hero"><div className="container"><span className="eyebrow">Dokumentasi</span><h1>Galeri kegiatan</h1><p className="lead">Foto kegiatan yang telah disetujui untuk publikasi.</p></div></div><section className="section"><div className="container"><AlbumCards items={albums}/></div></section></>}
