// src/utils/delay.ts
// Mock 延迟工具 — 统一加 200ms 保证 Loading 动效可见

import { APP_CONFIG } from './mockEngine'

/** 返回一个 Promise，在 delayMs * MOCK_SPEED 后 resolve */
export function delay(delayMs: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, delayMs * APP_CONFIG.MOCK_SPEED)
  })
}

/**
 * 带最小可见延迟的 Mock 请求包装器
 * 确保 Loading 动效至少展示 200ms（乘以加速系数后实际约 60ms）
 */
export async function mockDelay<T>(
  fn: () => T | Promise<T>,
  minDelayMs = 200
): Promise<T> {
  const [result] = await Promise.all([Promise.resolve(fn()), delay(minDelayMs)])
  return result
}
