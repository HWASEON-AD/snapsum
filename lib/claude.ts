import Anthropic from '@anthropic-ai/sdk'
import { AnalysisResult } from './types'

const SYSTEM_PROMPT = `You are SnapSum AI, a screenshot analysis assistant.

Analyze the provided screenshot and return a structured JSON response.

RULES:
1. Detect the source app (YouTube, Instagram, Amazon, X, Reddit, TikTok, etc.)
2. Classify content type: shopping, news, video, or article
3. Extract visible URL if present (look carefully at address bars, links)
4. Generate a concise title (max 80 chars)
5. Generate 3-5 relevant tags (lowercase, no spaces)
6. Fill type-specific fields based on visible content only

OUTPUT — always return valid JSON only, no markdown fences:
{
  "source_app": "YouTube",
  "content_type": "video",
  "title": "...",
  "url": "https://..." or null,
  "tags": ["tag1", "tag2"],
  "summary_line": "One-line summary max 100 chars for feed display",
  "analysis": {
    // IF shopping: { "retailer": "Amazon", "price": "$29.99", "category": "Electronics", "highlights": ["feat1","feat2","feat3"] }
    // IF news:     { "key_points": ["1. point","2. point","3. point","4. point"] }
    // IF video:    { "duration": "10:24", "views": "234K", "likes": "12K", "highlights": ["h1","h2","h3"] }
    // IF article:  { "key_points": ["1. point","2. point","3. point","4. point","5. point"] }
  }
}

If content is unrecognizable return: {"error":"unrecognized","message":"Could not analyze screenshot content"}`

function getClient() {
  const key = (process.env.ANTHROPIC_API_KEY ?? '').trim()
  return new Anthropic({ apiKey: key })
}

export async function analyzeScreenshot(
  imageBase64: string,
  imageType: string,
  appHint?: string
): Promise<AnalysisResult> {
  const client = getClient()

  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  const safeType = validTypes.includes(imageType)
    ? (imageType as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif')
    : 'image/png'

  const userContent: Anthropic.MessageParam['content'] = [
    {
      type: 'image',
      source: {
        type: 'base64',
        media_type: safeType,
        data: imageBase64,
      },
    },
    {
      type: 'text',
      text: appHint
        ? `Analyze this screenshot. The user was in: ${appHint}`
        : 'Analyze this screenshot.',
    },
  ]

  let response
  try {
    response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: [
        {
          type: 'text',
          text: SYSTEM_PROMPT,
          cache_control: { type: 'ephemeral' },
        },
      ] as Anthropic.TextBlockParam[],
      messages: [{ role: 'user', content: userContent }],
    })
  } catch (e) {
    console.error('[SnapSum] Claude API error:', e instanceof Error ? e.message : String(e))
    throw new Error('CLAUDE_API_ERROR')
  }

  const raw = response.content[0].type === 'text' ? response.content[0].text : ''

  let parsed: Record<string, unknown>
  try {
    // JSON 코드펜스 제거 후 파싱
    const cleaned = raw.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim()
    parsed = JSON.parse(cleaned)
  } catch {
    try {
      const client2 = getClient()
      const retry = await client2.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system: [
          {
            type: 'text',
            text: SYSTEM_PROMPT,
            cache_control: { type: 'ephemeral' },
          },
        ] as Anthropic.TextBlockParam[],
        messages: [
          { role: 'user', content: userContent },
          { role: 'assistant', content: raw },
          { role: 'user', content: 'Return only valid JSON, no other text.' },
        ],
      })
      const retryRaw = retry.content[0].type === 'text' ? retry.content[0].text : ''
      const cleaned2 = retryRaw.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim()
      parsed = JSON.parse(cleaned2)
    } catch {
      console.error('[SnapSum] JSON parse failed after retry. raw:', raw.slice(0, 200))
      throw new Error('PARSE_ERROR')
    }
  }

  if (parsed.error) throw new Error('UNRECOGNIZED')

  return parsed as unknown as AnalysisResult
}
