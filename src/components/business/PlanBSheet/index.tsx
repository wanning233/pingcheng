// src/components/business/PlanBSheet/index.tsx
import { View, Text } from '@tarojs/components'
import cx from 'classnames'
import styles from './index.module.scss'

interface PlanBSheetProps {
  visible: boolean
  onNavigate: () => void
  onCallAI: () => void
}

export default function PlanBSheet({ visible, onNavigate, onCallAI }: PlanBSheetProps) {
  return (
    <View
      className={cx(styles.sheet, visible && styles.visible)}
      style={{
        transform: visible ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 300ms cubic-bezier(0.32, 0.72, 0, 1)',
      }}
    >
      {/* 左侧AI圆形按钮 */}
      <View className={styles.aiBtn} onClick={onCallAI}>
        <Text className={styles.aiBtnText}>AI</Text>
      </View>

      {/* 右侧主按钮：导航到下一站 */}
      <View className={styles.mainBtn} onClick={onNavigate}>
        <Text className={styles.mainBtnText}>导航到下一站</Text>
      </View>
    </View>
  )
}
