import { ContentType } from '@/lib/types'

const CONFIG: Record<ContentType, { label: string; color: string; bg: string; border: string }> = {
  shopping: { label: '🛍 Shopping', color: '#fb923c', bg: 'rgba(251,146,60,0.1)', border: 'rgba(251,146,60,0.2)' },
  news:     { label: '📰 News',     color: '#60a5fa', bg: 'rgba(96,165,250,0.1)',  border: 'rgba(96,165,250,0.2)' },
  video:    { label: '🎬 Video',    color: '#f87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.2)' },
  article:  { label: '📖 Article',  color: '#34d399', bg: 'rgba(52,211,153,0.1)',  border: 'rgba(52,211,153,0.2)' },
}

export default function TypeBadge({ type, size = 'sm' }: { type: ContentType; size?: 'sm' | 'md' }) {
  const c = CONFIG[type]
  return (
    <span
      style={{
        background: c.bg,
        color: c.color,
        border: `1px solid ${c.border}`,
        fontSize: size === 'sm' ? '9px' : '11px',
        fontWeight: 700,
        padding: size === 'sm' ? '2px 8px' : '4px 12px',
        borderRadius: '99px',
        letterSpacing: '0.3px',
        whiteSpace: 'nowrap' as const,
      }}
    >
      {c.label}
    </span>
  )
}
