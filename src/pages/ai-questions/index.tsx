// src/pages/ai-questions/index.tsx
import { useState, useEffect, useCallback } from 'react'
import Taro, { useLoad } from '@tarojs/taro'
import { View, Text, ScrollView, Input } from '@tarojs/components'
import { useSessionStore } from '../../stores/useSessionStore'
import { Question } from '../../services/mock/questions'
import { getPreferenceQuestions, submitMemberPreferences } from '../../services/api'
import styles from './index.module.scss'

export default function AiQuestionsPage() {
  const area = useSessionStore(s => s.area)
  const setSession = useSessionStore(s => s.setSession)

  const [tripId, setTripId] = useState('')
  const [role, setRole] = useState<'initiator' | 'member'>('initiator')
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<string, string[]>>({})
  const [customInputs, setCustomInputs] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  useLoad(() => {
    const params = Taro.getCurrentInstance()?.router?.params ?? {}
    setTripId((params.tripId as string) ?? '')
    setRole((params.role as string) === 'member' ? 'member' : 'initiator')
  })

  useEffect(() => {
    setLoading(true)
    setLoadError(null)
    getPreferenceQuestions()
      .then((qs) => setQuestions(qs))
      .catch((e) => {
        const msg = typeof e === 'object' ? JSON.stringify(e) : String(e)
        console.error('[ai-questions] load questions error:', msg)
        setLoadError(msg)
      })
      .finally(() => setLoading(false))
  }, [])

  const toggleOption = useCallback((questionId: string, optionId: string, multi: boolean) => {
    setAnswers(prev => {
      const current = prev[questionId] ?? []
      if (multi) {
        return {
          ...prev,
          [questionId]: current.includes(optionId)
            ? current.filter(id => id !== optionId)
            : [...current, optionId],
        }
      }
      return { ...prev, [questionId]: [optionId] }
    })
  }, [])

  const handleNext = useCallback(async () => {
    if (submitting) return
    setSubmitting(true)
    setSession({ aiAnswers: answers, aiCustomInputs: customInputs } as any)
    if (tripId) {
      await submitMemberPreferences(tripId, answers, customInputs)
      Taro.navigateTo({ url: `/pages/ai-prompt-preview/index?tripId=${tripId}&role=${role}` })
    } else {
      Taro.navigateTo({ url: '/pages/ai-prompt-preview/index' })
    }
  }, [answers, customInputs, setSession, tripId, role, submitting])

  const isMulti = !!tripId

  return (
    <View className={styles.page}>
      {/* 进度条 */}
      <View className={styles.progressBar}>
        <View className={styles.progressStep}>
          <View className={`${styles.stepDot} ${styles.stepDotActive}`}>
            <Text className={`${styles.stepDotNum} ${styles.stepDotNumActive}`}>1</Text>
          </View>
          <Text className={`${styles.stepLabel} ${styles.stepLabelActive}`}>了解偏好</Text>
        </View>
        <View className={`${styles.stepLine} ${styles.stepLineActive}`} />
        <View className={styles.progressStep}>
          <View className={styles.stepDot}>
            <Text className={styles.stepDotNum}>2</Text>
          </View>
          <Text className={styles.stepLabel}>确认需求</Text>
        </View>
        <View className={styles.stepLine} />
        <View className={styles.progressStep}>
          <View className={styles.stepDot}>
            <Text className={styles.stepDotNum}>3</Text>
          </View>
          <Text className={styles.stepLabel}>生成路线</Text>
        </View>
      </View>

      <ScrollView scrollY className={styles.scroll}>
        {loading ? (
          <View className={styles.thinkingWrap}>
            <View className={styles.thinkingDots}>
              <View className={styles.dot} />
              <View className={styles.dot2} />
              <View className={styles.dot3} />
            </View>
            <Text className={styles.thinkingText}>
              AI正在分析{area ? `"${area}"` : '目的地'}的特色...
            </Text>
          </View>
        ) : loadError ? (
          <View style={{ padding: '40rpx', background: '#FFF3F3', borderRadius: '16rpx', margin: '32rpx 0' }}>
            <Text style={{ fontSize: '24rpx', color: '#CC0000', wordBreak: 'break-all' }}>
              加载失败：{loadError}
            </Text>
          </View>
        ) : (
          <>
            <Text className={styles.intro}>
              {isMulti && role === 'member'
                ? '填写你的出行偏好，AI 会帮大家协调出最合适的路线。'
                : isMulti
                ? '先填你自己的偏好，朋友加入后 AI 会合并大家的需求。'
                : '根据你的目的地，AI提了几个小问题，帮你规划更贴心的路线。全部可跳过。'}
            </Text>

            {questions.map(q => {
              const selected = answers[q.id] ?? []
              return (
                <View key={q.id} className={styles.questionBlock}>
                  <Text className={styles.questionText}>{q.text}</Text>
                  <View className={styles.optionList}>
                    {q.options.map(opt => {
                      const active = selected.includes(opt.id)
                      return (
                        <View
                          key={opt.id}
                          className={`${styles.option} ${active ? styles.optionActive : ''}`}
                          onClick={() => toggleOption(q.id, opt.id, q.multi)}
                        >
                          <Text className={`${styles.optionLabel} ${active ? styles.optionLabelActive : ''}`}>
                            {opt.label}
                          </Text>
                          <View className={`${styles.optionCheck} ${active ? styles.optionCheckActive : ''}`}>
                            {active && <View className={styles.optionCheckDot} />}
                          </View>
                        </View>
                      )
                    })}
                  </View>
                  <View className={styles.customRow}>
                    <Input
                      className={styles.customInput}
                      placeholderClass={styles.customPlaceholder}
                      placeholder="手动补充需求..."
                      value={customInputs[q.id] ?? ''}
                      onInput={e => setCustomInputs(prev => ({ ...prev, [q.id]: e.detail.value }))}
                    />
                    <Text className={styles.customAddBtn}>+ 添加</Text>
                  </View>
                </View>
              )
            })}
          </>
        )}
      </ScrollView>

      {!loading && (
        <View className={styles.footer}>
          <View
            className={`${styles.submitBtn} ${submitting ? styles.submitBtnLoading : ''}`}
            onClick={!submitting ? handleNext : undefined}
          >
            <Text className={styles.submitBtnText}>
              {submitting ? '提交中...' : '下一步，确认需求描述'}
            </Text>
          </View>
        </View>
      )}
    </View>
  )
}
