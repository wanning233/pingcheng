// src/components/business/RouteCard/index.tsx
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import cx from 'classnames'
import styles from './index.module.scss'
import { useRouteStore } from '@/stores/useRouteStore'

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
  visibleIndex?: number  // 用于stagger动效
}

function DataItem({ value, unit, prefix }: { value: string | number; unit: string; prefix?: boolean }) {
  return (
    <View className={styles.dataItem}>
      {prefix && <Text className={styles.dataUnit}>{unit}</Text>}
      <Text className={styles.dataValue}>{value}</Text>
      {!prefix && <Text className={styles.dataUnit}>{unit}</Text>}
    </View>
  )
}

function Tag({ children }: { children: string }) {
  return <View className={styles.tag}>{children}</View>
}

export default function RouteCard({ route, isSelected = false, visibleIndex }: RouteCardProps) {
  const isRecommended = !!route.isAiRecommended
  const setTransitionRect = useRouteStore(s => s.setTransitionRect)
  const setSelectedRouteId = useRouteStore(s => s.selectRoute)

  const handleTap = () => {
    setSelectedRouteId(route.id)
    // 记录卡片位置供转场动效使用
    const query = Taro.createSelectorQuery()
    query.select(`#route-card-${route.id}`).boundingClientRect((rect) => {
      if (rect) setTransitionRect(rect as any)
    }).exec()
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
      style={{ transform: isRecommended ? 'scale(1.04)' : 'scale(1)' }}
    >
      {/* 顶部4px渐变色条 */}
      <View className={cx(styles.topStripe, isRecommended && styles.topStripeAi)} />
      {/* AI推荐角标 */}
      {isRecommended && <View className={styles.badge}>AI推荐</View>}
      {/* 地图路线缩略图占位 */}
      <View className={styles.mapThumb} />
      {/* 卡片内容区 */}
      <View className={styles.body}>
        <Text className={styles.name}>{route.name}</Text>
        <View className={styles.dataRow}>
          <DataItem value={route.budgetPerPerson} unit="¥" prefix />
          <DataItem value={(route.totalMinutes / 60).toFixed(1)} unit="h" />
          <DataItem value={route.walkDistanceM} unit="m" />
        </View>
        <ScrollView scrollX className={styles.tags}>
          {route.highlights.map(t => <Tag key={t}>{t}</Tag>)}
        </ScrollView>
      </View>
    </View>
  )
}
