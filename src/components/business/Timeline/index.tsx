// src/components/business/Timeline/index.tsx
import { View, Text, ScrollView } from '@tarojs/components'
import { useState } from 'react'
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
  const [expanded, setExpanded] = useState(stop.status === 'current')
  const isDone = stop.status === 'done'

  return (
    <View
      className={cx(styles.stopCard, isDone && styles.stopDone)}
      onClick={() => setExpanded(!expanded)}
    >
      {/* 站点头部 */}
      <View className={styles.stopHeader}>
        <View className={styles.stopInfo}>
          <Text className={styles.stopName}>{stop.name}</Text>
          <Text className={styles.stopDuration}>停留 {stop.stayMinutes} 分钟</Text>
        </View>
        {isDone && <Text className={styles.doneCheck}>✓</Text>}
      </View>

      {/* 展开内容：使用max-height transition，不能用height:auto */}
      <View
        className={styles.stopDetail}
        style={{
          maxHeight: expanded ? '500px' : '0px',
          overflow: 'hidden',
          transition: 'max-height 300ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* 玩法标签横向滚动 */}
        <ScrollView scrollX className={styles.stopTags}>
          {stop.tags.map(t => (
            <View key={t} className={styles.stopTag}>{t}</View>
          ))}
        </ScrollView>

        {/* 操作按钮组 */}
        {!isDone && (
          <View className={styles.actions}>
            <View
              className={styles.actionBtn}
              onClick={(e) => { e.stopPropagation(); onNavigate?.(stop) }}
            >
              <Text className={styles.actionText}>导航</Text>
            </View>
            <View
              className={styles.actionBtn}
              onClick={(e) => { e.stopPropagation(); onGetTicket?.(stop) }}
            >
              <Text className={styles.actionText}>取号</Text>
            </View>
            <View
              className={cx(styles.actionBtn, styles.actionBtnSwap)}
              onClick={(e) => { e.stopPropagation(); onSwap?.(stop) }}
            >
              <Text className={cx(styles.actionText, styles.actionTextSwap)}>换一家</Text>
            </View>
          </View>
        )}
      </View>
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
            {/* 节点 */}
            <View className={cx(
              styles.node,
              stop.status === 'current' && styles.nodeActive,
              stop.status === 'done' && styles.nodeDone,
              stop.status === 'upcoming' && styles.nodeUpcoming,
            )}>
              {/* pulse双层光圈，仅当前节点显示 */}
              {stop.status === 'current' && (
                <>
                  <View className={styles.pulseRing1} />
                  <View className={styles.pulseRing2} />
                </>
              )}
            </View>
            {/* 连接线（最后一个节点不显示） */}
            {index < stops.length - 1 && (
              <View className={cx(
                styles.line,
                stop.status === 'done' && styles.lineDone,
              )} />
            )}
          </View>

          {/* 右侧站点卡片 */}
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
