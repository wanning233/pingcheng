// src/stores/useTripStore.ts
import { create } from 'zustand'
import type { Stop } from './useRouteStore'

interface TripState {
  stops: Stop[]
  currentStopIndex: number
  setStops: (stops: Stop[]) => void
  completeStop: (stopId: string) => void
  setCurrentStop: (index: number) => void
}

export const useTripStore = create<TripState>((set) => ({
  stops: [],
  currentStopIndex: 0,
  setStops: (stops) => set({ stops }),
  completeStop: (stopId) =>
    set((state) => ({
      stops: state.stops.map((s) =>
        s.id === stopId ? { ...s, completed: true } : s
      ),
    })),
  setCurrentStop: (index) => set({ currentStopIndex: index }),
}))
