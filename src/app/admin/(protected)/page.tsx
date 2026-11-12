import { createClient } from "@/lib/supabase/server";
import { DashboardContent } from "@/components/admin/dashboard-content";

export default async function Dashboard() {
  const client = await createClient();
  const [draft, published, albums, applicants] = await Promise.all([
    client!.from("news").select("id", { count: "exact", head: true }).eq("status", "draft"),
    client!.from("news").select("id", { count: "exact", head: true }).eq("status", "published"),
    client!.from("albums").select("id", { count: "exact", head: true }),
    client!.from("applicants").select("id", { count: "exact", head: true }).in("status", ["Baru", "Dihubungi", "Diproses"]),
  ]);
  return <DashboardContent counts={[draft.count, published.count, albums.count, applicants.count]} />;
}
