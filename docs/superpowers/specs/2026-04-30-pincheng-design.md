# 拼程小程序 设计规范文档

**日期：** 2026-04-30  
**产品：** 拼程 — 多人本地出行 AI 决策小程序  
**Slogan：** 拼着玩，一起出发  
**范围：** P0 核心链路前端完整设计规范  

---

## 1. 技术栈

| 模块 | 选型 | 说明 |
|---|---|---|
| 框架 | Taro 3.6.x + React 18 | 稳定版，不上 Taro 4 |
| UI 库 | NutUI-React 2.x | 深色主题用 CSS 变量覆盖 |
| 状态管理 | Zustand | 轻量，小程序兼容无问题 |
| 地图 | 腾讯地图 SDK（@map-component/tmap-miniapp） | 放分包，规避主包 2MB 限制 |
| 动效 | CSS keyframes + Canvas 2D API（粒子） | Lottie 不用，Taro 兼容坑多 |
| Mock | 本地 JSON + 请求封装层 | NODE_ENV 切换，加 200ms 延迟 |

**分包策略：** 路线详情页（含腾讯地图 SDK）放分包，主包只保留首页、偏好收集、路线对比。

---

## 2. 设计系统

### 2.1 色彩

```scss
// 背景层级
--color-bg-base:    #0D0D12;   // L0 全局底色
--color-bg-card:    #1C1C26;   // L1 卡片层
--color-bg-glass:   rgba(255,255,255,0.06); // L2 毛玻璃浮层，配合 backdrop-filter: blur(16px)

// 主色
--color-primary:    #FF5C2B;   // 活力橙红，主按钮/品牌高光
--color-primary-light: #FF7A47; // 渐变辅助色

// 辅助色
--color-accent:     #4D6EFF;   // 电蓝，AI标识/Route Diff收益
--color-success:    #00C9A7;   // 薄荷绿，已完成/冲突解决
--color-warning:    #FFB800;   // 警告黄，排队风险/冲突预警
--color-danger:     #FF4757;   // 危险红，删除/强冲突

// 文字层级
--color-text-primary:   #F2F2F5;  // 主文字
--color-text-secondary: #9494A8;  // 次文字
--color-text-disabled:  #4A4A5E;  // 禁用/Placeholder

// 渐变
--gradient-brand:  linear-gradient(135deg, #FF5C2B, #FFB300);  // 主按钮/卡片头
--gradient-ai:     linear-gradient(135deg, #4D6EFF, #7B2FFF);  // AI助手页氛围
--gradient-mask:   linear-gradient(180deg, transparent, rgba(13,13,18,0.85)); // 蒙层
```

### 2.2 圆角

| 元素 | 圆角 |
|---|---|
| 大卡片（路线卡、偏好卡） | 20px |
| 中卡片（站点卡、对话气泡） | 16px |
| 按钮 | 14px |
| 标签 Tag | 8px |
| 图标容器 | 12px |
| 输入框 | 16px |
| 底部弹窗 | 顶部 28px，底部 0 |

### 2.3 间距（4px 基础单位）

| 名称 | 值 | 场景 |
|---|---|---|
| XS | 4px | 图标与文字间距 |
| S | 8px | 标签内 padding |
| M | 12px | 卡片内元素间距 |
| L | 16px | 卡片内边距 |
| XL | 20px | 页面左右边距 |
| 2XL | 24px | 卡片间距 |
| 3XL | 32px | 大模块间距 |

### 2.4 Type Scale

