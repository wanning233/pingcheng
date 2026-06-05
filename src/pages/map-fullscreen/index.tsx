// src/pages/map-fullscreen/index.tsx
import { View, Text, Map } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useMemo } from 'react'
import { useRouteStore } from '@/stores/useRouteStore'
import styles from './index.module.scss'

const STOP_COORDS: Record<string, { lat: number; lng: number }> = {
  's1': { lat: 31.2990, lng: 121.5120 },
  's2': { lat: 31.2978, lng: 121.5098 },
  's3': { lat: 31.2962, lng: 121.5085 },
  's4': { lat: 31.3025, lng: 121.5058 },
  's5': { lat: 31.2985, lng: 121.5025 },
  's6': { lat: 31.2998, lng: 121.5040 },
  's7': { lat: 31.3014, lng: 121.5145 },
  's8': { lat: 31.3005, lng: 121.5132 },
  's9': { lat: 31.2997, lng: 121.5118 },
}

export default function MapFullscreenPage() {
  const router = useRouter()
  const routeId = router.params.routeId || ''
  console.log('[map-fullscreen] render, routeId:', routeId)
  const routes = useRouteStore(s => s.routes)
  const route = routes.find((r) => r.id === routeId) ?? routes[0]

  const stops = useMemo(() =>
    (route?.stops ?? []).map((stop) => ({
      ...stop,
      coord: STOP_COORDS[stop.id] ?? { lat: 31.2990, lng: 121.5120 },
    })), [route])

  const markers = useMemo(() =>
    stops.map((stop, idx) => ({
      id: idx,
      latitude: stop.coord.lat,
      longitude: stop.coord.lng,
      width: 28,
      height: 28,
    })), [stops])

  const polyline = useMemo(() =>
    stops.length >= 2 ? [{
      points: stops.map((s) => ({ latitude: s.coord.lat, longitude: s.coord.lng })),
      color: '#FF6B4A',
      width: 6,
      arrowLine: true,
    }] : [], [stops])

  const centerLat = stops[0]?.coord.lat ?? 31.2990
  const centerLng = stops[0]?.coord.lng ?? 121.5120

  return (
    <View className={styles.page}>
      <Map
        className={styles.map}
        style={{ width: '100%', height: '100vh', display: 'block' }}
        latitude={centerLat}
        longitude={centerLng}
        scale={15}
        markers={markers as any}
        polyline={polyline as any}
        enableZoom
        enableScroll
        enableRotate={false}
      />
      <View className={styles.backBtn} onClick={() => Taro.navigateBack()}>
        <Text className={styles.backIcon}>←</Text>
        <Text className={styles.backText}>返回</Text>
      </View>
      <View className={styles.routeLabel}>
        <Text className={styles.routeLabelText}>{route?.name ?? ''}</Text>
        <Text className={styles.routeLabelSub}>{stops.length} 个站点</Text>
      </View>
    </View>
  )
}
