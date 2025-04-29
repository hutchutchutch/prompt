export interface ModelCard {
  id: string;          // "claude-opus"
  title: string;       // "Claude 3 Opus"
  content: string;     // answer snippet
}

export const models: ModelCard[] = [
  {
    id: "claude-opus",
    title: "Claude 3 Opus",
    content: "As an AI language model designed to provide helpful, harmless, and honest information, I'll analyze this question carefully. The key issue here is understanding the difference between correlation and causation..."
  },
  {
    id: "gpt-4o",
    title: "GPT-4o",
    content: "To address this question thoroughly, I need to consider multiple perspectives. First, let's examine the historical context. The correlation between these variables has been documented in several studies, but causation requires more rigorous analysis..."
  },
  {
    id: "gemini-1.5-pro",
    title: "Gemini 1.5 Pro",
    content: "This is an interesting question that touches on multiple domains. From a scientific standpoint, we need to evaluate the evidence systematically. Several factors could explain the observed relationship, including confounding variables..."
  },
  {
    id: "llama-3-70b",
    title: "Llama 3 70B",
    content: "Let me approach this methodically. The relationship you're asking about has been studied in various contexts. While there appears to be a statistical correlation, determining causality requires controlling for multiple variables and conducting longitudinal studies..."
  },
  {
    id: "mixtral-8x22b",
    title: "Mixtral 8x22B",
    content: "This question touches on an important distinction in data analysis. When we observe two phenomena occurring together, we must be careful not to assume one causes the other. Let me walk through some potential explanations..."
  },
  {
    id: "claude-haiku",
    title: "Claude 3 Haiku",
    content: "I'll analyze this step by step. The data shows a correlation, but correlation doesn't imply causation. Several factors could explain this relationship including reverse causality, common causes, or coincidence..."
  },
  {
    id: "gpt-3.5-turbo",
    title: "GPT-3.5 Turbo",
    content: "This is a complex question requiring careful analysis. Looking at the available evidence, we can identify several patterns, but we should be cautious about drawing causal conclusions without experimental validation..."
  }
];