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
  setRoutes: (routes: Route[]) => void
  selectRoute: (routeId: string) => void
  setTransitionRect: (rect: DOMRect | null) => void
}

export const useRouteStore = create<RouteState>((set) => ({
  routes: [],
  selectedRouteId: null,
  transitionRect: null,
  setRoutes: (routes) => set({ routes }),
  selectRoute: (routeId) => set({ selectedRouteId: routeId }),
  setTransitionRect: (rect) => set({ transitionRect: rect }),
}))
