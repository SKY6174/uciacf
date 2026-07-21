import { createClient } from '@supabase/supabase-js';

// process.env를 통해 Next.js가 설정된 .env.local 파일의 환경 변수를 읽어옵니다.
// NEXT_PUBLIC_ 접두사가 붙은 환경 변수는 브라우저(클라이언트) 환경에서도 안전하게 접근할 수 있습니다.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 프로젝트 연동에 필요한 URL이나 Anon Key가 누락되었을 경우,
// 개발 단계에서 원인을 즉시 파악할 수 있도록 에러를 발생시켜 경고합니다.
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabase URL 또는 Anon Key가 환경 변수(.env.local) 파일에 올바르게 설정되지 않았습니다. ' +
    '파일에 NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_ANON_KEY가 존재하는지 확인해주세요.'
  );
}

/**
 * 프로젝트 전역에서 사용할 Supabase 클라이언트 인스턴스입니다.
 * 
 * - supabaseUrl: 우리 Supabase 프로젝트의 고유 API 주소
 * - supabaseAnonKey: 외부(브라우저)에 노출해도 안전한 기본 공개 인증 키 (익명 키)
 * 
 * 이 인스턴스를 통해 데이터베이스 조회(select), 삽입(insert), 수정(update), 삭제(delete) 등의
 * 다양한 API 요청을 보낼 수 있습니다.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
