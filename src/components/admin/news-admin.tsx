"use client";
import { AdminPageSkeleton } from "@/components/admin/admin-skeleton";
import { useEffect,useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createClient } from "@/lib/supabase/browser";
import { promoteMedia } from "@/lib/admin-media";
import { ArticleBody } from "@/components/article-body";
import { LocalizedDate } from "@/components/localized-date";
import { imageAspectFromUrl, imagePresets } from "@/lib/image-presets";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import { LocalizedText, useEnglishLanguage } from "@/components/language-runtime";
import { ContentLanguageSwitch } from "@/components/admin/content-language-switch";

const MediaUpload = dynamic(
  () => import("@/components/admin/media-upload").then(module => module.MediaUpload),
  { ssr: false, loading: () => <div className="notice" role="status">Memuat alat gambar...</div> },
);

type Row={id:string;title:string;title_en?:string|null;slug:string;status:string;updated_at:string;version:number;excerpt?:string|null;excerpt_en?:string|null;body?:string;body_en?:string|null;cover_url?:string;cover_path?:string;cover_alt?:string|null;cover_alt_en?:string|null};
const newsMediaPathPattern = /^news\/(?:(?:landscape|portrait|four-three|sixteen-ten|four-five)\/)?[a-f0-9-]{36}\.(?:jpg|jpeg|png|webp)$/;

function collectNewsMediaPaths(row: { body?: string | null; body_en?: string | null; cover_path?: string | null; cover_url?: string | null }) {
  const paths = new Set<string>();
  const addPath = (path: string) => {
    if (newsMediaPathPattern.test(path)) paths.add(path);
  };

  if (row.cover_path) addPath(row.cover_path);
  for (const body of [row.body || "", row.body_en || ""]) {
    for (const match of body.matchAll(/media:(news\/(?:(?:landscape|portrait|four-three|sixteen-ten|four-five)\/)?[a-f0-9-]{36}\.(?:jpg|jpeg|png|webp))/g)) addPath(match[1]);
  }

  const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!projectUrl) return [...paths];
  let projectOrigin = "";
  try { projectOrigin = new URL(projectUrl).origin; } catch { return [...paths]; }

  for (const content of [row.cover_url || "", row.body || "", row.body_en || ""]) {
    for (const match of content.matchAll(/https?:\/\/[^\s)"']+/g)) {
      try {
        const url = new URL(match[0]);
        const marker = "/storage/v1/object/public/public-media/";
        const markerIndex = url.pathname.indexOf(marker);
        if (url.origin !== projectOrigin || markerIndex === -1) continue;
        addPath(decodeURIComponent(url.pathname.slice(markerIndex + marker.length)));
      } catch { /* Ignore external or malformed media URLs. */ }
    }
  }
  return [...paths];
}

