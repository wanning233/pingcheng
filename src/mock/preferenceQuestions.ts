// src/mock/preferenceQuestions.ts
export interface PreferenceQuestion {
  id: string
  question: string
  options: { id: string; label: string; emoji: string }[]
}

export const PREFERENCE_QUESTIONS: PreferenceQuestion[] = [
  {
    id: 'taste',
    question: '口味偏好？',
    options: [
      { id: 'spicy', label: '必须辣', emoji: '🌶️' },
      { id: 'mild', label: '微辣可以', emoji: '😊' },
      { id: 'no_spicy', label: '不吃辣', emoji: '🚫' },
      { id: 'any', label: '都行', emoji: '✌️' },
    ],
  },
  {
    id: 'budget',
    question: '人均预算？',
    options: [
      { id: 'under100', label: '100以内', emoji: '💰' },
      { id: 'under150', label: '150以内', emoji: '💳' },
      { id: 'under200', label: '200以内', emoji: '💎' },
      { id: 'any', label: '不限制', emoji: '🤑' },
    ],
  },
  {
    id: 'energy',
    question: '体力状态？',
    options: [
      { id: 'high', label: '体力充沛', emoji: '⚡' },
      { id: 'medium', label: '一般般', emoji: '🚶' },
      { id: 'low', label: '能少走就少走', emoji: '🪑' },
      { id: 'knee', label: '膝盖不好', emoji: '🦵' },
    ],
  },
  {
    id: 'vibe',
    question: '今天想要？',
    options: [
      { id: 'photo', label: '出片出片', emoji: '📸' },
      { id: 'eat', label: '吃吃吃', emoji: '🍜' },
      { id: 'chill', label: '放松躺平', emoji: '☁️' },
      { id: 'explore', label: '探索新地方', emoji: '🗺️' },
    ],
  },
]

export const MOCK_MEMBERS = [
  { id: 'linxiaxia', name: '林小夏', avatar: '' },
  { id: 'chenyu',    name: '陈宇',   avatar: '' },
  { id: 'wangmeng',  name: '王萌',   avatar: '' },
  { id: 'liting',    name: '李婷',   avatar: '' },
]
