"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { createClient } from "@/lib/supabase/browser";
import { type CroppedImage, type ImagePreset } from "@/lib/image-presets";

const ImageCropDialog = dynamic(
  () => import("@/components/admin/image-crop-dialog").then(module => module.ImageCropDialog),
  { ssr: false, loading: () => <div className="notice" role="status">Memuat editor foto...</div> },
);

type Uploaded = { path: string; preview: string };
type Folder = "news" | "gallery" | "hero" | "about" | "asrama" | "team" | "facilities";

export function MediaUpload({ folder, onUploaded, label = "Pilih foto", preset }: {
  folder: Folder;
  onUploaded: (item: Uploaded) => void;
  label?: string;
  preset: ImagePreset;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<File | null>(null);

  async function upload({ file, shape }: CroppedImage) {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024) {
      throw new Error("Gunakan JPG, PNG, atau WebP maksimal 5 MB.");
    }
    const client = createClient();
    if (!client) throw new Error("Layanan belum dikonfigurasi.");
    setBusy(true);
    try {
      const ext = file.type === "image/jpeg" ? "jpg" : file.type === "image/png" ? "png" : "webp";
      const path = `${folder}/${shape}/${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await client.storage.from("draft-media").upload(path, file, { contentType: file.type });
      if (uploadError) throw new Error("Unggahan gagal. Coba lagi.");
      const { data, error: signedError } = await client.storage.from("draft-media").createSignedUrl(path, 3600);
      if (signedError || !data) throw new Error("Pratinjau gagal dimuat.");
      onUploaded({ path, preview: data.signedUrl });
    } finally {
      setBusy(false);
    }
  }

  async function choose(file: File | undefined) {
    if (!file) return;
    setError("");
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024) {
      setError("Gunakan JPG, PNG, atau WebP maksimal 5 MB.");
      return;
    }
    setSelected(file);
  }

  return <>
    <div className="field">
      <label>{label}<input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy || Boolean(selected)}
        onChange={event => { void choose(event.target.files?.[0]); event.target.value = ""; }} /></label>
      <small>JPG, PNG, atau WebP. Maksimal 5 MB. Foto draft tetap privat.</small>
      <small>Foto akan dipotong ke rasio {preset.ratio}. Sesuaikan area foto melalui sudut kotak.</small>
      {busy && <small role="status">Mengunggah foto...</small>}
      {error && <span className="field-error" role="alert">{error}</span>}
    </div>
    {selected && <ImageCropDialog file={selected} title={`Atur ${label.toLowerCase()}`} preset={preset}
      onCancel={() => setSelected(null)} onConfirm={async cropped => {
        await upload(cropped);
        setSelected(null);
      }} />}
  </>;
}
