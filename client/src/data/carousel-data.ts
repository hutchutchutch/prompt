// Sample prompt for different techniques
const basePrompt = "Explain the concept of quantum computing to a high school student";

export const promptTechniques = [
  {
    title: "Chain of Thought",
    content: `${basePrompt}
    
Step through your explanation in a logical sequence. First define what quantum computing is, then compare it to classical computing, and finally explain why it matters.`
  },
  {
    title: "Few-Shot",
    content: `Here are some examples of good explanations:
Example 1: Gravity is like an invisible force that pulls objects together. The more mass an object has, the stronger its gravitational pull.
Example 2: Photosynthesis is how plants make their own food using sunlight. They convert light energy into chemical energy.

Now, ${basePrompt}`
  },
  {
    title: "Tree of Thought",
    content: `${basePrompt}

Explore multiple approaches to explaining this concept:
Approach 1: Use a mathematical analogy
Approach 2: Use a physical analogy
Approach 3: Explain through practical applications
Choose the approach that would be most effective.`
  },
  {
    title: "Zero-Shot",
    content: `${basePrompt}`
  },
  {
    title: "Role Prompting",
    content: `You are a high school physics teacher known for making complex concepts extremely accessible to students. ${basePrompt}`
  },
  {
    title: "Persona Prompting",
    content: `As Richard Feynman, the renowned physicist known for your ability to explain complex topics simply, ${basePrompt}`
  },
  {
    title: "Self-Consistency",
    content: `${basePrompt}

Generate multiple explanations, then synthesize the most accurate and understandable elements from each.`
  }
];

export const modelOutputs = [
  {
    title: "Claude 3 Opus",
    content: `Quantum computing is like having a super-powered calculator that works in a completely different way than regular computers.

In a normal computer, everything is stored as bits - tiny switches that can be either 0 or 1. It's like having a bunch of light switches that can only be on OR off.

In a quantum computer, we use quantum bits or "qubits." These are special because they can be 0, 1, or both at the same time! Scientists call this "superposition" - it's like having a light switch that can be on, off, or somehow both until you actually look at it.

This means quantum computers can consider many possibilities simultaneously, making them potentially much faster at solving certain types of problems that would take regular computers thousands of years.`
  },
  {
    title: "GPT-4",
    content: `Imagine your regular computer is like a coin. When you flip it, it lands as either heads (0) or tails (1). This is how normal computers work - using bits that are either 0 or 1 to process information.

Now, quantum computing is like having a magical coin. While it's spinning in the air, it's not just heads OR tails - it's kind of both at the same time! Scientists call this state "superposition."

Even cooler, quantum computers can use "entanglement" - imagine spinning many magical coins, and somehow they all know what the others are doing instantly.

These properties allow quantum computers to solve certain problems much faster than regular computers, like simulating molecules for new medicines or breaking complex codes.`
  },
  {
    title: "Claude 3 Sonnet",
    content: `Think of normal computers as working with light switches - they're either on (1) or off (0). These are called bits, and all your digital devices use billions of these on/off switches to work.

Quantum computers use something called "qubits" instead. Qubits are special because they don't have to be just on or off - they can be both at the same time! Scientists call this "superposition."

Imagine you're trying to find your way through a maze. A normal computer would try one path at a time. But a quantum computer could explore multiple paths simultaneously, making it potentially much faster at solving certain types of problems.

Quantum computers could eventually help us design new medicines, create better batteries, or solve complex problems that are currently impossible with regular computers.`
  },
  {
    title: "Gemini 1.5 Pro",
    content: `Regular computers use bits (0s and 1s) like tiny on/off switches to process information. Everything your phone or laptop does comes down to manipulating these bits.

Quantum computers use qubits instead. Here's where it gets weird but cool: qubits can be 0, 1, or both simultaneously thanks to something called "superposition." It's like if a coin could be heads, tails, or somehow both until you look at it.

Another quantum property called "entanglement" lets qubits become connected so that what happens to one instantly affects another, no matter how far apart.

These properties could eventually let quantum computers solve problems that would take our best supercomputers millions of years to figure out, like designing new medicines or materials with exactly the properties we want.`
  },
  {
    title: "Llama 3",
    content: `Think of normal computers as using coins that are either heads (0) or tails (1). Everything your computer does - from displaying text to playing videos - comes from manipulating these 0s and 1s.

Quantum computers use quantum bits or "qubits" which can be heads, tails, or (and this is the weird part) kind of both at once until you actually check them! Scientists call this "superposition."

Even stranger, qubits can be "entangled" - meaning they're connected in ways that classical physics can't explain. If one entangled qubit changes state, its partner instantly changes too, no matter how far apart they are.

These quantum properties potentially allow quantum computers to solve incredibly complex problems much faster than regular computers - things like simulating molecules for new medicines or optimizing complex systems.`
  }
];