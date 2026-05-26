# 用户登录功能设计文档

日期：2026-05-16  
状态：已确认，待实现

---

## 1. 目标

为拼程小程序添加微信用户登录功能，支持邀请好友、行程同步等协作场景的身份识别需求。

---

## 2. 设计决策

| 决策项 | 选择 | 原因 |
|---|---|---|
| 登录入口 | 首页内嵌，操作触发 | 最小摩擦，用户有意图时再授权 |
| UI 形式 | 底部半屏弹窗 | 与项目现有 sheet 模式一致 |
| 视觉风格 | 极简单色，文字居中 | 遵循 design.md Clean Neutral Minimal |
| 架构 | 纯前端本地登录 | 当前无后端，后续可升级 |
| 持久化 | Taro.setStorage | 冷启动免重新授权 |
| 用户信息 | userId + nickName + avatarUrl | 够用于邀请协作展示 |

---

## 3. 登录触发时机

以下操作在未登录状态下触发登录弹窗：

- 点击首页底部「立即规划」按钮
- 点击首页右上角「邀请好友」图标

用户可关闭弹窗跳过登录（软强制，不阻断浏览）。

---

## 4. 登录流程

```
用户点击「微信一键登录」
  → wx.getUserProfile()        获取 nickName、avatarUrl（需用户主动点击触发）
  → wx.login()                 获取 code（作临时会话标识，5min 有效）
  → 本地生成 UUID              作持久 userId
  → Taro.setStorageSync()      存储 { userId, nickName, avatarUrl, loginTime }
  → useUserStore.setUser()     写入内存状态
  → 关闭弹窗，继续原操作
```

**冷启动恢复：**
```
app.tsx onLaunch
  → Taro.getStorageSync('user')
  → 若存在 → useUserStore.setUser()   静默恢复登录态
```

---

## 5. 数据结构

### useUserStore（新建）

```ts
interface UserState {
  userId: string        // 本地生成的 UUID
  nickName: string
  avatarUrl: string
  isLoggedIn: boolean
  setUser: (user: Omit<UserState, 'setUser' | 'isLoggedIn'>) => void
  clearUser: () => void
}
```

### Storage key: `'pc_user'`

```ts
{
  userId: string
  nickName: string
  avatarUrl: string
  loginTime: number   // Date.now()
}
```

---

## 6. 登录弹窗 UI 规格

遵循 design.md 底部 Sheet 规范：

```
背景：#FFFFFF
圆角：40rpx 40rpx 0 0
手柄：rgba(0,0,0,0.15)，宽 64rpx，高 5rpx
内容区 padding：48rpx

标题：「登录拼程」，52rpx，字重 800，#111111，居中
副标题：「登录后可邀请好友、同步行程」，28rpx，#888888，居中
间距：标题与副标题间 16rpx，副标题与按钮间 48rpx

主 CTA 按钮：「微信一键登录」
  背景 #111111，文字 #FFFFFF，32rpx 600
  圆角 999rpx，高度 96rpx，宽度 100%

协议文字：「登录即同意用户协议和隐私政策」
  20rpx，rgba(17,17,17,0.30)，居中
  距按钮 24rpx
```

---

## 7. 首页头像展示

- 已登录：首页右上角显示用户头像（48rpx 圆形），替换现有 group 图标
- 未登录：保持现有 group 图标不变

---

## 8. 涉及文件

| 文件 | 操作 |
|---|---|
| `src/stores/useUserStore.ts` | 新建 |
| `src/components/business/LoginSheet/index.tsx` | 新建 |
| `src/components/business/LoginSheet/index.module.scss` | 新建 |
| `src/pages/home/index.tsx` | 修改：触发逻辑 + 头像展示 |
| `src/pages/home/index.module.scss` | 修改：头像样式 |
| `src/app.tsx` | 修改：冷启动恢复登录态 |

---

## 9. 不在本次范围内

- 退出登录
- 手机号授权
- 后端 token 换取真实 openid
- 独立登录页
- 用户资料编辑页

---

## 10. 后续升级路径

后端就绪后，在 `LoginSheet` 的登录逻辑里追加一步：
```
wx.login() code → POST /auth/wx-login → 获取真实 openid + 自定义 token
```
Storage 结构不变，仅新增 `token` 字段，其余代码无需改动。
