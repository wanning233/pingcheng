# 拼程小程序 Plan A：脚手架 + 设计系统 + 数据层

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 从零搭建Taro项目骨架，建立完整设计系统（CSS变量/关键帧），实现5个Zustand Store和完整Mock数据层。

**Architecture:** Taro 3.6.x + React 18 + TypeScript。主包含home/preference/route-compare，分包含route-detail/assistant/map-fullscreen。所有数据为本地Mock JSON，MockEngine支持3倍速演示。

**Tech Stack:** Taro 3.6.x, React 18, TypeScript, NutUI-React 2.x, Zustand, CSS Modules + SCSS

---

### Task 1: Taro脚手架初始化

**Files:**
- Create: `pincheng/` (项目根目录)

- [ ] **Step 1: 使用Taro CLI初始化项目**

```bash
npx @tarojs/cli@3.6.25 init pincheng \
  --template default \
  --framework react \
  --css scss \
  --typescript
```

- [ ] **Step 2: 验证**
Run: `cd pincheng && ls src/`
Expected: `app.config.ts  app.scss  app.tsx  index.html  pages/`

- [ ] **Step 3: Commit**
```bash
git init
git add .
git commit -m "feat: init Taro 3.6.x React TypeScript project"
```

---

### Task 2: 依赖安装与配置

**Files:**
- Modify: `package.json`
- Modify: `config/index.ts`
- Create: `tsconfig.json` (更新paths)

- [ ] **Step 1: 安装依赖**

```bash
# UI库 + 状态管理
npm install @nutui/nutui-react-taro@2.0.0 zustand@4.4.7

# 类型
npm install -D @types/react@18.2.55

# SCSS
npm install -D sass@1.70.0
```

- [ ] **Step 2: 配置路径别名（config/index.ts）**

```typescript
import path from 'path'
import { defineConfig } from '@tarojs/cli'

export default defineConfig({
  projectName: 'pincheng',
  date: '2026-04-30',
  designWidth: 750,
  deviceRatio: {
    640: 2.34 / 2,
    750: 1,
    828: 1.81 / 2,
  },
  sourceRoot: 'src',
  outputRoot: 'dist',
  plugins: [],
  defineConstants: {},
  copy: { patterns: [], options: {} },
  framework: 'react',
  compiler: 'webpack5',
  cache: { enable: false },
  mini: {
    postcss: {
      pxtransform: { enable: true, config: {} },
      url: { enable: true, config: { limit: 1024 } },
      cssModules: {
        enable: true,
        config: { namingPattern: 'module', generateScopedName: '[name]__[local]___[hash:base64:5]' },
      },
    },
    webpackChain(chain) {
      chain.resolve.alias.set('@', path.resolve(__dirname, '..', 'src'))
    },
  },
  h5: {
    publicPath: '/',
    staticDirectory: 'static',
    router: { mode: 'browser' },
    postcss: {
      autoprefixer: { enable: true, config: {} },
      cssModules: {
        enable: false,
        config: { namingPattern: 'module', generateScopedName: '[name]__[local]___[hash:base64:5]' },
      },
    },
    webpackChain(chain) {
      chain.resolve.alias.set('@', path.resolve(__dirname, '..', 'src'))
    },
  },
})
```

- [ ] **Step 3: 更新 tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES6",
    "lib": ["ES6", "DOM"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": false,
    "forceConsistentCasingInFileNames": true,
    "module": "CommonJS",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "outDir": "./dist",
    "noEmit": true,
    "incremental": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    },
    "jsx": "react-jsx",
    "jsxImportSource": "react"
  },
  "include": ["src", "types", "config", "babel.config.js"]
}
```

- [ ] **Step 4: 验证**
Run: `npm run build:weapp 2>&1 | tail -5`
Expected: `✔ Webpack 编译成功` 或无报错退出

- [ ] **Step 5: Commit**
```bash
git add .
git commit -m "feat: install deps and configure alias @/"
```

---

### Task 3: app.config.ts（含分包配置）

**Files:**
- Modify: `src/app.config.ts`

- [ ] **Step 1: 写入完整 app.config.ts**

```typescript
export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/preference/index',
    'pages/route-compare/index',
    'pages/invite/landing/index',
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
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#0D0D12',
    navigationBarTitleText: '拼程',
    navigationBarTextStyle: 'white',
    backgroundColor: '#0D0D12',
  },
  style: 'v2',
  singlePage: {},
})
```

- [ ] **Step 2: 创建所有页面占位文件**

```bash
# 主包页面
mkdir -p src/pages/home src/pages/preference src/pages/route-compare src/pages/invite/landing

# 分包页面
mkdir -p src/pages/route-detail src/pages/assistant src/pages/map-fullscreen
```

为每个页面创建最小化 `index.tsx`（以 home 为例，其余同理）：

```tsx
// src/pages/home/index.tsx
import { View } from '@tarojs/components'
import React from 'react'

export default function HomePage() {
  return <View>home</View>
}
```

```tsx
// src/pages/preference/index.tsx
import { View } from '@tarojs/components'
import React from 'react'

export default function PreferencePage() {
  return <View>preference</View>
}
```

```tsx
// src/pages/route-compare/index.tsx
import { View } from '@tarojs/components'
import React from 'react'

export default function RouteComparePage() {
  return <View>route-compare</View>
}
```

```tsx
// src/pages/invite/landing/index.tsx
import { View } from '@tarojs/components'
import React from 'react'

