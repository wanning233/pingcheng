# 拼程小程序 Plan B：路线对比页 + 路线详情页

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现路线对比页（首个可运行页面，验证卡片动效）和路线详情页（含腾讯地图SDK集成、时间轴、Plan B弹层）。

**Architecture:** route-compare在主包，route-detail在分包（含腾讯地图SDK）。地图SDK第一天验证，失败回退静态图+原生map页。

**Tech Stack:** Taro 3.6.x, React 18, TypeScript, NutUI-React 2.x, @map-component/tmap-miniapp, CSS Modules + SCSS

---

### Task 1: RouteCard组件

**Files:**
- Create: `src/components/business/RouteCard/index.tsx`
- Create: `src/components/business/RouteCard/index.module.scss`

- [ ] **Step 1: 创建RouteCard组件**

```tsx
// src/components/business/RouteCard/index.tsx
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import cx from 'classnames'
import styles from './index.module.scss'
import { useRouteStore } from '@/stores/useRouteStore'

interface RouteData {
  id: string
  name: string
  budgetPerPerson: number
  totalMinutes: number
  walkDistanceM: number
  highlights: string[]
  isAiRecommended?: boolean
}

interface RouteCardProps {
  route: RouteData
  isSelected?: boolean
  visibleIndex?: number  // 用于stagger动效
}

function DataItem({ value, unit, prefix }: { value: string | number; unit: string; prefix?: boolean }) {
  return (
    <View className={styles.dataItem}>
      {prefix && <Text className={styles.dataUnit}>{unit}</Text>}
      <Text className={styles.dataValue}>{value}</Text>
      {!prefix && <Text className={styles.dataUnit}>{unit}</Text>}
    </View>
  )
}

function Tag({ children }: { children: string }) {
  return <View className={styles.tag}>{children}</View>
}

export default function RouteCard({ route, isSelected = false, visibleIndex }: RouteCardProps) {
  const isRecommended = !!route.isAiRecommended
  const setTransitionRect = useRouteStore(s => s.setTransitionRect)
  const setSelectedRouteId = useRouteStore(s => s.setSelectedRouteId)

  const handleTap = () => {
    setSelectedRouteId(route.id)
    // 记录卡片位置供转场动效使用
    const query = Taro.createSelectorQuery()
    query.select(`#route-card-${route.id}`).boundingClientRect((rect) => {
      if (rect) setTransitionRect(rect as any)
    }).exec()
  }

  return (
    <View
      id={`route-card-${route.id}`}
      className={cx(
        styles.card,
        isRecommended && styles.recommend,
        isSelected && styles.selected
      )}
      onClick={handleTap}
      style={{ transform: isRecommended ? 'scale(1.04)' : 'scale(1)' }}
    >
      {/* 顶部4px渐变色条 */}
      <View className={cx(styles.topStripe, isRecommended && styles.topStripeAi)} />
      {/* AI推荐角标 */}
      {isRecommended && <View className={styles.badge}>AI推荐</View>}
      {/* 地图路线缩略图占位 */}
      <View className={styles.mapThumb} />
      {/* 卡片内容区 */}
      <View className={styles.body}>
        <Text className={styles.name}>{route.name}</Text>
        <View className={styles.dataRow}>
          <DataItem value={route.budgetPerPerson} unit="¥" prefix />
          <DataItem value={(route.totalMinutes / 60).toFixed(1)} unit="h" />
          <DataItem value={route.walkDistanceM} unit="m" />
        </View>
        <ScrollView scrollX className={styles.tags}>
          {route.highlights.map(t => <Tag key={t}>{t}</Tag>)}
        </ScrollView>
      </View>
    </View>
  )
}
```

- [ ] **Step 2: 创建RouteCard样式**

```scss
// src/components/business/RouteCard/index.module.scss
.card {
  position: relative;
  background: var(--color-bg-card);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: var(--shadow-card-default);
  transition:
    transform 400ms cubic-bezier(0.34, 1.56, 0.64, 1),
    box-shadow 300ms ease;
}

.recommend {
  box-shadow: var(--shadow-card-recommend);
  border: 1px solid rgba(77, 110, 255, 0.3);
}

.selected {
  box-shadow: var(--shadow-card-selected);
  border: 1px solid rgba(255, 92, 43, 0.5);
}

// 顶部4px渐变条
.topStripe {
  height: 4px;
  background: var(--gradient-brand);
}

