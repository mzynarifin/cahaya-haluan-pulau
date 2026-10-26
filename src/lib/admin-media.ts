export async function promoteMedia(path: string): Promise<string> {
  const response = await fetch("/api/admin/promote-media", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path }),
  });
  const body = await response.json() as { error?: string; url?: string };
  if (!response.ok || !body.url) throw new Error(body.error || "Media gagal diterbitkan.");
  return body.url;
}
