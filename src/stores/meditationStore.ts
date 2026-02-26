import { create } from 'zustand';
import type { MeditationDetail, MeditationListItem } from '@contracts/meditation.contract';
import type { PaginationMeta } from '@contracts/types';

// FEAT-3: Meditation state management

interface MeditationState {
  meditations: MeditationListItem[];
  currentMeditation: MeditationDetail | null;
  meta: PaginationMeta | null;
  isLoading: boolean;
  error: string | null;
  setMeditations: (items: MeditationListItem[], meta: PaginationMeta) => void;
  setCurrentMeditation: (m: MeditationDetail | null) => void;
  setLoading: (l: boolean) => void;
  setError: (e: string | null) => void;
  reset: () => void;
}

export const useMeditationStore = create<MeditationState>((set) => ({
  meditations: [],
  currentMeditation: null,
  meta: null,
  isLoading: false,
  error: null,
  setMeditations: (meditations, meta) => set({ meditations, meta }),
  setCurrentMeditation: (currentMeditation) => set({ currentMeditation }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  reset: () =>
    set({
      meditations: [],
      currentMeditation: null,
      meta: null,
      isLoading: false,
      error: null,
    }),
}));
