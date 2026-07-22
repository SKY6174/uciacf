import { NextRequest, NextResponse } from "next/server";
import { COMMITTEE_SESSION_COOKIE, createSessionToken, hashSecret } from "@/lib/committee/auth";
import { apiError, normalizeCode, requireText } from "@/lib/committee/validation";
import { createSupabaseAdmin } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const committeeCode = normalizeCode(body.committeeCode, "위원회 코드");
    const memberCode = normalizeCode(body.memberCode, "위원 코드");
    const securityCode = requireText(body.securityCode, "보안코드", 128);
    const token = createSessionToken();
    const expiresAt = new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString();
    const { data, error } = await createSupabaseAdmin().rpc("authenticate_committee_member", {
      p_committee_code: committeeCode,
      p_member_code: memberCode,
      p_access_code: securityCode,
      p_token_hash: hashSecret(token),
      p_expires_at: expiresAt,
    });
    if (error || !data?.[0]) throw new Error("위원회 코드, 위원 코드 또는 보안코드를 확인해 주세요.");
    const response = NextResponse.json({ data: { memberName: data[0].member_name, committeeName: data[0].committee_name } });
    response.cookies.set(COMMITTEE_SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 12 * 60 * 60,
    });
    return response;
  } catch (error) {
    return apiError(error, 401);
  }
}

