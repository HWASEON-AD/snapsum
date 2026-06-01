import { NextRequest, NextResponse } from 'next/server'
import { analyzeScreenshot } from '@/lib/claude'
import { supabaseAdmin } from '@/lib/supabase'

// API 키 인증 검사
function authOk(req: NextRequest) {
  const key = req.headers.get('x-api-key')
  return key === process.env.SNAPSUM_API_KEY
}

export async function POST(req: NextRequest) {
  if (!authOk(req)) {
    return NextResponse.json({ success: false, error: 'unauthorized' }, { status: 401 })
  }

  let body: { image?: string; image_type?: string; app_hint?: string; user_id?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ success: false, error: 'invalid_json' }, { status: 400 })
  }

  const { image, image_type, app_hint, user_id = 'default' } = body

  if (!image || !image_type) {
    return NextResponse.json({ success: false, error: 'invalid_image' }, { status: 400 })
  }

  // 이미지 크기 체크 (10MB base64 ≈ 13.3MB raw)
  if (image.length > 13_000_000) {
    return NextResponse.json({ success: false, error: 'image_too_large' }, { status: 413 })
  }

  let result
  try {
    result = await analyzeScreenshot(image, image_type, app_hint)
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'UNKNOWN'
    if (msg === 'UNRECOGNIZED') {
      return NextResponse.json(
        { success: false, error: 'unrecognized', message: 'Could not analyze screenshot content' },
        { status: 422 }
      )
    }
    return NextResponse.json(
      { success: false, error: 'analysis_failed', message: 'AI analysis temporarily unavailable' },
      { status: 500 }
    )
  }

  // Supabase 자동 저장
  const { data: saved, error: dbErr } = await supabaseAdmin
    .from('items')
    .insert({
      user_id,
      source_app: result.source_app,
      content_type: result.content_type,
      title: result.title,
      url: result.url,
      analysis: result.analysis,
      tags: result.tags,
      summary_line: result.summary_line,
    })
    .select('id')
    .single()

  if (dbErr) {
    return NextResponse.json(
      { success: false, error: 'save_failed', message: 'Analysis succeeded but save failed', data: result },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true, data: result, item_id: saved.id, saved: true })
}
