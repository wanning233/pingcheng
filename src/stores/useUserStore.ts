// src/stores/useUserStore.ts
import { create } from 'zustand'
import Taro from '@tarojs/taro'

const STORAGE_KEY = 'pc_user'

interface UserInfo {
  userId: string
  nickName: string
  avatarUrl: string
  loginTime: number
}

interface UserState {
  userId: string
  nickName: string
  avatarUrl: string
  isLoggedIn: boolean
  setUser: (info: Omit<UserInfo, 'loginTime'>) => void
  restoreFromStorage: () => void
  clearUser: () => void
}

export const useUserStore = create<UserState>((set) => ({
  userId: '',
  nickName: '',
  avatarUrl: '',
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

  restoreFromStorage: () => {
    try {
      const data = Taro.getStorageSync(STORAGE_KEY) as UserInfo | ''
      const EXPIRE_MS = 30 * 24 * 60 * 60 * 1000
      if (data && data.userId && Date.now() - data.loginTime < EXPIRE_MS) {
        set({
          userId: data.userId,
          nickName: data.nickName,
          avatarUrl: data.avatarUrl,
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
    set({ userId: '', nickName: '', avatarUrl: '', isLoggedIn: false })
  },
}))
