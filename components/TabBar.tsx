'use client'
import { useRouter, usePathname } from 'next/navigation'

const TABS = [
  { key: 'feed',        icon: '⊟', label: 'Feed',        href: '/' },
  { key: 'search',      icon: '⌕', label: 'Search',      href: '/search' },
  { key: 'collections', icon: '⊞', label: 'Collections', href: '/collections' },
  { key: 'profile',     icon: '◯', label: 'Profile',     href: '/profile' },
]

export default function TabBar() {
  const router = useRouter()
  const pathname = usePathname()

  function activeKey() {
    if (pathname === '/') return 'feed'
    if (pathname.startsWith('/search')) return 'search'
    if (pathname.startsWith('/collections')) return 'collections'
    if (pathname.startsWith('/profile')) return 'profile'
    return 'feed'
  }

  const current = activeKey()

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      height: 64,
      background: 'rgba(7,7,15,0.97)',
      backdropFilter: 'blur(24px)',
      borderTop: '1px solid #0f0f1c',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      paddingBottom: 6,
      zIndex: 50,
      maxWidth: 430,
      margin: '0 auto',
    }}>
      {TABS.map(tab => {
        const active = current === tab.key
        return (
          <button
            key={tab.key}
            onClick={() => router.push(tab.href)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              background: 'none', border: 'none', cursor: 'pointer',
              opacity: active ? 1 : 0.28,
              transition: 'opacity .2s',
              padding: '4px 12px',
            }}
          >
            <span style={{ fontSize: 19 }}>{tab.icon}</span>
            <span style={{ fontSize: 8, fontWeight: 600, color: active ? '#7b6ef6' : '#555', letterSpacing: '.3px' }}>
              {tab.label.toUpperCase()}
            </span>
          </button>
        )
      })}
    </div>
  )
}
