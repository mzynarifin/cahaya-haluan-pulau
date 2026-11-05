export const siteName = "Cahaya Haluan Pulau";
const defaultSiteUrl = process.env.NODE_ENV === "production"
  ? "https://www.cahayahaluanpulau.com"
  : "http://localhost:3000";
const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
const localSiteUrl = /^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?(?:\/|$)/i.test(configuredSiteUrl || "");
export const siteUrl = (
  process.env.NODE_ENV === "production" && localSiteUrl ? defaultSiteUrl : configuredSiteUrl || defaultSiteUrl
).replace(/\/+$/, "");
export const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
export const whatsappMessage = "Halo pengurus Cahaya Haluan Pulau, saya ingin bertanya tentang tempat tinggal untuk melanjutkan pendidikan di Pulau Jawa.";

export function whatsappHref(value?: string | null, message?: string | null) {
  if (!value || !/^62[1-9]\d{7,12}$/.test(value)) return null;
  const text = message?.trim() || whatsappMessage;
  return `https://wa.me/${value}?text=${encodeURIComponent(text)}`;
}

export function formatDate(value?: string | null) {
  if (!value) return "Tanggal belum tersedia";
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta" }).format(new Date(value));
}

export function formatDateTime(value?: string | null) {
  if (!value) return "Waktu belum tersedia";
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta", timeZoneName: "short" }).format(new Date(value));
}

export function safeReturnTo(value?: string | null) {
  return value?.startsWith("/admin") && !value.startsWith("//") && !value.includes(":") ? value : "/admin";
}