.topStripeAi {
  background: var(--gradient-ai);
}

// AI推荐角标
.badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: #00C9A7;
  color: #fff;
  font-size: 18rpx;
  font-weight: 500;
  padding: 4rpx 12rpx;
  border-radius: 8px;
  line-height: 1.2;
  z-index: 1;
}

// 地图缩略图占位区
.mapThumb {
  width: 100%;
  height: 120px;
  background: #2A2A38;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: var(--gradient-mask);
  }
}

// 内容区
.body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.name {
  font-size: 36rpx;
  font-weight: 600;
  color: var(--color-text-primary);
  line-height: 1.4;
}

// 三项核心数据行
.dataRow {
  display: flex;
  flex-direction: row;
  gap: 24px;
}

.dataItem {
  display: flex;
  flex-direction: row;
  align-items: baseline;
  gap: 2px;
}

.dataValue {
  font-size: 40rpx;
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 1.2;
  font-variant-numeric: tabular-nums;
}

.dataUnit {
  font-size: 24rpx;
  font-weight: 400;
  color: var(--color-text-secondary);
  line-height: 1.2;
}

// 亮点标签横向滚动
.tags {
  white-space: nowrap;
}

.tag {
  display: inline-block;
  background: rgba(255, 255, 255, 0.08);
  color: var(--color-text-secondary);
  font-size: 20rpx;
  font-weight: 500;
  padding: 6rpx 16rpx;
  border-radius: 8px;
  margin-right: 8px;
  line-height: 1.4;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/business/RouteCard/
git commit -m "feat: add RouteCard component with gradient stripe, AI badge and data display"
```

---

### Task 2: FloatingBar组件

**Files:**
- Create: `src/components/business/FloatingBar/index.tsx`
- Create: `src/components/business/FloatingBar/index.module.scss`

- [ ] **Step 1: 创建FloatingBar组件**

```tsx
// src/components/business/FloatingBar/index.tsx
import { View, Text } from '@tarojs/components'
import styles from './index.module.scss'

interface FloatingBarProps {
  label: string
  disabled?: boolean
  onClick?: () => void
}

export default function FloatingBar({ label, disabled = false, onClick }: FloatingBarProps) {
  return (
    <View className={styles.bar}>
      <View
        className={styles.btn}
        style={{ opacity: disabled ? 0.5 : 1 }}
        onClick={disabled ? undefined : onClick}
      >
        <Text className={styles.btnText}>{label}</Text>
      </View>
    </View>
  )
}
```

- [ ] **Step 2: 创建FloatingBar样式**

```scss
// src/components/business/FloatingBar/index.module.scss
.bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: rgba(13, 13, 18, 0.9);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  box-shadow: var(--shadow-floating-bar);
  padding: 12px 20px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
}

.btn {
  width: 100%;
  height: 96rpx;
  background: var(--gradient-brand);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-btn-primary);
  transition: opacity 200ms ease;
}

