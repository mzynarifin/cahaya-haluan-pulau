"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { createClient } from "@/lib/supabase/browser";
import { promoteMedia } from "@/lib/admin-media";
import { AdminPageSkeleton } from "@/components/admin/admin-skeleton";
import { ContentLanguageSwitch } from "@/components/admin/content-language-switch";
import { whatsappMessage } from "@/lib/config";
import { imageAspectFromUrl, imagePresets, type ImagePreset } from "@/lib/image-presets";
import styles from "./section-editor.module.css";

const MediaUpload = dynamic(
  () => import("@/components/admin/media-upload").then(module => module.MediaUpload),
  { ssr: false, loading: () => <div className="notice" role="status">Memuat alat gambar...</div> },
);

type SectionKey = "profile" | "accommodation" | "team" | "contact" | "program-suara-anak-pulau" | "program-urx1";
type Item = { name?: string; nameEn?: string; role?: string; roleEn?: string; description?: string; descriptionEn?: string; question?: string; questionEn?: string; answer?: string; answerEn?: string; visible?: boolean; image?: string };
type Field = { name: string; label: string; kind?: "textarea" | "email" | "map"; hint?: string; language?: "id" | "en"; bilingual?: boolean };
const programFields: Field[] = [
  { name: "eyebrow", label: "Label program", language: "id" },
  { name: "kicker", label: "Nama lembaga di hero", language: "id" },
  { name: "title", label: "Judul utama", language: "id" },
  { name: "subtitle", label: "Subjudul", language: "id" },
  { name: "description", label: "Deskripsi program", kind: "textarea", language: "id" },
  { name: "heroButton", label: "Teks tombol utama", language: "id" },
  { name: "focusEyebrow", label: "Label fokus", language: "id" },
  { name: "focusTitle", label: "Judul bagian fokus", language: "id" },
  { name: "focusDescription", label: "Deskripsi bagian fokus", kind: "textarea", language: "id" },
  { name: "focus1", label: "Fokus 1", language: "id" },
  { name: "focus2", label: "Fokus 2", language: "id" },
  { name: "focus3", label: "Fokus 3", language: "id" },
  { name: "ctaEyebrow", label: "Label ajakan", language: "id" },
  { name: "ctaTitle", label: "Judul ajakan", language: "id" },
  { name: "ctaButton", label: "Teks tombol kontak", language: "id" },
  { name: "eyebrowEn", label: "Label program", language: "en" },
  { name: "kickerEn", label: "Nama lembaga di hero", language: "en" },
  { name: "titleEn", label: "Judul utama", language: "en" },
  { name: "subtitleEn", label: "Subjudul", language: "en" },
  { name: "descriptionEn", label: "Deskripsi program", kind: "textarea", language: "en" },
  { name: "heroButtonEn", label: "Teks tombol utama", language: "en" },
  { name: "focusEyebrowEn", label: "Label fokus", language: "en" },
  { name: "focusTitleEn", label: "Judul bagian fokus", language: "en" },
  { name: "focusDescriptionEn", label: "Deskripsi bagian fokus", kind: "textarea", language: "en" },
  { name: "focus1En", label: "Fokus 1", language: "en" },
  { name: "focus2En", label: "Fokus 2", language: "en" },
  { name: "focus3En", label: "Fokus 3", language: "en" },
  { name: "ctaEyebrowEn", label: "Label ajakan", language: "en" },
  { name: "ctaTitleEn", label: "Judul ajakan", language: "en" },
  { name: "ctaButtonEn", label: "Teks tombol kontak", language: "en" },
];
const configs: Record<SectionKey, { title: string; description: string; fields: Field[] }> = {
  profile: { title: "Profil Lembaga", description: "Informasi profil dan pesan utama yang tampil di website.", fields: [
    { name: "name", label: "Nama lembaga" }, { name: "description", label: "Deskripsi singkat", kind: "textarea", bilingual: true },
    { name: "history", label: "Sejarah", kind: "textarea", bilingual: true }, { name: "vision", label: "Visi", kind: "textarea", bilingual: true },
    { name: "mission", label: "Misi", kind: "textarea", bilingual: true }, { name: "heroTitle", label: "Judul beranda", bilingual: true },
    { name: "heroDescription", label: "Deskripsi beranda", kind: "textarea", bilingual: true },
  ] },
  accommodation: { title: "Center & Fasilitas", description: "Kelola informasi yang tampil di halaman Center. Ringkasan fasilitas beranda otomatis memakai hingga tiga fasilitas yang ditandai tampil di publik.", fields: [
    { name: "description", label: "Deskripsi Center", kind: "textarea", bilingual: true }, { name: "publicAddress", label: "Alamat untuk publik", bilingual: true },
    { name: "targetResidents", label: "Sasaran penghuni", kind: "textarea", bilingual: true, hint: "Jelaskan kelompok yang dituju secara singkat. Kolom ini tampil di beranda dan halaman Center jika diisi." },
  ] },
  team: { title: "Pengurus", description: "Tampilkan nama dan foto hanya setelah izin publikasi.", fields: [] },
  contact: { title: "Kontak", description: "Nomor WhatsApp resmi diperlukan sebelum website diluncurkan.", fields: [
    { name: "whatsapp", label: "WhatsApp (format 62...)" },
    { name: "whatsappMessage", label: "Pesan awal WhatsApp", kind: "textarea", bilingual: true },
    { name: "emailSuaraAnakPulau", label: "Email Suara Anak Pulau", kind: "email", hint: "Email umum lama akan tetap tampil sebagai fallback hingga alamat khusus diisi." },
    { name: "emailUrx1", label: "Email URX1", kind: "email" },
    { name: "publicAddress", label: "Alamat publik", bilingual: true }, { name: "contactHours", label: "Jam kontak", bilingual: true },
    { name: "mapUrl", label: "URL embed Google Maps yang disetujui", kind: "map" },
  ] },
  "program-suara-anak-pulau": { title: "Halaman Suara Anak Pulau", description: "Ubah seluruh teks halaman Suara Anak Pulau dalam Bahasa Indonesia dan English.", fields: programFields },
  "program-urx1": { title: "Halaman URX1", description: "Ubah seluruh teks halaman URX1 dalam Bahasa Indonesia dan English.", fields: programFields },
};

