import Anthropic from '@anthropic-ai/sdk'
import { AnalysisResult } from './types'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

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

export async function analyzeScreenshot(
  imageBase64: string,
  imageType: string,
  appHint?: string
): Promise<AnalysisResult> {
  const userContent: Anthropic.MessageParam['content'] = [
    {
      type: 'image',
      source: {
        type: 'base64',
        media_type: imageType as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif',
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
      ],
      messages: [{ role: 'user', content: userContent }],
    })
  } catch {
    throw new Error('CLAUDE_API_ERROR')
  }

  const raw = response.content[0].type === 'text' ? response.content[0].text : ''

  let parsed: Record<string, unknown>
  try {
    parsed = JSON.parse(raw)
  } catch {
    // 재시도 1회 — Claude가 비정형 응답을 반환한 경우 JSON만 다시 요청
    try {
      const retry = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system: [
          {
            type: 'text',
            text: SYSTEM_PROMPT,
            cache_control: { type: 'ephemeral' },
          },
        ],
        messages: [
          { role: 'user', content: userContent },
          { role: 'assistant', content: raw },
          { role: 'user', content: 'Return only valid JSON, no other text.' },
        ],
      })
      const retryRaw = retry.content[0].type === 'text' ? retry.content[0].text : ''
      parsed = JSON.parse(retryRaw)
    } catch {
      throw new Error('PARSE_ERROR')
    }
  }

  if (parsed.error) throw new Error('UNRECOGNIZED')

  return parsed as unknown as AnalysisResult
}
