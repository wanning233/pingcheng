# Plan D Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现途中助手页（含 ChatBubble / ThinkingIndicator / RouteDiffCard 子组件）、好友邀请落地页、RippleOverlay 波纹转场动效、TransitionOverlay 共享元素转场动效、全屏地图页，以及把上述所有组件集成到路线详情页（route-detail）的完整交互。

**Architecture:** 助手页（assistant）、全屏地图页（map-fullscreen）在分包；邀请落地页（invite/landing）在主包。TransitionOverlay 和 RippleOverlay 是纯动效组件，分别在路线对比→详情、详情→助手的转场中使用，挂载于目标页面的挂载初期。RouteDiffCard 是行内组件，渲染在对话 ScrollView 内部，通过 `visible` prop 驱动 600ms 分阶段入场动效。所有交互数据走本地 MockEngine。

**Tech Stack:** Taro 3.6.x + React 18, NutUI-React 2.x, Zustand, CSS keyframes + Canvas 2D, MockEngine

---

## Task 1: TransitionOverlay 组件（src/components/business/TransitionOverlay/）

**文件：**
- `src/components/business/TransitionOverlay/index.tsx`
- `src/components/business/TransitionOverlay/index.module.scss`

### 组件职责

实现对比页 → 详情页的「视觉欺骗」共享元素转场：

1. 路线对比页：用户点击卡片时，用 `createSelectorQuery` 记录卡片的 rect（top/left/width/height），存入 `useRouteStore.transitionRect`
2. 路线详情页挂载时读取 `transitionRect`，渲染 TransitionOverlay（与卡片完全同位置、同圆角的橙红色覆盖层）
3. 双 rAF 后触发 CSS transition：从卡片尺寸 expand 到全屏（圆角 20px→0，420ms `cubic-bezier(0.4,0,0.2,1)`）
4. 470ms 后调 `onDone`，隐藏 overlay，显示真实详情内容

### 关键实现细节

**双 rAF 技巧：** 必须用两帧 `requestAnimationFrame` 嵌套，确保浏览器在初始小尺寸状态完整绘制一帧后再触发 transition。只用一帧 rAF 会因批处理导致初始帧和目标帧合并，transition 不触发。

**无 transitionRect 时的降级：** 若 `transitionRect` 为 null（从非对比页直接进入详情页），组件直接返回 null，`onDone` 立即触发。

**动画 CSS 属性：** 分开列出每个属性的 transition，不用 `all`（避免意外过渡其他属性）：

```
transition: top 420ms cubic-bezier(0.4,0,0.2,1),
            left 420ms cubic-bezier(0.4,0,0.2,1),
            width 420ms cubic-bezier(0.4,0,0.2,1),
            height 420ms cubic-bezier(0.4,0,0.2,1),
            border-radius 420ms cubic-bezier(0.4,0,0.2,1)
```

**只触发一次 onDone：** 用 `doneCalledRef.current` 防止 timer 和 unmount 竞争导致 onDone 被调用两次。

### 实现步骤

- [ ] **Step 1: 确认 TransitionOverlay/index.tsx（已实现，重点检查降级逻辑）**

核心代码（已在 `src/components/business/TransitionOverlay/index.tsx` 实现）：

```tsx
// 降级路径
useEffect(() => {
  if (!transitionRect) {
    if (!doneCalledRef.current) {
      doneCalledRef.current = true
      onDone()
    }
    return
  }
  // 双 rAF 确保初始态被渲染后再触发 transition
  requestAnimationFrame(() => {
    requestAnimationFrame(() => { setExpanded(true) })
  })
  const t = setTimeout(() => {
    if (!doneCalledRef.current) {
      doneCalledRef.current = true
      onDone()
    }
  }, 470)
  return () => clearTimeout(t)
}, []) // eslint-disable-line react-hooks/exhaustive-deps

if (!transitionRect) return null
```

- [ ] **Step 2: 创建 TransitionOverlay/index.module.scss**

```scss
/* src/components/business/TransitionOverlay/index.module.scss */
.overlay {
  position: fixed;
  z-index: 100;
  background: #FF5C2B;     /* 橙红色覆盖层 */
  pointer-events: none;     /* 不阻断触摸 */
}
```

- [ ] **Step 3: 验证 useRouteStore 的 transitionRect 读写**

```typescript
// useRouteStore 需包含：
interface RouteStore {
  transitionRect: { top: number; left: number; width: number; height: number } | null
  setTransitionRect: (rect: RouteStore['transitionRect']) => void
}
```

- [ ] **Step 4: 在 RouteCard 点击时写入 rect（已实现）**

```tsx
// RouteCard handleTap（已实现）
const handleTap = () => {
  setSelectedRouteId(route.id)
  Taro.createSelectorQuery()
    .select(`#route-card-${route.id}`)
    .boundingClientRect((rect) => { if (rect) setTransitionRect(rect as any) })
    .exec()
}
```

- [ ] **Step 5: 在路线详情页挂载 TransitionOverlay**

```tsx
const [transitionDone, setTransitionDone] = useState(false)
// ...
{!transitionDone && <TransitionOverlay onDone={() => setTransitionDone(true)} />}
<View style={{ opacity: transitionDone ? 1 : 0, transition: 'opacity 200ms ease' } as any}>
  {/* 真实详情内容 */}
</View>
```

- [ ] **Step 6: 验证**

```
测试 1: 从对比页点击卡片 → 详情页橙色遮罩从卡片展开全屏 → 内容淡入
测试 2: 直接 navigateTo 详情页 → transitionRect=null → 内容直接显示
测试 3: 多次返回/前进 → transitionRect 每次点击都正确更新
```

---

## Task 2: RippleOverlay 组件（src/components/animation/RippleOverlay/）

**文件：**
- `src/components/animation/RippleOverlay/index.tsx`
- `src/components/animation/RippleOverlay/index.module.scss`

### 组件职责

实现路线详情页 → 途中助手页的橙色波纹全屏转场。FAB 按钮点击时：
1. 记录 FAB 按钮屏幕坐标（originX/originY）
2. 挂载 RippleOverlay，以 FAB 位置为圆心扩散橙色圆形（scale 0→30）
3. 400ms 时调 `onComplete`（执行 navigateTo 助手页）
4. 600ms 后开始淡出（新页面已显示，ripple 淡出收尾）

### 关键实现细节

**圆形尺寸：** base size 50px，`scale(30)` 后直径 1500px 足够覆盖全屏（750px 宽设计稿）。

**双 rAF：** 与 TransitionOverlay 相同，确保 scale(0) 初始态被渲染后再触发扩散 transition。

**onComplete 时机：** 400ms 时调用（不等动效结束），确保助手页有时间初始化，视觉上无缝衔接。

### 实现步骤

- [ ] **Step 1: 确认 RippleOverlay/index.tsx（已实现）**

```tsx
// 已实现的核心代码
useEffect(() => {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => { setExpanded(true) })
  })
  const t1 = setTimeout(() => onComplete(), 400)
  const t2 = setTimeout(() => setFading(true), 600)
  return () => { clearTimeout(t1); clearTimeout(t2) }
}, []) // eslint-disable-line react-hooks/exhaustive-deps

