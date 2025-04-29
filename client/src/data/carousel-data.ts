// Sample prompt for different techniques
const basePrompt = "Explain the concept of quantum computing to a high school student";

export const promptTechniques = [
  {
    title: "Chain of Thought",
    task: "Explanation",
    content: `${basePrompt}
    
Step through in sequence: define quantum computing, compare to classical computing, explain its importance.`
  },
  {
    title: "Few-Shot",
    task: "Explanation",
    content: `Here are examples of explanations:
Ex1: Gravity pulls objects together - more mass means stronger pull.
Ex2: Photosynthesis is plants making food from sunlight.

Now, ${basePrompt}`
  },
  {
    title: "Tree of Thought",
    task: "Explanation",
    content: `${basePrompt}

Explore multiple approaches:
1: Mathematical analogy
2: Physical analogy
3: Practical applications
Choose the most effective.`
  },
  {
    title: "Zero-Shot",
    task: "Explanation",
    content: `${basePrompt}`
  },
  {
    title: "Role Prompting",
    task: "Explanation",
    content: `You are a high school physics teacher known for making complex concepts accessible. ${basePrompt}`
  },
  {
    title: "Persona Prompting",
    task: "Explanation",
    content: `As Richard Feynman, known for explaining complex topics simply, ${basePrompt}`
  },
  {
    title: "Self-Consistency",
    task: "Explanation",
    content: `${basePrompt}

Generate multiple explanations, then synthesize the most accurate elements.`
  }
];

export const modelOutputs = [
  {
    title: "Claude 3 Opus",
    content: `Quantum computers use "qubits" instead of regular bits. While normal bits are 0 OR 1 (like light switches), qubits can be 0, 1, or both simultaneously (superposition).

This allows quantum computers to process many possibilities at once, making them much faster for certain complex problems that would take regular computers thousands of years.`
  },
  {
    title: "GPT-4",
    content: `Regular computers use bits (0 or 1), like coins landing heads or tails. Quantum computers use "qubits" that can be both values at once while calculating - like a spinning coin that's somehow both heads and tails.

This "superposition" plus "entanglement" (where qubits affect each other instantly) lets quantum computers solve certain complex problems much faster.`
  },
  {
    title: "Claude 3 Sonnet",
    content: `Normal computers use bits (0/1) like on/off switches. Quantum computers use "qubits" that can be both 0 and 1 simultaneously thanks to "superposition."

Think of a maze: a normal computer tries one path at a time, but a quantum computer explores multiple paths at once, making it faster for solving complex problems like designing medicines.`
  },
  {
    title: "Gemini 1.5 Pro",
    content: `Regular computers use bits (0/1) like tiny switches. Quantum computers use "qubits" that can be 0, 1, or both at once ("superposition").

Another property called "entanglement" connects qubits so changing one instantly affects others.

These properties help solve problems that would take normal computers millions of years, like designing new medicines.`
  },
  {
    title: "Llama 3",
    content: `Regular computers use bits - either 0 or 1. Quantum computers use "qubits" which can be 0, 1, or both simultaneously ("superposition").

Qubits can also be "entangled" - connected so that changing one instantly affects another regardless of distance.

This allows quantum computers to solve complex problems much faster than classical computers.`
  }
];

// Evaluation data for the evaluation card
export const evaluationData = {
  overallScore: 4.2,
  inputTokens: 124,
  inputCost: 0.0006,
  outputTokens: 432,
  outputCost: 0.0086,
  totalCost: 0.0092,
  firstTokenLatency: 320, // ms
  totalTime: 4268, // ms
};