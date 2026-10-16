"use client";

import { useState } from "react";
import { ImageCropDialog } from "@/components/admin/image-crop-dialog";
import { imagePresets } from "@/lib/image-presets";

export function GalleryCropUpload({ existingCount, disabled, onReady, onCroppingChange }: {
  existingCount: number;
  disabled: boolean;
  onReady: (files: File[]) => Promise<void>;
  onCroppingChange: (value: boolean) => void;
}) {
  const [queue, setQueue] = useState<File[]>([]);
  const [cropped, setCropped] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  function choose(files: FileList | null) {
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
    setCropped([]);
    setQueue(chosen);
    onCroppingChange(true);
  }

  function cancel() {
    setQueue([]);
    setCropped([]);
    onCroppingChange(false);
  }

  async function accept(file: File) {
    const next = [...cropped, file];
    if (queue.length > 1) {
      setCropped(next);
      setQueue(current => current.slice(1));
      return;
    }
    setProcessing(true);
    try {
      await onReady(next);
      cancel();
    } finally {
      setProcessing(false);
    }
  }

  return <>
    <div className="field">
      <label htmlFor="album-photos">Unggah foto galeri</label>
      <input id="album-photos" type="file" accept="image/jpeg,image/png,image/webp" multiple
        disabled={disabled || processing || queue.length > 0}
        onChange={event => { choose(event.target.files); event.target.value = ""; }} />
      <small>Maksimal 20 foto per album, 5 MB per foto. Potong satu per satu sebelum diunggah; pratinjau memakai rasio kartu galeri 4:3.</small>
      {error && <span className="field-error" role="alert">{error}</span>}
    </div>
    {queue[0] && <ImageCropDialog key={`${queue[0].name}-${cropped.length}`} file={queue[0]}
      title={`Atur foto galeri ${cropped.length + 1} dari ${cropped.length + queue.length}`}
      preset={imagePresets.gallery} onCancel={cancel} onConfirm={accept} />}
  </>;
}
