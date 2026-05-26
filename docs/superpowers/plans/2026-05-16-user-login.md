# 用户登录功能实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为拼程小程序添加微信一键登录，点击「立即规划」或「邀请好友」时若未登录弹出底部登录弹窗，登录态持久化到 Storage。

**Architecture:** 新建 `useUserStore` 管理用户状态，新建 `LoginSheet` 组件封装登录 UI 与流程，在 `app.tsx` 冷启动时恢复登录态，在 `home/index.tsx` 中接入触发逻辑与头像展示。

**Tech Stack:** Taro 3、React、Zustand、TypeScript、SCSS Modules、微信小程序 wx.getUserProfile / wx.login API

---

## 文件结构

| 文件 | 操作 | 职责 |
|---|---|---|
| `src/stores/useUserStore.ts` | 新建 | 用户状态（userId/nickName/avatarUrl/isLoggedIn）+ Storage 持久化 |
| `src/components/business/LoginSheet/index.tsx` | 新建 | 登录弹窗 UI + 微信授权逻辑 |
| `src/components/business/LoginSheet/index.module.scss` | 新建 | 弹窗样式，遵循 design.md |
| `src/app.tsx` | 修改 | onLaunch 时从 Storage 恢复登录态 |
| `src/pages/home/index.tsx` | 修改 | 触发登录弹窗 + 已登录展示头像 |
| `src/pages/home/index.module.scss` | 修改 | 头像样式 |

---

## Task 1: 新建 useUserStore

**Files:**
- Create: `src/stores/useUserStore.ts`

- [ ] **Step 1: 创建 useUserStore**

```ts
// src/stores/useUserStore.ts
import { create } from 'zustand'
import Taro from '@tarojs/taro'

const STORAGE_KEY = 'pc_user'

interface UserInfo {
  userId: string
  nickName: string
  avatarUrl: string
  loginTime: number
}

interface UserState {
  userId: string
  nickName: string
  avatarUrl: string
  isLoggedIn: boolean
  setUser: (info: Omit<UserInfo, 'loginTime'>) => void
  restoreFromStorage: () => void
  clearUser: () => void
}

export const useUserStore = create<UserState>((set) => ({
  userId: '',
  nickName: '',
  avatarUrl: '',
  isLoggedIn: false,

  setUser: (info) => {
    const data: UserInfo = { ...info, loginTime: Date.now() }
    Taro.setStorageSync(STORAGE_KEY, data)
    set({ ...info, isLoggedIn: true })
  },

  restoreFromStorage: () => {
    try {
      const data = Taro.getStorageSync(STORAGE_KEY) as UserInfo | ''
      if (data && data.userId) {
        set({
          userId: data.userId,
          nickName: data.nickName,
          avatarUrl: data.avatarUrl,
          isLoggedIn: true,
        })
      }
    } catch (_) {}
  },

  clearUser: () => {
    Taro.removeStorageSync(STORAGE_KEY)
    set({ userId: '', nickName: '', avatarUrl: '', isLoggedIn: false })
  },
}))
```

- [ ] **Step 2: Commit**

```bash
git add src/stores/useUserStore.ts
git commit -m "feat: add useUserStore with wx login state and storage persistence"
```

---

## Task 2: 新建 LoginSheet 样式

**Files:**
- Create: `src/components/business/LoginSheet/index.module.scss`

- [ ] **Step 1: 创建样式文件**

