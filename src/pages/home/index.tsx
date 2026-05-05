// src/pages/home/index.tsx
import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { View, Text, Input, ScrollView } from '@tarojs/components'
import styles from './index.module.scss'
import { useSessionStore } from '../../stores/useSessionStore'

const QUICK_TAGS = ['朋友聚会', '情侣约会', '亲子出行', '省钱优先', '少排队']
const QUICK_CATEGORIES = [
  { name: '火锅', icon: 'hotpot' },
  { name: '奶茶', icon: 'tea' },
  { name: '拍照', icon: 'camera' },
  { name: '甜品', icon: 'dessert' },
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

function CatIcon({ icon, active }: { icon: string; active: boolean }) {
  const c = active ? styles.catIconElActive : styles.catIconEl
  if (icon === 'hotpot') return (
    <View className={styles.catIconWrap}>
      <View className={`${styles.catIconHotpotFlame2} ${c}`} />
      <View className={`${styles.catIconHotpotFlame1} ${c}`} />
      <View className={`${styles.catIconHotpotFlame3} ${c}`} />
      <View className={`${styles.catIconHotpotHandle1} ${c}`} />
      <View className={`${styles.catIconHotpotHandle2} ${c}`} />
      <View className={`${styles.catIconHotpotRim} ${c}`} />
      <View className={`${styles.catIconHotpotPot} ${c}`} />
    </View>
  )
  if (icon === 'tea') return (
    <View className={styles.catIconWrap}>
      <View className={`${styles.catIconTeaStraw} ${c}`} />
      <View className={`${styles.catIconTeaDome} ${c}`} />
      <View className={`${styles.catIconTeaLid} ${c}`} />
      <View className={`${styles.catIconTeaCup} ${c}`} />
    </View>
  )
  if (icon === 'camera') return (
    <View className={styles.catIconWrap}>
      <View className={`${styles.catIconCamBump} ${c}`} />
      <View className={`${styles.catIconCamBody} ${c}`} />
      <View className={styles.catIconCamLens} />
      <View className={`${styles.catIconCamDot} ${c}`} />
    </View>
  )
  if (icon === 'dessert') return (
    <View className={styles.catIconWrap}>
      <View className={`${styles.catIconIceScoop} ${c}`} />
      <View className={`${styles.catIconIceCone} ${active ? styles.catIconIceConeElActive : styles.catIconIceConeEl}`} />
      <View className={`${styles.catIconIceLine1} ${c}`} />
      <View className={`${styles.catIconIceLine2} ${c}`} />
    </View>
  )
  return null
}

export default function HomePage() {
  const { area, notes, setSession } = useSessionStore()
  const [focused, setFocused] = useState(false)
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [personIdx, setPersonIdx] = useState(2)
  const [budgetIdx, setBudgetIdx] = useState(2)
  const [endTimeIdx, setEndTimeIdx] = useState(3)
  const [phIdx, setPhIdx] = useState(0)
  const [sheet, setSheet] = useState<SheetConfig | null>(null)

  useEffect(() => {
    const t = setInterval(() => setPhIdx(i => (i + 1) % PLACEHOLDERS.length), 3000)
    return () => clearInterval(t)
  }, [])

  const openSheet = (config: SheetConfig) => setSheet(config)
  const closeSheet = () => setSheet(null)

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

  return (
    <View className={styles.page}>

      <View className={styles.top}>
        {/* 品牌行 */}
        <View className={styles.brandRow}>
          <View className={styles.brandLeft}>
            <View className={styles.brandIcon}>
              <Text className={styles.brandIconText}>拼</Text>
            </View>
            <Text className={styles.brandName}>拼程</Text>
          </View>
          <View className={styles.inviteBtn}
            onClick={() => Taro.navigateTo({ url: '/pages/invite/landing/index' })}>
            <Text className={styles.inviteBtnText}>邀请朋友</Text>
          </View>
        </View>

        {/* 搜索框 */}
        <View className={`${styles.searchBar} ${focused ? styles.searchBarFocused : ''}`}>
          {/* 搜索图标 — CSS 圆形放大镜 */}
          <View className={styles.searchIconWrap}>
            <View className={styles.searchIconCircle} />
            <View className={styles.searchIconHandle} />
          </View>
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
            {QUICK_TAGS.map(tag => (
              <View key={tag}
                className={`${styles.tag} ${activeTag === tag ? styles.tagActive : ''}`}
                onClick={() => setActiveTag(activeTag === tag ? null : tag)}>
                {tag}
              </View>
            ))}
          </ScrollView>
        </View>

        {/* 品类 2×2 */}
        <View className={styles.section}>
          <Text className={styles.sectionHeader}>主题</Text>
          <View className={styles.categoryGrid}>
            {QUICK_CATEGORIES.map(cat => (
              <View key={cat.name}
                className={`${styles.categoryItem} ${activeCategory === cat.name ? styles.categoryItemActive : ''}`}
                onClick={() => setActiveCategory(activeCategory === cat.name ? null : cat.name)}>
                <CatIcon icon={cat.icon} active={activeCategory === cat.name} />
                <Text className={styles.catName}>{cat.name}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 出行参数 — 自定义行，无原生 Picker */}
        <View className={styles.section}>
          <Text className={styles.sectionHeader}>出行</Text>
          <View className={styles.paramCard}>
            <View className={styles.paramRow} onClick={() => openSheet({
              title: '出行人数',
              options: PERSON_OPTIONS,
              current: personIdx,
              onSelect: (i) => { setPersonIdx(i); closeSheet() },
            })}>
              {/* 人数图标：两个小圆头 */}
              <View className={styles.iconWrap}>
                <View className={styles.iconPersonHead1} />
                <View className={styles.iconPersonHead2} />
                <View className={styles.iconPersonBody} />
              </View>
              <Text className={styles.paramLabel}>出行人数</Text>
              <Text className={styles.paramValue}>{PERSON_OPTIONS[personIdx]}</Text>
              <Text className={styles.paramChevron}>›</Text>
            </View>
            <View className={styles.paramRow} onClick={() => openSheet({
              title: '人均预算',
              options: BUDGET_OPTIONS,
              current: budgetIdx,
              onSelect: (i) => { setBudgetIdx(i); closeSheet() },
            })}>
              {/* 预算图标：圆形 ¥ 符号 */}
              <View className={styles.iconWrap}>
                <View className={styles.iconCoinCircle}>
                  <Text className={styles.iconCoinText}>¥</Text>
                </View>
              </View>
              <Text className={styles.paramLabel}>人均预算</Text>
              <Text className={styles.paramValue}>{BUDGET_OPTIONS[budgetIdx]}</Text>
              <Text className={styles.paramChevron}>›</Text>
            </View>
            <View className={styles.paramRow} onClick={() => openSheet({
              title: '结束时间',
              options: ENDTIME_OPTIONS,
              current: endTimeIdx,
              onSelect: (i) => { setEndTimeIdx(i); closeSheet() },
            })}>
              {/* 时间图标：表盘 */}
              <View className={styles.iconWrap}>
                <View className={styles.iconClock}>
                  <View className={styles.iconClockHand} />
                  <View className={styles.iconClockHandMin} />
                </View>
              </View>
              <Text className={styles.paramLabel}>结束时间</Text>
              <Text className={styles.paramValue}>{ENDTIME_OPTIONS[endTimeIdx]}</Text>
              <Text className={styles.paramChevron}>›</Text>
            </View>
            <View className={styles.paramRowNotes}>
              {/* 备注图标：对话气泡 */}
              <View className={styles.iconWrap}>
                <View className={styles.iconBubble}>
                  <View className={styles.iconBubbleDot} />
                  <View className={styles.iconBubbleDot} />
                  <View className={styles.iconBubbleDot} />
                </View>
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
                  {i === sheet.current && <Text className={styles.sheetCheck}>✓</Text>}
                </View>
              ))}
            </View>
          </View>
        </View>
      )}

    </View>
  )
}
