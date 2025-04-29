export interface PromptCard {
  id: string;          // "cot", "fewshot", etc.
  title: string;       // "Chain of Thought"
  task: string;        // "Explanation"
  content: string;     // prompt text
}

const basePrompt = "Explain the concept of quantum computing to a high school student";

export const prompts: PromptCard[] = [
  {
    id: "cot",
    title: "Chain of Thought",
    task: "Explanation",
    content: `${basePrompt}
    
Step through in sequence: define quantum computing, compare to classical computing, explain its importance.`
  },
  {
    id: "fewshot",
    title: "Few-Shot",
    task: "Explanation",
    content: `Here are examples of explanations:
Ex1: Gravity pulls objects together - more mass means stronger pull.
Ex2: Photosynthesis is plants making food from sunlight.

Now, ${basePrompt}`
  },
  {
    id: "tot",
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
    id: "zeroshot",
    title: "Zero-Shot",
    task: "Explanation",
    content: `${basePrompt}`
  },
  {
    id: "role",
    title: "Role Prompting",
    task: "Explanation",
    content: `You are a high school physics teacher known for making complex concepts accessible. ${basePrompt}`
  },
  {
    id: "persona",
    title: "Persona Prompting",
    task: "Explanation",
    content: `As Richard Feynman, known for explaining complex topics simply, ${basePrompt}`
  },
  {
    id: "selfconsistency",
    title: "Self-Consistency",
    task: "Explanation",
    content: `${basePrompt}

Generate multiple explanations, then synthesize the most accurate elements.`
  }
];