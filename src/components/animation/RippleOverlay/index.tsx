// src/components/animation/RippleOverlay/index.tsx
// Orange ripple that expands from FAB touch point to fill the screen
import { View } from '@tarojs/components'
import React, { useEffect, useState } from 'react'
import styles from './index.module.scss'

interface RippleOverlayProps {
  originX: number
  originY: number
  onComplete: () => void
}

export default function RippleOverlay({ originX, originY, onComplete }: RippleOverlayProps) {
  const [expanded, setExpanded] = useState(false)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    // Double rAF to ensure initial state is painted before transitioning
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setExpanded(true)
      })
    })

    // After 400ms call onComplete (navigate to assistant)
    const t1 = setTimeout(() => {
      onComplete()
    }, 400)

    // After 600ms start fading out
    const t2 = setTimeout(() => {
      setFading(true)
    }, 600)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <View
      className={styles.ripple}
      style={{
        top: `${originY}px`,
        left: `${originX}px`,
        transform: `translate(-50%, -50%) scale(${expanded ? 30 : 0})`,
        opacity: fading ? 0 : 1,
        transition: expanded
          ? `transform 600ms cubic-bezier(0.4,0,1,1), opacity 300ms ease ${fading ? '0ms' : '600ms'}`
          : 'none',
      } as any}
    />
  )
}
