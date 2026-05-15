// src/app.tsx
import { PropsWithChildren } from 'react'
import { useLaunch } from '@tarojs/taro'
import './app.scss'
import { useUserStore } from './stores/useUserStore'

function App({ children }: PropsWithChildren<any>) {
  const restoreFromStorage = useUserStore(s => s.restoreFromStorage)

  useLaunch(() => {
    restoreFromStorage()
  })

  return children
}

export default App
