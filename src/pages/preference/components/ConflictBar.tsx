// src/pages/preference/components/ConflictBar.tsx
import { View, Text } from '@tarojs/components'
import styles from './ConflictBar.module.scss'

interface ConflictBarProps {
  visible: boolean
  message?: string
}

export default function ConflictBar({
  visible,
  message = 'AI 发现偏好冲突，正在协商中...',
}: ConflictBarProps) {
  return (
    <View className={`${styles.conflictBar} ${visible ? styles.conflictBarVisible : ''}`}>
      <Text className={styles.icon}>⚡</Text>
      <Text className={styles.message}>{message}</Text>
    </View>
  )
}
