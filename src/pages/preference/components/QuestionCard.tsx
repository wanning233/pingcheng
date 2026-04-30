// src/pages/preference/components/QuestionCard.tsx
import { View, Text } from '@tarojs/components'
import styles from './QuestionCard.module.scss'
import { PreferenceQuestion } from '../../../mock/preferenceQuestions'

interface QuestionCardProps {
  question: PreferenceQuestion
  selected: string | null
  onSelect: (optionId: string) => void
}

export default function QuestionCard({ question, selected, onSelect }: QuestionCardProps) {
  return (
    <View className={styles.card}>
      <Text className={styles.questionText}>{question.question}</Text>
      <View className={styles.optionGrid}>
        {question.options.map(opt => (
          <View
            key={opt.id}
            className={`${styles.optionItem} ${selected === opt.id ? styles.optionSelected : ''}`}
            onClick={() => onSelect(opt.id)}
          >
            <Text className={styles.optionEmoji}>{opt.emoji}</Text>
            <Text className={styles.optionLabel}>{opt.label}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}