// 内联 style 控制扩散
style={{
  top: `${originY}px`, left: `${originX}px`,
  transform: `translate(-50%, -50%) scale(${expanded ? 30 : 0})`,
  opacity: fading ? 0 : 1,
  transition: expanded
    ? `transform 600ms cubic-bezier(0.4,0,1,1), opacity 300ms ease ${fading ? '0ms' : '600ms'}`
    : 'none',
}}
```

- [ ] **Step 2: 创建 RippleOverlay/index.module.scss**

```scss
/* src/components/animation/RippleOverlay/index.module.scss */
.ripple {
  position: fixed;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #FF5C2B;
  z-index: 200;
  pointer-events: none;
}
```

- [ ] **Step 3: 在路线详情页 FAB 点击时挂载 RippleOverlay**

```tsx
const [rippleOrigin, setRippleOrigin] = useState<{x:number,y:number} | null>(null)

const handleCallAssistant = () => {
  Taro.createSelectorQuery()
    .select('#fab-assistant')
    .boundingClientRect((rect: any) => {
      setRippleOrigin({
        x: rect ? rect.left + rect.width / 2 : 300,
        y: rect ? rect.top + rect.height / 2 : 600,
      })
    }).exec()
}

// JSX
{rippleOrigin && (
  <RippleOverlay
    originX={rippleOrigin.x}
    originY={rippleOrigin.y}
    onComplete={() => Taro.navigateTo({ url: '/subpackages/assistant/index' })}
  />
)}
```

- [ ] **Step 4: 验证**

```
测试 1: 点击 FAB → 橙色圆从 FAB 位置扩散覆盖全屏 → 400ms 时 navigateTo 助手页
测试 2: createSelectorQuery 失败 → 降级坐标(300,600)，动效照常
```

---

## Task 3: ChatBubble 组件（src/components/business/ChatBubble/）

**文件：**
- `src/components/business/ChatBubble/index.tsx`
- `src/components/business/ChatBubble/index.module.scss`

### 组件职责

AI 对话流中的单条消息气泡，支持两种形态：
- AI 消息：左侧 3px `#4D6EFF` 蓝竖条 + 深色气泡 + clip-path 打字机动效
- 用户消息：右对齐渐变橙色气泡

### 关键实现细节

**打字机动效（clip-path 方案）：** `isStreaming=true` 时，文字容器添加 CSS animation `textReveal`：

```scss
@keyframes textReveal {
  from { clip-path: inset(0 100% 0 0); }
  to   { clip-path: inset(0 0% 0 0); }
}
```

时长 `content.length * 30ms`，整段文字一次渲染，从左到右擦出，无逐字 setData 开销。

**小程序 animation 属性写法：** 使用分属性写法而非 shorthand，避免兼容问题：

```tsx
const textStyle = useMemo(() => {
  if (!isStreaming) return {}
  return {
    animationName: 'textReveal',
    animationDuration: `${duration}ms`,
    animationTimingFunction: 'linear',
    animationFillMode: 'forwards',
    display: 'block',
  }
}, [isStreaming, duration])
```

### 实现步骤

- [ ] **Step 1: 确认 ChatBubble/index.tsx（已实现，检查 animation 属性写法）**

当前实现使用 `animation: 'textReveal ${duration}ms linear forwards'` shorthand，建议改为分属性写法（见上）以保证小程序兼容性。

- [ ] **Step 2: 创建 ChatBubble/index.module.scss**

```scss
/* src/components/business/ChatBubble/index.module.scss */
@import '@/styles/theme.scss';

.aiRow {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 16px;
  padding-right: 40px;
}

.aiStripe {
  width: 3px;
  align-self: stretch;
  background: var(--color-accent);   /* #4D6EFF */
  border-radius: 2px;
  flex-shrink: 0;
}

.aiBubble {
  background: var(--color-bg-card);
  border-radius: 0 16px 16px 16px;
  padding: 12px 14px;
  flex: 1;
}

.userRow {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
  padding-left: 40px;
}

.userBubble {
  background: var(--gradient-brand);
  border-radius: 16px 16px 0 16px;
  padding: 10px 14px;
  max-width: 80%;
}

.content {
  font-size: 28rpx;
  line-height: 1.6;
  color: var(--color-text-primary);
}
```

在 `src/styles/animation.scss` 中确认 `textReveal` keyframe 存在（Plan C 也使用了同一个全局关键帧）。

---

## Task 4: ThinkingIndicator 组件（src/components/business/ThinkingIndicator/）

**文件：**
- `src/components/business/ThinkingIndicator/index.tsx`
- `src/components/business/ThinkingIndicator/index.module.scss`

### 组件职责

AI「思考中」状态的三点律动 loading。纯 CSS 实现，无 JS 状态。与 ChatBubble 使用相同外框（左侧蓝竖条 + 气泡）保持视觉一致性。

### 实现步骤

- [ ] **Step 1: 确认/创建 ThinkingIndicator/index.tsx**

```tsx
// src/components/business/ThinkingIndicator/index.tsx
import { View } from '@tarojs/components'
import styles from './index.module.scss'

export default function ThinkingIndicator() {
  return (
    <View className={styles.row}>
      <View className={styles.aiStripe} />
      <View className={styles.bubble}>
        <View className={styles.dot} />
        <View className={`${styles.dot} ${styles.dot2}`} />
        <View className={`${styles.dot} ${styles.dot3}`} />
      </View>
    </View>
  )
}
```

- [ ] **Step 2: 创建 ThinkingIndicator/index.module.scss**

```scss
/* src/components/business/ThinkingIndicator/index.module.scss */
@import '@/styles/theme.scss';

.row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 16px;
  padding-right: 40px;
}

.aiStripe {
  width: 3px;
  height: 36px;
  background: var(--color-accent);
  border-radius: 2px;
  flex-shrink: 0;
}

.bubble {
  background: var(--color-bg-card);
  border-radius: 0 16px 16px 16px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--color-text-secondary);
  animation: dotBounce 1.4s ease-in-out infinite;
}

.dot2 { animation-delay: 0.16s; }
.dot3 { animation-delay: 0.32s; }

@keyframes dotBounce {
  0%, 60%, 100% { transform: translateY(0);    opacity: 0.4; }
  30%           { transform: translateY(-6px); opacity: 1; }
}
```

---

## Task 5: RouteDiffCard 组件（src/components/business/RouteDiffCard/）

**文件：**
- `src/components/business/RouteDiffCard/index.tsx`
- `src/components/business/RouteDiffCard/index.module.scss`
- `src/services/mock/routeDiff.json`

### 组件职责

途中助手页内嵌的路线变更建议卡片，是 Demo 最核心的业务组件。展示「换」vs「不换」的得失对比，支持三种时间状态（`safe` / `overtime` / `rescued`），配备 600ms 分阶段入场动效。

