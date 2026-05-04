// src/components/business/TransitionOverlay/index.tsx
// Visual deception shared element transition: card expands to fullscreen
import { View } from '@tarojs/components'
import React, { useEffect, useState, useRef } from 'react'
import { useRouteStore } from '@/stores/useRouteStore'
import styles from './index.module.scss'

interface TransitionOverlayProps {
  onDone: () => void
}

export default function TransitionOverlay({ onDone }: TransitionOverlayProps) {
  const transitionRect = useRouteStore((s) => s.transitionRect)
  const [expanded, setExpanded] = useState(false)
  const doneCalledRef = useRef(false)

  useEffect(() => {
    if (!transitionRect) {
      // No rect → skip transition, call onDone immediately
      if (!doneCalledRef.current) {
        doneCalledRef.current = true
        onDone()
      }
      return
    }

    // Double rAF to ensure browser has painted the initial position before transitioning
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setExpanded(true)
      })
    })

    // After 470ms hide overlay and call onDone
    const t = setTimeout(() => {
      if (!doneCalledRef.current) {
        doneCalledRef.current = true
        onDone()
      }
    }, 470)

    return () => clearTimeout(t)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (!transitionRect) return null

  const initialStyle = {
    top: `${transitionRect.top}px`,
    left: `${transitionRect.left}px`,
    width: `${transitionRect.width}px`,
    height: `${transitionRect.height}px`,
    borderRadius: '20px',
  }

  const expandedStyle = {
    top: '0px',
    left: '0px',
    width: '100vw',
    height: '100vh',
    borderRadius: '0px',
  }

  const currentStyle = expanded ? expandedStyle : initialStyle

  return (
    <View
      className={styles.overlay}
      style={{
        ...currentStyle,
        transition: expanded
          ? 'top 420ms cubic-bezier(0.4,0,0.2,1), left 420ms cubic-bezier(0.4,0,0.2,1), width 420ms cubic-bezier(0.4,0,0.2,1), height 420ms cubic-bezier(0.4,0,0.2,1), border-radius 420ms cubic-bezier(0.4,0,0.2,1)'
          : 'none',
      } as any}
    />
  )
}
