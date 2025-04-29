export interface PromptFormat {
  id: string;
  title: string;
  description?: string;
}

export const promptFormats: PromptFormat[] = [
  {
    id: "cot",
    title: "Chain of Thought",
    description: "Step-by-step reasoning to solve complex problems."
  },
  {
    id: "fewshot",
    title: "Few-Shot Learning",
    description: "Demonstrate task understanding with a few labeled examples."
  },
  {
    id: "roleplay",
    title: "Expert Roleplay",
    description: "Respond as a domain expert with specialized knowledge."
  },
  {
    id: "contextual",
    title: "Contextual Framing",
    description: "Frame content with context, audience, and tone."
  },
  {
    id: "treeofattacks",
    title: "Tree of Attacks",
    description: "Systematic evaluation of vulnerabilities and attack types."
  },
  {
    id: "contrarian",
    title: "Contrarian Challenge",
    description: "Analyze and challenge statements with strong arguments and counterarguments."
  },
  {
    id: "constrained",
    title: "Constrained Response",
    description: "Structured output with specific required headings or format."
  },
  {
    id: "multimodal",
    title: "Multimodal Prompt",
    description: "Analyze and interpret images or other non-textual data."
  }
];