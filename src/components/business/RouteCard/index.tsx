// src/components/business/RouteCard/index.tsx
import { View, Text } from '@tarojs/components'
import cx from 'classnames'
import styles from './index.module.scss'


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
  const stopCount = route.stops?.length ?? 0


  return (
    <View
      id={`route-card-${route.id}`}
      className={cx(styles.card, isSelected && styles.selected)}
      onClick={() => onExpand?.(route.id)}
    >
      {/* 地图缩略图 — TODO: Map 组件暂用占位，小程序同页多 Map 会崩 */}
      <View className={styles.mapThumb} style={{ background: '#e8e8e8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
