'use client'
import { useEffect, useState, useCallback } from 'react'
import { Item, ContentType } from '@/lib/types'
import FeedCard from '@/components/FeedCard'
import FilterChips from '@/components/FilterChips'
import UploadZone from '@/components/UploadZone'
import TabBar from '@/components/TabBar'
import { useRouter } from 'next/navigation'

type Filter = ContentType | 'all'

export default function FeedPage() {
  const router = useRouter()
  const [items, setItems] = useState<Item[]>([])
  const [filter, setFilter] = useState<Filter>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 피드 목록 로드 (타입 필터 적용)
  const load = useCallback(async (type: Filter) => {
    setLoading(true)
    setError(null)
    try {
      const url = `/api/items?user_id=default&type=${type}`
      const res = await fetch(url, { headers: { 'x-api-key': process.env.NEXT_PUBLIC_SNAPSUM_API_KEY ?? '' } })
      const json = await res.json()
      if (!json.success) throw new Error('Failed to load')
      setItems(json.data)
    } catch {
      setError('Failed to load. Tap to retry.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load(filter) }, [filter, load])

  return (
    <main style={{ maxWidth: 430, margin: '0 auto', padding: '0 14px', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* 헤더 */}
      <div style={{ position: 'sticky', top: 0, background: '#07070f', zIndex: 10, paddingTop: 14, paddingBottom: 4, borderBottom: '1px solid #0f0f1c' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: -1, background: 'linear-gradient(135deg,#fff 30%,#7b6ef6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            SnapSum
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => load(filter)} style={{ width: 30, height: 30, background: '#111120', borderRadius: 9, border: '1px solid #1a1a2a', fontSize: 13, cursor: 'pointer', color: '#888' }}>↺</button>
          </div>
        </div>
        <FilterChips active={filter} onChange={f => { setFilter(f); }} />
      </div>

      {/* 업로드 영역 */}
      <div style={{ paddingTop: 12 }}>
        <UploadZone onAnalyzed={() => load(filter)} />
      </div>

      {/* 피드 */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ background: '#0d0d1a', borderRadius: 16, height: 110, border: '1px solid #141422', opacity: 0.5 }} />
          ))}
        </div>
      )}

      {!loading && error && (
        <div onClick={() => load(filter)} style={{ textAlign: 'center', padding: '40px 20px', color: '#f87171', fontSize: 13, cursor: 'pointer' }}>
          {error}
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>📸</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#c8c8e0', marginBottom: 6 }}>No screenshots yet</div>
          <div style={{ fontSize: 12, color: '#2e2e44' }}>Upload a screenshot above or set up iOS Shortcut</div>
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingBottom: 80 }}>
          {items.map(item => (
            <FeedCard key={item.id} item={item} onClick={id => router.push(`/item/${id}`)} />
          ))}
        </div>
      )}

      <TabBar />
    </main>
  )
}
