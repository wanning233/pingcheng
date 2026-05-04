# 拼程小程序 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the complete 拼程 WeChat mini-program frontend — 5 core pages with animations, dark design system, mock data engine, and invite flow — using Taro 3.6.x + React 18.

**Architecture:** Taro app with main package (home/preference/route-compare) + subpackage (route-detail/assistant/map-fullscreen). All data is local mock JSON with 200ms delay; MockEngine provides 3x-speed demo acceleration. Animations use CSS keyframes + Canvas 2D (no Lottie).

**Tech Stack:** Taro 3.6.x, React 18, TypeScript, NutUI-React 2.x, Zustand, Tencent Maps SDK (@map-component/tmap-miniapp), CSS Modules + SCSS, WeChat DevTools

---

## Phase 1 — Scaffold + Design System

**Files:**
- Create: `project root` (Taro scaffold)
- Create: `src/styles/theme.scss`
- Create: `src/styles/animation.scss`
- Modify: `app.config.ts`
- Modify: `app.scss`

### 1.1 Scaffold

- [ ] Run `npm create taro@3.6 pincheng -- --template default --framework react --typescript` and select WeChat mini-program target.
- [ ] Enter project: `cd pincheng`.
- [ ] Install core dependencies:
  ```bash
  npm install @nutui/nutui-react-taro zustand
  npm install -D sass
  ```
- [ ] Install map SDK in a way that supports subpackage placement (copy SDK bundle into `src/subpackages/route-detail/tmap/` after download; import via relative path inside that subpackage).
- [ ] Verify `project.config.json` has `"appid": "your-appid"` and `miniprogramRoot: "dist"`.

### 1.2 `app.config.ts` — packages declaration

- [ ] Replace the default `pages` array and add `subPackages`:
  ```typescript
  // app.config.ts
  export default defineAppConfig({
    pages: [
      'pages/home/index',
      'pages/preference/index',
      'pages/route-compare/index',
      'pages/invite/landing/index',
    ],
    subPackages: [
      {
        root: 'subpackages',
        pages: [
          'route-detail/index',
          'assistant/index',
          'map-fullscreen/index',
        ],
      },
    ],
    window: {
      backgroundTextStyle: 'dark',
      navigationBarBackgroundColor: '#0D0D12',
      navigationBarTitleText: '拼程',
      navigationBarTextStyle: 'white',
      backgroundColor: '#0D0D12',
    },
    lazyCodeLoading: 'requiredComponents',
  })
  ```

### 1.3 `src/styles/theme.scss` — complete design token file

- [ ] Create `src/styles/theme.scss` with the full token set:
  ```scss
  :root {
    /* Background layers */
    --color-bg-base:    #0D0D12;
    --color-bg-card:    #1C1C26;
    --color-bg-glass:   rgba(255,255,255,0.06);

    /* Brand colors */
    --color-primary:        #FF5C2B;
    --color-primary-light:  #FF7A47;
    --color-accent:         #4D6EFF;
    --color-success:        #00C9A7;
    --color-warning:        #FFB800;
    --color-danger:         #FF4757;

    /* Text hierarchy */
    --color-text-primary:   #F2F2F5;
    --color-text-secondary: #9494A8;
    --color-text-disabled:  #4A4A5E;

    /* Gradients */
    --gradient-brand:  linear-gradient(135deg, #FF5C2B, #FFB300);
    --gradient-ai:     linear-gradient(135deg, #4D6EFF, #7B2FFF);
    --gradient-mask:   linear-gradient(180deg, transparent, rgba(13,13,18,0.85));

    /* Border radius */
    --radius-card-lg:  20px;
    --radius-card-md:  16px;
    --radius-btn:      14px;
    --radius-tag:       8px;
    --radius-icon:     12px;
    --radius-input:    16px;
    --radius-sheet-t:  28px;

    /* Spacing (4px base) */
    --space-xs:  4px;
    --space-s:   8px;
    --space-m:  12px;
    --space-l:  16px;
    --space-xl: 20px;
    --space-2xl:24px;
    --space-3xl:32px;

    /* Shadows */
    --shadow-btn-primary:
      0 4px 12px rgba(255,92,43,0.55),
      0 8px 32px rgba(255,92,43,0.25);

    --shadow-card-recommend:
      0  2px  8px  rgba(77,110,255,0.20),
      0  8px  24px rgba(77,110,255,0.30),
      0 16px  48px rgba(77,110,255,0.15),
      0  0   32px  rgba(255,92,43,0.08);

    --shadow-card-default:
      0 2px  8px rgba(10,10,20,0.60),
      0 4px 16px rgba(10,10,20,0.40);

    --shadow-card-selected:
      0  2px  6px  rgba(255,92,43,0.30),
      0  6px  20px rgba(255,92,43,0.20),
      0 12px  40px rgba(255,92,43,0.10);

    --shadow-floating-bar:
      0 -4px  16px rgba(255,92,43,0.18),
      0 -1px  32px rgba(255,92,43,0.08),
      0 -12px 48px rgba(10,10,20,0.50);

    --shadow-card-diff:
      0 2px   8px  rgba(0,201,167,0.20),
      0 8px   24px rgba(0,201,167,0.15),
      0 16px  40px rgba(0,201,167,0.08);

    --shadow-timeline-active:
      0 0  0   3px rgba(255,92,43,0.25),
      0 0  12px 4px rgba(255,92,43,0.50),
      0 0  24px 8px rgba(255,92,43,0.20);

    --shadow-ai-ambient:
      0  0  40px  16px rgba(138,92,246,0.18),
      0  0  80px  32px rgba(138,92,246,0.10),
      0  8px 24px  8px rgba(77,110,255,0.12),
      0  0  120px 48px rgba(255,92,43,0.05);
  }
  ```

### 1.4 `src/styles/animation.scss` — shared keyframes

- [ ] Create `src/styles/animation.scss`:
  ```scss
  /* Pulse ring — used on active timeline node */
  @keyframes pulse-ring {
    0%   { transform: scale(1);   opacity: 0.8; }
    100% { transform: scale(2.2); opacity: 0;   }
  }

  /* Glow breathing — card/button idle state */
  @keyframes glow-breathe {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.6; }
  }

  /* Shockwave — assembly explosion frame */
  @keyframes shockwave {
    0%   { transform: scale(0);   opacity: 1; }
    100% { transform: scale(1.8); opacity: 0; }
  }

  /* Float text in — "4人集结完成！" */
  @keyframes float-in {
    0%   { filter: blur(8px); transform: translateY(12px); opacity: 0; }
    100% { filter: blur(0);   transform: translateY(0);    opacity: 1; }
  }

  /* Three-dot thinking loader */
  @keyframes dot-bounce {
    0%, 80%, 100% { transform: translateY(0);    opacity: 0.4; }
    40%            { transform: translateY(-6px); opacity: 1;   }
  }

  /* Stagger fade-up — route cards entrance */
  @keyframes fade-up {
    0%   { transform: translateY(20px); opacity: 0; }
    100% { transform: translateY(0);    opacity: 1; }
  }

  /* Typewriter via clip-path */
  @keyframes typewriter {
    from { clip-path: inset(0 100% 0 0); }
    to   { clip-path: inset(0 0%   0 0); }
  }

  /* Conflict card border color shift */
  @keyframes border-resolve {
    0%   { border-color: #FF5C2B; }
    100% { border-color: #00C9A7; }
  }

  /* Confetti particle fall */
  @keyframes confetti-fall {
    0%   { transform: translateY(-20px) rotate(0deg);   opacity: 1; }
    100% { transform: translateY(120px) rotate(720deg); opacity: 0; }
  }
  ```

### 1.5 `app.scss` — import tokens

- [ ] Add at top of `src/app.scss`:
  ```scss
  @import './styles/theme.scss';
  @import './styles/animation.scss';

  page {
    background-color: var(--color-bg-base);
    color: var(--color-text-primary);
    font-family: 'PingFang SC', -apple-system, sans-serif;
  }
  ```

### 1.6 WeChat DevTools verification

- [ ] Run `npm run dev:weapp` and open `dist/` in WeChat DevTools.
- [ ] Confirm background is `#0D0D12` and no compilation errors.

---

## Phase 2 — Stores + Mock Data + Utilities

**Files:**
- Create: `src/stores/useSessionStore.ts`
- Create: `src/stores/usePreferenceStore.ts`
- Create: `src/stores/useRouteStore.ts`
- Create: `src/stores/useTripStore.ts`
- Create: `src/stores/useUIStore.ts`
- Create: `src/services/mock/routes.json`
- Create: `src/services/mock/stops.json`
- Create: `src/services/mock/routeDiff.json`
- Create: `src/utils/delay.ts`
- Create: `src/utils/rect.ts`
- Create: `src/utils/mockEngine.ts`

### 2.1 Type definitions

- [ ] Create `src/types/index.ts`:
  ```typescript
  export interface Participant {
    openId: string
    nickname: string
    avatarUrl: string
    status: 'pending' | 'filling' | 'done'
    completedAt?: number
  }

  export interface Route {
    id: string
    name: string
    tag: 'easy' | 'budget' | 'photo'
    isRecommended: boolean
    pricePerPerson: number
    durationHours: number
    walkMeters: number
    queueRisk: 'low' | 'mid' | 'high'
    highlights: string[]
    mapPreviewUrl: string
  }

  export interface Stop {
    id: string
    name: string
    category: string
    stayMinutes: number
    tags: string[]
    rating: number
    queueMinutes: number
    lat: number
    lng: number
  }

  export type TimeStatus = 'safe' | 'overtime' | 'rescued'
  ```

### 2.2 `useSessionStore.ts`

- [ ] Create `src/stores/useSessionStore.ts`:
  ```typescript
  import { create } from 'zustand'

  interface SessionStore {
    destination: string
    budget: number
    endTime: string       // "HH:mm"
    headcount: number
    tripId: string | null
    setDestination: (v: string) => void
    setBudget: (v: number) => void
    setEndTime: (v: string) => void
    setHeadcount: (v: number) => void
    setTripId: (v: string) => void
  }

  export const useSessionStore = create<SessionStore>((set) => ({
    destination: '',
    budget: 150,
    endTime: '21:00',
    headcount: 4,
    tripId: null,
    setDestination: (destination) => set({ destination }),
    setBudget: (budget) => set({ budget }),
    setEndTime: (endTime) => set({ endTime }),
    setHeadcount: (headcount) => set({ headcount }),
    setTripId: (tripId) => set({ tripId }),
  }))
  ```

### 2.3 `usePreferenceStore.ts`

- [ ] Create `src/stores/usePreferenceStore.ts`:
  ```typescript
  import { create } from 'zustand'
  import type { Participant } from '../types'

  export interface Conflict {
    id: string
    type: 'taste' | 'budget' | 'physical'
    description: string
    resolved: boolean
    resolution: string
  }

  interface PreferenceStore {
    participants: Participant[]
    conflicts: Conflict[]
    currentQuestionIndex: number
    answers: Record<string, string>
    setParticipants: (p: Participant[]) => void
    setConflicts: (c: Conflict[]) => void
    resolveConflict: (id: string) => void
    setAnswer: (key: string, value: string) => void
    nextQuestion: () => void
    prevQuestion: () => void
  }

  export const usePreferenceStore = create<PreferenceStore>((set) => ({
    participants: [],
    conflicts: [],
    currentQuestionIndex: 0,
    answers: {},
    setParticipants: (participants) => set({ participants }),
    setConflicts: (conflicts) => set({ conflicts }),
    resolveConflict: (id) =>
      set((s) => ({
        conflicts: s.conflicts.map((c) =>
          c.id === id ? { ...c, resolved: true } : c
        ),
      })),
    setAnswer: (key, value) =>
      set((s) => ({ answers: { ...s.answers, [key]: value } })),
    nextQuestion: () =>
      set((s) => ({ currentQuestionIndex: s.currentQuestionIndex + 1 })),
    prevQuestion: () =>
      set((s) => ({
        currentQuestionIndex: Math.max(0, s.currentQuestionIndex - 1),
      })),
  }))
  ```

