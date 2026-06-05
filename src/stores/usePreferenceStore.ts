// src/stores/usePreferenceStore.ts
import { create } from 'zustand'
import { get } from '@/services/request'

export interface Member {
  id: string
  name: string
  avatar: string
  status: 'pending' | 'filling' | 'done'
}

export interface Conflict {
  id: string
  type: 'taste' | 'budget' | 'energy'
  members: string[]
  description: string
  resolution: string
  resolved: boolean
}

interface TripMembersResponse {
  members: Member[]
  group_profile: Record<string, unknown>
}

interface PreferenceState {
  members: Member[]
  conflicts: Conflict[]
  answers: Record<string, string>
  setMembers: (members: Member[]) => void
  loadMembers: (tripId: string) => Promise<void>
  addConflict: (conflict: Conflict) => void
  resolveConflict: (conflictId: string) => void
  setAnswers: (answers: Record<string, string>) => void
}

export const usePreferenceStore = create<PreferenceState>((set) => ({
  members: [],
  conflicts: [],
  answers: {},
  setMembers: (members) => set({ members }),
  loadMembers: async (tripId) => {
    const res = await get<TripMembersResponse>(`/api/v1/trips/${tripId}/members`)
    set({ members: res.members })
  },
  addConflict: (conflict) =>
    set((state) => ({ conflicts: [...state.conflicts, conflict] })),
  resolveConflict: (conflictId) =>
    set((state) => ({
      conflicts: state.conflicts.map((c) =>
        c.id === conflictId ? { ...c, resolved: true } : c
      ),
    })),
  setAnswers: (answers) => set({ answers }),
}))