```scss
// src/components/business/LoginSheet/index.module.scss

.mask {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.45);
}

.sheet {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1001;
  background: #FFFFFF;
  border-radius: 40rpx 40rpx 0 0;
  padding: 32rpx 48rpx 0;
  padding-bottom: calc(48rpx + env(safe-area-inset-bottom));
  display: flex;
  flex-direction: column;
  align-items: center;
}

.handle {
  width: 64rpx;
  height: 5rpx;
  background: rgba(0, 0, 0, 0.15);
  border-radius: 999rpx;
  margin-bottom: 40rpx;
}

.title {
  font-size: 52rpx;
  font-weight: 800;
  color: #111111;
  text-align: center;
  margin-bottom: 16rpx;
}

.subtitle {
  font-size: 28rpx;
  color: #888888;
  text-align: center;
  margin-bottom: 48rpx;
}

.loginBtn {
  width: 100%;
  height: 96rpx;
  background: #111111;
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24rpx;
}

.loginBtnText {
  font-size: 32rpx;
  font-weight: 600;
  color: #FFFFFF;
}

.agreement {
  font-size: 20rpx;
  color: rgba(17, 17, 17, 0.30);
  text-align: center;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/business/LoginSheet/index.module.scss
git commit -m "feat: add LoginSheet styles following design.md minimal spec"
```

---

## Task 3: 新建 LoginSheet 组件

**Files:**
- Create: `src/components/business/LoginSheet/index.tsx`

- [ ] **Step 1: 创建 LoginSheet 组件**

```tsx
// src/components/business/LoginSheet/index.tsx
import Taro from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { useState } from 'react'
import styles from './index.module.scss'
import { useUserStore } from '../../../stores/useUserStore'

// 生成简单 UUID（无需外部依赖）
function generateId(): string {
  return 'u_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}

interface Props {
  onClose: () => void
  onSuccess?: () => void
}

export default function LoginSheet({ onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false)
  const setUser = useUserStore(s => s.setUser)

  const handleLogin = async () => {
    if (loading) return
    setLoading(true)
    try {
      // 1. 获取用户头像昵称（需要用户主动点击按钮触发）
      const profileRes = await Taro.getUserProfile({ desc: '用于显示你的头像和昵称' })
      const { nickName, avatarUrl } = profileRes.userInfo

      // 2. 获取 wx.login code（临时标识，无后端时仅记录）
      await Taro.login()

      // 3. 持久化用户信息
      const userId = generateId()
      setUser({ userId, nickName, avatarUrl })

      onSuccess?.()
      onClose()
    } catch (e) {
      // 用户拒绝授权或取消，静默处理
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <View className={styles.mask} onClick={onClose} />
      <View className={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <View className={styles.handle} />
        <Text className={styles.title}>登录拼程</Text>
        <Text className={styles.subtitle}>登录后可邀请好友、同步行程</Text>
        <View className={styles.loginBtn} onClick={handleLogin}>
          <Text className={styles.loginBtnText}>
            {loading ? '登录中…' : '微信一键登录'}
          </Text>
        </View>
        <Text className={styles.agreement}>登录即同意用户协议和隐私政策</Text>
      </View>
    </>
  )
}
```

- [ ] **Step 2: 验证 Taro.getUserProfile 在微信小程序中需要 button 触发**

> **注意：** 微信从基础库 2.27.1 起，`wx.getUserProfile` 必须由用户点击 button 组件触发，不能由普通 View 触发。如果在真机测试时发现授权弹窗不出现，需将 `loginBtn` 的 `View` 替换为 Taro 的 `Button` 组件，并加上 `openType="getUserInfo"` 或保持现有点击方式（Taro 内部会处理）。测试时留意控制台是否有 "api scope is not declared in the privacy agreement" 错误。

- [ ] **Step 3: Commit**

```bash
git add src/components/business/LoginSheet/index.tsx
git commit -m "feat: add LoginSheet component with wx.getUserProfile login flow"
```

---

## Task 4: 修改 app.tsx — 冷启动恢复登录态

**Files:**
- Modify: `src/app.tsx`

- [ ] **Step 1: 在 onLaunch 中恢复登录态**

将 `src/app.tsx` 改为：

```tsx
// src/app.tsx
import { PropsWithChildren } from 'react'
import { useLaunch } from '@tarojs/taro'
import './app.scss'
import { useUserStore } from './stores/useUserStore'

function App({ children }: PropsWithChildren<any>) {
  const restoreFromStorage = useUserStore(s => s.restoreFromStorage)

  useLaunch(() => {
    restoreFromStorage()
  })

  return children
}

export default App
```

