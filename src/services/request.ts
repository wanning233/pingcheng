// src/services/request.ts
// 统一请求封装 — NODE_ENV 切换 Mock/真实请求

import Taro from '@tarojs/taro'
import { mockDelay } from '@/utils/delay'

// ---- Mock 数据懒加载 ----
// 仅保留后端尚未提供接口的 fallback mock
const mockLoaders: Record<string, () => Promise<unknown>> = {
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

const BASE_URL = 'http://10.178.203.1:18080'

/**
 * 核心请求函数
 * - 自动从 useUserStore 注入 Bearer token
 * - 缺失后端接口的路径（/route-diff, /stops/photo）fallback 到 mock 数据
 */
async function request<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = 'GET', data, header = {} } = options
  console.log('[request] called:', method, path)

  // Mock fallback（仅限缺失后端接口）
  if (mockLoaders[path]) {
    const result = await mockDelay(() => mockLoaders[path](), 200)
    return result as T
  }

  // 从 useUserStore 读取 token，注入 Authorization header
  // 使用动态 import 避免循环依赖
  let authHeader: Record<string, string> = {}
  try {
    const { useUserStore } = await import('@/stores/useUserStore')
    const token = useUserStore.getState().token
    if (token) {
      authHeader = { Authorization: `Bearer ${token}` }
    }
  } catch (e) {
    // store 未初始化时忽略
  }

  // 真实请求
  console.log('[request] Taro.request →', `${BASE_URL}${path}`)
  const response = await Taro.request<ApiResponse<T>>({
    url: `${BASE_URL}${path}`,
    method,
    data,
    header: {
      'Content-Type': 'application/json',
      ...authHeader,
      ...header,
    },
  })

  console.log('[request] response:', response.statusCode, path, response.data?.code)

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
