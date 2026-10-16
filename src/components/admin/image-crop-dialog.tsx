"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

type CropPosition = { x: number; y: number; zoom: number };
type CropDialogProps = {
  file: File;
  title: string;
  aspect: number;
  outputWidth: number;
  onConfirm: (file: File) => Promise<void> | void;
  onCancel: () => void;
};

function cropRect(image: HTMLImageElement, aspect: number, position: CropPosition) {
  const width = image.naturalWidth;
  const height = image.naturalHeight;
  const baseWidth = width / height > aspect ? height * aspect : width;
  const baseHeight = baseWidth / aspect;
  const cropWidth = baseWidth / position.zoom;
  const cropHeight = baseHeight / position.zoom;
  return {
    x: (width - cropWidth) * position.x / 100,
    y: (height - cropHeight) * position.y / 100,
    width: cropWidth,
    height: cropHeight,
  };
}

function drawCrop(canvas: HTMLCanvasElement, image: HTMLImageElement, aspect: number, position: CropPosition) {
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Pratinjau gambar tidak tersedia di browser ini.");
  const source = cropRect(image, aspect, position);
  context.fillStyle = "#fff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, source.x, source.y, source.width, source.height, 0, 0, canvas.width, canvas.height);
}

export function ImageCropDialog({ file, title, aspect, outputWidth, onConfirm, onCancel }: CropDialogProps) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [position, setPosition] = useState<CropPosition>({ x: 50, y: 50, zoom: 1 });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragRef = useRef<{ pointerId: number; startX: number; startY: number; position: CropPosition } | null>(null);
  const dialogRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    const nextImage = new window.Image();
    nextImage.onload = () => setImage(nextImage);
    nextImage.onerror = () => setError("Gambar tidak dapat dibuka. Pilih berkas lain.");
    nextImage.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    if (image && canvasRef.current) drawCrop(canvasRef.current, image, aspect, position);
  }, [image, aspect, position]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) onCancel();
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>("button:not(:disabled), input:not(:disabled)"));
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    window.addEventListener("keydown", handleKeydown);
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener("keydown", handleKeydown); };
  }, [busy, onCancel]);

  async function confirm() {
    if (!image || busy) return;
    setBusy(true);
    setError("");
    try {
      const canvas = document.createElement("canvas");
      canvas.width = outputWidth;
      canvas.height = Math.round(outputWidth / aspect);
      drawCrop(canvas, image, aspect, position);
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(result => result ? resolve(result) : reject(new Error("Crop gambar gagal dibuat.")), "image/jpeg", 0.9);
      });
      const cropped = new File([blob], `${file.name.replace(/\.[^.]+$/, "")}.jpg`, { type: "image/jpeg" });
      await onConfirm(cropped);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Crop gambar gagal dibuat.");
    } finally {
      setBusy(false);
    }
  }

  function move(event: React.PointerEvent<HTMLCanvasElement>) {
    const start = dragRef.current;
    const canvas = canvasRef.current;
    if (!start || !canvas || !image || start.pointerId !== event.pointerId) return;
    const source = cropRect(image, aspect, start.position);
    const availableX = image.naturalWidth - source.width;
    const availableY = image.naturalHeight - source.height;
    const deltaX = (event.clientX - start.startX) * source.width / canvas.clientWidth;
    const deltaY = (event.clientY - start.startY) * source.height / canvas.clientHeight;
    setPosition(current => ({
      ...current,
      x: availableX > 0 ? Math.min(100, Math.max(0, start.position.x - deltaX / availableX * 100)) : 50,
      y: availableY > 0 ? Math.min(100, Math.max(0, start.position.y - deltaY / availableY * 100)) : 50,
    }));
  }

  return <div className="crop-backdrop" onPointerDown={event => { if (event.target === event.currentTarget && !busy) onCancel(); }}>
    <section ref={dialogRef} className="crop-dialog" role="dialog" aria-modal="true" aria-labelledby="crop-title">
      <div className="crop-heading">
        <div><span className="eyebrow">Pratinjau sebelum unggah</span><h2 id="crop-title">{title}</h2></div>
        <button type="button" className="crop-close" onClick={onCancel} disabled={busy} autoFocus aria-label="Tutup pemotong gambar"><X size={20} /></button>
      </div>
      <p className="crop-description">Geser gambar pada pratinjau atau atur pembesaran dan posisi. Area ini sama dengan yang akan tampil di kartu.</p>
      <div className="crop-preview">
        <canvas ref={canvasRef} width={600} height={Math.round(600 / aspect)}
          role="img" aria-label="Pratinjau hasil crop" onPointerDown={event => {
            if (!image) return;
            dragRef.current = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, position };
            event.currentTarget.setPointerCapture(event.pointerId);
          }} onPointerMove={move} onPointerUp={() => { dragRef.current = null; }} onPointerCancel={() => { dragRef.current = null; }} />
      </div>
      <div className="crop-controls">
        <label>Perbesar <strong>{Math.round(position.zoom * 100)}%</strong><input type="range" min="1" max="3" step="0.05" value={position.zoom} disabled={busy} onChange={event => setPosition(current => ({ ...current, zoom: Number(event.target.value) }))} /></label>
        <label>Posisi mendatar<input type="range" min="0" max="100" value={position.x} disabled={busy} onChange={event => setPosition(current => ({ ...current, x: Number(event.target.value) }))} /></label>
        <label>Posisi tegak<input type="range" min="0" max="100" value={position.y} disabled={busy} onChange={event => setPosition(current => ({ ...current, y: Number(event.target.value) }))} /></label>
      </div>
      {error && <div className="alert-error" role="alert">{error}</div>}
      <div className="crop-actions">
        <button type="button" className="btn btn-quiet" onClick={onCancel} disabled={busy}>Batal</button>
        <button type="button" className="btn btn-primary" onClick={confirm} disabled={!image || busy}>{busy ? "Menyiapkan foto..." : "Gunakan hasil crop"}</button>
      </div>
    </section>
  </div>;
}
