// src/pages/invite/index.tsx
import { View, Text, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import styles from './index.module.scss'
import { useSessionStore } from '../../stores/useSessionStore'

const MOCK_SENT_INVITES = [
  {
    id: 'inv-1',
    tripName: '五角场下午局',
    area: '五角场 · 上海',
    date: '5月3日（周日）下午',
    joinedCount: 3,
    maxPeople: 4,
    status: 'active' as const,
  },
  {
    id: 'inv-2',
    tripName: '南京路探店',
    area: '南京路 · 上海',
    date: '4月28日（周一）上午',
    joinedCount: 2,
    maxPeople: 3,
    status: 'closed' as const,
  },
]

export default function InvitePage() {
  const inviteCode = useSessionStore(s => s.inviteCode)
  const isNewTrip = !!inviteCode
  const tripCode = inviteCode

  const handleCreate = () => {
    Taro.navigateBack()
  }

  // const handleShare = (invite: typeof MOCK_SENT_INVITES[0]) => {
  //   Taro.showShareMenu({ withShareTicket: true })
  // }

  return (
    <View className={styles.page}>

      {/* 顶部标题区 */}
      <View className={styles.header}>
        <Text className={styles.title}>邀请</Text>
        <Text className={styles.subtitle}>叫上朋友，一起出发</Text>
      </View>

      {/* 新行程卡片 */}
      {isNewTrip && (
        <View className={styles.newTripCard}>
          <Text className={styles.newTripTitle}>行程已创建 🎉</Text>
          <Text className={styles.newTripCode}>邀请码：{tripCode}</Text>
          <Text className={styles.newTripHint}>分享给朋友，等大家加入后一起填偏好</Text>
          <View className={styles.newTripActions}>
            <Button className={styles.shareBtn} openType="share">
              <Text className={styles.shareBtnText}>分享邀请</Text>
            </Button>
            <View className={styles.fillPrefBtn} onClick={() => Taro.navigateTo({ url: '/pages/preference/index' })}>
              <Text className={styles.fillPrefBtnText}>我先填偏好</Text>
            </View>
          </View>
        </View>
      )}

      {/* 发起邀请 CTA */}
      <View className={styles.createCard} onClick={handleCreate}>
        <View className={styles.createIconWrap}>
          {/* + 图标 */}
          <View className={styles.createIconH} />
          <View className={styles.createIconV} />
        </View>
        <View className={styles.createInfo}>
          <Text className={styles.createTitle}>发起新行程</Text>
          <Text className={styles.createDesc}>AI 帮你们协调偏好，生成路线</Text>
        </View>
        <Text className={styles.createChevron}>›</Text>
      </View>

      {/* 已发出的邀请 */}
      {MOCK_SENT_INVITES.length > 0 && (
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>已发出的邀请</Text>
          <View className={styles.inviteList}>
            {MOCK_SENT_INVITES.map(invite => (
              <View key={invite.id} className={styles.inviteCard}>
                {/* 状态徽章 */}
                <View className={`${styles.statusBadge} ${invite.status === 'active' ? styles.statusActive : styles.statusClosed}`}>
                  <Text className={styles.statusText}>{invite.status === 'active' ? '进行中' : '已结束'}</Text>
                </View>

                <Text className={styles.inviteName}>{invite.tripName}</Text>
                <Text className={styles.inviteMeta}>{invite.area} · {invite.date}</Text>

                {/* 人数进度 */}
                <View className={styles.progressRow}>
                  <View className={styles.progressTrack}>
                    <View
                      className={styles.progressFill}
                      style={{ width: `${(invite.joinedCount / invite.maxPeople) * 100}%` } as any}
                    />
                  </View>
                  <Text className={styles.progressText}>{invite.joinedCount}/{invite.maxPeople} 人已加入</Text>
                </View>

                {/* 操作按钮 */}
                {invite.status === 'active' && (
                  <View className={styles.inviteActions}>
                    <Button className={styles.shareBtn} openType="share">
                      <Text className={styles.shareBtnText}>再次分享</Text>
                    </Button>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>
      )}

      {/* 空状态 */}
      {MOCK_SENT_INVITES.length === 0 && (
        <View className={styles.empty}>
          <View className={styles.emptyIconWrap}>
            {/* 信封图标 */}
            <View className={styles.emptyEnvelope}>
              <View className={styles.emptyEnvelopeFlap} />
            </View>
          </View>
          <Text className={styles.emptyTitle}>还没有发出邀请</Text>
          <Text className={styles.emptyDesc}>发起行程后，邀请朋友一起参与</Text>
        </View>
      )}

    </View>
  )
}
