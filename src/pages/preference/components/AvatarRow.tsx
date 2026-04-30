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

const AVATAR_SIZE = 40
const RING_SIZE = AVATAR_SIZE + 8  // 48px total with ring

export default function AvatarRow({ members, currentUserId }: AvatarRowProps) {
  return (
    <View className={styles.row}>
      {members.map((m) => (
        <View key={m.id} className={styles.memberItem}>
          <View className={styles.avatarWrap}>
            {/* SVG 绿色圆弧（完成者显示） */}
            {m.done && (
              <svg
                className={styles.ringsvg}
                width={RING_SIZE}
                height={RING_SIZE}
                viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
              >
                <circle
                  cx={RING_SIZE / 2}
                  cy={RING_SIZE / 2}
                  r={(RING_SIZE - 4) / 2}
                  fill="none"
                  stroke="#00C9A7"
                  strokeWidth="2"
                  strokeDasharray={`${Math.PI * (RING_SIZE - 4)} 0`}
                  strokeLinecap="round"
                  transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
                  style={{ transition: 'stroke-dasharray 500ms ease' }}
                />
              </svg>
            )}
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
