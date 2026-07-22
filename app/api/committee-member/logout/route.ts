import { NextRequest, NextResponse } from "next/server";
import { COMMITTEE_SESSION_COOKIE, hashSecret } from "@/lib/committee/auth";
import { createSupabaseAdmin } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const token = request.cookies.get(COMMITTEE_SESSION_COOKIE)?.value;
  if (token) {
    await createSupabaseAdmin().from("committee_member_sessions").update({ revoked_at: new Date().toISOString() }).eq("token_hash", hashSecret(token));
  }
  const response = NextResponse.json({ data: { signedOut: true } });
  response.cookies.set(COMMITTEE_SESSION_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return response;
}