- [ ] **Step 2: Commit**

```bash
git add src/app.tsx
git commit -m "feat: restore user login state from storage on app launch"
```

---

## Task 5: 修改 home/index.tsx — 接入登录弹窗与头像

**Files:**
- Modify: `src/pages/home/index.tsx`
- Modify: `src/pages/home/index.module.scss`

- [ ] **Step 1: 在 home/index.module.scss 末尾追加头像样式**

在文件末尾追加：

```scss
// 已登录用户头像
.userAvatar {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  overflow: hidden;
  border: 1.5rpx solid rgba(0, 0, 0, 0.10);
  flex-shrink: 0;
}
```

- [ ] **Step 2: 修改 home/index.tsx**

在文件顶部 import 区追加：

```tsx
import { Image } from '@tarojs/components'
import LoginSheet from '../../components/business/LoginSheet'
import { useUserStore } from '../../stores/useUserStore'
```

在 `HomePage` 函数顶部（`useSessionStore` 那行之后）追加：

```tsx
const { isLoggedIn, avatarUrl } = useUserStore()
const [showLogin, setShowLogin] = useState(false)
const [pendingAction, setPendingAction] = useState<'plan' | 'invite' | null>(null)
```

**替换 `handlePlan` 函数：**

```tsx
const handlePlan = () => {
  if (!area.trim()) {
    Taro.showToast({ title: '请输入目的地或活动', icon: 'none' })
    return
  }
  if (!isLoggedIn) {
    setPendingAction('plan')
    setShowLogin(true)
    return
  }
  doplan()
}

const doplan = () => {
  const code = Math.random().toString(36).slice(2, 8).toUpperCase()
  setSession({
    peopleCount: PERSON_COUNTS[personIdx],
    budgetPerPerson: BUDGET_VALUES[budgetIdx],
    endTime: ENDTIME_OPTIONS[endTimeIdx],
    sceneTags: activeTags,
    categories: activeCategories,
    inviteCode: code,
  })
  setPlanning(true)
  setTimeout(() => {
    setPlanning(false)
    Taro.navigateTo({ url: '/pages/route-compare/index' })
  }, 1800)
}
```

**替换邀请好友图标区域**（找到 `<View className={styles.inviteBtn}` 那段，替换为）：

```tsx
{isLoggedIn ? (
  <Image
    src={avatarUrl}
    className={styles.userAvatar}
    onClick={() => setShowInviteSheet(true)}
  />
) : (
  <View className={styles.inviteBtn}
    onClick={() => {
      setPendingAction('invite')
      setShowLogin(true)
    }}>
    <Icon name="group" size={20} color="#111111" />
  </View>
)}
```

**在 JSX 最后的 `</View>` 关闭标签前追加 LoginSheet：**

```tsx
{showLogin && (
  <LoginSheet
    onClose={() => { setShowLogin(false); setPendingAction(null) }}
    onSuccess={() => {
      if (pendingAction === 'plan') doplan()
      if (pendingAction === 'invite') setShowInviteSheet(true)
    }}
  />
)}
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/home/index.tsx src/pages/home/index.module.scss
git commit -m "feat: wire LoginSheet into home page for plan and invite actions"
```

---

## Task 6: 验收检查

- [ ] **冷启动恢复**：已登录状态下关闭小程序再打开，右上角应直接显示头像，不需重新授权

- [ ] **未登录点击「立即规划」**：弹出登录弹窗，授权后自动继续规划流程跳转至路线对比页

- [ ] **未登录点击「邀请好友」图标**：弹出登录弹窗，授权后打开邀请好友弹窗

- [ ] **已登录点击「立即规划」**：直接进入规划流程，不弹登录窗

- [ ] **点击弹窗遮罩**：弹窗关闭，不触发登录

- [ ] **用户拒绝授权**：弹窗关闭，无报错 toast，原操作不继续

- [ ] **Commit**

```bash
git add .
git commit -m "chore: verify login flow works end-to-end"
```
