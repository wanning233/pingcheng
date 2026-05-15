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
    Taro.setStorageSync(STORAGE_KEY, data)
    set({ ...info, isLoggedIn: true })
  },

  restoreFromStorage: () => {
    try {
      const data = Taro.getStorageSync(STORAGE_KEY) as UserInfo | ''
      if (data && data.userId) {
        set({
          userId: data.userId,
          nickName: data.nickName,
          avatarUrl: data.avatarUrl,
          isLoggedIn: true,
        })
      }
    } catch (_) {}
  },

  clearUser: () => {
    Taro.removeStorageSync(STORAGE_KEY)
    set({ userId: '', nickName: '', avatarUrl: '', isLoggedIn: false })
  },
}))
