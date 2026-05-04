// src/components/business/ThinkingIndicator/index.tsx
import { View } from '@tarojs/components'
import React from 'react'
import styles from './index.module.scss'

export default function ThinkingIndicator() {
  return (
    <View className={styles.aiRow}>
      <View className={styles.aiStripe} />
      <View className={styles.bubble}>
        <View className={styles.dot} style={{ animationDelay: '0ms' }} />
        <View className={styles.dot} style={{ animationDelay: '150ms' }} />
        <View className={styles.dot} style={{ animationDelay: '300ms' }} />
      </View>
    </View>
  )
}
