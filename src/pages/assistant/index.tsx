// src/pages/assistant/index.tsx
import { View, Text, ScrollView, Input } from '@tarojs/components'
import Taro, { useLoad, useUnload, useRouter } from '@tarojs/taro'
import React, { useState, useRef, useCallback } from 'react'
import cx from 'classnames'
import ChatBubble from '@/components/business/ChatBubble'
import ThinkingIndicator from '@/components/business/ThinkingIndicator'
import RouteDiffCard from '@/components/business/RouteDiffCard'
import Icon from '@/components/base/Icon'
import { demoEngine } from '@/utils/mockEngine'
import { useTripStore } from '@/stores/useTripStore'
import { useRouteStore } from '@/stores/useRouteStore'
import { replanTrip, selectTripRoute, ReplanResult } from '@/services/api'
import styles from './index.module.scss'

interface Message {
  id: string
  role: 'user' | 'ai'
  content: string
  isStreaming?: boolean
}

const DEFAULT_QUICK_REPLIES = ['排队多久？', '换一家', '修改预算', '提前结束']

const INITIAL_GREETING =
  '你好！我是你的途中助手。当前是网红鸳鸯锅，预计排队58分钟。需要我帮你查一下附近有没有更好的选择吗？'

function getStopGreeting(stopName: string): string {
  return `你对「${stopName}」不满意？告诉我原因，我来帮你找替代方案，或者重新规划后面的行程。`
}

function getStopQuickReplies(stopName: string): string[] {
  return [`换掉「${stopName}」`, '找附近替代', '调整后续行程', '修改预算']
}

const QUEUE_REPLY =
  '刚查了一下，网红鸳鸯锅目前排队大概58分钟，排了37桌。我发现了一个不错的替代方案，你看一下——'

const ACCEPTED_REPLY = '好的！已为你们切换到弄堂里的湖南菜，步行6分钟可以到，预计20:48结束，比截止时间早12分钟，完全没问题！'

const DECLINED_REPLY =
  '好的，继续原路线。不过要注意，预计会在21:15结束，超出截止时间15分钟，后续行程可能受影响。'

let msgCounter = 0
const nextId = () => `msg-${++msgCounter}`

