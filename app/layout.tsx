import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SnapSum — AI Screenshot Analyzer',
  description: 'Screenshot anything. AI summarizes it instantly.',
  manifest: '/manifest.json',
}

// Next.js 16: themeColor는 metadata가 아닌 viewport export로 분리해야 함
export const viewport: Viewport = {
  themeColor: '#07070f',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className} style={{ background: '#07070f', color: '#fff', margin: 0, minHeight: '100vh' }}>
        {children}
      </body>
    </html>
  )
}