export default function InviteLandingPage() {
  return <View>invite-landing</View>
}
```

```tsx
// src/pages/route-detail/index.tsx
import { View } from '@tarojs/components'
import React from 'react'

export default function RouteDetailPage() {
  return <View>route-detail</View>
}
```

```tsx
// src/pages/assistant/index.tsx
import { View } from '@tarojs/components'
import React from 'react'

export default function AssistantPage() {
  return <View>assistant</View>
}
```

```tsx
// src/pages/map-fullscreen/index.tsx
import { View } from '@tarojs/components'
import React from 'react'

export default function MapFullscreenPage() {
  return <View>map-fullscreen</View>
}
```

- [ ] **Step 3: 验证**
Run: `npm run build:weapp 2>&1 | grep -E "(error|Error|✔)" | head -10`
Expected: `✔ Webpack 编译成功`

- [ ] **Step 4: Commit**
```bash
git add src/app.config.ts src/pages/
git commit -m "feat: add app.config.ts with subpackages and all page stubs"
```

---

### Task 4: src/styles/theme.scss（全量CSS变量）

**Files:**
- Create: `src/styles/theme.scss`

- [ ] **Step 1: 创建目录并写入 theme.scss**

```bash
mkdir -p src/styles
```

```scss
// src/styles/theme.scss
// 拼程设计系统 — 全量 CSS 变量
// 深色主题，日落橙 × 宇宙蓝

