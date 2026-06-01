import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// 모바일 키 인증 — GET은 웹에서도 허용, DELETE는 키 필요
function authOk(req: NextRequest) {
  const key = req.headers.get('x-api-key')
  return !key || key === process.env.SNAPSUM_API_KEY
}
function strictAuth(req: NextRequest) {
  const key = req.headers.get('x-api-key')
  return key === process.env.SNAPSUM_API_KEY
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!authOk(req)) return NextResponse.json({ success: false, error: 'unauthorized' }, { status: 401 })
  const { id } = await params
  const { data, error } = await supabaseAdmin.from('items').select('*').eq('id', id).single()
  if (error || !data) return NextResponse.json({ success: false, error: 'not_found' }, { status: 404 })
  return NextResponse.json({ success: true, data })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!strictAuth(req)) return NextResponse.json({ success: false, error: 'unauthorized' }, { status: 401 })
  const { id } = await params
  const { error } = await supabaseAdmin.from('items').delete().eq('id', id)
  if (error) return NextResponse.json({ success: false, error: 'delete_failed' }, { status: 500 })
  return NextResponse.json({ success: true, message: 'Item deleted' })
}
