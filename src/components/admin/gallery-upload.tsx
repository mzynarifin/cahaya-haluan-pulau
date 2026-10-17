"use client";

import { useState } from "react";

export function GalleryUpload({ existingCount, disabled, onReady }: {
  existingCount: number;
  disabled: boolean;
  onReady: (files: File[]) => Promise<void>;
}) {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  async function choose(files: FileList | null) {
    if (!files?.length) return;
    const chosen = Array.from(files);
    setError("");
    if (existingCount + chosen.length > 20) {
      setError("Maksimal 20 foto dalam satu album.");
      return;
    }
    if (chosen.some(file => !["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024)) {
      setError("Gunakan JPG, PNG, atau WebP maksimal 5 MB per foto.");
      return;
    }
    setProcessing(true);
    try {
      await onReady(chosen);
    } catch {
      setError("Unggahan gagal. Coba lagi.");
    } finally {
      setProcessing(false);
    }
  }

  return <div className="field">
    <label htmlFor="album-photos">Unggah foto galeri</label>
    <input id="album-photos" type="file" accept="image/jpeg,image/png,image/webp" multiple
      disabled={disabled || processing}
      onChange={event => { void choose(event.target.files); event.target.value = ""; }} />
    <small>Maksimal 20 foto per album, 5 MB per foto. Sampul album tampil 5:4 dan dapat terpotong; foto asli tetap utuh saat dibuka. Foto di dalam album tampil dalam bingkai 4:5.</small>
    {error && <span className="field-error" role="alert">{error}</span>}
  </div>;
}
