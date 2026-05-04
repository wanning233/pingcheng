// src/stores/useSessionStore.ts
import { create } from 'zustand'

interface SessionState {
  area: string
  city: string
  startTime: string
  endTime: string
  budgetPerPerson: number
  peopleCount: number
  notes: string
  setSession: (patch: Partial<Omit<SessionState, 'setSession'>>) => void
}

export const useSessionStore = create<SessionState>((set) => ({
  area: '',
  city: '上海',
  startTime: '',
  endTime: '21:00',
  budgetPerPerson: 120,
  peopleCount: 4,
  notes: '',
  setSession: (patch) => set((state) => ({ ...state, ...patch })),
}))
