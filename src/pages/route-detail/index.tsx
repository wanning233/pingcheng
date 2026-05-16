// src/pages/route-detail/index.tsx
import { View, ScrollView, Text } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useState, useCallback, useEffect, useRef } from 'react'
import MapWindow from '@/components/business/MapWindow'
import Timeline from '@/components/business/Timeline'
import PlanBSheet from '@/components/business/PlanBSheet'
import SwapStopSheet, { AlternativeStop } from '@/components/business/SwapStopSheet'
import { getRouteDetailMock } from '@/services/mock/routes'
import { useRouteStore } from '@/stores/useRouteStore'
import styles from './index.module.scss'

const USE_TMAP_SDK = false

// Mock alternatives per stop (keyed by stop name keyword)
const STOP_ALTERNATIVES: Record<string, AlternativeStop[]> = {
  default: [
    {
      id: 'alt-1',
      name: '弄堂里湖南菜',
      category: '湘菜 · 小馆子',
      walkMinutes: 6,
      waitMinutes: 5,
      reason: '评分4.8，人均68元，现在几乎不用等',
    },
    {
      id: 'alt-2',
      name: '老上海本帮菜馆',
      category: '本帮菜 · 经典',
      walkMinutes: 8,
      waitMinutes: 10,
      reason: '本地老字号，菜量足，团队适合',
    },
    {
      id: 'alt-3',
      name: '云南过桥米线',
      category: '云南菜 · 特色',
      walkMinutes: 4,
      waitMinutes: 0,
      reason: '无需排队，人均45元，适合赶时间',
    },
  ],
}

function getAlternatives(stopName: string): AlternativeStop[] {
  for (const key of Object.keys(STOP_ALTERNATIVES)) {
    if (key !== 'default' && stopName.includes(key)) return STOP_ALTERNATIVES[key]
  }
  return STOP_ALTERNATIVES.default
}

