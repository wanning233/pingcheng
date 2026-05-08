// src/pages/home/index.tsx
import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { View, Text, Input, ScrollView, Image } from '@tarojs/components'
import styles from './index.module.scss'
import { useSessionStore } from '../../stores/useSessionStore'
import { useRouteStore } from '../../stores/useRouteStore'
import Icon from '../../components/base/Icon'
import logoHorizontal from '../../assets/logo/logo-horizontal.svg'

const PRESET_TAGS = ['朋友聚会', '情侣约会', '亲子出行', '省钱优先', '少排队']

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
  省钱优先: [
    { id: 'park', name: '公园遛弯', icon: 'park' },
    { id: 'food', name: '吃喝探店', icon: 'food' },
    { id: 'culture', name: '文化打卡', icon: 'culture' },
    { id: 'camera', name: '拍照出片', icon: 'camera' },
  ],
  少排队: [
    { id: 'outdoor', name: '户外运动', icon: 'outdoor' },
    { id: 'park', name: '公园遛弯', icon: 'park' },
    { id: 'cafe', name: '约会休闲', icon: 'cafe' },
    { id: 'shopping', name: '逛街购物', icon: 'shopping' },
  ],
}

// 默认主题（无场景时使用）
const DEFAULT_THEMES = [
  { id: 'food', name: '吃喝探店', icon: 'food' },
  { id: 'park', name: '公园遛弯', icon: 'park' },
  { id: 'game', name: '沉浸娱乐', icon: 'game' },
  { id: 'culture', name: '文化打卡', icon: 'culture' },
  { id: 'shopping', name: '逛街购物', icon: 'shopping' },
  { id: 'camera', name: '拍照出片', icon: 'camera' },
]

