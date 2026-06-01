'use client'
import { ContentType } from '@/lib/types'

type Filter = ContentType | 'all'
const CHIPS: { key: Filter; label: string }[] = [
  { key: 'all',      label: 'All' },
  { key: 'shopping', label: '🛍 Shopping' },
  { key: 'news',     label: '📰 News' },
  { key: 'video',    label: '🎬 Video' },
  { key: 'article',  label: '📖 Article' },
]

export default function FilterChips({ active, onChange }: {
  active: Filter
  onChange: (f: Filter) => void
}) {
  return (
    <div style={{ display: 'flex', gap: 6, overflowX: 'auto', padding: '2px 0 10px', scrollbarWidth: 'none' }}>
      {CHIPS.map(c => (
        <button
          key={c.key}
          onClick={() => onChange(c.key)}
          style={{
            fontSize: 10, fontWeight: 500, padding: '5px 13px', borderRadius: 99,
            border: active === c.key ? '1px solid #7b6ef6' : '1px solid #1c1c28',
            background: active === c.key ? '#7b6ef6' : 'transparent',
            color: active === c.key ? '#fff' : '#3a3a50',
            cursor: 'pointer', whiteSpace: 'nowrap', letterSpacing: '.2px',
            transition: 'all .18s',
          }}
        >
          {c.label}
        </button>
      ))}
    </div>
  )
}
