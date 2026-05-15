// src/components/business/LoginSheet/index.tsx
import Taro from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { useState } from 'react'
import styles from './index.module.scss'
import { useUserStore } from '../../../stores/useUserStore'

// 生成简单 UUID（无需外部依赖）
function generateId(): string {
  return 'u_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}

interface Props {
  onClose: () => void
  onSuccess?: () => void
}

export default function LoginSheet({ onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false)
  const setUser = useUserStore(s => s.setUser)

  const handleLogin = async () => {
    if (loading) return
    setLoading(true)
    try {
      // 1. 获取用户头像昵称（需要用户主动点击按钮触发）
      const profileRes = await Taro.getUserProfile({ desc: '用于显示你的头像和昵称' })
      const { nickName, avatarUrl } = profileRes.userInfo

      // 2. 获取 wx.login code（临时标识，无后端时仅记录）
      await Taro.login()

      // 3. 持久化用户信息
      const userId = generateId()
      setUser({ userId, nickName, avatarUrl })

      onSuccess?.()
      onClose()
    } catch (e) {
      // 用户拒绝授权或取消，静默处理
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
        <View className={styles.loginBtn} onClick={handleLogin}>
          <Text className={styles.loginBtnText}>
            {loading ? '登录中…' : '微信一键登录'}
          </Text>
        </View>
        <Text className={styles.agreement}>登录即同意用户协议和隐私政策</Text>
      </View>
    </>
  )
}
