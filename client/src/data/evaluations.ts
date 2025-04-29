export interface EvalMetrics {
  promptId: string;        // fk -> PromptCard.id
  modelId: string;         // fk -> ModelCard.id
  score: number;           // 0-5 float
  coverage: number;        // 0-1
  retention: number;       // 0-1
  flow: number;            // 0-1
  factual: number;         // 0-1
  tokensIn: number;
  tokensOut: number;
  latencyFirst: number;    // ms
  latencyTotal: number;    // ms
  costUsd: number;
}

// Sample evaluation data
export const sampleEvals: EvalMetrics[] = [
  {
    promptId: "cot",
    modelId: "claude-opus",
    score: 4.8,
    coverage: 0.95,
    retention: 0.92,
    flow: 0.96,
    factual: 0.97,
    tokensIn: 124,
    tokensOut: 432,
    latencyFirst: 320,
    latencyTotal: 4268,
    costUsd: 0.0092
  },
  {
    promptId: "cot",
    modelId: "gpt4",
    score: 4.7,
    coverage: 0.94,
    retention: 0.91,
    flow: 0.95,
    factual: 0.96,
    tokensIn: 124,
    tokensOut: 410,
    latencyFirst: 350,
    latencyTotal: 4120,
    costUsd: 0.0098
  },
  {
    promptId: "fewshot",
    modelId: "claude-opus",
    score: 4.9,
    coverage: 0.96,
    retention: 0.94,
    flow: 0.97,
    factual: 0.98,
    tokensIn: 163,
    tokensOut: 456,
    latencyFirst: 310,
    latencyTotal: 4350,
    costUsd: 0.0105
  }
  // Additional evaluations would be added here...
];

// Function to simulate fetching evaluation data
export const fakeFetchEval = async (promptIdx: number, modelIdx: number): Promise<EvalMetrics> => {
  // In a real implementation, this would make an API call
  
  // For demo purposes, return a random existing eval or create a synthetic one
  const promptId = ["cot", "fewshot", "tot", "zeroshot", "role", "persona", "selfconsistency"][promptIdx];
  const modelId = ["claude-opus", "gpt4", "claude-sonnet", "gemini", "llama3"][modelIdx];
  
  // Try to find an existing evaluation
  const existing = sampleEvals.find(e => e.promptId === promptId && e.modelId === modelId);
  
  if (existing) {
    // Simulate network latency
    await new Promise(resolve => setTimeout(resolve, 800));
    return existing;
  }
  
  // Generate a synthetic evaluation if no matching one exists
  const synthetic: EvalMetrics = {
    promptId,
    modelId,
    score: 3.5 + Math.random() * 1.5, // 3.5-5.0 range
    coverage: 0.85 + Math.random() * 0.15,
    retention: 0.85 + Math.random() * 0.15,
    flow: 0.85 + Math.random() * 0.15,
    factual: 0.85 + Math.random() * 0.15,
    tokensIn: 100 + Math.floor(Math.random() * 100),
    tokensOut: 300 + Math.floor(Math.random() * 300),
    latencyFirst: 300 + Math.floor(Math.random() * 200),
    latencyTotal: 3000 + Math.floor(Math.random() * 2000),
    costUsd: 0.005 + Math.random() * 0.01
  };
  
  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 800));
  return synthetic;
};