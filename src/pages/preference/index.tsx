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
