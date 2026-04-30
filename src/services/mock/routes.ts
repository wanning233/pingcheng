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
