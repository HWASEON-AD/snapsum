'use client'
import { useRef, useState, DragEvent, ChangeEvent } from 'react'

interface Props {
  onAnalyzed: () => void
}

export default function UploadZone({ onAnalyzed }: Props) {
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // 파일을 Base64로 변환 후 /api/analyze 호출
  async function processFile(file: File) {
    if (!file.type.startsWith('image/')) {
      setError('Only image files are supported')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const reader = new FileReader()
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string
          resolve(result.split(',')[1])
        }
        reader.onerror = reject
        reader.readAsDataURL(file)
      })

      // /api/upload — 웹 전용, API 키 노출 없음
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: base64,
          image_type: file.type,
          user_id: 'default',
        }),
      })

      const json = await res.json()
      if (!json.success) throw new Error(json.error ?? 'Analysis failed')
      onAnalyzed()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Upload failed')
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

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      onClick={() => !loading && inputRef.current?.click()}
      style={{
        border: `1.5px dashed ${dragging ? '#7b6ef6' : '#1c1c28'}`,
        borderRadius: 14,
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        cursor: loading ? 'default' : 'pointer',
        background: dragging ? 'rgba(123,110,246,0.06)' : '#0d0d1a',
        transition: 'all .2s',
        marginBottom: 12,
      }}
    >
      <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onFileChange} />
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: 'rgba(123,110,246,0.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 18, flexShrink: 0,
      }}>
        {loading ? '⏳' : '📎'}
      </div>
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#c8c8e0' }}>
          {loading ? 'Analyzing screenshot...' : 'Upload a screenshot'}
        </div>
        <div style={{ fontSize: 10, color: '#2e2e44', marginTop: 2 }}>
          {error
            ? <span style={{ color: '#f87171' }}>{error}</span>
            : 'Drag & drop or tap to select · PNG, JPG, WEBP'}
        </div>
      </div>
      {loading && (
        <div style={{ marginLeft: 'auto', fontSize: 10, color: '#7b6ef6' }}>
          ✦ AI analyzing
        </div>
      )}
    </div>
  )
}
