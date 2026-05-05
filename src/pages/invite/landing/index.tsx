// src/pages/invite/landing/index.tsx
import { View, Text, Image } from '@tarojs/components'
import Taro, { useLoad, useRouter } from '@tarojs/taro'
import React, { useState } from 'react'
import styles from './index.module.scss'

const MOCK_INVITE = {
  inviteCode: 'ABC123',
  tripName: '五角场下午局',
  initiator: '林小夏',
  initiatorAvatar: '',
  message: '最近发现几个超棒的新地方，大家一起去探店吧！',
  date: '5月3日（周日）下午',
  city: '上海',
  area: '五角场',
  maxPeople: 4,
  joinedCount: 1,
  status: 'active' as 'active' | 'expired' | 'closed',
}

export default function InviteLandingPage() {
  const router = useRouter()
  const { inviteCode } = router.params

  const [joining, setJoining] = useState(false)

  // No invite code → redirect to home
  useLoad(() => {
    if (!inviteCode) {
      Taro.reLaunch({ url: '/pages/home/index' })
    }
  })

  if (!inviteCode) return null

  const invite = MOCK_INVITE

  if (invite.status === 'expired') {
    return (
      <View className={styles.page}>
        <View className={styles.expiredBox}>
          <Text className={styles.expiredIcon}>⏰</Text>
          <Text className={styles.expiredTitle}>邀请已过期</Text>
          <Text className={styles.expiredDesc}>该邀请链接已超过24小时失效</Text>
          <Text className={styles.expiredHint}>请联系 {invite.initiator} 重新发送邀请</Text>
        </View>
      </View>
    )
  }

  const handleJoin = () => {
    setJoining(true)
    // wx.getUserProfile → navigate to preference
    Taro.getUserProfile({
      desc: '用于展示你的头像和昵称',
      success: () => {
        Taro.navigateTo({ url: '/pages/preference/index' })
      },
      fail: () => {
        setJoining(false)
        Taro.showToast({ title: '需要授权才能加入', icon: 'none' })
      },
    })
  }

  const joinedRatio = `${invite.joinedCount}/${invite.maxPeople}`
  const remaining = invite.maxPeople - invite.joinedCount
  const urgencyText = remaining === 1
    ? '还差最后1个名额！'
    : remaining <= 2
    ? `还差 ${remaining} 个名额`
    : `${invite.joinedCount}/${invite.maxPeople} 人已加入`

  return (
    <View className={styles.page}>
      {/* Background gradient */}
      <View className={styles.bgGradient} />

      {/* Skyline illustration placeholder */}
      <View className={styles.skylineArea}>
        <View className={styles.skylinePlaceholder}>
          <Text className={styles.skylineEmoji}>🌆</Text>
        </View>
      </View>

      {/* Card */}
      <View className={styles.card}>
        {/* Initiator info */}
        <View className={styles.initiatorRow}>
          <View className={styles.avatar}>
            <Text className={styles.avatarText}>{invite.initiator[0]}</Text>
          </View>
          <View className={styles.initiatorInfo}>
            <Text className={styles.initiatorName}>{invite.initiator}</Text>
            <Text className={styles.initiatorLabel}>邀请你加入</Text>
          </View>
        </View>

        {/* Trip name */}
        <Text className={styles.tripName}>{invite.tripName}</Text>

        {/* Trip meta */}
        <View className={styles.metaList}>
          <View className={styles.metaItem}>
            <Text className={styles.metaIcon}>📅</Text>
            <Text className={styles.metaText}>{invite.date}</Text>
          </View>
          <View className={styles.metaItem}>
            <Text className={styles.metaIcon}>📍</Text>
            <Text className={styles.metaText}>{invite.city} · {invite.area}</Text>
          </View>
          <View className={styles.metaItem}>
            <Text className={styles.metaIcon}>👥</Text>
            <Text className={`${styles.metaText} ${remaining <= 2 ? styles.metaTextUrgent : ''}`}>
              {urgencyText}
            </Text>
          </View>
        </View>

        {/* Progress bar */}
        <View className={styles.progressWrap}>
          <View className={styles.progressTrack}>
            <View
              className={styles.progressFill}
              style={{ width: `${(invite.joinedCount / invite.maxPeople) * 100}%` } as any}
            />
          </View>
          <Text className={`${styles.progressLabel} ${remaining <= 2 ? styles.progressLabelUrgent : ''}`}>
            {urgencyText}
          </Text>
        </View>

        {/* Message from initiator */}
        {invite.message && (
          <View className={styles.messageBox}>
            <Text className={styles.messageQuote}>"</Text>
            <Text className={styles.messageText}>{invite.message}</Text>
          </View>
        )}

        {/* CTA */}
        <View
          className={`${styles.joinBtn} ${joining ? styles.joinBtnLoading : ''}`}
          onClick={joining ? undefined : handleJoin}
        >
          <Text className={styles.joinBtnText}>
            {joining ? '加入中...' : '加入这次行程'}
          </Text>
        </View>

        <Text className={styles.hint}>加入后需填写你的出行偏好，约1分钟</Text>
      </View>
    </View>
  )
}