| Token | rpx | px≈ | Weight | Line-H | 用途 |
|---|---|---|---|---|---|
| `display` | 56 | 29 | 700 | 1.2 | 首页「拼程」品牌名 |
| `title` | 44 | 23 | 600 | 1.3 | 页面标题 |
| `card-title` | 36 | 19 | 600 | 1.4 | 路线名/站点名 |
| `body` | 28 | 15 | 400 | 1.6 | AI文案/描述段落 |
| `data` | 40 | 21 | 700 | 1.2 | ¥118、4.5h、800m（数字大于标题，刻意） |
| `data-unit` | 24 | 12.5 | 400 | 1.2 | 单位符号 ¥/h/km |
| `caption` | 24 | 12.5 | 400 | 1.5 | 时间戳/次要说明 |
| `tag` | 20 | 10.5 | 500 | 1.4 | Tag 内文字 |
| `badge` | 18 | 9.5 | 500 | 1.2 | 角标/徽章 |

字体：PingFang SC（中文）+ SF Pro Display（数字/英文），均为系统字体。  
数字使用 `font-variant-numeric: tabular-nums` 保证对齐。

### 2.5 彩色阴影系统

```scss
// 主按钮 — 橙红燃烧感
--shadow-btn-primary:
  0 4px 12px rgba(255,92,43,0.55),
  0 8px 32px rgba(255,92,43,0.25);

// AI推荐卡片 — 电蓝+橙红双色
--shadow-card-recommend:
  0  2px  8px  rgba(77,110,255,0.20),
  0  8px  24px rgba(77,110,255,0.30),
  0 16px  48px rgba(77,110,255,0.15),
  0  0   32px  rgba(255,92,43,0.08);

// 普通卡片默认态
--shadow-card-default:
  0 2px  8px rgba(10,10,20,0.60),
  0 4px 16px rgba(10,10,20,0.40);

// 卡片选中态 — 橙红
--shadow-card-selected:
  0  2px  6px  rgba(255,92,43,0.30),
  0  6px  20px rgba(255,92,43,0.20),
  0 12px  40px rgba(255,92,43,0.10);

// 底部悬浮操作栏
--shadow-floating-bar:
  0 -4px  16px rgba(255,92,43,0.18),
  0 -1px  32px rgba(255,92,43,0.08),
  0 -12px 48px rgba(10,10,20,0.50);

// Route Diff 卡片 — 青绿
--shadow-card-diff:
  0 2px   8px  rgba(0,201,167,0.20),
  0 8px   24px rgba(0,201,167,0.15),
  0 16px  40px rgba(0,201,167,0.08);

// 时间轴当前节点 — 信标感
--shadow-timeline-active:
  0 0  0   3px rgba(255,92,43,0.25),
  0 0  12px 4px rgba(255,92,43,0.50),
  0 0  24px 8px rgba(255,92,43,0.20);

// 途中助手 AI 环境光
--shadow-ai-ambient:
  0  0  40px  16px rgba(138,92,246,0.18),
  0  0  80px  32px rgba(138,92,246,0.10),
  0  8px 24px  8px rgba(77,110,255,0.12),
  0  0  120px 48px rgba(255,92,43,0.05);
```

---

## 3. 工程结构

```
src/
  pages/
    home/             # 首页（主包）
    preference/       # 多人偏好收集（主包）
    route-compare/    # 路线对比（主包）
    route-detail/     # 路线详情（分包，含地图SDK）
    assistant/        # 途中助手（分包）
    map-fullscreen/   # 全屏地图页（分包）
    invite/
      landing/        # 好友邀请落地页
  components/
    ui/               # 基础UI组件（卡片、标签、头像组）
    business/         # 业务组件（路线卡片、时间轴、Route Diff卡片）
    animation/        # 动效组件（粒子Canvas、pulse节点、集结动效）
  stores/
    useSessionStore.ts    # 行程会话（地点/时间/人数）
    usePreferenceStore.ts # 多人偏好 + 冲突列表
    useRouteStore.ts      # 路线列表 + 选中路线
    useTripStore.ts       # 途中状态（当前站点/已完成站点）
    useUIStore.ts         # 全局UI状态（loading/modal）
  services/
    request.ts        # 统一请求封装
    mock/             # Mock JSON 数据
    api/              # API 层（env 切换）
  styles/
    theme.scss        # CSS 变量主题
    animation.scss    # 公共动效 keyframes
  utils/
    delay.ts          # Mock 延迟工具
    
    rect.ts           # 获取元素位置（转场共享元素用）
    mockEngine.ts     # Demo 演示 Mock 引擎
```

