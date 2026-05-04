// src/components/business/ChatBubble/index.tsx
import { View, Text } from '@tarojs/components'
import React, { useMemo } from 'react'
import styles from './index.module.scss'

interface ChatBubbleProps {
  role: 'user' | 'ai'
  content: string
  isStreaming?: boolean
  streamDurationMs?: number
}

export default function ChatBubble({
  role,
  content,
  isStreaming = false,
  streamDurationMs,
}: ChatBubbleProps) {
  const duration = streamDurationMs ?? content.length * 30

  const textStyle = useMemo(() => {
    if (isStreaming) {
      return {
        animation: `textReveal ${duration}ms linear forwards`,
        display: 'block',
      }
    }
    return {}
  }, [isStreaming, duration])

  if (role === 'ai') {
    return (
      <View className={styles.aiRow}>
        <View className={styles.aiStripe} />
        <View className={styles.aiBubble}>
          <Text className={styles.content} style={textStyle as any}>
            {content}
          </Text>
        </View>
      </View>
    )
  }

  return (
    <View className={styles.userRow}>
      <View className={styles.userBubble}>
        <Text className={styles.contentUser}>{content}</Text>
      </View>
    </View>
  )
}