const schema=z.object({title:z.string().trim().min(5,"Judul minimal 5 karakter.").max(150),title_en:z.string().trim().max(150),slug:z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/,"Slug memakai huruf kecil, angka, dan tanda hubung.").max(160),excerpt:z.string().max(300),excerpt_en:z.string().max(300),body:z.string().trim().min(1,"Isi berita wajib diisi."),body_en:z.string(),cover_alt:z.string().max(200),cover_alt_en:z.string().max(200)});
type Values=z.infer<typeof schema>;
export function NewsList() {
  const router = useRouter();
  const english = useEnglishLanguage();
  const [items, setItems] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query.trim());
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    const client = createClient();
    if (!client) {
      setError("Layanan belum dikonfigurasi.");
      setLoading(false);
      return () => { active = false; };
    }

    let request = client.from("news")
      .select("id,title,title_en,slug,status,updated_at,version", { count: "exact" })
      .order("updated_at", { ascending: false });
    if (debouncedQuery) {
      const search = debouncedQuery.replace(/[%_,()]/g, "");
      request = request.or(`title.ilike.%${search}%,title_en.ilike.%${search}%`);
    }
    if (status) request = request.eq("status", status);

    Promise.resolve(request.range((page - 1) * 10, page * 10 - 1))
      .then(({ data, count, error: queryError }) => {
        if (!active) return;
        if (queryError) setError("Daftar berita gagal dimuat.");
        setItems(data || []);
        setTotal(count || 0);
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setError("Daftar berita gagal dimuat.");
        setLoading(false);
      });

    return () => { active = false; };
  }, [debouncedQuery, status, page]);

  async function removeNews(row: Row) {
    const visibleTitle = english ? row.title_en || row.title : row.title;
    const prompt = english
      ? `Permanently delete news "${visibleTitle}"? Published news will be removed from the website immediately.`
      : `Hapus berita "${visibleTitle}" secara permanen? Berita yang sudah terbit akan langsung hilang dari website.`;
    if (!window.confirm(prompt)) return;
    const client = createClient();
    if (!client) { setError("Layanan tidak tersedia."); return; }
    setDeletingId(row.id);
    setError("");
    setSuccess("");
    try {
      const { data: current, error: readError } = await client.from("news")
        .select("id,version,body,body_en,cover_url,cover_path").eq("id", row.id).eq("version", row.version).maybeSingle();
      if (readError) throw new Error("Data berita gagal dibaca sebelum dihapus.");
      if (!current) throw new Error("Berita sudah diubah atau dihapus oleh admin lain. Muat ulang halaman.");

      const { data: deleted, error: deleteError } = await client.from("news")
        .delete().eq("id", row.id).eq("version", current.version).select("id").maybeSingle();
      if (deleteError) {
        if (deleteError.code === "42501") {
          throw new Error("Database menolak penghapusan. Terapkan policy Admins delete news di Supabase.");
        }
        throw new Error("Berita gagal dihapus. Periksa izin dan koneksi Supabase.");
      }
      if (!deleted) {
        const { data: latest, error: checkError } = await client.from("news")
          .select("version").eq("id", row.id).maybeSingle();
        if (checkError) throw new Error("Penghapusan tidak terkonfirmasi. Muat ulang daftar berita.");
        if (!latest) throw new Error("Berita sudah dihapus oleh admin lain. Muat ulang daftar berita.");
        if (latest.version !== current.version) throw new Error("Berita baru saja diubah admin lain. Muat ulang daftar berita.");
        throw new Error("Database belum mengizinkan penghapusan. Jalankan supabase/news-delete-policy.sql.");
      }

      setItems(current => current.filter(item => item.id !== row.id));
      setTotal(current => Math.max(0, current - 1));
      if (items.length === 1 && page > 1) setPage(current => current - 1);
      router.refresh();

      const paths = collectNewsMediaPaths(current);
      if (paths.length) {
        const results = await Promise.all([
          client.storage.from("draft-media").remove(paths),
          client.storage.from("public-media").remove(paths),
        ]);
        if (results.some(result => result.error)) {
          throw new Error("Berita terhapus, tetapi sebagian foto belum berhasil dibersihkan dari penyimpanan.");
        }
      }
      setSuccess(`${english ? "News" : "Berita"} "${visibleTitle}" ${english ? "deleted successfully." : "berhasil dihapus."}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Berita gagal dihapus.");
    } finally {
      setDeletingId(null);
    }
  }

  return <>
    <div className="news-admin">
      <div className="admin-page-head"><div><span className="eyebrow">Konten</span><h1>Berita</h1><p>Buat draft, pratinjau, dan terbitkan kabar.</p></div>
        <Link className="btn btn-primary" href="/admin/berita/baru"><Plus size={18} aria-hidden="true" />Tulis berita</Link>
      </div>
      <div className="news-admin-toolbar">
        <input aria-label="Cari judul berita" placeholder="Cari judul berita" value={query} onChange={event => { setQuery(event.target.value); setPage(1); }} />
        <select aria-label="Filter status" value={status} onChange={event => { setStatus(event.target.value); setPage(1); }}>
          <option value="">Semua status</option><option value="draft">Draft</option><option value="published">Terbit</option><option value="archived">Arsip</option>
        </select>
      </div>
      {error && <div className="alert-error" role="alert">{error}</div>}
      {success && <div className="alert-success" role="status">{success}</div>}
      {loading ? <AdminPageSkeleton variant="list" embedded /> : items.length ?
        <div className="table-wrap news-table-wrap"><table className="data-table news-table"><thead><tr><th>Judul</th><th>Status</th><th>Terakhir diubah</th><th className="news-actions-heading">Tindakan</th></tr></thead>
          <tbody>{items.map(row => <tr key={row.id}>
            <td className="news-cell news-cell-title"><span className="news-cell-label">Berita</span><div><strong><LocalizedText id={row.title} en={row.title_en} /></strong><div className="tiny muted">/{row.slug}</div></div></td>
            <td className="news-cell news-cell-status"><span className="news-cell-label">Status</span><span className={`status ${row.status}`}>{row.status}</span></td>
            <td className="news-cell news-cell-date"><span className="news-cell-label">Terakhir diubah</span><LocalizedDate value={row.updated_at} /></td>
            <td className="news-cell news-cell-actions"><div className="news-row-actions">
              <Link href={`/admin/berita/${row.id}/edit`} className="btn btn-quiet news-action-edit"><Pencil size={15} aria-hidden="true" />Ubah</Link>
              <button type="button" className="btn btn-danger news-action-delete" disabled={deletingId !== null} onClick={() => removeNews(row)} aria-label={`${english ? "Delete news" : "Hapus berita"}: ${english ? row.title_en || row.title : row.title}`}>
                <Trash2 size={15} aria-hidden="true" />{deletingId === row.id ? english ? "Deleting..." : "Menghapus..." : english ? "Delete" : "Hapus"}
              </button>
            </div></td>
          </tr>)}</tbody>
        </table></div> : <div className="empty"><h3>{debouncedQuery ? "Tidak ada hasil" : "Belum ada berita"}</h3>
          <p>{debouncedQuery ? "Coba kata kunci lain." : "Tulis berita pertama sebagai draft."}</p></div>}
      {total > 10 && <div className="pagination"><button className="btn btn-quiet" disabled={page === 1} onClick={() => setPage(page - 1)}>Sebelumnya</button>
        <span>Halaman {page}</span><button className="btn btn-quiet" disabled={page * 10 >= total} onClick={() => setPage(page + 1)}>Berikutnya</button></div>}
    </div>
  </>;
}
export function NewsEditor({ id }: { id?: string }) {
  const router = useRouter();
  const { register, handleSubmit, setValue, watch, formState: { isDirty, errors } } = useForm<Values>({
    defaultValues: { title: "", title_en: "", slug: "", excerpt: "", excerpt_en: "", body: "", body_en: "", cover_alt: "", cover_alt_en: "" },
  });
  const [row, setRow] = useState<Row | null>(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [preview, setPreview] = useState(false);
  const [image, setImage] = useState("");
  const [path, setPath] = useState("");
  const [bodyPreviews, setBodyPreviews] = useState<Record<string, string>>({});
  const [contentLanguage, setContentLanguage] = useState<"id" | "en">("id");
  const values = watch();
  const activeBody = contentLanguage === "en" ? "body_en" : "body";
  const bodyValue = values[activeBody] || "";

  useEffect(() => {
    if (!id) return;
    const client = createClient();
    if (!client) { setError("Layanan tidak tersedia."); setLoading(false); return; }
    client.from("news").select("*").eq("id", id).single().then(async ({ data, error: readError }) => {
      if (readError || !data) setError("Berita tidak ditemukan atau tidak dapat dibaca.");
      else {
        setRow(data);
        for (const field of ["title", "title_en", "slug", "excerpt", "excerpt_en", "body", "body_en", "cover_alt", "cover_alt_en"] as const) {
          setValue(field, String(data[field] || ""));
        }
        setImage(data.cover_url || "");
        setPath(data.cover_path || "");
        const bodyTexts = [String(data.body || ""), String(data.body_en || "")];
        const mediaPaths = new Set(bodyTexts.flatMap(body => [...body.matchAll(/media:([a-z]+\/(?:(?:landscape|portrait|four-three|sixteen-ten|four-five)\/)?[a-f0-9-]+\.(?:jpg|jpeg|png|webp))/g)].map(match => match[1])));
        await Promise.all([...mediaPaths].map(async mediaPath => {
          const { data: signed } = await client.storage.from("draft-media").createSignedUrl(mediaPath, 3600);
          if (signed) setBodyPreviews(previous => ({ ...previous, [mediaPath]: signed.signedUrl }));
        }));
      }
      setLoading(false);
    });
  }, [id, setValue]);

  useEffect(() => {
    const listener = (event: BeforeUnloadEvent) => { if (isDirty) event.preventDefault(); };
    window.addEventListener("beforeunload", listener);
    return () => window.removeEventListener("beforeunload", listener);
  }, [isDirty]);

  async function publishMedia(bodyText: string) {
    let nextBody = bodyText.trim();
    for (const match of nextBody.matchAll(/media:([a-z]+\/(?:(?:landscape|portrait|four-three|sixteen-ten|four-five)\/)?[a-f0-9-]+\.(?:jpg|jpeg|png|webp))/g)) {
      const url = await promoteMedia(match[1]);
      nextBody = nextBody.replace(`media:${match[1]}`, url);
    }
    return nextBody;
  }

  async function save(data: Values, action: "draft" | "published" | "archived") {
    setError(""); setSuccess("");
    const result = schema.safeParse(data);
    if (!result.success) { setError(result.error.issues[0]?.message || "Periksa isian."); return; }
    if (action === "published" && (!data.excerpt.trim() || !data.cover_alt.trim() || !data.title_en.trim() || !data.excerpt_en.trim() || !data.body_en.trim() || !data.cover_alt_en.trim() || (!path && !row?.cover_url))) {
      setError("Lengkapi judul, ringkasan, isi, alt text bahasa Indonesia dan English, serta foto sampul sebelum publikasi."); return;
    }
    if (action === "published" && !window.confirm("Terbitkan berita ini ke website publik?")) return;
    if (action === "archived" && !window.confirm("Arsipkan berita ini? Berita akan hilang dari website publik.")) return;
    setBusy(true);
    try {
      const client = createClient();
      if (!client) throw new Error("Layanan tidak tersedia.");
      let coverUrl = row?.cover_url || null;
      if (action === "published" && path && (path !== row?.cover_path || !coverUrl)) coverUrl = await promoteMedia(path);
      const body = action === "published" ? await publishMedia(data.body) : data.body.trim();
      const bodyEn = action === "published" ? await publishMedia(data.body_en) : data.body_en.trim();
      const payload = {
        title: data.title.trim(), title_en: data.title_en.trim() || null, slug: data.slug.trim(),
        excerpt: data.excerpt.trim() || null, excerpt_en: data.excerpt_en.trim() || null,
        body, body_en: bodyEn || null,
        cover_alt: data.cover_alt.trim() || null, cover_alt_en: data.cover_alt_en.trim() || null,
        cover_path: path || null, cover_url: coverUrl, status: action,
      };
      if (row) {
        const { data: updated, error: dbError } = await client.from("news").update(payload).eq("id", row.id).eq("version", row.version).select("*").maybeSingle();
        if (dbError) throw new Error(dbError.code === "23505" ? "Slug sudah digunakan." : "Berita gagal disimpan. Periksa kembali isian.");
        if (!updated) throw new Error("Berita berubah di sesi admin lain. Salin perubahan Anda, lalu muat ulang.");
        setRow(updated); setSuccess("Perubahan berhasil disimpan.");
      } else {
        const { data: created, error: dbError } = await client.from("news").insert(payload).select("*").single();
        if (dbError) throw new Error(dbError.code === "23505" ? "Slug sudah digunakan." : "Berita gagal disimpan. Periksa kembali isian.");
        setRow(created); setSuccess("Draft berita berhasil disimpan."); router.replace(`/admin/berita/${created.id}/edit`);
      }
      setValue("body", body); setValue("body_en", bodyEn); router.refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Penyimpanan gagal."); }
    finally { setBusy(false); }
  }

  function insertSyntax(before: string, after = "") {
    const field = document.getElementById(activeBody) as HTMLTextAreaElement | null;
    if (!field) return;
    const current = field.value; const start = field.selectionStart; const end = field.selectionEnd;
    const selected = current.slice(start, end);
    const next = current.slice(0, start) + before + selected + after + current.slice(end);
    setValue(activeBody, next, { shouldDirty: true }); field.focus();
    const selectionStart = start + before.length; field.setSelectionRange(selectionStart, selectionStart + selected.length);
  }

  function insertUploadedMedia(mediaPath: string) {
    setValue(activeBody, `${bodyValue}\n![${contentLanguage === "en" ? "Photo alt text" : "Alt foto"}](media:${mediaPath} "${contentLanguage === "en" ? "Photo caption" : "Keterangan foto"}")\n`, { shouldDirty: true });
  }

  if (loading) return <AdminPageSkeleton variant="form" />;
  const activeTitle = contentLanguage === "en" ? values.title_en : values.title;
  const activeExcerpt = contentLanguage === "en" ? values.excerpt_en : values.excerpt;
  const activeAlt = contentLanguage === "en" ? values.cover_alt_en : values.cover_alt;
  const previewBody = bodyValue.replace(/media:([a-z]+\/(?:(?:landscape|portrait|four-three|sixteen-ten|four-five)\/)?[a-f0-9-]+\.(?:jpg|jpeg|png|webp))/g, (_match: string, mediaPath: string) => bodyPreviews[mediaPath] || "");

  return <>
    <div className="admin-page-head"><div><span className="eyebrow">Berita {row ? `· ${row.status}` : "· baru"}</span><h1>{row ? "Ubah berita" : "Tulis berita"}</h1><p>{row?.status === "published" ? "Perubahan akan tampil setelah berhasil disimpan." : "Simpan sebagai draft sebelum diterbitkan."}</p></div><Link href="/admin/berita" className="btn btn-quiet">Kembali ke daftar</Link></div>
    <div className="admin-form">
      {error && <div className="alert-error" role="alert">{error}</div>}{success && <div className="alert-success" role="status">{success}</div>}
      <ContentLanguageSwitch value={contentLanguage} onChange={setContentLanguage} />
      <form onSubmit={handleSubmit(data => save(data, row?.status === "published" ? "published" : "draft"))}>
        <div className="field"><label htmlFor={contentLanguage === "en" ? "title_en" : "title"}>Judul *</label><input id={contentLanguage === "en" ? "title_en" : "title"} {...register(contentLanguage === "en" ? "title_en" : "title", { required: contentLanguage === "id" })} maxLength={150} onBlur={event => { if (contentLanguage === "id" && !row && !values.slug) setValue("slug", event.target.value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-"), { shouldDirty: true }); }} />{contentLanguage === "id" && errors.title && <span className="field-error">Judul wajib diisi.</span>}</div>
        {contentLanguage === "id" && <div className="field"><label htmlFor="slug">Slug *</label><input id="slug" {...register("slug", { required: true })} maxLength={160} disabled={row?.status === "published"} /><small>Tautan artikel. Slug berita terbit dikunci.</small></div>}
        <div className="field"><label htmlFor={contentLanguage === "en" ? "excerpt_en" : "excerpt"}>Ringkasan</label><textarea id={contentLanguage === "en" ? "excerpt_en" : "excerpt"} {...register(contentLanguage === "en" ? "excerpt_en" : "excerpt")} maxLength={300} /><small>{(contentLanguage === "en" ? values.excerpt_en : values.excerpt)?.length || 0}/300 karakter</small></div>
        {contentLanguage === "id" && <MediaUpload folder="news" label="Sampul berita" preset={imagePresets.newsCover} onUploaded={({ path: next, preview: src }) => { setPath(next); setImage(src); }} />}
        {image && contentLanguage === "id" && <img src={image} alt="Pratinjau sampul" style={{ width: 230, aspectRatio: imageAspectFromUrl(image, imagePresets.newsCover.aspect), objectFit: "contain", borderRadius: 4, marginBottom: 18 }} />}
        <div className="field"><label htmlFor={contentLanguage === "en" ? "cover_alt_en" : "cover_alt"}>Alt text sampul</label><input id={contentLanguage === "en" ? "cover_alt_en" : "cover_alt"} {...register(contentLanguage === "en" ? "cover_alt_en" : "cover_alt")} maxLength={200} /></div>
        <div className="field"><label htmlFor={activeBody}>Isi berita *</label><MediaUpload folder="news" label="Gambar isi berita" preset={imagePresets.newsBody} onUploaded={({ path: mediaPath, preview: src }) => { setBodyPreviews(previous => ({ ...previous, [mediaPath]: src })); insertUploadedMedia(mediaPath); }} />
          <div className="form-actions" style={{ margin: "0 0 8px" }}><button type="button" className="btn btn-quiet" onClick={() => insertSyntax("## ")}>Judul bagian</button><button type="button" className="btn btn-quiet" onClick={() => insertSyntax("**", "**")}>Tebal</button><button type="button" className="btn btn-quiet" onClick={() => insertSyntax("*", "*")}>Miring</button><button type="button" className="btn btn-quiet" onClick={() => insertSyntax("- ")}>Daftar</button><button type="button" className="btn btn-quiet" onClick={() => insertSyntax("[teks](https://contoh.com)")}>Tautan</button></div>
          <textarea id={activeBody} {...register(activeBody, { required: contentLanguage === "id" })} rows={14} /><small>Format sederhana: ## subjudul, ### subjudul kecil, **tebal**, *miring*, - daftar, dan [teks](https://alamat). HTML bebas tidak dijalankan.</small>
        </div>
        <div className="form-actions"><button type="button" className="btn btn-outline" onClick={() => setPreview(!preview)}>{preview ? "Tutup pratinjau" : "Pratinjau privat"}</button><button className="btn btn-primary" disabled={busy}>{busy ? "Menyimpan..." : row?.status === "published" ? "Simpan perubahan" : "Simpan draft"}</button>{row?.status !== "published" && <button type="button" className="btn btn-primary" disabled={busy} onClick={handleSubmit(data => save(data, "published"))}>Terbitkan berita</button>}{row?.status !== "archived" && row && <button type="button" className="btn btn-quiet" disabled={busy} onClick={handleSubmit(data => save(data, "archived"))}>Arsipkan</button>}{row?.status === "archived" && <button type="button" className="btn btn-quiet" disabled={busy} onClick={handleSubmit(data => save(data, "draft"))}>Pulihkan ke draft</button>}{row?.status === "published" && <button type="button" className="btn btn-quiet" disabled={busy} onClick={() => { if (window.confirm("Kembalikan berita ke draft? Artikel tidak lagi terlihat publik.")) handleSubmit(data => save(data, "draft"))(); }}>Kembalikan ke draft</button>}</div>
      </form>
      {preview && <div className="article" style={{ marginTop: 40, borderTop: "1px solid var(--border)", paddingTop: 25 }}><span className="eyebrow">Pratinjau privat</span><h2>{activeTitle || (contentLanguage === "en" ? "News title" : "Judul berita")}</h2><p>{activeExcerpt}</p>{image && <img src={image} alt={activeAlt || (contentLanguage === "en" ? "Cover" : "Sampul")} style={{ width: "100%", borderRadius: 8 }} />}<ArticleBody body={previewBody} /></div>}
    </div>
  </>;
}