**Store 说明：** `useRouteStore`（路线选择态）和 `useTripStore`（途中进行态）分开，生命周期不同。`useUIStore` 不存转场信息，转场参数通过路由传递。

---

## 4. 五个核心页面设计

### 4.1 首页（home）

**基调：** 极简深色，输入框为绝对视觉重心。

**布局：**
- 顶部品牌区：「拼程」渐变A文字填充（display字号），slogan 次文字色
- 核心输入卡片：`#1C1C26` 大圆角（20px），流光 placeholder，获焦时 1.5px 橙色描边渐现，280ms ease
- 快捷标签横向滚动（聚会/约会/亲子/省钱/少排队），激活态主色底色
- 快捷品类行（火锅/奶茶/拍照/甜品）
- 底部人数/预算/结束时间三个 picker
- 主按钮「立即规划」（全宽，渐变A，shadow-btn-primary）
- 次按钮「邀请朋友一起填」下沉为次级操作，不与主按钮并排

**注意：** 双按钮不并排，避免用户决策卡顿。邀请功能是规划流程内的步骤。

---

### 4.2 多人偏好收集页（preference）

**基调：** 协作感，答题卡式，实时进度可见。

**布局：**
- 顶部好友头像列表（40px 圆形），完成者外圈绿色圆弧动画扩散（500ms）
- 3px 进度条（主色渐变），页面顶部
- 答题卡主体：当前问题大卡片（20px 圆角，全宽），题目居中，选项 2列图文网格
- 支持返回修改（进度条可点击返回对应题目）
- 底部冲突预警条：弹簧上弹出现（`cubic-bezier(0.34,1.56,0.64,1)`），黄色底色 `rgba(255,183,0,0.12)`，自然语言描述冲突，不遮主内容

**三重冲突协商动效（完整 9 秒流程）：**

```
0.0s  进入协商页 — 顶部「AI 决策官正在分析…」
0.8s  冲突#1 从底部滑入（translateY 100%→0，400ms，spring曲线）
1.5s  双方头像向中心碰撞（±8px，rotate ±3°，600ms）
2.5s  AI 介入：打字机文案（clip-path 裁切实现，非逐字setData）
      卡片呼吸（scale 1→1.02→1，400ms）
      边框色 #FF5C2B→#00C9A7（hue-rotate，500ms）
      顶部标签「⚡冲突」→「✓已解决」（擦除替换，300ms）
3.2s  冲突#2 滑入
5.8s  冲突#3 滑入
8.0s  三卡片收缩（scale→0.85，translateY→-20px，opacity→0.3，350ms）
      汇总视图从底部推入（translateY 60%→0，500ms，ease-out-expo）
      四人头像从四角聚合（600ms，spring，stagger 80ms）
      聚合完成触发 confetti（50粒，Canvas，颜色取品牌色）
8.8s  「4人集结完成！」文字浮现（blur 8px→0 + translateY 12px→0）
      协商摘要三行 stagger 入场（100ms间隔）
```

**AI 协商文案（可直接使用）：**

- 口味冲突：「王萌非辣不欢，李婷碰辣绕道走——这对组合我见多了。解法不是妥协，是选鸳鸯锅。两人同桌吃饭，各自美丽。」
- 预算冲突：「夏夏想要精致感，陈宇钱包有话说。找人均¥110-120的区间——环境拿得出手，结账时没人皱眉头。这才叫「都赢」。」
- 体力冲突：「规则只有一条：以最弱的那条腿为准。步行≤10分钟、全程有座。王萌不亏，李婷不累，这才是聪明的玩法。」

---

