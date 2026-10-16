"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminPageSkeleton } from "@/components/admin/admin-skeleton";
import { createClient } from "@/lib/supabase/browser";
import { formatDate } from "@/lib/config";

type Album = {
  id: string;
  title: string;
  status: string;
  event_date: string | null;
  version: number;
};

export function GalleryList() {
  const router = useRouter();
  const [items, setItems] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const client = createClient();
    if (!client) {
      setError("Layanan tidak tersedia.");
      setLoading(false);
      return;
    }
    client.from("albums").select("id,title,status,event_date,version")
      .order("updated_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) setError("Album gagal dimuat.");
        setItems(data || []);
        setLoading(false);
      });
  }, []);

  async function removeAlbum(album: Album) {
    if (!window.confirm(`Hapus album "${album.title}" beserta seluruh fotonya secara permanen?`)) return;
    const client = createClient();
    if (!client) { setError("Layanan tidak tersedia."); return; }
    setDeletingId(album.id);
    setError("");
    setSuccess("");
    try {
      const { data: photos, error: photoError } = await client.from("album_photos")
        .select("storage_path").eq("album_id", album.id);
      if (photoError) throw new Error("Daftar foto album gagal dibaca.");

      const { data: deleted, error: deleteError } = await client.from("albums")
        .delete().eq("id", album.id).eq("version", album.version).select("id").maybeSingle();
      if (deleteError) throw new Error("Album gagal dihapus. Periksa izin hapus album di Supabase.");
      if (!deleted) throw new Error("Album sudah diubah atau dihapus oleh admin lain. Muat ulang halaman.");

      setItems(current => current.filter(item => item.id !== album.id));
      router.refresh();

      const paths = [...new Set((photos || []).map(photo => photo.storage_path)
        .filter((path): path is string => typeof path === "string" && /^gallery\/[a-f0-9-]{36}\.(jpg|jpeg|png|webp)$/.test(path)))];
      if (paths.length) {
        const results = await Promise.all([
          client.storage.from("draft-media").remove(paths),
          client.storage.from("public-media").remove(paths),
        ]);
        if (results.some(result => result.error)) {
          setError("Album terhapus, tetapi sebagian file foto belum berhasil dibersihkan dari penyimpanan.");
          return;
        }
      }
      setSuccess(`Album "${album.title}" berhasil dihapus.`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Album gagal dihapus.");
    } finally {
      setDeletingId(null);
    }
  }

  return <>
    <div className="admin-page-head"><div><span className="eyebrow">Dokumentasi</span><h1>Galeri</h1><p>Kelola album dan foto kegiatan.</p></div><Link className="btn btn-primary" href="/admin/galeri/baru">Buat Album</Link></div>
    {error && <div className="alert-error" role="alert">{error}</div>}
    {success && <div className="alert-success" role="status">{success}</div>}
    {loading ? <AdminPageSkeleton variant="list" embedded /> : items.length ? <div className="table-wrap"><table className="data-table"><thead><tr><th>Album</th><th>Tanggal kegiatan</th><th>Status</th><th>Tindakan</th></tr></thead><tbody>
      {items.map(album => <tr key={album.id}><td><strong>{album.title}</strong></td><td>{formatDate(album.event_date)}</td><td><span className={`status ${album.status}`}>{album.status}</span></td><td><div className="album-actions">
        <Link className="link-arrow" href={`/admin/galeri/${album.id}/edit`}>Ubah</Link>
        <button type="button" className="btn btn-danger" disabled={deletingId !== null} onClick={() => removeAlbum(album)}>{deletingId === album.id ? "Menghapus..." : "Hapus"}</button>
      </div></td></tr>)}
    </tbody></table></div> : <div className="empty"><h3>Belum ada album</h3><p>Buat album pertama sebagai draft.</p></div>}
  </>;
}