### timeStatus 推导逻辑

`timeStatus` 由前端根据 AI 返回的 ETA 时间戳推导，不由后端直接返回：

```typescript
// utils/timeStatus.ts
const BUFFER_MINUTES = 5

export function computeTimeStatus(
  currentStopETA: string,   // "21:15"
  planBStopETA: string,     // "20:48"
  deadline: string,         // "21:00"（来自 useSessionStore.endTime）
): TimeStatus {
  const toMs = (hhmm: string) => {
    const [h, m] = hhmm.split(':').map(Number)
    return (h * 60 + m) * 60 * 1000
  }
  const deadlineMs = toMs(deadline) + BUFFER_MINUTES * 60 * 1000
  const planBOK   = toMs(planBStopETA)   <= deadlineMs
  const currentOK = toMs(currentStopETA) <= deadlineMs

  if (!currentOK && planBOK) return 'rescued'   // 不换超时，换能救 ← Demo 状态
  if (!currentOK && !planBOK) return 'overtime'  // 两条路都超时
  return 'safe'                                   // 换了更好，当前也能准时
}
```

Demo 中 `timeStatus = 'rescued'`：网红鸳鸯锅 21:15 结束，超出 21:00 截止；弄堂里的湖南菜 20:48，能救回来。

### Mock 数据

```json
// src/services/mock/routeDiff.json
{
  "timeStatus": "rescued",
  "sessionDeadline": "21:00",
  "currentStop": {
    "name": "网红鸳鸯锅",
    "rating": 4.8,
    "estimatedQueueMinutes": 58,
    "estimatedEndTime": "21:15"
  },
  "planBStop": {
    "name": "弄堂里的湖南菜",
    "rating": 4.6,
    "estimatedQueueMinutes": 5,
    "estimatedEndTime": "20:48"
  },
  "gains": { "savedMinutes": 27, "savedPricePerPerson": 17 },
  "costs": { "ratingDrop": 0.2, "extraWalkMeters": 420, "extraWalkMinutes": 6 },
  "aiRecommendation": "强烈建议换！原路线排队58分钟，必然超时15分钟。弄堂里的湖南菜等5分钟，能帮你省回27分钟，20:48结束，还早走12分钟。"
}
```

### 600ms 入场动效

```
  0ms  cardVisible=true  → translateY(60px)→0 + opacity 0→1（400ms spring）
300ms  leftVisible=true  → 左栏「得到」内容 translateY(12px)→0（300ms ease）
350ms  rightVisible=true → 右栏「失去」内容（50ms 错位）
500ms  buttonsVisible=true → 按钮行淡入
```

### 三种状态的按钮策略

| `timeStatus` | 顶部色 | 横幅 | 主按钮 | 次按钮 |
|---|---|---|---|---|
| `safe` | `#00C9A7` | 无 | 蓝色全宽「切换到XXX」 | 幽灵「维持原路线」 |
| `overtime` | `#FFB800` | 黄色横幅 | 半宽「知道会晚，换」 | 半宽幽灵「知道会晚，不换」 |
| `rescued` | `#FF5C2B` | 绿色横幅 | 全宽橙红「立刻换！」 | 幽灵「维持原路线（将超时N分钟）」 |

**无二次确认弹窗：** 次按钮文案直接写明后果，超时分钟数动态计算：

```tsx
const overtimeMinutes = Math.round(
  (new Date(`2000/01/01 ${data.currentStop.estimatedEndTime}`).getTime() -
   new Date(`2000/01/01 ${data.sessionDeadline}`).getTime()) / 60000
)
// → "维持原路线（将超时15分钟）"
```

### 实现步骤

- [ ] **Step 1: 确认 RouteDiffCard/index.tsx（已实现，重点检查入场动效 useEffect）**

```tsx
// 已实现的入场动效逻辑
useEffect(() => {
  if (!visible) {
    setCardVisible(false); setLeftVisible(false)
    setRightVisible(false); setButtonsVisible(false)
    return
  }
  setCardVisible(true)
  const t1 = setTimeout(() => setLeftVisible(true), 300)
  const t2 = setTimeout(() => setRightVisible(true), 350)
  const t3 = setTimeout(() => setButtonsVisible(true), 500)
  return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
}, [visible])
```

- [ ] **Step 2: 创建 RouteDiffCard/index.module.scss**

```scss
/* src/components/business/RouteDiffCard/index.module.scss */
@import '@/styles/theme.scss';

.card {
  background: var(--color-bg-card);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: var(--shadow-card-default);
  margin: 0 0 16px;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  /* background 由 timeStatus 内联 style 注入 */
}

.headerTitle {
  font-size: 28rpx; font-weight: 600; color: #fff; display: block;
}

.headerSub {
  font-size: 22rpx; color: rgba(255,255,255,0.8); display: block; margin-top: 2px;
}

.timeLabel { font-size: 24rpx; font-weight: 600; color: #fff; }

/* 横幅 */
.bannerGreen {
  background: rgba(0,201,167,0.15);
  border-left: 3px solid var(--color-success);
  padding: 8px 16px;
}

.bannerYellow {
  background: rgba(255,183,0,0.12);
  border-left: 3px solid var(--color-warning);
  padding: 8px 16px;
}

.bannerText { font-size: 22rpx; color: var(--color-text-primary); font-weight: 500; }

/* 对比区 */
.comparison {
  display: flex;
  padding: 16px;
  gap: 12px;
}

.gainSide, .costSide { flex: 1; }

.sideLabel {
  font-size: 20rpx; font-weight: 600; color: var(--color-text-disabled);
  display: block; margin-bottom: 10px;
  text-transform: uppercase; letter-spacing: 0.08em;
}

.sideItem { margin-bottom: 8px; }

.sideValue {
  font-size: 32rpx; font-weight: 700; color: var(--color-success);
  display: block; font-variant-numeric: tabular-nums;
}

.sideValueNeg {
  font-size: 32rpx; font-weight: 700; color: var(--color-danger);
  display: block; font-variant-numeric: tabular-nums;
}

.sideDesc { font-size: 20rpx; color: var(--color-text-secondary); display: block; }

.routeBox {
  margin-top: 10px; background: var(--color-bg-glass);
  border-radius: 10px; padding: 8px 10px;
}

.routeName { font-size: 22rpx; font-weight: 600; color: var(--color-text-primary); display: block; }
.routeMeta { font-size: 18rpx; color: var(--color-text-secondary); display: block; margin-top: 2px; }
.routeTime { font-size: 18rpx; color: var(--color-text-disabled); display: block; margin-top: 2px; }

.divider {
  width: 1px; background: var(--color-bg-glass); align-self: stretch; flex-shrink: 0;
}

/* AI 推荐 */
.aiRec { padding: 10px 16px 12px; border-top: 1px solid var(--color-bg-glass); }
.aiRecText { font-size: 22rpx; color: var(--color-accent); line-height: 1.6; }

/* 按钮区 */
.buttons {
  padding: 0 16px 16px;
  display: flex; flex-direction: column; gap: 8px;
}

/* safe 状态：蓝色全宽 */
.btnAccentFull {
  width: 100%; height: 48px; border-radius: 14px;
  background: var(--color-accent);
  display: flex; align-items: center; justify-content: center;
}

/* rescued 状态：橙红全宽 */
.btnPrimaryFull {
  width: 100%; height: 48px; border-radius: 14px;
  background: var(--gradient-brand); box-shadow: var(--shadow-btn-primary);
  display: flex; align-items: center; justify-content: center;
}

/* overtime 状态：两个半宽并排 */
.btnHalfRow { display: flex; gap: 8px; }

.btnHalf {
  flex: 1; height: 44px; border-radius: 12px;
  background: var(--color-warning);
  display: flex; align-items: center; justify-content: center;
}

.btnHalfGhost {
  flex: 1; height: 44px; border-radius: 12px;
  background: transparent; border: 1px solid var(--color-text-disabled);
  display: flex; align-items: center; justify-content: center;
}

/* 幽灵按钮 */
.btnGhost {
  width: 100%; height: 44px; border-radius: 14px;
  background: transparent; border: 1px solid var(--color-bg-glass);
  display: flex; align-items: center; justify-content: center;
}

.btnText          { font-size: 26rpx; font-weight: 600; color: #fff; }
.btnTextSecondary { font-size: 24rpx; color: var(--color-text-secondary); }
.btnTextDanger    { font-size: 22rpx; color: var(--color-danger); }
```

