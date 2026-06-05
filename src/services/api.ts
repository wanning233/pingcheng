// src/services/api.ts
// 集中管理所有后端 API 调用

// ====================================================
// [MISSING API] 以下接口前端需要但后端尚未提供：
// 1. GET /route-diff - 路线对比分析（PlanB换店决策）
//    需要返回: RouteDiff { currentStop, planBStop, gains, costs, aiRecommendation }
// 2. GET /stops/photo - 站点照片详情
//    需要返回: StopWithPhoto[]（带图片URL列表）
// ====================================================

import { get, post } from './request'
import { Question } from './mock/questions'

// 后端 snake_case 路线/站点结构
interface BackendStop {
  id: string
  arrive_time: string
  stay_minutes: number
  completed: boolean
  queue_risk: 'low' | 'medium' | 'high'
  walk_distance_m: number
  plan_b: unknown[]
  ugc_reasons: string[]
  poi: {
    id: string
    name: string
    location: { lat: number; lng: number }
    category: string
    tags: string[]
  }
}

interface BackendRoute {
  id: string
  name: string
  budget_per_person: number
  total_minutes: number
  walk_distance_m: number
  queue_risk: 'low' | 'medium' | 'high'
  energy_level: string
  highlights: string[]
  stops: BackendStop[]
}

interface BackendPlanResponse {
  trip_id: string
  invite_code: string
  routes: BackendRoute[]
}

// 过滤掉 OSM 原始 key（含下划线）和已知内部标签
const JUNK_TAGS = new Set(['公开数据', '五角场', '上海', '公开'])
function cleanTags(tags: string[]): string[] {
  return (tags ?? []).filter(t => !t.includes('_') && !JUNK_TAGS.has(t))
}

function mapStop(s: BackendStop): RouteStop {
  return {
    id: s.id,
    name: s.poi?.name ?? '',
    category: s.poi?.category ?? '',
    coord: s.poi?.location ?? { lat: 0, lng: 0 },
    arriveTime: s.arrive_time ?? '',
    stayMinutes: s.stay_minutes ?? 0,
    completed: s.completed ?? false,
    queueRisk: s.queue_risk ?? 'low',
    estimatedQueueMinutes: 0,
    planB: s.plan_b ?? [],
    tags: cleanTags(s.poi?.tags ?? []),
    ugcHighlight: (s.ugc_reasons ?? [])[0] ?? '',
  }
}

function mapRoute(r: BackendRoute): TripRoute {
  return {
    id: r.id,
    name: r.name,
    budgetPerPerson: r.budget_per_person,
    totalMinutes: r.total_minutes,
    walkDistanceM: r.walk_distance_m,
    queueRisk: r.queue_risk,
    energyLevel: r.energy_level,
    highlights: r.highlights ?? [],
    stops: (r.stops ?? []).map(mapStop),
  }
}

// ---- 类型定义 ----

export interface CreateTripRequest {
  area: string
  peopleCount: number
  endTime: string
  budgetPerPerson: number
  sceneTags: string[]
  categories: string[]
  aiPrompt?: string
}

export interface RouteStop {
  id: string
  name: string
  category: string
  coord: { lat: number; lng: number }
  arriveTime: string
  stayMinutes: number
  completed: boolean
  queueRisk: 'low' | 'medium' | 'high'
  estimatedQueueMinutes: number
  planB: unknown[]
  tags: string[]
  ugcHighlight: string
}

export interface TripRoute {
  id: string
  name: string
  budgetPerPerson: number
  totalMinutes: number
  walkDistanceM: number
  queueRisk?: 'low' | 'medium' | 'high'
  energyLevel?: string
  isRecommended?: boolean
  isAiRecommended?: boolean
  highlights: string[]
  stops: RouteStop[]
}

export interface CreateTripResponse {
  trip_id: string
  invite_code: string
  routes: TripRoute[]
}

export type MemberStatus = 'pending' | 'filling' | 'done'

export interface WaitingRoomMember {
  user_id: string
  nickname: string
  status: MemberStatus
}

export interface WaitingRoomStatus {
  trip_id: string
  all_done: boolean
  routes_ready: boolean
  people_count: number
  selected_route_id: string
  members: WaitingRoomMember[]
}

export interface TripMembersResponse {
  members: {
    id: string
    name: string
    avatar: string
    status: 'pending' | 'filling' | 'done'
  }[]
  group_profile: Record<string, unknown>
}

// ---- 偏好问卷 ----

export async function getPreferenceQuestions(): Promise<Question[]> {
  const raw = await get<Array<{ id: string; question: string; options: Question['options']; multi?: boolean }>>('/api/v1/preferences/questions')
  return raw.map(q => ({
    id: q.id,
    text: q.question,
    multi: q.multi ?? false,
    options: q.options,
  }))
}

// ---- 行程 ----

