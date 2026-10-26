import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeReturnTo } from "@/lib/config";

function noIndexRedirect(url: URL) {
  const response = NextResponse.redirect(url);
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const next = safeReturnTo(request.nextUrl.searchParams.get("next"));
  const client = await createClient();

  if (code && client) {
    const { error } = await client.auth.exchangeCodeForSession(code);
    if (!error) return noIndexRedirect(new URL(next, request.url));
  }

  return noIndexRedirect(new URL("/admin/login?error=callback", request.url));
}