- [ ] **Step 3: 验证三种状态渲染**

```
测试 1 (rescued): 橙色顶部 + 绿色横幅 + 全宽橙红主按钮 + 次按钮含超时分钟数
测试 2 (safe):    绿色顶部 + 蓝色推荐按钮 + 幽灵「维持原路线」
测试 3 (overtime):黄色顶部 + 黄色横幅 + 两个半宽并排按钮
测试 4: visible false→true → 600ms 分阶段入场动效
```

---

## Task 6: 途中助手页（src/pages/assistant/index.tsx）

**文件：**
- `src/pages/assistant/index.tsx`
- `src/pages/assistant/index.module.scss`

### 页面职责

AI 沉浸感对话页。核心 Demo 流程：

1. 页面加载 400ms 后，AI 发送问候语（流式打字机效果）
2. 用户点击快捷回复「排队多久」或「换一家」
3. AI「思考中」1200ms → 回复 + 400ms 后 RouteDiffCard 入场
4. 用户点击「立刻换！」→ RouteDiffCard 消失，AI 确认切换

### 布局

```
┌─────────────────────────────────┐
│ 途中助手     [行程进行中 第1站] │  ← 顶部栏（z-index:1）
├─────────────────────────────────┤
│  bgGlow（顶部极淡紫蓝光晕）     │
│  ScrollView（flex:1）           │
│    [AI 气泡（左侧蓝条）]        │
│        [用户气泡（右侧）]       │
│    [RouteDiffCard（行内）]      │
├─────────────────────────────────┤
│ [快捷回复横滑]                  │
│ [输入框........] [↑ 发送]      │  ← 毛玻璃 position:fixed
└─────────────────────────────────┘
```

### 关键实现细节

**背景径向光晕：** `radial-gradient(circle, rgba(123,47,255,0.06) 0%, transparent 70%)`，绝对定位于顶部中央，`pointer-events: none`。

**shadow-ai-ambient：** 施加于 `.messageList` 容器（`box-shadow: var(--shadow-ai-ambient)`），营造四周紫蓝环境光。

**ScrollView 自动滚底：** `scrollTop={scrollTopRef.current}` 绑定超大值（9999999）。

**快捷回复上下文感知：**

```typescript
const QUICK_REPLIES_MAP: Record<number, string[]> = {
  0: ['排队多久？', '换一家', '修改预算', '提前结束'],
  1: ['附近厕所', '下一站多远', '修改计划', '换一家'],
}
const quickReplies = QUICK_REPLIES_MAP[currentStopIndex] ?? QUICK_REPLIES_MAP[0]
```

**毛玻璃输入区：** `background: rgba(13,13,18,0.85)` + `backdrop-filter: blur(20px)` + `position: fixed; bottom: 0`。消息列表 `.messageInner` 底部 padding 设 120px 防遮挡。

**demoEngine 生命周期：** `useLoad` 中 schedule 问候语，`useUnload` 中 `demoEngine.destroy()` 清理 timer。

### 实现步骤

- [ ] **Step 1: 确认 assistant/index.tsx（已实现，重点检查快捷回复上下文感知和 ScrollView 滚底）**

核心已实现逻辑：

```tsx
useLoad(() => {
  demoEngine.schedule(() => {
    addMessage({ id: nextId(), role: 'ai', content: INITIAL_GREETING, isStreaming: true })
  }, 400)
})

useUnload(() => { demoEngine.destroy() })

const handleSend = useCallback((text: string) => {
  const trimmed = text.trim()
  if (!trimmed) return
  setInputValue('')
  addMessage({ id: nextId(), role: 'user', content: trimmed })
  const isQueueOrSwap = trimmed.includes('排队') || trimmed.includes('换')
  if (isQueueOrSwap) {
    setThinking(true)
    demoEngine.schedule(() => {
      setThinking(false)
      addMessage({ id: nextId(), role: 'ai', content: QUEUE_REPLY, isStreaming: true })
      demoEngine.schedule(() => setDiffVisible(true), 400)
    }, 1200)
  }
}, [addMessage])
```

- [ ] **Step 2: 创建 assistant/index.module.scss**

```scss
/* src/pages/assistant/index.module.scss */
@import '@/styles/theme.scss';

.page {
  position: relative; height: 100vh;
  background: var(--color-bg-base);
  display: flex; flex-direction: column; overflow: hidden;
}

.bgGlow {
  position: absolute; top: -80px; left: 50%; transform: translateX(-50%);
  width: 300px; height: 300px; border-radius: 50%;
  background: radial-gradient(circle, rgba(123,47,255,0.06) 0%, transparent 70%);
  pointer-events: none; z-index: 0;
}

.topBar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 20px 12px; position: relative; z-index: 1;
}

.topTitle { font-size: 36rpx; font-weight: 700; color: var(--color-text-primary); }

.tripPill {
  display: flex; align-items: center; gap: 6px;
  background: rgba(0,201,167,0.12); border: 1px solid rgba(0,201,167,0.3);
  border-radius: 100px; padding: 4px 10px;
}

.pillDot {
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--color-success);
  animation: dotBlink 2s ease-in-out infinite;
}

@keyframes dotBlink {
  0%, 100% { opacity: 1; } 50% { opacity: 0.3; }
}

.pillText { font-size: 20rpx; color: var(--color-success); font-weight: 500; }

.messageList {
  flex: 1; overflow: hidden; position: relative; z-index: 1;
  box-shadow: var(--shadow-ai-ambient);
}

.messageInner { padding: 8px 16px 120px; }

/* 底部毛玻璃输入区 */
.inputArea {
  position: fixed; bottom: 0; left: 0; right: 0;
  background: rgba(13,13,18,0.85);
  backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
  border-top: 1px solid var(--color-bg-glass);
  padding: 8px 16px calc(env(safe-area-inset-bottom) + 8px);
  z-index: 10;
}

.quickScroll { margin-bottom: 8px; white-space: nowrap; }

.quickRow { display: flex; gap: 8px; padding: 2px 0; }

.quickChip {
  display: inline-flex; align-items: center; padding: 6px 12px;
  background: var(--color-bg-glass); border: 1px solid rgba(255,255,255,0.08);
  border-radius: 100px; flex-shrink: 0;
}

.quickText { font-size: 22rpx; color: var(--color-text-secondary); }

.inputRow { display: flex; align-items: center; gap: 8px; }

.input {
  flex: 1; height: 40px; background: var(--color-bg-card);
  border-radius: 16px; padding: 0 14px;
  font-size: 28rpx; color: var(--color-text-primary);
}

.sendBtn {
  width: 40px; height: 40px; border-radius: 50%;
  background: var(--gradient-brand); box-shadow: var(--shadow-btn-primary);
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}

.sendIcon { font-size: 28rpx; color: #fff; font-weight: 700; }
```

