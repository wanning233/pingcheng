// src/app.tsx
import { PropsWithChildren } from 'react'
import Taro, { useLaunch } from '@tarojs/taro'
import './app.scss'
import { useUserStore } from './stores/useUserStore'

// 获取或生成持久化 guest code（不依赖 wx.login）
function getOrCreateGuestCode(): string {
  const KEY = 'pc_guest_code'
  try {
    const saved = Taro.getStorageSync(KEY) as string
    if (saved) return saved
  } catch (_) {}
  const code = `guest_${Math.random().toString(36).slice(2, 10)}`
  try { Taro.setStorageSync(KEY, code) } catch (_) {}
  return code
}

function App({ children }: PropsWithChildren<any>) {
  const restoreFromStorage = useUserStore(s => s.restoreFromStorage)
  const loginWithWechat = useUserStore(s => s.loginWithWechat)

  useLaunch(() => {
    console.log('[app] useLaunch fired')
    try {
      restoreFromStorage()
    } catch (e) {
      console.error('[app] restoreFromStorage error:', JSON.stringify(e))
    }
    // 每次启动都刷新 token，确保不会用到过期 token
    const code = getOrCreateGuestCode()
    console.log('[app] calling loginWithWechat, code:', code)
    loginWithWechat(code, '游客', '')
      .then(() => console.log('[app] loginWithWechat success'))
      .catch((e) =>
        console.error('[app] auto login error:', typeof e === 'object' ? JSON.stringify(e) : e)
      )
  })

  return children
}

export default App
