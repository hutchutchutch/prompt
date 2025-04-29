# PromptLab: AI Prompt Engineering and Model Evaluation Platform

PromptLab is a cutting-edge prompt engineering and AI model performance analysis platform that provides comprehensive evaluation and optimization tools for AI interactions. It allows users to test different prompt techniques with various AI models and compare their performance across multiple metrics.

![PromptLab Screenshot](https://placeholder-for-screenshot.png)

## 🚀 Features

### Interactive Evaluation Interface

- **Prompt Techniques Carousel**: Browse through different prompt engineering techniques (Chain of Thought, Few-Shot Learning, Expert Roleplay, etc.) with a smooth 3D carousel. Each card displays:
  - Color-coded task category badges
  - Clear prompt title and description
  - Estimated token count and cost metrics

- **Model Comparison Carousel**: Compare different AI models (Claude, GPT-4, Gemini, LLaMA, etc.) with detailed specification cards including:
  - Provider-based color coding (Anthropic, OpenAI, Google, etc.)
  - Cost per million tokens
  - Speed ratings
  - Context window sizes

- **Real-time Performance Evaluation**: Visualize model performance with animated metrics:
  - Overall quality score with star rating
  - Token usage breakdown (input/output)
  - Latency measurements (first token, total response time)
  - Cost analysis
  - Quality metrics (coverage, factual accuracy)

### Key Components

#### Wizard Interface
The wizard page features a two-column layout:
- Left column: Stacked carousels for prompt techniques and models
- Right column: Detailed evaluation card with animated metrics
- Central "Run Evaluation" button to trigger assessments

#### Hero Section
The main page features a dramatic hero section with:
- Headline: "Find Your Best Prompt With the Best Model"
- Animated background with teal accents
- Call-to-action button to start benchmarking

#### Dark Theme Design
Elegant dark mode interface with:
- Deep charcoal background (#121212)
- Teal accent colors (#4FF8E5)
- Soft text colors for readability (white #E0E0E0, gray #B0B0B0)
- Subtle glow effects on cards and buttons

## 🛠️ Technical Implementation

### Architecture
- **Frontend**: React with TypeScript
- **State Management**: Zustand for global state
- **Animations**: Framer Motion for fluid transitions
- **Styling**: Tailwind CSS with custom theme
- **Component Library**: Radix UI primitives with shadcn/ui
- **Metrics Visualization**: React Odometer for animated numbers

### Animation Details
- **Card Transitions**: Smooth animations between selected, peek, and hidden states
- **Evaluation Glow**: Dynamic glow effect based on model score
- **Staggered Page Animations**: Sequential component entry for improved UX
- **Interactive Hover States**: Responsive feedback on interactive elements

### Data Flow
1. User selects a prompt technique from the carousel
2. User selects an AI model to evaluate
3. System fetches/calculates performance metrics for the combination
4. Metrics are displayed with animated counters in the evaluation card
5. User can iterate through different combinations for comparison

## ⚙️ Core Interfaces

### Prompt Card
```tsx
interface PromptCard {
  id: string;          // "cot", "fewshot", etc.
  title: string;       // "Chain of Thought"
  task: string;        // "Explanation"
  content: string;     // Prompt text
}
```

### Model Card
```tsx
interface ModelCard {
  id: string;          // "claude-opus"
  title: string;       // "Claude 3 Opus"
  content: string;     // Sample output
}
```

### Evaluation Metrics
```tsx
interface EvalMetrics {
  promptId: string;        // Reference to prompt
  modelId: string;         // Reference to model
  score: number;           // 0-5 quality rating
  coverage: number;        // 0-1 content coverage
  factual: number;         // 0-1 factual accuracy
  tokensIn: number;        // Input token count
  tokensOut: number;       // Output token count
  latencyFirst: number;    // Time to first token (ms)
  latencyTotal: number;    // Total generation time (ms)
  costUsd: number;         // Cost in USD
}
```

## 🎯 Future Enhancements

- **Vulnerability Detection**: Red teaming capabilities to identify prompt injection risks
- **Custom Prompt Builder**: Tool to create and test your own prompts
- **Bulk Import/Export**: CSV import for batch testing
- **Team Collaboration**: Multi-user access and shared prompt libraries
- **Version History**: Track changes and improvements over time
- **Automatic Patch Suggestions**: AI-driven recommendations for prompt improvements

## 📦 Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
4. Open your browser to `localhost:5000`

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.