- [ ] **Step 3: 完整 Demo 流程验证**

```
流程 1: 页面加载 → 400ms 后 AI 问候（打字机）
流程 2: 点击「排队多久？」→ 用户气泡 → ThinkingIndicator 1200ms → AI 回复 → RouteDiffCard 入场
流程 3a: 点击「立刻换！」→ RouteDiffCard 消失 → AI 确认
流程 3b: 点击「维持原路线（将超时15分钟）」→ AI 说明后果
验证: ScrollView 每次 addMessage 后自动滚底
验证: useUnload 后 demoEngine 被 destroy
```

---

## Task 7: 好友邀请落地页（src/pages/invite/landing/index.tsx）

**文件：**
- `src/pages/invite/landing/index.tsx`
- `src/pages/invite/landing/index.module.scss`

### 页面职责

好友通过微信转发卡片进入的落地页。展示行程信息，提供「加入这次行程」按钮（触发 `wx.getUserProfile`），然后跳转偏好收集页。

### 路由参数

`/pages/invite/landing/index?inviteCode=ABC123&tripId=trip-001`

### 边界情况

| 情况 | 处理 |
|---|---|
| 无 inviteCode | `useLoad` 中 `reLaunch` 首页 |
| `status='expired'` | 渲染过期页（⏰ + 提示联系发起人） |
| wx.getUserProfile 拒绝 | `showToast` + `joining=false` 恢复 |

### 实现步骤

- [ ] **Step 1: 确认 invite/landing/index.tsx（已实现，检查边界情况）**

已实现代码（边界情况）：

```tsx
useLoad(() => {
  if (!inviteCode) Taro.reLaunch({ url: '/pages/home/index' })
})

if (!inviteCode) return null  // 防止读取前闪现

if (invite.status === 'expired') {
  return (
    <View className={styles.page}>
      <View className={styles.expiredBox}>
        <Text className={styles.expiredIcon}>⏰</Text>
        <Text className={styles.expiredTitle}>邀请已过期</Text>
        <Text className={styles.expiredDesc}>该邀请链接已超过24小时失效</Text>
        <Text className={styles.expiredHint}>请联系 {invite.initiator} 重新发送邀请</Text>
      </View>
    </View>
  )
}

const handleJoin = () => {
  setJoining(true)
  Taro.getUserProfile({
    desc: '用于展示你的头像和昵称',
    success: () => { Taro.navigateTo({ url: '/pages/preference/index' }) },
    fail: () => {
      setJoining(false)
      Taro.showToast({ title: '需要授权才能加入', icon: 'none' })
    },
  })
}
```

- [ ] **Step 2: 创建 invite/landing/index.module.scss**

```scss
/* src/pages/invite/landing/index.module.scss */
@import '@/styles/theme.scss';

.page {
  min-height: 100vh; background: var(--color-bg-base);
  position: relative; display: flex; flex-direction: column; align-items: center;
}

.bgGradient {
  position: absolute; inset: 0;
  background: linear-gradient(180deg, rgba(255,92,43,0.08) 0%, transparent 40%);
  pointer-events: none; z-index: 0;
}

.skylineArea {
  width: 100%; height: 200px;
  display: flex; align-items: center; justify-content: center; position: relative; z-index: 1;
}

.skylineEmoji { font-size: 80rpx; }

.card {
  background: var(--color-bg-card); border-radius: 28px 28px 0 0;
  padding: 24px 20px 40px; width: 100%; flex: 1; position: relative; z-index: 1;
}

.initiatorRow { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }

.avatar {
  width: 44px; height: 44px; border-radius: 50%;
  background: var(--gradient-brand);
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}

.avatarText { font-size: 28rpx; font-weight: 700; color: #fff; }

.initiatorName { font-size: 30rpx; font-weight: 600; color: var(--color-text-primary); display: block; }
.initiatorLabel { font-size: 22rpx; color: var(--color-text-secondary); display: block; margin-top: 2px; }

.tripName {
  font-size: 40rpx; font-weight: 700; color: var(--color-text-primary);
  display: block; margin-bottom: 16px; line-height: 1.3;
}

.metaList { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
.metaItem { display: flex; align-items: center; gap: 8px; }
.metaIcon { font-size: 24rpx; }
.metaText { font-size: 26rpx; color: var(--color-text-secondary); }

.progressWrap { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
.progressTrack {
  flex: 1; height: 6px; background: var(--color-bg-glass); border-radius: 3px; overflow: hidden;
}
.progressFill {
  height: 100%; background: var(--gradient-brand); border-radius: 3px; transition: width 300ms ease;
}
.progressLabel { font-size: 22rpx; color: var(--color-text-secondary); flex-shrink: 0; }

.messageBox {
  background: var(--color-bg-glass); border-radius: 16px;
  padding: 12px 14px 12px 28px; margin-bottom: 20px; position: relative;
}

.messageQuote {
  font-size: 40rpx; color: var(--color-primary);
  position: absolute; top: 6px; left: 10px; line-height: 1;
}

.messageText { font-size: 24rpx; color: var(--color-text-secondary); line-height: 1.6; }

.joinBtn {
  width: 100%; height: 56px; border-radius: 14px;
  background: var(--gradient-brand); box-shadow: var(--shadow-btn-primary);
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 12px; transition: opacity 200ms ease;
}

.joinBtn.joinBtnLoading { opacity: 0.6; }
.joinBtnText { font-size: 32rpx; font-weight: 600; color: #fff; }
.hint { font-size: 20rpx; color: var(--color-text-disabled); text-align: center; display: block; }

/* 过期页 */
.expiredBox {
  flex: 1; display: flex; flex-direction: column; align-items: center;
  justify-content: center; padding: 40px 20px; gap: 12px;
}

.expiredIcon  { font-size: 80rpx; }
.expiredTitle { font-size: 36rpx; font-weight: 700; color: var(--color-text-primary); }
.expiredDesc  { font-size: 26rpx; color: var(--color-text-secondary); text-align: center; }
.expiredHint  { font-size: 22rpx; color: var(--color-text-disabled); text-align: center; line-height: 1.6; }
```

