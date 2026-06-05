// src/pages/invite/landing/index.tsx
import { View, Text } from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro'
import { useState, useEffect } from 'react'
import styles from './index.module.scss'
import { getTripByInviteCode, joinTripByInviteCode, TripByInviteResponse } from '../../../services/api'
import { useSessionStore } from '../../../stores/useSessionStore'
import { useUserStore } from '../../../stores/useUserStore'
import LoginSheet from '../../../components/business/LoginSheet'

export default function InviteLandingPage() {
  console.log('[landing] render')
  const [inviteCode, setInviteCode] = useState<string | null>(null)
  const [joining, setJoining] = useState(false)
  const [loading, setLoading] = useState(true)
  const [invite, setInvite] = useState<TripByInviteResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showLogin, setShowLogin] = useState(false)

  // useLoad 同步读 params — onLoad 时 params 已就绪，只做同步赋值
  useLoad(() => {
    const code = Taro.getCurrentInstance()?.router?.params?.inviteCode ?? ''
    console.log('[landing] onLoad, inviteCode:', code)
    setInviteCode(code)
  })

  // inviteCode 从 null 变为实际值后触发请求
  useEffect(() => {
    if (inviteCode === null) return          // useLoad 还未执行
    if (!inviteCode) {                       // 无邀请码
      setError('缺少邀请码')
      setLoading(false)
      return
    }
    console.log('[landing] fetching, inviteCode:', inviteCode)
    getTripByInviteCode(inviteCode)
      .then(data => {
        console.log('[landing] invite data ok')
        setInvite(data)
      })
      .catch(e => {
        const msg = e instanceof Error ? e.message : String(e)
        console.error('[landing] fetch error:', msg)
        setError(msg)
      })
      .finally(() => setLoading(false))
  }, [inviteCode])

  // 加载中
  if (loading) {
    return (
      <View className={styles.page}>
        <View className={styles.card}>
          <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '120rpx' }}>
            <Text style={{ fontSize: '28rpx', color: 'rgba(26,26,26,0.45)' }}>加载中...</Text>
          </View>
        </View>
      </View>
    )
  }

  // 加载失败
  if (error || !invite) {
    return (
      <View className={styles.page}>
        <View className={styles.card}>
          <View className={styles.expiredBox}>
            <Text className={styles.expiredIcon}>⚠️</Text>
            <Text className={styles.expiredTitle}>无法加载邀请</Text>
            <Text className={styles.expiredDesc}>邀请链接可能已失效或无效</Text>
            <Text className={styles.expiredHint}>{error ?? '请重新获取邀请链接'}</Text>
          </View>
        </View>
      </View>
    )
  }

  // 已过期/关闭
  if (invite.status === 'expired' || invite.status === 'closed') {
    return (
      <View className={styles.page}>
        <View className={styles.card}>
          <View className={styles.expiredBox}>
            <Text className={styles.expiredIcon}>⏰</Text>
            <Text className={styles.expiredTitle}>邀请已过期</Text>
            <Text className={styles.expiredDesc}>该邀请链接已失效</Text>
            <Text className={styles.expiredHint}>请联系 {invite.creator?.nickname || '发起人'} 重新发送邀请</Text>
          </View>
        </View>
      </View>
    )
  }

  const handleJoin = async () => {
    if (!useUserStore.getState().isLoggedIn) {
      setShowLogin(true)
      return
    }
    setJoining(true)
    try {
      const nickName = useUserStore.getState().nickName || '游客'
      const joinRes = await joinTripByInviteCode(inviteCode!, {
        nickname: nickName,
        preference: {},
      })
      useSessionStore.getState().setSession({
        tripId: invite!.trip_id,
        memberId: joinRes.member_id,
        inviteCode: invite!.invite_code,
        memberRole: 'member',
        area: invite!.area,
        city: invite!.city,
      })
    } catch (e) {
      console.error('[landing] joinTripByInviteCode error:', e)
      // 即便 join 失败也继续（本地 session 兜底）
      useSessionStore.getState().setSession({
        tripId: invite!.trip_id,
        memberId: '',
        inviteCode: invite!.invite_code,
        memberRole: 'member',
        area: invite!.area,
        city: invite!.city,
      })
    }
    Taro.navigateTo({ url: `/pages/ai-questions/index?tripId=${invite!.trip_id}&role=member` })
  }

  const remaining = invite.people_count - invite.joined_count
  const urgencyText = remaining === 1
    ? '还差最后1个名额！'
    : remaining <= 2
    ? `还差 ${remaining} 个名额`
    : `${invite.joined_count}/${invite.people_count} 人已加入`

  const creatorName = invite.creator?.nickname || '发起人'
  const tripDisplayName = invite.area ? `${invite.city} · ${invite.area} 行程` : '行程邀请'

  return (
    <View className={styles.page}>
      <View className={styles.card}>
        {/* Initiator info */}
        <View className={styles.initiatorRow}>
          <View className={styles.avatar}>
            <Text className={styles.avatarText}>{creatorName[0]}</Text>
          </View>
          <View className={styles.initiatorInfo}>
            <Text className={styles.initiatorName}>{creatorName}</Text>
            <Text className={styles.initiatorLabel}>邀请你加入</Text>
          </View>
        </View>

        {/* Trip name */}
        <Text className={styles.tripName}>{tripDisplayName}</Text>

        {/* Trip meta */}
        <View className={styles.metaList}>
          <View className={styles.metaItem}>
            <Text className={styles.metaIcon}>📍</Text>
            <Text className={styles.metaText}>{invite.city} · {invite.area}</Text>
          </View>
          <View className={styles.metaItem}>
            <Text className={styles.metaIcon}>👥</Text>
            <Text className={styles.metaText}>共 {invite.people_count} 人出行</Text>
          </View>
        </View>

        {/* Progress bar */}
        <View className={styles.progressWrap}>
          <View className={styles.progressTrack}>
            <View
              className={styles.progressFill}
              style={{ width: `${(invite.joined_count / invite.people_count) * 100}%` } as any}
            />
          </View>
          <Text className={`${styles.progressLabel} ${remaining <= 2 ? styles.progressLabelUrgent : ''}`}>
            {urgencyText}
          </Text>
        </View>

        {/* CTA */}
        <View className={styles.ctaArea}>
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

      {showLogin && (
        <LoginSheet
          onClose={() => setShowLogin(false)}
          onSuccess={() => {
            setShowLogin(false)
            handleJoin()
          }}
        />
      )}
    </View>
  )
}
