// src/stores/useUserStore.ts
import { create } from 'zustand'
import Taro from '@tarojs/taro'
import { post } from '@/services/request'

const STORAGE_KEY = 'pc_user'

interface UserInfo {
  userId: string
  nickName: string
  avatarUrl: string
  token: string
  loginTime: number
}

interface WechatLoginResponse {
  user_id: string
  token: string
  expires_at: string
  user_info: {
    nick_name: string
    avatar_url: string
  }
}

interface UserState {
  userId: string
  nickName: string
  avatarUrl: string
  token: string
  isLoggedIn: boolean
  setUser: (info: Omit<UserInfo, 'loginTime'>) => void
  loginWithWechat: (code: string, nickName: string, avatarUrl: string) => Promise<void>
  restoreFromStorage: () => void
  clearUser: () => void
}

export const useUserStore = create<UserState>((set) => ({
  userId: '',
  nickName: '',
  avatarUrl: '',
  token: '',
  isLoggedIn: false,

  setUser: (info) => {
    const data: UserInfo = { ...info, loginTime: Date.now() }
    try {
      Taro.setStorageSync(STORAGE_KEY, data)
    } catch (e) {
      console.error('[useUserStore] setUser storage error:', e)
    }
    set({ ...info, isLoggedIn: true })
  },

  loginWithWechat: async (code, nickName, avatarUrl) => {
    const res = await post<WechatLoginResponse>('/api/v1/auth/wechat', {
      code,
      user_info: { nick_name: nickName, avatar_url: avatarUrl },
    })
    const info: Omit<UserInfo, 'loginTime'> = {
      userId: res.user_id,
      nickName: res.user_info.nick_name,
      avatarUrl: res.user_info.avatar_url,
      token: res.token,
    }
    const data: UserInfo = { ...info, loginTime: Date.now() }
    try {
      Taro.setStorageSync(STORAGE_KEY, data)
    } catch (e) {
      console.error('[useUserStore] loginWithWechat storage error:', e)
    }
    set({ ...info, isLoggedIn: true })
  },

  restoreFromStorage: () => {
    try {
      const data = Taro.getStorageSync(STORAGE_KEY) as UserInfo | ''
      const EXPIRE_MS = 30 * 24 * 60 * 60 * 1000
      if (data && data.userId && Date.now() - data.loginTime < EXPIRE_MS) {
        set({
          userId: data.userId,
          nickName: data.nickName,
          avatarUrl: data.avatarUrl,
          token: data.token ?? '',
          isLoggedIn: true,
        })
      }
    } catch (e) {
      console.error('[useUserStore] restoreFromStorage error:', e)
    }
  },

  clearUser: () => {
    try {
      Taro.removeStorageSync(STORAGE_KEY)
    } catch (e) {
      console.error('[useUserStore] clearUser storage error:', e)
    }
    set({ userId: '', nickName: '', avatarUrl: '', token: '', isLoggedIn: false })
  },
}))
