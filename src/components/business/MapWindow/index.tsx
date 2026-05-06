// src/components/business/MapWindow/index.tsx
import { View, Text, Map } from '@tarojs/components'
import { useState } from 'react'
import styles from './index.module.scss'

// 五角场附近的站点坐标（与 routes.json 对应）
const FALLBACK_COORDS: Record<string, { lat: number; lng: number }> = {
  's1': { lat: 31.2990, lng: 121.5120 },
  's2': { lat: 31.3010, lng: 121.5098 },
  's3': { lat: 31.3025, lng: 121.5080 },
  's4': { lat: 31.2975, lng: 121.5135 },
  's5': { lat: 31.2988, lng: 121.5065 },
  's6': { lat: 31.2960, lng: 121.5110 },
  's7': { lat: 31.3005, lng: 121.5140 },
  's8': { lat: 31.3018, lng: 121.5095 },
  's9': { lat: 31.3030, lng: 121.5070 },
}

interface MapWindowProps {
  collapsed: boolean
  routeId: string
  useSdkMap?: boolean
  onExpandFullscreen?: () => void
}

export default function MapWindow({ collapsed, routeId, onExpandFullscreen }: MapWindowProps) {
  // 保存用户设置的缩放级别，折叠时保存，展开时恢复
  const [userScale, setUserScale] = useState(15)
  const [currentScale, setCurrentScale] = useState(15)

  // 根据 routeId 选对应站点坐标
  const stopIds: Record<string, string[]> = {
    'route-1': ['s1', 's2', 's3'],
    'route-2': ['s4', 's5', 's6'],
    'route-3': ['s7', 's8', 's9'],
  }
  const ids = stopIds[routeId] ?? stopIds['route-1']
  const coords = ids.map(id => FALLBACK_COORDS[id]).filter(Boolean)

  const markers = coords.map((c, i) => ({
    id: i,
    latitude: c.lat,
    longitude: c.lng,
    width: 24,
    height: 24,
    iconPath: '',  // 使用默认图钉
  }))

  const polyline = coords.length >= 2 ? [{
    points: coords.map(c => ({ latitude: c.lat, longitude: c.lng })),
    color: '#FF6B4A',
    width: 5,
    arrowLine: true,
  }] : []

  const centerLat = coords[0]?.lat ?? 31.2990
  const centerLng = coords[0]?.lng ?? 121.5120

  // 监听地图区域变化，保存用户的缩放级别
  const handleRegionChange = (e: any) => {
    if (e.type === 'end' && e.detail && e.detail.scale) {
      setUserScale(e.detail.scale)
      setCurrentScale(e.detail.scale)
    }
  }

  // 折叠时保存缩放级别，展开时恢复
  const scale = collapsed ? userScale : currentScale

  return (
    <View
      className={styles.window}
      style={{ height: collapsed ? '112rpx' : '33vh' } as any}
    >
      <Map
        className={styles.map}
        latitude={centerLat}
        longitude={centerLng}
        scale={scale}
        markers={markers as any}
        polyline={polyline as any}
        enableZoom={!collapsed}
        enableScroll={!collapsed}
        enableRotate={false}
        enableOverlooking={false}
        enableCompass={false}
        onRegionChange={handleRegionChange}
      />

      {/* 展开/全屏按钮 */}
      <View className={styles.expandBtn} onClick={onExpandFullscreen}>
        <Text className={styles.expandText}>{collapsed ? '展开' : '全屏'}</Text>
      </View>
    </View>
  )
}