.btnText {
  font-size: 32rpx;
  font-weight: 600;
  color: #fff;
  line-height: 1.2;
}
```

- [ ] **Step 3: 在DevTools验证**

在路线对比页引入FloatingBar，预期：悬浮在底部，带毛玻璃效果，按钮显示渐变橙色，底部有安全区留白。

- [ ] **Step 4: Commit**

```bash
git add src/components/business/FloatingBar/
git commit -m "feat: add FloatingBar component with frosted glass and safe-area padding"
```

---

### Task 3: 路线对比页（route-compare）

**Files:**
- Create: `src/pages/route-compare/index.tsx`
- Create: `src/pages/route-compare/index.module.scss`
- Create: `src/services/mock/routes.ts`
- Modify: `src/stores/useRouteStore.ts`（添加transitionRect字段）

- [ ] **Step 1: 创建Mock路线数据**

```typescript
// src/services/mock/routes.ts
export const mockRoutes = [
  {
    id: 'route-1',
    name: '少排队轻松线',
    budgetPerPerson: 118,
    totalMinutes: 270,   // 4.5h
    walkDistanceM: 800,
    highlights: ['低排队', '轻松漫步', '网红咖啡', '草坪拍照'],
    isAiRecommended: false,
    stops: [
      { id: 's1', name: '弄堂里的湖南菜', stayMinutes: 90, tags: ['辣', '本帮'] },
      { id: 's2', name: '创智天地草坪', stayMinutes: 60, tags: ['拍照', '打卡'] },
      { id: 's3', name: '%Arabica咖啡', stayMinutes: 40, tags: ['网红', '拍照'] },
    ],
  },
  {
    id: 'route-2',
    name: '高性价比省钱线',
    budgetPerPerson: 95,
    totalMinutes: 240,   // 4h
    walkDistanceM: 1200,
    highlights: ['省钱', '性价比', '复旦校园', '本帮菜'],
    isAiRecommended: false,
    stops: [
      { id: 's4', name: '四平路本帮菜', stayMinutes: 80, tags: ['本帮', '经济实惠'] },
      { id: 's5', name: '复旦校园随拍', stayMinutes: 70, tags: ['校园', '拍照'] },
      { id: 's6', name: '沪上阿姨', stayMinutes: 30, tags: ['奶茶', '实惠'] },
    ],
  },
  {
    id: 'route-3',
    name: '拍照出片线',
    budgetPerPerson: 132,
    totalMinutes: 300,   // 5h
    walkDistanceM: 1500,
    highlights: ['出片', '网红打卡', '鸳鸯锅', 'AI推荐'],
    isAiRecommended: true,
    stops: [
      { id: 's7', name: '网红鸳鸯锅', stayMinutes: 100, tags: ['鸳鸯锅', '拍照'] },
      { id: 's8', name: '大学路网红墙', stayMinutes: 60, tags: ['网红', '出片'] },
      { id: 's9', name: 'SeeSaw咖啡', stayMinutes: 50, tags: ['精品咖啡', '打卡'] },
    ],
  },
]
```

- [ ] **Step 2: 更新useRouteStore**

```typescript
// src/stores/useRouteStore.ts
import { create } from 'zustand'

interface Rect {
  left: number
  top: number
  width: number
  height: number
}

interface RouteStore {
  selectedRouteId: string | null
  transitionRect: Rect | null
  setSelectedRouteId: (id: string) => void
  setTransitionRect: (rect: Rect) => void
}

export const useRouteStore = create<RouteStore>((set) => ({
  selectedRouteId: null,
  transitionRect: null,
  setSelectedRouteId: (id) => set({ selectedRouteId: id }),
  setTransitionRect: (rect) => set({ transitionRect: rect }),
}))
```

- [ ] **Step 3: 创建路线对比页**

```tsx
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
```

- [ ] **Step 4: 创建路线对比页样式**

```scss
// src/pages/route-compare/index.module.scss
.page {
  min-height: 100vh;
  background: var(--color-bg-base);
  padding: 0 20px;
}

.header {
  padding-top: 48px;
  padding-bottom: 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.title {
  font-size: 44rpx;
  font-weight: 600;
  color: var(--color-text-primary);
  line-height: 1.3;
}

.subtitle {
  font-size: 24rpx;
  font-weight: 400;
  color: var(--color-text-secondary);
  line-height: 1.5;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cardWrap {
  // transition在行内style中设置，以支持stagger
  will-change: transform, opacity;
}

// 为FloatingBar留出底部空间
.bottomPlaceholder {
  height: calc(80px + env(safe-area-inset-bottom));
}
```

- [ ] **Step 5: 在DevTools验证**

打开页面 `pages/route-compare/index`，预期：
1. 三张卡片依次从底部淡入（间隔120ms，带弹簧感）
2. 拍照出片线卡片scale:1.04，带蓝紫阴影
3. 点击卡片后该卡片出现橙色边框高亮
4. 底部FloatingBar随选中变化显示对应路线名
5. 未选中时按钮显示「选择一条路线」且置灰

- [ ] **Step 6: Commit**

```bash
git add src/pages/route-compare/ src/services/mock/routes.ts src/stores/useRouteStore.ts
git commit -m "feat: add route-compare page with stagger card entrance animation"
```

---

### Task 4: 腾讯地图SDK分包集成验证

**Files:**
- Modify: `project.config.json`（添加分包配置）
- Modify: `app.config.ts`（添加subPackages）
- Create: `src/pages/route-detail/mapTest.tsx`（SDK验证页，临时文件）

- [ ] **Step 1: 安装地图SDK**

```bash
npm install @map-component/tmap-miniapp
```

- [ ] **Step 2: 配置分包**

```typescript
// app.config.ts 中添加分包配置
export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/preference/index',
    'pages/route-compare/index',
  ],
  subPackages: [
    {
      root: 'pages/route-detail',
      pages: ['index'],
    },
    {
      root: 'pages/assistant',
      pages: ['index'],
    },
    {
      root: 'pages/map-fullscreen',
      pages: ['index'],
    },
  ],
  window: {
    backgroundTextStyle: 'dark',
    navigationBarBackgroundColor: '#0D0D12',
    navigationBarTitleText: '拼程',
    navigationBarTextStyle: 'white',
    backgroundColor: '#0D0D12',
  },
})
```

- [ ] **Step 3: 创建SDK验证文件**

```tsx
// src/pages/route-detail/mapTest.tsx
// 临时验证文件，验证通过后删除
import { View, Text } from '@tarojs/components'
import { useEffect, useRef, useState } from 'react'
import styles from './mapTest.module.scss'

