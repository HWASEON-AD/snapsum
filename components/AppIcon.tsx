const APP_COLORS: Record<string, string> = {
  YouTube:   'linear-gradient(135deg,#ff0000,#cc0000)',
  Instagram: 'linear-gradient(135deg,#f09433,#dc2743,#bc1888)',
  Amazon:    'linear-gradient(135deg,#ff9900,#e07000)',
  TikTok:    'linear-gradient(135deg,#010101,#69c9d0)',
  X:         'linear-gradient(135deg,#1d9bf0,#0a6fa8)',
  Twitter:   'linear-gradient(135deg,#1d9bf0,#0a6fa8)',
  Reddit:    'linear-gradient(135deg,#ff4500,#cc3300)',
  default:   'linear-gradient(135deg,#7b6ef6,#5a4fd4)',
}

const APP_ICONS: Record<string, string> = {
  YouTube: '▶', Instagram: '📸', Amazon: '📦',
  TikTok: '♪', X: '𝕏', Twitter: '𝕏', Reddit: '🔴',
  default: '◉',
}

export default function AppIcon({ app, size = 28 }: { app: string; size?: number }) {
  const bg = APP_COLORS[app] ?? APP_COLORS.default
  const icon = APP_ICONS[app] ?? APP_ICONS.default
  return (
    <div
      style={{
        width: size, height: size,
        background: bg,
        borderRadius: Math.round(size * 0.28),
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: Math.round(size * 0.46),
        flexShrink: 0,
      }}
    >
      {icon}
    </div>
  )
}
