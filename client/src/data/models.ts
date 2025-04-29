export interface ModelCard {
  id: string;          // "claude-opus"
  title: string;       // "Claude 3 Opus"
  content: string;     // answer snippet
}

export const models: ModelCard[] = [
  {
    id: "claude-opus",
    title: "Claude 3 Opus",
    content: `Quantum computers use "qubits" instead of regular bits. While normal bits are 0 OR 1 (like light switches), qubits can be 0, 1, or both simultaneously (superposition).

This allows quantum computers to process many possibilities at once, making them much faster for certain complex problems that would take regular computers thousands of years.`
  },
  {
    id: "gpt4",
    title: "GPT-4",
    content: `Regular computers use bits (0 or 1), like coins landing heads or tails. Quantum computers use "qubits" that can be both values at once while calculating - like a spinning coin that's somehow both heads and tails.

This "superposition" plus "entanglement" (where qubits affect each other instantly) lets quantum computers solve certain complex problems much faster.`
  },
  {
    id: "claude-sonnet",
    title: "Claude 3 Sonnet",
    content: `Normal computers use bits (0/1) like on/off switches. Quantum computers use "qubits" that can be both 0 and 1 simultaneously thanks to "superposition."

Think of a maze: a normal computer tries one path at a time, but a quantum computer explores multiple paths at once, making it faster for solving complex problems like designing medicines.`
  },
  {
    id: "gemini",
    title: "Gemini 1.5 Pro",
    content: `Regular computers use bits (0/1) like tiny switches. Quantum computers use "qubits" that can be 0, 1, or both at once ("superposition").

Another property called "entanglement" connects qubits so changing one instantly affects others.

These properties help solve problems that would take normal computers millions of years, like designing new medicines.`
  },
  {
    id: "llama3",
    title: "Llama 3",
    content: `Regular computers use bits - either 0 or 1. Quantum computers use "qubits" which can be 0, 1, or both simultaneously ("superposition").

Qubits can also be "entangled" - connected so that changing one instantly affects another regardless of distance.

This allows quantum computers to solve complex problems much faster than classical computers.`
  }
];