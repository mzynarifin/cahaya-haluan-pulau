import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";
import { configured } from "@/lib/config";

export type News = { id: string; title: string; slug: string; excerpt: string | null; body: string; cover_url: string | null; cover_alt: string | null; status: string; published_at: string | null; version: number };
export type NewsPreview = Pick<News, "id" | "title" | "slug" | "excerpt" | "cover_url" | "cover_alt" | "published_at">;
export type Album = { id: string; title: string; slug: string; description: string | null; event_date: string | null; cover_url: string | null; status: string; album_photos?: Photo[] };
export type Photo = { id: string; image_url: string; alt: string; caption: string | null; display_order: number };
export type Section = { key: string; content: Record<string, unknown>; version: number };

const publicCacheKeys = [
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "",
];

function createPublicClient() {
  if (!configured) return null;
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } },
  );
}

const getCachedSection = unstable_cache(async (key: string) => {
  const client = createPublicClient();
  if (!client) return {} as Record<string, unknown>;
  const { data } = await client.from("site_sections").select("content").eq("key", key).maybeSingle();
  return (data?.content as Record<string, unknown>) || {};
}, ["public-section", ...publicCacheKeys], { revalidate: 60, tags: ["public-sections"] });

const getCachedNewsPage = unstable_cache(async (page: number) => {
  const client = createPublicClient();
  if (!client) return { items: [] as NewsPreview[], total: 0 };
  const { data, count } = await client.from("news")
    .select("id,title,slug,excerpt,cover_url,cover_alt,published_at", { count: "exact" })
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .range((page - 1) * 9, page * 9 - 1);
  return { items: (data || []) as NewsPreview[], total: count || 0 };
}, ["public-news-page", ...publicCacheKeys], { revalidate: 60, tags: ["public-news"] });

const getCachedNewsBySlug = unstable_cache(async (slug: string) => {
  const client = createPublicClient();
  if (!client) return null;
  const { data } = await client.from("news")
    .select("id,title,slug,excerpt,body,cover_url,cover_alt,status,published_at,version")
    .eq("slug", slug).eq("status", "published").maybeSingle();
  return data as News | null;
}, ["public-news-by-slug", ...publicCacheKeys], { revalidate: 60, tags: ["public-news"] });

const getCachedAlbums = unstable_cache(async () => {
  const client = createPublicClient();
  if (!client) return [] as Album[];
  const { data } = await client.from("albums")
    .select("id,title,slug,description,event_date,cover_url,status")
    .eq("status", "published").order("event_date", { ascending: false });
  return (data || []) as Album[];
}, ["public-albums", ...publicCacheKeys], { revalidate: 60, tags: ["public-albums"] });

const getCachedAlbumBySlug = unstable_cache(async (slug: string) => {
  const client = createPublicClient();
  if (!client) return null;
  const { data } = await client.from("albums")
    .select("id,title,slug,description,event_date,cover_url,status,album_photos(id,image_url,alt,caption,display_order)")
    .eq("slug", slug).eq("status", "published").maybeSingle();
  if (!data) return null;
  return {
    ...data,
    album_photos: (data.album_photos || []).filter((photo: Photo) => Boolean(photo.image_url))
      .sort((a: Photo, b: Photo) => a.display_order - b.display_order),
  } as Album;
}, ["public-album-by-slug", ...publicCacheKeys], { revalidate: 60, tags: ["public-albums"] });

export async function getSection(key: string): Promise<Record<string, unknown>> {
  return getCachedSection(key);
}

export async function getNews(page = 1, query = "") {
  if (!query) return getCachedNewsPage(page);

  const client = createPublicClient();
  if (!client) return { items: [] as NewsPreview[], total: 0 };
  const { data, count } = await client.from("news")
    .select("id,title,slug,excerpt,cover_url,cover_alt,published_at", { count: "exact" })
    .eq("status", "published")
    .ilike("title", `%${query.replace(/[%_]/g, "")}%`)
    .order("published_at", { ascending: false })
    .range((page - 1) * 9, page * 9 - 1);
  return { items: (data || []) as NewsPreview[], total: count || 0 };
}

export async function getNewsBySlug(slug: string): Promise<News | null> {
  return getCachedNewsBySlug(slug);
}

export async function getAlbums(): Promise<Album[]> {
  return getCachedAlbums();
}

export async function getAlbumBySlug(slug: string): Promise<Album | null> {
  return getCachedAlbumBySlug(slug);
}
