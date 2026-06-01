import { ShoppingAnalysis } from '@/lib/types'

export default function DetailShop({ analysis }: { analysis: ShoppingAnalysis }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {[
          { label: 'Store', value: analysis.retailer },
          { label: 'Price', value: analysis.price, highlight: true },
          { label: 'Category', value: analysis.category },
        ].map(b => (
          <div key={b.label} style={{ background: '#0d0d1a', borderRadius: 12, padding: '10px 12px', border: '1px solid #141422' }}>
            <div style={{ fontSize: 9, color: '#2a2a40', textTransform: 'uppercase', letterSpacing: '.3px', marginBottom: 3 }}>{b.label}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: b.highlight ? '#fb923c' : '#e0e0f0' }}>{b.value}</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 9, color: '#2a2a40', textTransform: 'uppercase', letterSpacing: '.5px', fontWeight: 600 }}>Key Features</div>
      {analysis.highlights.map((h, i) => (
        <div key={i} style={{ display: 'flex', gap: 8, background: '#0d0d1a', borderRadius: 11, padding: '9px 11px', border: '1px solid #141422' }}>
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#fb923c', flexShrink: 0, marginTop: 5 }} />
          <div style={{ fontSize: 11, color: '#8888a8', lineHeight: 1.6 }}>{h}</div>
        </div>
      ))}
    </div>
  )
}
