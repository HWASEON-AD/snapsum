import { createClient } from '@supabase/supabase-js'

// 키가 비어 있어도 빌드/모듈 로드가 실패하지 않도록 placeholder fallback 사용
// (실제 요청 시점에 키가 없으면 Supabase 호출이 런타임 에러로 반환됨)
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-role-key'
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

export const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

export const supabasePublic = createClient(SUPABASE_URL, ANON_KEY)
