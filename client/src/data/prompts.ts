export interface PromptCard {
  id: string;          // "cot", "fewshot", etc.
  title: string;       // "Chain of Thought"
  task: string;        // "Explanation"
  content: string;     // prompt text
}

export const prompts: PromptCard[] = [
  {
    id: "cot",
    title: "Chain of Thought",
    task: "Explanation",
    content: "I want you to think step-by-step about this problem: [PROBLEM]. First, identify the key variables involved. Second, establish relevant equations or relationships. Third, solve systematically showing each step. Finally, verify your answer makes sense."
  },
  {
    id: "fewshot",
    title: "Few-Shot Learning",
    task: "Classification",
    content: "Here are some examples of [CATEGORY] classification:\n1. Input: 'I love this product!' Classification: Positive\n2. Input: 'It broke after one use.' Classification: Negative\n3. Input: 'It works as expected.' Classification: Neutral\n\nNow classify the following: '[INPUT]'"
  },
  {
    id: "roleplay",
    title: "Expert Roleplay",
    task: "Specialized Response",
    content: "You are a [EXPERT ROLE] with over 20 years of experience. You have specialized knowledge in [DOMAIN]. Respond to the following question as this expert would, using appropriate terminology and depth of analysis: [QUESTION]"
  },
  {
    id: "contextual",
    title: "Contextual Framing",
    task: "Creative Writing",
    content: "Write a [CONTENT TYPE] about [TOPIC]. The context is [CONTEXT], and the audience is [AUDIENCE]. Maintain a [TONE] tone throughout, and ensure it includes [KEY ELEMENTS]."
  },
  {
    id: "treeofattacks",
    title: "Tree of Attacks",
    task: "Red Teaming",
    content: "You will conduct a systematic evaluation of potential vulnerabilities in the following prompt: [PROMPT]. First, identify at least 3 different types of attacks (jailbreaking, prompt injection, etc.). For each attack type, create 3 specific examples with increasing levels of sophistication."
  },
  {
    id: "contrarian",
    title: "Contrarian Challenge",
    task: "Critical Analysis",
    content: "I want you to analyze the following statement: [STATEMENT]. First, steelman this position with the strongest possible supporting arguments. Then, present the strongest counterarguments and alternative perspectives. Be nuanced and avoid strawman arguments."
  },
  {
    id: "constrained",
    title: "Constrained Response",
    task: "Structured Output",
    content: "Provide a comprehensive analysis of [TOPIC] using exactly these headings in this order:\n1. Background (2 sentences)\n2. Key Factors (3 bullet points)\n3. Current Challenges (2 paragraphs)\n4. Future Outlook (1 paragraph)\n5. Actionable Recommendations (3-5 bullet points)"
  },
  {
    id: "multimodal",
    title: "Multimodal Prompt",
    task: "Image Analysis",
    content: "Look at the image and provide the following analysis:\n1. Describe what you see in the image in detail\n2. Identify any text visible in the image\n3. Analyze the composition and visual elements\n4. Interpret the likely meaning or purpose\n5. Suggest how this image could be improved"
  }
];