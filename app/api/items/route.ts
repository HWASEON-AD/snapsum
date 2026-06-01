import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// 모바일(iOS/Android) 키 인증 — 웹 브라우저는 키 없이 허용 (MVP)
function isMobileAuth(req: NextRequest) {
  const key = req.headers.get('x-api-key')
  return !key || key === process.env.SNAPSUM_API_KEY
}

export async function GET(req: NextRequest) {
  if (!isMobileAuth(req)) {
    return NextResponse.json({ success: false, error: 'unauthorized' }, { status: 401 })
  }

  const { searchParams } = req.nextUrl
  const user_id = searchParams.get('user_id') ?? 'default'
  const type = searchParams.get('type') ?? 'all'
  const page = Math.max(1, Number(searchParams.get('page') ?? '1'))
  const limit = Math.min(50, Math.max(1, Number(searchParams.get('limit') ?? '20')))
  const offset = (page - 1) * limit

  let query = supabaseAdmin
    .from('items')
    .select('id,source_app,content_type,title,url,thumbnail_url,tags,summary_line,analysis,created_at', { count: 'exact' })
    .eq('user_id', user_id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (type !== 'all') query = query.eq('content_type', type)

  const { data, count, error } = await query

  if (error) {
    return NextResponse.json({ success: false, error: 'db_error' }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    data: data ?? [],
    pagination: {
      page,
      limit,
      total: count ?? 0,
      has_next: offset + limit < (count ?? 0),
    },
  })
}
