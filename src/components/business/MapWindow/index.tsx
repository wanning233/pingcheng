// src/components/business/MapWindow/index.tsx
import { View, Text } from '@tarojs/components'
import styles from './index.module.scss'

// SDK集成标志：npm install @map-component/tmap-miniapp 失败时保持 false
const USE_TMAP_SDK = false

interface MapWindowProps {
  collapsed: boolean
  routeId: string
  useSdkMap?: boolean  // 外部可覆盖，默认使用模块级常量
  onExpandFullscreen?: () => void
}

// 静态图回退组件
function StaticMapView() {
  return <View className={styles.mapPlaceholder} />
}

export default function MapWindow({
  collapsed,
  routeId,
  useSdkMap = USE_TMAP_SDK,
  onExpandFullscreen,
}: MapWindowProps) {
  return (
    <View
      className={styles.window}
      style={{
        height: collapsed ? '56px' : '33vh',
        transition: 'height 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* 地图主体 */}
      <View className={styles.mapContent}>
        <StaticMapView />
      </View>

      {/* 折叠态横向路线缩略 */}
      {collapsed && (
        <View className={styles.collapsedBar}>
          <Text className={styles.collapsedText}>路线预览</Text>
          <View className={styles.collapsedLine} />
        </View>
      )}

      {/* 右上角展开按钮 */}
      <View className={styles.expandBtn} onClick={onExpandFullscreen}>
        <Text className={styles.expandText}>{collapsed ? '展开' : '全屏'}</Text>
      </View>
    </View>
  )
}
