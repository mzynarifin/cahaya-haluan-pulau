"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import { MediaUpload, promoteMedia } from "@/components/admin/media-upload";
import { whatsappMessage } from "@/lib/config";

type SectionKey = "profile" | "accommodation" | "team" | "contact";
type Item = { name?: string; role?: string; description?: string; visible?: boolean; question?: string; answer?: string; image?: string };
type Field = { name: string; label: string; kind?: "textarea" | "email" | "map" };
const configs: Record<SectionKey, { title: string; description: string; fields: Field[] }> = {
  profile: { title: "Profil Lembaga", description: "Informasi profil dan pesan utama yang tampil di website.", fields: [
    { name: "name", label: "Nama lembaga" }, { name: "description", label: "Deskripsi singkat", kind: "textarea" },
    { name: "history", label: "Sejarah", kind: "textarea" }, { name: "vision", label: "Visi", kind: "textarea" },
    { name: "mission", label: "Misi", kind: "textarea" }, { name: "heroTitle", label: "Judul beranda" },
    { name: "heroDescription", label: "Deskripsi beranda", kind: "textarea" },
  ] },
  accommodation: { title: "Asrama & Fasilitas", description: "Terbitkan hanya informasi tempat tinggal yang sudah diverifikasi.", fields: [
    { name: "description", label: "Deskripsi asrama", kind: "textarea" }, { name: "publicAddress", label: "Alamat untuk publik" },
    { name: "feeDescription", label: "Informasi biaya", kind: "textarea" }, { name: "requirements", label: "Persyaratan", kind: "textarea" },
  ] },
  team: { title: "Pengurus", description: "Tampilkan nama dan foto hanya setelah izin publikasi.", fields: [] },
  contact: { title: "Kontak", description: "Nomor WhatsApp resmi diperlukan sebelum website diluncurkan.", fields: [
    { name: "whatsapp", label: "WhatsApp (format 62...)" },
    { name: "whatsappMessage", label: "Pesan awal WhatsApp", kind: "textarea" },
    { name: "email", label: "Email", kind: "email" },
    { name: "publicAddress", label: "Alamat publik" }, { name: "contactHours", label: "Jam kontak" },
    { name: "mapUrl", label: "URL embed Google Maps yang disetujui", kind: "map" },
  ] },
};

