import { createClient } from "@/lib/supabase/server";

export type News = { id: string; title: string; slug: string; excerpt: string | null; body: string; cover_url: string | null; cover_alt: string | null; status: string; published_at: string | null; version: number };
export type Album = { id: string; title: string; slug: string; description: string | null; event_date: string | null; cover_url: string | null; status: string; album_photos?: Photo[] };
export type Photo = { id: string; image_url: string; alt: string; caption: string | null; display_order: number };
export type Section = { key: string; content: Record<string, unknown>; version: number };

export async function getSection(key: string): Promise<Record<string, unknown>> {
  const client = await createClient();
  if (!client) return {};
  const { data } = await client.from("site_sections").select("content").eq("key", key).maybeSingle();
  return (data?.content as Record<string, unknown>) || {};
}

export async function getNews(page = 1, query = "") {
  const client = await createClient();
  if (!client) return { items: [] as News[], total: 0 };
  let request = client.from("news").select("id,title,slug,excerpt,body,cover_url,cover_alt,status,published_at,version", { count: "exact" }).eq("status", "published").order("published_at", { ascending: false });
  if (query) request = request.ilike("title", `%${query.replace(/[%_]/g, "")}%`);
  const { data, count } = await request.range((page - 1) * 9, page * 9 - 1);
  return { items: (data || []) as News[], total: count || 0 };
}

export async function getNewsBySlug(slug: string): Promise<News | null> {
  const client = await createClient();
  if (!client) return null;
  const { data } = await client.from("news").select("id,title,slug,excerpt,body,cover_url,cover_alt,status,published_at,version").eq("slug", slug).eq("status", "published").maybeSingle();
  return data as News | null;
}

export async function getAlbums() {
  const client = await createClient();
  if (!client) return [] as Album[];
  const { data } = await client.from("albums").select("id,title,slug,description,event_date,cover_url,status").eq("status", "published").order("event_date", { ascending: false });
  return (data || []) as Album[];
}

export async function getAlbumBySlug(slug: string): Promise<Album | null> {
  const client = await createClient();
  if (!client) return null;
  const { data } = await client.from("albums").select("id,title,slug,description,event_date,cover_url,status,album_photos(id,image_url,alt,caption,display_order)").eq("slug", slug).eq("status", "published").maybeSingle();
  if (!data) return null;
  return { ...data, album_photos: (data.album_photos || []).filter((p: Photo) => Boolean(p.image_url)).sort((a: Photo, b: Photo) => a.display_order - b.display_order) } as Album;
}