// 验证三个检查点：
// 1. SDK可以import
// 2. 深色地图样式可以应用
// 3. 橙色路线可以绘制

let TMap: any = null

export default function MapTest() {
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    async function initMap() {
      try {
        const mod = await import('@map-component/tmap-miniapp')
        TMap = mod.default || mod
        // 验证SDK对象存在
        if (TMap) {
          setStatus('success')
        } else {
          throw new Error('TMap module loaded but default export is undefined')
        }
      } catch (e: any) {
        setStatus('failed')
        setErrorMsg(e?.message || String(e))
      }
    }
    initMap()
  }, [])

  return (
    <View className={styles.page}>
      <Text className={styles.title}>地图SDK验证</Text>
      {status === 'loading' && <Text className={styles.loading}>加载中...</Text>}
      {status === 'success' && (
        <Text className={styles.success}>SDK加载成功，可进入正式集成</Text>
      )}
      {status === 'failed' && (
        <View>
          <Text className={styles.failed}>SDK加载失败，启用回退方案</Text>
          <Text className={styles.error}>{errorMsg}</Text>
        </View>
      )}
    </View>
  )
}
```

- [ ] **Step 4: 验证通过/失败判断**

**通过条件：** `@map-component/tmap-miniapp` import成功，TMap对象存在。

**失败回退方案：**
- 地图区域改用腾讯静态地图API预生成的截图（`<Image>`组件加载）
- 「全屏展开」改为 `navigateTo` 原生 `<map>` 全屏页（`pages/map-fullscreen/index`）
- 在代码中设置常量 `const USE_TMAP_SDK = false` 控制渲染分支

- [ ] **Step 5: Commit**

```bash
git add app.config.ts src/pages/route-detail/mapTest.tsx
git commit -m "feat: add subpackage config and tmap SDK integration test"
```

---

### Task 5: MapWindow组件（折叠交互）

**Files:**
- Create: `src/components/business/MapWindow/index.tsx`
- Create: `src/components/business/MapWindow/index.module.scss`

- [ ] **Step 1: 创建MapWindow组件**

```tsx
// src/components/business/MapWindow/index.tsx
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useEffect, useRef, useState } from 'react'
import styles from './index.module.scss'

interface MapWindowProps {
  collapsed: boolean
  routeId: string
  useSdkMap?: boolean  // SDK验证通过时为true，否则用静态图回退
  onExpandFullscreen?: () => void
}

// SDK地图组件（动态import，避免主包加载）
function SdkMapView({ routeId }: { routeId: string }) {
  const mapRef = useRef<any>(null)
  const [mapReady, setMapReady] = useState(false)

  useEffect(() => {
    async function initTMap() {
      try {
        const { default: TMap } = await import('@map-component/tmap-miniapp')
        // 等待canvas ready后初始化
        const map = new TMap.Map('tmap-canvas', {
          center: new TMap.LatLng(31.2981, 121.5047),  // 五角场
          zoom: 14,
          mapStyleId: 'style1',  // 深色样式
        })
        mapRef.current = map
        setMapReady(true)
        // 绘制橙色路线（示例坐标，正式接入后替换）
        new TMap.MultiPolyline({
          id: 'route-line',
          map,
          styles: {
            style_blue: new TMap.PolylineStyle({
              color: '#FF5C2B',
              width: 6,
              borderWidth: 2,
              borderColor: '#FF7A47',
              lineCap: 'round',
              eraseColor: 'rgba(190,188,188,1)',
            }),
          },
          geometries: [
            {
              id: 'polyline',
              styleId: 'style_blue',
              paths: [
                new TMap.LatLng(31.2981, 121.5047),
                new TMap.LatLng(31.2965, 121.5120),
                new TMap.LatLng(31.2940, 121.5098),
              ],
            },
          ],
        })
      } catch (e) {
        console.error('TMap init failed', e)
      }
    }
    initTMap()
    return () => {
      if (mapRef.current) {
        mapRef.current.destroy?.()
      }
    }
  }, [])

  return (
    <View id="tmap-canvas" style={{ width: '100%', height: '100%' }}>
      {!mapReady && <View className={styles.mapPlaceholder} />}
    </View>
  )
}