### 4.3 路线对比页（route-compare）

**基调：** 决策时刻，三张卡片瀑布入场。

**布局：**
- 顶部标题「为你们生成了3条路线」+ 副文字（人数/地点）
- 三张全宽路线卡片竖向排列（间距 16px）
- 每张卡片：顶部 4px 渐变色条 + 推荐角标（右上，`#00C9A7`底白字）+ 地图路线缩略图 + 三项核心数据（data字号） + 亮点标签
- AI推荐卡片：默认 scale 1.04，`shadow-card-recommend`，橙色边框光晕
- 底部悬浮「进入这条路线」（随选中卡片变化，`shadow-floating-bar`）

**入场动效：**
三张卡片依次从底部淡入，间隔 120ms，`translateY(20px)→0 + opacity 0→1`，`cubic-bezier(0.34,1.56,0.64,1)`。

**交互：**
- 点击卡片触发共享元素转场（见第6节转场协议）
- 长按卡片底部弹出快速对比条

---

### 4.4 路线详情页（route-detail）

**基调：** 真实出行感，信息密度高但层次清晰。

**布局：**
- 地图小窗（33vh）：腾讯地图 SDK，`setMapStyle('night')`，橙色路径线（`#FF5C2B`，width 6，arrowLine true），当前站点脉冲光圈（CSS @keyframes，双层扩散）
- 下滑时地图折叠贴顶（`ScrollView onScroll` 监听，`height: 33vh→56px`，`0.35s cubic-bezier(0.4,0,0.2,1)`）
- 折叠态 56px 条显示横向路线缩略
- 右上角「展开」→ `navigateTo` 全屏地图页（规避 map 层级问题）
- 时间轴主体：左侧节点+连接线（`shadow-timeline-active`），右侧站点卡片
- 每站：站点名（card-title）/ 停留时长（caption）/ 玩法标签横滚 / 导航+取号+换一家
- 已完成站点：`opacity 0.5` + 绿勾
- 当前站点：橙色节点 + 双层 pulse 光圈
- 底部悬浮：左侧「呼叫AI助手」图标按钮 + 右侧「导航到下一站」主按钮

**卡片展开/收起：** `max-height` 过渡（设足够大上限），注意小程序 `height:auto` 不可 transition。

**地图方案说明：**
- 优先腾讯地图 SDK（第一天验证，分包部署）
- 失败回退：静态截图预览 + `navigateTo` 全屏原生 `<map>` 页

---

### 4.5 途中助手页（assistant）

**基调：** AI沉浸感，Route Diff 是视觉高潮。

**布局：**
- 背景：`#0D0D12` + 顶部中央极淡蓝紫径向光晕（`rgba(123,47,255,0.06)`），`shadow-ai-ambient` 施加于对话容器
- 顶部：「途中助手」+ 右侧「行程进行中 第N站」绿色胶囊
- AI 对话流：AI气泡左侧 3px `#4D6EFF` 竖条标识，流式打字动效（`clip-path` 实现），「思考中」状态有三点律动 loading
- 底部毛玻璃输入区：`rgba(13,13,18,0.85)` + `backdrop-filter: blur(20px)`，输入框 + 发送 + 快捷问（上下文感知，根据当前站点动态变化）

**Route Diff 卡片（三种时间状态）：**

| 状态 | `timeStatus` | 顶部色 | 横幅 | 按钮策略 |
|---|---|---|---|---|
| 换店后准时 | `safe` | `#00C9A7` 绿 | 无 | 蓝色推荐按钮 |
| 换了也超时 | `overtime` | `#FFB800` 黄 | 黄色横幅（两条路都超时对比） | 两按钮并重，文案「知道会晚，换/不换」 |
| 不换超时，换能救 | `rescued` | `#FF5C2B` 橙 | 绿色横幅（换了能救回来） | 全宽橙红主按钮，次按钮写明后果 |

