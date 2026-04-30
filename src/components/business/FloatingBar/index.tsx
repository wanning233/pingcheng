// src/components/business/FloatingBar/index.tsx
import { View, Text } from '@tarojs/components'
import styles from './index.module.scss'

interface FloatingBarProps {
  label: string
  disabled?: boolean
  onClick?: () => void
}

export default function FloatingBar({ label, disabled = false, onClick }: FloatingBarProps) {
  return (
    <View className={styles.bar}>
      <View
        className={styles.btn}
        style={{ opacity: disabled ? 0.5 : 1 }}
        onClick={disabled ? undefined : onClick}
      >
        <Text className={styles.btnText}>{label}</Text>
      </View>
    </View>
  )
}
