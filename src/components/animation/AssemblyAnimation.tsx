// src/components/animation/AssemblyAnimation.tsx
import { useState, useEffect, useRef } from 'react'
import Taro from '@tarojs/taro'
import { View, Text, Canvas } from '@tarojs/components'
import styles from './AssemblyAnimation.module.scss'
import { MockEngine, APP_CONFIG } from '../../utils/mockEngine'

const MEMBERS = [
  { id: 'linxiaxia', name: '林小夏', initial: '林' },
  { id: 'chenyu',    name: '陈宇',   initial: '陈' },
  { id: 'wangmeng',  name: '王萌',   initial: '王' },
  { id: 'liting',    name: '李婷',   initial: '李' },
]

export default function AssemblyAnimation() {
  const [lastAvatarLocked, setLastAvatarLocked] = useState(false)
  const [avatarsConverging, setAvatarsConverging] = useState(false)
  const [shockwaveActive, setShockwaveActive] = useState(false)
  const [avatarsBouncing, setAvatarsBouncing] = useState(false)
  const [titleVisible, setTitleVisible] = useState(false)
  const [subtitleVisible, setSubtitleVisible] = useState(false)
  const [pageExiting, setPageExiting] = useState(false)
  const engineRef = useRef<MockEngine | null>(null)

  const drawConnectionLines = () => {
    const avatarIds = ['assembly-avatar-0', 'assembly-avatar-1', 'assembly-avatar-2', 'assembly-avatar-3']
    const positions: { x: number; y: number }[] = []
    let pendingCount = avatarIds.length

    avatarIds.forEach((id, index) => {
      Taro.createSelectorQuery()
        .select(`#${id}`)
        .boundingClientRect((rect: any) => {
          if (rect) {
            positions[index] = {
              x: rect.left + rect.width / 2,
              y: rect.top + rect.height / 2,
            }
          }
          pendingCount -= 1
          if (pendingCount === 0) {
            renderLines(positions)
          }
        })
        .exec()
    })
  }

  const renderLines = (positions: { x: number; y: number }[]) => {
    if (positions.length < 4) return
    const ctx = Taro.createCanvasContext('assembly-canvas')
    const pairs: [number, number][] = [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]]

    pairs.forEach(([i, j], pairIdx) => {
      setTimeout(() => {
        const pi = positions[i]
        const pj = positions[j]
        if (!pi || !pj) return

        const grad = ctx.createLinearGradient(pi.x, pi.y, pj.x, pj.y)
        grad.addColorStop(0, 'rgba(255,92,43,0.9)')
        grad.addColorStop(1, 'rgba(77,110,255,0.9)')
        ctx.setStrokeStyle(grad as any)
        ctx.setLineWidth(1.5)
        ctx.beginPath()
        ctx.moveTo(pi.x, pi.y)
        ctx.lineTo(pj.x, pj.y)
        ctx.stroke()
        ctx.draw(true)  // keepReserve=true 保留上一帧
      }, pairIdx * 80)
    })
  }

  useEffect(() => {
    const engine = new MockEngine({ MOCK_SPEED: APP_CONFIG.MOCK_SPEED })
    engineRef.current = engine

    // 0ms: 最后一人锁定 — 边框白→绿，scale 弹跳
    setLastAvatarLocked(true)

    // 200ms: 所有头像向中心微移 + Canvas 连接线
    engine.schedule(() => {
      setAvatarsConverging(true)
      drawConnectionLines()
    }, 200)

    // 600ms: 爆发帧 — 白色冲击波 + 头像弹跳
    engine.schedule(() => {
      setShockwaveActive(true)
      setAvatarsBouncing(true)
      // 150ms 后冲击波消失（用 setTimeout 兜底，不依赖 animationend）
      setTimeout(() => setShockwaveActive(false), 150)
      setTimeout(() => setAvatarsBouncing(false), 400)
    }, 600)

    // 750ms: "4人集结完成！"浮现
    engine.schedule(() => setTitleVisible(true), 750)

    // 1050ms: 副文字打字机
    engine.schedule(() => setSubtitleVisible(true), 1050)

    // 1650ms: 页面吸入 + 跳转
    engine.schedule(() => {
      setPageExiting(true)
      // 300ms 后跳转（等吸入动效完成）
      setTimeout(() => {
        Taro.redirectTo({ url: '/pages/route-compare/index' })
      }, 300)
    }, 1650)

    return () => { engine.destroy() }
  }, [])

  return (
    <View className={`${styles.scene} ${pageExiting ? styles.sceneExiting : ''}`}>
      {/* Canvas 连接线层（置于头像下方） */}
      <Canvas
        id="assembly-canvas"
        canvasId="assembly-canvas"
        className={styles.canvas}
      />

      {/* 冲击波圆环 */}
      {shockwaveActive && (
        <View className={styles.shockwave} />
      )}

      {/* 四个头像，2x2 网格排列 */}
      <View className={styles.avatarGrid}>
        {MEMBERS.map((member, idx) => (
          <View
            key={member.id}
            id={`assembly-avatar-${idx}`}
            className={[
              styles.avatarItem,
              idx === MEMBERS.length - 1 && lastAvatarLocked ? styles.avatarLocked : '',
              avatarsConverging ? styles.avatarConverging : '',
              avatarsBouncing ? styles.avatarBouncing : '',
            ].filter(Boolean).join(' ')}
          >
            <View className={styles.avatarCircle}>
              <Text className={styles.avatarInitial}>{member.initial}</Text>
            </View>
            <Text className={styles.avatarName}>{member.name}</Text>
          </View>
        ))}
      </View>

      {/* 标题：4人集结完成！ */}
      <View className={`${styles.titleArea} ${titleVisible ? styles.titleAreaVisible : ''}`}>
        <Text className={styles.titleText}>4人集结完成！</Text>
      </View>

      {/* 副文字打字机 */}
      <View className={`${styles.subtitleArea} ${subtitleVisible ? styles.subtitleAreaVisible : ''}`}>
        <Text className={styles.subtitleText}>
          上海五角场出发 · 4人成行 · 3条路线已生成
        </Text>
      </View>
    </View>
  )
}
