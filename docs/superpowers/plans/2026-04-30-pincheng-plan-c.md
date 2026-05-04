# 拼程小程序 Plan C：首页 + 偏好收集页 + 集结动效

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现首页（品牌输入+快捷标签+Picker）、偏好收集答题流程、三重冲突协商9秒动效、集结完成1650ms仪式动效。

**Architecture:** 首页和偏好页均在主包。所有动效用CSS keyframes + Canvas 2D（不用Lottie）。MockEngine控制协商动效速度（MOCK_SPEED=0.3时3倍加速）。

**Tech Stack:** Taro 3.6.x, React 18, TypeScript, CSS keyframes, Canvas 2D API

---

## 总览

| Task | 内容 | 文件数 |
|------|------|--------|
| Task 1 | Mock数据：偏好题目 + 成员列表 | 1 |
| Task 2 | 首页（Home）布局 + 焦点动效 | 2 |
| Task 3 | 偏好收集页基础布局 | 2 |
| Task 4 | AvatarRow + QuestionCard + ConflictBar 子组件 | 6 |
| Task 5 | ConflictResolutionScene + ConflictCard（9秒动效）| 4 |
| Task 6 | AssemblyAnimation 1650ms 集结仪式动效 | 2 |

**依赖关系：** Task 1 → Task 2、3、4、5、6；Task 4 → Task 3；Task 5 → Task 4；Task 6 → Task 5

---

## Task 1：Mock 数据文件

**文件列表：**
- `src/mock/preferenceQuestions.ts`


**步骤：**
- [ ] 1.1 创建 `src/mock/preferenceQuestions.ts`，定义 `PreferenceQuestion` 接口和 `PREFERENCE_QUESTIONS` 数组（4题：口味/预算/体力/今天想要），以及 `MOCK_MEMBERS` 数组（4人）

**完整代码：**

```typescript
// src/mock/preferenceQuestions.ts
export interface PreferenceQuestion {
  id: string
  question: string
  options: { id: string; label: string; emoji: string }[]
}

export const PREFERENCE_QUESTIONS: PreferenceQuestion[] = [
  {
    id: 'taste',
    question: '口味偏好？',
    options: [
      { id: 'spicy',    label: '必须辣',   emoji: '🌶️' },
      { id: 'mild',     label: '微辣可以', emoji: '😊' },
      { id: 'no_spicy', label: '不吃辣',   emoji: '🚫' },
      { id: 'any',      label: '都行',     emoji: '✌️' },
    ],
  },
  {
    id: 'budget',
    question: '人均预算？',
    options: [
      { id: 'under100', label: '100以内', emoji: '💰' },
      { id: 'under150', label: '150以内', emoji: '💳' },
      { id: 'under200', label: '200以内', emoji: '💎' },
      { id: 'any',      label: '不限制',  emoji: '🤑' },
    ],
  },
  {
    id: 'energy',
    question: '体力状态？',
    options: [
      { id: 'high',   label: '体力充沛',   emoji: '⚡' },
      { id: 'medium', label: '一般般',     emoji: '🚶' },
      { id: 'low',    label: '能少走就少走', emoji: '🪑' },
      { id: 'knee',   label: '膝盖不好',   emoji: '🦵' },
    ],
  },
  {
    id: 'vibe',
    question: '今天想要？',
    options: [
      { id: 'photo',   label: '出片出片',   emoji: '📸' },
      { id: 'eat',     label: '吃吃吃',     emoji: '🍜' },
      { id: 'chill',   label: '放松躺平',   emoji: '☁️' },
      { id: 'explore', label: '探索新地方', emoji: '🗺️' },
    ],
  },
]

export const MOCK_MEMBERS = [
  { id: 'linxiaxia', name: '林小夏', avatar: '' },
  { id: 'chenyu',    name: '陈宇',   avatar: '' },
  { id: 'wangmeng',  name: '王萌',   avatar: '' },
  { id: 'liting',    name: '李婷',   avatar: '' },
]
```

**验证命令：**
```bash
npx tsc --noEmit
```

**git commit 命令：**
```bash
git add src/mock/preferenceQuestions.ts
git commit -m "feat(mock): add preference questions and members mock data"
```

---

## Task 2：首页（Home Page）

**文件列表：**
- `src/pages/home/index.tsx`
- `src/pages/home/index.module.scss`

**步骤：**
- [ ] 2.1 创建 `src/pages/home/index.tsx`：品牌区、输入卡片（焦点边框动效）、快捷标签横滚、品类行、三个Picker、双按钮区
- [ ] 2.2 创建 `src/pages/home/index.module.scss`：深色主题，inputCardFocused 橙色描边 280ms，tagActive 主色底色，btn 彩色阴影

**完整代码（index.tsx）：**