### 2.4 `useRouteStore.ts`

- [ ] Create `src/stores/useRouteStore.ts`:
  ```typescript
  import { create } from 'zustand'
  import type { Route } from '../types'

  interface RouteStore {
    routes: Route[]
    selectedRouteId: string | null
    pendingTransitionRect: DOMRect | null
    setRoutes: (routes: Route[]) => void
    setSelectedRoute: (id: string) => void
    setPendingTransitionRect: (rect: DOMRect | null) => void
  }

  export const useRouteStore = create<RouteStore>((set) => ({
    routes: [],
    selectedRouteId: null,
    pendingTransitionRect: null,
    setRoutes: (routes) => set({ routes }),
    setSelectedRoute: (selectedRouteId) => set({ selectedRouteId }),
    setPendingTransitionRect: (pendingTransitionRect) =>
      set({ pendingTransitionRect }),
  }))
  ```

### 2.5 `useTripStore.ts`

- [ ] Create `src/stores/useTripStore.ts`:
  ```typescript
  import { create } from 'zustand'
  import type { Stop } from '../types'

  interface TripStore {
    stops: Stop[]
    currentStopIndex: number
    completedStopIds: string[]
    isInProgress: boolean
    setStops: (stops: Stop[]) => void
    completeStop: (id: string) => void
    startTrip: () => void
  }

  export const useTripStore = create<TripStore>((set) => ({
    stops: [],
    currentStopIndex: 0,
    completedStopIds: [],
    isInProgress: false,
    setStops: (stops) => set({ stops }),
    completeStop: (id) =>
      set((s) => ({
        completedStopIds: [...s.completedStopIds, id],
        currentStopIndex: s.currentStopIndex + 1,
      })),
    startTrip: () => set({ isInProgress: true }),
  }))
  ```

### 2.6 `useUIStore.ts`

- [ ] Create `src/stores/useUIStore.ts`:
  ```typescript
  import { create } from 'zustand'

  interface UIStore {
    globalLoading: boolean
    modalVisible: boolean
    setGlobalLoading: (v: boolean) => void
    showModal: () => void
    hideModal: () => void
  }

  export const useUIStore = create<UIStore>((set) => ({
    globalLoading: false,
    modalVisible: false,
    setGlobalLoading: (globalLoading) => set({ globalLoading }),
    showModal: () => set({ modalVisible: true }),
    hideModal: () => set({ modalVisible: false }),
  }))
  ```

### 2.7 Mock JSON — routes

- [ ] Create `src/services/mock/routes.json`:
  ```json
  [
    {
      "id": "route-easy",
      "name": "少排队轻松线",
      "tag": "easy",
      "isRecommended": false,
      "pricePerPerson": 118,
      "durationHours": 4.5,
      "walkMeters": 800,
      "queueRisk": "low",
      "highlights": ["全程有座位", "排队最少", "膝盖友好"],
      "mapPreviewUrl": "/assets/map-preview-easy.png"
    },
    {
      "id": "route-budget",
      "name": "高性价比省钱线",
      "tag": "budget",
      "isRecommended": false,
      "pricePerPerson": 95,
      "durationHours": 4.0,
      "walkMeters": 1200,
      "queueRisk": "mid",
      "highlights": ["人均最低", "复旦校园打卡", "本帮菜正宗"],
      "mapPreviewUrl": "/assets/map-preview-budget.png"
    },
    {
      "id": "route-photo",
      "name": "拍照出片线",
      "tag": "photo",
      "isRecommended": true,
      "pricePerPerson": 132,
      "durationHours": 5.0,
      "walkMeters": 1500,
      "queueRisk": "low",
      "highlights": ["大学路网红墙", "鸳鸯锅解冲突", "出片率最高"],
      "mapPreviewUrl": "/assets/map-preview-photo.png"
    }
  ]
  ```

### 2.8 Mock JSON — stops

- [ ] Create `src/services/mock/stops.json`:
  ```json
  [
    {
      "id": "stop-hotpot",
      "name": "网红鸳鸯锅",
      "category": "餐饮",
      "stayMinutes": 90,
      "tags": ["鸳鸯锅", "解冲突", "网红"],
      "rating": 4.8,
      "queueMinutes": 58,
      "lat": 31.2978,
      "lng": 121.5037
    },
    {
      "id": "stop-wall",
      "name": "大学路网红墙",
      "category": "拍照",
      "stayMinutes": 60,
      "tags": ["网红墙", "出片", "打卡"],
      "rating": 4.7,
      "queueMinutes": 5,
      "lat": 31.2985,
      "lng": 121.5041
    },
    {
      "id": "stop-seesaw",
      "name": "SeeSaw咖啡",
      "category": "咖啡",
      "stayMinutes": 45,
      "tags": ["精品咖啡", "收尾", "出片"],
      "rating": 4.6,
      "queueMinutes": 10,
      "lat": 31.2991,
      "lng": 121.5055
    }
  ]
  ```

### 2.9 Mock JSON — routeDiff

- [ ] Create `src/services/mock/routeDiff.json`:
  ```json
  {
    "original": {
      "stopId": "stop-hotpot",
      "name": "网红鸳鸯锅",
      "rating": 4.8,
      "queueMinutes": 58,
      "estimatedEndTime": "21:15"
    },
    "replacement": {
      "stopId": "stop-hunan",
      "name": "弄堂里的湖南菜",
      "rating": 4.6,
      "queueMinutes": 5,
      "estimatedEndTime": "20:48"
    },
    "gains": {
      "timeSavedMinutes": 53,
      "moneySavedPerPerson": 17
    },
    "losses": {
      "ratingDrop": 0.2,
      "extraWalkMeters": 420,
      "extraWalkMinutes": 6
    },
    "timeStatus": "rescued",
    "deadlineTime": "21:00",
    "aiVerdict": "强烈建议换，原路线会导致超时"
  }
  ```

### 2.10 Utilities

- [ ] Create `src/utils/delay.ts`:
  ```typescript
  export const delay = (ms: number): Promise<void> =>
    new Promise((resolve) => setTimeout(resolve, ms))
  ```

- [ ] Create `src/utils/rect.ts`:
  ```typescript
  import Taro from '@tarojs/taro'

  export interface ElementRect {
    left: number
    top: number
    width: number
    height: number
    right: number
    bottom: number
  }

  export const getElementRect = (selector: string): Promise<ElementRect> =>
    new Promise((resolve, reject) => {
      const query = Taro.createSelectorQuery()
      query
        .select(selector)
        .boundingClientRect((res) => {
          if (res) resolve(res as ElementRect)
          else reject(new Error(`Element not found: ${selector}`))
        })
        .exec()
    })
  ```

- [ ] Create `src/utils/mockEngine.ts`:
  ```typescript
  export const APP_CONFIG = { MOCK_SPEED: 0.3 }

  export class MockEngine {
    private timers: ReturnType<typeof setTimeout>[] = []

    constructor(private config: { MOCK_SPEED: number } = APP_CONFIG) {}

    schedule(fn: () => void, delayMs: number): void {
      const t = setTimeout(fn, delayMs * this.config.MOCK_SPEED)
      this.timers.push(t)
    }

    destroy(): void {
      this.timers.forEach(clearTimeout)
      this.timers = []
    }
  }
  ```

### 2.11 Verification

- [ ] Confirm TypeScript compiles all store files with `npm run build:weapp -- --no-emit` (or equivalent dry-run).
- [ ] In DevTools console confirm MockEngine fires at 3x speed: instantiate and schedule a 1000ms callback, expect it at ~300ms.

---

## Phase 3 — Route Compare Page

**Files:**
- Create: `src/pages/route-compare/index.tsx`
- Create: `src/pages/route-compare/index.module.scss`
- Create: `src/components/business/RouteCard/index.tsx`
- Create: `src/components/business/RouteCard/index.module.scss`
- Create: `src/components/ui/FloatingBar/index.tsx`
- Create: `src/components/ui/FloatingBar/index.module.scss`

### 3.1 `RouteCard` component