export default function AssistantPage() {
  const router = useRouter()
  const stopName = router.params?.stopName ? decodeURIComponent(router.params.stopName) : ''
  const routeId = (router.params?.routeId as string) || ''
  const tripId = (router.params?.tripId as string) || ''

  const [messages, setMessages] = useState<Message[]>([])
  const [thinking, setThinking] = useState(false)
  const [diffVisible, setDiffVisible] = useState(false)
  const [showViewRoute, setShowViewRoute] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [quickReplies, setQuickReplies] = useState<string[]>(
    stopName ? getStopQuickReplies(stopName) : DEFAULT_QUICK_REPLIES
  )
  const [pendingReplan, setPendingReplan] = useState<ReplanResult | null>(null)
  const currentStopIndex = useTripStore((s) => s.currentStopIndex)
  const swapStopInStore = useRouteStore((s) => s.swapStop)
  const modifiedStops = useRouteStore((s) => s.modifiedStops)
  const setRoutes = useRouteStore((s) => s.setRoutes)
  const storedRoutes = useRouteStore((s) => s.routes)
  const scrollTopRef = useRef(9999999)

  const addMessage = useCallback((msg: Message) => {
    setMessages((prev) => [...prev, msg])
  }, [])

  useLoad(() => {
    const greeting = stopName ? getStopGreeting(stopName) : INITIAL_GREETING
    // 400ms after load, AI sends greeting (streaming)
    demoEngine.schedule(() => {
      addMessage({
        id: nextId(),
        role: 'ai',
        content: greeting,
        isStreaming: true,
      })
    }, 400)
  })

  useUnload(() => {
    demoEngine.destroy()
  })

  const handleSend = useCallback(
    async (text: string) => {
      const trimmed = text.trim()
      if (!trimmed) return
      setInputValue('')

      // Add user message
      addMessage({ id: nextId(), role: 'user', content: trimmed })

      const lower = trimmed
      const isQueueOrSwap = lower.includes('排队') || lower.includes('换') || lower.includes('替代') || lower.includes('调整')

      if (isQueueOrSwap) {
        setThinking(true)

        if (tripId && routeId) {
          // Call real replan API
          try {
            const result = await replanTrip(tripId, {
              current_route_id: routeId,
              text: trimmed,
              location: { lat: 31.3046, lng: 121.5146 },
            })
            setThinking(false)
            setPendingReplan(result)
            const replyContent = result.diff?.summary
              ? result.diff.summary
              : stopName
              ? `好的，我来帮你替换「${stopName}」。我找到了一个很适合的替代方案，你们看一下——`
              : QUEUE_REPLY
            addMessage({ id: nextId(), role: 'ai', content: replyContent, isStreaming: true })
            demoEngine.schedule(() => {
              setDiffVisible(true)
              setQuickReplies(DEFAULT_QUICK_REPLIES)
            }, 400)
          } catch (_) {
            setThinking(false)
            addMessage({
              id: nextId(),
              role: 'ai',
              content: '抱歉，暂时无法获取替代方案，请稍后再试。',
              isStreaming: true,
            })
          }
        } else {
          // No tripId/routeId — fall back to demo
          demoEngine.schedule(() => {
            setThinking(false)
            const replyContent = stopName
              ? `好的，我来帮你替换「${stopName}」。我找到了一个很适合的替代方案，你们看一下——`
              : QUEUE_REPLY
            addMessage({ id: nextId(), role: 'ai', content: replyContent, isStreaming: true })
            demoEngine.schedule(() => {
              setDiffVisible(true)
              setQuickReplies(DEFAULT_QUICK_REPLIES)
            }, 400)
          }, 1200)
        }
      } else {
        // 兜底回复：用户说的话没匹配到关键词，给引导性回应
        setThinking(true)
        demoEngine.schedule(() => {
          setThinking(false)
          addMessage({
            id: nextId(),
            role: 'ai',
            content: '我没太明白你的意思，你是想换个地方，还是调整一下后面的行程安排？',
            isStreaming: true,
          })
        }, 800)
      }
    },
    [addMessage, tripId, routeId, stopName]
  )

  const handleQuickReply = useCallback(
    (reply: string) => {
      handleSend(reply)
    },
    [handleSend]
  )

  const handleAccept = useCallback(async () => {
    setDiffVisible(false)

    if (pendingReplan) {
      // Real replan: persist new route to store and select it
      const newRoutes = storedRoutes.map(r =>
        r.id === pendingReplan.newRouteId ? pendingReplan.newRoute : r,
      )
      if (!newRoutes.find(r => r.id === pendingReplan.newRouteId)) {
        newRoutes.push(pendingReplan.newRoute)
      }
      setRoutes(newRoutes)
      if (tripId) {
        try { await selectTripRoute(tripId, pendingReplan.newRouteId) } catch (_) {}
      }
      const toName = pendingReplan.diff?.replaced?.[0]?.to_name ?? '新地点'
      demoEngine.schedule(() => {
        addMessage({
          id: nextId(),
          role: 'ai',
          content: `好的！已为你们切换到「${toName}」，路线已更新！`,
          isStreaming: true,
        })
        setShowViewRoute(true)
      }, 300)
    } else {
      // Demo fallback: swap current stop in store
      if (currentStopIndex >= 0 && modifiedStops[currentStopIndex]) {
        swapStopInStore(currentStopIndex, {
          name: '弄堂里的湖南菜',
          tags: ['湖南菜'],
          estimatedQueueMinutes: 5,
        } as any)
      }
      demoEngine.schedule(() => {
        addMessage({
          id: nextId(),
          role: 'ai',
          content: ACCEPTED_REPLY,
          isStreaming: true,
        })
        setShowViewRoute(true)
      }, 300)
    }
  }, [addMessage, currentStopIndex, modifiedStops, swapStopInStore, pendingReplan, storedRoutes, setRoutes, tripId])

  const handleDecline = useCallback(() => {
    setDiffVisible(false)
    demoEngine.schedule(() => {
      addMessage({
        id: nextId(),
        role: 'ai',
        content: DECLINED_REPLY,
        isStreaming: true,
      })
    }, 300)
  }, [addMessage])

  return (
    <View className={styles.page}>
      {/* Top bar */}
      <View className={styles.topBar}>
        <Text className={styles.topTitle}>途中助手</Text>
        <View className={styles.tripPill}>
          <View className={styles.pillDot} />
          <Text className={styles.pillText}>行程进行中 第{currentStopIndex + 1}站</Text>
        </View>
      </View>

      {/* Message list */}
      <ScrollView
        scrollY
        className={styles.messageList}
        scrollTop={scrollTopRef.current}
        scrollWithAnimation
      >
        <View className={styles.messageInner}>
          {/* AI capability hint card */}
          <View className={styles.capabilityCard}>
            <Text className={styles.capabilityTitle}>我能帮你</Text>
            <View className={styles.capabilityList}>
              {[
                '查实时排队时间',
                '换一个更合适的地方',
                '调整后续行程安排',
                '修改预算或结束时间',
                '解答任何途中问题',
              ].map((item, index, arr) => (
                <View
                  key={item}
                  className={cx(styles.capabilityItem, index === arr.length - 1 && styles.capabilityItemLast)}
                >
                  <Text className={styles.capabilityText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>

          {messages.map((msg) => (
            <ChatBubble
              key={msg.id}
              role={msg.role}
              content={msg.content}
              isStreaming={msg.isStreaming}
            />
          ))}
          {thinking && <ThinkingIndicator />}
          {/* Route Diff Card inline in chat */}
          <RouteDiffCard
            visible={diffVisible}
            onAccept={handleAccept}
            onDecline={handleDecline}
            replanDiff={pendingReplan?.diff}
            newRouteName={pendingReplan?.diff?.replaced?.[0]?.to_name}
          />
          {/* 接受换站后：回到路线的入口 */}
          {showViewRoute && (
            <View
              className={styles.viewRouteBtn}
              onClick={() => {
                if (pendingReplan) {
                  Taro.redirectTo({
                    url: `/pages/route-detail/index?routeId=${pendingReplan.newRouteId}&tripId=${tripId}`,
                  })
                } else {
                  Taro.navigateBack()
                }
              }}
            >
              <Text className={styles.viewRouteBtnText}>查看更新后的路线 →</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Frosted glass input area */}
      <View className={styles.inputArea}>
        {/* Quick replies */}
        <ScrollView scrollX className={styles.quickScroll}>
          <View className={styles.quickRow}>
            {quickReplies.map((reply) => (
              <View
                key={reply}
                className={styles.quickChip}
                onClick={() => handleQuickReply(reply)}
              >
                <Text className={styles.quickText}>{reply}</Text>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Input row */}
        <View className={styles.inputRow}>
          <Input
            className={styles.input}
            value={inputValue}
            placeholder="问点什么..."
            placeholderStyle="color: #4A4A5E"
            onInput={(e) => setInputValue(e.detail.value)}
            onConfirm={() => handleSend(inputValue)}
          />
          <View
            className={styles.sendBtn}
            onClick={() => handleSend(inputValue)}
          >
            <Icon name="arrow-left" size={24} color="#fff" style={{ transform: 'rotate(90deg)' }} />
          </View>
        </View>
      </View>
    </View>
  )
}
