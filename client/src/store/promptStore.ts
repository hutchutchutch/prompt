import { create } from 'zustand';
import { EvalMetrics, fakeFetchEval } from '@/data/evaluations';

interface PromptState {
  promptIdx: number;
  modelIdx: number;
  metrics: EvalMetrics | null;   // current eval
  loading: boolean;
  // actions
  nextPrompt: () => void;
  nextModel: () => void;
  setPromptIdx: (idx: number) => void;
  setModelIdx: (idx: number) => void;
  fetchMetrics: (p: number, m: number) => Promise<void>;
}

export const usePromptStore = create<PromptState>((set, get) => ({
  // initial state
  promptIdx: 0,
  modelIdx: 0,
  metrics: null,
  loading: false,
  
  // actions
  nextPrompt: () => {
    const { promptIdx } = get();
    set({ promptIdx: promptIdx + 1 });
  },
  
  nextModel: () => {
    const { modelIdx } = get();
    set({ modelIdx: modelIdx + 1 });
  },
  
  setPromptIdx: (idx: number) => {
    set({ promptIdx: idx });
  },
  
  setModelIdx: (idx: number) => {
    set({ modelIdx: idx });
  },
  
  fetchMetrics: async (p: number, m: number) => {
    set({ loading: true });
    try {
      const metrics = await fakeFetchEval(p, m);
      set({ metrics, loading: false });
    } catch (err) {
      console.error('Error fetching metrics:', err);
      set({ loading: false });
    }
  }
}));