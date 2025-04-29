import { create } from 'zustand';
import { EvalMetrics, fakeFetchEval } from '@/data/evaluations';

// Default metrics to prevent null values
const defaultMetrics: EvalMetrics = {
  promptId: "",
  modelId: "",
  score: 0,
  coverage: 0,
  retention: 0,
  flow: 0,
  factual: 0,
  tokensIn: 0,
  tokensOut: 0,
  latencyFirst: 0,
  latencyTotal: 0,
  costUsd: 0
};

interface HistoryEntry {
  promptIdx: number;
  modelIdx: number;
  score: number;
}

interface PromptState {
  promptIdx: number;
  modelIdx: number;
  metrics: EvalMetrics;   // current eval (never null)
  loading: boolean;
  history: HistoryEntry[];
  // actions
  nextPrompt: () => void;
  nextModel: () => void;
  setPromptIdx: (idx: number) => void;
  setModelIdx: (idx: number) => void;
  fetchMetrics: (p: number, m: number) => Promise<void>;
  addToHistory: (entry: HistoryEntry) => void;
  restoreFromHistory: (index: number) => void;
  reorderHistory: (newOrder: HistoryEntry[]) => void;
}

export const usePromptStore = create<PromptState>((set, get) => ({
  // initial state
  promptIdx: 0,
  modelIdx: 0,
  metrics: defaultMetrics,
  loading: false,
  history: [],
  
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

  addToHistory: (entry) => {
    set((state) => ({
      history: [
        ...state.history.filter(
          (h) => !(h.promptIdx === entry.promptIdx && h.modelIdx === entry.modelIdx)
        ),
        entry,
      ],
    }));
  },
  restoreFromHistory: (index) => {
    const entry = get().history[index];
    if (entry) {
      set({
        promptIdx: entry.promptIdx,
        modelIdx: entry.modelIdx,
      });
    }
  },
  reorderHistory: (newOrder) => {
    set({ history: newOrder });
  },
  
  fetchMetrics: async (p: number, m: number) => {
    set({ loading: true });
    try {
      const metrics = await fakeFetchEval(p, m);
      set({ metrics, loading: false });
    } catch (err) {
      console.error('Error fetching metrics:', err);
      // Set back to default metrics on error
      set({ metrics: defaultMetrics, loading: false });
    }
  }
}));