```tsx
// src/pages/home/index.tsx
import { useState } from 'react'
import Taro from '@tarojs/taro'
import { View, Text, Input, ScrollView, Picker } from '@tarojs/components'
import styles from './index.module.scss'
import { useSessionStore } from '../../stores/useSessionStore'

const QUICK_TAGS = ['聚会', '约会', '亲子', '省钱', '少排队']
const QUICK_CATEGORIES = ['火锅', '奶茶', '拍照', '甜品']
const PERSON_OPTIONS = ['2人', '3人', '4人', '5人', '6人']
const PERSON_COUNTS = [2, 3, 4, 5, 6]
const BUDGET_OPTIONS = ['50以内', '100以内', '150以内', '200以内', '不限']
const BUDGET_VALUES = [50, 100, 150, 200, 999]
const ENDTIME_OPTIONS = ['18:00', '19:00', '20:00', '21:00', '22:00', '23:00']

export default function HomePage() {
  const { area, setSession } = useSessionStore()
  const [focused, setFocused] = useState(false)
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [personIdx, setPersonIdx] = useState(2)   // 默认4人
  const [budgetIdx, setBudgetIdx] = useState(2)   // 默认150以内
  const [endTimeIdx, setEndTimeIdx] = useState(3) // 默认21:00

  const handlePlan = () => {
    if (!area.trim()) {
      Taro.showToast({ title: '请输入目的地或活动', icon: 'none' })
      return
    }
    setSession({
      peopleCount: PERSON_COUNTS[personIdx],
      budgetPerPerson: BUDGET_VALUES[budgetIdx],
      endTime: ENDTIME_OPTIONS[endTimeIdx],
    })
    Taro.navigateTo({ url: '/pages/preference/index' })
  }

  const handleInvite = () => {
    Taro.navigateTo({ url: '/pages/invite/landing/index' })
  }

  return (
    <View className={styles.page}>
      {/* 品牌区 */}
      <View className={styles.brandArea}>
        <Text className={styles.brandName}>拼程</Text>
        <Text className={styles.slogan}>拼着玩，一起出发</Text>
      </View>

      {/* 核心输入卡片 */}
      <View className={`${styles.inputCard} ${focused ? styles.inputCardFocused : ''}`}>
        <Input
          className={styles.input}
          placeholder="想去哪儿？一句话告诉我"
          placeholderClass={styles.inputPlaceholder}
          value={area}
          onInput={e => setSession({ area: e.detail.value })}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      </View>

      {/* 快捷场景标签 */}
      <ScrollView scrollX className={styles.tagScroll} enableFlex>
        {QUICK_TAGS.map(tag => (
          <View
            key={tag}
            className={`${styles.tag} ${activeTag === tag ? styles.tagActive : ''}`}
            onClick={() => setActiveTag(activeTag === tag ? null : tag)}
          >
            {tag}
          </View>
        ))}
      </ScrollView>

      {/* 快捷品类行 */}
      <View className={styles.categoryRow}>
        {QUICK_CATEGORIES.map(cat => (
          <View
            key={cat}
            className={`${styles.categoryItem} ${activeCategory === cat ? styles.categoryItemActive : ''}`}
            onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
          >
            {cat}
          </View>
        ))}
      </View>

      {/* 三个 Picker */}
      <View className={styles.pickerRow}>
        <Picker
          mode="selector"
          range={PERSON_OPTIONS}
          value={personIdx}
          onChange={e => setPersonIdx(Number(e.detail.value))}
        >
          <View className={styles.pickerItem}>
            <Text className={styles.pickerLabel}>人数</Text>
            <Text className={styles.pickerValue}>{PERSON_OPTIONS[personIdx]}</Text>
          </View>
        </Picker>

        <Picker
          mode="selector"
          range={BUDGET_OPTIONS}
          value={budgetIdx}
          onChange={e => setBudgetIdx(Number(e.detail.value))}
        >
          <View className={styles.pickerItem}>
            <Text className={styles.pickerLabel}>人均</Text>
            <Text className={styles.pickerValue}>{BUDGET_OPTIONS[budgetIdx]}</Text>
          </View>
        </Picker>

        <Picker
          mode="selector"
          range={ENDTIME_OPTIONS}
          value={endTimeIdx}
          onChange={e => setEndTimeIdx(Number(e.detail.value))}
        >
          <View className={styles.pickerItem}>
            <Text className={styles.pickerLabel}>结束</Text>
            <Text className={styles.pickerValue}>{ENDTIME_OPTIONS[endTimeIdx]}</Text>
          </View>
        </Picker>
      </View>

      {/* 按钮区：主按钮全宽，次按钮在下方居中小字 */}
      <View className={styles.btnArea}>
        <View className={styles.primaryBtn} onClick={handlePlan}>立即规划</View>
        <View className={styles.secondaryBtn} onClick={handleInvite}>邀请朋友一起填偏好</View>
      </View>
    </View>
  )
}
```

**完整代码（index.module.scss）：**

```scss
// src/pages/home/index.module.scss
.page {
  min-height: 100vh;
  background: var(--color-bg-base);
  padding: 0 20px 40px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

// 品牌区
.brandArea {
  padding-top: 80px;
  padding-bottom: 40px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.brandName {
  font-size: 56rpx;
  font-weight: 700;
  line-height: 1.2;
  background: var(--gradient-brand);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.slogan {
  margin-top: 8px;
  font-size: 28rpx;
  color: var(--color-text-secondary);
}

// 输入卡片
.inputCard {
  background: var(--color-bg-card);
  border-radius: 20px;
  padding: 20px 16px;
  border: 1.5px solid transparent;
  transition: border-color 280ms ease, box-shadow 280ms ease;
  margin-bottom: 20px;
}

.inputCardFocused {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(255, 92, 43, 0.12);
}

.input {
  font-size: 28rpx;
  color: var(--color-text-primary);
  width: 100%;
}

.inputPlaceholder {
  color: var(--color-text-disabled);
  font-size: 28rpx;
}

// 快捷标签横向滚动
.tagScroll {
  white-space: nowrap;
  margin-bottom: 16px;
  display: flex;
  flex-direction: row;
}

.tag {
  display: inline-block;
  padding: 8px 16px;
  border-radius: 8px;
  background: var(--color-bg-card);
  color: var(--color-text-secondary);
  font-size: 20rpx;
  font-weight: 500;
  margin-right: 8px;
  transition: background 200ms ease, color 200ms ease;
  flex-shrink: 0;
}

.tagActive {
  background: var(--color-primary);
  color: #fff;
}

// 快捷品类行
.categoryRow {
  display: flex;
  flex-direction: row;
  gap: 12px;
  margin-bottom: 24px;
}

.categoryItem {
  flex: 1;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-card);
  border-radius: 12px;
  font-size: 24rpx;
  color: var(--color-text-secondary);
  border: 1.5px solid transparent;
  transition: border-color 200ms ease, color 200ms ease;
}

.categoryItemActive {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

// 三个 Picker
.pickerRow {
  display: flex;
  flex-direction: row;
  gap: 12px;
  margin-bottom: 32px;
}

.pickerItem {
  flex: 1;
  background: var(--color-bg-card);
  border-radius: 12px;
  padding: 12px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.pickerLabel {
  font-size: 20rpx;
  color: var(--color-text-disabled);
}

.pickerValue {
  font-size: 28rpx;
  color: var(--color-text-primary);
  font-weight: 600;
}

// 按钮区
.btnArea {
  margin-top: auto;
  display: flex;
  flex-direction: column;
}

.primaryBtn {
  width: 100%;
  height: 56px;
  border-radius: 14px;
  background: var(--gradient-brand);
  box-shadow: var(--shadow-btn-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  font-weight: 600;
  color: #fff;
  letter-spacing: 1px;
}

.secondaryBtn {
  margin-top: 12px;
  text-align: center;
  color: var(--color-text-secondary);
  font-size: 24rpx;
  padding: 8px 0;
}
```

**验证命令：**
```bash
npx tsc --noEmit
```

**git commit 命令：**
```bash
git add src/pages/home/index.tsx src/pages/home/index.module.scss
git commit -m "feat(home): add home page with brand input, tags, pickers and dual buttons"
```

---

## Task 3：偏好收集页基础布局

**文件列表：**
- `src/pages/preference/index.tsx`
- `src/pages/preference/index.module.scss`

**步骤：**
- [ ] 3.1 创建 `src/pages/preference/index.tsx`：进度条、AvatarRow、进度点（可点击回退）、QuestionCard、ConflictBar；答题完成后先显示 ConflictBar 1.5秒再切换到 ConflictResolutionScene
- [ ] 3.2 创建 `src/pages/preference/index.module.scss`：3px 渐变进度条、进度点激活/完成态、cardArea flex 居中

**完整代码（index.tsx）：**

