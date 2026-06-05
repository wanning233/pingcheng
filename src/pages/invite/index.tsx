// src/pages/invite/index.tsx
import { useState, useEffect } from 'react'
import { View, Text } from '@tarojs/components'
import Taro, { useLoad, useDidShow } from '@tarojs/taro'
import styles from './index.module.scss'
import { useSessionStore } from '../../stores/useSessionStore'
import { useUserStore } from '../../stores/useUserStore'
import { listUserTrips, listSentInvites, UserTripSummary, SentInviteSummary } from '../../services/api'

export default function InvitePage() {
  const inviteCode = useSessionStore(s => s.inviteCode)
  const [activeTab, setActiveTab] = useState<'created' | 'joined'>('created')
  const [created, setCreated] = useState<SentInviteSummary[]>([])
  const [joined, setJoined] = useState<UserTripSummary[]>([])
  const [loading, setLoading] = useState(true)

  useLoad(() => {
    const params = Taro.getCurrentInstance()?.router?.params ?? {}
    if (params.tab === 'joined') setActiveTab('joined')
    else setActiveTab('created')
  })

  const fetchTrips = () => {
    const userId = useUserStore.getState().userId
    if (!userId) { setLoading(false); return }
    setLoading(true)
    Promise.all([
      listSentInvites(userId).catch(() => [] as SentInviteSummary[]),
      listUserTrips(userId, 'member').catch(() => [] as UserTripSummary[]),
    ]).then(([c, j]) => {
      setCreated(c)
      setJoined(j)
    }).finally(() => setLoading(false))
  }

  useEffect(() => { fetchTrips() }, [])

  // 每次页面重新显示时刷新，确保看到最新的 selected_route_id
  useDidShow(() => { fetchTrips() })

  const isNewTrip = !!inviteCode

  const handleCopyCode = (code: string) => {
    Taro.setClipboardData({
      data: `加入我在拼程创建的行程，邀请码：${code}`,
      success: () => Taro.showToast({ title: '邀请码已复制', icon: 'success', duration: 2000 }),
    })
  }

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.title}>行程</Text>
        <Text className={styles.subtitle}>我发起的 & 我参加的</Text>
      </View>

      {/* Tab 切换 */}
      <View className={styles.tabs}>
        <View
          className={`${styles.tab} ${activeTab === 'created' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('created')}
        >
          <Text className={`${styles.tabText} ${activeTab === 'created' ? styles.tabTextActive : ''}`}>
            我发起的
          </Text>
        </View>
        <View
          className={`${styles.tab} ${activeTab === 'joined' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('joined')}
        >
          <Text className={`${styles.tabText} ${activeTab === 'joined' ? styles.tabTextActive : ''}`}>
            我参加的
          </Text>
        </View>
      </View>

      {/* ── 我发起的 ── */}
      {activeTab === 'created' && (
        <View>
          {/* 当前新建行程卡片（刚从首页规划的） */}
          {isNewTrip && (
            <View className={styles.newTripCard}>
              <Text className={styles.newTripTitle}>行程已创建 🎉</Text>
              <Text className={styles.newTripCode}>邀请码：{inviteCode}</Text>
              <Text className={styles.newTripHint}>分享给朋友，等大家加入后一起填偏好</Text>
              <View className={styles.newTripActions}>
                <View className={styles.shareBtn} onClick={() => handleCopyCode(inviteCode ?? '')}>
                  <Text className={styles.shareBtnText}>复制邀请码</Text>
                </View>
                <View className={styles.fillPrefBtn} onClick={() => {
                  const tid = useSessionStore.getState().tripId
                  Taro.navigateTo({ url: `/pages/ai-questions/index?tripId=${tid}&role=initiator` })
                }}>
                  <Text className={styles.fillPrefBtnText}>我先填偏好</Text>
                </View>
              </View>
            </View>
          )}

          {loading ? (
            <View className={styles.empty}><Text className={styles.emptyDesc}>加载中...</Text></View>
          ) : created.length > 0 ? (
            <View className={styles.inviteList}>
              {created.map(invite => (
                <View key={invite.trip_id} className={styles.inviteCard}>
                  <View className={`${styles.statusBadge} ${invite.status === 'active' ? styles.statusActive : styles.statusClosed}`}>
                    <Text className={styles.statusText}>{invite.status === 'active' ? '进行中' : '已结束'}</Text>
                  </View>
                  <Text className={styles.inviteName}>{invite.display_title || invite.area}</Text>
                  <Text className={styles.inviteMeta}>{invite.city} · {invite.area}</Text>
                  <View className={styles.progressRow}>
                    <Text className={styles.progressText}>{invite.member_count} 人已加入</Text>
                  </View>
                  {invite.selected_route_id ? (
                    <View className={styles.routeReadyStrip} onClick={() =>
                      Taro.navigateTo({ url: `/pages/route-detail/index?routeId=${invite.selected_route_id}&tripId=${invite.trip_id}` })
                    }>
                      <Text className={styles.routeReadyDot} />
                      <Text className={styles.routeReadyText}>路线已选定，点击查看</Text>
                      <Text className={styles.routeReadyArrow}>→</Text>
                    </View>
                  ) : invite.status === 'active' && (
                    <View className={styles.inviteActions}>
                      <View className={styles.shareBtn} onClick={() => handleCopyCode(invite.invite_code)}>
                        <Text className={styles.shareBtnText}>复制邀请码</Text>
                      </View>
                    </View>
                  )}
                </View>
              ))}
            </View>
          ) : !isNewTrip ? (
            <View className={styles.empty}>
              <Text className={styles.emptyTitle}>还没有发起行程</Text>
              <Text className={styles.emptyDesc}>回首页规划一次行程，邀请朋友一起参与</Text>
            </View>
          ) : null}
        </View>
      )}

      {/* ── 我参加的 ── */}
      {activeTab === 'joined' && (
        <View>
          {loading ? (
            <View className={styles.empty}><Text className={styles.emptyDesc}>加载中...</Text></View>
          ) : joined.length > 0 ? (
            <View className={styles.inviteList}>
              {joined.map(trip => (
                <View key={trip.trip_id} className={styles.inviteCard}>
                  <View className={`${styles.statusBadge} ${trip.status === 'active' ? styles.statusActive : styles.statusClosed}`}>
                    <Text className={styles.statusText}>{trip.status === 'active' ? '进行中' : '已结束'}</Text>
                  </View>
                  <Text className={styles.inviteName}>{trip.display_title || trip.area}</Text>
                  <Text className={styles.inviteMeta}>{trip.city} · {trip.area}</Text>
                  <View className={styles.myStatusRow}>
                    <Text className={styles.myStatusLabel}>{trip.member_count} 人同行</Text>
                  </View>
                  {trip.selected_route_id && (
                    <View className={styles.routeReadyStrip} onClick={() =>
                      Taro.navigateTo({ url: `/pages/route-detail/index?routeId=${trip.selected_route_id}&tripId=${trip.trip_id}` })
                    }>
                      <Text className={styles.routeReadyDot} />
                      <Text className={styles.routeReadyText}>路线已选定，点击查看</Text>
                      <Text className={styles.routeReadyArrow}>→</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          ) : (
            <View className={styles.empty}>
              <Text className={styles.emptyTitle}>还没有参加行程</Text>
              <Text className={styles.emptyDesc}>收到邀请码后，在首页点击「加入行程」</Text>
            </View>
          )}
        </View>
      )}
    </View>
  )
}
