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
