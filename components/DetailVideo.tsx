import { VideoAnalysis } from '@/lib/types'

export default function DetailVideo({ analysis }: { analysis: VideoAnalysis }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', gap: 7 }}>
        {[
          { label: 'Length', value: analysis.duration },
          { label: 'Views', value: analysis.views },
          { label: 'Likes', value: analysis.likes },
        ].map(s => (
          <div key={s.label} style={{ flex: 1, background: '#0d0d1a', borderRadius: 11, padding: 9, textAlign: 'center', border: '1px solid #141422' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{s.value}</div>
            <div style={{ fontSize: 9, color: '#2a2a40', marginTop: 2, textTransform: 'uppercase', letterSpacing: '.3px' }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 9, color: '#2a2a40', textTransform: 'uppercase', letterSpacing: '.5px', fontWeight: 600 }}>Highlights</div>
      {analysis.highlights.map((h, i) => (
        <div key={i} style={{ display: 'flex', gap: 8, background: '#0d0d1a', borderRadius: 11, padding: '9px 11px', border: '1px solid #141422' }}>
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#f87171', flexShrink: 0, marginTop: 5 }} />
          <div style={{ fontSize: 11, color: '#8888a8', lineHeight: 1.6 }}>{h}</div>
        </div>
      ))}
    </div>
  )
}
