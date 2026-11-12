"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminPageSkeleton } from "@/components/admin/admin-skeleton";
import { GalleryUpload } from "@/components/admin/gallery-upload";
import { createClient } from "@/lib/supabase/browser";
import { promoteMedia } from "@/lib/admin-media";

type Album = { id: string; title: string; title_en: string | null; slug: string; description: string | null; description_en: string | null; event_date: string | null; cover_url: string | null; status: string; version: number };
type Photo = { id: string; album_id: string; image_url: string | null; storage_path: string | null; alt: string; alt_en: string | null; caption: string | null; caption_en: string | null; display_order: number; preview?: string };

export function GalleryEditor({ id }: { id?: string }) {
  const router = useRouter();
  const [album, setAlbum] = useState<Album | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [title, setTitle] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [date, setDate] = useState("");
  const [coverId, setCoverId] = useState("");
  const [contentLanguage, setContentLanguage] = useState<"id" | "en">("id");
  const [loading, setLoading] = useState(Boolean(id));
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);

  useEffect(() => {
    if (!id) return;
    const client = createClient();
    if (!client) { setError("Layanan tidak tersedia."); setLoading(false); return; }
    async function load() {
      const { data, error: readError } = await client.from("albums").select("*").eq("id", id).single();
      if (readError || !data) { setError("Album tidak ditemukan."); setLoading(false); return; }
      setAlbum(data); setTitle(data.title || ""); setTitleEn(data.title_en || ""); setSlug(data.slug || "");
      setDescription(data.description || ""); setDescriptionEn(data.description_en || ""); setDate(data.event_date || "");
      const { data: records } = await client.from("album_photos").select("*").eq("album_id", id).order("display_order");
      const withPreview = await Promise.all((records || []).map(async (photo: Photo) => {
        if (photo.image_url) return { ...photo, preview: photo.image_url };
        if (photo.storage_path) {
          const { data: signed } = await client.storage.from("draft-media").createSignedUrl(photo.storage_path, 3600);
          return { ...photo, preview: signed?.signedUrl };
        }
        return photo;
      }));
      setPhotos(withPreview); setCoverId(withPreview.find(photo => photo.image_url === data.cover_url)?.id || withPreview[0]?.id || "");
      setLoading(false);
    }
    void load();
  }, [id]);

  async function saveDraft() {
    setError(""); setSuccess("");
    if (title.trim().length < 3 || title.length > 150) { setError("Judul album harus 3–150 karakter."); return; }
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) { setError("Slug harus memakai huruf kecil, angka, dan tanda hubung."); return; }
    setBusy(true);
    const client = createClient();
    if (!client) { setError("Layanan tidak tersedia."); setBusy(false); return; }
    const payload = { title: title.trim(), title_en: titleEn.trim() || null, slug, description: description.trim() || null, description_en: descriptionEn.trim() || null, event_date: date || null };
    if (album) {
      const { data, error: dbError } = await client.from("albums").update(payload).eq("id", album.id).eq("version", album.version).select("*").maybeSingle();
      if (dbError) setError(dbError.code === "23505" ? "Slug sudah digunakan." : "Album gagal disimpan.");
      else if (!data) setError("Album telah diubah oleh admin lain. Muat ulang halaman.");
      else { setAlbum(data); setSuccess("Album berhasil disimpan."); router.refresh(); }
    } else {
      const { data, error: dbError } = await client.from("albums").insert({ ...payload, status: "draft" }).select("*").single();
      if (dbError) setError(dbError.code === "23505" ? "Slug sudah digunakan." : "Album gagal dibuat.");
      else { setAlbum(data); setSuccess("Draft album dibuat. Anda dapat menambahkan foto."); router.replace(`/admin/galeri/${data.id}/edit`); }
    }
    setBusy(false);
  }

  async function uploadFiles(files: File[]) {
    if (!files?.length || !album) return;
    const chosen = Array.from(files);
    if (photos.length + chosen.length > 20) { setError("Maksimal 20 foto dalam satu album."); return; }
    const client = createClient();
    if (!client) { setUploadErrors(["Layanan unggah tidak tersedia."]); return; }
    setUploading(true); setUploadErrors([]); let uploaded = 0;
    try {
      for (const file of chosen) {
        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024) {
          setUploadErrors(previous => [...previous, `${file.name}: gunakan JPG/PNG/WebP maksimal 5 MB.`]); continue;
        }
        const extension = file.type === "image/jpeg" ? "jpg" : file.type === "image/png" ? "png" : "webp";
        const path = `gallery/${crypto.randomUUID()}.${extension}`;
        const { error: uploadError } = await client.storage.from("draft-media").upload(path, file, { contentType: file.type });
        if (uploadError) { setUploadErrors(previous => [...previous, `${file.name}: unggahan gagal, pilih ulang untuk mencoba.`]); continue; }
        const { data: inserted, error: dbError } = await client.from("album_photos").insert({
          album_id: album.id, storage_path: path, alt: file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "), display_order: photos.length + uploaded,
        }).select("*").single();
        if (dbError || !inserted) { setUploadErrors(previous => [...previous, `${file.name}: metadata gagal disimpan.`]); continue; }
        const { data: signed } = await client.storage.from("draft-media").createSignedUrl(path, 3600);
        setPhotos(previous => [...previous, { ...inserted, preview: signed?.signedUrl }]);
        setCoverId(current => current || inserted.id); uploaded += 1;
      }
    } catch { setUploadErrors(previous => [...previous, "Koneksi terputus saat mengunggah. Pilih ulang foto yang belum muncul."]); }
    finally { setUploading(false); }
  }

  function editPhoto(photoId: string, key: "alt" | "alt_en" | "caption" | "caption_en", value: string) {
    setPhotos(previous => previous.map(photo => photo.id === photoId ? { ...photo, [key]: value } : photo));
  }
  function move(index: number, step: number) {
    const target = index + step;
    if (target < 0 || target >= photos.length) return;
    setPhotos(previous => { const next = [...previous]; [next[index], next[target]] = [next[target], next[index]]; return next; });
  }
  async function savePhotos() {
    setError(""); setSuccess(""); if (!album) return;
    const invalid = photos.findIndex(photo => !photo.alt.trim() || photo.alt.length > 200 || (photo.alt_en?.length || 0) > 200);
    if (invalid !== -1) { setError(`Alt text foto ${invalid + 1} wajib diisi, maksimal 200 karakter.`); return; }
    setBusy(true); const client = createClient();
    if (!client) { setError("Layanan tidak tersedia."); setBusy(false); return; }
    for (let index = 0; index < photos.length; index++) {
      const photo = photos[index];
      const { error: dbError } = await client.from("album_photos").update({
        alt: photo.alt.trim(), alt_en: photo.alt_en?.trim() || null,
        caption: photo.caption?.trim() || null, caption_en: photo.caption_en?.trim() || null, display_order: index,
      }).eq("id", photo.id);
      if (dbError) { setError("Perubahan foto gagal disimpan."); setBusy(false); return; }
    }
    setSuccess("Keterangan dan urutan foto disimpan."); setBusy(false); router.refresh();
  }

  async function changeStatus(next: "published" | "draft" | "archived") {
    if (!album) return;
    setError(""); setSuccess("");
    if (next === "published" && (!photos.length || !coverId)) { setError("Tambahkan minimal satu foto dan pilih sampul."); return; }
    if (next === "published" && (!titleEn.trim() || (description && !descriptionEn.trim()) || photos.some(photo => !photo.alt.trim() || !photo.alt_en?.trim() || (photo.caption && !photo.caption_en?.trim())))) {
      setError("Lengkapi judul, deskripsi, alt text, dan keterangan dalam bahasa Indonesia dan English sebelum publikasi."); return;
    }
    if (next === "published" && photos.some(photo => !photo.alt.trim())) { setError("Alt text setiap foto wajib diisi."); return; }
    const prompt = next === "published" ? "Terbitkan album dan seluruh foto ini?" : next === "archived" ? "Arsipkan album ini dari website publik?" : "Kembalikan album ke draft?";
    if (!window.confirm(prompt)) return;
    setBusy(true);
    try {
      const client = createClient(); if (!client) throw new Error("Layanan tidak tersedia.");
      const updatedPhotos = photos.map(photo => ({ ...photo }));
      if (next === "published") {
        for (let index = 0; index < updatedPhotos.length; index++) {
          const photo = updatedPhotos[index];
          if (!photo.image_url) { if (!photo.storage_path) throw new Error("Foto belum siap diterbitkan."); photo.image_url = await promoteMedia(photo.storage_path); }
          const { error: photoError } = await client.from("album_photos").update({
            image_url: photo.image_url, alt: photo.alt.trim(), alt_en: photo.alt_en?.trim() || null,
            caption: photo.caption?.trim() || null, caption_en: photo.caption_en?.trim() || null, display_order: index,
          }).eq("id", photo.id);
          if (photoError) throw new Error("Foto gagal disimpan. Album tetap sebagai draft.");
        }
        setPhotos(updatedPhotos);
      }
      const cover = updatedPhotos.find(photo => photo.id === coverId)?.image_url || null;
      const { data, error: dbError } = await client.from("albums").update({
        title: title.trim(), title_en: titleEn.trim() || null, slug,
        description: description.trim() || null, description_en: descriptionEn.trim() || null,
        event_date: date || null, status: next, cover_url: next === "published" ? cover : album.cover_url,
      })
        .eq("id", album.id).eq("version", album.version).select("*").maybeSingle();
      if (dbError) throw new Error("Status album gagal disimpan.");
      if (!data) throw new Error("Album berubah di sesi lain. Muat ulang halaman.");
      setAlbum(data); setSuccess("Status album berhasil diperbarui."); router.refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Gagal mengubah status."); }
    finally { setBusy(false); }
  }

  if (loading) return <AdminPageSkeleton variant="form" />;
  const lang = contentLanguage;
  return <>
    <div className="admin-page-head"><div><span className="eyebrow">Galeri {album ? `· ${album.status}` : "· baru"}</span><h1>{album ? "Ubah Album" : "Buat Album"}</h1><p>Simpan album terlebih dahulu, kemudian tambahkan foto.</p></div><Link href="/admin/galeri" className="btn btn-quiet">Kembali ke daftar</Link></div>
    <div className="admin-form">
      {error && <div className="alert-error" role="alert">{error}</div>}{success && <div className="alert-success" role="status">{success}</div>}
      <div className="form-actions" role="group" aria-label="Bahasa konten" style={{ margin: "0 0 20px" }}><button type="button" className={`btn ${lang === "id" ? "btn-primary" : "btn-quiet"}`} aria-pressed={lang === "id"} onClick={() => setContentLanguage("id")}>Bahasa Indonesia</button><button type="button" className={`btn ${lang === "en" ? "btn-primary" : "btn-quiet"}`} aria-pressed={lang === "en"} onClick={() => setContentLanguage("en")}>English</button></div>
      <div className="field"><label htmlFor={lang === "en" ? "album-title-en" : "album-title"}>Judul album *</label><input id={lang === "en" ? "album-title-en" : "album-title"} value={lang === "en" ? titleEn : title} maxLength={150} onChange={event => {
        if (lang === "en") setTitleEn(event.target.value);
        else { setTitle(event.target.value); if (!album) setSlug(event.target.value.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-")); }
      }} /></div>
      {lang === "id" && <div className="field"><label htmlFor="album-slug">Slug *</label><input id="album-slug" value={slug} disabled={album?.status === "published"} onChange={event => setSlug(event.target.value)} /></div>}
      {lang === "id" && <div className="field"><label htmlFor="album-date">Tanggal kegiatan</label><input id="album-date" type="date" value={date} onChange={event => setDate(event.target.value)} /></div>}
      <div className="field"><label htmlFor={lang === "en" ? "album-desc-en" : "album-desc"}>Deskripsi</label><textarea id={lang === "en" ? "album-desc-en" : "album-desc"} value={lang === "en" ? descriptionEn : description} onChange={event => lang === "en" ? setDescriptionEn(event.target.value) : setDescription(event.target.value)} /></div>
      <button className="btn btn-primary" onClick={saveDraft} disabled={busy}>{busy ? "Menyimpan..." : album ? "Simpan perubahan" : "Simpan draft album"}</button>
      {album && <section style={{ marginTop: 35, borderTop: "1px solid var(--border)", paddingTop: 30 }}><h2>Foto album</h2><GalleryUpload existingCount={photos.length} disabled={uploading || busy} onReady={uploadFiles} />{uploading && <p className="tiny muted" role="status">Mengunggah foto...</p>}{uploadErrors.map((message, index) => <div className="alert-error" key={index}>{message}</div>)}
        {photos.map((photo, index) => <div className="content-card" key={photo.id} style={{ marginBottom: 14 }}>
          {photo.preview && <img src={photo.preview} alt={lang === "en" ? photo.alt_en || photo.alt : photo.alt} style={{ display: "block", maxWidth: 180, maxHeight: 225, width: "auto", height: "auto", borderRadius: 4 }} />}
          <div className="field"><label htmlFor={`alt-${photo.id}`}>Alt text foto {index + 1} *</label><input id={`alt-${photo.id}`} value={lang === "en" ? photo.alt_en || "" : photo.alt} maxLength={200} onChange={event => editPhoto(photo.id, lang === "en" ? "alt_en" : "alt", event.target.value)} /></div>
          <div className="field"><label htmlFor={`caption-${photo.id}`}>Keterangan</label><input id={`caption-${photo.id}`} value={lang === "en" ? photo.caption_en || "" : photo.caption || ""} onChange={event => editPhoto(photo.id, lang === "en" ? "caption_en" : "caption", event.target.value)} /></div>
          {lang === "id" && <><label className="field"><span><input type="radio" name="cover" checked={coverId === photo.id} onChange={() => setCoverId(photo.id)} /> Jadikan sampul</span></label><div className="form-actions"><button type="button" className="btn btn-quiet" disabled={index === 0} onClick={() => move(index, -1)}>Naik</button><button type="button" className="btn btn-quiet" disabled={index === photos.length - 1} onClick={() => move(index, 1)}>Turun</button></div></>}
        </div>)}
        <div className="form-actions"><button className="btn btn-outline" disabled={busy} onClick={savePhotos}>Simpan foto & urutan</button><button className="btn btn-primary" disabled={busy || uploading} onClick={() => changeStatus("published")}>{album.status === "published" ? "Terbitkan perubahan" : "Terbitkan album"}</button>{album.status === "published" && <button className="btn btn-quiet" disabled={busy} onClick={() => changeStatus("draft")}>Kembalikan ke draft</button>}{album.status !== "archived" && <button className="btn btn-quiet" disabled={busy} onClick={() => changeStatus("archived")}>Arsipkan</button>}{album.status === "archived" && <button className="btn btn-quiet" disabled={busy} onClick={() => changeStatus("draft")}>Pulihkan ke draft</button>}</div>
      </section>}
    </div>
  </>;
}
