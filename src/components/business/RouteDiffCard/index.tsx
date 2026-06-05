// src/components/business/RouteDiffCard/index.tsx
import { View, Text } from '@tarojs/components'
import React, { useState, useEffect } from 'react'
import styles from './index.module.scss'
import routeDiffData from '@/services/mock/routeDiff.json'
import { ReplanDiff } from '@/services/api'

type TimeStatus = 'safe' | 'overtime' | 'rescued'

const TEAMMATES = ['小林', '阿珠', '老王']

interface RouteDiffCardProps {
  timeStatus?: TimeStatus
  visible?: boolean
  onAccept?: () => void
  onDecline?: () => void
  /** 真实 replan diff；传入时忽略 mock 数据 */
  replanDiff?: ReplanDiff
  /** 新路线名称，用于按钮文案 */
  newRouteName?: string
  /** 同行人昵称列表，用于通知动画 */
  teammates?: string[]
}

const STATUS_HEADER_COLOR: Record<TimeStatus, string> = {
  safe: '#00C9A7',
  overtime: '#FFB800',
  rescued: '#111111',
}

export default function RouteDiffCard({
  timeStatus,
  visible = false,
  onAccept,
  onDecline,
  replanDiff,
  newRouteName,
  teammates,
}: RouteDiffCardProps) {
  const [cardVisible, setCardVisible] = useState(false)
  const [leftVisible, setLeftVisible] = useState(false)
  const [rightVisible, setRightVisible] = useState(false)
  const [buttonsVisible, setButtonsVisible] = useState(false)
  const [notifying, setNotifying] = useState(false)
  const [notifiedCount, setNotifiedCount] = useState(0)

  // 用真实数据或回退到 mock
  const isReal = !!replanDiff
  const toName = isReal
    ? (replanDiff!.replaced?.[0]?.to_name ?? newRouteName ?? '新地点')
    : routeDiffData.planBStop.name
  const fromName = isReal
    ? (replanDiff!.replaced?.[0]?.from_name ?? '当前站点')
    : routeDiffData.currentStop.name
  const aiRec = isReal ? replanDiff!.summary : routeDiffData.aiRecommendation
  const benefitItems = isReal
    ? replanDiff!.benefits.slice(0, 3)
    : [
        { label: '时间节省', value: `+${routeDiffData.gains.savedMinutes}分钟` },
        { label: '人均节省', value: `-¥${routeDiffData.gains.savedPricePerPerson}` },
      ]
  const tradeoffItems = isReal
    ? replanDiff!.tradeoffs.slice(0, 3)
    : [
        { label: '评分变化', value: `-${routeDiffData.costs.ratingDrop}★` },
        { label: '步行增加', value: `+${routeDiffData.costs.extraWalkMeters}米` },
      ]
  const resolvedTimeStatus: TimeStatus =
    timeStatus ??
    (isReal
      ? replanDiff!.saved_minutes > 0 ? 'rescued' : (replanDiff!.budget_change <= 0 ? 'safe' : 'safe')
      : routeDiffData.timeStatus as TimeStatus)
  const notifyList = teammates?.length ? teammates : TEAMMATES
  const savedMinutes = isReal ? replanDiff!.saved_minutes : routeDiffData.gains.savedMinutes

  useEffect(() => {
    if (!visible) {
      setCardVisible(false)
      setLeftVisible(false)
      setRightVisible(false)
      setButtonsVisible(false)
      return
    }
    // Staggered entrance: 0ms card, 300ms left, 350ms right, 500ms buttons
    setCardVisible(true)
    const t1 = setTimeout(() => setLeftVisible(true), 300)
    const t2 = setTimeout(() => setRightVisible(true), 350)
    const t3 = setTimeout(() => setButtonsVisible(true), 500)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [visible])

  const handleAccept = () => {
    setNotifying(true)
    setNotifiedCount(0)
    notifyList.forEach((_, i) => {
      setTimeout(() => {
        setNotifiedCount(i + 1)
        if (i === notifyList.length - 1) {
          setTimeout(() => onAccept?.(), 800)
        }
      }, (i + 1) * 600)
    })
  }

  const headerColor = STATUS_HEADER_COLOR[resolvedTimeStatus]
  const isRescued = resolvedTimeStatus === 'rescued'
  const isOvertime = resolvedTimeStatus === 'overtime'
  const isSafe = resolvedTimeStatus === 'safe'

  return (
    <View
      className={styles.card}
      style={{
        visibility: visible ? 'visible' : 'hidden',
        opacity: cardVisible ? 1 : 0,
        transform: cardVisible ? 'translateY(0)' : 'translateY(60px)',
        transition: 'opacity 400ms cubic-bezier(0.4,0,0.2,1), transform 400ms cubic-bezier(0.4,0,0.2,1)',
        pointerEvents: visible ? 'auto' : 'none',
      } as any}
    >
      {/* Header */}
      <View className={styles.header} style={{ background: headerColor } as any}>
        <View className={styles.headerLeft}>
          <Text className={styles.headerTitle}>路线变更建议</Text>
          <Text className={styles.headerSub}>
            {isRescued ? '换了能准时！' : isOvertime ? '两条路都会超时' : '换了更好'}
          </Text>
        </View>
        <View className={styles.headerRight}>
          <Text className={styles.timeLabel}>
            {isRescued ? '⚡ 建议换' : isOvertime ? '⚠️ 注意' : '✓ 安全'}
          </Text>
        </View>
      </View>

      {/* Banner */}
      {isRescued && (
        <View className={styles.bannerGreen}>
          <Text className={styles.bannerText}>换了能准时！节省 {savedMinutes} 分钟</Text>
        </View>
      )}
      {isOvertime && (
        <View className={styles.bannerYellow}>
          <Text className={styles.bannerText}>两条路线都会超时，请选择超时较少的方案</Text>
        </View>
      )}

      {/* Route comparison */}
      <View className={styles.comparison}>
        {/* Left: gains */}
        <View
          className={styles.gainSide}
          style={{
            opacity: leftVisible ? 1 : 0,
            transform: leftVisible ? 'translateY(0)' : 'translateY(12px)',
            transition: 'opacity 300ms ease, transform 300ms ease',
          } as any}
        >
          <Text className={styles.sideLabel}>得到</Text>
          {benefitItems.map((item, i) => (
            <View key={i} className={styles.sideItem}>
              <Text className={styles.sideValue}>{item.value}</Text>
              <Text className={styles.sideDesc}>{item.label}</Text>
            </View>
          ))}
          <View className={styles.routeBox}>
            <Text className={styles.routeName}>{toName}</Text>
          </View>
        </View>

        <View className={styles.divider} />

        {/* Right: costs */}
        <View
          className={styles.costSide}
          style={{
            opacity: rightVisible ? 1 : 0,
            transform: rightVisible ? 'translateY(0)' : 'translateY(12px)',
            transition: 'opacity 300ms ease, transform 300ms ease',
          } as any}
        >
          <Text className={styles.sideLabel}>失去</Text>
          {tradeoffItems.map((item, i) => (
            <View key={i} className={styles.sideItem}>
              <Text className={styles.sideValueNeg}>{item.value}</Text>
              <Text className={styles.sideDesc}>{item.label}</Text>
            </View>
          ))}
          <View className={styles.routeBox}>
            <Text className={styles.routeName}>{fromName}</Text>
          </View>
        </View>
      </View>

      {/* AI recommendation */}
      <View className={styles.aiRec}>
        <Text className={styles.aiRecText}>{aiRec}</Text>
      </View>

      {/* Buttons / Notifying state */}
      <View
        className={styles.buttons}
        style={{
          opacity: buttonsVisible ? 1 : 0,
          transform: buttonsVisible ? 'translateY(0)' : 'translateY(10px)',
          transition: 'opacity 250ms ease, transform 250ms ease',
          pointerEvents: buttonsVisible ? 'auto' : 'none',
        } as any}
      >
        {notifying ? (
          /* ── 通知队友进度 ── */
          <View className={styles.notifyPanel}>
            <Text className={styles.notifyTitle}>
              {notifiedCount < TEAMMATES.length ? '正在通知队友…' : '✓ 已通知所有人'}
            </Text>
            <View className={styles.notifyList}>
              {TEAMMATES.map((name, i) => (
                <View key={name} className={styles.notifyItem}>
                  <View className={styles.notifyAvatar}>
                    <Text className={styles.notifyAvatarText}>{name[0]}</Text>
                  </View>
                  <Text className={styles.notifyName}>{name}</Text>
                  <View className={i < notifiedCount ? styles.notifyDone : styles.notifyPending}>
                    <Text className={styles.notifyStatus}>
                      {i < notifiedCount ? '已通知' : '…'}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
            <Text className={styles.notifyDesc}>
              路线已更新为「{toName}」，所有人手机已收到新路线
            </Text>
          </View>
        ) : (
          <>
            {isSafe && (
              <>
                <View className={styles.btnAccentFull} onClick={handleAccept}>
                  <Text className={styles.btnText}>切换到{toName}</Text>
                </View>
                <View className={styles.btnGhost} onClick={onDecline}>
                  <Text className={styles.btnTextSecondary}>维持原路线</Text>
                </View>
              </>
            )}
            {isOvertime && (
              <>
                <View className={styles.btnHalf} onClick={handleAccept}>
                  <Text className={styles.btnText}>知道会晚，换</Text>
                </View>
                <View className={styles.btnHalfGhost} onClick={onDecline}>
                  <Text className={styles.btnTextSecondary}>知道会晚，不换</Text>
                </View>
              </>
            )}
            {isRescued && (
              <>
                <View className={styles.btnPrimaryFull} onClick={handleAccept}>
                  <Text className={styles.btnText}>立刻换！去{toName}</Text>
                </View>
                <View className={styles.btnGhost} onClick={onDecline}>
                  <Text className={styles.btnTextDanger}>维持原路线</Text>
                </View>
              </>
            )}
          </>
        )}
      </View>
    </View>
  )
}
