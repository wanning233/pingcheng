// src/utils/rect.ts
// 获取元素位置信息 — 共享元素转场使用
// 基于 Taro createSelectorQuery，返回 Promise<BoundingClientRect>

import Taro from '@tarojs/taro'

export interface Rect {
  left: number
  top: number
  right: number
  bottom: number
  width: number
  height: number
}

/**
 * 查询指定选择器元素的位置和尺寸
 * 用于「对比→详情」共享元素转场中记录卡片 rect
 *
 * @param selector CSS 选择器，如 '.route-card-photo'
 * @param component 组件实例（在组件内调用时传 this，页面内传 undefined）
 */
export function getRect(selector: string, component?: unknown): Promise<Rect> {
  return new Promise((resolve, reject) => {
    const query = component
      ? Taro.createSelectorQuery().in(component as any)
      : Taro.createSelectorQuery()

    query
      .select(selector)
      .boundingClientRect((rect) => {
        if (!rect) {
          reject(new Error(`Element not found: ${selector}`))
          return
        }
        resolve(rect as unknown as Rect)
      })
      .exec()
  })
}

/**
 * 查询多个元素的位置信息（批量版）
 */
export function getRects(selector: string, component?: unknown): Promise<Rect[]> {
  return new Promise((resolve, reject) => {
    const query = component
      ? Taro.createSelectorQuery().in(component as any)
      : Taro.createSelectorQuery()

    query
      .selectAll(selector)
      .boundingClientRect((rects) => {
        if (!rects || !Array.isArray(rects)) {
          reject(new Error(`Elements not found: ${selector}`))
          return
        }
        resolve(rects as unknown as Rect[])
      })
      .exec()
  })
}
