// src/pages/home/index.tsx
import { useState, useEffect, useCallback } from 'react'
import Taro from '@tarojs/taro'
import { View, Text, Input, ScrollView } from '@tarojs/components'
import cx from 'classnames'
import styles from './index.module.scss'
import { useSessionStore } from '../../stores/useSessionStore'
import { useRouteStore } from '../../stores/useRouteStore'
import { createTrip } from '../../services/api'
import Icon from '../../components/base/Icon'
import LoginSheet from '../../components/business/LoginSheet'
import { useUserStore } from '../../stores/useUserStore'

const PRESET_TAGS = ['朋友聚会', '情侣约会', '亲子出行', '少排队']

// 场景 → 推荐主题映射
const SCENE_THEMES: Record<string, { id: string; name: string; icon: string }[]> = {
  朋友聚会: [
    { id: 'food', name: '吃喝探店', icon: 'food' },
    { id: 'game', name: '沉浸娱乐', icon: 'game' },
    { id: 'nightlife', name: '夜生活', icon: 'nightlife' },
    { id: 'camera', name: '拍照出片', icon: 'camera' },
  ],
  情侣约会: [
    { id: 'cafe', name: '约会休闲', icon: 'cafe' },
    { id: 'culture', name: '文化打卡', icon: 'culture' },
    { id: 'camera', name: '拍照出片', icon: 'camera' },
    { id: 'park', name: '公园遛弯', icon: 'park' },
  ],
  亲子出行: [
    { id: 'family', name: '亲子出游', icon: 'family' },
    { id: 'park', name: '公园遛弯', icon: 'park' },
    { id: 'culture', name: '文化打卡', icon: 'culture' },
    { id: 'food', name: '吃喝探店', icon: 'food' },
  ],
  少排队: [
    { id: 'outdoor', name: '户外运动', icon: 'outdoor' },
    { id: 'park', name: '公园遛弯', icon: 'park' },
    { id: 'cafe', name: '约会休闲', icon: 'cafe' },
    { id: 'shopping', name: '逛街购物', icon: 'shopping' },
  ],
}

const PERSON_OPTIONS = ['1人', '2人', '3人', '4人', '5人', '6人']
const PERSON_COUNTS = [1, 2, 3, 4, 5, 6]
const STARTTIME_OPTIONS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00']
const ENDTIME_OPTIONS = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00']
const PLACEHOLDERS = [
  '五角场吃火锅，顺便拍照',
  '陆家嘴下午茶，再逛街',
  '南京路步行街，吃甜品',
  '豫园附近，老上海菜',
]

type SheetConfig = {
  title: string
  options: string[]
  current: number
  onSelect: (i: number) => void
}

