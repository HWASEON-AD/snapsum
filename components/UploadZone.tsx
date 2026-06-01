'use client'
import { useRef, useState, DragEvent, ChangeEvent, useEffect } from 'react'

interface Props {
  onAnalyzed: () => void
}

export default function UploadZone({ onAnalyzed }: Props) {
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [dots, setDots] = useState('.')
  const inputRef = useRef<HTMLInputElement>(null)

  // 로딩 중 점 애니메이션
  useEffect(() => {
    if (!loading) return
    const iv = setInterval(() => setDots(d => d.length >= 3 ? '.' : d + '.'), 500)
    return () => clearInterval(iv)
  }, [loading])

  async function processFile(file: File) {
    if (!file.type.startsWith('image/')) {
      setError('Only image files supported (PNG, JPG, WEBP)')
      return
    }
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const reader = new FileReader()
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve((reader.result as string).split(',')[1])
        reader.onerror = reject
        reader.readAsDataURL(file)
      })

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64, image_type: file.type, user_id: 'default' }),
      })

      const json = await res.json()

      if (json.error === 'unrecognized') {
        setError('Could not recognize content — try a screenshot of a website, product, or article')
        return
      }
      if (!json.success) {
        setError(json.message ?? json.error ?? 'Analysis failed — try again')
        return
      }

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
      onAnalyzed()
    } catch {
      setError('Network error — check connection and try again')
    } finally {
      setLoading(false)
    }
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }

  function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) processFile(file)
    e.target.value = ''
  }

  const borderColor = dragging ? '#7b6ef6' : success ? '#34d399' : error ? '#f87171' : '#1c1c28'
  const bg = dragging ? 'rgba(123,110,246,0.06)' : success ? 'rgba(52,211,153,0.05)' : '#0d0d1a'

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      onClick={() => !loading && inputRef.current?.click()}
      style={{
        border: `1.5px dashed ${borderColor}`,
        borderRadius: 14,
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        cursor: loading ? 'default' : 'pointer',
        background: bg,
        transition: 'all .2s',
        marginBottom: 12,
      }}
    >
      <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onFileChange} />

      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: loading ? 'rgba(123,110,246,0.2)' : success ? 'rgba(52,211,153,0.15)' : 'rgba(123,110,246,0.12)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 18, flexShrink: 0,
        transition: 'all .3s',
      }}>
        {loading ? '⏳' : success ? '✓' : '📎'}
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: success ? '#34d399' : '#c8c8e0' }}>
          {loading ? `AI analyzing${dots}` : success ? 'Saved to feed!' : 'Upload a screenshot'}
        </div>
        <div style={{ fontSize: 10, color: '#444', marginTop: 2 }}>
          {error
            ? <span style={{ color: '#f87171' }}>{error}</span>
            : loading
              ? <span style={{ color: '#7b6ef6' }}>Claude Vision is reading the screenshot</span>
              : 'Drag & drop or tap to select · PNG, JPG, WEBP'}
        </div>
      </div>

      {loading && (
        <div style={{ marginLeft: 'auto', flexShrink: 0 }}>
          <div style={{
            width: 20, height: 20, borderRadius: '50%',
            border: '2px solid rgba(123,110,246,0.2)',
            borderTop: '2px solid #7b6ef6',
            animation: 'spin 1s linear infinite',
          }} />
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
