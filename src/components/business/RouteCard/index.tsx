// src/components/business/RouteCard/index.tsx
import { View, Text, Map } from '@tarojs/components'
import cx from 'classnames'
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
  stops?: { id: string }[]
}

interface RouteCardProps {
  route: RouteData
  isSelected?: boolean
  visibleIndex?: number
  onExpand?: (id: string) => void
}

export default function RouteCard({ route, isSelected = false, onExpand }: RouteCardProps) {
  const isRecommended = !!route.isAiRecommended
  const stopCount = route.stops?.length ?? ROUTE_STOPS[route.id]?.length ?? 3

  const stopIds = ROUTE_STOPS[route.id] ?? []
  const coords = stopIds.map(id => STOP_COORDS[id]).filter(Boolean)
  const markers = coords.map((c, i) => ({ id: i, latitude: c.lat, longitude: c.lng, width: 20, height: 20 }))
  const polyline = coords.length >= 2 ? [{
    points: coords.map(c => ({ latitude: c.lat, longitude: c.lng })),
    color: '#111111',
    width: 4,
    arrowLine: true,
  }] : []
  const centerLat = coords[0]?.lat ?? 31.2990
  const centerLng = coords[0]?.lng ?? 121.5120

  return (
    <View
      id={`route-card-${route.id}`}
      className={cx(styles.card, isSelected && styles.selected)}
      onClick={() => onExpand?.(route.id)}
    >
      {/* 地图缩略图 */}
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
        {isRecommended && <View className={styles.badge}>AI 推荐</View>}
      </View>

      {/* 卡片内容 */}
      <View className={styles.body}>
        <Text className={styles.name}>{route.name}</Text>
        <Text className={styles.subTitle}>{stopCount} 个站点</Text>

        {/* 数据三列 */}
        <View className={styles.dataRow}>
          <View className={styles.dataItem}>
            <Text className={styles.dataValue}>{route.budgetPerPerson}</Text>
            <Text className={styles.dataUnit}>元 / 人均</Text>
          </View>
          <View className={styles.dataDivider} />
          <View className={styles.dataItem}>
            <Text className={styles.dataValue}>{(route.totalMinutes / 60).toFixed(1)}</Text>
            <Text className={styles.dataUnit}>小时 / 时长</Text>
          </View>
          <View className={styles.dataDivider} />
          <View className={styles.dataItem}>
            <Text className={styles.dataValue}>{route.walkDistanceM}</Text>
            <Text className={styles.dataUnit}>米 / 步行</Text>
          </View>
        </View>

        {/* 标签 */}
        <View className={styles.tags}>
          {route.highlights.map(t => (
            <Text key={t} className={styles.tag}>{t}</Text>
          ))}
        </View>
      </View>
    </View>
  )
}