function buildTripText(req: CreateTripRequest): string {
  const parts: string[] = []
  if (req.area) parts.push(req.area)
  if (req.peopleCount) parts.push(`${req.peopleCount}人`)
  if (req.sceneTags?.length) parts.push(req.sceneTags.join('、'))
  if (req.categories?.length) parts.push(req.categories.join('、'))
  if (req.budgetPerPerson) parts.push(`人均${req.budgetPerPerson}元以内`)
  if (req.endTime) parts.push(`${req.endTime}前结束`)
  if (req.aiPrompt) parts.push(req.aiPrompt)
  return parts.join('，')
}

async function getCreatorUserId(): Promise<string> {
  try {
    const { useUserStore } = await import('@/stores/useUserStore')
    const uid = useUserStore.getState().userId
    if (uid) return uid
  } catch (_) { /* ignore */ }
  return 'u_guest'
}

export async function createTrip(req: CreateTripRequest): Promise<CreateTripResponse> {
  const creator_user_id = await getCreatorUserId()
  const res = await post<BackendPlanResponse>('/api/v1/trips', {
    creator_user_id,
    text: buildTripText(req),
    location: { lat: 31.3046, lng: 121.5146, city: '上海' },
    plan_now: false,
  })
  return { trip_id: res.trip_id, invite_code: res.invite_code, routes: (res.routes ?? []).map(mapRoute) }
}

// ---- 多人行程偏好提交（真实接口） ----

export interface MemberPreference {
  member_id: string
  nickname: string
  budget_max: number
  likes: string[]
  avoid: string[]
  activities: string[]
  taste_level: string
  walk_tolerance: string
  end_time: string
}

export async function submitMemberPreferences(
  tripId: string,
  answers: Record<string, string[]>,
  customInputs: Record<string, string>,
): Promise<{ member_id: string }> {
  const { mapAnswersToPreference } = await import('./mock/questions')
  const { useSessionStore } = await import('@/stores/useSessionStore')
  const { useUserStore } = await import('@/stores/useUserStore')
  const session = useSessionStore.getState()
  const userStore = useUserStore.getState()
  const preference = mapAnswersToPreference(answers, customInputs, session)
  const res = await post<{ member_id: string }>(`/api/v1/trips/${tripId}/members`, {
    member_id: session.memberId || '',
    user_id: userStore.userId || '',
    nickname: userStore.nickName || '游客',
    preference,
  })
  // 保存后端分配的 member_id，供后续接口使用
  if (res.member_id) useSessionStore.getState().setSession({ memberId: res.member_id })
  return res
}

export async function getTripWaitingStatus(tripId: string): Promise<WaitingRoomStatus> {
  return get<WaitingRoomStatus>(`/api/v1/trips/${tripId}/waiting-status`)
}

export interface InstantPlanResult {
  tripId: string
  inviteCode: string
  routes: TripRoute[]
}

export async function createInstantPlan(req: CreateTripRequest): Promise<InstantPlanResult> {
  console.log('[createInstantPlan] called, area:', req.area)
  const creator_user_id = await getCreatorUserId()
  const res = await post<BackendPlanResponse>('/api/v1/trips/instant-plan', {
    creator_user_id,
    text: buildTripText(req),
    location: { lat: 31.3046, lng: 121.5146, city: '上海' },
    nickname: '游客',
    preference: {
      taste_level: 'any',
      walk_tolerance: 'medium',
    },
  })
  return {
    tripId: res.trip_id,
    inviteCode: res.invite_code,
    routes: (res.routes ?? []).map(mapRoute),
  }
}

export async function getTrip(tripId: string): Promise<unknown> {
  return get(`/api/v1/trips/${tripId}`)
}

export interface TripByInviteResponse {
  trip_id: string
  invite_code: string
  creator: { user_id: string; nickname: string; avatar: string }
  area: string
  city: string
  joined_count: number
  people_count: number
  status: 'active' | 'expired' | 'closed'
}

export async function getTripByInviteCode(inviteCode: string): Promise<TripByInviteResponse> {
  return get<TripByInviteResponse>(`/api/v1/trips/by-invite/${inviteCode}`)
}

export interface JoinTripBody {
  nickname: string
  preference?: Partial<MemberPreference>
}

export interface JoinTripResponse {
  trip_id: string
  invite_code: string
  member_id: string
  member_count: number
}

export async function joinTripByInviteCode(
  inviteCode: string,
  body: JoinTripBody,
): Promise<JoinTripResponse> {
  return post<JoinTripResponse>(`/api/v1/trips/by-invite/${inviteCode}/join`, {
    nickname: body.nickname,
    preference: body.preference ?? {},
  })
}

export async function planTrip(tripId: string, force = false): Promise<unknown> {
  return post(`/api/v1/trips/${tripId}/plan`, { force })
}

export async function getTripMembers(tripId: string): Promise<TripMembersResponse> {
  return get<TripMembersResponse>(`/api/v1/trips/${tripId}/members`)
}

// ---- 用户行程列表 ----

export interface UserTripSummary {
  trip_id: string
  invite_code: string
  role: string
  status: string
  area: string
  city: string
  display_title: string
  member_count: number
  route_count: number
  selected_route_id: string
  next_action: string
  created_at: number
  updated_at: number
}