```tsx
// src/pages/preference/index.tsx
import { useState, useCallback } from 'react'
import Taro from '@tarojs/taro'
import { View } from '@tarojs/components'
import styles from './index.module.scss'
import AvatarRow from './components/AvatarRow'
import QuestionCard from './components/QuestionCard'
import { PREFERENCE_QUESTIONS, MOCK_MEMBERS } from '../../mock/preferenceQuestions'
import ConflictBar from './components/ConflictBar'
import ConflictResolutionScene from './components/ConflictResolutionScene'

const CURRENT_USER_ID = 'linxiaxia'

export default function PreferencePage() {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0)
  const [membersDone] = useState<string[]>(['linxiaxia'])
  const [showConflict, setShowConflict] = useState(false)
  const [showResolution, setShowResolution] = useState(false)

  const currentQ = PREFERENCE_QUESTIONS[currentQuestionIdx]
  const selectedAnswer = answers[currentQ?.id] ?? null
  const progress = currentQuestionIdx / PREFERENCE_QUESTIONS.length

  const handleSelect = useCallback((optionId: string) => {
    if (!currentQ) return
    setAnswers(prev => ({ ...prev, [currentQ.id]: optionId }))
    // 自动前进（延迟200ms，让选中态可见）
    setTimeout(() => {
      if (currentQuestionIdx < PREFERENCE_QUESTIONS.length - 1) {
        setCurrentQuestionIdx(prev => prev + 1)
      } else {
        // 所有题目完成，触发冲突协商流程
        setShowConflict(true)
        setTimeout(() => {
          setShowConflict(false)
          setShowResolution(true)
        }, 1500)
      }
    }, 200)
  }, [currentQ, currentQuestionIdx])

  const handleProgressTap = (idx: number) => {
    if (idx <= currentQuestionIdx) {
      setCurrentQuestionIdx(idx)
    }
  }

  if (showResolution) {
    return <ConflictResolutionScene />
  }

  return (
    <View className={styles.page}>
      {/* 顶部进度条（position absolute top:0） */}
      <View className={styles.progressBarTrack}>
        <View
          className={styles.progressBarFill}
          style={{ width: `${progress * 100}%` }}
        />
      </View>

      {/* 头像行 */}
      <AvatarRow
        members={MOCK_MEMBERS.map(m => ({ ...m, done: membersDone.includes(m.id) }))}
        currentUserId={CURRENT_USER_ID}
      />

      {/* 进度点击区 */}
      <View className={styles.progressDots}>
        {PREFERENCE_QUESTIONS.map((_, idx) => (
          <View
            key={idx}
            className={[
              styles.dot,
              idx === currentQuestionIdx ? styles.dotActive : '',
              idx < currentQuestionIdx ? styles.dotDone : '',
            ].filter(Boolean).join(' ')}
            onClick={() => handleProgressTap(idx)}
          />
        ))}
      </View>

      {/* 答题卡 */}
      <View className={styles.cardArea}>
        {currentQ && (
          <QuestionCard
            question={currentQ}
            selected={selectedAnswer}
            onSelect={handleSelect}
          />
        )}
      </View>

      {/* 底部冲突预警条 */}
      <ConflictBar visible={showConflict} />
    </View>
  )
}
```

**完整代码（index.module.scss）：**

```scss
// src/pages/preference/index.module.scss
.page {
  min-height: 100vh;
  background: var(--color-bg-base);
  padding: 0 20px 40px;
  box-sizing: border-box;
  position: relative;
  display: flex;
  flex-direction: column;
}

// 顶部进度条
.progressBarTrack {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: rgba(255, 255, 255, 0.06);
}

.progressBarFill {
  height: 100%;
  background: var(--gradient-brand);
  transition: width 300ms ease;
  border-radius: 0 2px 2px 0;
}

// 进度点
.progressDots {
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 8px;
  padding: 8px 0 20px;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
  transition: background 200ms ease, transform 200ms ease;
}

.dotActive {
  background: var(--color-primary);
  transform: scale(1.4);
}

.dotDone {
  background: var(--color-success);
}

// 答题卡区域
.cardArea {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 8px 0;
}
```

**验证命令：**
```bash
npx tsc --noEmit
```

**git commit 命令：**
```bash
git add src/pages/preference/index.tsx src/pages/preference/index.module.scss
git commit -m "feat(preference): add preference page base layout with progress bar and question flow"
```

---

## Task 4：子组件 AvatarRow + QuestionCard + ConflictBar

**文件列表：**
- `src/pages/preference/components/AvatarRow.tsx`
- `src/pages/preference/components/AvatarRow.module.scss`
- `src/pages/preference/components/QuestionCard.tsx`
- `src/pages/preference/components/QuestionCard.module.scss`
- `src/pages/preference/components/ConflictBar.tsx`
- `src/pages/preference/components/ConflictBar.module.scss`

**步骤：**
- [ ] 4.1 创建 `AvatarRow.tsx`：40px 圆形头像，完成者外圈 SVG 绿色圆弧（500ms stroke-dasharray 动画），自身头像橙色边框
- [ ] 4.2 创建 `AvatarRow.module.scss`：avatarWrap position:relative，ringsvg position:absolute
- [ ] 4.3 创建 `QuestionCard.tsx`：大卡片（20px圆角），题目居中，选项 2列图文网格
- [ ] 4.4 创建 `QuestionCard.module.scss`：optionSelected 橙色边框 + 背景 + shadow-card-selected
- [ ] 4.5 创建 `ConflictBar.tsx`：固定底部，弹簧上弹（translateY 120%→0），黄色底色，visible prop 控制显隐
- [ ] 4.6 创建 `ConflictBar.module.scss`：position:fixed，cubic-bezier(0.34,1.56,0.64,1) 弹簧曲线，不用 display:none

**完整代码（AvatarRow.tsx）：**

```tsx
// src/pages/preference/components/AvatarRow.tsx
import { View, Text } from '@tarojs/components'
import styles from './AvatarRow.module.scss'

interface Member {
  id: string
  name: string
  avatar: string
  done?: boolean
}

interface AvatarRowProps {
  members: Member[]
  currentUserId: string
}

const AVATAR_SIZE = 40
const RING_SIZE = AVATAR_SIZE + 8  // 48px total with ring

export default function AvatarRow({ members, currentUserId }: AvatarRowProps) {
  return (
    <View className={styles.row}>
      {members.map((m) => (
        <View key={m.id} className={styles.memberItem}>
          <View className={styles.avatarWrap}>
            {/* SVG 绿色圆弧（完成者显示） */}
            {m.done && (
              <svg
                className={styles.ringsvg}
                width={RING_SIZE}
                height={RING_SIZE}
                viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
              >
                <circle
                  cx={RING_SIZE / 2}
                  cy={RING_SIZE / 2}
                  r={(RING_SIZE - 4) / 2}
                  fill="none"
                  stroke="#00C9A7"
                  strokeWidth="2"
                  strokeDasharray={`${Math.PI * (RING_SIZE - 4)} 0`}
                  strokeLinecap="round"
                  transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
                  style={{ transition: 'stroke-dasharray 500ms ease' }}
                />
              </svg>
            )}
            {/* 头像圆 */}
            <View
              className={[
                styles.avatar,
                m.id === currentUserId ? styles.avatarSelf : '',
                m.done ? styles.avatarDone : '',
              ].filter(Boolean).join(' ')}
            >
              <Text className={styles.avatarInitial}>
                {m.name.charAt(0)}
              </Text>
            </View>
          </View>
          <Text className={styles.name}>{m.name}</Text>
          {m.done && <Text className={styles.doneLabel}>已完成</Text>}
        </View>
      ))}
    </View>
  )
}
```

