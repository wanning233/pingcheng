// src/mock/preferenceQuestions.ts
export interface PreferenceQuestion {
  id: string
  question: string
  options: { id: string; label: string; icon: string }[]
}

export const PREFERENCE_QUESTIONS: PreferenceQuestion[] = [
  {
    id: 'taste',
    question: '口味偏好？',
    options: [
      { id: 'spicy',    label: '必须辣',   icon: 'chili' },
      { id: 'mild',     label: '微辣可以', icon: 'smile' },
      { id: 'no_spicy', label: '不吃辣',   icon: 'no' },
      { id: 'any',      label: '都行',     icon: 'peace' },
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
    id: 'energy',
    question: '体力状态？',
    options: [
      { id: 'high',   label: '体力充沛',   icon: 'energy-high' },
      { id: 'medium', label: '一般般',     icon: 'energy-mid' },
      { id: 'low',    label: '能少走就少走', icon: 'energy-low' },
      { id: 'knee',   label: '膝盖不好',   icon: 'energy-knee' },
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
]

export const MOCK_MEMBERS = [
  { id: 'linxiaxia', name: '林小夏', avatar: '' },
  { id: 'chenyu',    name: '陈宇',   avatar: '' },
  { id: 'wangmeng',  name: '王萌',   avatar: '' },
  { id: 'liting',    name: '李婷',   avatar: '' },
]
