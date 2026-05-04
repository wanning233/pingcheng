// src/pages/route-detail/index.tsx
import { View, ScrollView } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useState, useCallback } from 'react'
import MapWindow from '@/components/business/MapWindow'
import Timeline from '@/components/business/Timeline'
import PlanBSheet from '@/components/business/PlanBSheet'
import SwapStopSheet, { AlternativeStop } from '@/components/business/SwapStopSheet'
import { getRouteDetailMock } from '@/services/mock/routes'
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

  const [mapCollapsed, setMapCollapsed] = useState(false)
  const [swapStop, setSwapStop] = useState<{ name: string; alternatives: AlternativeStop[] } | null>(null)

  const handleScroll = useCallback((e: any) => {
    const scrollTop = e.detail?.scrollTop ?? 0
    setMapCollapsed(scrollTop > 60)
  }, [])

  const handleExpandFullscreen = () => {
    Taro.navigateTo({ url: `/pages/map-fullscreen/index?routeId=${routeId}` })
  }

  const handleNavigate = () => {
    Taro.showToast({ title: '打开导航', icon: 'none' })
  }

  const handleSwap = useCallback((stop: any) => {
    setSwapStop({ name: stop.name, alternatives: getAlternatives(stop.name) })
  }, [])

  const handleSelectAlt = useCallback((alt: AlternativeStop) => {
    setSwapStop(null)
    Taro.showToast({ title: `已换成「${alt.name}」`, icon: 'success' })
  }, [])

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
            stops={route.stops as any}
            onNavigate={handleNavigate}
            onGetTicket={(stop) => Taro.showToast({ title: `取号：${stop.name}`, icon: 'none' })}
            onSwap={handleSwap}
          />
          <View className={styles.bottomPad} />
        </View>
      </ScrollView>

      <PlanBSheet
        visible
        onNavigate={handleNavigate}
        onCallAI={() => handleCallAI()}
      />

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
