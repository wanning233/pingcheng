// src/components/business/RouteCard/index.tsx
import { View, Text, Map } from '@tarojs/components'
import cx from 'classnames'
import styles from './index.module.scss'
import { useRouteStore } from '@/stores/useRouteStore'

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

const ROUTE_STOPS: Record<string, string[]> = {
  'route-1': ['s1', 's2', 's3'],
  'route-2': ['s4', 's5', 's6'],
  'route-3': ['s7', 's8', 's9'],
}

interface RouteData {
  id: string
  name: string
  budgetPerPerson: number
  totalMinutes: number
  walkDistanceM: number
  highlights: string[]
  isAiRecommended?: boolean
}

interface RouteCardProps {
  route: RouteData
  isSelected?: boolean
  visibleIndex?: number
  onExpand?: (id: string) => void
}

function DataItem({ value, unit, label }: { value: string | number; unit: string; label?: string }) {
  return (
    <View className={styles.dataItem}>
      <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'baseline', gap: '2px' }}>
        <Text className={styles.dataValue}>{value}</Text>
        <Text className={styles.dataUnit}>{unit}</Text>
      </View>
      {label && <Text className={styles.dataUnit}>{label}</Text>}
    </View>
  )
}

function Tag({ children }: { children: string }) {
  return <Text className={styles.tag}>{children}</Text>
}

export default function RouteCard({ route, isSelected = false, visibleIndex, onExpand }: RouteCardProps) {
  const isRecommended = !!route.isAiRecommended

  const stopIds = ROUTE_STOPS[route.id] ?? []
  const coords = stopIds.map(id => STOP_COORDS[id]).filter(Boolean)
  const markers = coords.map((c, i) => ({ id: i, latitude: c.lat, longitude: c.lng, width: 20, height: 20 }))
  const polyline = coords.length >= 2 ? [{
    points: coords.map(c => ({ latitude: c.lat, longitude: c.lng })),
    color: '#FF6B2B',
    width: 4,
    arrowLine: true,
  }] : []
  const centerLat = coords[0]?.lat ?? 31.2990
  const centerLng = coords[0]?.lng ?? 121.5120

  const handleTap = () => {
    onExpand?.(route.id)
  }

  return (
    <View
      id={`route-card-${route.id}`}
      className={cx(
        styles.card,
        isRecommended && styles.recommend,
        isSelected && styles.selected
      )}
      onClick={handleTap}
      style={{ transform: isRecommended ? 'scale(1.02)' : 'scale(1)' }}
    >
      {/* 地图缩略图 — 真实 Map */}
      <View className={styles.mapThumb}>
        <Map
          className={styles.mapEl}
          latitude={centerLat}
          longitude={centerLng}
          scale={14}
          markers={markers as any}
          polyline={polyline as any}
          enableZoom={false}
          enableScroll={false}
          enableRotate={false}
          style={{ width: '100%', height: '100%', display: 'block' }}
        />
        <View className={styles.mapOverlay} />
        {isRecommended && <View className={styles.badge}>AI推荐</View>}
      </View>
      {/* 卡片内容区 */}
      <View className={styles.body}>
        <Text className={styles.name}>{route.name}</Text>
        <View className={styles.dataRow}>
          <DataItem value={route.budgetPerPerson} unit="¥" label="人均" />
          <DataItem value={(route.totalMinutes / 60).toFixed(1)} unit="h" label="时长" />
          <DataItem value={route.walkDistanceM} unit="m" label="步行" />
        </View>
        <View className={styles.cardFooter}>
          <View className={styles.tags}>
            {route.highlights.map(t => <Tag key={t}>{t}</Tag>)}
          </View>
          <Text className={styles.detailHint}>{isSelected ? '✓ 已选择' : '查看详情 ›'}</Text>
        </View>
      </View>
    </View>
  )
}