export function SectionEditor({ section }: { section: SectionKey }) {
  const config = configs[section];
  const [content, setContent] = useState<Record<string, unknown>>({});
  const [version, setVersion] = useState(1); const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false); const [dirty, setDirty] = useState(false);
  const [error, setError] = useState(""); const [success, setSuccess] = useState("");
  const [preview, setPreview] = useState(false);
  const [contentLanguage, setContentLanguage] = useState<"id" | "en">("id");
  const [uploads, setUploads] = useState<Record<string, string>>({});
  const isProgramSection = section === "program-suara-anak-pulau" || section === "program-urx1";
  const visibleFields = config.fields.flatMap(field => {
    if (field.language) return field.language === contentLanguage ? [field] : [];
    if (!field.bilingual || contentLanguage === "id") return [field];
    return [{ ...field, name: `${field.name}En`, hint: undefined }];
  });
  const hasBilingualContent = isProgramSection || section === "team" || config.fields.some(field => field.bilingual);

  useEffect(() => { createClient()?.from("site_sections").select("content,version").eq("key", section).single()
    .then(({ data, error: fetchError }) => {
      if (fetchError) setError(section.startsWith("program-")
        ? "Data halaman program belum tersedia. Jalankan supabase/program-content-sections.sql setelah schema.sql, lalu muat ulang halaman."
        : "Data gagal dimuat. Periksa skema Supabase lalu muat ulang halaman.");
      if (data) { setContent(data.content || {}); setVersion(data.version); }
      setLoading(false);
    }); }, [section]);
  useEffect(() => { const before = (event: BeforeUnloadEvent) => { if (dirty) event.preventDefault(); };
    window.addEventListener("beforeunload", before); return () => window.removeEventListener("beforeunload", before); }, [dirty]);
  function set(name: string, value: unknown) { setContent(current => ({ ...current, [name]: value })); setDirty(true); setSuccess(""); }
  function list(name: string): Item[] { return Array.isArray(content[name]) ? content[name] as Item[] : []; }
  function recordUpload(path: string, url: string) { setUploads(current => ({ ...current, [url]: path })); }

  async function save() {
    setError(""); setSuccess("");
    if (section === "contact" && content.whatsapp && !/^62[1-9]\d{7,12}$/.test(String(content.whatsapp))) {
      setError("Nomor WhatsApp harus diawali 62 dan berisi nomor internasional yang valid."); return;
    }
    if (section === "contact" && content.whatsappMessage && String(content.whatsappMessage).trim().length > 500) {
      setError("Pesan awal WhatsApp maksimal 500 karakter."); return;
    }
    if (section === "contact" && content.mapUrl && !/^https:\/\/(www\.)?google\.com\/maps\/embed\?/.test(String(content.mapUrl))) {
      setError("Gunakan URL embed Google Maps resmi yang disetujui pengurus."); return;
    }
    setBusy(true);
    try {
      const client = createClient(); if (!client) throw new Error("Layanan belum tersedia.");
      const next = { ...content };
      for (const name of ["heroImage", "heroImageMobile", "aboutImage", "image"]) {
        if (typeof next[name] === "string" && uploads[next[name]]) next[name] = await promoteMedia(uploads[next[name]]);
      }
      for (const name of ["members", "facilities"]) {
        if (Array.isArray(next[name])) next[name] = await Promise.all((next[name] as Item[]).map(async item => ({
          ...item, image: item.image && uploads[item.image] ? await promoteMedia(uploads[item.image]) : item.image,
        })));
      }
      const { data, error: dbError } = await client.from("site_sections").update({ content: next })
        .eq("key", section).eq("version", version).select("version").maybeSingle();
      if (dbError) throw new Error("Perubahan gagal disimpan. Periksa data dan coba lagi.");
      if (!data) throw new Error("Data sudah diubah oleh admin lain. Salin isian Anda lalu muat ulang.");
      setVersion(data.version); setContent(next); setUploads({}); setDirty(false);
      let refreshed = false;
      try {
        const response = await fetch("/api/admin/revalidate-content", { method: "POST", credentials: "same-origin" });
        refreshed = response.ok;
      } catch {
        // The saved section is still valid; its public cache expires within 60 seconds.
      }
      setSuccess(refreshed
        ? "Perubahan berhasil disimpan dan tampil di website."
        : "Perubahan tersimpan. Halaman publik akan diperbarui otomatis dalam 60 detik.");
    } catch (e) { setError(e instanceof Error ? e.message : "Penyimpanan gagal."); }
    finally { setBusy(false); }
  }

  if (loading) return <AdminPageSkeleton variant="form" />;
  return <><div className={`admin-page-head${section === "team" ? " team-admin-page-head" : ""}`}><div><span className="eyebrow">Konten publik</span><h1>{config.title}</h1><p>{config.description}</p></div></div>
    <div className={`admin-form${section === "team" ? " team-admin-form" : ""}`}>
      {error && <div className="alert-error" role="alert">{error}</div>}{success && <div className="alert-success" role="status">{success}</div>}
      {hasBilingualContent && <ContentLanguageSwitch value={contentLanguage} onChange={setContentLanguage} />}
      {visibleFields.map(field => <div className="field" key={field.name}><label htmlFor={field.name}>{field.label}</label>
        {field.kind === "textarea" ? <textarea id={field.name} value={String(content[field.name] || "")} placeholder={field.name === "whatsappMessage" ? whatsappMessage : undefined} onChange={e => set(field.name, e.target.value)} />
          : <input id={field.name} type={field.kind === "email" ? "email" : "text"} value={String(content[field.name] || "")} onChange={e => set(field.name, e.target.value)} />}
        {field.hint && <small>{field.hint}</small>}
        {field.name === "whatsappMessage" && <small>Kosongkan untuk memakai teks contoh di atas. Pesan muncul di WhatsApp dan tetap harus dikirim oleh pengunjung.</small>}
        {field.kind === "map" && <small>Tempel URL dari atribut src iframe, bukan seluruh kode. Setelah disimpan, peta muncul di halaman Kontak.</small>}
      </div>)}
      {section === "profile" && <>
        <ImageField label="Foto beranda desktop" hint="Foto memenuhi seluruh area beranda dan dapat terpotong di tepinya. Format lanskap disarankan untuk layar desktop." folder="hero" preset={imagePresets.heroDesktop} value={String(content.heroImage || "")} onUploaded={(path, url) => { set("heroImage", url); recordUpload(path, url); }} />
        <ImageField label="Foto beranda mobile" hint="Foto memenuhi layar mobile dan dapat terpotong. Jika kosong, foto desktop atau ilustrasi bawaan digunakan." folder="hero" preset={imagePresets.heroMobile} value={String(content.heroImageMobile || "")} onUploaded={(path, url) => { set("heroImageMobile", url); recordUpload(path, url); }} />
        <ImageField label="Foto halaman tentang" hint="Foto memenuhi bingkai pada desktop dan mobile; bagian tepi dapat terpotong." folder="about" preset={imagePresets.about} value={String(content.aboutImage || "")} onUploaded={(path, url) => { set("aboutImage", url); recordUpload(path, url); }} />
      </>}
      {isProgramSection && <>
        <ImageField label="Foto program desktop" hint="Foto tampil sebagai latar hero program pada layar desktop. Gunakan foto lanskap agar komposisi tetap kuat di sisi kanan." folder="program" preset={imagePresets.programDesktop} value={String(content.heroImage || "")} onUploaded={(path, url) => { set("heroImage", url); recordUpload(path, url); }} />
        <ImageField label="Foto program mobile" hint="Foto khusus layar mobile. Gunakan komposisi vertikal agar subjek tetap terlihat di belakang teks hero." folder="program" preset={imagePresets.programMobile} value={String(content.heroImageMobile || "")} onUploaded={(path, url) => { set("heroImageMobile", url); recordUpload(path, url); }} />
      </>}
      {section === "accommodation" && <>
        <ImageField label="Foto Center" hint="Foto memenuhi bingkai Center di beranda dan halaman Center; bagian tepi dapat terpotong." folder="asrama" preset={imagePresets.accommodation} value={String(content.image || "")} onUploaded={(path, url) => { set("image", url); recordUpload(path, url); }} />
        <Repeater language={contentLanguage} title="Fasilitas" items={list("facilities")} fields={[["name", "Nama fasilitas"], ["description", "Keterangan"]]}
          imageFolder="facilities" onUpload={recordUpload} onChange={items => set("facilities", items)} />
        <Repeater language={contentLanguage} title="Pertanyaan umum" items={list("faqs")} fields={[["question", "Pertanyaan"], ["answer", "Jawaban"]]}
          onChange={items => set("faqs", items)} />
      </>}
      {section === "team" && <Repeater language={contentLanguage} title="Daftar pengurus" items={list("members")} fields={[["name", "Nama"], ["role", "Jabatan"]]}
        imageFolder="team" onUpload={recordUpload} onChange={items => set("members", items)} />}
      <div className="form-actions"><button className="btn btn-outline" type="button" onClick={() => setPreview(!preview)}>{preview ? "Tutup pratinjau" : "Pratinjau"}</button>
        <button className="btn btn-primary" type="button" disabled={busy} onClick={save}>{busy ? "Menyimpan..." : "Simpan & Tampilkan"}</button></div>
      {preview && <div className="content-card" style={{ marginTop: 25 }}><h3>Pratinjau informasi</h3>
        {visibleFields.map(field => Boolean(content[field.name]) && <p key={field.name}><strong>{field.label}:</strong> {String(content[field.name])}</p>)}
        {section === "accommodation" && <p><strong>Fasilitas utama di beranda:</strong> {list("facilities")
          .filter(item => item.visible && item.name?.trim())
          .slice(0, 3)
          .map(item => item.name?.trim())
          .filter(Boolean)
          .join(", ") || "Belum ada fasilitas yang ditandai tampil di publik."}</p>}
        {list("facilities").map((item, i) => <p key={i}><strong>{contentLanguage === "en" ? item.nameEn || item.name : item.name}</strong> — {contentLanguage === "en" ? item.descriptionEn || item.description : item.description}{item.visible ? "" : " (disembunyikan dari publik)"}</p>)}
        {list("members").map((item, i) => <p key={i}><strong>{contentLanguage === "en" ? item.nameEn || item.name : item.name}</strong> — {(contentLanguage === "en" ? item.roleEn || item.role : item.role)?.trim() || "Pengurus"}{item.visible ? "" : " (disembunyikan)"}</p>)}
      </div>}
    </div></>;
}

