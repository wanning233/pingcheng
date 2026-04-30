// src/services/request.ts
// 统一请求封装 — NODE_ENV 切换 Mock/真实请求

import Taro from '@tarojs/taro'
import { mockDelay } from '@/utils/delay'

// ---- Mock 数据懒加载 ----
const mockLoaders: Record<string, () => Promise<unknown>> = {
  '/routes':     () => import('./mock/routes.json').then((m) => m.default),
  '/members':    () => import('./mock/members.json').then((m) => m.default),
  '/route-diff': () => import('./mock/routeDiff.json').then((m) => m.default),
  '/stops/photo': () => import('./mock/stops-photo.json').then((m) => m.default),
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

interface RequestOptions {
  method?: HttpMethod
  data?: Record<string, unknown>
  header?: Record<string, string>
}

interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

const BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://api.pincheng.app'
  : 'https://dev-api.pincheng.app'

/**
 * 核心请求函数
 * - development 环境：优先命中 Mock 数据（带 minDelay）
 * - production 环境：发起真实 Taro.request
 */
async function request<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = 'GET', data, header = {} } = options

  // Mock 模式（开发环境 + 存在对应 mock 数据）
  if (process.env.NODE_ENV !== 'production' && mockLoaders[path]) {
    const result = await mockDelay(() => mockLoaders[path](), 200)
    return result as T
  }

  // 真实请求
  const response = await Taro.request<ApiResponse<T>>({
    url: `${BASE_URL}${path}`,
    method,
    data,
    header: {
      'Content-Type': 'application/json',
      ...header,
    },
  })

  if (response.statusCode !== 200) {
    throw new Error(`HTTP ${response.statusCode}: ${path}`)
  }

  if (response.data.code !== 0) {
    throw new Error(response.data.message || '请求失败')
  }

  return response.data.data
}

// ---- 语义化导出 ----

export const get = <T>(path: string, params?: Record<string, unknown>) =>
  request<T>(path, { method: 'GET', data: params })

export const post = <T>(path: string, body?: Record<string, unknown>) =>
  request<T>(path, { method: 'POST', data: body })

export default request
