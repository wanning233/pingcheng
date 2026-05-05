// src/pages/preference/components/ConflictResolutionScene.tsx
import { useState, useEffect, useRef } from 'react'
import { View, Text } from '@tarojs/components'
import styles from './ConflictResolutionScene.module.scss'
import ConflictCard from './ConflictCard'
import AssemblyAnimation from '../../../components/animation/AssemblyAnimation'
import { MockEngine, APP_CONFIG } from '../../../utils/mockEngine'
import { usePreferenceStore } from '../../../stores/usePreferenceStore'
import { MOCK_MEMBERS } from '../../../mock/preferenceQuestions'

type Phase =
  | 'idle'
  | 'analyzing'
  | 'conflict0' | 'resolving0'
  | 'conflict1' | 'resolving1'
  | 'conflict2' | 'resolving2'
  | 'summary'
  | 'complete'

// mock 其他3个成员的答案（固定，模拟冲突场景）
const MOCK_OTHER_ANSWERS: Record<string, Record<string, string>> = {
  chenyu:   { meetup_time: 'early', shop: 'no',       energy: 'high',   vibe: 'explore', taboo: 'none',     budget: 'under100' },
  wangmeng: { meetup_time: 'late',  shop: 'hardcore',  energy: 'high',   vibe: 'photo',   taboo: 'none',     budget: 'under200' },
  liting:   { meetup_time: 'normal',shop: 'browse',   energy: 'knee',   vibe: 'chill',   taboo: 'no_drink', budget: 'under150' },
}

type ConflictItem = { id: string; members: string[]; description: string; resolution: string }

// 根据当前用户答案动态生成冲突列表
function buildConflicts(myAnswers: Record<string, string>): ConflictItem[] {
  const conflicts: ConflictItem[] = []
  const myName = MOCK_MEMBERS[0].name // 林小夏

  // 集合时间冲突
  const myTime = myAnswers['meetup_time']
  if (myTime === 'early' && MOCK_OTHER_ANSWERS.wangmeng.meetup_time === 'late') {
    conflicts.push({
      id: 'meetup_time',
      members: [myName, '王萌'],
      description: `集合时间冲突：${myName}想一大早出发，王萌下午才开始`,
      resolution: '一大早和下午差了半天。折中方案：上午10点集合，早起的人可以提前热身，晚起的也不委屈。',
    })
  }

  // 购物意愿冲突
  const myShop = myAnswers['shop']
  if ((myShop === 'no' || myShop === 'browse') && MOCK_OTHER_ANSWERS.wangmeng.shop === 'hardcore') {
    conflicts.push({
      id: 'shop',
      members: ['王萌', '陈宇'],
      description: '逛街冲突：王萌血拼模式，陈宇不想逛',
      resolution: '行程里安排一个「自由时段」：王萌可以逛，陈宇去附近咖啡坐着等。不强迫，不落单。',
    })
  }

  // 体力冲突
  const myEnergy = myAnswers['energy']
  if (myEnergy !== 'knee' && MOCK_OTHER_ANSWERS.liting.energy === 'knee') {
    conflicts.push({
      id: 'energy',
      members: ['王萌', '李婷'],
      description: '体力冲突：王萌体力好，李婷膝盖不好',
      resolution: '规则只有一条：以最弱的那条腿为准。步行≤10分钟、全程有座。王萌不亏，李婷不累。',
    })
  }

  // 预算冲突
  const myBudget = myAnswers['budget']
  if (myBudget === 'under200' && MOCK_OTHER_ANSWERS.chenyu.budget === 'under100') {
    conflicts.push({
      id: 'budget',
      members: [myName, '陈宇'],
      description: `预算冲突：${myName}人均200，陈宇只有100`,
      resolution: '找人均¥110-120的区间——环境拿得出手，结账时没人皱眉头。这才叫「都赢」。',
    })
  }

  // 保底：如果没检测到冲突，用默认一个
  if (conflicts.length === 0) {
    conflicts.push({
      id: 'vibe',
      members: ['王萌', '李婷'],
      description: '氛围冲突：王萌想出片，李婷想放松躺平',
      resolution: '上午去网红打卡点拍照，下午找个安静的咖啡馆坐下来。一个行程，两种心情，都照顾到。',
    })
  }

  // 最多取3个
  return conflicts.slice(0, 3)
}

export default function ConflictResolutionScene() {
  const answers = usePreferenceStore(s => s.answers)
  const conflicts = buildConflicts(answers)

  const [phase, setPhase] = useState<Phase>('idle')
  const [visibleCards, setVisibleCards] = useState<boolean[]>(() => Array(conflicts.length).fill(false))
  const [collidingCards, setCollidingCards] = useState<boolean[]>(() => Array(conflicts.length).fill(false))
  const [resolvedCards, setResolvedCards] = useState<boolean[]>(() => Array(conflicts.length).fill(false))
  const [showResolutionText, setShowResolutionText] = useState<boolean[]>(() => Array(conflicts.length).fill(false))
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
        {conflicts.map((conflict, idx) => (
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
        <Text className={styles.summaryTitle}>{conflicts.length}个冲突已全部化解</Text>
        {conflicts.map((c) => (
          <View key={c.id} className={styles.summaryItem}>
            <Text className={styles.summaryCheck}>✓</Text>
            <Text className={styles.summaryText}>{c.description}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}
