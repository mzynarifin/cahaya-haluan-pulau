import { ImageResponse } from "next/og";
import { siteName } from "@/lib/config";

export const alt = "Cahaya Haluan Pulau — informasi asrama dan kegiatan";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 76, color: "#fff", background: "#153b5c", fontFamily: "Arial, sans-serif" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 28, fontWeight: 700 }}><div style={{ width: 54, height: 54, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 14, background: "#fff", color: "#1959a6", fontSize: 20 }}>CHP</div>{siteName}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}><div style={{ fontSize: 62, fontWeight: 700, lineHeight: 1.08 }}>Informasi Asrama</div><div style={{ fontSize: 32, color: "#dcecff" }}>Tempat tinggal, kegiatan, berita, dan kontak pengurus</div></div>
      <div style={{ display: "flex", fontSize: 24, color: "#dcecff" }}>Informasi resmi Cahaya Haluan Pulau</div>
    </div>,
    size,
  );
}