export interface SentInviteSummary {
  trip_id: string
  invite_code: string
  status: string
  area: string
  city: string
  display_title: string
  member_count: number
  route_count: number
  selected_route_id: string
  next_action: string
  share_path: string
  created_at: number
  updated_at: number
}

export async function listUserTrips(userId: string, role?: string): Promise<UserTripSummary[]> {
  const res = await get<{ user_id: string; trips: UserTripSummary[] }>(
    `/api/v1/users/${userId}/trips`,
    role ? { role } : undefined,
  )
  return res.trips ?? []
}

export async function listSentInvites(userId: string): Promise<SentInviteSummary[]> {
  const res = await get<{ user_id: string; invites: SentInviteSummary[] }>(
    `/api/v1/users/${userId}/sent-invites`,
  )
  return res.invites ?? []
}

export async function getTripRoutes(tripId: string): Promise<TripRoute[]> {
  const res = await get<{ routes: BackendRoute[] }>(`/api/v1/trips/${tripId}/routes`)
  return (res.routes ?? []).map(mapRoute)
}

export async function getTripRoute(tripId: string, routeId: string): Promise<TripRoute> {
  const res = await get<{ route: TripRoute }>(`/api/v1/trips/${tripId}/routes/${routeId}`)
  return res.route
}

export async function getTripRouteVotes(tripId: string): Promise<unknown> {
  return get(`/api/v1/trips/${tripId}/routes/votes`)
}

export async function selectTripRoute(tripId: string, routeId: string): Promise<unknown> {
  return post(`/api/v1/trips/${tripId}/routes/${routeId}/select`)
}

export async function upsertTripMember(tripId: string, memberData: Record<string, unknown>): Promise<unknown> {
  return post(`/api/v1/trips/${tripId}/members`, memberData)
}

// ---- 前端偏好排序（本地逻辑，无后端接口） ----
// 根据用户偏好对路线列表重新排序，标记第一条为 AI 推荐

const preferMap: Record<string, string[]> = {
  朋友聚会: ['route-photo', 'route-easy', 'route-budget'],
  情侣约会: ['route-easy', 'route-photo', 'route-budget'],
  亲子出行: ['route-easy', 'route-budget', 'route-photo'],
  少排队:   ['route-easy', 'route-budget', 'route-photo'],
  food:      ['route-photo', 'route-easy', 'route-budget'],
  camera:    ['route-photo', 'route-easy', 'route-budget'],
  cafe:      ['route-easy', 'route-photo', 'route-budget'],
  culture:   ['route-budget', 'route-easy', 'route-photo'],
}

export function sortRoutesByPreference(
  routes: TripRoute[],
  params: { sceneTags: string[]; categories: string[]; budgetPerPerson: number },
): TripRoute[] {
  const { sceneTags, categories, budgetPerPerson } = params
  const scoreMap: Record<string, number> = {}
  routes.forEach(r => { scoreMap[r.id] = 0 })

  const keys = [...sceneTags, ...categories]
  keys.forEach(key => {
    const order = preferMap[key]
    if (order) {
      order.forEach((id, i) => {
        if (scoreMap[id] !== undefined) scoreMap[id] += (3 - i)
      })
    }
  })

  if (budgetPerPerson < 100) {
    routes.forEach(r => {
      if (r.budgetPerPerson < 100) scoreMap[r.id] += 3
    })
  }

  const sorted = [...routes].sort((a, b) => (scoreMap[b.id] ?? 0) - (scoreMap[a.id] ?? 0))
  return sorted.map((r, i) => ({ ...r, isAiRecommended: i === 0 }))
}

// ---- Replan（改路线）----

export interface ReplanDiff {
  summary: string
  bullets: string[]
  saved_minutes: number
  budget_change: number
  walk_distance_change_m: number
  replaced: Array<{ from_name: string; to_name: string; reason: string }>
  benefits: Array<{ label: string; value: string }>
  tradeoffs: Array<{ label: string; value: string }>
}

export interface ReplanResult {
  newRouteId: string
  newRoute: TripRoute
  diff: ReplanDiff
}

export async function replanTrip(
  tripId: string,
  params: {
    current_route_id: string
    text: string
    location: { lat: number; lng: number }
    current_stop_id?: string
    current_time?: string
  },
): Promise<ReplanResult> {
  const res = await post<any>(`/api/v1/trips/${tripId}/replan`, params)
  return {
    newRouteId: res.new_route_id,
    newRoute: mapRoute(res.route),
    diff: res.diff as ReplanDiff,
  }
}

// ---- [MISSING API] 路线对比分析 ----
export async function getRouteDiff(params?: Record<string, unknown>): Promise<unknown> {
  return get('/route-diff', params)
}

// ---- [MISSING API] 站点照片详情 ----
// 后端尚未提供 GET /stops/photo，使用 mock fallback（stops-photo.json）
// 当后端实现后，替换为: return get('/api/v1/stops/photo', params)
export async function getStopsPhoto(params?: Record<string, unknown>): Promise<unknown> {
  // [MISSING API] GET /stops/photo - 站点照片详情
  return get('/stops/photo', params)
}
