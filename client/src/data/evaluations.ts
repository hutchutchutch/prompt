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

// Sample evaluation data for each prompt+model combination
export const sampleEvals: EvalMetrics[] = [
  // claude-opus evals
  {
    promptId: "cot",
    modelId: "claude-opus",
    score: 4.8,
    coverage: 0.94,
    retention: 0.91,
    flow: 0.92,
    factual: 0.95,
    tokensIn: 176,
    tokensOut: 543,
    latencyFirst: 480,
    latencyTotal: 3450,
    costUsd: 0.0212
  },
  {
    promptId: "fewshot",
    modelId: "claude-opus",
    score: 4.7,
    coverage: 0.93,
    retention: 0.94,
    flow: 0.91,
    factual: 0.96,
    tokensIn: 231,
    tokensOut: 312,
    latencyFirst: 510,
    latencyTotal: 2890,
    costUsd: 0.0174
  },
  // Add more combinations for all models x prompts
  // This is just a subset for illustration
];

// Function to fetch evaluation metrics on demand - simulates API call
export const fakeFetchEval = async (promptIdx: number, modelIdx: number): Promise<EvalMetrics> => {
  // In a real app, this would be an API call
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Generate synthetic data with some variation
  const variation = () => 0.7 + Math.random() * 0.3; // random between 0.7-1.0
  const smallVariation = () => 0.9 + Math.random() * 0.1; // random between 0.9-1.0
  
  // Base values that give sensible ranges
  const baseScore = 3.2 + Math.random() * 1.8; // 3.2-5.0
  const baseTokensIn = 150 + Math.floor(Math.random() * 200); // 150-350
  const baseTokensOut = 300 + Math.floor(Math.random() * 300); // 300-600
  const baseLatencyFirst = 300 + Math.floor(Math.random() * 500); // 300-800ms
  const baseLatencyTotal = 1000 + Math.floor(Math.random() * 3000); // 1-4sec
  const baseCost = 0.005 + Math.random() * 0.02; // $0.005-$0.025
  
  // Model-specific adjustments (high-end models are faster but cost more)
  const modelAdjustments: Record<number, {speed: number, cost: number, quality: number}> = {
    0: {speed: 0.9, cost: 1.5, quality: 1.2},  // claude-opus: slower, more expensive, higher quality
    1: {speed: 0.7, cost: 1.3, quality: 1.15}, // gpt-4o: fastest, expensive, high quality
    2: {speed: 0.8, cost: 1.2, quality: 1.1},  // gemini-1.5-pro: fast, somewhat expensive, good quality
    3: {speed: 1.1, cost: 0.9, quality: 1.0},  // llama-3-70b: slower, cheaper, decent quality
    4: {speed: 1.2, cost: 0.8, quality: 0.95}, // mixtral-8x22b: slowest, cheaper, decent quality
    5: {speed: 0.7, cost: 0.7, quality: 0.9},  // claude-haiku: fast, cheaper, lower quality
    6: {speed: 0.8, cost: 0.6, quality: 0.85}  // gpt-3.5-turbo: fast, cheapest, lowest quality
  };
  
  // Prompt-specific adjustments (complex prompts require more tokens/processing)
  const promptAdjustments: Record<number, {tokens: number, complexity: number}> = {
    0: {tokens: 1.1, complexity: 1.2},  // cot: more tokens, more complex
    1: {tokens: 1.3, complexity: 1.0},  // fewshot: most tokens, medium complexity
    2: {tokens: 0.9, complexity: 1.1},  // roleplay: fewer tokens, more complex
    3: {tokens: 1.0, complexity: 0.9},  // contextual: medium tokens, less complex
    4: {tokens: 1.2, complexity: 1.3},  // treeofattacks: more tokens, most complex
    5: {tokens: 0.8, complexity: 1.0},  // contrarian: fewest tokens, medium complexity
    6: {tokens: 1.0, complexity: 0.8},  // constrained: medium tokens, least complex
    7: {tokens: 1.2, complexity: 1.1}   // multimodal: more tokens, more complex
  };
  
  const modelAdj = modelAdjustments[modelIdx];
  const promptAdj = promptAdjustments[promptIdx];
  
  // Create the synthetic metrics with adjustments
  const synthetic: EvalMetrics = {
    promptId: ["cot", "fewshot", "roleplay", "contextual", "treeofattacks", "contrarian", "constrained", "multimodal"][promptIdx],
    modelId: ["claude-opus", "gpt-4o", "gemini-1.5-pro", "llama-3-70b", "mixtral-8x22b", "claude-haiku", "gpt-3.5-turbo"][modelIdx],
    score: Math.min(5, baseScore * modelAdj.quality * promptAdj.complexity * smallVariation()),
    coverage: Math.min(1, 0.75 + 0.25 * modelAdj.quality * variation()),
    retention: Math.min(1, 0.7 + 0.3 * modelAdj.quality * variation()),
    flow: Math.min(1, 0.7 + 0.3 * modelAdj.quality * variation()),
    factual: Math.min(1, 0.6 + 0.4 * modelAdj.quality * variation()),
    tokensIn: Math.floor(baseTokensIn * promptAdj.tokens),
    tokensOut: Math.floor(baseTokensOut * promptAdj.tokens * modelAdj.quality),
    latencyFirst: Math.floor(baseLatencyFirst * modelAdj.speed * promptAdj.complexity),
    latencyTotal: Math.floor(baseLatencyTotal * modelAdj.speed * promptAdj.complexity),
    costUsd: Number((baseCost * modelAdj.cost * promptAdj.tokens).toFixed(4))
  };
  
  return synthetic;
};