**完整代码（AvatarRow.module.scss）：**

```scss
// src/pages/preference/components/AvatarRow.module.scss
.row {
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 20px;
  padding: 16px 0 12px;
}

.memberItem {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.avatarWrap {
  position: relative;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ringsvg {
  position: absolute;
  top: 0;
  left: 0;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--color-bg-glass);
  border: 1.5px solid rgba(255, 255, 255, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 300ms ease;
}

.avatarSelf {
  border-color: var(--color-primary);
}

.avatarDone {
  border-color: transparent;
}

.avatarInitial {
  font-size: 28rpx;
  font-weight: 600;
  color: var(--color-text-primary);
}

.name {
  font-size: 20rpx;
  color: var(--color-text-secondary);
}

.doneLabel {
  font-size: 18rpx;
  color: var(--color-success);
}
```

**完整代码（QuestionCard.tsx）：**

```tsx
// src/pages/preference/components/QuestionCard.tsx
import { View, Text } from '@tarojs/components'
import styles from './QuestionCard.module.scss'
import { PreferenceQuestion } from '../../../mock/preferenceQuestions'

interface QuestionCardProps {
  question: PreferenceQuestion
  selected: string | null
  onSelect: (optionId: string) => void
}

export default function QuestionCard({ question, selected, onSelect }: QuestionCardProps) {
  return (
    <View className={styles.card}>
      <Text className={styles.questionText}>{question.question}</Text>
      <View className={styles.optionGrid}>
        {question.options.map(opt => (
          <View
            key={opt.id}
            className={`${styles.optionItem} ${selected === opt.id ? styles.optionSelected : ''}`}
            onClick={() => onSelect(opt.id)}
          >
            <Text className={styles.optionEmoji}>{opt.emoji}</Text>
            <Text className={styles.optionLabel}>{opt.label}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}
```

**完整代码（QuestionCard.module.scss）：**

```scss
// src/pages/preference/components/QuestionCard.module.scss
.card {
  background: var(--color-bg-card);
  border-radius: 20px;
  padding: 32px 20px;
  box-shadow: var(--shadow-card-default);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.questionText {
  font-size: 36rpx;
  font-weight: 600;
  color: var(--color-text-primary);
  text-align: center;
  line-height: 1.4;
}

.optionGrid {
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.optionItem {
  border: 1.5px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.03);
  transition: border-color 200ms ease, background 200ms ease, box-shadow 200ms ease;
}

.optionSelected {
  border-color: var(--color-primary);
  background: rgba(255, 92, 43, 0.08);
  box-shadow: var(--shadow-card-selected);
}

.optionEmoji {
  font-size: 40rpx;
  line-height: 1;
}

.optionLabel {
  font-size: 24rpx;
  color: var(--color-text-primary);
  font-weight: 500;
  text-align: center;
}
```

**完整代码（ConflictBar.tsx）：**

```tsx
// src/pages/preference/components/ConflictBar.tsx
import { View, Text } from '@tarojs/components'
import styles from './ConflictBar.module.scss'

interface ConflictBarProps {
  visible: boolean
  message?: string
}

export default function ConflictBar({
  visible,
  message = 'AI 发现偏好冲突，正在协商中...',
}: ConflictBarProps) {
  return (
    <View className={`${styles.conflictBar} ${visible ? styles.conflictBarVisible : ''}`}>
      <Text className={styles.icon}>⚡</Text>
      <Text className={styles.message}>{message}</Text>
    </View>
  )
}
```

**完整代码（ConflictBar.module.scss）：**

```scss
// src/pages/preference/components/ConflictBar.module.scss

// 关键：position:fixed + bottom，弹簧 translateY 动效
.conflictBar {
  position: fixed;
  bottom: 80px;
  left: 16px;
  right: 16px;
  background: rgba(255, 183, 0, 0.12);
  border: 1px solid rgba(255, 183, 0, 0.3);
  border-radius: 12px;
  padding: 12px 16px;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  // 初始态：在底部不可见
  transform: translateY(120%);
  transition: transform 400ms cubic-bezier(0.34, 1.56, 0.64, 1);
  // 不用 visibility/display 切换，用 translateY 控制可见性
}

.conflictBarVisible {
  transform: translateY(0);
}

.icon {
  font-size: 28rpx;
}

.message {
  font-size: 24rpx;
  color: var(--color-warning);
  flex: 1;
}
```

**验证命令：**
```bash
npx tsc --noEmit
```

**git commit 命令：**
```bash
git add src/pages/preference/components/
git commit -m "feat(preference): add AvatarRow, QuestionCard, ConflictBar sub-components"
```

---

## Task 5：ConflictResolutionScene + ConflictCard（9秒三重冲突协商动效）

**文件列表：**
- `src/pages/preference/components/ConflictResolutionScene.tsx`
- `src/pages/preference/components/ConflictResolutionScene.module.scss`
- `src/pages/preference/components/ConflictCard.tsx`
- `src/pages/preference/components/ConflictCard.module.scss`

**步骤：**
- [ ] 5.1 创建 `ConflictCard.tsx`：接收 visible/colliding/resolved/showResolution props；visible 触发 translateY 100%→0 滑入；colliding 触发 ±8px+rotate±3° 碰撞；resolved 触发 border-color warning→success + breathe 动画；showResolution 显示打字机文案（clip-path 从右到左展开）
- [ ] 5.2 创建 `ConflictCard.module.scss`：cardVisible 过渡、cardResolved breathe、typewriter clip-path keyframes
- [ ] 5.3 创建 `ConflictResolutionScene.tsx`：Phase 状态机（idle→analyzing→conflict0→resolving0→…→summary→complete）；使用 MockEngine 调度所有时间节点；showAssembly=true 时切换到 AssemblyAnimation
- [ ] 5.4 创建 `ConflictResolutionScene.module.scss`：cardsAreaSummary scale(0.85)+translateY(-20px)+opacity(0.3)；summaryView 从底部 translateY(60%→0) 推入

**时序表（MOCK_SPEED=1.0 正常速度）：**

| 时刻 | 事件 |
|------|------|
| 0ms | phase='analyzing'，顶部「AI 决策官正在分析…」 |
| 800ms | showConflict(0)：冲突#1 从底部滑入 |
| 1500ms | triggerCollision(0)：双方头像碰撞 600ms |
| 2500ms | showResolution(0)：边框变绿，打字机文案 |
| 3200ms | showConflict(1)：冲突#2 滑入 |
| 4000ms | triggerCollision(1)：冲突#2 碰撞 |
| 4800ms | showResolution(1)：冲突#2 解决 |
| 5800ms | showConflict(2)：冲突#3 滑入 |
| 6500ms | triggerCollision(2)：冲突#3 碰撞 |
| 7200ms | showResolution(2)：冲突#3 解决 |
| 8000ms | phase='summary'：三卡片收缩，汇总推入 |
| 8800ms | showAssembly=true → 切换到 AssemblyAnimation |

