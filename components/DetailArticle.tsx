import { ArticleAnalysis } from '@/lib/types'

export default function DetailArticle({ analysis }: { analysis: ArticleAnalysis }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ fontSize: 9, color: '#2a2a40', textTransform: 'uppercase', letterSpacing: '.5px', fontWeight: 600, marginBottom: 2 }}>Key Points</div>
      {analysis.key_points.map((pt, i) => (
        <div key={i} style={{ display: 'flex', gap: 9, background: '#0d0d1a', borderRadius: 11, padding: '9px 11px', border: '1px solid #141422' }}>
          <div style={{ width: 18, height: 18, borderRadius: 5, background: 'rgba(52,211,153,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800, color: '#34d399', flexShrink: 0 }}>
            {i + 1}
          </div>
          <div style={{ fontSize: 11, color: '#8888a8', lineHeight: 1.6 }}>{pt.replace(/^\d+\.\s*/, '')}</div>
        </div>
      ))}
    </div>
  )
}
