// src/components/business/SwapStopSheet/index.tsx
import { View, Text, ScrollView } from '@tarojs/components'
import cx from 'classnames'
import styles from './index.module.scss'

export interface AlternativeStop {
  id: string
  name: string
  category: string
  walkMinutes: number
  waitMinutes: number
  reason: string
}

interface SwapStopSheetProps {
  visible: boolean
  stopName: string
  alternatives: AlternativeStop[]
  onSelect: (alt: AlternativeStop) => void
  onDismiss: () => void
  onCallAI: () => void
}

export default function SwapStopSheet({
  visible,
  stopName,
  alternatives,
  onSelect,
  onDismiss,
  onCallAI,
}: SwapStopSheetProps) {
  return (
    <>
      {/* Mask */}
      <View
        className={cx(styles.mask, visible && styles.maskVisible)}
        onClick={onDismiss}
      />

      {/* Sheet */}
      <View className={cx(styles.sheet, visible && styles.sheetVisible)}>
        {/* Handle */}
        <View className={styles.handle} />

        {/* Header */}
        <View className={styles.header}>
          <View className={styles.headerLeft}>
            <Text className={styles.headerTitle}>换掉「{stopName}」</Text>
            <Text className={styles.headerSub}>AI 为你找到了附近的替代选项</Text>
          </View>
          <View className={styles.aiBtn} onClick={onCallAI}>
            <Text className={styles.aiBtnText}>AI</Text>
            <Text className={styles.aiBtnSub}>更多想法</Text>
          </View>
        </View>

        {/* Alternative list */}
        <ScrollView scrollY className={styles.list}>
          {alternatives.map((alt) => (
            <View key={alt.id} className={styles.altCard} onClick={() => onSelect(alt)}>
              <View className={styles.altMain}>
                <View className={styles.altInfo}>
                  <Text className={styles.altName}>{alt.name}</Text>
                  <Text className={styles.altCategory}>{alt.category}</Text>
                  <Text className={styles.altReason}>{alt.reason}</Text>
                </View>
                <View className={styles.altStats}>
                  <View className={styles.statItem}>
                    {/* Walk icon */}
                    <View className={styles.statIconWalk}>
                      <View className={styles.walkBody} />
                      <View className={styles.walkHead} />
                    </View>
                    <Text className={styles.statValue}>{alt.walkMinutes}分钟</Text>
                  </View>
                  <View className={styles.statItem}>
                    {/* Clock icon */}
                    <View className={styles.statIconClock}>
                      <View className={styles.clockHand} />
                      <View className={styles.clockMinute} />
                    </View>
                    <Text className={cx(styles.statValue, alt.waitMinutes <= 10 && styles.statGreen)}>
                      等{alt.waitMinutes}分
                    </Text>
                  </View>
                </View>
              </View>
              <View className={styles.selectHint}>
                <Text className={styles.selectHintText}>换这家 ›</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </>
  )
}