// 静态图回退组件
function StaticMapView() {
  return <View className={styles.mapPlaceholder} />
}

export default function MapWindow({
  collapsed,
  routeId,
  useSdkMap = false,
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
        {useSdkMap ? (
          <SdkMapView routeId={routeId} />
        ) : (
          <StaticMapView />
        )}
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
```

- [ ] **Step 2: 创建MapWindow样式**

```scss
// src/components/business/MapWindow/index.module.scss
.window {
  position: relative;
  width: 100%;
  overflow: hidden;
  background: #1A1A28;
  // height通过行内style + CSS transition控制，不能用display:none
}

.mapContent {
  width: 100%;
  height: 100%;
}

.mapPlaceholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #1A1A28, #2A2A3C);
  display: flex;
  align-items: center;
  justify-content: center;

  &::after {
    content: '地图加载中';
    color: var(--color-text-disabled);
    font-size: 24rpx;
  }
}

// 折叠态横向路线条
.collapsedBar {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  padding: 0 16px;
  background: rgba(13, 13, 18, 0.8);
  gap: 12px;
}

.collapsedText {
  font-size: 24rpx;
  color: var(--color-text-secondary);
  flex-shrink: 0;
}

.collapsedLine {
  flex: 1;
  height: 3px;
  background: linear-gradient(90deg, #FF5C2B, #FFB300, rgba(255, 92, 43, 0.2));
  border-radius: 2px;
}

// 右上角展开按钮
.expandBtn {
  position: absolute;
  top: 8px;
  right: 12px;
  background: rgba(13, 13, 18, 0.7);
  backdrop-filter: blur(8px);
  padding: 6rpx 16rpx;
  border-radius: 12px;
  z-index: 10;
}

.expandText {
  font-size: 22rpx;
  color: var(--color-text-secondary);
}
```

- [ ] **Step 3: 在DevTools验证**

渲染MapWindow组件，手动切换collapsed状态，预期：
1. 展开态：高度33vh，显示地图或灰色占位区
2. 折叠态：高度56px，显示横向路线条
3. 切换有0.35s smooth过渡，无跳变

- [ ] **Step 4: Commit**

```bash
git add src/components/business/MapWindow/
git commit -m "feat: add MapWindow component with CSS height transition for collapse"
```

---

### Task 6: Timeline组件（含pulse节点）

**Files:**
- Create: `src/components/business/Timeline/index.tsx`
- Create: `src/components/business/Timeline/index.module.scss`

- [ ] **Step 1: 创建Timeline组件**

```tsx
// src/components/business/Timeline/index.tsx
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState } from 'react'
import cx from 'classnames'
import styles from './index.module.scss'

type StopStatus = 'done' | 'current' | 'upcoming'

interface Stop {
  id: string
  name: string
  stayMinutes: number
  tags: string[]
  status: StopStatus
}

interface TimelineProps {
  stops: Stop[]
  onNavigate?: (stop: Stop) => void
  onGetTicket?: (stop: Stop) => void
  onSwap?: (stop: Stop) => void
}

function StopCard({ stop, onNavigate, onGetTicket, onSwap }: {
  stop: Stop
  onNavigate?: (s: Stop) => void
  onGetTicket?: (s: Stop) => void
  onSwap?: (s: Stop) => void
}) {
  const [expanded, setExpanded] = useState(stop.status === 'current')
  const isDone = stop.status === 'done'
  const isCurrent = stop.status === 'current'

  return (
    <View
      className={cx(styles.stopCard, isDone && styles.stopDone)}
      onClick={() => setExpanded(!expanded)}
    >
      {/* 站点头部 */}
      <View className={styles.stopHeader}>
        <View className={styles.stopInfo}>
          <Text className={styles.stopName}>{stop.name}</Text>
          <Text className={styles.stopDuration}>停留 {stop.stayMinutes} 分钟</Text>
        </View>
        {isDone && <Text className={styles.doneCheck}>✓</Text>}
      </View>

      {/* 展开内容：使用max-height transition，不能用height:auto */}
      <View
        className={styles.stopDetail}
        style={{
          maxHeight: expanded ? '500px' : '0px',
          overflow: 'hidden',
          transition: 'max-height 300ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* 玩法标签横向滚动 */}
        <ScrollView scrollX className={styles.stopTags}>
          {stop.tags.map(t => (
            <View key={t} className={styles.stopTag}>{t}</View>
          ))}
        </ScrollView>

        {/* 操作按钮组 */}
        {!isDone && (
          <View className={styles.actions}>
            <View
              className={styles.actionBtn}
              onClick={(e) => { e.stopPropagation(); onNavigate?.(stop) }}
            >
              <Text className={styles.actionText}>导航</Text>
            </View>
            <View
              className={styles.actionBtn}
              onClick={(e) => { e.stopPropagation(); onGetTicket?.(stop) }}
            >
              <Text className={styles.actionText}>取号</Text>
            </View>
            <View
              className={cx(styles.actionBtn, styles.actionBtnSwap)}
              onClick={(e) => { e.stopPropagation(); onSwap?.(stop) }}
            >
              <Text className={cx(styles.actionText, styles.actionTextSwap)}>换一家</Text>
            </View>
          </View>
        )}
      </View>
    </View>
  )
}

export default function Timeline({ stops, onNavigate, onGetTicket, onSwap }: TimelineProps) {
  return (
    <View className={styles.timeline}>
      {stops.map((stop, index) => (
        <View key={stop.id} className={styles.row}>
          {/* 左侧节点+连线 */}
          <View className={styles.track}>
            {/* 节点 */}
            <View className={cx(
              styles.node,
              stop.status === 'current' && styles.nodeActive,
              stop.status === 'done' && styles.nodeDone,
              stop.status === 'upcoming' && styles.nodeUpcoming,
            )}>
              {/* pulse双层光圈，仅当前节点显示 */}
              {stop.status === 'current' && (
                <>
                  <View className={styles.pulseRing1} />
                  <View className={styles.pulseRing2} />
                </>
              )}
            </View>
            {/* 连接线（最后一个节点不显示） */}
            {index < stops.length - 1 && (
              <View className={cx(
                styles.line,
                stop.status === 'done' && styles.lineDone,
              )} />
            )}
          </View>

          {/* 右侧站点卡片 */}
          <View className={styles.cardArea}>
            <StopCard
              stop={stop}
              onNavigate={onNavigate}
              onGetTicket={onGetTicket}
              onSwap={onSwap}
            />
          </View>
        </View>
      ))}
    </View>
  )
}
```

- [ ] **Step 2: 创建Timeline样式（含pulse动效）**

```scss
// src/components/business/Timeline/index.module.scss
.timeline {
  padding: 16px 0;
}

// 每个站点的行容器
.row {
  display: flex;
  flex-direction: row;
  gap: 12px;
  margin-bottom: 0;
}

// 左侧轨道（节点+连线）
.track {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  width: 20px;
  padding-top: 20px;
}

// 节点基础样式
.node {
  position: relative;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

// 当前节点（橙色+发光+双层pulse）
.nodeActive {
  background: var(--color-primary);
  box-shadow: var(--shadow-timeline-active);

  // 双层pulse光圈（伪元素）
  &::before,
  &::after {
    content: '';
    position: absolute;
    inset: -4px;
    border-radius: 50%;
    border: 2px solid rgba(255, 92, 43, 0.5);
  }
}

.pulseRing1 {
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  border: 2px solid rgba(255, 92, 43, 0.6);
  animation: pulseRing 2s infinite;
}

.pulseRing2 {
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  border: 2px solid rgba(255, 92, 43, 0.4);
  animation: pulseRing 2s infinite 0.4s;  // 错开400ms
}

@keyframes pulseRing {
  0% {
    transform: scale(1);
    opacity: 0.8;
  }
  100% {
    transform: scale(2.5);
    opacity: 0;
  }
}

// 已完成节点（薄荷绿）
.nodeDone {
  background: var(--color-success);
}

// 未到节点（灰色）
.nodeUpcoming {
  background: var(--color-text-disabled);
}

// 连接线
.line {
  flex: 1;
  width: 2px;
  background: var(--color-text-disabled);
  margin-top: 4px;
  min-height: 20px;
}

.lineDone {
  background: var(--color-success);
}

// 右侧卡片区
.cardArea {
  flex: 1;
  padding-bottom: 16px;
}

// 站点卡片
.stopCard {
  background: var(--color-bg-card);
  border-radius: 16px;
  padding: 16px;
  overflow: hidden;
  transition: opacity 200ms ease;
}

// 已完成站点整体降低对比度
.stopDone {
  opacity: 0.5;
}

.stopHeader {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
}

.stopInfo {
  flex: 1;
}

.stopName {
  font-size: 36rpx;
  font-weight: 600;
  color: var(--color-text-primary);
  line-height: 1.4;
  display: block;
}

.stopDuration {
  font-size: 24rpx;
  font-weight: 400;
  color: var(--color-text-secondary);
  line-height: 1.5;
  margin-top: 4px;
  display: block;
}

.doneCheck {
  font-size: 28rpx;
  color: var(--color-success);
  margin-left: 8px;
}

// 展开内容（max-height在行内style控制）
.stopDetail {
  // max-height在行内style中设置，支持transition
}

.stopTags {
  margin-top: 12px;
  white-space: nowrap;
}

.stopTag {
  display: inline-block;
  background: rgba(255, 255, 255, 0.08);
  color: var(--color-text-secondary);
  font-size: 20rpx;
  font-weight: 500;
  padding: 6rpx 14rpx;
  border-radius: 8px;
  margin-right: 8px;
}

// 操作按钮组
.actions {
  display: flex;
  flex-direction: row;
  gap: 8px;
  margin-top: 12px;
}

.actionBtn {
  flex: 1;
  height: 64rpx;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.actionBtnSwap {
  background: rgba(77, 110, 255, 0.12);
}

.actionText {
  font-size: 26rpx;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.actionTextSwap {
  color: var(--color-accent);
}
```

- [ ] **Step 3: 在DevTools验证**

渲染Timeline组件，传入三个站点（done/current/upcoming），预期：
1. 当前站点节点为橙色，有双层向外扩散的pulse光圈，动画循环
2. 已完成站点整体opacity:0.5，节点为薄荷绿
3. 未到站点节点为灰色
4. 点击站点卡片展开/收起，max-height动画平滑
5. 展开后显示玩法标签横向滚动 + 三个操作按钮

- [ ] **Step 4: Commit**

```bash
git add src/components/business/Timeline/
git commit -m "feat: add Timeline component with pulse node animation and max-height expand"
```

---

### Task 7: PlanBSheet底部弹层

**Files:**
- Create: `src/components/business/PlanBSheet/index.tsx`
- Create: `src/components/business/PlanBSheet/index.module.scss`

- [ ] **Step 1: 创建PlanBSheet组件**

```tsx
// src/components/business/PlanBSheet/index.tsx
import { View, Text } from '@tarojs/components'
import cx from 'classnames'
import styles from './index.module.scss'

interface PlanBSheetProps {
  visible: boolean
  onNavigate: () => void
  onCallAI: () => void
}

export default function PlanBSheet({ visible, onNavigate, onCallAI }: PlanBSheetProps) {
  return (
    <View
      className={cx(styles.sheet, visible && styles.visible)}
      style={{
        transform: visible ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 300ms cubic-bezier(0.32, 0.72, 0, 1)',
      }}
    >
      {/* 左侧AI圆形按钮 */}
      <View className={styles.aiBtn} onClick={onCallAI}>
        <Text className={styles.aiBtnText}>AI</Text>
      </View>

      {/* 右侧主按钮：导航到下一站 */}
      <View className={styles.mainBtn} onClick={onNavigate}>
        <Text className={styles.mainBtnText}>导航到下一站</Text>
      </View>
    </View>
  )
}
```

- [ ] **Step 2: 创建PlanBSheet样式**

```scss
// src/components/business/PlanBSheet/index.module.scss
.sheet {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: rgba(13, 13, 18, 0.9);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  box-shadow: var(--shadow-floating-bar);
  padding: 12px 20px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  // transform在行内style中设置，支持show/hide动画
}

// AI圆形图标按钮
.aiBtn {
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
  background: var(--gradient-ai);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow:
    0 4px 12px rgba(77, 110, 255, 0.4),
    0 8px 24px rgba(77, 110, 255, 0.2);
}

.aiBtnText {
  font-size: 28rpx;
  font-weight: 700;
  color: #fff;
}

// 主按钮：导航到下一站
.mainBtn {
  flex: 1;
  height: 88rpx;
  background: var(--gradient-brand);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-btn-primary);
}

.mainBtnText {
  font-size: 32rpx;
  font-weight: 600;
  color: #fff;
}
```

- [ ] **Step 3: 在DevTools验证**

渲染PlanBSheet，预期：
1. 左侧圆形AI按钮（蓝紫渐变）
2. 右侧全宽渐变橙红「导航到下一站」按钮，有橙色发光阴影
3. 整体毛玻璃底色，安全区留白

- [ ] **Step 4: Commit**

```bash
git add src/components/business/PlanBSheet/
git commit -m "feat: add PlanBSheet with AI icon button and navigation primary button"
```

---

### Task 8: 路线详情页（route-detail）

**Files:**
- Create: `src/pages/route-detail/index.tsx`
- Create: `src/pages/route-detail/index.module.scss`

> 注：此页面在分包中（`pages/route-detail/`），已在Task 4配置subPackages。

- [ ] **Step 1: 准备站点Mock数据（扩展Task 3的mockRoutes）**

```typescript
// src/services/mock/routes.ts 末尾追加
// 将stops补充status字段（供详情页时间轴使用）
export function getRouteDetailMock(routeId: string) {
  const route = mockRoutes.find(r => r.id === routeId)
  if (!route) return null
  return {
    ...route,
    stops: route.stops.map((stop, i) => ({
      ...stop,
      status: i === 0 ? 'done' : i === 1 ? 'current' : 'upcoming',
    })),
  }
}
```

- [ ] **Step 2: 创建路线详情页**

```tsx
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
```

- [ ] **Step 3: 创建路线详情页样式**

```scss
// src/pages/route-detail/index.module.scss
.page {
  min-height: 100vh;
  background: var(--color-bg-base);
  position: relative;
}

// 滚动区域：top随地图折叠状态动态变化（行内style控制）
.scrollView {
  height: 100vh;
  transition: margin-top 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.content {
  padding: 0 20px;
  padding-top: 8px;
}

// 为底部浮层留出空间
.bottomPad {
  height: calc(80px + env(safe-area-inset-bottom));
}
```

- [ ] **Step 4: 在DevTools验证**

打开页面 `pages/route-detail/index?routeId=route-3`，预期：
1. 顶部地图小窗（33vh，灰色占位或SDK地图）
2. 向下滚动超过60px后地图折叠为56px横条（有0.35s过渡）
3. 折叠态显示横向路线缩略条（橙色渐变线）
4. 时间轴：第一站已完成（opacity:0.5+绿勾），第二站当前（橙色pulse节点），第三站未到（灰节点）
5. 当前站展开显示操作按钮，点击「换一家」弹Toast
6. 底部PlanBSheet：左侧AI圆钮 + 右侧「导航到下一站」
7. 点击AI钮跳转助手页

- [ ] **Step 5: Commit**

```bash
git add src/pages/route-detail/
git commit -m "feat: add route-detail page with map collapse, timeline and PlanBSheet"
```

---

## 集成检查清单

在宣布所有Task完成前，确认以下项：

- [ ] `pages/route-compare/index` 可打开，三张卡片stagger入场动效可见
- [ ] 点击任意卡片出现选中高亮，FloatingBar文案随选中变化
- [ ] `pages/route-detail/index` 可从route-compare页跳转打开（routeId参数正确传递）
- [ ] 地图折叠/展开transition无抖动，高度切换平滑
- [ ] Timeline pulse动效在真机上循环播放（DevTools可能不稳定）
- [ ] PlanBSheet底部安全区在刘海屏设备上留白正常
- [ ] 分包体积不超过2MB（`taro build --type weapp` 后检查dist/pages/route-detail目录）

---

## 技术坑备忘

| 坑 | 规避方案 |
|---|---|
| `height:auto` 不可transition | 全部用 `max-height` 或 `行内style height + CSS transition` |
| `display:none` 切换动效不触发 | MapWindow折叠用 `height:56px`，不用 `display:none` |
| map原生组件层级穿透 | 用SDK或navigateTo独立全屏页，绝不在map上盖View |
| ScrollView onScroll与地图高度联动 | marginTop动态设置 + CSS transition，避免重排抖动 |
| Timeline `max-height` 上限设置 | 设500px（远大于实际高度），不设 `auto` |
| pulse动效在低端机卡顿 | `will-change: transform` 提前提升合成层 |