- [ ] **Step 3: 验证边界情况**

```
测试 1: inviteCode=ABC123 → 正常渲染，进度条 25%（1/4）
测试 2: 无 inviteCode → reLaunch 首页
测试 3: status='expired' → 过期页 + 联系 {initiator} 文字
测试 4: 点击「加入」→ getUserProfile 弹窗 → success → navigateTo 偏好页
测试 5: getUserProfile fail → showToast + joining=false 恢复
```

---

## Task 8: 全屏地图页（src/pages/map-fullscreen/index.tsx）

**文件：**
- `src/pages/map-fullscreen/index.tsx`
- `src/pages/map-fullscreen/index.module.scss`

### 页面职责

规避原生 `<map>` z-index 层级穿透问题的独立全屏地图页。详情页点击「展开」后 `navigateTo` 进入，地图完全占满屏幕，无其他覆盖元素，层级无冲突。

### 技术方案说明

原生 `<map>` 是微信 Native 层级，`z-index` CSS 属性无效，会穿透覆盖所有 webview 元素。解决方案：

1. 详情页内地图小窗：CSS 折叠（`height: 33vh→56px`），折叠态不在地图上叠加内容
2. 展开时：跳到独立 `map-fullscreen` 页，此页只有 `<Map>` + 两个毛玻璃浮层

### 关键实现细节

**`useMemo` 优化：** `markers` 和 `polyline` 用 `useMemo` 避免每次渲染重建大对象，减少 `<Map>` 无效 re-render。

**地图配置：**
- `scale={15}`：城市街道级，适合步行路线
- `showLocation={true}`：显示蓝色当前位置
- `enableZoom/Scroll={true}`，`enableRotate={false}`（禁止旋转）

**上海五角场真实坐标范围：**
- lat: 31.2940 ~ 31.3000
- lng: 121.5060 ~ 121.5110

### 实现步骤

- [ ] **Step 1: 确认 map-fullscreen/index.tsx（已实现，检查 useMemo 和 markers 格式）**

```tsx
// 关键已实现片段
const markers = useMemo(
  () => stops.map((stop, idx) => ({
    id: idx,
    latitude: stop.coord.lat, longitude: stop.coord.lng,
    title: stop.name, width: 28, height: 28,
    callout: {
      content: stop.name, color: '#F2F2F5', bgColor: '#1C1C26',
      padding: 6, borderRadius: 6, display: 'BYCLICK',
    },
  })),
  [stops]
)

const polyline = useMemo(
  () => stops.length >= 2 ? [{
    points: stops.map(s => ({ latitude: s.coord.lat, longitude: s.coord.lng })),
    color: '#FF5C2B', width: 6, arrowLine: true,
  }] : [],
  [stops]
)
```

- [ ] **Step 2: 创建 map-fullscreen/index.module.scss**

```scss
/* src/pages/map-fullscreen/index.module.scss */

.page {
  position: relative; width: 100vw; height: 100vh;
  background: #0D0D12; overflow: hidden;
}

.map { width: 100%; height: 100%; }

/* 毛玻璃返回按钮（左上角） */
.backBtn {
  position: fixed; top: calc(env(safe-area-inset-top) + 16px); left: 16px;
  display: flex; align-items: center; gap: 6px;
  background: rgba(13,13,18,0.75); backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.08); border-radius: 100px;
  padding: 8px 14px; z-index: 10;
}

.backIcon { font-size: 28rpx; color: #F2F2F5; }
.backText  { font-size: 26rpx; color: #F2F2F5; font-weight: 500; }

/* 路线名标签（左下角） */
.routeLabel {
  position: fixed; bottom: calc(env(safe-area-inset-bottom) + 16px); left: 16px;
  background: rgba(13,13,18,0.85); backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.06); border-radius: 14px;
  padding: 10px 14px; z-index: 10;
}

.routeLabelText { font-size: 26rpx; font-weight: 600; color: #F2F2F5; display: block; }
.routeLabelSub  { font-size: 20rpx; color: #9494A8; display: block; margin-top: 2px; }
```

- [ ] **Step 3: 确认 routes.json 包含上海真实坐标**

```json
// src/services/mock/routes.json（示例）
[{
  "id": "route-photo",
  "name": "拍照出片线（AI推荐）",
  "stops": [
    { "id": "s1", "name": "五角场合生汇",  "coord": { "lat": 31.2978, "lng": 121.5074 } },
    { "id": "s2", "name": "网红鸳鸯锅",    "coord": { "lat": 31.2966, "lng": 121.5102 } },
    { "id": "s3", "name": "大学路网红墙",  "coord": { "lat": 31.2946, "lng": 121.5063 } },
    { "id": "s4", "name": "SeeSaw咖啡",   "coord": { "lat": 31.2955, "lng": 121.5080 } }
  ]
}]
```

- [ ] **Step 4: 验证**

```
测试 1: routeId='route-photo' → 全屏地图显示 4 个标注 + 橙色箭头路径
测试 2: 点击标注点 → callout 显示站点名
测试 3: 返回按钮 → navigateBack
测试 4: routeId 不存在 → 降级显示 routes[0]
```

---

## Task 9: 路线详情页整合（src/pages/route-detail/index.tsx）

**文件：**
- `src/pages/route-detail/index.tsx`
- `src/pages/route-detail/index.module.scss`

### 页面职责

整合 TransitionOverlay（入场转场）、地图小窗折叠（33vh→56px）、时间轴（Timeline）、脉冲光圈（当前站点）以及 RippleOverlay（离场转场）为完整路线详情体验。

### 布局结构

```
[TransitionOverlay] position:fixed z-index:100（挂载时）
[mapContainer 33vh→56px]
[ScrollView flex:1]
  └── Timeline（各站点卡片，当前站脉冲光圈）
[floatingBar] position:absolute bottom:0（呼叫助手 FAB + 导航按钮）
[RippleOverlay] position:fixed z-index:200（FAB 点击后）
```

### MapWindow 折叠

```typescript
const handleScroll = (e: any) => {
  setMapCollapsed(e.detail.scrollTop > 60)
}
```

```scss
.mapContainer {
  height: 33vh; flex-shrink: 0;
  transition: height 350ms cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}
.mapContainer.mapCollapsed { height: 56px; }
```

**注意：** `height: auto` 不可 CSS `transition`，必须在两个固定值之间过渡。

### 脉冲光圈（当前站点节点）

规范要求双层扩散 + `shadow-timeline-active`（三层橙色光晕）：

