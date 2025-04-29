import { create } from 'zustand';
import { prompts, models, EvalMetrics, fakeFetchEval } from '@/data';

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

export const usePromptStore = create<PromptState>((set) => ({
  promptIdx: 0,
  modelIdx: 0,
  metrics: null,
  loading: true,
  
  nextPrompt: () => set((s) => ({ 
    promptIdx: (s.promptIdx + 1) % prompts.length 
  })),
  
  nextModel: () => set((s) => ({ 
    modelIdx: (s.modelIdx + 1) % models.length 
  })),
  
  setPromptIdx: (idx: number) => set({ 
    promptIdx: idx 
  }),
  
  setModelIdx: (idx: number) => set({ 
    modelIdx: idx 
  }),
  
  fetchMetrics: async (p, m) => {
    set({ loading: true });
    // simulate latency; later replace with real fetch
    const data = await fakeFetchEval(p, m);
    set({ metrics: data, loading: false });
  },
}));