**完整代码（ConflictCard.tsx）：**

```tsx
// src/pages/preference/components/ConflictCard.tsx
import { View, Text } from '@tarojs/components'
import styles from './ConflictCard.module.scss'

interface ConflictCardProps {
  conflict: {
    id: string
    members: string[]
    description: string
    resolution: string
  }
  visible: boolean
  colliding: boolean
  resolved: boolean
  showResolution: boolean
}

export default function ConflictCard({
  conflict,
  visible,
  colliding,
  resolved,
  showResolution,
}: ConflictCardProps) {
  return (
    <View
      className={[
        styles.card,
        visible ? styles.cardVisible : '',
        resolved ? styles.cardResolved : '',
      ].filter(Boolean).join(' ')}
    >
      {/* 顶部标签 */}
      <View className={styles.tagRow}>
        <View className={`${styles.statusTag} ${resolved ? styles.statusTagResolved : ''}`}>
          <Text className={`${styles.statusTagText} ${resolved ? styles.statusTagTextResolved : ''}`}>
            {resolved ? '✓ 已解决' : '⚡ 冲突'}
          </Text>
        </View>
      </View>

      {/* 冲突描述 */}
      <Text className={styles.description}>{conflict.description}</Text>

      {/* 头像碰撞行 */}
      <View className={styles.avatarRow}>
        <View className={`${styles.avatarLeft} ${colliding ? styles.avatarLeftCollide : ''}`}>
          <Text className={styles.avatarName}>{conflict.members[0]}</Text>
        </View>
        <Text className={styles.vs}>VS</Text>
        <View className={`${styles.avatarRight} ${colliding ? styles.avatarRightCollide : ''}`}>
          <Text className={styles.avatarName}>{conflict.members[1]}</Text>
        </View>
      </View>

      {/* AI 解决方案（打字机效果，clip-path 裁切） */}
      {showResolution && (
        <View className={styles.resolutionArea}>
          <Text className={styles.aiLabel}>AI 决策官</Text>
          <Text className={`${styles.resolutionText} ${styles.typewriter}`}>
            {conflict.resolution}
          </Text>
        </View>
      )}
    </View>
  )
}
```

**完整代码（ConflictCard.module.scss）：**

```scss
// src/pages/preference/components/ConflictCard.module.scss

.card {
  background: var(--color-bg-card);
  border-radius: 16px;
  padding: 16px;
  border: 1.5px solid var(--color-warning);
  box-shadow: var(--shadow-card-default);
  margin-bottom: 12px;
  // 初始态：底部不可见
  transform: translateY(100%);
  opacity: 0;
  transition:
    transform 400ms cubic-bezier(0.34, 1.56, 0.64, 1),
    opacity 400ms ease,
    border-color 500ms ease;
}

.cardVisible {
  transform: translateY(0);
  opacity: 1;
}

// 冲突解决后 border 从 warning → success
.cardResolved {
  border-color: var(--color-success);
  // scale 呼吸：1→1.02→1，400ms
  animation: breathe 400ms ease forwards;
}

@keyframes breathe {
  0%   { transform: scale(1); }
  50%  { transform: scale(1.02); }
  100% { transform: scale(1); }
}

.tagRow {
  display: flex;
  flex-direction: row;
  margin-bottom: 8px;
}

.statusTag {
  padding: 4px 8px;
  border-radius: 6px;
  background: rgba(255, 183, 0, 0.15);
  transition: background 300ms ease;
}

.statusTagResolved {
  background: rgba(0, 201, 167, 0.15);
}

.statusTagText {
  font-size: 20rpx;
  font-weight: 500;
  color: var(--color-warning);
}

.statusTagTextResolved {
  color: var(--color-success);
}

.description {
  font-size: 28rpx;
  color: var(--color-text-primary);
  font-weight: 500;
  margin-bottom: 12px;
  line-height: 1.4;
}

// 头像碰撞行
.avatarRow {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.avatarLeft,
.avatarRight {
  flex: 1;
  background: var(--color-bg-glass);
  border-radius: 8px;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 200ms ease;
}

// 碰撞动效：左头像右移+旋转，右头像左移+旋转
.avatarLeftCollide {
  transform: translateX(8px) rotate(3deg);
}

.avatarRightCollide {
  transform: translateX(-8px) rotate(-3deg);
}

.avatarName {
  font-size: 24rpx;
  color: var(--color-text-primary);
  font-weight: 600;
}

.vs {
  font-size: 24rpx;
  color: var(--color-danger);
  font-weight: 700;
}

// AI 解决方案区域
.resolutionArea {
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  padding-top: 12px;
}

.aiLabel {
  font-size: 20rpx;
  color: var(--color-accent);
  font-weight: 500;
  margin-bottom: 6px;
  display: block;
}

// 打字机效果：clip-path 裁切从右侧展开
.resolutionText {
  font-size: 24rpx;
  color: var(--color-text-secondary);
  line-height: 1.6;
}

.typewriter {
  display: block;
  clip-path: inset(0 100% 0 0);
  animation: typewriter 800ms linear forwards;
}

@keyframes typewriter {
  from { clip-path: inset(0 100% 0 0); }
  to   { clip-path: inset(0 0% 0 0); }
}
```

**完整代码（ConflictResolutionScene.tsx）：**

