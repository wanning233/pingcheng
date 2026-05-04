// src/pages/preference/components/AvatarRow.tsx
import { View, Text } from '@tarojs/components'
import styles from './AvatarRow.module.scss'

interface Member {
  id: string
  name: string
  avatar: string
  done?: boolean
}

interface AvatarRowProps {
  members: Member[]
  currentUserId: string
}

export default function AvatarRow({ members, currentUserId }: AvatarRowProps) {
  return (
    <View className={styles.row}>
      {members.map((m) => (
        <View key={m.id} className={styles.memberItem}>
          <View className={styles.avatarWrap}>
            {/* 绿色圆弧（完成者显示）— 用 CSS border 实现，避免 SVG 在小程序不支持 */}
            {m.done && <View className={styles.ringCss} />}
            {/* 头像圆 */}
            <View
              className={[
                styles.avatar,
                m.id === currentUserId ? styles.avatarSelf : '',
                m.done ? styles.avatarDone : '',
              ].filter(Boolean).join(' ')}
            >
              <Text className={styles.avatarInitial}>
                {m.name.charAt(0)}
              </Text>
            </View>
          </View>
          <Text className={styles.name}>{m.name}</Text>
          {m.done && <Text className={styles.doneLabel}>已完成</Text>}
        </View>
      ))}
    </View>
  )
}
