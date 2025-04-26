export interface PromptTemplate {
  category: string;
  description: string;
  template: string;
  businessImpact: string;
}

export const taskCategories: PromptTemplate[] = [
  {
    category: "Classification",
    description: "Categorize text into predefined classes or labels",
    template: "Classify the following text into one of these categories: [Category A, Category B, Category C]. Provide a brief explanation for your classification.\n\nText: {{text}}",
    businessImpact: "Improves content categorization, automates document routing, and enhances searchability"
  },
  {
    category: "Summarization",
    description: "Condense long text while preserving key information",
    template: "Summarize the following text in 3-5 bullet points that capture the most important information:\n\n{{text}}",
    businessImpact: "Reduces reading time by 70%, improves information retention, and enables faster decision making"
  },
  {
    category: "Entity Extraction",
    description: "Identify and extract specific pieces of information",
    template: "Extract all named entities (people, organizations, locations, dates) from the following text. Format the output as a JSON object with entity types as keys and arrays of extracted entities as values.\n\n{{text}}",
    businessImpact: "Automates data entry, improves search functionality, and enables relationship mapping"
  },
  {
    category: "Content Generation",
    description: "Create original text based on specific requirements",
    template: "Generate a {{content_type}} about {{topic}} with the following characteristics:\n- Tone: {{tone}}\n- Target audience: {{audience}}\n- Length: {{length}}\n- Key points to include: {{key_points}}",
    businessImpact: "Reduces content creation time by 60%, enables consistent messaging, and increases production volume"
  },
  {
    category: "Code Generation",
    description: "Create code snippets or entire functions",
    template: "Write a {{language}} function that accomplishes the following:\n\nTask description: {{task_description}}\n\nInput parameters: {{input_parameters}}\nExpected output: {{expected_output}}\nError handling requirements: {{error_handling}}",
    businessImpact: "Accelerates development cycles, reduces debugging time, and lowers technical debt"
  },
  {
    category: "Translation",
    description: "Convert text from one language to another",
    template: "Translate the following {{source_language}} text to {{target_language}}. Preserve formatting, maintain the original tone, and ensure cultural nuances are appropriately adapted.\n\n{{text}}",
    businessImpact: "Expands global reach, improves customer engagement across regions, and reduces localization costs"
  },
  {
    category: "Sentiment Analysis",
    description: "Determine the emotional tone or attitude of text",
    template: "Analyze the sentiment of the following text. Provide a rating on a scale from -5 (extremely negative) to +5 (extremely positive), and explain the reasoning behind your rating. Include key phrases that influenced your analysis.\n\n{{text}}",
    businessImpact: "Enhances customer feedback analysis, informs product improvements, and enables reputation monitoring"
  },
  {
    category: "Question Answering",
    description: "Provide direct answers to specific questions",
    template: "Answer the following question based only on the information provided in the context. If the answer cannot be determined from the context, state that the information is not available.\n\nContext: {{context}}\n\nQuestion: {{question}}",
    businessImpact: "Reduces support ticket volume by up to 35%, improves customer satisfaction, and decreases response time"
  },
  {
    category: "Data Analysis",
    description: "Interpret and extract insights from structured data",
    template: "Analyze the following data and provide 3-5 key insights. Include any notable trends, anomalies, or patterns. Calculate relevant statistics when appropriate.\n\n{{data}}",
    businessImpact: "Accelerates decision making, identifies opportunities/risks earlier, and reduces analytical bottlenecks"
  },
  {
    category: "Creative Writing",
    description: "Generate stories, poems, or other creative content",
    template: "Write a {{creative_format}} with the following elements:\n- Setting: {{setting}}\n- Characters: {{characters}}\n- Theme: {{theme}}\n- Style: {{style}}\n- Length: {{length}}",
    businessImpact: "Enhances marketing engagement, creates memorable brand experiences, and increases content variety"
  }
];

// Function to get a specific category by name
export function getCategoryByName(categoryName: string): PromptTemplate | undefined {
  return taskCategories.find(category => 
    category.category.toLowerCase() === categoryName.toLowerCase()
  );
}

// Function to get all category names
export function getAllCategoryNames(): string[] {
  return taskCategories.map(category => category.category);
}