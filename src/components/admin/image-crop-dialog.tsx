"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cropShapeForPreset, type CroppedImage, type ImagePreset } from "@/lib/image-presets";

type CropRect = { x: number; y: number; width: number; height: number };
type Corner = "nw" | "ne" | "sw" | "se";
type Drag = { mode: "move" | Corner; pointerId: number; startX: number; startY: number; rect: CropRect };
type Props = { file: File; title: string; preset: ImagePreset; onConfirm: (image: CroppedImage) => Promise<void> | void; onCancel: () => void };
const cornerLabels: Record<Corner, string> = { nw: "kiri atas", ne: "kanan atas", sw: "kiri bawah", se: "kanan bawah" };

const clamp = (value: number, minimum: number, maximum: number) => Math.min(maximum, Math.max(minimum, value));

function largestRect(image: HTMLImageElement, aspect: number, scale = 1): CropRect {
  const width = Math.min(image.naturalWidth, image.naturalHeight * aspect) * scale;
  const height = width / aspect;
  return { x: (image.naturalWidth - width) / 2, y: (image.naturalHeight - height) / 2, width, height };
}

function resizeFromCorner(image: HTMLImageElement, rect: CropRect, corner: Corner, requestedWidth: number, aspect: number): CropRect {
  const east = corner.endsWith("e");
  const south = corner.startsWith("s");
  const anchorX = east ? rect.x : rect.x + rect.width;
  const anchorY = south ? rect.y : rect.y + rect.height;
  const maxWidth = Math.min(east ? image.naturalWidth - anchorX : anchorX,
    (south ? image.naturalHeight - anchorY : anchorY) * aspect);
  const minimum = Math.min(maxWidth, Math.max(60, largestRect(image, aspect).width * 0.4));
  const width = clamp(requestedWidth, minimum, maxWidth);
  return { x: east ? anchorX : anchorX - width, y: south ? anchorY : anchorY - width / aspect,
    width, height: width / aspect };
}

function drawCrop(canvas: HTMLCanvasElement, image: HTMLImageElement, rect: CropRect) {
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Pratinjau gambar tidak tersedia di browser ini.");
  context.fillStyle = "#fff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, rect.x, rect.y, rect.width, rect.height, 0, 0, canvas.width, canvas.height);
}