- `timeStatus` 由前端推导，AI 只返回 ETA 时间戳
- `deadline` 从 `useSessionStore` 读取，单一数据源
- `bufferMinutes = 5`（可配置常量）
- 不换会超时时，「维持原路线」按钮直接写「维持原路线（将超时15分钟）」，无需二次确认弹窗

**Route Diff 入场动效（600ms 分阶段）：**
```
0ms    AI文字气泡出现
       用户确认后，对话流上推 40px（弹性缓动）
0ms    Diff 卡片 translateY(60px)→0 + opacity 0→1
       spring: stiffness 280, damping 22
300ms  左栏收益内容逐行淡入
350ms  右栏代价内容淡入（50ms 延迟错位）
500ms  底部按钮行淡入
```

---

## 5. 邀请好友完整流程

### 5.1 发起人流程

触发入口：行程创建完成页主 CTA / 等待页右上角图标

邀请面板（Bottom Sheet）：
- 「发送给微信好友/群」→ `wx.shareAppMessage`，path: `/pages/invite/landing?inviteCode=XXX&tripId=XXX`
- 「生成小程序码图片」→ 后端 `wxacode.get`，保存相册
- 邀请码显示（6位大写字母+数字，24小时有效）

转发卡片内容：「林小夏 邀请你一起规划 · 北京周末游 · 4人成行，已加入1/4」

### 5.2 好友落地页

路径：`/pages/invite/landing`

第一屏内容：
- 城市天际线插画
- 「林小夏邀请你加入」+ 行程名（card-title）
- 行程信息（日期/人数/已加入进度）
- 发起人留言
- 全宽橙色「加入这次行程」按钮

身份确认：`wx.getUserProfile` 获取微信头像昵称，零注册摩擦，`wx.login` 静默获取 openId。

### 5.3 等待页实时状态

```
████████░░░░  2/4 已完成

✅ 林小夏（你）  已完成
✅ 陈宇          已完成  12:34
✏️  王萌          填写中...（呼吸光效）
⏳ 李婷          未加入

[催一催 李婷]（再次触发分享）
[现在开始AI规划（3人）→]
```

### 5.4 边界情况

| 情况 | 处理 |
|---|---|
| 未安装小程序 | 微信原生引导，无需额外设计 |
| 链接过期（>24h） | 过期页 + 「联系发起人重新邀请」 |
| 进入时已开始规划 | 允许补填，标注「可重新协商」 |
| 无邀请码直接进入 | `reLaunch` 首页 |

### 5.5 邀请码数据结构

```typescript
{
  inviteCode: string,     // 6位大写字母+数字
  tripId: string,
  createdBy: string,      // openId
  createdAt: number,      // 时间戳
  expireAt: number,       // +24小时
  maxJoins: 10,
  status: 'active' | 'expired' | 'closed'
}
```

---

## 6. 页面转场协议

| 路径 | 导航方式 | 动效 | 时长 | 特殊处理 |
|---|---|---|---|---|
| 首页 → 偏好 | `navigateTo` | 下→上推入 | 300ms | 旧页同步 scale→0.94 |
| 偏好 → 对比 | `redirectTo` | 缩放展开 | 500ms | 底部先弹「卡片预览条」预告 |
| 对比 → 详情 | `navigateTo` | 卡片展开全屏 | 420ms | 视觉欺骗：JS记录卡片rect，详情页克隆展开 |
| 详情 → 助手 | `navigateTo` | 橙色波纹铺满屏 | 400+200ms | FAB按钮位置扩散波纹 |
| 助手 → 详情 | `navigateBack` | 右滑出 | 350ms | 返回后时间轴变更节点波浪式flash |
| 任意 → 首页 | `reLaunch` | 黑幕淡入淡出 | 300+400ms | 清空页面栈，首页内容交错入场 |

**页面栈峰值：4层**（home→route-compare→route-detail→assistant），安全。