export default function RouteDetailPage() {
  const router = useRouter()
  const routeId = router.params.routeId || 'route-3'
  const route = getRouteDetailMock(routeId)

  const { modifiedStops, setModifiedStops, swapStop: swapStopInStore } = useRouteStore()
  const [mapCollapsed, setMapCollapsed] = useState(false)
  const [swapStop, setSwapStop] = useState<{ name: string; index: number; alternatives: AlternativeStop[] } | null>(null)
  const [tripEnded, setTripEnded] = useState(false)

  // 防抖计时器引用
  const scrollTimerRef = useRef<number | null>(null)

  // 确保 modifiedStops 正确初始化
  useEffect(() => {
    if (route?.stops && modifiedStops.length === 0) {
      setModifiedStops(route.stops)
    }
  }, [route, modifiedStops.length, setModifiedStops])

  const handleScroll = useCallback((e: any) => {
    // 行程结束后不再响应滚动事件
    if (tripEnded) return

    // 清除之前的防抖计时器
    if (scrollTimerRef.current) {
      clearTimeout(scrollTimerRef.current)
    }

    const scrollTop = e.detail?.scrollTop ?? 0

    // 使用防抖，避免频繁触发状态更新导致地图不停放大缩小
    scrollTimerRef.current = window.setTimeout(() => {
      const shouldCollapse = scrollTop > 60
      if (shouldCollapse !== mapCollapsed) {
        setMapCollapsed(shouldCollapse)
      }
    }, 100)
  }, [tripEnded, mapCollapsed])

  const handleExpandFullscreen = () => {
    Taro.navigateTo({ url: `/pages/map-fullscreen/index?routeId=${routeId}` })
  }

  const [navigating, setNavigating] = useState(false)

  const handleNavigate = (stop?: any) => {
    const targetStop = stop || modifiedStops.find((s: any) => s.status === 'current')

    if (!targetStop) {
      Taro.showToast({ title: '没有找到导航目标', icon: 'none' })
      return
    }

    setNavigating(true)

    // 检查是否在开发者工具中（无法调用真实导航）
    Taro.getSystemInfo({
      success: (res) => {
        // 在开发者工具中显示模拟导航
        if (res.platform === 'devtools') {
          setNavigating(false)
          Taro.showModal({
            title: '导航模拟',
            content: `正在导航到「${targetStop.name}」\n\n📍 地址：上海市杨浦区\n🚶 预计步行时间：${targetStop.walkMinutes || 10}分钟\n⏱️ 停留时间：${targetStop.stayMinutes}分钟`,
            showCancel: false,
            confirmText: '开始导航',
          })
          return
        }

        // 真机环境：调用真实导航
        Taro.openLocation({
          latitude: 31.2304,
          longitude: 121.4737,
          name: targetStop.name,
          address: '上海市杨浦区',
          scale: 18,
          success: () => {
            Taro.showToast({ title: `正在导航到「${targetStop.name}」`, icon: 'success' })
          },
          fail: (err) => {
            console.error('导航失败:', err)
            setNavigating(false)
            Taro.showModal({
              title: '导航提示',
              content: `正在为您导航到「${targetStop.name}」，预计步行${targetStop.walkMinutes || 10}分钟`,
              showCancel: false,
            })
          },
          complete: () => {
            setNavigating(false)
          }
        })
      },
      fail: () => {
        // 获取系统信息失败，使用降级方案
        setNavigating(false)
        Taro.showModal({
          title: '导航提示',
          content: `正在为您导航到「${targetStop.name}」，预计步行${targetStop.walkMinutes || 10}分钟`,
          showCancel: false,
        })
      }
    })
  }

  const handleSwap = useCallback((stop: any, index: number) => {
    setSwapStop({ name: stop.name, index, alternatives: getAlternatives(stop.name) })
  }, [])

  const handleSelectAlt = useCallback((alt: AlternativeStop) => {
    if (swapStop === null) return

    const originalStop = modifiedStops[swapStop.index]
    swapStopInStore(swapStop.index, {
      id: alt.id,
      name: alt.name,
      tags: [alt.category.split(' · ')[0] || '其他'],
      walkMinutes: alt.walkMinutes,
      stayMinutes: originalStop?.stayMinutes || 60,
    } as any)

    setSwapStop(null)
    Taro.showToast({ title: `已换成「${alt.name}」`, icon: 'success' })
  }, [swapStop, modifiedStops, swapStopInStore])

  const handleCallAI = (stopName?: string) => {
    const params = stopName
      ? `/pages/assistant/index?stopName=${encodeURIComponent(stopName)}&routeId=${routeId}`
      : `/pages/assistant/index?routeId=${routeId}`
    Taro.navigateTo({ url: params })
  }

  if (!route) {
    return <View className={styles.page} />
  }

  return (
    <View className={styles.page}>
      <MapWindow
        collapsed={mapCollapsed}
        routeId={routeId}
        useSdkMap={USE_TMAP_SDK}
        onExpandFullscreen={handleExpandFullscreen}
      />

      <ScrollView
        scrollY
        className={styles.scrollView}
        onScroll={handleScroll}
      >
        <View className={styles.content}>
          <Timeline
            stops={modifiedStops}
            onNavigate={(stop) => handleNavigate(stop)}
            onGetTicket={(stop) => Taro.showToast({ title: `取号：${stop.name}`, icon: 'none' })}
            onSwap={handleSwap}
          />
          <View className={styles.endTrigger} onClick={() => setTripEnded(true)}>
            <Text className={styles.endTriggerText}>结束行程</Text>
          </View>
          <View className={styles.bottomPad} />
        </View>
      </ScrollView>

      <PlanBSheet
        visible={!tripEnded}
        onNavigate={handleNavigate}
        onCallAI={() => handleCallAI()}
      />

      {/* 行程结束弹窗 */}
      {tripEnded && (
        <View className={styles.endOverlay}>
          <View className={styles.endOverlayBg} />
          <View className={styles.endSheet}>
            <View className={styles.endSheetHandle} />
            <Text className={styles.endEmoji}>🎉</Text>
            <Text className={styles.endTitle}>今天玩得怎么样？</Text>
            <Text className={styles.endSub}>和朋友一起记录这次行程</Text>
            <View className={styles.endActions}>
              <View
                className={styles.endBtnPrimary}
                onClick={() => Taro.navigateBack({ delta: 10 })}
              >
                <Text className={styles.endBtnPrimaryText}>再来一次</Text>
              </View>
              <View
                className={styles.endBtnSecondary}
                onClick={() => Taro.showToast({ title: '分享功能即将上线', icon: 'none' })}
              >
                <Text className={styles.endBtnSecondaryText}>分享给朋友</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Swap stop sheet (Plan B) */}
      <SwapStopSheet
        visible={swapStop !== null}
        stopName={swapStop?.name ?? ''}
        alternatives={swapStop?.alternatives ?? []}
        onSelect={handleSelectAlt}
        onDismiss={() => setSwapStop(null)}
        onCallAI={() => {
          setSwapStop(null)
          handleCallAI(swapStop?.name)
        }}
      />
    </View>
  )
}
