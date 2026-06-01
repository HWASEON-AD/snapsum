import { NextRequest, NextResponse } from 'next/server'
import { analyzeScreenshot } from '@/lib/claude'
import { supabaseAdmin } from '@/lib/supabase'

export const maxDuration = 60 // Claude Vision 분석 시간 확보

// 웹 업로드 전용 엔드포인트 — x-api-key 불필요 (PWA 웹 클라이언트용)
// 모바일(iOS Shortcut/Android)은 /api/analyze + x-api-key 사용
export async function POST(req: NextRequest) {
  let body: { image?: string; image_type?: string; user_id?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ success: false, error: 'invalid_json' }, { status: 400 })
  }

  const { image, image_type, user_id = 'default' } = body

  if (!image || !image_type) {
    return NextResponse.json({ success: false, error: 'invalid_image' }, { status: 400 })
  }

  if (image.length > 13_000_000) {
    return NextResponse.json({ success: false, error: 'image_too_large' }, { status: 413 })
  }

  let result
  try {
    result = await analyzeScreenshot(image, image_type)
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

  return NextResponse.json({ success: true, data: result, item_id: saved.id })
}