```scss
/* Timeline 中的当前站点节点 */
.nodeActive {
  width: 14px; height: 14px; border-radius: 50%;
  background: var(--color-primary);
  box-shadow: var(--shadow-timeline-active);
  position: relative;
}

.nodeActive::before {
  content: ''; position: absolute; inset: -8px; border-radius: 50%;
  border: 2px solid var(--color-primary);
  animation: pulseRing 2s ease-out infinite;
}

.nodeActive::after {
  content: ''; position: absolute; inset: -4px; border-radius: 50%;
  border: 2px solid rgba(255,92,43,0.6);
  animation: pulseRing 2s ease-out 0.5s infinite;
}

@keyframes pulseRing {
  0%   { transform: scale(1);   opacity: 0.6; }
  100% { transform: scale(1.8); opacity: 0; }
}
```

### 底部悬浮操作栏

`position: absolute; bottom: 0`（非 `fixed`，规避 ScrollView 内 fixed 定位错误）：

```tsx
<View className={styles.floatingBar}>
  <View id="fab-assistant" className={styles.fabBtn} onClick={handleCallAssistant}>
    <Text className={styles.fabIcon}>🤖</Text>
    <Text className={styles.fabLabel}>呼叫AI助手</Text>
  </View>
  <View className={styles.navBtn}>
    <Text className={styles.navText}>导航到下一站</Text>
    <Text className={styles.navArrow}>→</Text>
  </View>
</View>
```

阴影：`box-shadow: var(--shadow-floating-bar)`。

### 实现步骤

- [ ] **Step 1: 创建路线详情页核心结构**

```tsx
// src/pages/route-detail/index.tsx（核心结构）
import TransitionOverlay from '@/components/business/TransitionOverlay'
import RippleOverlay from '@/components/animation/RippleOverlay'
import MapWindow from '@/components/business/MapWindow'
import Timeline from '@/components/business/Timeline'
import { useRouteStore } from '@/stores/useRouteStore'
import { useTripStore } from '@/stores/useTripStore'

export default function RouteDetailPage() {
  const [transitionDone, setTransitionDone] = useState(false)
  const [mapCollapsed, setMapCollapsed] = useState(false)
  const [rippleOrigin, setRippleOrigin] = useState<{x:number, y:number} | null>(null)
  const selectedRoute = useRouteStore(s => s.selectedRoute)
  const { currentStopIndex, completedStops } = useTripStore()

  const handleScroll = (e: any) => setMapCollapsed(e.detail.scrollTop > 60)

  const handleCallAssistant = () => {
    Taro.createSelectorQuery()
      .select('#fab-assistant')
      .boundingClientRect((rect: any) => {
        setRippleOrigin({
          x: rect ? rect.left + rect.width / 2 : 300,
          y: rect ? rect.top + rect.height / 2 : 600,
        })
      }).exec()
  }

  return (
    <View className={styles.page}>
      {!transitionDone && <TransitionOverlay onDone={() => setTransitionDone(true)} />}
      <View
        className={styles.content}
        style={{ opacity: transitionDone ? 1 : 0, transition: 'opacity 200ms ease' } as any}
      >
        <View className={`${styles.mapContainer} ${mapCollapsed ? styles.mapCollapsed : ''}`}>
          <MapWindow
            routeId={selectedRoute?.id}
            collapsed={mapCollapsed}
            onExpand={() => Taro.navigateTo({
              url: `/subpackages/map-fullscreen/index?routeId=${selectedRoute?.id ?? ''}`
            })}
            currentStopIndex={currentStopIndex}
          />
        </View>
        <ScrollView scrollY className={styles.scrollView} onScroll={handleScroll}>
          <Timeline
            stops={selectedRoute?.stops ?? []}
            currentStopIndex={currentStopIndex}
            completedStops={completedStops}
          />
          <View style={{ height: '100px' }} />
        </ScrollView>
        <View className={styles.floatingBar}>
          <View id="fab-assistant" className={styles.fabBtn} onClick={handleCallAssistant}>
            <Text className={styles.fabIcon}>🤖</Text>
            <Text className={styles.fabLabel}>呼叫AI助手</Text>
          </View>
          <View className={styles.navBtn}>
            <Text className={styles.navText}>导航到下一站</Text>
            <Text className={styles.navArrow}>→</Text>
          </View>
        </View>
      </View>
      {rippleOrigin && (
        <RippleOverlay
          originX={rippleOrigin.x}
          originY={rippleOrigin.y}
          onComplete={() => Taro.navigateTo({ url: '/subpackages/assistant/index' })}
        />
      )}
    </View>
  )
}
```

- [ ] **Step 2: 创建 route-detail/index.module.scss**

```scss
/* src/pages/route-detail/index.module.scss */
@import '@/styles/theme.scss';

.page {
  position: relative; height: 100vh;
  background: var(--color-bg-base); overflow: hidden;
}

.content { display: flex; flex-direction: column; height: 100vh; }

.mapContainer {
  height: 33vh; flex-shrink: 0;
  transition: height 350ms cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden; position: relative;
}

.mapContainer.mapCollapsed { height: 56px; }

.scrollView { flex: 1; overflow: hidden; }

.floatingBar {
  position: absolute; bottom: 0; left: 0; right: 0;
  padding: 12px 16px calc(env(safe-area-inset-bottom) + 12px);
  display: flex; align-items: center; gap: 10px;
  background: rgba(13,13,18,0.85); backdrop-filter: blur(16px);
  box-shadow: var(--shadow-floating-bar); z-index: 5;
}

.fabBtn {
  display: flex; align-items: center; gap: 6px;
  background: var(--color-bg-card); border: 1px solid var(--color-bg-glass);
  border-radius: 14px; padding: 10px 14px; flex-shrink: 0;
}

.fabIcon { font-size: 28rpx; }
.fabLabel { font-size: 24rpx; color: var(--color-text-secondary); }

.navBtn {
  flex: 1; height: 48px; border-radius: 14px;
  background: var(--gradient-brand); box-shadow: var(--shadow-btn-primary);
  display: flex; align-items: center; justify-content: center; gap: 8px;
}

.navText  { font-size: 28rpx; font-weight: 600; color: #fff; }
.navArrow { font-size: 28rpx; color: #fff; }
```

- [ ] **Step 3: 确认子组件已存在**

```
src/components/business/MapWindow/index.tsx    → 地图小窗（支持 collapsed 和 onExpand props）
src/components/business/Timeline/index.tsx     → 时间轴（含脉冲光圈 CSS）
src/components/business/PlanBSheet/index.tsx   → Plan B 底部弹层（长按站点卡片触发）
```

- [ ] **Step 4: 完整集成验证**

```
测试 1: 从对比页点击卡片 → TransitionOverlay 橙色遮罩展开全屏（420ms）→ 内容淡入
测试 2: 向下滚动 > 60px → mapContainer 折叠到 56px（350ms 过渡）
测试 3: 折叠态点击「展开」→ navigateTo map-fullscreen
测试 4: 点击「呼叫AI助手」→ RippleOverlay 从 FAB 扩散 → 400ms 后 navigateTo assistant
测试 5: 当前站点有双层 pulseRing + shadow-timeline-active 橙红光晕
测试 6: 已完成站点 opacity:0.5 + 绿勾
```