const PERSON_OPTIONS = ['2人', '3人', '4人', '5人', '6人']
const PERSON_COUNTS = [2, 3, 4, 5, 6]
const BUDGET_OPTIONS = ['¥50以内', '¥100以内', '¥150以内', '¥200以内', '不限']
const BUDGET_VALUES = [50, 100, 150, 200, 999]
const ENDTIME_OPTIONS = ['18:00', '19:00', '20:00', '21:00', '22:00', '23:00']
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
  const { area, notes, setSession } = useSessionStore()
  const selectedRouteId = useRouteStore(s => s.selectedRouteId)
  const [focused, setFocused] = useState(false)
  const [activeTags, setActiveTags] = useState<string[]>([])
  const [customTags, setCustomTags] = useState<string[]>([])
  const [activeCategories, setActiveCategories] = useState<string[]>([])
  const [showTagInput, setShowTagInput] = useState(false)
  const [tagInputVal, setTagInputVal] = useState('')
  const [personIdx, setPersonIdx] = useState(2)
  const [budgetIdx, setBudgetIdx] = useState(2)
  const [endTimeIdx, setEndTimeIdx] = useState(3)
  const [phIdx, setPhIdx] = useState(0)
  const [sheet, setSheet] = useState<SheetConfig | null>(null)
  const [showThemeSheet, setShowThemeSheet] = useState(false)
  const [themeSheetScene, setThemeSheetScene] = useState('')
  const [pendingThemes, setPendingThemes] = useState<string[]>([])

  useEffect(() => {
    const t = setInterval(() => setPhIdx(i => (i + 1) % PLACEHOLDERS.length), 3000)
    return () => clearInterval(t)
  }, [])

  const toggleTag = (tag: string) => {
    const isAdding = !activeTags.includes(tag)
    setActiveTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
    // 选中场景时弹出主题追问
    if (isAdding) {
      const themes = SCENE_THEMES[tag] ?? DEFAULT_THEMES
      setPendingThemes([])
      setThemeSheetScene(tag)
      setShowThemeSheet(true)
      // 预填当前已选主题中属于该场景的项
      setActiveCategories(prev => {
        const ids = themes.map(t => t.id)
        // 保留已有的且属于本场景的选项作为默认勾选
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

  const toggleCategory = (id: string) => {
    setActiveCategories(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    )
  }

  const togglePendingTheme = (id: string) => {
    setPendingThemes(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    )
  }

  const confirmThemeSheet = () => {
    // 合并：保留其他场景已选的主题 + 本次选择
    setActiveCategories(prev => {
      const currentSceneIds = (SCENE_THEMES[themeSheetScene] ?? DEFAULT_THEMES).map(t => t.id)
      const others = prev.filter(id => !currentSceneIds.includes(id))
      return [...others, ...pendingThemes]
    })
    setShowThemeSheet(false)
  }

  const openSheet = (config: SheetConfig) => setSheet(config)
  const closeSheet = () => setSheet(null)

  const handlePlan = () => {
    if (!area.trim()) {
      Taro.showToast({ title: '请输入目的地或活动', icon: 'none' })
      return
    }
    const code = Math.random().toString(36).slice(2, 8).toUpperCase()
    setSession({
      peopleCount: PERSON_COUNTS[personIdx],
      budgetPerPerson: BUDGET_VALUES[budgetIdx],
      endTime: ENDTIME_OPTIONS[endTimeIdx],
      sceneTags: activeTags,
      categories: activeCategories,
      inviteCode: code,
    })
    Taro.switchTab({ url: '/pages/invite/index' })
  }

  return (
    <View className={styles.page}>

      <View className={styles.top}>
        {/* 品牌行 */}
        <View className={styles.brandRow}>
          <Image
            className={styles.brandLogo}
            src={logoHorizontal}
            mode="aspectFit"
          />
          <View className={styles.inviteBtn}
            onClick={() => Taro.switchTab({ url: '/pages/invite/index' })}>
            <Text className={styles.inviteBtnText}>邀请朋友</Text>
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
            <Icon name="chevron-right" size={18} color="var(--color-primary)" />
          </View>
        )}

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

      <View className={styles.body}>

        {/* 场景标签 */}
        <View className={styles.section}>
          <Text className={styles.sectionHeader}>场景</Text>
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
            {/* 自定义入口 */}
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
                <Icon name="add" size={14} color="var(--color-label-3)" />
                <Text className={styles.tagAddText}>自定义</Text>
              </View>
            )}
            </View>
          </ScrollView>
        </View>

        {/* 已选主题标签（仅有选中项时展示） */}
        {activeCategories.length > 0 && (
          <View className={styles.section}>
            <Text className={styles.sectionHeader}>主题偏好</Text>
            <ScrollView scrollX className={styles.tagRow} enableFlex>
              <View className={styles.tagRowInner}>
              {activeCategories.map(id => {
                const allThemes = Object.values(SCENE_THEMES).flat().concat(DEFAULT_THEMES)
                const cat = allThemes.find(t => t.id === id)
                if (!cat) return null
                return (
                  <View key={id}
                    className={`${styles.tag} ${styles.tagActive}`}
                    onClick={() => toggleCategory(id)}>
                    <Text className={styles.tagText}>{cat.name}</Text>
                  </View>
                )
              })}
              </View>
            </ScrollView>
          </View>
        )}

        {/* 出行参数 */}
        <View className={styles.section}>
          <Text className={styles.sectionHeader}>出行</Text>
          <View className={styles.paramCard}>
            <View className={styles.paramRow} onClick={() => openSheet({
              title: '出行人数',
              options: PERSON_OPTIONS,
              current: personIdx,
              onSelect: (i) => { setPersonIdx(i); closeSheet() },
            })}>
              <View className={styles.iconWrap}>
                <Icon name="people" size={20} color="#AAAAAA" />
              </View>
              <Text className={styles.paramLabel}>出行人数</Text>
              <Text className={styles.paramValue}>{PERSON_OPTIONS[personIdx]}</Text>
              <Icon name="chevron-right" size={18} color="rgba(26,26,26,0.25)" />
            </View>
            <View className={styles.paramRow} onClick={() => openSheet({
              title: '人均预算',
              options: BUDGET_OPTIONS,
              current: budgetIdx,
              onSelect: (i) => { setBudgetIdx(i); closeSheet() },
            })}>
              <View className={styles.iconWrap}>
                <Icon name="wallet" size={20} color="#AAAAAA" />
              </View>
              <Text className={styles.paramLabel}>人均预算</Text>
              <Text className={styles.paramValue}>{BUDGET_OPTIONS[budgetIdx]}</Text>
              <Icon name="chevron-right" size={18} color="rgba(26,26,26,0.25)" />
            </View>
            <View className={styles.paramRow} onClick={() => openSheet({
              title: '结束时间',
              options: ENDTIME_OPTIONS,
              current: endTimeIdx,
              onSelect: (i) => { setEndTimeIdx(i); closeSheet() },
            })}>
              <View className={styles.iconWrap}>
                <Icon name="time" size={20} color="#AAAAAA" />
              </View>
              <Text className={styles.paramLabel}>结束时间</Text>
              <Text className={styles.paramValue}>{ENDTIME_OPTIONS[endTimeIdx]}</Text>
              <Icon name="chevron-right" size={18} color="rgba(26,26,26,0.25)" />
            </View>
            <View className={styles.paramRowNotes}>
              <View className={styles.iconWrap}>
                <Icon name="note" size={20} color="#AAAAAA" />
              </View>
              <Input
                className={styles.notesInput}
                placeholder="还有什么特别要求？（如：有老人同行、想去安静的地方…）"
                placeholderClass={styles.notesPlaceholder}
                value={notes}
                onInput={e => setSession({ notes: e.detail.value })}
                maxlength={100}
              />
            </View>
          </View>
        </View>

      </View>

      {/* 底部 CTA */}
      <View className={styles.cta}>
        <View className={styles.ctaBtn} onClick={handlePlan}>
          <Text className={styles.ctaBtnText}>立即规划</Text>
        </View>
      </View>

      {/* 主题追问弹窗 */}
      {showThemeSheet && (
        <View className={styles.sheetMask} onClick={confirmThemeSheet}>
          <View className={styles.sheet} onClick={e => e.stopPropagation()}>
            <View className={styles.sheetHandle} />
            <Text className={styles.sheetTitle}>主要玩什么？</Text>
            <View className={styles.themeGrid}>
              {(SCENE_THEMES[themeSheetScene] ?? DEFAULT_THEMES).map(cat => {
                const active = pendingThemes.includes(cat.id)
                return (
                  <View
                    key={cat.id}
                    className={`${styles.themeItem} ${active ? styles.themeItemActive : ''}`}
                    onClick={() => togglePendingTheme(cat.id)}
                  >
                    <Icon name={cat.icon as any} size={24} color={active ? '#fff' : '#AAAAAA'} />
                    <Text className={styles.themeItemName}>{cat.name}</Text>
                    {active && (
                      <View className={styles.catCheck}>
                        <Icon name="check" size={12} color="#fff" />
                      </View>
                    )}
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
            <View className={styles.sheetList}>
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
                    <Icon name="check" size={16} color="var(--color-primary)" className={styles.sheetCheck} />
                  )}
                </View>
              ))}
            </View>
          </View>
        </View>
      )}

    </View>
  )
}
