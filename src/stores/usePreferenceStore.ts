// src/stores/usePreferenceStore.ts
import { create } from 'zustand'

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

interface PreferenceState {
  members: Member[]
  conflicts: Conflict[]
  setMembers: (members: Member[]) => void
  addConflict: (conflict: Conflict) => void
  resolveConflict: (conflictId: string) => void
}

export const usePreferenceStore = create<PreferenceState>((set) => ({
  members: [],
  conflicts: [],
  setMembers: (members) => set({ members }),
  addConflict: (conflict) =>
    set((state) => ({ conflicts: [...state.conflicts, conflict] })),
  resolveConflict: (conflictId) =>
    set((state) => ({
      conflicts: state.conflicts.map((c) =>
        c.id === conflictId ? { ...c, resolved: true } : c
      ),
    })),
}))
