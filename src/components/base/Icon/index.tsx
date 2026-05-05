// src/components/base/Icon/index.tsx
// SVG paths sourced from Remixicon (https://remixicon.com) — Apache 2.0 license
// Rendered via CSS background-image (data URI) for WeChat miniprogram compatibility

import { View } from '@tarojs/components'
import { CSSProperties } from 'react'

// ─── SVG path registry ──────────────────────────────────────────────────────
const PATHS: Record<string, string> = {
  // ── 品类图标 ──────────────────────────────────────────────────────────────
  'food':       'M11 2v7h-1v4h-1V2H8v13H7V9H6V2H5v7h-1v4h-1V2H2v11c0 1.1.9 2 2 2h2v7h2v-7h2c1.1 0 2-.9 2-2V2h-1zm8.5 0C17.6 2 16 4.9 16 8.5V13h1.5v9H20V2h-.5z',
  'park':       'M17 21v-2h-4v-3.1c3.28-.48 5.8-3.3 5.8-6.73C18.8 4.77 15.93 2 12.4 2c-3.53 0-6.4 2.77-6.4 6.17 0 3.43 2.52 6.25 5.8 6.73V19H7.8v2H17zm-4.6-8.3c-2.43 0-4.4-1.89-4.4-4.53 0-2.64 1.97-4.17 4.4-4.17 2.43 0 4.4 1.53 4.4 4.17 0 2.64-1.97 4.53-4.4 4.53z',
  'game':       'M17 4H7C4.24 4 2 6.24 2 9v6c0 2.76 2.24 5 5 5h10c2.76 0 5-2.24 5-5V9c0-2.76-2.24-5-5-5zM8 13H7v1H6v-1H5v-1h1v-1h1v1h1v1zm6.5 1c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm2-3c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z',
  'culture':    'M2 20h20v2H2v-2zm2-2h16V8.4L12 3 4 8.4V18zm2-2v-6h2v6H6zm4 0v-6h2v6h-2zm4 0v-6h2v6h-2zm4 0v-6h2v6h-2zM12 1l10 6.5V20H2V7.5L12 1z',
  'shopping':   'M6.5 2h11l2.5 4H4L6.5 2zM3 7h18v15H3V7zm6 5v2h2v-2H9zm4 0v2h2v-2h-2z',
  'camera':     'M9.83 5l-2 2H4c-.55 0-1 .45-1 1v12c0 .55.45 1 1 1h16c.55 0 1-.45 1-1V8c0-.55-.45-1-1-1h-3.83l-2-2H9.83zM12 17c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm0-2c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z',
  'nightlife':  'M14 15l-2 2v5h3v2H9v-2h3v-5L10 15 2 3h20l-8 12zm-6.43-2h8.86L20.43 5H3.57l4 8z',
  'outdoor':    'M5.5 1c.83 0 1.5.67 1.5 1.5V4h8.5l1.5 3.25L18.5 9H21v2h-1l.94 5.35A2 2 0 0 1 19 18.5h-.5a2.5 2.5 0 0 1-5 0h-3a2.5 2.5 0 0 1-5 0H5a2 2 0 0 1-1.94-2.65L4 11H3V9h3l.5-1H4V6h4.28L9 4H5V2.5C5 1.67 4.33 1 3.5 1h-2V3H3v1H1V1h4.5zM5.5 14a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm13 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z',
  'family':     'M12 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm6 3a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM6 5a2 2 0 1 1 0 4A2 2 0 0 1 6 5zm14.5 9l-2-4H16l-1.5 3H12l-1.5-3H7l-2 4H3l2.5-5A2 2 0 0 1 7.3 8h9.4a2 2 0 0 1 1.8 1l2.5 5h-1.5zM9 15v7H7v-6l-1 1H4v-2h3l2-2v2zm6 0l2 2h3v2h-2l-1-1v6h-2v-7l-2 2h-1v-2l3-2z',
  'cafe':       'M20 3H4v10c0 2.21 1.79 4 4 4h6c2.21 0 4-1.79 4-4v-3h2c1.11 0 2-.89 2-2V5c0-1.11-.89-2-2-2zm0 5h-2V5h2v3zM4 19h16v2H4z',
  // ── UI 图标 ───────────────────────────────────────────────────────────────
  'search':     'M18.03 16.62l4.28 4.28-1.41 1.41-4.28-4.28A9 9 0 1 1 19.78 6a9 9 0 0 1-1.75 10.62zM11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14z',
  'people':     'M2 22c0-3.52 2.93-6.37 6.5-6.37S15 18.48 15 22H2zm6.5-7.5C6.01 14.5 4 12.49 4 10S6.01 5.5 8.5 5.5 13 7.51 13 10s-2.01 4.5-4.5 4.5zm7.5 1.5c2.21 0 4 1.79 4 4h-4v-4zm-1.5-7.5c-1.38 0-2.5-1.12-2.5-2.5S13.12 4 14.5 4 17 5.12 17 6.5 15.88 8 14.5 8z',
  'wallet':     'M18 7h1a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a1 1 0 0 1 1 1v3zm-1 2H5v10h13V9h-1zM4 9V6H3v3h1zm11-5H5v2h10V4zm1 8h2v2h-2v-2z',
  'time':       'M12 22C6.48 22 2 17.52 2 12S6.48 2 12 2s10 4.48 10 10-4.48 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm1-8h4v2h-6V7h2v5z',
  'note':       'M6.41 16L16.56 5.86l-1.41-1.41L5 14.59V16h1.41zm.83 2H3v-4.24L14.44 2.32a1 1 0 0 1 1.41 0l2.83 2.83a1 1 0 0 1 0 1.41L7.24 18zM3 20h18v2H3v-2z',
  'chevron-right': 'M13.17 12l-4.95-4.95 1.41-1.41L16 12l-6.36 6.36-1.41-1.41z',
  'arrow-left': 'M7.83 11H20v2H7.83l4.95 4.95-1.41 1.41L4 12l7.37-7.36 1.41 1.41z',
  'check':      'M10 15.17l9.19-9.19 1.41 1.41L10 18l-6.36-6.36 1.41-1.41z',
  'close':      'M12 10.59l4.95-4.95 1.41 1.41-4.95 4.95 4.95 4.95-1.41 1.41-4.95-4.95-4.95 4.95-1.41-1.41 4.95-4.95-4.95-4.95L7.05 5.64z',
  'location':   'M12 20.9l4.95-4.95a7 7 0 1 0-9.9 0L12 20.9zm0 2.83l-6.36-6.36a9 9 0 1 1 12.73 0L12 23.73zM12 13a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 2a4 4 0 1 1 0-8 4 4 0 0 1 0 8z',
  'swap':       'M16 17v-4h2v6H6v-2.59l-2.29 2.3-1.42-1.42L6 13.59V11h2v6h8zM8 7v4H6V5h12v2.59l2.29-2.3 1.42 1.42L18 10.41V13h-2V7H8z',
  'map':        'M2 5l7-3 6 3 7-3v17l-7 3-6-3-7 3V5zm2 2.88v11.24l5-2.14V5.74L4 7.88zm7-2.14v11.24l4 2V7.74l-4-2zm6 2v11.24l3-1.29V6.45l-3 1.29z',
  'chat':       'M7.29 20.82L2 22l1.18-5.29A10 10 0 1 1 12 22a9.96 9.96 0 0 1-4.71-1.18zm.29-2.11l.65.35A7.97 7.97 0 0 0 12 20a8 8 0 1 0-8-8c0 1.38.36 2.72.94 3.77l.35.65-.47 2.12 2.13-.47z',
  'star':       'M12 18.26l-7.05 4.95.87-8.19-5.54-6.07 8.18-1.91L12 1l3.55 5.94 8.18 1.91-5.54 6.07.87 8.19L12 18.26zm0-2.29l4.25 2.98-.53-4.97 3.36-3.68-4.96-1.16L12 4.77l-2.12 4.37-4.97 1.16 3.37 3.68-.53 4.97L12 15.97z',
}

// ─── 将 SVG path 转换为 data URI background-image ────────────────────────────
function makeSvgUri(pathD: string, color: string): string {
  // 对颜色中的 # 编码，避免 URI 解析问题
  const encodedColor = color.startsWith('#')
    ? '%23' + color.slice(1)
    : encodeURIComponent(color)
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='${encodedColor}'><path d='${pathD}'/></svg>`
  return `url("data:image/svg+xml,${svg}")`
}

// ─── 组件 ────────────────────────────────────────────────────────────────────
export type IconName = keyof typeof PATHS

interface IconProps {
  name: IconName
  size?: number   // px 单位
  color?: string
  style?: CSSProperties
  className?: string
}

export default function Icon({ name, size = 24, color = '#AAAAAA', style, className }: IconProps) {
  const pathD = PATHS[name]
  if (!pathD) return null

  return (
    <View
      className={className}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundImage: makeSvgUri(pathD, color),
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        flexShrink: 0,
        ...style,
      }}
    />
  )
}
