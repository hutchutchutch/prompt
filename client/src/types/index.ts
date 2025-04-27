export interface PromptTest {
  id: number;
  userId: number;
  promptText: string;
  status: string;
  modelIds?: string[];
  variantIds?: string[];
  redTeamEnabled?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface PromptResult {
  id: number;
  testId: number;
  modelId: string;
  variantId: string;
  output: string;
  qualityScore: number;
  costUsd: number;
  latencyMs?: number;
  totalTime?: number;
  firstTokenLatency?: number;
  vulnerabilityStatus: string;
  createdAt: string;
  updatedAt?: string;
}

export interface SavedPrompt {
  id: number;
  userId: number;
  testId: number;
  name: string;
  category?: string;
  createdAt: string;
}

export interface Framework {
  id: number;
  name: string;
  description: string;
  enabled: boolean;
}

export interface RedTeamAttack {
  id: number;
  name: string;
  description: string;
  enabled: boolean;
}

export interface Model {
  id: number;
  name: string;
  provider: string;
  enabled: boolean;
}

export interface WizardFormData {
  promptText: string;
  modelIds: string[];
  variantIds: string[];
  redTeamEnabled: boolean;
}

export interface EnhancedTestData extends PromptTest {
  category?: string;
  bestModel?: {
    modelId: string;
    score: number;
    cost: number;
    time: number;
  };
  averages?: {
    score: number;
    cost: number;
    time: number;
  };
  improvements?: {
    score: string;
    cost: string;
    time: string;
  };
}