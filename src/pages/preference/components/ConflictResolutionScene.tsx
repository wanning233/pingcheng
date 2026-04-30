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
