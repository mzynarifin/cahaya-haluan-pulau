import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  if (request.headers.get("origin") !== request.nextUrl.origin) {
    return NextResponse.json({ error: "Permintaan login tidak valid." }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Data login tidak valid." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Data login tidak valid." }, { status: 400 });
  }

  const payload = body as Record<string, unknown>;
  const email = typeof payload.email === "string" ? payload.email.trim() : "";
  const password = typeof payload.password === "string" ? payload.password : "";
  if (!email || !password || email.length > 254 || password.length > 1024) {
    return NextResponse.json({ error: "Email atau kata sandi tidak valid." }, { status: 400 });
  }

  try {
    const client = await createClient();
    if (!client) {
      return NextResponse.json({ error: "Konfigurasi layanan belum lengkap." }, { status: 503 });
    }

    const { error } = await client.auth.signInWithPassword({ email, password });
    if (error) {
      const unavailable = error.name === "AuthRetryableFetchError";
      return NextResponse.json(
        { error: unavailable ? "Layanan login Supabase tidak merespons." : "Email atau kata sandi tidak sesuai." },
        { status: unavailable ? 503 : 401 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Layanan login Supabase tidak merespons." }, { status: 503 });
  }
}