:root {
  // ---- 背景层级 ----
  --color-bg-base:    #0D0D12;
  --color-bg-card:    #1C1C26;
  --color-bg-glass:   rgba(255, 255, 255, 0.06);

  // ---- 主色 ----
  --color-primary:       #FF5C2B;
  --color-primary-light: #FF7A47;

  // ---- 辅助色 ----
  --color-accent:   #4D6EFF;
  --color-success:  #00C9A7;
  --color-warning:  #FFB800;
  --color-danger:   #FF4757;

  // ---- 文字层级 ----
  --color-text-primary:   #F2F2F5;
  --color-text-secondary: #9494A8;
  --color-text-disabled:  #4A4A5E;

  // ---- 渐变 ----
  --gradient-brand: linear-gradient(135deg, #FF5C2B, #FFB300);
  --gradient-ai:    linear-gradient(135deg, #4D6EFF, #7B2FFF);
  --gradient-mask:  linear-gradient(180deg, transparent, rgba(13, 13, 18, 0.85));

  // ---- 圆角 ----
  --radius-card-lg: 20px;
  --radius-card-md: 16px;
  --radius-btn:     14px;
  --radius-tag:     8px;
  --radius-icon:    12px;
  --radius-input:   16px;
  --radius-sheet:   28px 28px 0 0;

  // ---- 间距（4px 基础单位） ----
  --space-xs:  4px;
  --space-s:   8px;
  --space-m:   12px;
  --space-l:   16px;
  --space-xl:  20px;
  --space-2xl: 24px;
  --space-3xl: 32px;

  // ---- 彩色阴影系统 ----

  // 主按钮 — 橙红燃烧感
  --shadow-btn-primary:
    0 4px 12px rgba(255, 92, 43, 0.55),
    0 8px 32px rgba(255, 92, 43, 0.25);

  // AI推荐卡片 — 电蓝+橙红双色
  --shadow-card-recommend:
    0  2px  8px rgba(77, 110, 255, 0.20),
    0  8px 24px rgba(77, 110, 255, 0.30),
    0 16px 48px rgba(77, 110, 255, 0.15),
    0  0  32px  rgba(255, 92, 43, 0.08);

  // 普通卡片默认态
  --shadow-card-default:
    0 2px  8px rgba(10, 10, 20, 0.60),
    0 4px 16px rgba(10, 10, 20, 0.40);

  // 卡片选中态 — 橙红
  --shadow-card-selected:
    0  2px  6px rgba(255, 92, 43, 0.30),
    0  6px 20px rgba(255, 92, 43, 0.20),
    0 12px 40px rgba(255, 92, 43, 0.10);

  // 底部悬浮操作栏
  --shadow-floating-bar:
    0 -4px  16px rgba(255, 92, 43, 0.18),
    0 -1px  32px rgba(255, 92, 43, 0.08),
    0 -12px 48px rgba(10, 10, 20, 0.50);

  // Route Diff 卡片 — 青绿
  --shadow-card-diff:
    0  2px  8px rgba(0, 201, 167, 0.20),
    0  8px 24px rgba(0, 201, 167, 0.15),
    0 16px 40px rgba(0, 201, 167, 0.08);

  // 时间轴当前节点 — 信标感
  --shadow-timeline-active:
    0 0  0  3px rgba(255, 92, 43, 0.25),
    0 0 12px 4px rgba(255, 92, 43, 0.50),
    0 0 24px 8px rgba(255, 92, 43, 0.20);

  // 途中助手 AI 环境光
  --shadow-ai-ambient:
    0  0  40px  16px rgba(138, 92, 246, 0.18),
    0  0  80px  32px rgba(138, 92, 246, 0.10),
    0  8px 24px  8px rgba(77, 110, 255, 0.12),
    0  0  120px 48px rgba(255, 92, 43, 0.05);
}
```

- [ ] **Step 2: 在 app.scss 中导入**

```scss
// src/app.scss
@import './styles/theme.scss';

page {
  background-color: var(--color-bg-base);
  color: var(--color-text-primary);
  font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, sans-serif;
  font-variant-numeric: tabular-nums;
  min-height: 100vh;
  box-sizing: border-box;
}
```

- [ ] **Step 3: 验证**
Run: `npm run build:weapp 2>&1 | grep -E "(error|Error|✔)" | head -5`
Expected: `✔ Webpack 编译成功`

- [ ] **Step 4: Commit**
```bash
git add src/styles/theme.scss src/app.scss
git commit -m "feat: add full CSS variable design system (theme.scss)"
```

---

### Task 5: src/styles/animation.scss（全量关键帧）

**Files:**
- Create: `src/styles/animation.scss`

- [ ] **Step 1: 写入 animation.scss**

```scss
// src/styles/animation.scss
// 拼程动效系统 — 全量关键帧

// 打字机效果（clip-path方案，性能优于逐字setData）
@keyframes textReveal {
  from { clip-path: inset(0 100% 0 0); }
  to   { clip-path: inset(0 0% 0 0); }
}

// 地图 pulse 光圈 — 双层扩散，当前站点节点使用
@keyframes pulseRing {
  0% {
    transform: scale(1);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.6);
    opacity: 0.4;
  }
  100% {
    transform: scale(2.2);
    opacity: 0;
  }
}

// 头像填写中 — 呼吸光效
@keyframes breathe {
  0%   { box-shadow: 0 0 0 0px rgba(255, 92, 43, 0.60); }
  50%  { box-shadow: 0 0 0 6px rgba(255, 92, 43, 0.20); }
  100% { box-shadow: 0 0 0 0px rgba(255, 92, 43, 0.00); }
}

// 集结爆发帧 — 白色冲击波圆环，150ms极速
@keyframes shockwave {
  0%   { transform: scale(0);   opacity: 1; }
  100% { transform: scale(1.8); opacity: 0; }
}

// AI思考三点律动
@keyframes dotBounce {
  0%, 80%, 100% { transform: translateY(0);    opacity: 0.4; }
  40%           { transform: translateY(-6px); opacity: 1;   }
}

// 卡片入场 — 路线对比页三卡片瀑布入场
@keyframes cardEntrance {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

// 头像锁定动效 — 集结完成最后一人确认
@keyframes avatarLock {
  0%   { transform: scale(1);   }
  33%  { transform: scale(0.9); }
  66%  { transform: scale(1.1); }
  100% { transform: scale(1.0); }
}

// 内容浮现 — 「4人集结完成！」文字入场
@keyframes contentReveal {
  from {
    filter: blur(8px);
    transform: translateY(12px);
    opacity: 0;
  }
  to {
    filter: blur(0);
    transform: translateY(0);
    opacity: 1;
  }
}

// 边框颜色过渡（冲突 → 解决）
@keyframes borderResolve {
  from { border-color: #FF5C2B; }
  to   { border-color: #00C9A7; }
}

// 成功圆弧扩散 — 偏好收集完成者头像外圈
@keyframes arcExpand {
  0%   { stroke-dashoffset: 100; opacity: 0;   }
  20%  { opacity: 1; }
  100% { stroke-dashoffset: 0;   opacity: 1;   }
}

// Route Diff 卡片入场
@keyframes diffCardEntrance {
  from {
    transform: translateY(60px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

// 页面被吸入（任意→首页 reLaunch 出场）
@keyframes pageAbsorb {
  from {
    transform: scale(1);
    opacity: 1;
  }
  to {
    transform: scale(1.05);
    opacity: 0;
  }
}

// 首页内容交错入场
@keyframes staggerFadeIn {
  from {
    transform: translateY(16px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

// ---- 工具类（可在 CSS Modules 内 composes 使用） ----

.animate-text-reveal {
  animation: textReveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.animate-card-entrance {
  animation: cardEntrance 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

.animate-content-reveal {
  animation: contentReveal 0.4s ease-out forwards;
}

.animate-dot-bounce {
  display: inline-block;
  animation: dotBounce 1.4s ease-in-out infinite;
  &:nth-child(2) { animation-delay: 0.2s; }
  &:nth-child(3) { animation-delay: 0.4s; }
}

.animate-breathe {
  animation: breathe 2s ease-in-out infinite;
}

.animate-pulse-ring {
  animation: pulseRing 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

- [ ] **Step 2: 在 app.scss 中导入**

```scss
// src/app.scss（在 theme.scss 之后追加）
@import './styles/theme.scss';
@import './styles/animation.scss';

page {
  background-color: var(--color-bg-base);
  color: var(--color-text-primary);
  font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, sans-serif;
  font-variant-numeric: tabular-nums;
  min-height: 100vh;
  box-sizing: border-box;
}
```

- [ ] **Step 3: 验证**
Run: `npm run build:weapp 2>&1 | grep -E "(error|Error|✔)" | head -5`
Expected: `✔ Webpack 编译成功`

- [ ] **Step 4: Commit**
```bash
git add src/styles/animation.scss src/app.scss
git commit -m "feat: add full animation keyframes (animation.scss)"
```

---

### Task 6: 5个Zustand Store

**Files:**
- Create: `src/stores/useSessionStore.ts`
- Create: `src/stores/usePreferenceStore.ts`
- Create: `src/stores/useRouteStore.ts`
- Create: `src/stores/useTripStore.ts`
- Create: `src/stores/useUIStore.ts`

- [ ] **Step 1: 创建目录**

```bash
mkdir -p src/stores
```

- [ ] **Step 2: useSessionStore.ts**

```typescript
// src/stores/useSessionStore.ts
import { create } from 'zustand'

interface SessionState {
  area: string
  city: string
  startTime: string
  endTime: string
  budgetPerPerson: number
  peopleCount: number
  setSession: (patch: Partial<Omit<SessionState, 'setSession'>>) => void
}

export const useSessionStore = create<SessionState>((set) => ({
  area: '',
  city: '上海',
  startTime: '',
  endTime: '21:00',
  budgetPerPerson: 120,
  peopleCount: 4,
  setSession: (patch) => set((state) => ({ ...state, ...patch })),
}))
```

- [ ] **Step 3: usePreferenceStore.ts**

```typescript
// src/stores/usePreferenceStore.ts
import { create } from 'zustand'

export interface Member {
  id: string
  name: string
  avatar: string
  status: 'pending' | 'filling' | 'done'
}

export interface Conflict {
  id: string
  type: 'taste' | 'budget' | 'energy'
  members: string[]
  description: string
  resolution: string
  resolved: boolean
}

interface PreferenceState {
  members: Member[]
  conflicts: Conflict[]
  setMembers: (members: Member[]) => void
  addConflict: (conflict: Conflict) => void
  resolveConflict: (conflictId: string) => void
}

export const usePreferenceStore = create<PreferenceState>((set) => ({
  members: [],
  conflicts: [],
  setMembers: (members) => set({ members }),
  addConflict: (conflict) =>
    set((state) => ({ conflicts: [...state.conflicts, conflict] })),
  resolveConflict: (conflictId) =>
    set((state) => ({
      conflicts: state.conflicts.map((c) =>
        c.id === conflictId ? { ...c, resolved: true } : c
      ),
    })),
}))
```

- [ ] **Step 4: useRouteStore.ts**

```typescript
// src/stores/useRouteStore.ts
import { create } from 'zustand'

export interface Stop {
  id: string
  name: string
  category: string
  coord: { lat: number; lng: number }
  arriveTime: string
  stayMinutes: number
  completed: boolean
  queueRisk: 'low' | 'medium' | 'high'
  estimatedQueueMinutes: number
  planB: PlanBItem[]
  tags: string[]
  ugcHighlight: string
}

export interface PlanBItem {
  id: string
  name: string
  reason: string
  rating: number
  pricePerPerson: number
  estimatedQueueMinutes: number
  walkMinutesFromOriginal: number
}

export interface Route {
  id: string
  name: string
  budgetPerPerson: number
  totalMinutes: number
  walkDistanceM: number
  queueRisk: 'low' | 'medium' | 'high'
  energyLevel: string
  isRecommended: boolean
  highlights: string[]
  stops: Stop[]
}

interface RouteState {
  routes: Route[]
  selectedRouteId: string | null
  transitionRect: DOMRect | null
  setRoutes: (routes: Route[]) => void
  selectRoute: (routeId: string) => void
  setTransitionRect: (rect: DOMRect | null) => void
}

export const useRouteStore = create<RouteState>((set) => ({
  routes: [],
  selectedRouteId: null,
  transitionRect: null,
  setRoutes: (routes) => set({ routes }),
  selectRoute: (routeId) => set({ selectedRouteId: routeId }),
  setTransitionRect: (rect) => set({ transitionRect: rect }),
}))
```

- [ ] **Step 5: useTripStore.ts**

```typescript
// src/stores/useTripStore.ts
import { create } from 'zustand'
import type { Stop } from './useRouteStore'

interface TripState {
  stops: Stop[]
  currentStopIndex: number
  setStops: (stops: Stop[]) => void
  completeStop: (stopId: string) => void
  setCurrentStop: (index: number) => void
}

export const useTripStore = create<TripState>((set) => ({
  stops: [],
  currentStopIndex: 0,
  setStops: (stops) => set({ stops }),
  completeStop: (stopId) =>
    set((state) => ({
      stops: state.stops.map((s) =>
        s.id === stopId ? { ...s, completed: true } : s
      ),
    })),
  setCurrentStop: (index) => set({ currentStopIndex: index }),
}))
```

- [ ] **Step 6: useUIStore.ts**

```typescript
// src/stores/useUIStore.ts
import { create } from 'zustand'

interface UIState {
  isLoading: boolean
  loadingText: string
  setLoading: (text?: string) => void
  clearLoading: () => void
}

export const useUIStore = create<UIState>((set) => ({
  isLoading: false,
  loadingText: '',
  setLoading: (text = '加载中…') => set({ isLoading: true, loadingText: text }),
  clearLoading: () => set({ isLoading: false, loadingText: '' }),
}))
```

- [ ] **Step 7: 验证TypeScript类型无错误**
Run: `npx tsc --noEmit 2>&1 | head -20`
Expected: 无输出（无类型错误）

- [ ] **Step 8: Commit**
```bash
git add src/stores/
git commit -m "feat: add 5 Zustand stores (session/preference/route/trip/ui)"
```

---

### Task 7: Mock JSON数据文件

**Files:**
- Create: `src/services/mock/routes.json`
- Create: `src/services/mock/stops-photo.json`
- Create: `src/services/mock/members.json`
- Create: `src/services/mock/routeDiff.json`

- [ ] **Step 1: 创建目录**

```bash
mkdir -p src/services/mock
```

- [ ] **Step 2: routes.json（3条完整路线）**

```json
[
  {
    "id": "route-easy",
    "name": "少排队轻松线",
    "budgetPerPerson": 118,
    "totalMinutes": 270,
    "walkDistanceM": 800,
    "queueRisk": "low",
    "energyLevel": "轻松",
    "isRecommended": false,
    "highlights": ["全程步行≤10分钟", "有座位休息", "排队风险低"],
    "stops": [
      {
        "id": "stop-hunanese",
        "name": "弄堂里的湖南菜",
        "category": "餐厅",
        "coord": { "lat": 31.2990, "lng": 121.5120 },
        "arriveTime": "12:00",
        "stayMinutes": 90,
        "completed": false,
        "queueRisk": "low",
        "estimatedQueueMinutes": 5,
        "planB": [],
        "tags": ["湖南菜", "有座位", "排队少"],
        "ugcHighlight": "招牌剁椒鱼头超下饭，鸳鸯锅满足辣与不辣"
      },
      {
        "id": "stop-zhichuang",
        "name": "创智天地草坪",
        "category": "拍照打卡",
        "coord": { "lat": 31.2978, "lng": 121.5098 },
        "arriveTime": "13:45",
        "stayMinutes": 45,
        "completed": false,
        "queueRisk": "low",
        "estimatedQueueMinutes": 0,
        "planB": [],
        "tags": ["拍照", "草坪", "免费"],
        "ugcHighlight": "黄昏光线超好，适合人物逆光拍"
      },
      {
        "id": "stop-arabica",
        "name": "%Arabica咖啡",
        "category": "咖啡",
        "coord": { "lat": 31.2962, "lng": 121.5085 },
        "arriveTime": "14:45",
        "stayMinutes": 60,
        "completed": false,
        "queueRisk": "low",
        "estimatedQueueMinutes": 10,
        "planB": [],
        "tags": ["精品咖啡", "日系", "出片"],
        "ugcHighlight": "%LOGO拍照角度绝了，建议点冰拿铁"
      }
    ]
  },
  {
    "id": "route-budget",
    "name": "高性价比省钱线",
    "budgetPerPerson": 95,
    "totalMinutes": 240,
    "walkDistanceM": 1200,
    "queueRisk": "medium",
    "energyLevel": "适中",
    "isRecommended": false,
    "highlights": ["人均最低", "复旦校园随拍", "本帮菜体验"],
    "stops": [
      {
        "id": "stop-sipingbang",
        "name": "四平路本帮菜",
        "category": "餐厅",
        "coord": { "lat": 31.3025, "lng": 121.5058 },
        "arriveTime": "12:00",
        "stayMinutes": 75,
        "completed": false,
        "queueRisk": "medium",
        "estimatedQueueMinutes": 20,
        "planB": [],
        "tags": ["本帮菜", "经济实惠", "老上海味"],
        "ugcHighlight": "红烧肉和醉鸡必点，人均60-70搞定"
      },
      {
        "id": "stop-fudan",
        "name": "复旦大学校园",
        "category": "拍照打卡",
        "coord": { "lat": 31.2985, "lng": 121.5025 },
        "arriveTime": "13:30",
        "stayMinutes": 60,
        "completed": false,
        "queueRisk": "low",
        "estimatedQueueMinutes": 0,
        "planB": [],
        "tags": ["校园", "拍照", "文艺"],
        "ugcHighlight": "光华楼前广场是绝佳机位，春秋最美"
      },
      {
        "id": "stop-hushan-ae",
        "name": "沪上阿姨（邯郸路店）",
        "category": "茶饮",
        "coord": { "lat": 31.2998, "lng": 121.5040 },
        "arriveTime": "14:45",
        "stayMinutes": 30,
        "completed": false,
        "queueRisk": "low",
        "estimatedQueueMinutes": 5,
        "planB": [],
        "tags": ["茶饮", "性价比", "新中式"],
        "ugcHighlight": "草莓爆爆珠限定款，15块钱幸福感拉满"
      }
    ]
  },
  {
    "id": "route-photo",
    "name": "拍照出片线",
    "budgetPerPerson": 132,
    "totalMinutes": 300,
    "walkDistanceM": 1500,
    "queueRisk": "low",
    "energyLevel": "适中",
    "isRecommended": true,
    "highlights": ["AI推荐", "网红打卡全覆盖", "出片率最高", "兼顾王萌辣食需求"],
    "stops": [
      {
        "id": "stop-yuanyang-pot",
        "name": "网红鸳鸯锅",
        "category": "餐厅",
        "coord": { "lat": 31.3014, "lng": 121.5145 },
        "arriveTime": "12:00",
        "stayMinutes": 90,
        "completed": false,
        "queueRisk": "high",
        "estimatedQueueMinutes": 58,
        "planB": [
          {
            "id": "planb-hunanese",
            "name": "弄堂里的湖南菜",
            "reason": "同样有鸳鸯锅，等位仅5分钟，节省53分钟",
            "rating": 4.6,
            "pricePerPerson": 95,
            "estimatedQueueMinutes": 5,
            "walkMinutesFromOriginal": 6
          }
        ],
        "tags": ["鸳鸯锅", "网红", "辣不辣都有"],
        "ugcHighlight": "锅底汤料超浓郁，拍完照再涮菜，出片率高"
      },
      {
        "id": "stop-daxue-wall",
        "name": "大学路网红墙",
        "category": "拍照打卡",
        "coord": { "lat": 31.3005, "lng": 121.5132 },
        "arriveTime": "14:00",
        "stayMinutes": 60,
        "completed": false,
        "queueRisk": "low",
        "estimatedQueueMinutes": 0,
        "planB": [],
        "tags": ["网红墙", "拍照", "涂鸦"],
        "ugcHighlight": "彩色涂鸦墙，午后光线从左侧打来最好看"
      },
      {
        "id": "stop-seesaw",
        "name": "SeeSaw咖啡（大学路店）",
        "category": "咖啡",
        "coord": { "lat": 31.2997, "lng": 121.5118 },
        "arriveTime": "15:15",
        "stayMinutes": 60,
        "completed": false,
        "queueRisk": "low",
        "estimatedQueueMinutes": 8,
        "planB": [],
        "tags": ["精品咖啡", "网红", "出片"],
        "ugcHighlight": "橙色门头超上镜，特调「日落」和店面颜色绝配"
      }
    ]
  }
]
```

- [ ] **Step 3: stops-photo.json（拍照出片线4站点含planB）**

```json
{
  "routeId": "route-photo",
  "routeName": "拍照出片线",
  "stops": [
    {
      "id": "stop-yuanyang-pot",
      "name": "网红鸳鸯锅",
      "category": "餐厅",
      "coord": { "lat": 31.3014, "lng": 121.5145 },
      "arriveTime": "12:00",
      "stayMinutes": 90,
      "completed": false,
      "queueRisk": "high",
      "estimatedQueueMinutes": 58,
      "planB": [
        {
          "id": "planb-hunanese",
          "name": "弄堂里的湖南菜",
          "reason": "同样有鸳鸯锅，等位仅5分钟，可节省53分钟，让行程不超时",
          "rating": 4.6,
          "pricePerPerson": 95,
          "estimatedQueueMinutes": 5,
          "walkMinutesFromOriginal": 6
        }
      ],
      "tags": ["鸳鸯锅", "网红", "辣不辣都有", "排队需等"],
      "ugcHighlight": "锅底汤料超浓郁，拍完照再涮菜，出片率高，但排队是硬伤"
    },
    {
      "id": "stop-daxue-wall",
      "name": "大学路网红墙",
      "category": "拍照打卡",
      "coord": { "lat": 31.3005, "lng": 121.5132 },
      "arriveTime": "14:00",
      "stayMinutes": 60,
      "completed": false,
      "queueRisk": "low",
      "estimatedQueueMinutes": 0,
      "planB": [],
      "tags": ["网红墙", "拍照", "涂鸦", "免费"],
      "ugcHighlight": "彩色涂鸦墙，午后光线从左侧打来最好看，建议14:00-15:30间来"
    },
    {
      "id": "stop-seesaw",
      "name": "SeeSaw咖啡（大学路店）",
      "category": "咖啡",
      "coord": { "lat": 31.2997, "lng": 121.5118 },
      "arriveTime": "15:15",
      "stayMinutes": 60,
      "completed": false,
      "queueRisk": "low",
      "estimatedQueueMinutes": 8,
      "planB": [],
      "tags": ["精品咖啡", "网红", "出片", "橙色门头"],
      "ugcHighlight": "橙色门头超上镜，特调「日落」和店面颜色绝配，建议拍完再喝"
    },
    {
      "id": "stop-wujiaochang",
      "name": "五角场合生汇（出发/返回）",
      "category": "交通枢纽",
      "coord": { "lat": 31.3021, "lng": 121.5098 },
      "arriveTime": "16:30",
      "stayMinutes": 0,
      "completed": false,
      "queueRisk": "low",
      "estimatedQueueMinutes": 0,
      "planB": [],
      "tags": ["地铁", "返回"],
      "ugcHighlight": "10号线五角场站，直达市中心"
    }
  ]
}
```

- [ ] **Step 4: members.json（4人偏好数据）**

```json
[
  {
    "id": "member-linxiaxia",
    "name": "林小夏",
    "avatar": "https://api.dicebear.com/7.x/adventurer/svg?seed=linxiaxia",
    "status": "done",
    "isHost": true,
    "preferences": {
      "taste": ["拍照出片", "精致感", "网红打卡"],
      "budget": 150,
      "energy": "适中",
      "avoidSpicy": false,
      "needsSeating": false
    }
  },
  {
    "id": "member-chenyu",
    "name": "陈宇",
    "avatar": "https://api.dicebear.com/7.x/adventurer/svg?seed=chenyu",
    "status": "done",
    "isHost": false,
    "preferences": {
      "taste": ["不挑食", "性价比"],
      "budget": 100,
      "energy": "适中",
      "avoidSpicy": false,
      "needsSeating": false
    }
  },
  {
    "id": "member-wangmeng",
    "name": "王萌",
    "avatar": "https://api.dicebear.com/7.x/adventurer/svg?seed=wangmeng",
    "status": "done",
    "isHost": false,
    "preferences": {
      "taste": ["必须吃辣", "火锅", "重口味"],
      "budget": 120,
      "energy": "充沛",
      "avoidSpicy": false,
      "needsSeating": false
    }
  },
  {
    "id": "member-liting",
    "name": "李婷",
    "avatar": "https://api.dicebear.com/7.x/adventurer/svg?seed=liting",
    "status": "filling",
    "isHost": false,
    "preferences": {
      "taste": ["不吃辣", "清淡", "有座位"],
      "budget": 120,
      "energy": "偏弱",
      "avoidSpicy": true,
      "needsSeating": true
    }
  }
]
```

- [ ] **Step 5: routeDiff.json（Route Diff数据）**

```json
{
  "timeStatus": "rescued",
  "sessionDeadline": "21:00",
  "currentStop": {
    "id": "stop-yuanyang-pot",
    "name": "网红鸳鸯锅",
    "rating": 4.8,
    "estimatedQueueMinutes": 58,
    "pricePerPerson": 132,
    "estimatedEndTime": "21:15"
  },
  "planBStop": {
    "id": "planb-hunanese",
    "name": "弄堂里的湖南菜",
    "rating": 4.6,
    "estimatedQueueMinutes": 5,
    "pricePerPerson": 115,
    "estimatedEndTime": "20:48"
  },
  "gains": {
    "savedMinutes": 53,
    "savedPricePerPerson": 17,
    "label": "换了能救回来"
  },
  "costs": {
    "ratingDrop": 0.2,
    "extraWalkMeters": 420,
    "extraWalkMinutes": 6
  },
  "aiRecommendation": "强烈建议换。原路线排队58分钟，行程将在21:15结束，超出截止时间15分钟。换成弄堂里的湖南菜，鸳鸯锅同样有，等位仅5分钟，能在20:48结束，为你们抢回12分钟。",
  "bufferMinutes": 5
}
```

- [ ] **Step 6: 验证JSON格式**
Run: `node -e "['routes','stops-photo','members','routeDiff'].forEach(f=>{ try{JSON.parse(require('fs').readFileSync('src/services/mock/'+f+'.json','utf8'));console.log(f+': OK')}catch(e){console.error(f+': ERROR',e.message)} })"`
Expected:
```
routes: OK
stops-photo: OK
members: OK
routeDiff: OK
```

- [ ] **Step 7: Commit**
```bash
git add src/services/mock/
git commit -m "feat: add mock JSON data (routes/stops/members/routeDiff)"
```

---

### Task 8: src/utils/mockEngine.ts

**Files:**
- Create: `src/utils/mockEngine.ts`

- [ ] **Step 1: 创建目录并写入 mockEngine.ts**

```bash
mkdir -p src/utils
```

```typescript
// src/utils/mockEngine.ts
// Demo 演示 Mock 引擎 — 支持3倍速加速

export const APP_CONFIG = {
  /** 演示加速系数：0.3 = 3倍速，1.0 = 正常速度 */
  MOCK_SPEED: 0.3,
}

/**
 * MockEngine: 统一管理 Demo 演示中的所有定时器
 * 调用 schedule 替代 setTimeout，destroy 清理所有定时器
 */
export class MockEngine {
  private timers: ReturnType<typeof setTimeout>[] = []

  constructor(private config = APP_CONFIG) {}

  /**
   * 以加速系数调度一个回调
   * @param fn 要执行的回调
   * @param delayMs 原始延迟（毫秒），会乘以 MOCK_SPEED
   */
  schedule(fn: () => void, delayMs: number): void {
    const actualDelay = delayMs * this.config.MOCK_SPEED
    const t = setTimeout(fn, actualDelay)
    this.timers.push(t)
  }

  /**
   * 清除所有已调度但未执行的定时器
   * 在页面 onUnload 或 useEffect cleanup 中调用
   */
  destroy(): void {
    this.timers.forEach(clearTimeout)
    this.timers = []
  }
}

/** 全局共享演示引擎实例（页面间共享时序） */
export const demoEngine = new MockEngine()
```

- [ ] **Step 2: 验证**
Run: `npx tsc --noEmit 2>&1 | head -10`
Expected: 无输出

- [ ] **Step 3: Commit**
```bash
git add src/utils/mockEngine.ts
git commit -m "feat: add MockEngine with 3x speed demo support"
```

---

### Task 9: src/utils/delay.ts + rect.ts

**Files:**
- Create: `src/utils/delay.ts`
- Create: `src/utils/rect.ts`

- [ ] **Step 1: delay.ts**

```typescript
// src/utils/delay.ts
// Mock 延迟工具 — 统一加 200ms 保证 Loading 动效可见

import { APP_CONFIG } from './mockEngine'

/** 返回一个 Promise，在 delayMs * MOCK_SPEED 后 resolve */
export function delay(delayMs: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, delayMs * APP_CONFIG.MOCK_SPEED)
  })
}

/**
 * 带最小可见延迟的 Mock 请求包装器
 * 确保 Loading 动效至少展示 200ms（乘以加速系数后实际约 60ms）
 */
export async function mockDelay<T>(
  fn: () => T | Promise<T>,
  minDelayMs = 200
): Promise<T> {
  const [result] = await Promise.all([Promise.resolve(fn()), delay(minDelayMs)])
  return result
}
```

- [ ] **Step 2: rect.ts**

```typescript
// src/utils/rect.ts
// 获取元素位置信息 — 共享元素转场使用
// 基于 Taro createSelectorQuery，返回 Promise<BoundingClientRect>

import Taro from '@tarojs/taro'

export interface Rect {
  left: number
  top: number
  right: number
  bottom: number
  width: number
  height: number
}

/**
 * 查询指定选择器元素的位置和尺寸
 * 用于「对比→详情」共享元素转场中记录卡片 rect
 *
 * @param selector CSS 选择器，如 '.route-card-photo'
 * @param component 组件实例（在组件内调用时传 this，页面内传 undefined）
 */
export function getRect(selector: string, component?: unknown): Promise<Rect> {
  return new Promise((resolve, reject) => {
    const query = component
      ? Taro.createSelectorQuery().in(component as any)
      : Taro.createSelectorQuery()

    query
      .select(selector)
      .boundingClientRect((rect) => {
        if (!rect) {
          reject(new Error(`Element not found: ${selector}`))
          return
        }
        resolve(rect as unknown as Rect)
      })
      .exec()
  })
}

/**
 * 查询多个元素的位置信息（批量版）
 */
export function getRects(selector: string, component?: unknown): Promise<Rect[]> {
  return new Promise((resolve, reject) => {
    const query = component
      ? Taro.createSelectorQuery().in(component as any)
      : Taro.createSelectorQuery()

    query
      .selectAll(selector)
      .boundingClientRect((rects) => {
        if (!rects || !Array.isArray(rects)) {
          reject(new Error(`Elements not found: ${selector}`))
          return
        }
        resolve(rects as unknown as Rect[])
      })
      .exec()
  })
}
```

- [ ] **Step 3: 验证**
Run: `npx tsc --noEmit 2>&1 | head -10`
Expected: 无输出

- [ ] **Step 4: Commit**
```bash
git add src/utils/delay.ts src/utils/rect.ts
git commit -m "feat: add delay and rect utils for mock and shared-element transition"
```

---

### Task 10: src/services/request.ts

**Files:**
- Create: `src/services/request.ts`

- [ ] **Step 1: 创建目录并写入 request.ts**

```bash
mkdir -p src/services
```

```typescript
// src/services/request.ts
// 统一请求封装 — NODE_ENV 切换 Mock/真实请求

import Taro from '@tarojs/taro'
import { mockDelay } from '@/utils/delay'

// ---- Mock 数据懒加载 ----
const mockLoaders: Record<string, () => Promise<unknown>> = {
  '/routes':     () => import('./mock/routes.json').then((m) => m.default),
  '/members':    () => import('./mock/members.json').then((m) => m.default),
  '/route-diff': () => import('./mock/routeDiff.json').then((m) => m.default),
  '/stops/photo': () => import('./mock/stops-photo.json').then((m) => m.default),
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

interface RequestOptions {
  method?: HttpMethod
  data?: Record<string, unknown>
  header?: Record<string, string>
}

interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

const BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://api.pincheng.app'
  : 'https://dev-api.pincheng.app'

/**
 * 核心请求函数
 * - development 环境：优先命中 Mock 数据（带 minDelay）
 * - production 环境：发起真实 Taro.request
 */
async function request<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = 'GET', data, header = {} } = options

  // Mock 模式（开发环境 + 存在对应 mock 数据）
  if (process.env.NODE_ENV !== 'production' && mockLoaders[path]) {
    const result = await mockDelay(() => mockLoaders[path](), 200)
    return result as T
  }

  // 真实请求
  const response = await Taro.request<ApiResponse<T>>({
    url: `${BASE_URL}${path}`,
    method,
    data,
    header: {
      'Content-Type': 'application/json',
      ...header,
    },
  })

  if (response.statusCode !== 200) {
    throw new Error(`HTTP ${response.statusCode}: ${path}`)
  }

  if (response.data.code !== 0) {
    throw new Error(response.data.message || '请求失败')
  }

  return response.data.data
}

// ---- 语义化导出 ----

export const get = <T>(path: string, params?: Record<string, unknown>) =>
  request<T>(path, { method: 'GET', data: params })

export const post = <T>(path: string, body?: Record<string, unknown>) =>
  request<T>(path, { method: 'POST', data: body })

export default request
```

- [ ] **Step 2: 验证**
Run: `npx tsc --noEmit 2>&1 | head -10`
Expected: 无输出

- [ ] **Step 3: Commit**
```bash
git add src/services/request.ts
git commit -m "feat: add unified request service with mock/real env switching"
```

---

## 验收清单

完成 Plan A 后，运行以下命令验证整体构建：

```bash
# 1. TypeScript 类型检查
npx tsc --noEmit

# 2. 微信小程序构建
npm run build:weapp

# 3. 检查分包结构
cat dist/app.json | python3 -m json.tool | grep -A 20 "subPackages"
```

预期结果：
- TypeScript 无类型错误
- Webpack 编译成功
- `dist/app.json` 中包含正确的 `subPackages` 配置（3个分包）

---

## 文件结构总览

Plan A 完成后 `src/` 目录结构：

```
src/
  app.config.ts          ✅ 分包配置
  app.scss               ✅ 导入 theme + animation
  app.tsx                ✅ (原有，无需修改)
  pages/
    home/index.tsx        ✅ 占位
    preference/index.tsx  ✅ 占位
    route-compare/index.tsx ✅ 占位
    invite/landing/index.tsx ✅ 占位
    route-detail/index.tsx ✅ 分包占位
    assistant/index.tsx    ✅ 分包占位
    map-fullscreen/index.tsx ✅ 分包占位
  stores/
    useSessionStore.ts    ✅
    usePreferenceStore.ts ✅
    useRouteStore.ts      ✅
    useTripStore.ts       ✅
    useUIStore.ts         ✅
  services/
    request.ts            ✅
    mock/
      routes.json         ✅
      stops-photo.json    ✅
      members.json        ✅
      routeDiff.json      ✅
  styles/
    theme.scss            ✅ 全量 CSS 变量
    animation.scss        ✅ 全量关键帧
  utils/
    delay.ts              ✅
    rect.ts               ✅
    mockEngine.ts         ✅
```
