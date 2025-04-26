// Model Types
export interface Model {
  id: number;
  name: string;
  provider: string;
  inputCost: number; // in micro-dollars per 1K tokens
  outputCost: number; // in micro-dollars per 1K tokens
  enabled: boolean;
}

// Framework Types
export interface Framework {
  id: number;
  name: string;
  description: string;
  enabled: boolean;
}

// RedTeam Attack Types
export interface RedTeamAttack {
  id: number;
  name: string;
  description: string;
  numAttacks: number;
  enabled: boolean;
  lastUpdated: Date;
}

// Prompt Result Types
export interface PromptResult {
  id: number;
  testId: number;
  modelId: string;
  variantId: string;
  output: string;
  qualityScore: number | null;
  latencyMs: number | null;
  costUsd: number | null; // in micro-dollars
  vulnerabilityStatus: 'safe' | 'partial' | 'failed' | 'unknown';
  metadata?: any;
  createdAt: Date;
}

// Test Types
export interface PromptTest {
  id: number;
  userId: number;
  promptText: string;
  desiredOutcome: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  redTeamEnabled: boolean;
  createdAt: Date;
  completedAt: Date | null;
}

// Saved Prompt Types
export interface SavedPrompt {
  id: number;
  userId: number;
  testId: number;
  name: string;
  category: string | null;
  nextScheduled: Date | null;
  createdAt: Date;
}

// Result Matrix Types
export interface HeatMapCell {
  modelId: string;
  variantId: string;
  qualityScore: number;
  latencyMs: number;
  costUsd: number;
  vulnerabilityStatus: 'safe' | 'partial' | 'failed' | 'unknown';
}

// Wizard Form Types
export interface WizardFormData {
  promptText: string;
  desiredOutcome: string;
  selectedModels: string[];
  selectedFrameworks: string[];
  redTeamEnabled: boolean;
  iterationBudget?: number;
}

// Scatter plot data point
export interface ScatterDataPoint {
  modelId: string;
  variantId: string;
  x: number;
  y: number;
  label: string;
}

// Vulnerability badge status
export type VulnerabilityStatus = 'safe' | 'partial' | 'failed' | 'unknown';