```tsx
// src/pages/preference/components/ConflictResolutionScene.tsx
import { useState, useEffect, useRef } from 'react'
import { View, Text } from '@tarojs/components'
import styles from './ConflictResolutionScene.module.scss'
import ConflictCard from './ConflictCard'
import AssemblyAnimation from '../../../components/animation/AssemblyAnimation'
import { MockEngine, APP_CONFIG } from '../../../utils/mockEngine'

type Phase =
  | 'idle'
  | 'analyzing'
  | 'conflict0' | 'resolving0'
  | 'conflict1' | 'resolving1'
  | 'conflict2' | 'resolving2'
  | 'summary'
  | 'complete'

const CONFLICTS = [
  {
    id: 'taste',
    members: ['王萌', '李婷'],
    description: '口味冲突：王萌要辣，李婷不吃辣',
    resolution: '王萌非辣不欢，李婷碰辣绕道走——这对组合我见多了。解法不是妥协，是选鸳鸯锅。两人同桌吃饭，各自美丽。',
  },
  {
    id: 'budget',
    members: ['林小夏', '陈宇'],
    description: '预算冲突：夏夏人均150，陈宇只有100',
    resolution: '夏夏想要精致感，陈宇钱包有话说。找人均¥110-120的区间——环境拿得出手，结账时没人皱眉头。这才叫「都赢」。',
  },
  {
    id: 'energy',
    members: ['王萌', '李婷'],
    description: '体力冲突：王萌体力好，李婷膝盖不好',
    resolution: '规则只有一条：以最弱的那条腿为准。步行≤10分钟、全程有座。王萌不亏，李婷不累，这才是聪明的玩法。',
  },
]

export default function ConflictResolutionScene() {
  const [phase, setPhase] = useState<Phase>('idle')
  const [visibleCards, setVisibleCards] = useState<boolean[]>([false, false, false])
  const [collidingCards, setCollidingCards] = useState<boolean[]>([false, false, false])
  const [resolvedCards, setResolvedCards] = useState<boolean[]>([false, false, false])
  const [showResolutionText, setShowResolutionText] = useState<boolean[]>([false, false, false])
  const [showSummary, setShowSummary] = useState(false)
  const [showAssembly, setShowAssembly] = useState(false)
  const engineRef = useRef<MockEngine | null>(null)

  const showConflict = (idx: number) => {
    setVisibleCards(prev => { const n = [...prev]; n[idx] = true; return n })
  }

  const triggerCollision = (idx: number) => {
    setCollidingCards(prev => { const n = [...prev]; n[idx] = true; return n })
    // 600ms 后碰撞回位
    setTimeout(() => {
      setCollidingCards(prev => { const n = [...prev]; n[idx] = false; return n })
    }, 600)
  }

  const showResolution = (idx: number) => {
    setResolvedCards(prev => { const n = [...prev]; n[idx] = true; return n })
    // 延迟100ms后显示打字机文案（等border颜色先变）
    setTimeout(() => {
      setShowResolutionText(prev => { const n = [...prev]; n[idx] = true; return n })
    }, 100)
  }

  useEffect(() => {
    const engine = new MockEngine({ MOCK_SPEED: APP_CONFIG.MOCK_SPEED })
    engineRef.current = engine

    // 0ms: 进入分析状态
    setPhase('analyzing')

    // 800ms: 冲突#1 从底部滑入
    engine.schedule(() => showConflict(0), 800)

    // 1500ms: 双方头像碰撞
    engine.schedule(() => triggerCollision(0), 1500)

    // 2500ms: AI 介入，打字机文案 + 卡片变绿
    engine.schedule(() => showResolution(0), 2500)

    // 3200ms: 冲突#2 滑入
    engine.schedule(() => showConflict(1), 3200)

    // 4000ms: 冲突#2 碰撞
    engine.schedule(() => triggerCollision(1), 4000)

    // 4800ms: 冲突#2 解决
    engine.schedule(() => showResolution(1), 4800)

    // 5800ms: 冲突#3 滑入
    engine.schedule(() => showConflict(2), 5800)

    // 6500ms: 冲突#3 碰撞
    engine.schedule(() => triggerCollision(2), 6500)

    // 7200ms: 冲突#3 解决
    engine.schedule(() => showResolution(2), 7200)

    // 8000ms: 三卡片收缩 + 汇总视图推入
    engine.schedule(() => {
      setPhase('summary')
      setShowSummary(true)
    }, 8000)

    // 8800ms: 触发集结动效（完成4人集结）
    engine.schedule(() => {
      setShowAssembly(true)
    }, 8800)

    return () => { engine.destroy() }
  }, [])

  if (showAssembly) {
    return <AssemblyAnimation />
  }

  return (
    <View className={styles.scene}>
      {/* 顶部分析状态标题 */}
      <View className={styles.header}>
        <Text className={styles.headerTitle}>
          {phase === 'analyzing' || phase.startsWith('conflict') || phase.startsWith('resolving')
            ? 'AI 决策官正在分析…'
            : '协商完成'}
        </Text>
        <View className={styles.loadingDots}>
          <View className={styles.dot} />
          <View className={styles.dot} />
          <View className={styles.dot} />
        </View>
      </View>

      {/* 三张冲突卡片 */}
      <View
        className={`${styles.cardsArea} ${showSummary ? styles.cardsAreaSummary : ''}`}
      >
        {CONFLICTS.map((conflict, idx) => (
          <ConflictCard
            key={conflict.id}
            conflict={conflict}
            visible={visibleCards[idx]}
            colliding={collidingCards[idx]}
            resolved={resolvedCards[idx]}
            showResolution={showResolutionText[idx]}
          />
        ))}
      </View>

      {/* 汇总视图（三卡片收缩后从底部推入） */}
      <View className={`${styles.summaryView} ${showSummary ? styles.summaryViewVisible : ''}`}>
        <Text className={styles.summaryTitle}>3个冲突已全部化解</Text>
        {CONFLICTS.map((c) => (
          <View key={c.id} className={styles.summaryItem}>
            <Text className={styles.summaryCheck}>✓</Text>
            <Text className={styles.summaryText}>{c.description}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}
```

**完整代码（ConflictResolutionScene.module.scss）：**

```scss
// src/pages/preference/components/ConflictResolutionScene.module.scss

.scene {
  min-height: 100vh;
  background: var(--color-bg-base);
  padding: 60px 20px 40px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

.header {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.headerTitle {
  font-size: 32rpx;
  font-weight: 600;
  color: var(--color-text-primary);
}

// 三点律动 loading
.loadingDots {
  display: flex;
  flex-direction: row;
  gap: 4px;
  align-items: center;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-accent);
  animation: pulse 1.2s ease-in-out infinite;
}

.dot:nth-child(1) { animation-delay: 0ms; }
.dot:nth-child(2) { animation-delay: 200ms; }
.dot:nth-child(3) { animation-delay: 400ms; }

@keyframes pulse {
  0%, 100% { opacity: 0.3; transform: scale(0.8); }
  50%       { opacity: 1;   transform: scale(1.2); }
}

// 卡片区域
.cardsArea {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: visible;
  transition: transform 350ms ease, opacity 350ms ease;
}

// 汇总时三卡片收缩
.cardsAreaSummary {
  transform: scale(0.85) translateY(-20px);
  opacity: 0.3;
}

// 汇总视图 — 从底部推入
.summaryView {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--color-bg-card);
  border-radius: 28px 28px 0 0;
  padding: 32px 20px;
  transform: translateY(60%);
  transition: transform 500ms cubic-bezier(0.16, 1, 0.3, 1);
}

.summaryViewVisible {
  transform: translateY(0);
}

.summaryTitle {
  font-size: 36rpx;
  font-weight: 700;
  color: var(--color-text-primary);
  text-align: center;
  margin-bottom: 20px;
  display: block;
}

.summaryItem {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 12px;
}

.summaryCheck {
  font-size: 28rpx;
  color: var(--color-success);
  flex-shrink: 0;
}

.summaryText {
  font-size: 24rpx;
  color: var(--color-text-secondary);
  line-height: 1.5;
}
```

**验证命令：**
```bash
npx tsc --noEmit
```

**git commit 命令：**
```bash
git add src/pages/preference/components/ConflictCard.tsx \
        src/pages/preference/components/ConflictCard.module.scss \
        src/pages/preference/components/ConflictResolutionScene.tsx \
        src/pages/preference/components/ConflictResolutionScene.module.scss
git commit -m "feat(preference): add ConflictCard and ConflictResolutionScene with 9s negotiation animation"
```

---

## Task 6：AssemblyAnimation 集结仪式动效（1650ms）

**文件列表：**
- `src/components/animation/AssemblyAnimation.tsx`
- `src/components/animation/AssemblyAnimation.module.scss`

