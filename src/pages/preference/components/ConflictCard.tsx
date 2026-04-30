// src/pages/preference/components/ConflictCard.tsx
import { View, Text } from '@tarojs/components'
import styles from './ConflictCard.module.scss'

interface ConflictCardProps {
  conflict: {
    id: string
    members: string[]
    description: string
    resolution: string
  }
  visible: boolean
  colliding: boolean
  resolved: boolean
  showResolution: boolean
}

export default function ConflictCard({
  conflict,
  visible,
  colliding,
  resolved,
  showResolution,
}: ConflictCardProps) {
  return (
    <View
      className={[
        styles.card,
        visible ? styles.cardVisible : '',
        resolved ? styles.cardResolved : '',
      ].filter(Boolean).join(' ')}
    >
      {/* 顶部标签 */}
      <View className={styles.tagRow}>
        <View className={`${styles.statusTag} ${resolved ? styles.statusTagResolved : ''}`}>
          <Text className={`${styles.statusTagText} ${resolved ? styles.statusTagTextResolved : ''}`}>
            {resolved ? '✓ 已解决' : '⚡ 冲突'}
          </Text>
        </View>
      </View>

      {/* 冲突描述 */}
      <Text className={styles.description}>{conflict.description}</Text>

      {/* 头像碰撞行 */}
      <View className={styles.avatarRow}>
        <View className={`${styles.avatarLeft} ${colliding ? styles.avatarLeftCollide : ''}`}>
          <Text className={styles.avatarName}>{conflict.members[0]}</Text>
        </View>
        <Text className={styles.vs}>VS</Text>
        <View className={`${styles.avatarRight} ${colliding ? styles.avatarRightCollide : ''}`}>
          <Text className={styles.avatarName}>{conflict.members[1]}</Text>
        </View>
      </View>

      {/* AI 解决方案（打字机效果，clip-path 裁切） */}
      {showResolution && (
        <View className={styles.resolutionArea}>
          <Text className={styles.aiLabel}>AI 决策官</Text>
          <Text className={`${styles.resolutionText} ${styles.typewriter}`}>
            {conflict.resolution}
          </Text>
        </View>
      )}
    </View>
  )
}