export function ImageCropDialog({ file, title, preset, onConfirm, onCancel }: Props) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [sourceUrl, setSourceUrl] = useState("");
  const [rect, setRect] = useState<CropRect | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const shape = cropShapeForPreset(preset);
  const outputWidth = preset.outputWidth;
  const stageRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLCanvasElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const dragRef = useRef<Drag | null>(null);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    const nextImage = new window.Image();
    let active = true;
    nextImage.onload = () => {
      if (!active) return;
      setImage(nextImage);
      setSourceUrl(url);
      setRect(largestRect(nextImage, preset.aspect, 0.82));
    };
    nextImage.onerror = () => { if (active) setError("Gambar tidak dapat dibuka. Pilih berkas lain."); };
    nextImage.src = url;
    return () => { active = false; nextImage.onload = null; nextImage.onerror = null; URL.revokeObjectURL(url); };
  }, [file, preset]);

  useEffect(() => {
    if (image && rect && previewRef.current) drawCrop(previewRef.current, image, rect);
  }, [image, rect]);

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

  function beginDrag(event: React.PointerEvent<HTMLElement>, mode: Drag["mode"]) {
    if (!rect || busy) return;
    event.preventDefault();
    event.stopPropagation();
    dragRef.current = { mode, pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, rect };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function moveDrag(event: React.PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    const stage = stageRef.current;
    if (!drag || !stage || !image || drag.pointerId !== event.pointerId || busy) return;
    const dx = (event.clientX - drag.startX) / stage.clientWidth * image.naturalWidth;
    const dy = (event.clientY - drag.startY) / stage.clientHeight * image.naturalHeight;
    if (drag.mode === "move") {
      setRect({ ...drag.rect,
        x: clamp(drag.rect.x + dx, 0, image.naturalWidth - drag.rect.width),
        y: clamp(drag.rect.y + dy, 0, image.naturalHeight - drag.rect.height),
      });
      return;
    }
    const east = drag.mode.endsWith("e");
    const south = drag.mode.startsWith("s");
    const fromX = drag.rect.width + (east ? dx : -dx);
    const fromY = drag.rect.width + (south ? dy : -dy) * preset.aspect;
    setRect(resizeFromCorner(image, drag.rect, drag.mode,
      Math.abs(dx) >= Math.abs(dy * preset.aspect) ? fromX : fromY, preset.aspect));
  }

  function handleSelectionKey(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget || !rect || !image || busy) return;
    const step = Math.max(1, Math.min(image.naturalWidth, image.naturalHeight) * (event.shiftKey ? 0.05 : 0.01));
    const deltaX = event.key === "ArrowRight" ? step : event.key === "ArrowLeft" ? -step : 0;
    const deltaY = event.key === "ArrowDown" ? step : event.key === "ArrowUp" ? -step : 0;
    if (!deltaX && !deltaY) return;
    event.preventDefault();
    setRect({ ...rect, x: clamp(rect.x + deltaX, 0, image.naturalWidth - rect.width),
      y: clamp(rect.y + deltaY, 0, image.naturalHeight - rect.height) });
  }

  function handleCornerKey(event: React.KeyboardEvent<HTMLButtonElement>, corner: Corner) {
    if (!rect || !image || busy) return;
    const step = Math.max(1, largestRect(image, preset.aspect).width * (event.shiftKey ? 0.05 : 0.01));
    const east = corner.endsWith("e");
    const south = corner.startsWith("s");
    const change = event.key === "ArrowRight" ? (east ? step : -step)
      : event.key === "ArrowLeft" ? (east ? -step : step)
      : event.key === "ArrowDown" ? (south ? step : -step) * preset.aspect
      : event.key === "ArrowUp" ? (south ? -step : step) * preset.aspect : 0;
    if (!change) return;
    event.preventDefault();
    setRect(resizeFromCorner(image, rect, corner, rect.width + change, preset.aspect));
  }

  async function confirm() {
    if (!image || !rect || busy) return;
    setBusy(true);
    setError("");
    try {
      const canvas = document.createElement("canvas");
      canvas.width = outputWidth;
      canvas.height = Math.round(outputWidth / preset.aspect);
      drawCrop(canvas, image, rect);
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(result => result ? resolve(result) : reject(new Error("Crop gambar gagal dibuat.")), "image/jpeg", 0.88);
      });
      const cropped = new File([blob], `${file.name.replace(/\.[^.]+$/, "")}.jpg`, { type: "image/jpeg" });
      await onConfirm({ file: cropped, shape });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Crop gambar gagal dibuat.");
    } finally {
      setBusy(false);
    }
  }

  if (typeof document === "undefined") return null;
  return createPortal(<div className="crop-backdrop" onPointerDown={event => { if (event.target === event.currentTarget && !busy) onCancel(); }}>
    <section ref={dialogRef} className="crop-dialog" role="dialog" aria-modal="true" aria-labelledby="crop-title">
      <div className="crop-heading">
        <div><span className="eyebrow">Pratinjau sebelum unggah</span><h2 id="crop-title">{title}</h2></div>
        <button type="button" className="crop-close" onClick={onCancel} disabled={busy} autoFocus aria-label="Tutup pemotong gambar"><X size={20} /></button>
      </div>
      <p className="crop-description">Hasil foto tetap {outputWidth} × {Math.round(outputWidth / preset.aspect)} piksel ({preset.ratio}). Tarik sudut kotak untuk memperbesar atau memperkecil area foto.</p>
      <span className="sr-only" id="crop-keyboard-help">Gunakan tombol panah pada kotak untuk memindahkan area foto, atau pada sudut untuk mengubah ukurannya.</span>
      <div className="crop-workspace">
        <div className="crop-stage-wrap">
          {image && rect && <div ref={stageRef} className="crop-stage"
            style={{ width: `min(100%, ${Math.min(720, 460 * image.naturalWidth / image.naturalHeight)}px)`, aspectRatio: `${image.naturalWidth} / ${image.naturalHeight}` }}
            onPointerMove={moveDrag} onPointerUp={() => { dragRef.current = null; }} onPointerCancel={() => { dragRef.current = null; }}>
            <img src={sourceUrl} alt="" draggable={false} />
            <div className="crop-selection" role="group" tabIndex={0} aria-label="Area gambar yang akan diunggah" aria-describedby="crop-keyboard-help"
              style={{ left: `${rect.x / image.naturalWidth * 100}%`, top: `${rect.y / image.naturalHeight * 100}%`,
                width: `${rect.width / image.naturalWidth * 100}%`, height: `${rect.height / image.naturalHeight * 100}%` }}
              onPointerDown={event => beginDrag(event, "move")} onKeyDown={handleSelectionKey}>
              {(["nw", "ne", "sw", "se"] as const).map(corner => <button key={corner} type="button" className={`crop-handle crop-handle-${corner}`}
                aria-label={`Ubah sudut ${cornerLabels[corner]}`} aria-describedby="crop-keyboard-help" disabled={busy}
                onPointerDown={event => beginDrag(event, corner)} onKeyDown={event => handleCornerKey(event, corner)} />)}
            </div>
          </div>}
          {!image && <div className="crop-loading" role="status">Memuat gambar...</div>}
        </div>
        <div className="crop-result"><strong>Hasil akhir</strong><canvas ref={previewRef} width={240} height={Math.round(240 / preset.aspect)} role="img" aria-label="Pratinjau foto setelah dipotong" /><small>Rasio {preset.ratio} · {outputWidth} × {Math.round(outputWidth / preset.aspect)} piksel</small></div>
      </div>
      {error && <div className="alert-error" role="alert">{error}</div>}
      <div className="crop-actions">
        <button type="button" className="btn btn-quiet" onClick={onCancel} disabled={busy}>Batal</button>
        <button type="button" className="btn btn-primary" onClick={confirm} disabled={!image || busy}>{busy ? "Menyiapkan foto..." : "Gunakan hasil crop"}</button>
      </div>
    </section>
  </div>, document.body);
}
