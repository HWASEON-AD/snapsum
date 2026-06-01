'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Item } from '@/lib/types'
import AppIcon from '@/components/AppIcon'
import TypeBadge from '@/components/TypeBadge'
import DetailShop from '@/components/DetailShop'
import DetailNews from '@/components/DetailNews'
import DetailVideo from '@/components/DetailVideo'
import DetailArticle from '@/components/DetailArticle'
import { ShoppingAnalysis, NewsAnalysis, VideoAnalysis, ArticleAnalysis } from '@/lib/types'

export default function DetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [item, setItem] = useState<Item | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/items/${id}`)
      .then(r => r.json())
      .then(j => { if (j.success) setItem(j.data) })
      .finally(() => setLoading(false))
  }, [id])

  // 아이템 삭제 처리
  async function handleDelete() {
    if (!confirm('Delete this item?')) return
    setDeleting(true)
    const res = await fetch(`/api/items/${id}`, {
      method: 'DELETE',
      headers: { 'x-api-key': 'snapsum-prod-key-2026' },
    })
    const j = await res.json()
    if (j.success) {
      router.push('/')
    } else {
      setToast('Delete failed, try again')
      setDeleting(false)
      setTimeout(() => setToast(null), 3000)
    }
  }

  if (loading) return (
    <main style={{ maxWidth: 430, margin: '0 auto', padding: '60px 18px', fontFamily: 'Inter, system-ui, sans-serif', color: '#555' }}>
      Loading...
    </main>
  )

  if (!item) return (
    <main style={{ maxWidth: 430, margin: '0 auto', padding: '60px 18px', fontFamily: 'Inter, system-ui, sans-serif', textAlign: 'center' }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>🔍</div>
      <div style={{ fontSize: 14, color: '#c8c8e0', marginBottom: 20 }}>Item not found</div>
      <button onClick={() => router.push('/')} style={{ background: '#7b6ef6', color: '#fff', border: 'none', borderRadius: 12, padding: '10px 20px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
        ← Back to Feed
      </button>
    </main>
  )

  return (
    <main style={{ maxWidth: 430, margin: '0 auto', padding: '0 18px 80px', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* toast */}
      {toast && (
        <div style={{ position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', background: '#f87171', color: '#fff', padding: '8px 16px', borderRadius: 12, fontSize: 12, fontWeight: 600, zIndex: 100 }}>
          {toast}
        </div>
      )}

      {/* 헤더 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 16, paddingBottom: 14, borderBottom: '1px solid #0f0f1c', position: 'sticky', top: 0, background: '#07070f', zIndex: 10 }}>
        <button onClick={() => router.back()} style={{ width: 28, height: 28, background: '#111120', borderRadius: 8, border: '1px solid #1a1a2a', fontSize: 14, cursor: 'pointer', color: '#555', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          ←
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <AppIcon app={item.source_app} size={24} />
          <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{item.source_app}</span>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 9, fontWeight: 600, background: 'rgba(123,110,246,0.12)', color: '#9d8ff8', padding: '3px 9px', borderRadius: 99, border: '1px solid rgba(123,110,246,0.2)', letterSpacing: '.3px' }}>
            AUTO DETECTED
          </span>
          <button onClick={handleDelete} disabled={deleting} style={{ width: 28, height: 28, background: '#111120', borderRadius: 8, border: '1px solid #1a1a2a', fontSize: 13, cursor: 'pointer', color: '#555' }}>
            🗑
          </button>
        </div>
      </div>

      {/* 바디 */}
      <div style={{ paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <TypeBadge type={item.content_type} size="md" />

        <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', lineHeight: 1.45 }}>{item.title}</div>

        {item.url && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#0d0d1a', borderRadius: 11, padding: '9px 12px', border: '1px solid #141422' }}>
            <span>🔗</span>
            <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 10, color: '#4a6aaa', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textDecoration: 'none' }}>
              {item.url}
            </a>
            <button onClick={() => { navigator.clipboard.writeText(item.url!); setToast('Copied!'); setTimeout(() => setToast(null), 2000); }}
              style={{ fontSize: 9, fontWeight: 600, color: '#2c2c44', padding: '2px 8px', border: '1px solid #1c1c2c', borderRadius: 7, background: 'transparent', cursor: 'pointer' }}>
              Copy
            </button>
          </div>
        )}

        {/* 타입별 상세 */}
        {item.content_type === 'shopping' && <DetailShop analysis={item.analysis as ShoppingAnalysis} />}
        {item.content_type === 'news'     && <DetailNews analysis={item.analysis as NewsAnalysis} />}
        {item.content_type === 'video'    && <DetailVideo analysis={item.analysis as VideoAnalysis} />}
        {item.content_type === 'article'  && <DetailArticle analysis={item.analysis as ArticleAnalysis} />}

        {/* 태그 */}
        {item.tags.length > 0 && (
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {item.tags.map(t => (
              <span key={t} style={{ fontSize: 9, fontWeight: 500, padding: '3px 9px', background: '#0d0d1a', borderRadius: 99, color: '#2e2e48', border: '1px solid #141422' }}>
                {t}
              </span>
            ))}
          </div>
        )}

        {/* 저장 시간 */}
        <div style={{ fontSize: 10, color: '#1e1e30', paddingTop: 4 }}>
          Saved {new Date(item.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </main>
  )
}
