// src/components/business/LoginSheet/index.tsx
import Taro from '@tarojs/taro'
import { View, Text, Button, Input, Image } from '@tarojs/components'
import { useState } from 'react'
import styles from './index.module.scss'
import { useUserStore } from '../../../stores/useUserStore'

// 生成临时本地 userId（无后端时使用，接入后端后删除此函数）
function generateId(): string {
  return 'u_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}

const DEFAULT_AVATAR = 'https://thirdwx.qlogo.cn/mmopen/vi_32/POgEwh4mIHO4nibH0KlMECNjjGxQUq24ZEaGT4poC6icRiccVGKSyXwibcPq4BWmiaIaKx9EV8vj5A52KKQCS3ekPlFg/132'

interface Props {
  onClose: () => void
  onSuccess?: () => void
}

export default function LoginSheet({ onClose, onSuccess }: Props) {
  const [avatarUrl, setAvatarUrl] = useState('')
  const [nickName, setNickName] = useState('')
  const [loading, setLoading] = useState(false)
  const setUser = useUserStore(s => s.setUser)

  const handleChooseAvatar = (e: any) => {
    setAvatarUrl(e.detail.avatarUrl)
  }

  const handleConfirm = () => {
    if (!nickName.trim()) {
      Taro.showToast({ title: '请填写昵称', icon: 'none' })
      return
    }
    if (loading) return
    setLoading(true)
    try {
      const userId = generateId()
      setUser({ userId, nickName: nickName.trim(), avatarUrl: avatarUrl || DEFAULT_AVATAR })
      onSuccess?.()
      onClose()
    } catch (e) {
      console.error('[LoginSheet] handleConfirm error:', e)
      Taro.showToast({ title: '登录失败，请重试', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <View className={styles.mask} onClick={onClose} />
      <View className={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <View className={styles.handle} />
        <Text className={styles.title}>登录拼程</Text>
        <Text className={styles.subtitle}>登录后可邀请好友、同步行程</Text>

        {/* 头像选择 */}
        <Button
          className={styles.avatarBtn}
          openType="chooseAvatar"
          onChooseAvatar={handleChooseAvatar}
        >
          <Image
            src={avatarUrl || DEFAULT_AVATAR}
            className={styles.avatarImg}
          />
          <Text className={styles.avatarHint}>{avatarUrl ? '点击更换头像' : '点击选择头像'}</Text>
        </Button>

        {/* 昵称输入 */}
        <Input
          className={styles.nickInput}
          type="nickname"
          placeholder="请输入昵称"
          placeholderClass={styles.nickPlaceholder}
          value={nickName}
          onInput={e => setNickName(e.detail.value)}
          onBlur={e => setNickName(e.detail.value)}
        />

        {/* 确认按钮 */}
        <Button className={styles.confirmBtn} onClick={handleConfirm}>
          <Text className={styles.confirmBtnText}>
            {loading ? '登录中…' : '完成'}
          </Text>
        </Button>

        <Text className={styles.agreement}>登录即同意用户协议和隐私政策</Text>
      </View>
    </>
  )
}
