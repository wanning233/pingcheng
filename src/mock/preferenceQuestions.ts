// src/mock/preferenceQuestions.ts
export interface PreferenceQuestion {
  id: string
  question: string
  options: { id: string; label: string; icon: string }[]
}

export const PREFERENCE_QUESTIONS: PreferenceQuestion[] = [
  {
    id: 'meetup_time',
    question: '几点集合？',
    options: [
      { id: 'early',  label: '一大早出发',   icon: 'early' },
      { id: 'normal', label: '上午10点左右', icon: 'normal-time' },
      { id: 'late',   label: '下午才开始',   icon: 'late' },
      { id: 'flex',   label: '随大家',       icon: 'flex' },
    ],
  },
  {
    id: 'shop',
    question: '今天想逛街吗？',
    options: [
      { id: 'no',       label: '不逛，走起', icon: 'no-shop' },
      { id: 'browse',   label: '路过看看',   icon: 'browse' },
      { id: 'casual',   label: '边走边逛',   icon: 'walk-shop' },
      { id: 'hardcore', label: '血拼模式',   icon: 'shop-hard' },
    ],
  },
  {
    id: 'energy',
    question: '体力状态？',
    options: [
      { id: 'high',   label: '体力充沛',     icon: 'energy-high' },
      { id: 'medium', label: '一般般',       icon: 'energy-mid' },
      { id: 'low',    label: '能少走就少走', icon: 'energy-low' },
      { id: 'knee',   label: '膝盖不好',     icon: 'energy-knee' },
    ],
  },
  {
    id: 'vibe',
    question: '今天想要？',
    options: [
      { id: 'photo',   label: '出片出片',   icon: 'vibe-photo' },
      { id: 'eat',     label: '吃吃吃',     icon: 'vibe-eat' },
      { id: 'chill',   label: '放松躺平',   icon: 'vibe-chill' },
      { id: 'explore', label: '探索新地方', icon: 'vibe-explore' },
    ],
  },
  {
    id: 'taboo',
    question: '有什么禁忌？',
    options: [
      { id: 'none',     label: '没有限制', icon: 'no-limit' },
      { id: 'vegan',    label: '素食优先', icon: 'vegan' },
      { id: 'allergy',  label: '有过敏原', icon: 'allergy' },
      { id: 'no_drink', label: '不喝酒',   icon: 'no-drink' },
    ],
  },
  {
    id: 'budget',
    question: '人均预算？',
    options: [
      { id: 'under100', label: '100以内', icon: 'budget-low' },
      { id: 'under150', label: '150以内', icon: 'budget-mid' },
      { id: 'under200', label: '200以内', icon: 'budget-high' },
      { id: 'any',      label: '不限制',  icon: 'budget-any' },
    ],
  },
  {
    id: 'freetext',
    question: '还有什么特别想去或不想去的？',
    options: [],
  },
]

export const MOCK_MEMBERS = [
  { id: 'linxiaxia', name: '林小夏', avatar: '' },
  { id: 'chenyu',    name: '陈宇',   avatar: '' },
  { id: 'wangmeng',  name: '王萌',   avatar: '' },
  { id: 'liting',    name: '李婷',   avatar: '' },
]
