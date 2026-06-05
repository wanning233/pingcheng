// src/pages/ai-prompt-preview/index.tsx
import { useState, useEffect, useCallback } from 'react'
import Taro, { useLoad } from '@tarojs/taro'
import { View, Text, ScrollView, Textarea } from '@tarojs/components'
import { useSessionStore } from '../../stores/useSessionStore'
import { buildPromptFromAnswers } from '../../services/mock/questions'
import { getPreferenceQuestions } from '../../services/api'
import styles from './index.module.scss'

export default function AiPromptPreviewPage() {
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [tripId, setTripId] = useState('')

  useLoad(() => {
    const params = Taro.getCurrentInstance()?.router?.params ?? {}
    setTripId((params.tripId as string) ?? '')
  })

  useEffect(() => {
    setLoading(true)
    const session = useSessionStore.getState()
    getPreferenceQuestions()
      .then((questions) => {
        const answers = (session as any).aiAnswers ?? {}
        const customInputs = (session as any).aiCustomInputs ?? {}
        setPrompt(buildPromptFromAnswers(session, questions, answers, customInputs))
      })
      .catch((e) => console.error('[ai-prompt-preview] load questions error:', e))
      .finally(() => setLoading(false))
  }, [])

  const handleSubmit = useCallback(() => {
    if (submitting) return
    useSessionStore.getState().setSession({ aiPrompt: prompt } as any)
    setSubmitting(true)
    setTimeout(() => {
      if (tripId) {
        Taro.navigateTo({ url: `/pages/waiting-room/index?tripId=${tripId}` })
      } else {
        Taro.navigateTo({ url: '/pages/route-compare/index' })
      }
    }, 800)
  }, [prompt, submitting, tripId])

  return (
    <View className={styles.page}>
      {/* 进度条 */}
      <View className={styles.progressBar}>
        <View className={styles.progressStep}>
          <View className={`${styles.stepDot} ${styles.stepDotDone}`}>
            <Text className={`${styles.stepDotNum} ${styles.stepDotNumActive}`}>✓</Text>
          </View>
          <Text className={`${styles.stepLabel} ${styles.stepLabelDone}`}>了解偏好</Text>
        </View>
        <View className={`${styles.stepLine} ${styles.stepLineDone}`} />
        <View className={styles.progressStep}>
          <View className={`${styles.stepDot} ${styles.stepDotActive}`}>
            <Text className={`${styles.stepDotNum} ${styles.stepDotNumActive}`}>2</Text>
          </View>
          <Text className={`${styles.stepLabel} ${styles.stepLabelActive}`}>确认需求</Text>
        </View>
        <View className={`${styles.stepLine} ${styles.stepLineActive}`} />
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
            <Text className={styles.thinkingText}>AI正在整理你的需求...</Text>
          </View>
        ) : (
          <>
            <Text className={styles.sectionLabel}>AI已根据你的选择整理好需求描述，可直接修改后发送</Text>
            <View className={styles.promptCard}>
              <Textarea
                className={styles.promptTextarea}
                placeholderClass={styles.promptPlaceholder}
                value={prompt}
                onInput={e => setPrompt(e.detail.value)}
                autoHeight
                showConfirmBar={false}
              />
            </View>
            <Text className={styles.hint}>
              {tripId
                ? '修改后点击下方按钮，等伙伴们也填完后 AI 会生成路线'
                : '修改后点击下方按钮，AI将根据此描述生成专属路线'}
            </Text>
          </>
        )}
      </ScrollView>

      {!loading && (
        <View className={styles.footer}>
          <View
            className={`${styles.submitBtn} ${submitting ? styles.submitBtnLoading : ''}`}
            onClick={handleSubmit}
          >
            <Text className={styles.submitBtnText}>
              {submitting ? '提交中...' : tripId ? '确认发送，等待伙伴填写' : '确认发送，生成专属路线'}
            </Text>
          </View>
        </View>
      )}
    </View>
  )
}
