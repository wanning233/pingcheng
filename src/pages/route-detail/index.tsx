// src/pages/route-detail/index.tsx
import { View, ScrollView } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useState, useCallback } from 'react'
import MapWindow from '@/components/business/MapWindow'
import Timeline from '@/components/business/Timeline'
import PlanBSheet from '@/components/business/PlanBSheet'
import { getRouteDetailMock } from '@/services/mock/routes'
import styles from './index.module.scss'

// SDK集成结果标志（Task 4验证后更新此值）
const USE_TMAP_SDK = false

export default function RouteDetailPage() {
  const router = useRouter()
  const routeId = router.params.routeId || 'route-3'
  const route = getRouteDetailMock(routeId)

  const [mapCollapsed, setMapCollapsed] = useState(false)

  // ScrollView滚动时折叠地图
  const handleScroll = useCallback((e: any) => {
    const scrollTop = e.detail?.scrollTop ?? 0
    setMapCollapsed(scrollTop > 60)
  }, [])

  const handleExpandFullscreen = () => {
    Taro.navigateTo({ url: '/pages/map-fullscreen/index' })
  }

  const handleNavigate = () => {
    // 触发系统导航（接入高德/腾讯导航SDK时扩展）
    Taro.showToast({ title: '打开导航', icon: 'none' })
  }

  const handleCallAI = () => {
    Taro.navigateTo({ url: '/pages/assistant/index' })
  }

  if (!route) {
    return <View className={styles.page} />
  }

  return (
    <View className={styles.page}>
      {/* 地图小窗（固定在顶部，不随ScrollView滚动） */}
      <MapWindow
        collapsed={mapCollapsed}
        routeId={routeId}
        useSdkMap={USE_TMAP_SDK}
        onExpandFullscreen={handleExpandFullscreen}
      />

      {/* 主内容滚动区 */}
      <ScrollView
        scrollY
        className={styles.scrollView}
        style={{ marginTop: mapCollapsed ? '56px' : '33vh' }}
        onScroll={handleScroll}
      >
        {/* 时间轴 */}
        <View className={styles.content}>
          <Timeline
            stops={route.stops as any}
            onNavigate={handleNavigate}
            onGetTicket={(stop) => Taro.showToast({ title: `取号：${stop.name}`, icon: 'none' })}
            onSwap={(stop) => Taro.showToast({ title: `换一家：${stop.name}`, icon: 'none' })}
          />
          {/* 底部安全区 */}
          <View className={styles.bottomPad} />
        </View>
      </ScrollView>

      {/* 底部浮层 */}
      <PlanBSheet
        visible
        onNavigate={handleNavigate}
        onCallAI={handleCallAI}
      />
    </View>
  )
}
