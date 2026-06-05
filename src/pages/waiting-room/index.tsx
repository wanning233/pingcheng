// src/pages/waiting-room/index.tsx
import { useState, useEffect, useRef, useCallback } from 'react'
import Taro, { useLoad } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { getTripWaitingStatus, planTrip, WaitingRoomStatus } from '../../services/api'
import { useSessionStore } from '../../stores/useSessionStore'
import { useRouteStore } from '../../stores/useRouteStore'
import styles from './index.module.scss'

export default function WaitingRoomPage() {
  const [tripId, setTripId] = useState('')
  const [status, setStatus] = useState<WaitingRoomStatus | null>(null)
  const [navigating, setNavigating] = useState(false)
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const doneRef = useRef(false)
  const planTriggeredRef = useRef(false)

  const inviteCode = useSessionStore(s => s.inviteCode)

  useLoad(() => {
    const params = Taro.getCurrentInstance()?.router?.params ?? {}
    setTripId((params.tripId as string) ?? '')
  })

  const handleRoutesReady = useCallback(() => {
    if (doneRef.current) return
    doneRef.current = true
    if (pollingRef.current) clearInterval(pollingRef.current)
    setNavigating(true)
    // 清空已缓存路线，让 route-compare 重新拉取（或调用 createInstantPlan）
    useRouteStore.getState().setRoutes([])
    Taro.navigateTo({ url: '/pages/route-compare/index' })
  }, [])

  useEffect(() => {
    if (!tripId) return

    const poll = async () => {
      try {
        const data = await getTripWaitingStatus(tripId)
        setStatus(data)

        // 发起人：全员填完后触发路线生成（仅触发一次）
        if (data.all_done && !data.routes_ready && !planTriggeredRef.current) {
          const role = useSessionStore.getState().memberRole
          if (role === 'initiator') {
            planTriggeredRef.current = true
            planTrip(tripId).catch(e => console.error('[waiting-room] planTrip error:', e))
          }
        }

        if (data.routes_ready) {
          handleRoutesReady()
        }
      } catch (e) {
        console.error('[waiting-room] poll error:', e)
      }
    }

    poll()
    pollingRef.current = setInterval(poll, 5000)
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [tripId, handleRoutesReady])

  const handleCopyInvite = () => {
    const code = inviteCode || '—'
    Taro.setClipboardData({
      data: `我在拼程规划了一次行程，邀请你加入！邀请码：${code}`,
      success: () => Taro.showToast({ title: '邀请码已复制', icon: 'success', duration: 2000 }),
    })
  }

  const doneCount = status?.members.filter(m => m.status === 'done').length ?? 0
  const totalCount = status?.people_count ?? status?.members.length ?? 0

  return (
    <View className={styles.page}>
      {/* 进度条 */}
      <View className={styles.progressBar}>
        <View className={styles.progressStep}>
          <View className={`${styles.stepDot} ${styles.stepDotDone}`}>
            <Text className={`${styles.stepDotNum} ${styles.stepDotNumActive}`}>✓</Text>
          </View>
          <Text className={`${styles.stepLabel} ${styles.stepLabelDone}`}>了解偏好</Text>
        </View>
        <View className={`${styles.stepLine} ${styles.stepLineDone}`} />
        <View className={styles.progressStep}>
          <View className={`${styles.stepDot} ${styles.stepDotActive}`}>
            <Text className={`${styles.stepDotNum} ${styles.stepDotNumActive}`}>2</Text>
          </View>
          <Text className={`${styles.stepLabel} ${styles.stepLabelActive}`}>等待伙伴</Text>
        </View>
        <View className={`${styles.stepLine} ${styles.stepLineActive}`} />
        <View className={styles.progressStep}>
          <View className={styles.stepDot}>
            <Text className={styles.stepDotNum}>3</Text>
          </View>
          <Text className={styles.stepLabel}>生成路线</Text>
        </View>
      </View>

      <View className={styles.main}>
        <Text className={styles.title}>
          {navigating ? '正在生成路线...' : '等伙伴们填完偏好'}
        </Text>
        <Text className={styles.subtitle}>
          {navigating
            ? 'AI 正在为你们协调偏好，生成专属路线'
            : status
            ? `已有 ${doneCount} 人完成，还差 ${totalCount - doneCount} 人`
            : '加载中...'}
        </Text>

        {navigating ? (
          <View className={styles.generatingWrap}>
            <View className={styles.spinnerDots}>
              <View className={styles.spinnerDot} />
              <View className={styles.spinnerDot} />
              <View className={styles.spinnerDot} />
            </View>
          </View>
        ) : (
          <>
            {status ? (
              <View className={styles.memberList}>
                {status.members.map(m => (
                  <View key={m.user_id} className={styles.memberRow}>
                    <View className={`${styles.memberAvatar} ${m.status === 'done' ? styles.memberAvatarDone : ''}`}>
                      <Text className={styles.memberAvatarText}>{m.nickname[0]}</Text>
                    </View>
                    <Text className={styles.memberName}>{m.nickname}</Text>
                    <Text className={`${styles.memberStatus} ${styles[`memberStatus_${m.status}`]}`}>
                      {m.status === 'done' ? '已填完 ✓' : m.status === 'filling' ? '填写中...' : '未开始'}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <View className={styles.loadingWrap}>
                <Text className={styles.loadingText}>加载中...</Text>
              </View>
            )}

            <View className={styles.inviteBtn} onClick={handleCopyInvite}>
              <Text className={styles.inviteBtnText}>复制邀请码，催催他们</Text>
            </View>
          </>
        )}
      </View>
    </View>
  )
}
