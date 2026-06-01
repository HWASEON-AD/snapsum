'use client'
import { Item } from '@/lib/types'
import TypeBadge from './TypeBadge'
import AppIcon from './AppIcon'

// 저장 시각을 상대 시간 문자열로 변환
function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

// 카드 하단에 노출할 핵심 2줄 추출 (타입별 분기)
function getBullets(item: Item): string[] {
  const a = item.analysis as unknown as Record<string, unknown>
  if (item.content_type === 'shopping') {
    const price = a.price ? `${a.retailer ?? ''} · ${a.price}` : (a.retailer as string ?? '')
    const feat = Array.isArray(a.highlights) ? (a.highlights as string[])[0] : ''
    return [price, feat].filter(Boolean)
  }
  if (item.content_type === 'video') {
    const stats = [a.duration, a.views ? `${a.views} views` : ''].filter(Boolean).join(' · ')
    const h = Array.isArray(a.highlights) ? (a.highlights as string[])[0] : ''
    return [stats, h].filter(Boolean)
  }
  if (item.content_type === 'news' || item.content_type === 'article') {
    const pts = Array.isArray(a.key_points) ? a.key_points as string[] : []
    return pts.slice(0, 2)
  }
  return []
}

export default function FeedCard({ item, onClick }: { item: Item; onClick: (id: string) => void }) {
  const bullets = getBullets(item)
  return (
    <div
      onClick={() => onClick(item.id)}
      className="feed-card"
      style={{
        background: '#0d0d1a',
        borderRadius: 16,
        border: '1px solid #141422',
        padding: '12px 13px',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      {/* 상단 행: 앱아이콘 + 소스명 + 배지 + 시간 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <AppIcon app={item.source_app} size={26} />
        <span style={{ fontSize: 10, fontWeight: 600, color: '#6a6a88', letterSpacing: '.3px' }}>
          {item.source_app.toUpperCase()}
        </span>
        <TypeBadge type={item.content_type} />
        <span style={{ fontSize: 9, color: '#44445a', marginLeft: 'auto' }}>
          {timeAgo(item.created_at)}
        </span>
      </div>

      {/* 제목 */}
      <div style={{ fontSize: 12, fontWeight: 600, color: '#c8c8e0', lineHeight: 1.45,
        overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
        {item.title}
      </div>

      {/* 핵심 2줄 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {bullets.map((b, i) => (
          <div key={i} style={{ display: 'flex', gap: 6, fontSize: 10, color: '#8888a8', lineHeight: 1.6 }}>
            <span style={{ flexShrink: 0 }}>{i === 0 ? '📍' : '✦'}</span>
            <span>{b}</span>
          </div>
        ))}
      </div>

      {/* URL */}
      {item.url && (
        <div style={{ fontSize: 9, color: '#5a7aaa', borderTop: '1px solid #0f0f1c',
          paddingTop: 8, marginTop: 2, display: 'flex', gap: 4, alignItems: 'center' }}>
          🔗 {item.url.replace(/^https?:\/\//, '')}
        </div>
      )}
    </div>
  )
}
