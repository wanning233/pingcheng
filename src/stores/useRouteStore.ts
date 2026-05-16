// src/stores/useRouteStore.ts
import { create } from 'zustand'

export interface Stop {
  id: string
  name: string
  category: string
  coord: { lat: number; lng: number }
  arriveTime: string
  stayMinutes: number
  completed: boolean
  queueRisk: 'low' | 'medium' | 'high'
  estimatedQueueMinutes: number
  planB: PlanBItem[]
  tags: string[]
  ugcHighlight: string
}

export interface PlanBItem {
  id: string
  name: string
  reason: string
  rating: number
  pricePerPerson: number
  estimatedQueueMinutes: number
  walkMinutesFromOriginal: number
}

export interface Route {
  id: string
  name: string
  budgetPerPerson: number
  totalMinutes: number
  walkDistanceM: number
  queueRisk: 'low' | 'medium' | 'high'
  energyLevel: string
  isRecommended: boolean
  highlights: string[]
  stops: Stop[]
}

interface RouteState {
  routes: Route[]
  selectedRouteId: string | null
  transitionRect: DOMRect | null
  // 行程中用户换站后的站点列表，route-detail 和 assistant 共享
  modifiedStops: Stop[]
  setRoutes: (routes: Route[]) => void
  selectRoute: (routeId: string) => void
  setTransitionRect: (rect: DOMRect | null) => void
  setModifiedStops: (stops: Stop[]) => void
  swapStop: (index: number, replacement: Partial<Stop>) => void
}

export const useRouteStore = create<RouteState>((set) => ({
  routes: [],
  selectedRouteId: null,
  transitionRect: null,
  modifiedStops: [],
  setRoutes: (routes) => set({ routes }),
  selectRoute: (routeId) => set({ selectedRouteId: routeId }),
  setTransitionRect: (rect) => set({ transitionRect: rect }),
  setModifiedStops: (stops) => set({ modifiedStops: stops }),
  swapStop: (index, replacement) => set((state) => {
    const newStops = [...state.modifiedStops]
    if (newStops[index]) {
      newStops[index] = { ...newStops[index], ...replacement }
    }
    return { modifiedStops: newStops }
  }),
}))
