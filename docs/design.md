# 拼程 Design System — Clean Neutral Minimal

参考风格：Fi App（宠物追踪）  
核心原则：**信息优先，装饰为零，单一主色，大量留白**

---

## 1. 色彩

### 背景
| Token | 值 | 用途 |
|---|---|---|
| `--color-bg-base` | `#F7F7F8` | 页面底色（极浅灰，非纯白） |
| `--color-bg-card` | `#FFFFFF` | 卡片、弹窗 |
| `--color-bg-section` | `#EFEFEF` | 分组背景（参数组等） |

> 去除所有渐变光晕背景（`--gradient-bg`）

### 主色：保留品牌橙，但只用纯色
| Token | 值 | 用途 |
|---|---|---|
| `--color-primary` | `#E8470A` | 强调文字、active 状态、数据高亮 |
| `--color-primary-bg` | `rgba(232,71,10,0.08)` | 轻色背景 |

> 去除所有橙色渐变（`--gradient-brand`），改用纯色

### CTA 按钮：纯黑
| Token | 值 | 用途 |
|---|---|---|
| `--color-cta` | `#111111` | 主操作按钮背景 |
| `--color-cta-text` | `#FFFFFF` | 主操作按钮文字 |

### 文字
| Token | 值 | 用途 |
|---|---|---|
| `--color-label-1` | `#111111` | 主标题、正文 |
| `--color-label-2` | `#555555` | 次级文字 |
| `--color-label-3` | `rgba(17,17,17,0.40)` | 辅助/占位 |
| `--color-label-4` | `rgba(17,17,17,0.22)` | 禁用/极淡 |

### 边框 & 分割线
| Token | 值 | 用途 |
|---|---|---|
| `--color-separator` | `rgba(0,0,0,0.08)` | 列表分割线 |
| `--color-border` | `rgba(0,0,0,0.10)` | 卡片描边（替代阴影） |

---

## 2. 排版

| 级别 | 大小 | 字重 | 用途 |
|---|---|---|---|
| 超大数字 | 72rpx | 800 | 路线时长、费用等核心数据 |
| 大标题 | 44rpx | 700 | 页面主标题 |
| 卡片标题 | 34rpx | 600 | 卡片名称 |
| 正文 | 30rpx | 400 | 列表项、说明 |
| 小字 | 24rpx | 400 | 标签、辅助说明 |
| 极小 | 20rpx | 500 | section header（大写字母间距） |

Section header 样式：全大写 + 字母间距 `2rpx` + `--color-label-3`，模仿 Fi 的分区标签

---

## 3. 卡片

```
背景：#FFFFFF
描边：1rpx solid rgba(0,0,0,0.10)   ← 替代阴影
圆角：24rpx（普通卡片）/ 16rpx（紧凑卡片）
阴影：去除，改用描边
```

选中状态：描边改为 `2rpx solid #111111`（黑色），不加橙色阴影

---

## 4. 按钮

### 主 CTA（页面底部）
```
背景：#111111（纯黑）
文字：#FFFFFF，32rpx，字重 600
圆角：999rpx（Pill）
高度：96rpx
阴影：去除
```

### 次级按钮
```
背景：#FFFFFF
描边：1.5rpx solid rgba(0,0,0,0.15)
文字：#111111，32rpx，字重 500
圆角：999rpx
高度：96rpx
```

### 功能标签 / 选项按钮（场景标签、参数选项）
```
未选中：背景 #FFFFFF，描边 1rpx solid rgba(0,0,0,0.10)，文字 #555555
选中：  背景 #111111，描边 无，文字 #FFFFFF
```

---

## 5. 间距

保持现有 token，但应用时更激进留白：
- 页面左右 padding：`48rpx`
- section 间距：`48rpx`（原 56rpx，略收紧）
- 卡片内 padding：`32rpx`

---

## 6. 弹窗（Bottom Sheet）

```
背景：#FFFFFF（去除暖色半透明毛玻璃）
backdrop-filter：去除
圆角：40rpx 40rpx 0 0
手柄：rgba(0,0,0,0.15)，宽 64rpx，高 5rpx
```

---

## 7. 去除的视觉元素

- `--gradient-bg`（多层粉橙光晕背景）— 改为纯色 `#F7F7F8`
- `--gradient-brand`（橙色渐变按钮）— 改为纯黑 `#111111`
- 所有卡片 `box-shadow` — 改为 `border`
- 暖色 `backdrop-filter` 底栏背景 — 改为 `#FFFFFF` + 顶部细描边
- RouteCard 顶部彩色品牌条（`topStripe`）— 去除

---

## 8. 保留的元素

- 字体：PingFang SC（不变）
- 圆角 Pill 形状（按钮、标签、搜索框）
- 动画时长和缓动曲线（不变）
- 路线卡片地图缩略图区域（核心功能，保留）
- 大 Bold 数字展示数据（加强）
