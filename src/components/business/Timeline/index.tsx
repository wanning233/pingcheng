// src/components/business/Timeline/index.tsx
import { View, Text } from '@tarojs/components'
import cx from 'classnames'
import styles from './index.module.scss'

type StopStatus = 'done' | 'current' | 'upcoming'

interface Stop {
  id: string
  name: string
  stayMinutes: number
  tags: string[]
  status: StopStatus
}

interface TimelineProps {
  stops: Stop[]
  onNavigate?: (stop: Stop) => void
  onGetTicket?: (stop: Stop) => void
  onSwap?: (stop: Stop, index: number) => void
}

function StopCard({ stop, onNavigate, onGetTicket, onSwap }: {
  stop: Stop
  onNavigate?: (s: Stop) => void
  onGetTicket?: (s: Stop) => void
  onSwap?: (s: Stop) => void
}) {
  const isDone = stop.status === 'done'
  const isCurrent = stop.status === 'current'
  const metaText = [
    `停留 ${stop.stayMinutes} 分钟`,
    ...stop.tags,
  ].join(' · ')

  return (
    <View className={cx(styles.stopContent, isDone && styles.stopDone)}>
      <Text className={styles.stopName}>{stop.name}</Text>
      <Text className={styles.stopMeta}>{metaText}</Text>

      {/* 操作按钮：仅当前站显示 */}
      {isCurrent && (
        <View className={styles.actions}>
          <View
            className={cx(styles.actionBtn, styles.actionBtnPrimary)}
            onClick={(e) => { e.stopPropagation(); onNavigate?.(stop) }}
          >
            <Text className={cx(styles.actionText, styles.actionTextPrimary)}>导航</Text>
          </View>
          <View
            className={styles.actionBtn}
            onClick={(e) => { e.stopPropagation(); onGetTicket?.(stop) }}
          >
            <Text className={styles.actionText}>取号</Text>
          </View>
          <View
            className={styles.actionBtn}
            onClick={(e) => { e.stopPropagation(); onSwap?.(stop) }}
          >
            <Text className={styles.actionText}>换一家</Text>
          </View>
        </View>
      )}
    </View>
  )
}

export default function Timeline({ stops, onNavigate, onGetTicket, onSwap }: TimelineProps) {
  return (
    <View className={styles.timeline}>
      {stops.map((stop, index) => (
        <View key={stop.id} className={styles.row}>
          {/* 左侧节点+连线 */}
          <View className={styles.track}>
            <View className={cx(
              styles.node,
              stop.status === 'current' && styles.nodeActive,
              stop.status === 'done' && styles.nodeDone,
              stop.status === 'upcoming' && styles.nodeUpcoming,
            )}>
              {stop.status === 'current' && (
                <View className={styles.pulseRing1} />
              )}
            </View>
            {index < stops.length - 1 && (
              <View className={cx(
                styles.line,
                stop.status === 'done' && styles.lineDone,
              )} />
            )}
          </View>

          {/* 右侧内容 */}
          <View className={styles.cardArea}>
            <StopCard
              stop={stop}
              onNavigate={onNavigate}
              onGetTicket={onGetTicket}
              onSwap={(s) => onSwap?.(s, index)}
            />
          </View>
        </View>
      ))}
    </View>
  )
}
