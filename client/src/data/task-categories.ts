export interface PromptTemplate {
  category: string;
  description: string;
  template: string;
  businessImpact: string;
  metrics?: {
    name: string;
    description: string;
    higherIsBetter: boolean;
  }[];
}

export const taskCategories: PromptTemplate[] = [
  {
    category: "Text Summarization",
    description: "Condensing large texts into shorter versions while retaining key information",
    template: "Summarize the following text in 3-5 sentences that capture the most important information:\n\n{{text}}",
    businessImpact: "Reduces reading time by 70%, improves information retention, and enables faster decision making",
    metrics: [
      { name: "Content Coverage (ROUGE-1)", description: "Measures how well the summary includes important words from the original text", higherIsBetter: true },
      { name: "Key Point Retention (ROUGE-2)", description: "Evaluates how well the summary preserves important phrases from the original text", higherIsBetter: true },
      { name: "Flow Preservation (ROUGE-L)", description: "Assesses how well the summary maintains the sequence and structure of ideas", higherIsBetter: true },
      { name: "Meaning Preservation (BERTScore)", description: "Measures how well the summary captures the semantic meaning of the original text", higherIsBetter: true },
      { name: "Factual Accuracy", description: "Evaluates whether the summary contains any factual errors or contradictions", higherIsBetter: true },
      { name: "Relevance Score", description: "Measures how well the summary focuses on the most important information", higherIsBetter: true },
      { name: "Readability Score", description: "Assesses how logically connected and easy to read the summary is", higherIsBetter: true },
      { name: "Conciseness Rating", description: "Evaluates if the summary is appropriately brief while retaining key information", higherIsBetter: true }
    ]
  },
  {
    category: "Information Extraction",
    description: "Identifying and structuring specific pieces of information from unstructured text",
    template: "Extract all named entities (people, organizations, locations, dates) from the following text. Format the output as a JSON object with entity types as keys and arrays of extracted entities as values.\n\n{{text}}",
    businessImpact: "Automates data entry, improves search functionality, and enables relationship mapping",
    metrics: [
      { name: "Extraction Accuracy (Precision)", description: "Percentage of extracted information that is correct", higherIsBetter: true },
      { name: "Extraction Completeness (Recall)", description: "Percentage of relevant information that was successfully extracted", higherIsBetter: true },
      { name: "Overall Extraction Quality (F1-Score)", description: "Balanced measure of extraction accuracy and completeness", higherIsBetter: true },
      { name: "Structured Format Compliance", description: "How well the extracted information adheres to the required format", higherIsBetter: true },
      { name: "Information Coverage", description: "Assessment of whether all required information was extracted", higherIsBetter: true }
    ]
  },
  {
    category: "Question Answering",
    description: "Providing answers to questions based on given context or general knowledge",
    template: "Answer the following question based only on the information provided in the context. If the answer cannot be determined from the context, state that the information is not available.\n\nContext: {{context}}\n\nQuestion: {{question}}",
    businessImpact: "Reduces support ticket volume by up to 35%, improves customer satisfaction, and decreases response time",
    metrics: [
      { name: "Perfect Match Rate (Exact Match)", description: "Percentage of answers that perfectly match the reference answers", higherIsBetter: true },
      { name: "Answer Overlap (F1-Score)", description: "Measures word overlap between generated and reference answers", higherIsBetter: true },
      { name: "Meaning Similarity", description: "How closely the meaning of the generated answer matches the reference", higherIsBetter: true },
      { name: "Factual Correctness", description: "Whether the answer contains factually correct information", higherIsBetter: true },
      { name: "Question Relevance", description: "How directly the answer addresses the question asked", higherIsBetter: true },
      { name: "Answer Thoroughness", description: "Whether the answer covers all aspects of the question", higherIsBetter: true }
    ]
  },
  {
    category: "Text Classification",
    description: "Assigning predefined categories to text",
    template: "Classify the following text into one of these categories: [Category A, Category B, Category C]. Provide a brief explanation for your classification.\n\nText: {{text}}",
    businessImpact: "Improves content categorization, automates document routing, and enhances searchability",
    metrics: [
      { name: "Overall Correctness (Accuracy)", description: "Percentage of texts correctly classified across all categories", higherIsBetter: true },
      { name: "Classification Reliability (Precision)", description: "When a category is assigned, how often it is correct", higherIsBetter: true },
      { name: "Category Coverage (Recall)", description: "How well the system identifies all instances of each category", higherIsBetter: true },
      { name: "Balanced Performance (F1-Score)", description: "Harmonic mean of precision and recall", higherIsBetter: true },
      { name: "Discrimination Power (ROC-AUC)", description: "Ability to distinguish between different categories", higherIsBetter: true }
    ]
  },
  {
    category: "Code Generation",
    description: "Generating code snippets or entire functions based on natural language descriptions",
    template: "Write a {{language}} function that accomplishes the following:\n\nTask description: {{task_description}}\n\nInput parameters: {{input_parameters}}\nExpected output: {{expected_output}}\nError handling requirements: {{error_handling}}",
    businessImpact: "Accelerates development cycles, reduces debugging time, and lowers technical debt",
    metrics: [
      { name: "Test Pass Rate (Pass@k)", description: "Percentage of generated code that passes test cases", higherIsBetter: true },
      { name: "Code Correctness", description: "Whether the code executes correctly and produces expected outputs", higherIsBetter: true },
      { name: "Code Quality Score", description: "Assessment of code style, readability, and maintainability", higherIsBetter: true },
      { name: "Performance Rating", description: "Evaluation of computational efficiency and resource usage", higherIsBetter: true },
      { name: "Readability Index", description: "How easy the code is to understand by human developers", higherIsBetter: true }
    ]
  },
  {
    category: "Code Documentation / Explanation",
    description: "Generating comments, docstrings, or explanations for existing code",
    template: "Generate comprehensive documentation for the following code. Include purpose, parameters, return values, and examples of usage. Explain any complex logic or algorithms used.\n\n```\n{{code}}\n```",
    businessImpact: "Improves code maintainability, accelerates onboarding, and promotes best practices",
    metrics: [
      { name: "Explanation Clarity", description: "How clearly the documentation explains the code", higherIsBetter: true },
      { name: "Documentation Coverage", description: "Whether all important aspects of the code are documented", higherIsBetter: true },
      { name: "Accuracy Score", description: "Whether the explanation accurately describes what the code does", higherIsBetter: true },
      { name: "Developer Utility", description: "How helpful the documentation is for developers", higherIsBetter: true }
    ]
  },
  {
    category: "Data Analysis & Insights",
    description: "Analyzing data to generate summaries, identify trends, or answer business questions",
    template: "Analyze the following data and provide 3-5 key insights. Include any notable trends, anomalies, or patterns. Calculate relevant statistics when appropriate.\n\n{{data}}",
    businessImpact: "Accelerates decision making, identifies opportunities/risks earlier, and reduces analytical bottlenecks",
    metrics: [
      { name: "Analysis Accuracy", description: "Whether the analysis and calculations are correct", higherIsBetter: true },
      { name: "Business Value", description: "How valuable and actionable the insights are", higherIsBetter: true },
      { name: "Communication Quality", description: "How clearly the analysis is explained", higherIsBetter: true },
      { name: "Method Transparency", description: "Whether the analysis steps are clear enough to be reproduced", higherIsBetter: true }
    ]
  },
  {
    category: "Synthetic Data Generation",
    description: "Creating artificial data that mimics real-world data distributions",
    template: "Generate {{number}} synthetic examples of {{data_type}} that match the patterns, distributions, and characteristics of the provided samples. Ensure privacy-preserving properties by avoiding direct copying of the examples.\n\nSample data: {{samples}}",
    businessImpact: "Enables training with limited data, protects privacy, and supports testing edge cases",
    metrics: [
      { name: "Realism Score", description: "How closely the synthetic data resembles real data patterns", higherIsBetter: true },
      { name: "Privacy Protection", description: "Degree to which the synthetic data protects privacy of the original data", higherIsBetter: true },
      { name: "Practical Value", description: "How useful the synthetic data is for its intended purpose", higherIsBetter: true }
    ]
  },
  {
    category: "Conversational AI",
    description: "Automating internal support, answering employee questions, or facilitating workflows",
    template: "You are a helpful assistant for {{company_name}}. Respond to the following user message in a conversational, helpful tone. Use the provided context to inform your response, but keep your answer concise and direct.\n\nContext: {{context}}\n\nUser: {{message}}",
    businessImpact: "Reduces support costs, provides 24/7 assistance, and improves employee productivity",
    metrics: [
      { name: "Goal Achievement", description: "Percentage of conversations where the user's goal was achieved", higherIsBetter: true },
      { name: "Response Appropriateness", description: "How well responses address the user's queries", higherIsBetter: true },
      { name: "Information Accuracy", description: "Whether the provided information is factually correct", higherIsBetter: true },
      { name: "Conversation Flow", description: "How logically the conversation progresses", higherIsBetter: true },
      { name: "Response Quality", description: "Quality of individual responses in the conversation", higherIsBetter: true },
      { name: "User Experience", description: "Overall user satisfaction with the conversation", higherIsBetter: true }
    ]
  },
  {
    category: "Content Generation",
    description: "Drafting emails, reports, documentation, or other internal content",
    template: "Generate a {{content_type}} about {{topic}} with the following characteristics:\n- Tone: {{tone}}\n- Target audience: {{audience}}\n- Length: {{length}}\n- Key points to include: {{key_points}}",
    businessImpact: "Reduces content creation time by 60%, enables consistent messaging, and increases production volume",
    metrics: [
      { name: "Message Clarity", description: "How clearly the content communicates its message", higherIsBetter: true },
      { name: "Brevity Score", description: "Whether the content is appropriately brief and to the point", higherIsBetter: true },
      { name: "Tone Appropriateness", description: "How well the content's tone matches the intended audience and purpose", higherIsBetter: true },
      { name: "Language Quality", description: "Correctness of grammar and natural flow of language", higherIsBetter: true },
      { name: "Information Accuracy", description: "Whether the content contains factually correct information", higherIsBetter: true },
      { name: "Practical Value", description: "How useful the content is for its intended purpose", higherIsBetter: true }
    ]
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