**转场曲线规范：**
- 向前推入：`cubic-bezier(0.32, 0.72, 0, 1)`（iOS Sheet 感）
- 缩放展开：`cubic-bezier(0.16, 1, 0.3, 1)`（Expo Out，弹性）
- 卡片展开：`cubic-bezier(0.4, 0, 0.2, 1)`（Material Standard）
- 波纹扩散：`cubic-bezier(0.4, 0, 1, 1)`（Ease In，加速冲出）

**对比→详情「视觉欺骗」共享元素实现：**
1. 点击卡片时用 `createSelectorQuery` 记录卡片 rect 存入 `useUIStore`
2. 详情页挂载时读取 rect，渲染克隆视图于相同坐标
3. CSS transition 将克隆从卡片尺寸 expand 到全屏（圆角 20px→0，420ms）
4. Expand 完成后隐藏克隆，显示真实详情内容

---

## 7. 集结完成仪式感动效（完整规范）

**总时长：1650ms，节奏：汇聚 → 爆发 → 余韵**

| 时间 | 内容 | 实现 |
|---|---|---|
| 0ms | 最后一人「咔哒」锁定：边框白→绿，scale 1→0.9→1.1→1.0 | CSS cubic-bezier |
| 200ms | 所有头像向中心微移 2-4px；Canvas 连接线依次点亮（80ms间隔，扫光） | Canvas + rAF |
| 600ms | 爆发帧：白色冲击波圆环 scale 0→1.8 + opacity 1→0（150ms）；所有头像被冲击弹跳 | CSS keyframes |
| 750ms | 「4人集结完成！」浮现：`blur(8px)→0` + `translateY(12px)→0` | CSS filter+transform |
| 1050ms | 副文字打字机 + 背景持续微光 | JS逐字（clip-path方案） |
| 1650ms | 页面 scale 1→1.05 + opacity→0（被吸入感） | CSS |

**连接线实现：** 必须用 Canvas，CSS 无法根据头像实际位置动态计算角度和长度。用 `createSelectorQuery` 获取头像节点位置，Canvas `linearGradient` 绘制带扫光的连接线。

---

## 8. 地图方案

**选型：腾讯地图 SDK（@map-component/tmap-miniapp）**

- 放分包，规避主包 2MB 限制
- 深色样式：`setMapStyle('night')` + 自定义样式 JSON 精确控制颜色
- 折叠交互：CSS transition + ScrollView onScroll，无层级穿透问题
- 脉冲光圈：SDK canvas 渲染，直接跑 CSS animation，无覆盖层冲突
- 全屏展开：`navigateTo` 独立全屏地图页（`map-fullscreen`）

**第一天验证任务：** 跑通 Taro + SDK 基础初始化 + 折叠动画 demo。  
**失败回退：** 静态图预览（腾讯静态图 API 预生成）+ 全屏原生 `<map>` 页。

---

## 9. Mock 数据设计

### Demo 人物设定

| 角色 | 名字 | 偏好 |
|---|---|---|
| 发起人 | 林小夏 | 拍照出片、人均150 |
| 好友1 | 陈宇 | 人均100以内、不挑食 |
| 好友2 | 王萌 | 必须吃辣、体力好 |
| 好友3 | 李婷 | 不吃辣、膝盖不好、需要座位 |

### Demo 地点（上海真实地点，增加可信度）

出发点：五角场合生汇门口

| 路线 | 内容 | 人均 | 耗时 | 步行 | 排队 |
|---|---|---|---|---|---|
| 少排队轻松线 | 弄堂里的湖南菜→创智天地草坪拍照→%Arabica咖啡 | ¥118 | 4.5h | 800m | 低 |
| 高性价比省钱线 | 四平路本帮菜→复旦校园随拍→沪上阿姨 | ¥95 | 4h | 1.2km | 中 |
| 拍照出片线（AI推荐） | 网红鸳鸯锅→大学路网红墙→SeeSaw咖啡 | ¥132 | 5h | 1.5km | 低 |