export default function HomePage() {
  const area = useSessionStore(s => s.area)
  const notes = useSessionStore(s => s.notes)
  const inviteCode = useSessionStore(s => s.inviteCode)
  const setSession = useSessionStore(s => s.setSession)
  const selectedRouteId = useRouteStore(s => s.selectedRouteId)
  const isLoggedIn = useUserStore(s => s.isLoggedIn)
  const clearUser = useUserStore(s => s.clearUser)
  const [showLogin, setShowLogin] = useState(false)
  const [pendingAction, setPendingAction] = useState<'plan' | 'invite' | null>(null)
  const [pendingInviteCode, setPendingInviteCode] = useState<string | null>(null)
  const [focused, setFocused] = useState(false)
  const [activeTags, setActiveTags] = useState<string[]>([])
  const [customTags, setCustomTags] = useState<string[]>([])
  const [activeCategories, setActiveCategories] = useState<string[]>([])
  const [showTagInput, setShowTagInput] = useState(false)
  const [tagInputVal, setTagInputVal] = useState('')
  const [personIdx, setPersonIdx] = useState(0)
  const [budgetInput, setBudgetInput] = useState('')
  const [startTimeIdx, setStartTimeIdx] = useState(2)
  const [endTimeIdx, setEndTimeIdx] = useState(11)
  const [phIdx, setPhIdx] = useState(0)
  const [sheet, setSheet] = useState<SheetConfig | null>(null)
  const [showThemeSheet, setShowThemeSheet] = useState(false)
  const [themeSheetScene, setThemeSheetScene] = useState('')
  const [pendingThemes, setPendingThemes] = useState<string[]>([])
  const [planning, setPlanning] = useState(false)

  useEffect(() => {
    const t = setInterval(() => setPhIdx(i => (i + 1) % PLACEHOLDERS.length), 3000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (!pendingInviteCode) return
    const url = `/pages/invite/landing/index?inviteCode=${pendingInviteCode}`
    console.log('[home] effect navigateTo:', url)
    setPendingInviteCode(null)
    Taro.navigateTo({ url })
  }, [pendingInviteCode])

  const toggleTag = (tag: string) => {
    const isAdding = !activeTags.includes(tag)
    setActiveTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
    if (isAdding) {
      const themes = SCENE_THEMES[tag] ?? []
      setPendingThemes([])
      setThemeSheetScene(tag)
      setShowThemeSheet(true)
      setActiveCategories(prev => {
        const ids = themes.map(t => t.id)
        setPendingThemes(prev.filter(id => ids.includes(id)))
        return prev
      })
    }
  }

  const confirmCustomTag = () => {
    const val = tagInputVal.trim()
    if (!val) { setShowTagInput(false); return }
    if (!customTags.includes(val)) setCustomTags(prev => [...prev, val])
    setActiveTags(prev => prev.includes(val) ? prev : [...prev, val])
    setTagInputVal('')
    setShowTagInput(false)
  }

  const togglePendingTheme = (id: string) => {
    setPendingThemes(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    )
  }

  const confirmThemeSheet = () => {
    setActiveCategories(prev => {
      const currentSceneIds = (SCENE_THEMES[themeSheetScene] ?? []).map(t => t.id)
      const others = prev.filter(id => !currentSceneIds.includes(id))
      return [...others, ...pendingThemes]
    })
    setShowThemeSheet(false)
  }

  const openSheet = (config: SheetConfig) => setSheet(config)
  const closeSheet = () => setSheet(null)

  const handleJoinTrip = () => {
    console.log('[home] handleJoinTrip called')
    Taro.getClipboardData({
      success: (res) => {
        const text = res.data || ''
        console.log('[home] clipboard text:', text)
        const match = text.match(/邀请码[：:]\s*([A-Za-z0-9]+)/)
        console.log('[home] match:', match?.[1])
        if (match) {
          console.log('[home] setPendingInviteCode from clipboard:', match[1])
          setPendingInviteCode(match[1])
        } else {
          Taro.showModal({
            title: '加入行程',
            placeholderText: '请输入邀请码',
            editable: true,
            success: (r) => {
              const code = r.content?.trim()
              console.log('[home] modal code:', code)
              if (r.confirm && code) {
                console.log('[home] setPendingInviteCode from modal:', code)
                setPendingInviteCode(code)
              }
            },
          })
        }
      },
    })
  }

  const handleAvatarClick = () => {
    Taro.showActionSheet({
      itemList: ['我发起的行程', '我参加的行程', '退出登录'],
      success: (res) => {
        if (res.tapIndex === 0) {
          Taro.navigateTo({ url: '/pages/invite/index?tab=created' })
        } else if (res.tapIndex === 1) {
          Taro.navigateTo({ url: '/pages/invite/index?tab=joined' })
        } else if (res.tapIndex === 2) {
          Taro.showModal({
            title: '退出登录',
            content: '确认退出当前账号？',
            confirmText: '退出',
            confirmColor: '#CC0000',
            success: (r) => {
              if (r.confirm) clearUser()
            },
          })
        }
      },
    })
  }

  const handlePlan = () => {
    if (!area.trim()) {
      Taro.showToast({ title: '请输入目的地或活动', icon: 'none' })
      return
    }
    if (!isLoggedIn) {
      setPendingAction('plan')
      setShowLogin(true)
      return
    }
    doPlan()
  }

  const doPlan = useCallback(async () => {
    if (!area.trim()) {
      Taro.showToast({ title: '请输入目的地或活动', icon: 'none' })
      return
    }
    const count = PERSON_COUNTS[personIdx]
    const budget = budgetInput ? parseInt(budgetInput, 10) : 999
    const endTime = ENDTIME_OPTIONS[endTimeIdx]
    setSession({
      peopleCount: count,
      budgetPerPerson: budget,
      startTime: STARTTIME_OPTIONS[startTimeIdx],
      endTime,
      sceneTags: activeTags,
      categories: activeCategories,
    })
    setPlanning(true)
    if (count > 1) {
      try {
        const trip = await createTrip({
          area, peopleCount: count, endTime, budgetPerPerson: budget,
          sceneTags: activeTags, categories: activeCategories,
        })
        setSession({ tripId: trip.trip_id, inviteCode: trip.invite_code, memberRole: 'initiator' })
        setPlanning(false)
        Taro.navigateTo({ url: `/pages/ai-questions/index?tripId=${trip.trip_id}&role=initiator` })
      } catch (e) {
        setPlanning(false)
        Taro.showToast({ title: '创建行程失败', icon: 'none' })
      }
    } else {
      setSession({ tripId: '', memberRole: '', inviteCode: '' })
      setTimeout(() => {
        setPlanning(false)
        Taro.navigateTo({ url: '/pages/ai-questions/index' })
      }, 1000)
    }
  }, [area, personIdx, budgetInput, startTimeIdx, endTimeIdx, activeTags, activeCategories, setSession])

  return (
    <View className={styles.page}>
      <ScrollView scrollY className={styles.scrollView}>

        {/* Header */}
        <View className={styles.header}>
          <View className={styles.headerRow}>
            <Text className={styles.pageTitle}>今天去哪儿？</Text>
            {isLoggedIn ? (
              <View className={styles.userAvatar} onClick={handleAvatarClick}>
                <Text style={{ fontSize: '20px' }}>👤</Text>
              </View>
            ) : (
              <View className={styles.inviteBtn}
                onClick={() => {
                  setPendingAction('invite')
                  setShowLogin(true)
                }}>
                <Icon name="group" size={20} color="#111111" />
              </View>
            )}
          </View>

          {/* 搜索框 */}
          <View className={`${styles.searchBar} ${focused ? styles.searchBarFocused : ''}`}>
            <Icon name="search" size={18} color="rgba(26,26,26,0.3)" />
            <Input
              className={styles.searchInput}
              placeholder={PLACEHOLDERS[phIdx]}
              placeholderClass={styles.searchPlaceholder}
              value={area}
              onInput={e => setSession({ area: e.detail.value })}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
            />
          </View>
        </View>

        {/* 加入行程入口 */}
        <View style={{ padding: '0 40rpx 8rpx', display: 'flex', justifyContent: 'flex-end' }}>
          <View onClick={handleJoinTrip} style={{ padding: '8rpx 0' }}>
            <Text style={{ fontSize: '26rpx', color: 'rgba(26,26,26,0.45)' }}>
              收到邀请？加入行程 →
            </Text>
          </View>
        </View>

        {/* 进行中行程卡片 */}
        {selectedRouteId && (
          <View
            className={styles.activeTrip}
            onClick={() => Taro.navigateTo({ url: `/pages/route-detail/index?routeId=${selectedRouteId}` })}
          >
            <View className={styles.activeTripLeft}>
              <View className={styles.activeTripDot} />
              <View className={styles.activeTripInfo}>
                <Text className={styles.activeTripLabel}>行程进行中</Text>
                <Text className={styles.activeTripSub}>点击回到当前行程</Text>
              </View>
            </View>
            <Icon name="chevron-right" size={18} color="var(--color-label-3)" />
          </View>
        )}

        <View className={styles.divider} />

        {/* 场景 */}
        <View className={styles.section}>
          <Text className={styles.sectionLabel}>场景</Text>
          <ScrollView scrollX className={styles.tagRow} enableFlex>
            <View className={styles.tagRowInner}>
              {[...PRESET_TAGS, ...customTags].map(tag => {
                const active = activeTags.includes(tag)
                return (
                  <View key={tag}
                    className={`${styles.tag} ${active ? styles.tagActive : ''}`}
                    onClick={() => toggleTag(tag)}>
                    <Text className={styles.tagText}>{tag}</Text>
                  </View>
                )
              })}
              {showTagInput ? (
                <View className={styles.tagInputWrap}>
                  <Input
                    className={styles.tagInput}
                    value={tagInputVal}
                    onInput={e => setTagInputVal(e.detail.value)}
                    onConfirm={confirmCustomTag}
                    onBlur={confirmCustomTag}
                    focus
                    maxlength={10}
                    placeholder="输入场景"
                    placeholderClass={styles.tagInputPlaceholder}
                  />
                </View>
              ) : (
                <View className={styles.tagAdd} onClick={() => setShowTagInput(true)}>
                  <Text className={styles.tagAddText}>+ 自定义</Text>
                </View>
              )}
            </View>
          </ScrollView>
        </View>

        <View className={styles.divider} />

        {/* 出行参数 */}
        <View className={styles.section}>
          <Text className={styles.sectionLabel}>出行</Text>
          <View className={styles.paramList}>
            <View className={styles.paramRow} onClick={() => openSheet({
              title: '出行人数',
              options: PERSON_OPTIONS,
              current: personIdx,
              onSelect: (i) => { setPersonIdx(i); closeSheet() },
            })}>
              <Text className={styles.paramLabel}>出行人数</Text>
              <Text className={styles.paramValue}>{PERSON_OPTIONS[personIdx]}</Text>
              <Icon name="chevron-right" size={18} color="rgba(26,26,26,0.25)" />
            </View>
            <View className={styles.paramRow}>
              <Text className={styles.paramLabel}>人均预算</Text>
              <View className={styles.budgetInputWrap}>
                <Input
                  className={styles.budgetInput}
                  type="number"
                  value={budgetInput}
                  placeholder="不限"
                  placeholderClass={styles.budgetPlaceholder}
                  onInput={e => setBudgetInput(e.detail.value)}
                />
                {budgetInput ? <Text className={styles.budgetUnit}>元/人</Text> : null}
              </View>
            </View>
            <View className={styles.paramRow} onClick={() => openSheet({
              title: '开始时间',
              options: STARTTIME_OPTIONS,
              current: startTimeIdx,
              onSelect: (i) => { setStartTimeIdx(i); closeSheet() },
            })}>
              <Text className={styles.paramLabel}>开始时间</Text>
              <Text className={styles.paramValue}>{STARTTIME_OPTIONS[startTimeIdx]}</Text>
              <Icon name="chevron-right" size={18} color="rgba(26,26,26,0.25)" />
            </View>
            <View className={styles.paramRow} onClick={() => openSheet({
              title: '结束时间',
              options: ENDTIME_OPTIONS,
              current: endTimeIdx,
              onSelect: (i) => { setEndTimeIdx(i); closeSheet() },
            })}>
              <Text className={styles.paramLabel}>结束时间</Text>
              <Text className={styles.paramValue}>{ENDTIME_OPTIONS[endTimeIdx]}</Text>
              <Icon name="chevron-right" size={18} color="rgba(26,26,26,0.25)" />
            </View>
            <View className={styles.paramRowNotes}>
              <Input
                className={styles.notesInput}
                placeholder="备注：有老人同行、想去安静的地方…"
                placeholderClass={styles.notesPlaceholder}
                value={notes}
                onInput={e => setSession({ notes: e.detail.value })}
                maxlength={100}
              />
            </View>
          </View>
        </View>

        <View className={styles.bottomPad} />
      </ScrollView>

      {/* 底部 CTA */}
      <View className={styles.cta}>
        <View className={cx(styles.ctaBtn, planning && styles.ctaBtnPlanning)} onClick={!planning ? handlePlan : undefined}>
          {planning ? (
            <>
              <View className={styles.ctaSpinner} />
              <Text className={styles.ctaBtnText}>AI 生成路线中…</Text>
            </>
          ) : (
            <Text className={styles.ctaBtnText}>立即规划</Text>
          )}
        </View>
      </View>

      {/* 主题追问弹窗 */}
      {showThemeSheet && (
        <View className={styles.sheetMask} onClick={confirmThemeSheet}>
          <View className={styles.sheet} onClick={e => e.stopPropagation()}>
            <View className={styles.sheetHandle} />
            <Text className={styles.sheetTitle}>主要玩什么？</Text>
            <View className={styles.themeGrid}>
              {(SCENE_THEMES[themeSheetScene] ?? []).map(cat => {
                const active = pendingThemes.includes(cat.id)
                return (
                  <View
                    key={cat.id}
                    className={`${styles.themeItem} ${active ? styles.themeItemActive : ''}`}
                    onClick={() => togglePendingTheme(cat.id)}
                  >
                    <Icon name={cat.icon as any} size={24} color={active ? '#fff' : '#AAAAAA'} />
                    <Text className={styles.themeItemName}>{cat.name}</Text>
                  </View>
                )
              })}
            </View>
            <View className={styles.themeConfirmBtn} onClick={confirmThemeSheet}>
              <Text className={styles.themeConfirmText}>
                {pendingThemes.length > 0 ? `确定（${pendingThemes.length}项）` : '跳过'}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* 自定义选择弹窗 */}
      {sheet && (
        <View className={styles.sheetMask} onClick={closeSheet}>
          <View className={styles.sheet} onClick={e => e.stopPropagation()}>
            <View className={styles.sheetHandle} />
            <Text className={styles.sheetTitle}>{sheet.title}</Text>
            <ScrollView scrollY className={styles.sheetList}>
              {sheet.options.map((opt, i) => (
                <View
                  key={opt}
                  className={`${styles.sheetItem} ${i === sheet.current ? styles.sheetItemActive : ''}`}
                  onClick={() => sheet.onSelect(i)}
                >
                  <Text className={`${styles.sheetItemText} ${i === sheet.current ? styles.sheetItemTextActive : ''}`}>
                    {opt}
                  </Text>
                  {i === sheet.current && (
                    <Icon name="check" size={16} color="#111111" className={styles.sheetCheck} />
                  )}
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      )}

      {showLogin && (
        <LoginSheet
          onClose={() => { setShowLogin(false); setPendingAction(null) }}
          onSuccess={() => {
            // 明确在 onSuccess 执行时读取 pendingAction，不依赖 onClose 调用顺序
            const action = pendingAction
            setShowLogin(false)
            setPendingAction(null)
            if (action === 'plan') doPlan()
            if (action === 'invite') Taro.navigateTo({ url: '/pages/invite/index' })
          }}
        />
      )}
    </View>
  )
}