**步骤：**
- [ ] 6.1 创建 `AssemblyAnimation.tsx`：
  - 0ms：最后一人 avatarLocked（边框白→绿，scale 弹跳）
  - 200ms：setAvatarsConverging + Canvas 连接线（drawConnectionLines 用 createSelectorQuery 获取4个头像位置，6对连线 80ms stagger，linearGradient 橙→蓝）
  - 600ms：shockwaveActive（冲击波圆环 150ms 后自动消失）+ avatarsBouncing（400ms 后清除）
  - 750ms：titleVisible（「4人集结完成！」blur 8px→0 + translateY 12px→0）
  - 1050ms：subtitleVisible（副文字 clip-path 打字机展开）
  - 1650ms：pageExiting + 300ms 后 redirectTo route-compare
- [ ] 6.2 创建 `AssemblyAnimation.module.scss`：
  - scene position:fixed inset:0，sceneExiting scale(1.05)+opacity:0
  - canvas position:absolute，pointer-events:none
  - shockwave 冲击波 keyframe（scale 0→1.8，opacity 1→0，150ms）
  - avatarGrid 2x2 grid，avatarConverging 各自向中心微移
  - avatarLocked breathe keyframe，avatarBouncing keyframe
  - titleArea blur+translateY 过渡，subtitleText clip-path keyframe

**关键实现说明：**
- Canvas 连接线必须用 `Taro.createSelectorQuery()` 获取头像实际坐标，无法用纯 CSS 实现
- 连接线 6 对（4人两两组合），每对间隔 80ms
- `ctx.draw(true)` 的 `keepReserve=true` 参数保留上一帧的线，实现累积效果
- `animationend` 不可靠，一律用 `setTimeout` 兜底控制时序
- 所有时序通过 MockEngine 统一调度，支持 MOCK_SPEED=0.3 三倍速

**完整代码（AssemblyAnimation.tsx）：**

```tsx
// src/components/animation/AssemblyAnimation.tsx
import { useState, useEffect, useRef } from 'react'
import Taro from '@tarojs/taro'
import { View, Text, Canvas } from '@tarojs/components'
import styles from './AssemblyAnimation.module.scss'
import { MockEngine, APP_CONFIG } from '../../utils/mockEngine'

const MEMBERS = [
  { id: 'linxiaxia', name: '林小夏', initial: '林' },
  { id: 'chenyu',    name: '陈宇',   initial: '陈' },
  { id: 'wangmeng',  name: '王萌',   initial: '王' },
  { id: 'liting',    name: '李婷',   initial: '李' },
]

export default function AssemblyAnimation() {
  const [lastAvatarLocked, setLastAvatarLocked] = useState(false)
  const [avatarsConverging, setAvatarsConverging] = useState(false)
  const [shockwaveActive, setShockwaveActive] = useState(false)
  const [avatarsBouncing, setAvatarsBouncing] = useState(false)
  const [titleVisible, setTitleVisible] = useState(false)
  const [subtitleVisible, setSubtitleVisible] = useState(false)
  const [pageExiting, setPageExiting] = useState(false)
  const engineRef = useRef<MockEngine | null>(null)

  const drawConnectionLines = () => {
    const avatarIds = ['assembly-avatar-0', 'assembly-avatar-1', 'assembly-avatar-2', 'assembly-avatar-3']
    const positions: { x: number; y: number }[] = []
    let pendingCount = avatarIds.length

    avatarIds.forEach((id, index) => {
      Taro.createSelectorQuery()
        .select(`#${id}`)
        .boundingClientRect((rect: any) => {
          if (rect) {
            positions[index] = {
              x: rect.left + rect.width / 2,
              y: rect.top + rect.height / 2,
            }
          }
          pendingCount -= 1
          if (pendingCount === 0) {
            renderLines(positions)
          }
        })
        .exec()
    })
  }

  const renderLines = (positions: { x: number; y: number }[]) => {
    if (positions.length < 4) return
    const ctx = Taro.createCanvasContext('assembly-canvas')
    const pairs: [number, number][] = [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]]

    pairs.forEach(([i, j], pairIdx) => {
      setTimeout(() => {
        const pi = positions[i]
        const pj = positions[j]
        if (!pi || !pj) return

        const grad = ctx.createLinearGradient(pi.x, pi.y, pj.x, pj.y)
        grad.addColorStop(0, 'rgba(255,92,43,0.9)')
        grad.addColorStop(1, 'rgba(77,110,255,0.9)')
        ctx.setStrokeStyle(grad as any)
        ctx.setLineWidth(1.5)
        ctx.beginPath()
        ctx.moveTo(pi.x, pi.y)
        ctx.lineTo(pj.x, pj.y)
        ctx.stroke()
        ctx.draw(true)  // keepReserve=true 保留上一帧
      }, pairIdx * 80)
    })
  }

  useEffect(() => {
    const engine = new MockEngine({ MOCK_SPEED: APP_CONFIG.MOCK_SPEED })
    engineRef.current = engine

    // 0ms: 最后一人锁定 — 边框白→绿，scale 弹跳
    setLastAvatarLocked(true)

    // 200ms: 所有头像向中心微移 + Canvas 连接线
    engine.schedule(() => {
      setAvatarsConverging(true)
      drawConnectionLines()
    }, 200)

    // 600ms: 爆发帧 — 白色冲击波 + 头像弹跳
    engine.schedule(() => {
      setShockwaveActive(true)
      setAvatarsBouncing(true)
      // 150ms 后冲击波消失（用 setTimeout 兜底，不依赖 animationend）
      setTimeout(() => setShockwaveActive(false), 150)
      setTimeout(() => setAvatarsBouncing(false), 400)
    }, 600)

    // 750ms: "4人集结完成！"浮现
    engine.schedule(() => setTitleVisible(true), 750)

    // 1050ms: 副文字打字机
    engine.schedule(() => setSubtitleVisible(true), 1050)

    // 1650ms: 页面吸入 + 跳转
    engine.schedule(() => {
      setPageExiting(true)
      // 300ms 后跳转（等吸入动效完成）
      setTimeout(() => {
        Taro.redirectTo({ url: '/pages/route-compare/index' })
      }, 300)
    }, 1650)

    return () => { engine.destroy() }
  }, [])

  return (
    <View className={`${styles.scene} ${pageExiting ? styles.sceneExiting : ''}`}>
      {/* Canvas 连接线层（置于头像下方） */}
      <Canvas
        id="assembly-canvas"
        canvasId="assembly-canvas"
        className={styles.canvas}
      />

      {/* 冲击波圆环 */}
      {shockwaveActive && (
        <View className={styles.shockwave} />
      )}

      {/* 四个头像，2x2 网格排列 */}
      <View className={styles.avatarGrid}>
        {MEMBERS.map((member, idx) => (
          <View
            key={member.id}
            id={`assembly-avatar-${idx}`}
            className={[
              styles.avatarItem,
              idx === MEMBERS.length - 1 && lastAvatarLocked ? styles.avatarLocked : '',
              avatarsConverging ? styles.avatarConverging : '',
              avatarsBouncing ? styles.avatarBouncing : '',
            ].filter(Boolean).join(' ')}
          >
            <View className={styles.avatarCircle}>
              <Text className={styles.avatarInitial}>{member.initial}</Text>
            </View>
            <Text className={styles.avatarName}>{member.name}</Text>
          </View>
        ))}
      </View>

      {/* 标题：4人集结完成！ */}
      <View className={`${styles.titleArea} ${titleVisible ? styles.titleAreaVisible : ''}`}>
        <Text className={styles.titleText}>4人集结完成！</Text>
      </View>

      {/* 副文字打字机 */}
      <View className={`${styles.subtitleArea} ${subtitleVisible ? styles.subtitleAreaVisible : ''}`}>
        <Text className={styles.subtitleText}>
          上海五角场出发 · 4人成行 · 3条路线已生成
        </Text>
      </View>
    </View>
  )
}
```

**完整代码（AssemblyAnimation.module.scss）：**

```scss
// src/components/animation/AssemblyAnimation.module.scss

