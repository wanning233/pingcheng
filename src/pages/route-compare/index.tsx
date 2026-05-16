// src/pages/route-compare/index.tsx
import { useState } from 'react'
import { View, Text, ScrollView, Map, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import RouteCard from '@/components/business/RouteCard'
import Icon from '@/components/base/Icon'
import { useRouteStore } from '@/stores/useRouteStore'
import { useSessionStore } from '@/stores/useSessionStore'
import { getPersonalizedRoutes } from '@/services/mock/routes'
import styles from './index.module.scss'

const STOP_COORDS: Record<string, { lat: number; lng: number }> = {
  's1': { lat: 31.2990, lng: 121.5120 },
  's2': { lat: 31.2978, lng: 121.5098 },
  's3': { lat: 31.2962, lng: 121.5085 },
  's4': { lat: 31.3025, lng: 121.5058 },
  's5': { lat: 31.2985, lng: 121.5025 },
  's6': { lat: 31.2998, lng: 121.5040 },
  's7': { lat: 31.3014, lng: 121.5145 },
  's8': { lat: 31.3005, lng: 121.5132 },
  's9': { lat: 31.2997, lng: 121.5118 },
}

const ROUTE_STOPS: Record<string, string[]> = {
  'route-1': ['s1', 's2', 's3'],
  'route-2': ['s4', 's5', 's6'],
  'route-3': ['s7', 's8', 's9'],
}

export default function RouteComparePage() {
  const selectedRouteId = useRouteStore(s => s.selectedRouteId)
  const selectRoute = useRouteStore(s => s.selectRoute)
  const { area, peopleCount, endTime, budgetPerPerson, sceneTags, categories } = useSessionStore(s => s)
  const routes = getPersonalizedRoutes({ sceneTags, categories, budgetPerPerson })

  const [expandedRouteId, setExpandedRouteId] = useState<string | null>(null)
  const expandedRoute = expandedRouteId ? routes.find(r => r.id === expandedRouteId) : null

  const sheetMapData = expandedRoute ? (() => {
    const ids = ROUTE_STOPS[expandedRoute.id] ?? []
    const coords = ids.map(id => STOP_COORDS[id]).filter(Boolean)
    return {
      markers: coords.map((c, i) => ({ id: i, latitude: c.lat, longitude: c.lng, width: 24, height: 24 })),
      polyline: coords.length >= 2 ? [{
        points: coords.map(c => ({ latitude: c.lat, longitude: c.lng })),
        color: '#FF6B2B', width: 5, arrowLine: true,
      }] : [],
      centerLat: coords[0]?.lat ?? 31.2990,
      centerLng: coords[0]?.lng ?? 121.5120,
    }
  })() : null

  const handleExpand = (id: string) => {
    setExpandedRouteId(id)
  }

  const handleSelectAndEnter = () => {
    if (expandedRouteId) {
      selectRoute(expandedRouteId)
      setExpandedRouteId(null)
      Taro.navigateTo({ url: `/pages/route-detail/index?routeId=${expandedRouteId}` })
    }
  }

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.titleSmall}>为你们生成了</Text>
        <Text className={styles.titleBig}>3 条路线</Text>
        <Text className={styles.subtitle}>{`${area || '出发地'} · ${peopleCount}人成行 · ${endTime}前结束`}</Text>
      </View>

      {/* 邀请好友一起选 */}
      <View className={styles.inviteBanner}>
        <View className={styles.inviteBannerLeft}>
          <Text className={styles.inviteBannerTitle}>叫好友一起来选</Text>
          <Text className={styles.inviteBannerSub}>分享路线，大家投票决定去哪</Text>
        </View>
        <Button className={styles.inviteBannerBtn} openType="share">
          <Text className={styles.inviteBannerBtnText}>分享</Text>
        </Button>
      </View>

      <View className={styles.list}>
        {routes.map((route, i) => (
          <View
            key={route.id}
            className={styles.cardWrap}
            style={{ animationDelay: `${i * 100 + 60}ms` }}
          >
            <RouteCard
              route={route}
              isSelected={selectedRouteId === route.id}
              onExpand={handleExpand}
            />
          </View>
        ))}
      </View>

      {/* 详情半屏 Sheet */}
      {expandedRoute && (
        <View className={styles.sheetMask} onClick={() => setExpandedRouteId(null)}>
          <View className={styles.sheet} onClick={e => e.stopPropagation()}>
            <View className={styles.sheetHandle} />

            {/* 地图大图 — 真实 Map */}
            <View className={styles.sheetMap}>
              {sheetMapData && (
                <Map
                  className={styles.sheetMapEl}
                  latitude={sheetMapData.centerLat}
                  longitude={sheetMapData.centerLng}
                  scale={14}
                  markers={sheetMapData.markers as any}
                  polyline={sheetMapData.polyline as any}
                  enableZoom={false}
                  enableScroll={false}
                  enableRotate={false}
                  style={{ width: '100%', height: '100%', display: 'block' }}
                />
              )}
              <View className={styles.sheetMapOverlay} />
              {expandedRoute.isAiRecommended && (
                <View className={styles.sheetBadge}>AI推荐</View>
              )}
            </View>

            <ScrollView scrollY className={styles.sheetBody}>
              {/* 路线名 + 数据 */}
              <Text className={styles.sheetName}>{expandedRoute.name}</Text>

              <View className={styles.sheetDataRow}>
                <View className={styles.sheetDataItem}>
                  <View className={styles.sheetDataValueRow}>
                    <Text className={styles.sheetDataValue}>{expandedRoute.budgetPerPerson}</Text>
                    <Text className={styles.sheetDataUnit}>¥</Text>
                  </View>
                  <Text className={styles.sheetDataLabel}>人均消费</Text>
                </View>
                <View className={styles.sheetDivider} />
                <View className={styles.sheetDataItem}>
                  <View className={styles.sheetDataValueRow}>
                    <Text className={styles.sheetDataValue}>{(expandedRoute.totalMinutes / 60).toFixed(1)}</Text>
                    <Text className={styles.sheetDataUnit}>h</Text>
                  </View>
                  <Text className={styles.sheetDataLabel}>总时长</Text>
                </View>
                <View className={styles.sheetDivider} />
                <View className={styles.sheetDataItem}>
                  <View className={styles.sheetDataValueRow}>
                    <Text className={styles.sheetDataValue}>{expandedRoute.walkDistanceM}</Text>
                    <Text className={styles.sheetDataUnit}>m</Text>
                  </View>
                  <Text className={styles.sheetDataLabel}>步行距离</Text>
                </View>
              </View>

              {/* 站点时间轴 */}
              <Text className={styles.sheetSectionTitle}>行程安排</Text>
              <View className={styles.timeline}>
                {expandedRoute.stops.map((stop, i) => (
                  <View key={stop.id} className={styles.timelineItem}>
                    <View className={styles.timelineDot} />
                    {i < expandedRoute.stops.length - 1 && (
                      <View className={styles.timelineLine} />
                    )}
                    <View className={styles.timelineContent}>
                      <Text className={styles.timelineName}>{stop.name}</Text>
                      <Text className={styles.timelineDuration}>约 {stop.stayMinutes} 分钟</Text>
                      <View className={styles.timelineTags}>
                        {stop.tags.map(t => (
                          <Text key={t} className={styles.timelineTag}>{t}</Text>
                        ))}
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>

            {/* 底部操作按钮 */}
            <View className={styles.sheetFooter}>
              <View className={styles.sheetBtn} onClick={handleSelectAndEnter}>
                <Text className={styles.sheetBtnText}>
                  {selectedRouteId === expandedRouteId ? '进入行程' : '选择并开始'}
                </Text>
                <Icon name="chevron-right" size={18} color="#fff" />
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}
