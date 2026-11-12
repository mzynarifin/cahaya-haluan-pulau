import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

type CooldownAction = "admin_login_cooldown_remaining" | "record_admin_login_failure" | "clear_admin_login_failures";

async function updateLoginCooldown(action: CooldownAction, email: string): Promise<number | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  const legacyServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const key = secretKey || legacyServiceKey;
  if (!url || !key) return null;

  try {
    const headers: Record<string, string> = {
      apikey: key,
      "content-type": "application/json",
    };
    // Legacy service-role keys are JWTs. New secret keys are not, so they must
    // only be sent as the apikey header.
    if (!secretKey && legacyServiceKey) headers.authorization = `Bearer ${legacyServiceKey}`;

    const response = await fetch(`${url}/rest/v1/rpc/${action}`, {
      method: "POST",
      headers,
      body: JSON.stringify({ p_email: email }),
      cache: "no-store",
    });
    if (!response.ok) return null;
    if (action === "clear_admin_login_failures") return 0;
    const seconds = await response.json();
    return typeof seconds === "number" && Number.isFinite(seconds) ? Math.max(0, Math.ceil(seconds)) : null;
  } catch {
    // A missing or unavailable cooldown service must not lock out all admins.
    return null;
  }
}

function jsonError(code: string, status: number, retryAfterSeconds?: number) {
  const headers = retryAfterSeconds ? { "retry-after": String(retryAfterSeconds) } : undefined;
  return NextResponse.json({ code, ...(retryAfterSeconds ? { retryAfterSeconds } : {}) }, { status, headers });
}

export async function POST(request: NextRequest) {
  if (request.headers.get("origin") !== request.nextUrl.origin) {
    return jsonError("invalid_request", 403);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("invalid_request", 400);
  }

  if (!body || typeof body !== "object") {
    return jsonError("invalid_request", 400);
  }

  const payload = body as Record<string, unknown>;
  const email = typeof payload.email === "string" ? payload.email.trim() : "";
  const password = typeof payload.password === "string" ? payload.password : "";
  if (!email || !password || email.length > 254 || password.length > 1024) {
    return jsonError("invalid_request", 400);
  }

  try {
    const cooldownSeconds = await updateLoginCooldown("admin_login_cooldown_remaining", email);
    if (cooldownSeconds && cooldownSeconds > 0) return jsonError("cooldown", 429, cooldownSeconds);

    const client = await createClient();
    if (!client) {
      return jsonError("service_unavailable", 503);
    }

    const { error } = await client.auth.signInWithPassword({ email, password });
    if (error) {
      const unavailable = error.name === "AuthRetryableFetchError";
      if (unavailable) return jsonError("service_unavailable", 503);

      // Only wrong-credential responses consume an attempt; other auth errors
      // keep the same public message without changing the cooldown counter.
      if (error.code !== "invalid_credentials") return jsonError("invalid_credentials", 401);
      const retryAfterSeconds = await updateLoginCooldown("record_admin_login_failure", email);
      if (retryAfterSeconds && retryAfterSeconds > 0) return jsonError("cooldown", 429, retryAfterSeconds);
      return jsonError("invalid_credentials", 401);
    }

    await updateLoginCooldown("clear_admin_login_failures", email);
    return NextResponse.json({ ok: true });
  } catch {
    return jsonError("service_unavailable", 503);
  }
}
