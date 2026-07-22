import "server-only";

import { createHash, randomBytes } from "node:crypto";
import type { NextRequest } from "next/server";
import { createSupabaseAdmin, createSupabaseVerifier } from "@/lib/supabase/server";

export const COMMITTEE_SESSION_COOKIE = "uc_committee_session";

export function hashSecret(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function createSessionToken() {
  return randomBytes(32).toString("base64url");
}

export async function requireAdminUser(request: NextRequest) {
  const authorization = request.headers.get("authorization");
  const token = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;
  if (!token) throw new Error("관리자 로그인이 필요합니다.");
  const { data, error } = await createSupabaseVerifier().auth.getUser(token);
  if (error || !data.user) throw new Error("관리자 세션이 유효하지 않습니다.");
  return data.user;
}

export async function requireOwnedCommittee(request: NextRequest, committeeId: string) {
  const user = await requireAdminUser(request);
  const admin = createSupabaseAdmin();
  const { data, error } = await admin
    .from("committees")
    .select("id, code, name, committee_type, meeting_at, status, created_by")
    .eq("id", committeeId)
    .eq("created_by", user.id)
    .single();
  if (error || !data) throw new Error("위원회 관리 권한이 없습니다.");
  return { user, committee: data, admin };
}

export async function requireMemberSession(request: NextRequest) {
  const token = request.cookies.get(COMMITTEE_SESSION_COOKIE)?.value;
  if (!token) throw new Error("위원 로그인이 필요합니다.");
  const admin = createSupabaseAdmin();
  const { data: session, error } = await admin
    .from("committee_member_sessions")
    .select("id, member_id, expires_at, revoked_at")
    .eq("token_hash", hashSecret(token))
    .is("revoked_at", null)
    .gt("expires_at", new Date().toISOString())
    .single();
  if (error || !session) throw new Error("위원 세션이 만료되었거나 유효하지 않습니다.");

  const { data: member } = await admin
    .from("committee_members")
    .select("id, committee_id, member_code, name, role, status")
    .eq("id", session.member_id)
    .eq("status", "active")
    .single();
  if (!member) throw new Error("위원 계정이 비활성화되었습니다.");

  const { data: committee } = await admin
    .from("committees")
    .select("id, code, name, committee_type, description, meeting_at, status, security_notice")
    .eq("id", member.committee_id)
    .eq("status", "open")
    .single();
  if (!committee) throw new Error("현재 심의할 수 없는 위원회입니다.");

  await admin.from("committee_member_sessions").update({ last_seen_at: new Date().toISOString() }).eq("id", session.id);
  return { admin, session, member, committee, token };
}

