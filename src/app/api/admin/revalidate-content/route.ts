import { revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  if (request.headers.get("origin") !== request.nextUrl.origin) {
    return NextResponse.json({ error: "Permintaan tidak valid." }, { status: 403 });
  }

  const client = await createClient();
  if (!client) return NextResponse.json({ error: "Layanan belum dikonfigurasi." }, { status: 503 });

  const { data, error } = await client.auth.getSession();
  const userId = data.session?.user.id;
  if (error || !userId) return NextResponse.json({ error: "Sesi admin tidak berlaku." }, { status: 401 });

  const { data: role, error: roleError } = await client.from("admin_users")
    .select("user_id").eq("user_id", userId).maybeSingle();
  if (roleError) return NextResponse.json({ error: "Izin admin tidak dapat diverifikasi." }, { status: 503 });
  if (!role) return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });

  revalidateTag("public-sections", { expire: 0 });
  return NextResponse.json({ ok: true });
}
