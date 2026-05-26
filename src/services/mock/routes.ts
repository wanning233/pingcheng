// src/services/mock/routes.ts
export const mockRoutes = [
  {
    id: 'route-1',
    name: '少排队轻松线',
    budgetPerPerson: 118,
    totalMinutes: 270,   // 4.5h
    walkDistanceM: 800,
    highlights: ['低排队', '轻松漫步', '网红咖啡', '草坪拍照'],
    isAiRecommended: false,
    stops: [
      { id: 's1', name: '弄堂里的湖南菜', stayMinutes: 90, tags: ['辣', '本帮'] },
      { id: 's2', name: '创智天地草坪', stayMinutes: 60, tags: ['拍照', '打卡'] },
      { id: 's3', name: '%Arabica咖啡', stayMinutes: 40, tags: ['网红', '拍照'] },
    ],
  },
  {
    id: 'route-2',
    name: '高性价比省钱线',
    budgetPerPerson: 95,
    totalMinutes: 240,   // 4h
    walkDistanceM: 1200,
    highlights: ['省钱', '性价比', '复旦校园', '本帮菜'],
    isAiRecommended: false,
    stops: [
      { id: 's4', name: '四平路本帮菜', stayMinutes: 80, tags: ['本帮', '经济实惠'] },
      { id: 's5', name: '复旦校园随拍', stayMinutes: 70, tags: ['校园', '拍照'] },
      { id: 's6', name: '沪上阿姨', stayMinutes: 30, tags: ['奶茶', '实惠'] },
    ],
  },
  {
    id: 'route-3',
    name: '拍照出片线',
    budgetPerPerson: 132,
    totalMinutes: 300,   // 5h
    walkDistanceM: 1500,
    highlights: ['出片', '网红打卡', '鸳鸯锅', 'AI推荐'],
    isAiRecommended: true,
    stops: [
      { id: 's7', name: '网红鸳鸯锅', stayMinutes: 100, tags: ['鸳鸯锅', '拍照'] },
      { id: 's8', name: '大学路网红墙', stayMinutes: 60, tags: ['网红', '出片'] },
      { id: 's9', name: 'SeeSaw咖啡', stayMinutes: 50, tags: ['精品咖啡', '打卡'] },
    ],
  },
]

// 根据用户偏好对路线排序，模拟 AI 个性化推荐
export function getPersonalizedRoutes(params: {
  sceneTags: string[]
  categories: string[]
  budgetPerPerson: number
}) {
  const { sceneTags, categories, budgetPerPerson } = params

  // 场景/主题 → 偏好路线 id 映射
  const preferMap: Record<string, string[]> = {
    朋友聚会: ['route-3', 'route-1', 'route-2'],
    情侣约会: ['route-1', 'route-3', 'route-2'],
    亲子出行: ['route-1', 'route-2', 'route-3'],
    少排队:   ['route-1', 'route-2', 'route-3'],
    // categories
    food:      ['route-3', 'route-1', 'route-2'],
    game:      ['route-3', 'route-1', 'route-2'],
    nightlife: ['route-3', 'route-1', 'route-2'],
    camera:    ['route-3', 'route-1', 'route-2'],
    cafe:      ['route-1', 'route-3', 'route-2'],
    culture:   ['route-2', 'route-1', 'route-3'],
    park:      ['route-1', 'route-2', 'route-3'],
    outdoor:   ['route-1', 'route-2', 'route-3'],
    family:    ['route-2', 'route-1', 'route-3'],
    shopping:  ['route-3', 'route-2', 'route-1'],
  }

  // 计算每条路线的偏好得分（分数越高越靠前）
  const scoreMap: Record<string, number> = { 'route-1': 0, 'route-2': 0, 'route-3': 0 }
  const keys = [...sceneTags, ...categories]
  keys.forEach(key => {
    const order = preferMap[key]
    if (order) {
      order.forEach((id, i) => {
        scoreMap[id] = (scoreMap[id] ?? 0) + (3 - i)
      })
    }
  })

  // 预算过滤：预算偏低时提高 route-2（省钱线）得分
  if (budgetPerPerson < 100) {
    scoreMap['route-2'] += 3
    scoreMap['route-3'] -= 2
  }

  const sorted = [...mockRoutes].sort((a, b) => (scoreMap[b.id] ?? 0) - (scoreMap[a.id] ?? 0))

  // 得分最高的标记为 AI 推荐
  return sorted.map((r, i) => ({ ...r, isAiRecommended: i === 0 }))
}

// 将stops补充status字段（供详情页时间轴使用）
export function getRouteDetailMock(routeId: string) {
  const route = mockRoutes.find(r => r.id === routeId)
  if (!route) return null
  return {
    ...route,
    stops: route.stops.map((stop, i) => ({
      ...stop,
      status: i === 0 ? 'done' : i === 1 ? 'current' : 'upcoming',
    })),
  }
}