- [ ] Create `src/components/business/RouteCard/index.tsx`:
  ```tsx
  import { View, Image, Text } from '@tarojs/components'
  import type { Route } from '../../../types'
  import styles from './index.module.scss'

  interface RouteCardProps {
    route: Route
    selected: boolean
    animationDelay: number
    onSelect: (id: string, selector: string) => void
  }

  export const RouteCard: React.FC<RouteCardProps> = ({
    route, selected, animationDelay, onSelect,
  }) => {
    const cardId = `route-card-${route.id}`
    return (
      <View
        id={cardId}
        className={`${styles.card} ${selected ? styles.selected : ''} ${route.isRecommended ? styles.recommended : ''}`}
        style={{ animationDelay: `${animationDelay}ms` }}
        onClick={() => onSelect(route.id, `#${cardId}`)}
      >
        {route.isRecommended && (
          <View className={styles.badge}>AI 推荐</View>
        )}
        <View className={styles.colorBar} />
        <Image className={styles.mapPreview} src={route.mapPreviewUrl} mode="aspectFill" />
        <View className={styles.body}>
          <Text className={styles.name}>{route.name}</Text>
          <View className={styles.stats}>
            <View className={styles.stat}>
              <Text className={styles.value}>¥{route.pricePerPerson}</Text>
              <Text className={styles.unit}>人均</Text>
            </View>
            <View className={styles.stat}>
              <Text className={styles.value}>{route.durationHours}</Text>
              <Text className={styles.unit}>h</Text>
            </View>
            <View className={styles.stat}>
              <Text className={styles.value}>{route.walkMeters}</Text>
              <Text className={styles.unit}>m步行</Text>
            </View>
          </View>
          <View className={styles.highlights}>
            {route.highlights.map((h) => (
              <Text key={h} className={styles.tag}>{h}</Text>
            ))}
          </View>
        </View>
      </View>
    )
  }
  ```

- [ ] Create `src/components/business/RouteCard/index.module.scss`:
  ```scss
  .card {
    background: var(--color-bg-card);
    border-radius: var(--radius-card-lg);
    overflow: hidden;
    box-shadow: var(--shadow-card-default);
    opacity: 0;
    animation: fade-up 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    position: relative;
    border: 1.5px solid transparent;
  }
  .recommended {
    transform: scale(1.04);
    box-shadow: var(--shadow-card-recommend);
    border-color: var(--color-primary);
  }
  .selected {
    box-shadow: var(--shadow-card-selected);
    border-color: var(--color-primary);
  }
  .colorBar { height: 4px; background: var(--gradient-brand); }
  .badge {
    position: absolute; top: 16px; right: 16px;
    background: var(--color-success); color: #fff;
    font-size: 20rpx; font-weight: 500;
    padding: 4px 10px; border-radius: var(--radius-tag); z-index: 2;
  }
  .mapPreview { width: 100%; height: 160rpx; display: block; }
  .body { padding: var(--space-l); }
  .name {
    font-size: 36rpx; font-weight: 600; color: var(--color-text-primary);
    display: block; margin-bottom: var(--space-m);
  }
  .stats { display: flex; gap: var(--space-2xl); margin-bottom: var(--space-m); }
  .stat { display: flex; align-items: baseline; gap: var(--space-xs); }
  .value {
    font-size: 40rpx; font-weight: 700; color: var(--color-text-primary);
    font-variant-numeric: tabular-nums;
  }
  .unit { font-size: 24rpx; color: var(--color-text-secondary); }
  .highlights { display: flex; flex-wrap: wrap; gap: var(--space-s); margin-top: var(--space-s); }
  .tag {
    background: rgba(255,92,43,0.12); color: var(--color-primary);
    font-size: 20rpx; font-weight: 500;
    padding: var(--space-xs) var(--space-s); border-radius: var(--radius-tag);
  }
  ```

### 3.2 `FloatingBar` component

- [ ] Create `src/components/ui/FloatingBar/index.tsx`:
  ```tsx
  import { View, Text } from '@tarojs/components'
  import styles from './index.module.scss'

  interface FloatingBarProps {
    label: string
    disabled?: boolean
    onClick: () => void
  }

  export const FloatingBar: React.FC<FloatingBarProps> = ({ label, disabled = false, onClick }) => (
    <View className={styles.bar}>
      <View
        className={`${styles.btn} ${disabled ? styles.disabled : ''}`}
        onClick={disabled ? undefined : onClick}
      >
        <Text className={styles.label}>{label}</Text>
      </View>
    </View>
  )
  ```

- [ ] Create `src/components/ui/FloatingBar/index.module.scss`:
  ```scss
  .bar {
    position: fixed; bottom: 0; left: 0; right: 0;
    padding: var(--space-l) var(--space-xl);
    padding-bottom: calc(var(--space-l) + env(safe-area-inset-bottom));
    background: rgba(13,13,18,0.85);
    backdrop-filter: blur(20px);
    box-shadow: var(--shadow-floating-bar);
  }
  .btn {
    background: var(--gradient-brand); border-radius: var(--radius-btn);
    height: 96rpx; display: flex; align-items: center; justify-content: center;
    box-shadow: var(--shadow-btn-primary);
  }
  .disabled { opacity: 0.4; box-shadow: none; }
  .label { color: #fff; font-size: 32rpx; font-weight: 600; }
  ```

### 3.3 Route Compare page

- [ ] Create `src/pages/route-compare/index.tsx`:
  ```tsx
  import { useEffect } from 'react'
  import { View, Text, ScrollView } from '@tarojs/components'
  import Taro from '@tarojs/taro'
  import { RouteCard } from '../../components/business/RouteCard'
  import { FloatingBar } from '../../components/ui/FloatingBar'
  import { useRouteStore } from '../../stores/useRouteStore'
  import { useSessionStore } from '../../stores/useSessionStore'
  import { getElementRect } from '../../utils/rect'
  import { delay } from '../../utils/delay'
  import routesData from '../../services/mock/routes.json'
  import styles from './index.module.scss'

  export default function RouteCompare() {
    const { routes, selectedRouteId, setRoutes, setSelectedRoute, setPendingTransitionRect } = useRouteStore()
    const { headcount, destination } = useSessionStore()

    useEffect(() => {
      const init = async () => {
        await delay(200)
        setRoutes(routesData as any)
        const rec = (routesData as any[]).find((r) => r.isRecommended)
        if (rec) setSelectedRoute(rec.id)
      }
      init()
    }, [])

    const handleSelect = async (id: string, selector: string) => {
      setSelectedRoute(id)
      try {
        const rect = await getElementRect(selector)
        setPendingTransitionRect(rect as any)
      } catch (_) {}
    }

    const handleEnter = () => {
      if (!selectedRouteId) return
      Taro.navigateTo({ url: `/subpackages/route-detail/index?routeId=${selectedRouteId}` })
    }

    return (
      <View className={styles.page}>
        <View className={styles.header}>
          <Text className={styles.title}>为你们生成了 3 条路线</Text>
          <Text className={styles.subtitle}>{destination} · {headcount}人</Text>
        </View>
        <ScrollView scrollY className={styles.list}>
          {routes.map((r, i) => (
            <RouteCard
              key={r.id}
              route={r}
              selected={r.id === selectedRouteId}
              animationDelay={i * 120}
              onSelect={handleSelect}
            />
          ))}
          <View className={styles.listPadding} />
        </ScrollView>
        <FloatingBar
          label={selectedRouteId ? '进入这条路线 →' : '请选择路线'}
          disabled={!selectedRouteId}
          onClick={handleEnter}
        />
      </View>
    )
  }
  ```

- [ ] Create `src/pages/route-compare/index.module.scss`:
  ```scss
  .page { min-height: 100vh; background: var(--color-bg-base); display: flex; flex-direction: column; }
  .header { padding: var(--space-3xl) var(--space-xl) var(--space-l); }
  .title { display: block; font-size: 44rpx; font-weight: 600; color: var(--color-text-primary); }
  .subtitle { display: block; font-size: 28rpx; color: var(--color-text-secondary); margin-top: var(--space-xs); }
  .list { flex: 1; padding: 0 var(--space-xl); display: flex; flex-direction: column; gap: var(--space-l); }
  .listPadding { height: 120rpx; }
  ```

### 3.4 WeChat DevTools verification

- [ ] Navigate to route-compare — confirm three cards stagger-animate in (120ms apart).
- [ ] Confirm recommended card has scale 1.04 and blue-orange shadow.
- [ ] Tap a card — confirm `selected` shadow switches to orange.
- [ ] Tap "进入这条路线" — confirm navigation attempt fires.

---

## Phase 4 — Route Detail Page

**Files:**
- Create: `src/subpackages/route-detail/index.tsx`
- Create: `src/subpackages/route-detail/index.module.scss`
- Create: `src/components/business/Timeline/index.tsx`
- Create: `src/components/business/Timeline/index.module.scss`
- Create: `src/components/business/MapWindow/index.tsx`
- Create: `src/components/business/MapWindow/index.module.scss`

### 4.1 `MapWindow` component

- [ ] Create `src/components/business/MapWindow/index.tsx`:
  ```tsx
  import { useState, useCallback } from 'react'
  import { View, Text } from '@tarojs/components'
  import Taro from '@tarojs/taro'
  import type { Stop } from '../../../types'
  import styles from './index.module.scss'

  interface MapWindowProps {
    stops: Stop[]
    currentStopIndex: number
    routeId: string
    onScroll?: (folded: boolean) => void
  }

  export const MapWindow: React.FC<MapWindowProps> = ({ stops, currentStopIndex, routeId }) => {
    const [folded, setFolded] = useState(false)

    const openFullscreen = () =>
      Taro.navigateTo({ url: `/subpackages/map-fullscreen/index?routeId=${routeId}` })

    return (
      <View className={`${styles.window} ${folded ? styles.folded : ''}`}
        onClick={folded ? () => setFolded(false) : undefined}>
        {/* Replace with Tencent Maps SDK <TMap> after SDK spike validation */}
        <View className={styles.placeholder}>
          <Text className={styles.placeholderText}>
            {folded
              ? stops.map((s) => s.name).join(' → ')
              : `地图 · ${stops[currentStopIndex]?.name ?? ''}`}
          </Text>
        </View>
        {!folded && (
          <View className={styles.expandBtn} onClick={openFullscreen}>
            <Text className={styles.expandText}>全屏</Text>
          </View>
        )}
      </View>
    )
  }

  export const useMapFold = () => {
    const [folded, setFolded] = useState(false)
    const onScroll = useCallback((e: any) => setFolded(e.detail.scrollTop > 40), [])
    return { folded, onScroll }
  }
  ```

  Note: When the Tencent Maps SDK spike succeeds, replace the placeholder View with `<TMap>` using `setMapStyle('night')`. Draw the route as a polyline with `color: '#FF5C2B'`, `width: 6`, `arrowLine: true`. The SDK must be imported from a relative path inside the subpackage to stay within the 2MB main package limit.

- [ ] Create `src/components/business/MapWindow/index.module.scss`:
  ```scss
  .window {
    height: 33vh; background: #111118; overflow: hidden;
    transition: height 0.35s cubic-bezier(0.4,0,0.2,1); position: relative;
  }
  .folded { height: 56px; }
  .placeholder {
    width: 100%; height: 100%; display: flex; align-items: center;
    justify-content: center; background: #16161E;
  }
  .placeholderText { font-size: 24rpx; color: var(--color-text-secondary); padding: 0 var(--space-xl); text-align: center; }
  .expandBtn {
    position: absolute; top: 12px; right: 12px;
    background: rgba(255,255,255,0.12); border-radius: var(--radius-tag); padding: 4px 10px;
  }
  .expandText { font-size: 22rpx; color: var(--color-text-primary); }
  ```

### 4.2 `Timeline` component

- [ ] Create `src/components/business/Timeline/index.tsx`:
  ```tsx
  import { View, Text } from '@tarojs/components'
  import type { Stop } from '../../../types'
  import styles from './index.module.scss'

  interface TimelineProps {
    stops: Stop[]
    currentStopIndex: number
    completedStopIds: string[]
    onNavigate: (stop: Stop) => void
    onSwap: (stop: Stop) => void
  }

  export const Timeline: React.FC<TimelineProps> = ({
    stops, currentStopIndex, completedStopIds, onNavigate, onSwap,
  }) => (
    <View className={styles.timeline}>
      {stops.map((stop, idx) => {
        const isDone = completedStopIds.includes(stop.id)
        const isCurrent = idx === currentStopIndex
        return (
          <View key={stop.id} className={styles.row}>
            <View className={styles.track}>
              <View className={`${styles.node} ${isCurrent ? styles.active : ''} ${isDone ? styles.done : ''}`} />
              {idx < stops.length - 1 && (
                <View className={`${styles.line} ${isDone ? styles.lineDone : ''}`} />
              )}
            </View>
            <View className={`${styles.card} ${isDone ? styles.cardDone : ''} ${isCurrent ? styles.cardActive : ''}`}>
              <View className={styles.cardHeader}>
                <Text className={styles.stopName}>{stop.name}</Text>
                <Text className={styles.duration}>{stop.stayMinutes}分钟</Text>
              </View>
              <View className={styles.tags}>
                {stop.tags.map((t) => (
                  <Text key={t} className={styles.tag}>{t}</Text>
                ))}
              </View>
              {isCurrent && (
                <View className={styles.actions}>
                  <View className={styles.actionBtn} onClick={() => onNavigate(stop)}>
                    <Text className={styles.actionText}>导航</Text>
                  </View>
                  <View className={styles.actionBtn} onClick={() => onSwap(stop)}>
                    <Text className={styles.actionText}>换一家</Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        )
      })}
    </View>
  )
  ```

- [ ] Create `src/components/business/Timeline/index.module.scss`:
  ```scss
  .timeline { padding: var(--space-l) var(--space-xl); }
  .row { display: flex; gap: var(--space-l); margin-bottom: var(--space-m); }
  .track { display: flex; flex-direction: column; align-items: center; width: 20px; flex-shrink: 0; }
  .node {
    width: 14px; height: 14px; border-radius: 50%;
    background: var(--color-text-disabled); flex-shrink: 0; position: relative; z-index: 1;
  }
  .active {
    background: var(--color-primary);
    box-shadow: var(--shadow-timeline-active);
    &::before, &::after {
      content: ''; position: absolute; inset: -4px; border-radius: 50%;
      border: 2px solid var(--color-primary);
      animation: pulse-ring 1.5s ease-out infinite;
    }
    &::after { animation-delay: 0.75s; }
  }
  .done { background: var(--color-success); }
  .line { flex: 1; width: 2px; background: var(--color-bg-glass); margin: 4px 0; min-height: 20px; }
  .lineDone { background: var(--color-success); }
  .card {
    flex: 1; background: var(--color-bg-card); border-radius: var(--radius-card-md);
    padding: var(--space-m) var(--space-l); box-shadow: var(--shadow-card-default);
    overflow: hidden; max-height: 300px;
    transition: max-height 0.35s cubic-bezier(0.4,0,0.2,1);
  }
  .cardDone { opacity: 0.5; }
  .cardActive { border: 1.5px solid var(--color-primary); box-shadow: var(--shadow-card-selected); }
  .cardHeader { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: var(--space-s); }
  .stopName { font-size: 36rpx; font-weight: 600; color: var(--color-text-primary); }
  .duration { font-size: 24rpx; color: var(--color-text-secondary); }
  .tags { display: flex; gap: var(--space-s); flex-wrap: wrap; margin-bottom: var(--space-m); }
  .tag {
    font-size: 20rpx; font-weight: 500;
    background: rgba(77,110,255,0.12); color: var(--color-accent);
    padding: var(--space-xs) var(--space-s); border-radius: var(--radius-tag);
  }
  .actions { display: flex; gap: var(--space-s); }
  .actionBtn { padding: var(--space-s) var(--space-m); background: rgba(255,255,255,0.06); border-radius: var(--radius-tag); }
  .actionText { font-size: 24rpx; color: var(--color-text-secondary); }
  ```

### 4.3 Route Detail page

- [ ] Create `src/subpackages/route-detail/index.tsx`:
  ```tsx
  import { useEffect, useState } from 'react'
  import { View, Text, ScrollView } from '@tarojs/components'
  import Taro, { useRouter } from '@tarojs/taro'
  import { MapWindow } from '../../components/business/MapWindow'
  import { Timeline } from '../../components/business/Timeline'
  import { useRouteStore } from '../../stores/useRouteStore'
  import { useTripStore } from '../../stores/useTripStore'
  import { delay } from '../../utils/delay'
  import stopsData from '../../services/mock/stops.json'
  import styles from './index.module.scss'

  export default function RouteDetail() {
    const router = useRouter()
    const routeId = router.params.routeId ?? ''
    const { stops, currentStopIndex, completedStopIds, setStops, startTrip } = useTripStore()
    const { pendingTransitionRect, setPendingTransitionRect } = useRouteStore()
    const [cloneExpanded, setCloneExpanded] = useState(false)
    const [cloneVisible, setCloneVisible] = useState(!!pendingTransitionRect)
    const [ripple, setRipple] = useState<{ x: number; y: number } | null>(null)
    const [mapFolded, setMapFolded] = useState(false)

    useEffect(() => {
      const init = async () => {
        await delay(200)
        setStops(stopsData as any)
        startTrip()
      }
      init()
    }, [])

    // Shared element transition: expand clone to fullscreen
    useEffect(() => {
      if (pendingTransitionRect) {
        const t1 = setTimeout(() => setCloneExpanded(true), 30)
        const t2 = setTimeout(() => { setCloneVisible(false); setPendingTransitionRect(null) }, 450)
        return () => { clearTimeout(t1); clearTimeout(t2) }
      }
    }, [])

    const handleNavigate = (stop: any) => {
      Taro.openLocation({ latitude: stop.lat, longitude: stop.lng, name: stop.name })
    }

    const handleOpenAssistant = (e: any) => {
      const touch = e.changedTouches?.[0]
      if (touch) setRipple({ x: touch.clientX, y: touch.clientY })
      // Fallback: animationend unreliable on WeChat, use setTimeout
      setTimeout(() => {
        setRipple(null)
        Taro.navigateTo({ url: '/subpackages/assistant/index' })
      }, 600)
    }

    const currentStop = stops[currentStopIndex]

    return (
      <View className={styles.page}>
        {/* Shared element clone overlay */}
        {cloneVisible && pendingTransitionRect && (
          <View
            className={`${styles.clone} ${cloneExpanded ? styles.cloneExpanded : ''}`}
            style={!cloneExpanded ? {
              left: `${pendingTransitionRect.left}px`,
              top: `${pendingTransitionRect.top}px`,
              width: `${pendingTransitionRect.width}px`,
              height: `${pendingTransitionRect.height}px`,
              borderRadius: 'var(--radius-card-lg)',
            } : {}}
          />
        )}
        {/* Orange ripple overlay */}
        {ripple && (
          <View className={styles.rippleOverlay}>
            <View className={styles.rippleCircle}
              style={{ left: `${ripple.x - 10}px`, top: `${ripple.y - 10}px` }} />
          </View>
        )}
        <MapWindow stops={stops} currentStopIndex={currentStopIndex} routeId={routeId} />
        <ScrollView scrollY className={styles.scroll} onScroll={(e) => setMapFolded(e.detail.scrollTop > 40)}>
          <Timeline
            stops={stops}
            currentStopIndex={currentStopIndex}
            completedStopIds={completedStopIds}
            onNavigate={handleNavigate}
            onSwap={() => handleOpenAssistant({ changedTouches: [] })}
          />
          <View className={styles.scrollPadding} />
        </ScrollView>
        <View className={styles.floatingRow}>
          <View className={styles.aiBtn} onClick={handleOpenAssistant}>
            <Text className={styles.aiIcon}>AI</Text>
          </View>
          <View className={styles.navBtn} onClick={() => currentStop && handleNavigate(currentStop)}>
            <Text className={styles.navLabel}>导航到下一站</Text>
          </View>
        </View>
      </View>
    )
  }
  ```

- [ ] Create `src/subpackages/route-detail/index.module.scss`:
  ```scss
  .page { min-height: 100vh; background: var(--color-bg-base); display: flex; flex-direction: column; position: relative; }
  .scroll { flex: 1; }
  .scrollPadding { height: 120rpx; }
  .floatingRow {
    position: fixed; bottom: 0; left: 0; right: 0;
    padding: var(--space-l) var(--space-xl);
    padding-bottom: calc(var(--space-l) + env(safe-area-inset-bottom));
    background: rgba(13,13,18,0.85); backdrop-filter: blur(20px);
    box-shadow: var(--shadow-floating-bar);
    display: flex; gap: var(--space-m); align-items: center;
  }
  .aiBtn {
    width: 88rpx; height: 88rpx; border-radius: 50%;
    background: var(--color-bg-card);
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .aiIcon { font-size: 28rpx; font-weight: 700; color: var(--color-accent); }
  .navBtn {
    flex: 1; height: 88rpx; background: var(--gradient-brand);
    border-radius: var(--radius-btn);
    display: flex; align-items: center; justify-content: center;
    box-shadow: var(--shadow-btn-primary);
  }
  .navLabel { color: #fff; font-size: 32rpx; font-weight: 600; }
  /* Shared element clone */
  .clone {
    position: fixed; background: var(--color-bg-card); z-index: 200;
    transition:
      left 420ms cubic-bezier(0.4,0,0.2,1),
      top 420ms cubic-bezier(0.4,0,0.2,1),
      width 420ms cubic-bezier(0.4,0,0.2,1),
      height 420ms cubic-bezier(0.4,0,0.2,1),
      border-radius 420ms cubic-bezier(0.4,0,0.2,1);
    pointer-events: none;
  }
  .cloneExpanded { left: 0 !important; top: 0 !important; width: 100vw !important; height: 100vh !important; border-radius: 0 !important; }
  /* Ripple */
  .rippleOverlay { position: fixed; inset: 0; z-index: 150; pointer-events: none; overflow: hidden; }
  .rippleCircle {
    position: absolute; width: 20px; height: 20px; border-radius: 50%;
    background: var(--color-primary);
    animation: shockwave 0.6s cubic-bezier(0.4,0,1,1) forwards;
    transform-origin: center;
  }
  ```

  Note: The `shockwave` keyframe ends at `scale(1.8)` which won't cover the screen. Override by adding a `style` prop with a very large scale factor, or add a dedicated `ripple-cover` keyframe in `animation.scss`:
  ```scss
  @keyframes ripple-cover {
    0%   { transform: scale(0);   opacity: 0.9; }
    100% { transform: scale(80);  opacity: 0;   }
  }
  ```
  Then apply `.rippleCircle { animation-name: ripple-cover; }`.

### 4.4 WeChat DevTools verification

- [ ] Navigate to route-detail subpackage page.
- [ ] Confirm MapWindow renders at 33vh.
- [ ] Scroll down — confirm map height collapses to 56px.
- [ ] Confirm Timeline active node shows double pulse-ring animation.
- [ ] Tap AI button — confirm orange ripple expands then navigates to assistant.
- [ ] Confirm page stack: DevTools shows home → compare → detail (3 levels).

---

## Phase 5 — Home Page

**Files:**
- Create: `src/pages/home/index.tsx`
- Create: `src/pages/home/index.module.scss`
- Create: `src/components/ui/QuickTag/index.tsx`
- Create: `src/components/ui/QuickTag/index.module.scss`

### 5.1 `QuickTag` component

- [ ] Create `src/components/ui/QuickTag/index.tsx`:
  ```tsx
  import { View, Text } from '@tarojs/components'
  import styles from './index.module.scss'

  interface QuickTagProps {
    label: string
    active?: boolean
    onClick: () => void
  }

  export const QuickTag: React.FC<QuickTagProps> = ({ label, active = false, onClick }) => (
    <View className={`${styles.tag} ${active ? styles.active : ''}`} onClick={onClick}>
      <Text className={styles.label}>{label}</Text>
    </View>
  )
  ```

- [ ] Create `src/components/ui/QuickTag/index.module.scss`:
  ```scss
  .tag {
    padding: var(--space-s) var(--space-m); border-radius: var(--radius-tag);
    background: rgba(255,255,255,0.06); border: 1px solid transparent; flex-shrink: 0;
  }
  .active { background: rgba(255,92,43,0.18); border-color: var(--color-primary); }
  .label { font-size: 28rpx; color: var(--color-text-secondary); white-space: nowrap; }
  .active .label { color: var(--color-primary); }
  ```

### 5.2 Home page

- [ ] Create `src/pages/home/index.tsx`:
  ```tsx
  import { useState } from 'react'
  import { View, Text, Input, ScrollView, Picker } from '@tarojs/components'
  import Taro from '@tarojs/taro'
  import { QuickTag } from '../../components/ui/QuickTag'
  import { useSessionStore } from '../../stores/useSessionStore'
  import styles from './index.module.scss'

  const QUICK_TAGS = ['聚会', '约会', '亲子', '省钱', '少排队']
  const CATEGORIES = ['🍜 火锅', '🧋 奶茶', '📸 拍照', '🍰 甜品']
  const HEADCOUNT_OPTIONS = ['2人', '3人', '4人', '5人', '6人+']

  export default function Home() {
    const { destination, budget, endTime, headcount, setDestination, setHeadcount, setEndTime } = useSessionStore()
    const [focused, setFocused] = useState(false)
    const [activeTag, setActiveTag] = useState<string | null>(null)

    const handleStart = () => {
      if (!destination.trim()) {
        Taro.showToast({ title: '请输入目的地', icon: 'none' })
        return
      }
      Taro.navigateTo({ url: '/pages/preference/index' })
    }

    return (
      <View className={styles.page}>
        <View className={styles.brand}>
          <Text className={styles.brandName}>拼程</Text>
          <Text className={styles.slogan}>拼着玩，一起出发</Text>
        </View>

        <View className={`${styles.inputCard} ${focused ? styles.inputFocused : ''}`}>
          <Input
            className={styles.input}
            placeholder="你们想去哪？说一句话就好"
            placeholderClass={styles.placeholder}
            value={destination}
            onInput={(e) => setDestination(e.detail.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />
        </View>

        <ScrollView scrollX className={styles.tagRow}>
          {QUICK_TAGS.map((t) => (
            <QuickTag key={t} label={t} active={activeTag === t}
              onClick={() => setActiveTag(activeTag === t ? null : t)} />
          ))}
        </ScrollView>

        <ScrollView scrollX className={styles.categoryRow}>
          {CATEGORIES.map((c) => (
            <View key={c} className={styles.categoryItem}>
              <Text className={styles.categoryLabel}>{c}</Text>
            </View>
          ))}
        </ScrollView>

        <View className={styles.pickers}>
          <Picker mode="selector" range={HEADCOUNT_OPTIONS} value={headcount - 2}
            onChange={(e) => setHeadcount(Number(e.detail.value) + 2)}>
            <View className={styles.pickerItem}>
              <Text className={styles.pickerLabel}>👥 {headcount}人</Text>
            </View>
          </Picker>
          <Picker mode="selector" range={['¥80', '¥120', '¥150', '不限']} value={2} onChange={() => {}}>
            <View className={styles.pickerItem}>
              <Text className={styles.pickerLabel}>💰 人均¥{budget}</Text>
            </View>
          </Picker>
          <Picker mode="time" value={endTime} onChange={(e) => setEndTime(e.detail.value)}>
            <View className={styles.pickerItem}>
              <Text className={styles.pickerLabel}>🕐 {endTime}前</Text>
            </View>
          </Picker>
        </View>

        <View className={styles.actions}>
          <View className={styles.primaryBtn} onClick={handleStart}>
            <Text className={styles.primaryLabel}>立即规划</Text>
          </View>
          <View className={styles.secondaryBtn}
            onClick={() => Taro.navigateTo({ url: '/pages/invite/landing/index' })}>
            <Text className={styles.secondaryLabel}>邀请朋友一起填</Text>
          </View>
        </View>
      </View>
    )
  }
  ```

- [ ] Create `src/pages/home/index.module.scss`:
  ```scss
  .page { min-height: 100vh; background: var(--color-bg-base); padding: var(--space-3xl) var(--space-xl) var(--space-xl); }
  .brand { margin-bottom: var(--space-3xl); text-align: center; }
  .brandName {
    display: block; font-size: 56rpx; font-weight: 700; line-height: 1.2;
    background: var(--gradient-brand);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  }
  .slogan { display: block; font-size: 28rpx; color: var(--color-text-secondary); margin-top: var(--space-xs); }
  .inputCard {
    background: var(--color-bg-card); border-radius: var(--radius-card-lg);
    padding: var(--space-l); border: 1.5px solid transparent;
    transition: border-color 280ms ease; margin-bottom: var(--space-l);
  }
  .inputFocused { border-color: var(--color-primary); }
  .input { font-size: 28rpx; color: var(--color-text-primary); min-height: 80rpx; width: 100%; }
  .placeholder { color: var(--color-text-disabled); }
  .tagRow { white-space: nowrap; margin-bottom: var(--space-l); display: flex; gap: var(--space-s); padding: var(--space-xs) 0; }
  .categoryRow { white-space: nowrap; margin-bottom: var(--space-2xl); display: flex; gap: var(--space-m); }
  .categoryItem { padding: var(--space-m) var(--space-l); background: var(--color-bg-card); border-radius: var(--radius-card-md); flex-shrink: 0; }
  .categoryLabel { font-size: 28rpx; color: var(--color-text-primary); white-space: nowrap; }
  .pickers { display: flex; gap: var(--space-m); margin-bottom: var(--space-3xl); }
  .pickerItem { flex: 1; padding: var(--space-m); background: var(--color-bg-card); border-radius: var(--radius-card-md); text-align: center; }
  .pickerLabel { font-size: 24rpx; color: var(--color-text-secondary); white-space: nowrap; }
  .actions { display: flex; flex-direction: column; gap: var(--space-m); }
  .primaryBtn {
    height: 96rpx; background: var(--gradient-brand); border-radius: var(--radius-btn);
    display: flex; align-items: center; justify-content: center;
    box-shadow: var(--shadow-btn-primary);
  }
  .primaryLabel { color: #fff; font-size: 32rpx; font-weight: 600; }
  .secondaryBtn {
    height: 80rpx; border: 1px solid rgba(255,92,43,0.3);
    border-radius: var(--radius-btn);
    display: flex; align-items: center; justify-content: center;
  }
  .secondaryLabel { color: var(--color-primary); font-size: 28rpx; }
  ```

### 5.3 WeChat DevTools verification

- [ ] Confirm brand name renders as orange-to-gold gradient text.
- [ ] Tap input — confirm 1.5px orange border fades in at 280ms ease.
- [ ] Tap a QuickTag — confirm active orange state.
- [ ] Tap "立即规划" without text — confirm toast appears.
- [ ] Enter text, tap "立即规划" — confirm navigation.
- [ ] Confirm two buttons are stacked vertically, NOT side by side.

---

## Phase 6 — Preference Collection + Assembly Animation

**Files:**
- Create: `src/pages/preference/index.tsx`
- Create: `src/pages/preference/index.module.scss`
- Create: `src/components/animation/AssemblyCanvas/index.tsx`
- Create: `src/components/animation/AssemblyCanvas/index.module.scss`

### 6.1 Canvas assembly animation (1650ms total)

The assembly sequence: lock (0ms) → convergence + Canvas lines (200ms) → shockwave explosion (600ms) → "集结完成" text float-in (750ms) → typewriter subtitle (1050ms) → page absorbed (1650ms).

- [ ] Create `src/components/animation/AssemblyCanvas/index.tsx`:
  ```tsx
  import React, { useEffect, useRef, useState } from 'react'
  import { Canvas, View, Text } from '@tarojs/components'
  import Taro from '@tarojs/taro'
  import type { Participant } from '../../../types'
  import { MockEngine } from '../../../utils/mockEngine'
  import styles from './index.module.scss'

  interface AssemblyCanvasProps {
    participants: Participant[]
    onComplete: () => void
  }

  async function drawConnectionLines(
    canvasId: string,
    positions: Array<{ x: number; y: number }>,
  ): Promise<void> {
    return new Promise((resolve) => {
      const query = Taro.createSelectorQuery()
      query.select(`#${canvasId}`).fields({ node: true, size: true }).exec((res) => {
        if (!res?.[0]) { resolve(); return }
        const canvas = res[0].node
        const ctx = canvas.getContext('2d')
        canvas.width = res[0].width
        canvas.height = res[0].height

        const pairs: Array<[{ x: number; y: number }, { x: number; y: number }]> = []
        for (let i = 0; i < positions.length; i++)
          for (let j = i + 1; j < positions.length; j++)
            pairs.push([positions[i], positions[j]])

        let frame = 0
        const TOTAL = 30
        const draw = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height)
          const frac = Math.min(frame / TOTAL, 1)
          pairs.forEach(([a, b], idx) => {
            const pairDelay = idx * 0.15
            const localFrac = Math.max(0, Math.min(1, (frac - pairDelay) / (1 - pairDelay)))
            if (localFrac <= 0) return
            const endX = a.x + (b.x - a.x) * localFrac
            const endY = a.y + (b.y - a.y) * localFrac
            const grad = ctx.createLinearGradient(a.x, a.y, endX, endY)
            grad.addColorStop(0, 'rgba(255,92,43,0.8)')
            grad.addColorStop(1, 'rgba(77,110,255,0.8)')
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(endX, endY)
            ctx.strokeStyle = grad
            ctx.lineWidth = 2
            ctx.stroke()
          })
          frame++
          if (frame <= TOTAL) canvas.requestAnimationFrame(draw)
          else resolve()
        }
        canvas.requestAnimationFrame(draw)
      })
    })
  }

  type Phase = 'hidden' | 'lines' | 'explode' | 'complete' | 'absorbed'

  export const AssemblyCanvas: React.FC<AssemblyCanvasProps> = ({ participants, onComplete }) => {
    const engineRef = useRef<MockEngine | null>(null)
    const [phase, setPhase] = useState<Phase>('hidden')

    useEffect(() => {
      const engine = new MockEngine()
      engineRef.current = engine

      engine.schedule(() => setPhase('lines'), 200)
      engine.schedule(async () => {
        const positions = await Promise.all(
          participants.map((_, i) =>
            new Promise<{ x: number; y: number }>((res) => {
              Taro.createSelectorQuery()
                .select(`#assembly-avatar-${i}`)
                .boundingClientRect((r: any) => res(r
                  ? { x: r.left + r.width / 2, y: r.top + r.height / 2 }
                  : { x: 0, y: 0 }))
                .exec()
            })
          )
        )
        await drawConnectionLines('assembly-canvas', positions)
        setPhase('explode')
      }, 600)
      engine.schedule(() => setPhase('complete'), 750)
      engine.schedule(() => setPhase('absorbed'), 1600)
      engine.schedule(() => onComplete(), 1650)

      return () => engine.destroy()
    }, [])

    return (
      <View className={`${styles.container} ${phase === 'absorbed' ? styles.absorbed : ''}`}>
        <Canvas id="assembly-canvas" type="2d" className={styles.canvas} />

        <View className={styles.avatarGrid}>
          {participants.map((p, i) => (
            <View id={`assembly-avatar-${i}`} key={p.openId}
              className={`${styles.avatar} ${phase !== 'hidden' ? styles.avatarConverge : ''}`}
              style={{ animationDelay: `${i * 80}ms` }}>
              <Text className={styles.avatarInitial}>{p.nickname[0]}</Text>
            </View>
          ))}
        </View>

        {phase === 'explode' && <View className={styles.shockwave} />}

        {(phase === 'complete' || phase === 'absorbed') && (
          <View className={styles.textBlock}>
            <Text className={styles.completeTitle}>{participants.length}人集结完成！</Text>
            <Text className={styles.completeSub}>出发吧，这次绝对值得</Text>
          </View>
        )}
      </View>
    )
  }
  ```

- [ ] Create `src/components/animation/AssemblyCanvas/index.module.scss`:
  ```scss
  .container {
    position: fixed; inset: 0; z-index: 100; background: var(--color-bg-base);
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    transition: transform 0.3s ease, opacity 0.3s ease;
  }
  .absorbed { transform: scale(1.05); opacity: 0; }
  .canvas { position: absolute; inset: 0; width: 100%; height: 100%; }
  .avatarGrid {
    display: flex; flex-wrap: wrap; gap: 40rpx; justify-content: center;
    max-width: 400rpx; position: relative; z-index: 1;
  }
  .avatar {
    width: 80rpx; height: 80rpx; border-radius: 50%;
    background: var(--color-bg-card); border: 2px solid var(--color-primary);
    display: flex; align-items: center; justify-content: center;
  }
  .avatarConverge {
    animation: avatar-converge 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards;
  }
  @keyframes avatar-converge {
    0%   { transform: translate(0, 0); }
    50%  { transform: translate(0, -4px) rotate(-3deg); }
    100% { transform: translate(0, -2px); }
  }
  .avatarInitial { font-size: 32rpx; font-weight: 600; color: var(--color-text-primary); }
  .shockwave {
    position: absolute; width: 160rpx; height: 160rpx; border-radius: 50%;
    border: 2px solid rgba(255,255,255,0.8);
    animation: shockwave 0.15s ease-out forwards;
  }
  .textBlock { text-align: center; animation: float-in 0.4s ease-out forwards; z-index: 1; margin-top: 48rpx; }
  .completeTitle { display: block; font-size: 44rpx; font-weight: 600; color: var(--color-text-primary); margin-bottom: var(--space-s); }
  .completeSub {
    display: block; font-size: 28rpx; color: var(--color-text-secondary);
    animation: typewriter 0.6s steps(12) 0.2s both;
  }
  ```

### 6.2 Preference page

- [ ] Create `src/pages/preference/index.tsx`:
  ```tsx
  import React, { useEffect, useState } from 'react'
  import { View, Text } from '@tarojs/components'
  import Taro from '@tarojs/taro'
  import { usePreferenceStore } from '../../stores/usePreferenceStore'
  import { AssemblyCanvas } from '../../components/animation/AssemblyCanvas'
  import { MockEngine } from '../../utils/mockEngine'
  import styles from './index.module.scss'

  const QUESTIONS = [
    { key: 'taste',    label: '口味偏好？',     options: ['不辣', '微辣', '重辣', '都可以'] },
    { key: 'budget',   label: '人均预算？',     options: ['¥80以内', '¥100左右', '¥150左右', '不限'] },
    { key: 'physical', label: '步行接受度？',   options: ['≤10分钟', '≤20分钟', '≤30分钟', '无所谓'] },
    { key: 'style',    label: '今天的心情？',   options: ['拍照出片', '轻松休闲', '探索打卡', '随便都行'] },
  ]

  const MOCK_PARTICIPANTS = [
    { openId: '1', nickname: '林小夏', avatarUrl: '', status: 'done' as const },
    { openId: '2', nickname: '陈宇',   avatarUrl: '', status: 'done' as const },
    { openId: '3', nickname: '王萌',   avatarUrl: '', status: 'filling' as const },
    { openId: '4', nickname: '李婷',   avatarUrl: '', status: 'pending' as const },
  ]

  const MOCK_CONFLICTS = [
    { id: 'c1', type: 'taste' as const,    description: '王萌必须吃辣，李婷不吃辣', resolved: false, resolution: '选鸳鸯锅，两人同桌各自美丽' },
    { id: 'c2', type: 'budget' as const,   description: '人均预算有50元差距',      resolved: false, resolution: '锁定110-120区间，都能接受' },
    { id: 'c3', type: 'physical' as const, description: '李婷膝盖不好，步行需限制10分钟', resolved: false, resolution: '全程步行≤10分钟，有座位保障' },
  ]

  export default function Preference() {
    const { currentQuestionIndex, answers, conflicts, setAnswer, nextQuestion, setParticipants, setConflicts, participants } = usePreferenceStore()
    const [showConflict, setShowConflict] = useState(false)
    const [showAssembly, setShowAssembly] = useState(false)
    const [resolvedCount, setResolvedCount] = useState(0)

    useEffect(() => { setParticipants(MOCK_PARTICIPANTS) }, [])

    const progress = currentQuestionIndex / QUESTIONS.length

    const handleAnswer = (value: string) => {
      const q = QUESTIONS[currentQuestionIndex]
      setAnswer(q.key, value)
      if (currentQuestionIndex < QUESTIONS.length - 1) {
        nextQuestion()
      } else {
        triggerConflictFlow()
      }
    }

    const triggerConflictFlow = () => {
      setConflicts(MOCK_CONFLICTS)
      const engine = new MockEngine()
      engine.schedule(() => setShowConflict(true), 800)
      engine.schedule(() => setResolvedCount(1), 2500)
      engine.schedule(() => setResolvedCount(2), 5800)
      engine.schedule(() => setResolvedCount(3), 8000)
      engine.schedule(() => { setShowConflict(false); setShowAssembly(true) }, 8300)
    }

    if (showAssembly) {
      return (
        <AssemblyCanvas
          participants={participants}
          onComplete={() => Taro.redirectTo({ url: '/pages/route-compare/index' })}
        />
      )
    }

    const q = QUESTIONS[currentQuestionIndex]

    return (
      <View className={styles.page}>
        <View className={styles.progressBg}>
          <View className={styles.progressFill} style={{ width: `${progress * 100}%` }} />
        </View>

        <View className={styles.avatarRow}>
          {MOCK_PARTICIPANTS.map((p, i) => (
            <View id={`assembly-avatar-${i}`} key={p.openId}
              className={`${styles.avatar} ${p.status === 'done' ? styles.avatarDone : ''}`}>
              <Text className={styles.avatarInitial}>{p.nickname[0]}</Text>
              {p.status === 'done' && <View className={styles.doneRing} />}
            </View>
          ))}
        </View>

        {!showConflict && q && (
          <View className={styles.questionCard}>
            <Text className={styles.questionLabel}>{q.label}</Text>
            <View className={styles.optionGrid}>
              {q.options.map((opt) => (
                <View key={opt}
                  className={`${styles.option} ${answers[q.key] === opt ? styles.optionSelected : ''}`}
                  onClick={() => handleAnswer(opt)}>
                  <Text className={styles.optionText}>{opt}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {showConflict && (
          <View className={styles.conflictArea}>
            <Text className={styles.aiHeader}>AI 决策官正在分析…</Text>
            {conflicts.slice(0, resolvedCount + 1).map((c, idx) => (
              <View key={c.id}
                className={`${styles.conflictCard} ${idx < resolvedCount ? styles.conflictResolved : ''}`}>
                <Text className={styles.conflictLabel}>
                  {idx < resolvedCount ? '✓ 已解决' : '⚡ 冲突'}
                </Text>
                <Text className={styles.conflictDesc}>{c.description}</Text>
                {idx < resolvedCount && (
                  <Text className={styles.conflictResolution}>{c.resolution}</Text>
                )}
              </View>
            ))}
          </View>
        )}
      </View>
    )
  }
  ```

- [ ] Create `src/pages/preference/index.module.scss`:
  ```scss
  .page { min-height: 100vh; background: var(--color-bg-base); padding: 0 var(--space-xl) var(--space-xl); overflow: hidden; }
  .progressBg { height: 3px; background: rgba(255,255,255,0.08); position: sticky; top: 0; z-index: 10; }
  .progressFill { height: 100%; background: var(--gradient-brand); transition: width 0.3s ease; }
  .avatarRow { display: flex; justify-content: center; gap: var(--space-l); padding: var(--space-3xl) 0 var(--space-2xl); }
  .avatar {
    width: 80rpx; height: 80rpx; border-radius: 50%;
    background: var(--color-bg-card); display: flex; align-items: center; justify-content: center; position: relative;
  }
  .avatarDone { border: 2px solid var(--color-success); }
  .doneRing {
    position: absolute; inset: -6px; border-radius: 50%;
    border: 2px solid var(--color-success);
    animation: pulse-ring 0.5s ease-out forwards; opacity: 0;
  }
  .avatarInitial { font-size: 32rpx; font-weight: 600; color: var(--color-text-primary); }
  .questionCard {
    background: var(--color-bg-card); border-radius: var(--radius-card-lg);
    padding: var(--space-2xl); animation: fade-up 0.35s ease-out forwards;
  }
  .questionLabel { display: block; font-size: 44rpx; font-weight: 600; color: var(--color-text-primary); text-align: center; margin-bottom: var(--space-2xl); }
  .optionGrid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-m); }
  .option {
    padding: var(--space-l); background: rgba(255,255,255,0.04);
    border-radius: var(--radius-card-md); border: 1.5px solid transparent; text-align: center;
  }
  .optionSelected { background: rgba(255,92,43,0.12); border-color: var(--color-primary); }
  .optionText { font-size: 28rpx; color: var(--color-text-primary); }
  .conflictArea { padding-top: var(--space-2xl); }
  .aiHeader { display: block; font-size: 28rpx; color: var(--color-text-secondary); text-align: center; margin-bottom: var(--space-l); }
  .conflictCard {
    background: var(--color-bg-card); border-radius: var(--radius-card-md);
    border: 1.5px solid var(--color-danger); padding: var(--space-l); margin-bottom: var(--space-m);
    animation: fade-up 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards;
    transition: border-color 0.5s ease;
  }
  .conflictResolved { border-color: var(--color-success); opacity: 0.85; }
  .conflictLabel { display: block; font-size: 24rpx; font-weight: 500; color: var(--color-warning); margin-bottom: var(--space-s); }
  .conflictResolved .conflictLabel { color: var(--color-success); }
  .conflictDesc { display: block; font-size: 28rpx; color: var(--color-text-primary); margin-bottom: var(--space-s); }
  .conflictResolution {
    display: block; font-size: 24rpx; color: var(--color-text-secondary);
    animation: typewriter 0.8s steps(20) forwards;
  }
  ```

### 6.3 WeChat DevTools verification

- [ ] Navigate to preference page — confirm 3px progress bar at top.
- [ ] Answer all 4 questions — confirm conflict cards slide in with spring animation.
- [ ] After ~8.3s (2.5s at 3x speed) confirm assembly canvas appears with Canvas connection lines.
- [ ] Confirm "集结完成" text floats in, subtitle types in, page scales + fades out.
- [ ] Confirm `redirectTo` navigates to route-compare (not `navigateTo`, preserves stack).

---

## Phase 7 — Journey Assistant + Route Diff Card

**Files:**
- Create: `src/subpackages/assistant/index.tsx`
- Create: `src/subpackages/assistant/index.module.scss`
- Create: `src/components/business/RouteDiffCard/index.tsx`
- Create: `src/components/business/RouteDiffCard/index.module.scss`

### 7.1 `RouteDiffCard` — three `timeStatus` states

`timeStatus` is derived by the frontend: compare `replacement.estimatedEndTime` against `deadline + bufferMinutes`. The AI only returns ETA timestamps. `deadline` comes from `useSessionStore.endTime`. `bufferMinutes = 5` (configurable constant).

- [ ] Create `src/components/business/RouteDiffCard/index.tsx`:
  ```tsx
  import { useState, useEffect } from 'react'
  import { View, Text } from '@tarojs/components'
  import type { TimeStatus } from '../../../types'
  import styles from './index.module.scss'

  export const BUFFER_MINUTES = 5

  interface RouteDiffData {
    original: { name: string; rating: number; queueMinutes: number; estimatedEndTime: string }
    replacement: { name: string; rating: number; queueMinutes: number; estimatedEndTime: string }
    gains: { timeSavedMinutes: number; moneySavedPerPerson: number }
    losses: { ratingDrop: number; extraWalkMeters: number; extraWalkMinutes: number }
    timeStatus: TimeStatus
    deadlineTime: string
    aiVerdict: string
  }

  interface RouteDiffCardProps {
    data: RouteDiffData
    onAccept: () => void
    onDecline: () => void
  }

  export const RouteDiffCard: React.FC<RouteDiffCardProps> = ({ data, onAccept, onDecline }) => {
    const [visible, setVisible] = useState(false)
    useEffect(() => { setTimeout(() => setVisible(true), 50) }, [])

    const headerColor = { safe: 'var(--color-success)', overtime: 'var(--color-warning)', rescued: 'var(--color-primary)' }[data.timeStatus]

    // When declining would cause overtime, show the consequence directly — no confirmation dialog
    const declineLabel = data.timeStatus === 'safe'
      ? '维持原路线'
      : `维持原路线（将超时15分钟）`

    return (
      <View className={`${styles.card} ${visible ? styles.visible : ''}`}>
        <View className={styles.header} style={{ background: headerColor }}>
          <Text className={styles.headerTitle}>换店建议</Text>
          <Text className={styles.headerSub}>{data.replacement.name}</Text>
        </View>

        {data.timeStatus === 'rescued' && (
          <View className={styles.bannerGreen}>
            <Text className={styles.bannerText}>
              换了能救回来！预计 {data.replacement.estimatedEndTime} 完成（截止 {data.deadlineTime}）
            </Text>
          </View>
        )}
        {data.timeStatus === 'overtime' && (
          <View className={styles.bannerYellow}>
            <Text className={styles.bannerText}>两条路线都会超时，差别在于超时多少</Text>
          </View>
        )}

        <View className={styles.body}>
          <View className={styles.col}>
            <Text className={styles.colTitle}>得到</Text>
            <Text className={styles.gain}>节省 {data.gains.timeSavedMinutes} 分钟</Text>
            <Text className={styles.gain}>省 ¥{data.gains.moneySavedPerPerson}/人</Text>
          </View>
          <View className={styles.divider} />
          <View className={`${styles.col} ${styles.colRight}`}>
            <Text className={styles.colTitle}>失去</Text>
            <Text className={styles.loss}>评分降 {data.losses.ratingDrop}★</Text>
            <Text className={styles.loss}>多走 {data.losses.extraWalkMeters}m</Text>
          </View>
        </View>

        <Text className={styles.verdict}>{data.aiVerdict}</Text>

        <View className={styles.actions}>
          <View className={data.timeStatus === 'rescued' ? styles.acceptFull : styles.accept} onClick={onAccept}>
            <Text className={styles.acceptLabel}>
              {data.timeStatus === 'rescued' ? `换掉，去 ${data.replacement.name}` : '换掉'}
            </Text>
          </View>
          <View className={styles.decline} onClick={onDecline}>
            <Text className={styles.declineLabel}>{declineLabel}</Text>
          </View>
        </View>
      </View>
    )
  }
  ```

- [ ] Create `src/components/business/RouteDiffCard/index.module.scss`:
  ```scss
  .card {
    background: var(--color-bg-card); border-radius: var(--radius-card-lg); overflow: hidden;
    box-shadow: var(--shadow-card-diff);
    transform: translateY(60px); opacity: 0;
    transition: transform 0.5s cubic-bezier(0.37,0,0.63,1), opacity 0.5s ease;
    margin: var(--space-l) var(--space-xl);
  }
  .visible { transform: translateY(0); opacity: 1; }
  .header { padding: var(--space-l); }
  .headerTitle { display: block; font-size: 24rpx; color: rgba(255,255,255,0.7); font-weight: 500; }
  .headerSub { display: block; font-size: 36rpx; font-weight: 600; color: #fff; margin-top: var(--space-xs); }
  .bannerGreen { background: rgba(0,201,167,0.12); border-left: 3px solid var(--color-success); padding: var(--space-m) var(--space-l); }
  .bannerYellow { background: rgba(255,184,0,0.12); border-left: 3px solid var(--color-warning); padding: var(--space-m) var(--space-l); }
  .bannerText { font-size: 24rpx; color: var(--color-text-secondary); }
  .body { display: flex; padding: var(--space-l); gap: var(--space-l); }
  .col { flex: 1; animation: fade-up 0.4s ease forwards; }
  .colRight { animation-delay: 50ms; }
  .colTitle { display: block; font-size: 24rpx; color: var(--color-text-disabled); margin-bottom: var(--space-s); }
  .gain { display: block; font-size: 28rpx; color: var(--color-success); margin-bottom: var(--space-xs); }
  .loss { display: block; font-size: 28rpx; color: var(--color-text-secondary); margin-bottom: var(--space-xs); }
  .divider { width: 1px; background: rgba(255,255,255,0.06); }
  .verdict { display: block; font-size: 24rpx; color: var(--color-text-secondary); padding: 0 var(--space-l) var(--space-m); font-style: italic; }
  .actions { display: flex; flex-direction: column; gap: var(--space-s); padding: 0 var(--space-l) var(--space-l); animation: fade-up 0.3s ease 0.5s both; }
  .accept, .acceptFull {
    height: 88rpx; background: var(--gradient-brand); border-radius: var(--radius-btn);
    display: flex; align-items: center; justify-content: center;
    box-shadow: var(--shadow-btn-primary);
  }
  .acceptLabel { color: #fff; font-size: 30rpx; font-weight: 600; }
  .decline {
    height: 72rpx; border: 1px solid rgba(255,255,255,0.10);
    border-radius: var(--radius-btn);
    display: flex; align-items: center; justify-content: center;
  }
  .declineLabel { color: var(--color-text-secondary); font-size: 26rpx; }
  ```

### 7.2 Assistant page

- [ ] Create `src/subpackages/assistant/index.tsx`:
  ```tsx
  import React, { useState } from 'react'
  import { View, Text, Input, ScrollView } from '@tarojs/components'
  import Taro from '@tarojs/taro'
  import { RouteDiffCard } from '../../components/business/RouteDiffCard'
  import { useTripStore } from '../../stores/useTripStore'
  import { MockEngine } from '../../utils/mockEngine'
  import routeDiffData from '../../services/mock/routeDiff.json'
  import styles from './index.module.scss'

  interface Message {
    id: string
    role: 'ai' | 'user'
    text: string
    showDiff?: boolean
  }

  const QUICK = ['排队要多久？', '附近有没有更好的选择？', '今天能按时结束吗？']

  export default function Assistant() {
    const { currentStopIndex, stops } = useTripStore()
    const [messages, setMessages] = useState<Message[]>([{
      id: 'init', role: 'ai',
      text: `你好！当前第 ${currentStopIndex + 1} 站：${stops[currentStopIndex]?.name ?? ''}。有什么我能帮你们的？`,
    }])
    const [inputValue, setInputValue] = useState('')
    const [thinking, setThinking] = useState(false)

    const handleSend = (text?: string) => {
      const msg = text ?? inputValue.trim()
      if (!msg) return
      setInputValue('')
      setMessages((prev) => [...prev, { id: Date.now().toString(), role: 'user', text: msg }])
      setThinking(true)
      const engine = new MockEngine()
      engine.schedule(() => {
        setThinking(false)
        const showDiff = msg.includes('排队') || msg.includes('换') || msg.includes('选择')
        setMessages((prev) => [...prev, {
          id: Date.now().toString(), role: 'ai',
          text: showDiff
            ? '网红鸳鸯锅排队 58 分钟，按这个速度 21:15 才能结束，超出你们 9 点计划。我找到替代方案——要看看吗？'
            : '明白了，按当前进度整体节奏不错，继续保持！',
          showDiff,
        }])
      }, 1200)
    }

    return (
      <View className={styles.page}>
        <View className={styles.ambientGlow} />
        <View className={styles.topBar}>
          <Text className={styles.pageTitle}>途中助手</Text>
          <View className={styles.statusPill}>
            <Text className={styles.statusText}>行程进行中 第 {currentStopIndex + 1} 站</Text>
          </View>
        </View>

        <ScrollView scrollY className={styles.list} scrollWithAnimation>
          {messages.map((m) => (
            <View key={m.id}>
              <View className={`${styles.bubble} ${m.role === 'user' ? styles.userBubble : styles.aiBubble}`}>
                {m.role === 'ai' && <View className={styles.aiBar} />}
                <Text className={styles.bubbleText}>{m.text}</Text>
              </View>
              {m.showDiff && (
                <RouteDiffCard
                  data={routeDiffData as any}
                  onAccept={() => { Taro.showToast({ title: '已切换路线', icon: 'success' }); Taro.navigateBack() }}
                  onDecline={() => Taro.navigateBack()}
                />
              )}
            </View>
          ))}
          {thinking && (
            <View className={styles.thinkingBubble}>
              <View className={styles.aiBar} />
              <View className={styles.dots}>
                {[0, 1, 2].map((i) => <View key={i} className={styles.dot} style={{ animationDelay: `${i * 0.16}s` }} />)}
              </View>
            </View>
          )}
          <View className={styles.listPadding} />
        </ScrollView>

        <View className={styles.inputArea}>
          <ScrollView scrollX className={styles.quickRow}>
            {QUICK.map((q) => (
              <View key={q} className={styles.quickChip} onClick={() => handleSend(q)}>
                <Text className={styles.quickText}>{q}</Text>
              </View>
            ))}
          </ScrollView>
          <View className={styles.inputRow}>
            <Input className={styles.input} placeholder="问点什么…" placeholderClass={styles.placeholder}
              value={inputValue} onInput={(e) => setInputValue(e.detail.value)} onConfirm={() => handleSend()} />
            <View className={styles.sendBtn} onClick={() => handleSend()}>
              <Text className={styles.sendIcon}>↑</Text>
            </View>
          </View>
        </View>
      </View>
    )
  }
  ```

- [ ] Create `src/subpackages/assistant/index.module.scss`:
  ```scss
  .page { min-height: 100vh; background: var(--color-bg-base); display: flex; flex-direction: column; position: relative; overflow: hidden; }
  .ambientGlow {
    position: absolute; top: -80px; left: 50%; transform: translateX(-50%);
    width: 600rpx; height: 600rpx; border-radius: 50%;
    background: radial-gradient(circle, rgba(123,47,255,0.06) 0%, transparent 70%); pointer-events: none;
  }
  .topBar { display: flex; align-items: center; justify-content: space-between; padding: var(--space-l) var(--space-xl); box-shadow: var(--shadow-ai-ambient); }
  .pageTitle { font-size: 36rpx; font-weight: 600; color: var(--color-text-primary); }
  .statusPill { background: rgba(0,201,167,0.12); border: 1px solid var(--color-success); border-radius: 100px; padding: var(--space-xs) var(--space-m); }
  .statusText { font-size: 22rpx; color: var(--color-success); }
  .list { flex: 1; padding: var(--space-l) var(--space-xl); }
  .bubble { max-width: 75%; margin-bottom: var(--space-m); border-radius: var(--radius-card-md); padding: var(--space-m) var(--space-l); display: flex; gap: var(--space-s); }
  .aiBubble { background: var(--color-bg-card); margin-right: auto; box-shadow: var(--shadow-card-default); }
  .userBubble { background: rgba(255,92,43,0.12); border: 1px solid rgba(255,92,43,0.2); margin-left: auto; }
  .aiBar { width: 3px; border-radius: 2px; background: var(--color-accent); flex-shrink: 0; }
  .bubbleText { font-size: 28rpx; color: var(--color-text-primary); line-height: 1.6; animation: typewriter 0.6s steps(40) forwards; }
  .thinkingBubble { display: flex; gap: var(--space-s); background: var(--color-bg-card); border-radius: var(--radius-card-md); padding: var(--space-m) var(--space-l); max-width: 120rpx; margin-bottom: var(--space-m); }
  .dots { display: flex; align-items: center; gap: 6px; }
  .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--color-text-secondary); animation: dot-bounce 1.2s ease-in-out infinite; }
  .listPadding { height: 180rpx; }
  .inputArea {
    position: fixed; bottom: 0; left: 0; right: 0;
    background: rgba(13,13,18,0.85); backdrop-filter: blur(20px);
    padding: var(--space-s) var(--space-xl);
    padding-bottom: calc(var(--space-m) + env(safe-area-inset-bottom));
  }
  .quickRow { display: flex; gap: var(--space-s); margin-bottom: var(--space-s); white-space: nowrap; }
  .quickChip { padding: var(--space-xs) var(--space-m); background: rgba(77,110,255,0.10); border: 1px solid rgba(77,110,255,0.25); border-radius: 100px; flex-shrink: 0; }
  .quickText { font-size: 24rpx; color: var(--color-accent); white-space: nowrap; }
  .inputRow { display: flex; align-items: center; background: var(--color-bg-card); border-radius: var(--radius-input); padding: var(--space-s) var(--space-m); gap: var(--space-m); }
  .input { flex: 1; font-size: 28rpx; color: var(--color-text-primary); min-height: 64rpx; }
  .placeholder { color: var(--color-text-disabled); }
  .sendBtn { width: 64rpx; height: 64rpx; border-radius: 50%; background: var(--color-primary); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .sendIcon { color: #fff; font-size: 32rpx; font-weight: 700; }
  ```

### 7.3 WeChat DevTools verification

- [ ] Navigate to assistant subpackage.
- [ ] Confirm purple ambient glow at top center, blue left bar on AI bubbles.
- [ ] Tap "排队要多久？" — confirm 3-dot thinking animation then RouteDiffCard slides up from `translateY(60px)`.
- [ ] Confirm card header is orange (`rescued` state), green banner visible.
- [ ] Confirm decline button reads "维持原路线（将超时15分钟）" with no confirmation dialog.
- [ ] Tap accept — confirm `navigateBack`.

---

## Phase 8 — Invite Flow + Map Fullscreen Page

**Files:**
- Create: `src/pages/invite/landing/index.tsx`
- Create: `src/pages/invite/landing/index.module.scss`
- Create: `src/subpackages/map-fullscreen/index.tsx`
- Create: `src/subpackages/map-fullscreen/index.module.scss`

### 8.1 Invite landing page

- [ ] Create `src/pages/invite/landing/index.tsx`:
  ```tsx
  import { useEffect, useState } from 'react'
  import { View, Text } from '@tarojs/components'
  import Taro, { useRouter } from '@tarojs/taro'
  import { FloatingBar } from '../../../components/ui/FloatingBar'
  import { useSessionStore } from '../../../stores/useSessionStore'
  import styles from './index.module.scss'

  export default function InviteLanding() {
    const router = useRouter()
    const { inviteCode, tripId } = router.params
    const { destination, headcount, endTime } = useSessionStore()
    const [joining, setJoining] = useState(false)

    useEffect(() => {
      if (!inviteCode && !tripId) {
        Taro.reLaunch({ url: '/pages/home/index' })
      }
    }, [])

    const handleJoin = () => {
      setJoining(true)
      Taro.getUserProfile({
        desc: '用于加入行程',
        success: () => Taro.navigateTo({ url: '/pages/preference/index' }),
        fail: () => {
          setJoining(false)
          Taro.showToast({ title: '需要授权才能加入', icon: 'none' })
        },
      })
    }

    return (
      <View className={styles.page}>
        <Text className={styles.cityscape}>🌆</Text>
        <Text className={styles.inviterName}>林小夏 邀请你加入</Text>
        <Text className={styles.tripName}>{destination || '北京周末游'}</Text>
        <View className={styles.infoRow}>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>人数</Text>
            <Text className={styles.infoValue}>{headcount}人</Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>结束时间</Text>
            <Text className={styles.infoValue}>{endTime}</Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>已加入</Text>
            <Text className={styles.infoValue}>1/{headcount}</Text>
          </View>
        </View>
        {inviteCode && (
          <View className={styles.codeBox}>
            <Text className={styles.codeLabel}>邀请码</Text>
            <Text className={styles.codeValue}>{inviteCode}</Text>
            <Text className={styles.codeNote}>24小时内有效</Text>
          </View>
        )}
        <FloatingBar
          label={joining ? '加入中...' : '加入这次行程'}
          disabled={joining}
          onClick={handleJoin}
        />
      </View>
    )
  }
  ```

- [ ] Create `src/pages/invite/landing/index.module.scss`:
  ```scss
  .page {
    min-height: 100vh; background: var(--color-bg-base);
    display: flex; flex-direction: column; align-items: center;
    padding: var(--space-3xl) var(--space-xl) 120rpx; text-align: center;
  }
  .cityscape { font-size: 120rpx; margin-bottom: var(--space-3xl); }
  .inviterName { display: block; font-size: 28rpx; color: var(--color-text-secondary); margin-bottom: var(--space-m); }
  .tripName { display: block; font-size: 44rpx; font-weight: 600; color: var(--color-text-primary); margin-bottom: var(--space-2xl); }
  .infoRow { display: flex; justify-content: center; gap: var(--space-3xl); margin-bottom: var(--space-2xl); }
  .infoItem { display: flex; flex-direction: column; align-items: center; gap: var(--space-xs); }
  .infoLabel { font-size: 22rpx; color: var(--color-text-disabled); }
  .infoValue { font-size: 32rpx; font-weight: 600; color: var(--color-text-primary); }
  .codeBox {
    background: var(--color-bg-card); border-radius: var(--radius-card-md);
    padding: var(--space-l); display: flex; flex-direction: column; align-items: center; gap: var(--space-xs); width: 100%;
  }
  .codeLabel { font-size: 22rpx; color: var(--color-text-disabled); }
  .codeValue { font-size: 48rpx; font-weight: 700; color: var(--color-primary); letter-spacing: 8px; font-variant-numeric: tabular-nums; }
  .codeNote { font-size: 20rpx; color: var(--color-text-disabled); }
  ```

### 8.2 Map fullscreen page

- [ ] Create `src/subpackages/map-fullscreen/index.tsx`:
  ```tsx
  import { View, Map, Text } from '@tarojs/components'
  import Taro from '@tarojs/taro'
  import { useTripStore } from '../../stores/useTripStore'
  import styles from './index.module.scss'

  export default function MapFullscreen() {
    const { stops, currentStopIndex } = useTripStore()

    const markers = stops.map((s, i) => ({
      id: i,
      latitude: s.lat,
      longitude: s.lng,
      title: s.name,
      iconPath: i === currentStopIndex ? '/assets/pin-active.png' : '/assets/pin-default.png',
      width: 32,
      height: 32,
    }))

    const polyline = stops.length > 1 ? [{
      points: stops.map((s) => ({ latitude: s.lat, longitude: s.lng })),
      color: '#FF5C2B',
      width: 6,
      arrowLine: true,
    }] : []

    return (
      <View className={styles.page}>
        <Map
          className={styles.map}
          latitude={stops[currentStopIndex]?.lat ?? 31.2978}
          longitude={stops[currentStopIndex]?.lng ?? 121.5037}
          scale={15}
          markers={markers}
          polyline={polyline}
          showLocation
        />
        <View className={styles.closeBtn} onClick={() => Taro.navigateBack()}>
          <Text className={styles.closeIcon}>✕</Text>
        </View>
      </View>
    )
  }
  ```

- [ ] Create `src/subpackages/map-fullscreen/index.module.scss`:
  ```scss
  .page { width: 100vw; height: 100vh; position: relative; }
  .map { width: 100%; height: 100%; }
  .closeBtn {
    position: fixed; top: 60rpx; right: var(--space-xl);
    width: 72rpx; height: 72rpx; border-radius: 50%;
    background: rgba(13,13,18,0.8);
    display: flex; align-items: center; justify-content: center; z-index: 10;
  }
  .closeIcon { color: var(--color-text-primary); font-size: 32rpx; }
  ```

### 8.3 Final integration pass

- [ ] Verify `app.config.ts` pages list matches all 7 page paths exactly.
- [ ] Run `npm run build:weapp` — confirm zero TypeScript errors.
- [ ] Step through the full demo script in WeChat DevTools:
  - [ ] Home: enter "五角场合生汇" → "立即规划" → preference page opens
  - [ ] Preference: answer 4 questions → conflict cards animate in sequence
  - [ ] Preference: assembly canvas fires → redirectTo route-compare
  - [ ] Route compare: 3 cards stagger in, recommended pre-selected
  - [ ] Route compare: tap card → "进入这条路线" → shared-element clone expands
  - [ ] Route detail: map window at 33vh, scroll to fold it
  - [ ] Route detail: tap AI button → orange ripple → assistant opens
  - [ ] Assistant: tap "排队要多久？" → RouteDiffCard slides in
  - [ ] RouteDiffCard: orange header (rescued), green banner, full-width accept button
  - [ ] Accept → navigateBack to detail
- [ ] Confirm page stack peak is 4 (`home → compare → detail → assistant`).
- [ ] Confirm `APP_CONFIG.MOCK_SPEED = 0.3` accelerates all timed sequences 3x for demo.

---

## Appendix — Key Technical Pitfalls Reference

| Pitfall | Problem | Mitigation applied in this plan |
|---|---|---|
| Map z-index bleed | Native `<map>` component cannot be covered by CSS layers | MapWindow uses SDK placeholder; fullscreen uses separate native `<Map>` page |
| CSS transition skip | Switching `display: none` to `block` prevents transitions | Cards use `opacity + transform`; Timeline expand uses `max-height` transition |
| `animationend` unreliable | Some WeChat devices never fire `animationend` | All animation sequencing uses `setTimeout` with explicit durations (MockEngine) |
| Typewriter via setData | Frequent `setData` calls for per-character updates drop frames | `clip-path: inset(0 100% 0 0)` to `inset(0 0% 0 0)` CSS animation (see `animation.scss`) |
| React 18 concurrent APIs | `useTransition`/`useDeferredValue` are unsupported in Taro mini-program | Not used anywhere |
| `wx.getLocation` UX | Requesting location on `onLoad` causes rejected permission dialogs | Location only requested on explicit user tap |
| Page stack overflow | `navigateTo` silently fails at 10 layers | Stack peak = 4; `preference→compare` uses `redirectTo`; reset uses `reLaunch` |
| Canvas avatar positions | CSS cannot dynamically compute line angles between DOM nodes | `createSelectorQuery().boundingClientRect()` + Canvas 2D `linearGradient` in `drawConnectionLines` |
| Subpackage 2MB limit | Tencent Maps SDK is large | SDK placed in `src/subpackages/route-detail/tmap/`, never in main package |
