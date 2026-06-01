import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export async function GET(req: NextRequest) {
  const key = (process.env.ANTHROPIC_API_KEY ?? '').trim()
  const keyPreview = key ? key.substring(0, 15) + '...' + key.slice(-4) : 'MISSING'
  const keyLen = key.length

  let claudeResult = 'not_tested'
  let claudeError = ''

  try {
    const client = new Anthropic({ apiKey: key })
    const res = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 10,
      messages: [{ role: 'user', content: 'Say "ok"' }],
    })
    claudeResult = res.content[0].type === 'text' ? res.content[0].text : 'no_text'
  } catch (e) {
    claudeError = e instanceof Error ? e.message : String(e)
    claudeResult = 'error'
  }

  return NextResponse.json({
    keyPreview,
    keyLen,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'MISSING',
    claudeResult,
    claudeError,
    timestamp: new Date().toISOString(),
  })
}