export function SectionEditor({ section }: { section: SectionKey }) {
  const config = configs[section]; const router = useRouter();
  const [content, setContent] = useState<Record<string, unknown>>({});
  const [version, setVersion] = useState(1); const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false); const [dirty, setDirty] = useState(false);
  const [error, setError] = useState(""); const [success, setSuccess] = useState("");
  const [preview, setPreview] = useState(false);
  const [uploads, setUploads] = useState<Record<string, string>>({});

  useEffect(() => { createClient()?.from("site_sections").select("content,version").eq("key", section).single()
    .then(({ data, error: fetchError }) => {
      if (fetchError) setError("Data gagal dimuat. Periksa skema Supabase lalu muat ulang halaman.");
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
      for (const name of ["heroImage", "aboutImage", "image"]) {
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
      setSuccess("Perubahan berhasil disimpan dan tampil di website."); router.refresh();
    } catch (e) { setError(e instanceof Error ? e.message : "Penyimpanan gagal."); }
    finally { setBusy(false); }
  }

  if (loading) return <p role="status">Memuat data...</p>;
  return <><div className="admin-page-head"><div><span className="eyebrow">Konten publik</span><h1>{config.title}</h1><p>{config.description}</p></div></div>
    <div className="admin-form">
      {error && <div className="alert-error" role="alert">{error}</div>}{success && <div className="alert-success" role="status">{success}</div>}
      {config.fields.map(field => <div className="field" key={field.name}><label htmlFor={field.name}>{field.label}</label>
        {field.kind === "textarea" ? <textarea id={field.name} value={String(content[field.name] || "")} placeholder={field.name === "whatsappMessage" ? whatsappMessage : undefined} onChange={e => set(field.name, e.target.value)} />
          : <input id={field.name} type={field.kind === "email" ? "email" : "text"} value={String(content[field.name] || "")} onChange={e => set(field.name, e.target.value)} />}
        {field.name === "whatsappMessage" && <small>Kosongkan untuk memakai teks contoh di atas. Pesan muncul di WhatsApp dan tetap harus dikirim oleh pengunjung.</small>}
        {field.kind === "map" && <small>Salin URL embed, bukan kode iframe. Lokasi presisi perlu persetujuan pengurus.</small>}
      </div>)}
      {section === "profile" && <>
        <ImageField label="Foto utama beranda" folder="hero" value={String(content.heroImage || "")} onUploaded={(path, url) => { set("heroImage", url); recordUpload(path, url); }} />
        <ImageField label="Foto halaman tentang" folder="about" value={String(content.aboutImage || "")} onUploaded={(path, url) => { set("aboutImage", url); recordUpload(path, url); }} />
      </>}
      {section === "accommodation" && <>
        <ImageField label="Foto asrama" folder="asrama" value={String(content.image || "")} onUploaded={(path, url) => { set("image", url); recordUpload(path, url); }} />
        <Repeater title="Fasilitas" items={list("facilities")} fields={[["name", "Nama fasilitas"], ["description", "Keterangan"]]}
          imageFolder="facilities" onUpload={recordUpload} onChange={items => set("facilities", items)} />
        <Repeater title="Pertanyaan umum" items={list("faqs")} fields={[["question", "Pertanyaan"], ["answer", "Jawaban"]]}
          onChange={items => set("faqs", items)} />
      </>}
      {section === "team" && <Repeater title="Daftar pengurus" items={list("members")} fields={[["name", "Nama"], ["role", "Jabatan"]]}
        imageFolder="team" onUpload={recordUpload} onChange={items => set("members", items)} />}
      <div className="form-actions"><button className="btn btn-outline" type="button" onClick={() => setPreview(!preview)}>{preview ? "Tutup pratinjau" : "Pratinjau"}</button>
        <button className="btn btn-primary" type="button" disabled={busy} onClick={save}>{busy ? "Menyimpan..." : "Simpan & Tampilkan"}</button></div>
      {preview && <div className="content-card" style={{ marginTop: 25 }}><h3>Pratinjau informasi</h3>
        {config.fields.map(field => Boolean(content[field.name]) && <p key={field.name}><strong>{field.label}:</strong> {String(content[field.name])}</p>)}
        {list("facilities").map((item, i) => <p key={i}><strong>{item.name}</strong> — {item.description}</p>)}
        {list("members").map((item, i) => <p key={i}><strong>{item.name}</strong> — {item.role}{item.visible ? "" : " (disembunyikan)"}</p>)}
      </div>}
    </div></>;
}

function ImageField({ label, folder, value, onUploaded }: { label: string; folder: "hero" | "about" | "asrama"; value: string; onUploaded: (path: string, url: string) => void }) {
  return <div style={{ margin: "20px 0" }}><MediaUpload label={label} folder={folder} onUploaded={({ path, preview }) => onUploaded(path, preview)} />
    {value && <img src={value} alt={`Pratinjau ${label}`} style={{ width: 180, borderRadius: 8 }} />}</div>;
}

function Repeater({ title, items, fields, imageFolder, onUpload, onChange }: { title: string; items: Item[]; fields: [string, string][]; imageFolder?: "team" | "facilities"; onUpload?: (path: string, url: string) => void; onChange: (items: Item[]) => void }) {
  return <div style={{ margin: "28px 0" }}><h3>{title}</h3>{items.map((item, i) => <div className="content-card" key={i} style={{ marginBottom: 12 }}>
    {fields.map(([key, label]) => <div className="field" key={key}><label htmlFor={`${title}-${i}-${key}`}>{label}</label>
      <input id={`${title}-${i}-${key}`} value={String(item[key as keyof Item] || "")} onChange={e => onChange(items.map((value, index) => index === i ? { ...value, [key]: e.target.value } : value))} /></div>)}
    {imageFolder && <><MediaUpload label="Foto" folder={imageFolder} onUploaded={({ path, preview }) => { onUpload?.(path, preview); onChange(items.map((value, index) => index === i ? { ...value, image: preview } : value)); }} />
      {item.image && <img src={item.image} alt={`Pratinjau ${item.name || title}`} style={{ width: 130, borderRadius: 8 }} />}</>}
    {title !== "Pertanyaan umum" && <label className="field"><span>Tampil di publik <input type="checkbox" checked={Boolean(item.visible)} onChange={e => onChange(items.map((value, index) => index === i ? { ...value, visible: e.target.checked } : value))} /></span></label>}
    <button className="btn btn-quiet" type="button" onClick={() => onChange(items.filter((_, index) => index !== i))}>Hapus baris</button>
  </div>)}<button className="btn btn-outline" type="button" onClick={() => onChange([...items, {}])}>Tambah {title.toLowerCase()}</button></div>;
}
