// src/components/business/LoginSheet/index.tsx
import Taro from '@tarojs/taro'
import { View, Text, Button } from '@tarojs/components'
import { useState } from 'react'
import styles from './index.module.scss'
import { useUserStore } from '../../../stores/useUserStore'

// 生成临时本地 userId（无后端时使用，接入后端后删除此函数）
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
      // 注意：wx.getUserProfile 已在基础库 2.27.1 后废弃
      // 后续应改为 Button open-type="chooseAvatar" 获取头像
      const profileRes = await Taro.getUserProfile({ desc: '用于显示你的头像和昵称' })
      const { nickName, avatarUrl } = profileRes.userInfo

      // 获取 wx.login code（当前无后端，code 暂不上传；接入后端后传至 /auth/wx-login）
      await Taro.login()

      const userId = generateId()
      setUser({ userId, nickName, avatarUrl })

      onSuccess?.()
      onClose()
    } catch (e: any) {
      const isCancelled = e?.errMsg?.includes('cancel')
      if (!isCancelled) {
        console.error('[LoginSheet] handleLogin error:', e)
        Taro.showToast({ title: '登录失败，请重试', icon: 'none' })
      }
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
        <Button className={styles.loginBtn} onClick={handleLogin}>
          <Text className={styles.loginBtnText}>
            {loading ? '登录中…' : '微信一键登录'}
          </Text>
        </Button>
        <Text className={styles.agreement}>登录即同意用户协议和隐私政策</Text>
      </View>
    </>
  )
}
