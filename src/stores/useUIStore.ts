// src/stores/useUIStore.ts
import { create } from 'zustand'

interface UIState {
  isLoading: boolean
  loadingText: string
  setLoading: (text?: string) => void
  clearLoading: () => void
}

export const useUIStore = create<UIState>((set) => ({
  isLoading: false,
  loadingText: '',
  setLoading: (text = '加载中…') => set({ isLoading: true, loadingText: text }),
  clearLoading: () => set({ isLoading: false, loadingText: '' }),
}))
