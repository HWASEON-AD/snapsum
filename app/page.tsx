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

  const load = useCallback(async (type: Filter) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/items?user_id=default&type=${type}`)
      const json = await res.json()
      if (!json.success) throw new Error('Failed to load')
      setItems(json.data)
    } catch {
      setError('Failed to load. Click to retry.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load(filter) }, [filter, load])

  return (
    <div style={{ minHeight: '100vh', background: '#07070f', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* PC: 사이드바 + 메인 레이아웃 */}
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', minHeight: '100vh' }}>

        {/* ── 사이드바 (PC만) ── */}
        <aside style={{
          width: 240, flexShrink: 0,
          padding: '32px 24px',
          borderRight: '1px solid #0f0f1c',
          position: 'sticky', top: 0, height: '100vh', overflowY: 'auto',
          display: 'flex', flexDirection: 'column', gap: 32,
        }}
          className="sidebar"
        >
          <div>
            <span style={{
              fontSize: 22, fontWeight: 800, letterSpacing: -1,
              background: 'linear-gradient(135deg,#fff 30%,#7b6ef6)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              display: 'block', marginBottom: 4,
            }}>SnapSum</span>
            <div style={{ fontSize: 11, color: '#333' }}>AI Screenshot Analyzer</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {[
              { icon: '⊟', label: 'Feed', key: 'feed' },
              { icon: '🔍', label: 'Search', key: 'search' },
              { icon: '⊞', label: 'Collections', key: 'collections' },
              { icon: '⚙️', label: 'Settings', key: 'settings' },
            ].map(item => (
              <div key={item.key} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px', borderRadius: 10, cursor: 'pointer',
                background: item.key === 'feed' ? '#111120' : 'transparent',
                color: item.key === 'feed' ? '#fff' : '#333',
                fontSize: 13, fontWeight: item.key === 'feed' ? 600 : 400,
                transition: 'all .15s',
              }}>
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                {item.label}
              </div>
            ))}
          </div>

          {/* iOS 안내 */}
          <div style={{
            background: '#0d0d1a', borderRadius: 12, padding: '12px 14px',
            border: '1px solid #141422', marginTop: 'auto',
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#7b6ef6', marginBottom: 6 }}>📱 iOS Auto-capture</div>
            <div style={{ fontSize: 10, color: '#444', lineHeight: 1.6 }}>
              Set up Shortcuts on iPhone to auto-analyze every screenshot.
            </div>
            <div style={{
              marginTop: 8, fontSize: 10, fontWeight: 600, color: '#7b6ef6',
              cursor: 'pointer',
            }}>
              Setup guide →
            </div>
          </div>
        </aside>

        {/* ── 메인 콘텐츠 ── */}
        <main style={{ flex: 1, padding: '0 0 80px', maxWidth: 680 }}>
          {/* 헤더 */}
          <div style={{
            position: 'sticky', top: 0, background: '#07070f', zIndex: 10,
            padding: '20px 24px 8px', borderBottom: '1px solid #0f0f1c',
          }}>
            {/* 모바일에서만 보이는 로고 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}
              className="mobile-header"
            >
              <span style={{
                fontSize: 18, fontWeight: 800, letterSpacing: -1,
                background: 'linear-gradient(135deg,#fff 30%,#7b6ef6)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>SnapSum</span>
              <button onClick={() => load(filter)} style={{
                width: 30, height: 30, background: '#111120', borderRadius: 9,
                border: '1px solid #1a1a2a', fontSize: 13, cursor: 'pointer', color: '#888',
              }}>↺</button>
            </div>
            <FilterChips active={filter} onChange={f => setFilter(f)} />
          </div>

          <div style={{ padding: '16px 24px 0' }}>
            <UploadZone onAnalyzed={() => load(filter)} />
          </div>

          <div style={{ padding: '0 24px' }}>
            {loading && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[1, 2, 3].map(i => (
                  <div key={i} style={{ background: '#0d0d1a', borderRadius: 16, height: 110, border: '1px solid #141422', opacity: 0.4 }} />
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
                <div style={{ fontSize: 40, marginBottom: 12 }}>📸</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#c8c8e0', marginBottom: 6 }}>No screenshots yet</div>
                <div style={{ fontSize: 12, color: '#333' }}>
                  Drag & drop a screenshot above, or set up iOS Shortcut for auto-capture
                </div>
              </div>
            )}

            {!loading && !error && items.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {items.map(item => (
                  <FeedCard key={item.id} item={item} onClick={id => router.push(`/item/${id}`)} />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* 모바일 탭바 */}
      <TabBar />

      <style>{`
        @media (max-width: 768px) {
          .sidebar { display: none !important; }
        }
        @media (min-width: 769px) {
          .mobile-header { display: none !important; }
        }
      `}</style>
    </div>
  )
}
