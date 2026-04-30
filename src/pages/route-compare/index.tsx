// src/pages/route-compare/index.tsx
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useEffect } from 'react'
import RouteCard from '@/components/business/RouteCard'
import FloatingBar from '@/components/business/FloatingBar'
import { useRouteStore } from '@/stores/useRouteStore'
import { mockRoutes } from '@/services/mock/routes'
import styles from './index.module.scss'

export default function RouteComparePage() {
  const [visible, setVisible] = useState([false, false, false])
  const selectedRouteId = useRouteStore(s => s.selectedRouteId)

  // 三张卡片stagger入场：每张延迟120ms
  useEffect(() => {
    mockRoutes.forEach((_, i) => {
      setTimeout(() => {
        setVisible(prev => {
          const next = [...prev]
          next[i] = true
          return next
        })
      }, i * 120 + 100)
    })
  }, [])

  const handleEnter = () => {
    if (!selectedRouteId) return
    Taro.navigateTo({ url: `/pages/route-detail/index?routeId=${selectedRouteId}` })
  }

  const selectedRoute = mockRoutes.find(r => r.id === selectedRouteId)

  return (
    <View className={styles.page}>
      {/* 页面标题 */}
      <View className={styles.header}>
        <Text className={styles.title}>为你们生成了3条路线</Text>
        <Text className={styles.subtitle}>五角场出发 · 4人成行 · 下午出游</Text>
      </View>

      {/* 路线卡片列表 */}
      <View className={styles.list}>
        {mockRoutes.map((route, i) => (
          <View
            key={route.id}
            className={styles.cardWrap}
            style={{
              transform: visible[i] ? 'translateY(0)' : 'translateY(20px)',
              opacity: visible[i] ? 1 : 0,
              transition: `transform 400ms cubic-bezier(0.34,1.56,0.64,1), opacity 400ms ease`,
              transitionDelay: `${i * 40}ms`,
            }}
          >
            <RouteCard
              route={route}
              isSelected={selectedRouteId === route.id}
            />
          </View>
        ))}
      </View>

      {/* 底部悬浮操作栏 - 留出空间 */}
      <View className={styles.bottomPlaceholder} />

      {/* 悬浮Bar */}
      <FloatingBar
        label={selectedRoute ? `进入「${selectedRoute.name}」` : '选择一条路线'}
        disabled={!selectedRouteId}
        onClick={handleEnter}
      />
    </View>
  )
}