function ImageField({ label, hint, folder, preset, value, onUploaded }: { label: string; hint?: string; folder: "hero" | "about" | "asrama" | "program"; preset: ImagePreset; value: string; onUploaded: (path: string, url: string) => void }) {
  return <div style={{ margin: "20px 0" }}><MediaUpload label={label} folder={folder} preset={preset} onUploaded={({ path, preview }) => onUploaded(path, preview)} />
    {hint && <p className="tiny muted" style={{ marginTop: -10 }}>{hint}</p>}
    {value && <img src={value} alt={`Pratinjau ${label}`} style={{ width: 180, aspectRatio: imageAspectFromUrl(value, preset.aspect), objectFit: "contain", borderRadius: 4 }} />}</div>;
}

function Repeater({ title, items, fields, language, imageFolder, onUpload, onChange }: { title: string; items: Item[]; fields: [string, string][]; language: "id" | "en"; imageFolder?: "team" | "facilities"; onUpload?: (path: string, url: string) => void; onChange: (items: Item[]) => void }) {
  const isTeam = imageFolder === "team";
  return <div className={`repeater${isTeam ? " team-repeater" : ` ${styles.accommodationRepeater}`}`} style={isTeam ? { margin: "14px 0" } : undefined}>
    <div className={isTeam ? "team-repeater-heading" : styles.accommodationRepeaterHeading}>
      {isTeam ? <h3>{title}</h3> : <h2 className={styles.accommodationRepeaterTitle}>{title}</h2>}
      {isTeam && <p>Atur nama, jabatan, foto, dan status publikasi setiap pengurus.</p>}
    </div>
    {items.map((item, i) => <div className={`content-card${isTeam ? " team-editor-card" : ""}`} key={i} style={isTeam ? undefined : { marginBottom: 12 }}>
      {isTeam && <div className="team-editor-card-heading"><strong>Pengurus {String(i + 1).padStart(2, "0")}</strong>
        <span className={`team-editor-status ${item.visible ? "is-visible" : "is-hidden"}`}>{item.visible ? "Tampil" : "Disembunyikan"}</span></div>}
      <div className={isTeam ? "team-editor-card-content" : undefined}>
        <div className={isTeam ? "team-editor-fields" : undefined}>
          {fields.map(([key, label]) => {
            const fieldName = language === "en" ? `${key}En` : key;
            return <div className={`field${isTeam ? " team-editor-field" : ""}`} key={key}><label htmlFor={`${title}-${i}-${key}`}>{label}</label>
              <input id={`${title}-${i}-${key}`} value={String(item[fieldName as keyof Item] || "")} placeholder={isTeam && key === "role" ? "Jika kosong, tampil sebagai Pengurus" : undefined} onChange={e => onChange(items.map((value, index) => index === i ? { ...value, [fieldName]: e.target.value } : value))} /></div>;
          })}
        </div>
        {imageFolder && <div className={isTeam ? `team-editor-media${item.image ? " has-preview" : ""}` : undefined}>
          <MediaUpload label={imageFolder === "team" ? "Foto pengurus" : "Foto fasilitas"} folder={imageFolder} preset={imageFolder === "team" ? imagePresets.team : imagePresets.facilities} onUploaded={({ path, preview }) => { onUpload?.(path, preview); onChange(items.map((value, index) => index === i ? { ...value, image: preview } : value)); }} />
          {item.image && <img className={isTeam ? "team-editor-preview" : undefined} src={item.image} alt={`Pratinjau ${item.name || title}`} style={isTeam ? undefined : { width: 130, aspectRatio: imageAspectFromUrl(item.image, imagePresets.facilities.aspect), objectFit: "contain", borderRadius: 4 }} />}
        </div>}
        {isTeam
          ? <div className="team-editor-actions">
            <label className="team-editor-visibility"><span>Tampil di publik <input type="checkbox" checked={Boolean(item.visible)} onChange={e => onChange(items.map((value, index) => index === i ? { ...value, visible: e.target.checked } : value))} /></span></label>
            <button className="btn btn-quiet" type="button" onClick={() => onChange(items.filter((_, index) => index !== i))}>Hapus pengurus</button>
          </div>
          : <>
            {title !== "Pertanyaan umum" && <label className="field"><span>Tampil di publik <input type="checkbox" checked={Boolean(item.visible)} onChange={e => onChange(items.map((value, index) => index === i ? { ...value, visible: e.target.checked } : value))} /></span></label>}
            <button className="btn btn-quiet" type="button" onClick={() => onChange(items.filter((_, index) => index !== i))}>Hapus baris</button>
          </>}
      </div>
    </div>)}
    <button className="btn btn-outline" type="button" onClick={() => onChange([...items, {}])}>Tambah {title.toLowerCase()}</button>
  </div>;
}