### Route Diff Mock 数据

```
原方案：网红鸳鸯锅（4.8★，排队预计58分钟）
新方案：弄堂里的湖南菜（4.6★，等位5分钟）

得到：节省53分钟  节省¥17/人
失去：评分降0.2★  步行增加420米（约6分钟）
预计结束时间：20:48（原路线预计21:15，超出9点截止）
AI判断：强烈建议换，原路线会导致超时
```

### Mock 引擎

```typescript
// utils/mockEngine.ts
class MockEngine {
  constructor(config: { MOCK_SPEED: number })
  schedule(fn: () => void, delay: number): void
  destroy(): void
}

// APP_CONFIG.MOCK_SPEED = 0.3（路演加速3倍）
```

所有 Mock 只操作本地 state，不发网络请求。Mock 延迟统一加 200ms 保证 Loading 动效可见。

---

## 10. 开发顺序

1. **路线对比页** — 验证卡片动效方案可行性，Mock 数据最简单
2. **路线详情页** — 地图 SDK 早排雷，时间轴是最复杂组件
3. **首页** — 输入交互 + 定位，完成后有完整入口感
4. **多人偏好收集页** — 冲突动效复杂，但全 Mock 可简化
5. **途中助手页** — 需前4页状态稳定后串联完整 Demo 流程

---

## 11. 关键技术坑预警

| 坑 | 问题 | 规避 |
|---|---|---|
| 地图层级 | 原生 `map` z-index 失效，穿透覆盖其他元素 | 用 SDK / 独立全屏页 |
| CSS transition 失效 | `display:none→block` 切换动效不触发 | 用 `visibility+opacity` 或 `max-height` |
| `animationend` 不可靠 | 某些机型不触发，时序链断掉 | 用 `setTimeout` 兜底计时器 |
| 打字机效果性能 | 逐字 `setData` 性能差 | 用 `clip-path: inset(0 X% 0 0)` 动画 |
| React 18 并发特性 | `useTransition`/`useDeferredValue` 小程序不可用 | 不使用并发特性 |
| wx.getLocation 时机 | onLoad 直接调用体验差，拒绝后功能废掉 | 用户点击定位按钮时触发，先检查权限 |
| 页面栈超限 | 超10层 navigateTo 静默失败 | 峰值4层，用 redirectTo/reLaunch 控制 |

---

## 12. Demo 路演脚本

**话术节奏（5分钟）：**

1. 「林小夏输入一句话需求」→ AI解析展示
2. 「发给三位好友」→ Mock引擎自动3倍速模拟好友加入
3. 「四个人，三个冲突，AI决策官9秒搞定，你看」→ 触发冲突协商动效
4. 「三条差异化路线」→ 卡片瀑布入场，指出 AI 推荐逻辑
5. 「到了第一个站点，火锅店排队60分钟」→ 途中助手页
6. Route Diff 弹出：「换了能救回来，还能早走12分钟」→ 接受调整

**最易被质疑的问题和回答：**
- 「这不就是美团+高德？」→ 「美团能协商王萌和李婷的口味冲突吗？高德能告诉你换掉这家值不值吗？」
- 「数据从哪来？」→ 「POI接入高德/美团API，排队预估基于历史时段数据+用户众包」
- 「多人实时协同延迟怎么保证？」→ 「偏好是异步收集，出发前10分钟内完成填写即可，不需要同时在线」

---

## 13. 设计总结

**一句话：** 用「日落橙 × 宇宙蓝」双色张力托举出行决策感，每次「拼」都有仪式感与信任感。

**核心差异化：**
- 多人集结完成仪式感（产品独有场景）
- Route Diff 超时联动（AI决策官而非数据展示）
- 三重冲突叠加协商（真实人际复杂性）
- 视觉欺骗共享元素转场（接近原生App体验）
