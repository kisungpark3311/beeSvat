import { create } from 'zustand';
import type { AnalysisDetail, AnalysisListItem } from '@contracts/analysis.contract';
import type { PaginationMeta } from '@contracts/types';

// FEAT-2: Analysis state management

interface AnalysisState {
  currentAnalysis: AnalysisDetail | null;
  analyses: AnalysisListItem[];
  meta: PaginationMeta | null;
  isLoading: boolean;
  error: string | null;
  setCurrentAnalysis: (analysis: AnalysisDetail | null) => void;
  setAnalyses: (analyses: AnalysisListItem[], meta: PaginationMeta) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useAnalysisStore = create<AnalysisState>((set) => ({
  currentAnalysis: null,
  analyses: [],
  meta: null,
  isLoading: false,
  error: null,
  setCurrentAnalysis: (analysis) => set({ currentAnalysis: analysis }),
  setAnalyses: (analyses, meta) => set({ analyses, meta }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  reset: () =>
    set({
      currentAnalysis: null,
      analyses: [],
      meta: null,
      isLoading: false,
      error: null,
    }),
}));
