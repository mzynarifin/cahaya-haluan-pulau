import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeReturnTo } from "@/lib/config";
export async function GET(request:NextRequest){const code=request.nextUrl.searchParams.get("code");const next=safeReturnTo(request.nextUrl.searchParams.get("next"));const client=await createClient();if(code&&client){const {error}=await client.auth.exchangeCodeForSession(code);if(!error)return NextResponse.redirect(new URL(next,request.url));}return NextResponse.redirect(new URL("/admin/login?error=callback",request.url));}