.scene {
  position: fixed;
  inset: 0;
  background: var(--color-bg-base);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 100;
  transition: transform 300ms ease, opacity 300ms ease;
}

// 1650ms 时页面吸入感
.sceneExiting {
  transform: scale(1.05);
  opacity: 0;
}

// Canvas 层 — 覆盖整个场景，pointer-events none
.canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

// 白色冲击波圆环
.shockwave {
  position: absolute;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: transparent;
  border: 3px solid rgba(255, 255, 255, 0.9);
  animation: shockwaveExpand 150ms ease-out forwards;
  pointer-events: none;
}

@keyframes shockwaveExpand {
  from {
    transform: scale(0);
    opacity: 1;
  }
  to {
    transform: scale(1.8);
    opacity: 0;
  }
}

// 头像网格 — 2x2
.avatarGrid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  margin-bottom: 48px;
  position: relative;
  z-index: 1;
}

.avatarItem {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  transition: transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

// 最后一人锁定：边框白→绿，scale 弹跳
.avatarLocked .avatarCircle {
  animation: avatarLock 600ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes avatarLock {
  0%   { border-color: rgba(255,255,255,0.3); transform: scale(1); }
  30%  { transform: scale(0.9); }
  60%  { transform: scale(1.1); border-color: var(--color-success); }
  100% { transform: scale(1.0); border-color: var(--color-success); }
}

// 汇聚时向中心微移 2-4px
.avatarConverging:nth-child(1) { transform: translate(2px, 2px); }
.avatarConverging:nth-child(2) { transform: translate(-2px, 2px); }
.avatarConverging:nth-child(3) { transform: translate(2px, -2px); }
.avatarConverging:nth-child(4) { transform: translate(-2px, -2px); }

// 爆发帧弹跳
.avatarBouncing {
  animation: avatarBounce 400ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes avatarBounce {
  0%   { transform: scale(1); }
  40%  { transform: scale(0.85); }
  100% { transform: scale(1.0); }
}

.avatarCircle {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--color-bg-card);
  border: 2px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatarInitial {
  font-size: 36rpx;
  font-weight: 700;
  color: var(--color-text-primary);
}

.avatarName {
  font-size: 22rpx;
  color: var(--color-text-secondary);
}

// 标题浮现：blur(8px)→0 + translateY(12px)→0
.titleArea {
  opacity: 0;
  filter: blur(8px);
  transform: translateY(12px);
  transition: opacity 300ms ease, filter 300ms ease, transform 300ms ease;
  margin-bottom: 16px;
}

.titleAreaVisible {
  opacity: 1;
  filter: blur(0);
  transform: translateY(0);
}

.titleText {
  font-size: 48rpx;
  font-weight: 700;
  color: var(--color-text-primary);
  text-align: center;
  letter-spacing: 2px;
}

// 副文字打字机：clip-path 展开
.subtitleArea {
  overflow: hidden;
}

.subtitleText {
  font-size: 26rpx;
  color: var(--color-text-secondary);
  text-align: center;
  display: block;
  clip-path: inset(0 100% 0 0);
}

.subtitleAreaVisible .subtitleText {
  animation: subtitleReveal 600ms linear forwards;
}

@keyframes subtitleReveal {
  from { clip-path: inset(0 100% 0 0); }
  to   { clip-path: inset(0 0% 0 0); }
}
```

**验证命令：**
```bash
npx tsc --noEmit
# 在微信开发者工具中验证动效时序：
# 1. 进入偏好收集页，全部选完四题
# 2. 冲突协商页：确认三张卡片按时序依次出现、碰撞、变绿
# 3. 汇总页推入后自动切换到集结动效
# 4. 集结动效：确认4头像连接线 Canvas 绘制、冲击波、标题浮现
# 5. 1650ms 后自动跳转路线对比页
```

**git commit 命令：**
```bash
git add src/components/animation/AssemblyAnimation.tsx \
        src/components/animation/AssemblyAnimation.module.scss
git commit -m "feat(animation): add AssemblyAnimation 1650ms ceremony with Canvas connection lines and shockwave"
```

---

## 技术注意事项

### 坑预警

| 坑 | 问题 | 本 Plan 的规避方式 |
|----|------|-------------------|
| `animationend` 不可靠 | 某些机型不触发，时序链断 | 所有时序用 `setTimeout` 兜底 |
| `display:none→block` 切换动效不触发 | ConflictBar 无法弹出 | ConflictBar 用 `translateY(120%→0)` 控制显隐，不改 display |
| 打字机效果性能 | 逐字 `setData` 在长文本时卡顿 | `clip-path: inset(0 X% 0 0)` CSS animation，单次 setState |
| Canvas 层级 | Canvas 被覆盖 | AssemblyAnimation Canvas 用 `position:absolute inset:0`，z-index 低于头像 |
| `createSelectorQuery` 时机 | 组件未挂载时查询返回 null | 在 `engine.schedule` 的 200ms 回调里调用，组件已挂载 |
| `ctx.draw(keepReserve)` | 每次调用不传 true 会清除之前的线 | 每对连线 `ctx.draw(true)` 保留累积效果 |

### MockEngine 使用规范

```typescript
// MOCK_SPEED=0.3 时所有延迟缩短到 30%（3倍速）
// APP_CONFIG 在 src/utils/mockEngine.ts 中统一配置
// ConflictResolutionScene 和 AssemblyAnimation 各自创建独立 engine 实例
// useEffect cleanup 中调用 engine.destroy() 清理所有定时器
```

### Store 接口

```typescript
// useSessionStore（src/stores/useSessionStore.ts）
interface SessionState {
  area: string          // 目的地文本
  city: string          // 默认 '上海'
  startTime: string
  endTime: string       // 默认 '21:00'
  budgetPerPerson: number  // 默认 120
  peopleCount: number      // 默认 4
  setSession: (patch: Partial<...>) => void
}
```

---

*Plan C 覆盖所有已实现文件，与 exec-plan-c 实际代码完全一致。*