---

## Task 10: Store 依赖检查

### Plan D 各页面的 Store 依赖清单

```typescript
// AssistantPage
useTripStore.currentStopIndex          // 「行程进行中 第N站」

// RouteDetailPage
useRouteStore.selectedRoute            // 路线数据（stops 列表）
useRouteStore.transitionRect           // TransitionOverlay 坐标
useTripStore.currentStopIndex          // 当前站点高亮
useTripStore.completedStops            // 已完成站点 dim 处理

// RouteDiffCard（间接）
useSessionStore.endTime                // deadline，用于 timeStatus 推导
```

### 必需字段清单

```typescript
// useSessionStore — 需包含
endTime: string  // "21:00"

// useRouteStore — 需包含
selectedRoute: RouteData | null
transitionRect: { top: number; left: number; width: number; height: number } | null
setTransitionRect: (rect: ...) => void

// useTripStore — 需包含
currentStopIndex: number         // 默认 0
completedStops: string[]          // 已完成站点 id 列表，默认 []
markStopComplete: (stopId: string) => void
```

### 实现步骤

- [ ] **Step 1: 检查 useSessionStore 是否包含 `endTime` 字段**
- [ ] **Step 2: 检查 useRouteStore 是否包含 `transitionRect` 字段**
- [ ] **Step 3: 检查 useTripStore 是否包含 `currentStopIndex` 和 `completedStops`**

---

## Task 11: 分包配置

**文件：** `src/app.config.ts`

### 分包策略

| 页面 | 包 | 原因 |
|---|---|---|
| `home/index` | 主包 | 首页必须主包 |
| `preference/index` | 主包 | 开场核心流程 |
| `route-compare/index` | 主包 | 关键决策页面 |
| `invite/landing/index` | 主包 | 分享落地页需快速加载 |
| `route-detail/index` | 分包 | 含腾讯地图 SDK（大体积） |
| `assistant/index` | 分包 | 非首路径，延迟加载无感 |
| `map-fullscreen/index` | 分包 | 与 route-detail 同分包 |

### 实现步骤

- [ ] **Step 1: 确认 app.config.ts 分包配置**

```typescript
// src/app.config.ts
export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/preference/index',
    'pages/route-compare/index',
    'pages/invite/landing/index',
  ],
  subPackages: [{
    root: 'subpackages',
    pages: [
      'route-detail/index',
      'assistant/index',
      'map-fullscreen/index',
    ],
  }],
  window: {
    backgroundTextStyle: 'dark',
    navigationBarBackgroundColor: '#0D0D12',
    navigationBarTitleText: '拼程',
    navigationBarTextStyle: 'white',
    backgroundColor: '#0D0D12',
  },
})
```

- [ ] **Step 2: 更新所有 navigateTo 分包路径**

```typescript
Taro.navigateTo({ url: '/subpackages/route-detail/index?routeId=route-photo' })
Taro.navigateTo({ url: '/subpackages/assistant/index' })
Taro.navigateTo({ url: '/subpackages/map-fullscreen/index?routeId=route-photo' })
```

---

## Task 12: 端到端 Demo 链路验收

**Plan D 完整路演流程（从路线对比页开始）：**

```
─── Step 1: 共享元素转场 ───
点击「拍照出片线（AI推荐）」卡片
→ RouteCard 记录 rect → useRouteStore.transitionRect 写入
→ navigateTo /subpackages/route-detail/index
→ TransitionOverlay 橙红色遮罩从卡片展开全屏（420ms，cubic-bezier(0.4,0,0.2,1)）
→ onDone 后详情内容淡入（200ms）

─── Step 2: 详情页交互 ───
地图小窗（33vh）显示五角场路线 + 橙色箭头路径
当前站点（网红鸳鸯锅）节点有双层脉冲光圈 + shadow-timeline-active
向下滚动时间轴 → 地图折叠为 56px 路线条（350ms 过渡）
点击「展开」→ navigateTo map-fullscreen → 全屏地图 → 返回

─── Step 3: 呼叫助手（波纹转场）───
点击右下角「呼叫AI助手」FAB
→ createSelectorQuery 获取 FAB 坐标
→ RippleOverlay 挂载，橙色圆从 FAB 中心扩散
→ 400ms 时 navigateTo /subpackages/assistant/index

─── Step 4: 助手页 AI 对话 ───
400ms 后 AI 问候出现（蓝竖条 + 打字机 clip-path 擦出）
点击「排队多久？」→ 用户气泡（橙色渐变，右侧）
→ ThinkingIndicator 三点律动（1200ms）
→ AI 回复「刚查了…」（打字机）
→ 400ms 后 RouteDiffCard 入场（600ms 分阶段）

─── Step 5: Route Diff 决策 ───
RouteDiffCard（rescued 状态）：
  橙色顶部「路线变更建议 / 换了能准时！」
  绿色横幅「换了能准时！节省27分钟」
  左栏得到：+27分钟 / -¥17/人 / 弄堂里的湖南菜（等5分钟，20:48结束）
  右栏失去：-0.2★ / +420米 / 网红鸳鸯锅（排队58分钟，21:15结束）
  全宽橙红主按钮「立刻换！去弄堂里的湖南菜」

点击「立刻换！」→ RouteDiffCard 消失（state 重置）→ AI 确认「已切换，20:48结束」

[演示结束，总耗时约 90 秒]
[路演加速：MOCK_SPEED=0.3，全程约 27 秒]
```

### 整体验收 Checklist

- [ ] TransitionOverlay：共享元素展开 420ms；无 rect 时直接降级；onDone 只触发一次
- [ ] RippleOverlay：橙色圆从 FAB 扩散，400ms navigateTo；createSelectorQuery 失败有降级
- [ ] ChatBubble：AI 气泡 3px 蓝竖条 + 打字机（分属性 animationName 写法）；用户气泡右对齐渐变
- [ ] ThinkingIndicator：三点律动 stagger（0/160/320ms）；thinking=false 后组件取消挂载
- [ ] RouteDiffCard：三种状态正确渲染；600ms 入场；次按钮超时分钟数动态计算；无二次确认弹窗
- [ ] AssistantPage：bgGlow 光晕；shadow-ai-ambient 环境光；tripPill 闪烁绿点；毛玻璃输入区；ScrollView 滚底
- [ ] InviteLandingPage：无 inviteCode 时 reLaunch；expired 过期页；getUserProfile 完整流程
- [ ] MapFullscreen：全屏 Map；markers + polyline；毛玻璃浮层；routeId 降级
- [ ] RouteDetailPage：TransitionOverlay + 地图折叠 + 脉冲光圈 + RippleOverlay 全协同
- [ ] 分包路径正确（route-detail / assistant / map-fullscreen 在 subpackages 下）
- [ ] demoEngine.destroy() 在 useUnload 中调用，无内存泄漏
