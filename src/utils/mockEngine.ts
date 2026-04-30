// src/utils/mockEngine.ts
// Demo 演示 Mock 引擎 — 支持3倍速加速

export const APP_CONFIG = {
  /** 演示加速系数：0.3 = 3倍速，1.0 = 正常速度 */
  MOCK_SPEED: 0.3,
}

/**
 * MockEngine: 统一管理 Demo 演示中的所有定时器
 * 调用 schedule 替代 setTimeout，destroy 清理所有定时器
 */
export class MockEngine {
  private timers: ReturnType<typeof setTimeout>[] = []

  constructor(private config = APP_CONFIG) {}

  /**
   * 以加速系数调度一个回调
   * @param fn 要执行的回调
   * @param delayMs 原始延迟（毫秒），会乘以 MOCK_SPEED
   */
  schedule(fn: () => void, delayMs: number): void {
    const actualDelay = delayMs * this.config.MOCK_SPEED
    const t = setTimeout(fn, actualDelay)
    this.timers.push(t)
  }

  /**
   * 清除所有已调度但未执行的定时器
   * 在页面 onUnload 或 useEffect cleanup 中调用
   */
  destroy(): void {
    this.timers.forEach(clearTimeout)
    this.timers = []
  }
}

/** 全局共享演示引擎实例（页面间共享时序） */
export const demoEngine = new MockEngine()
