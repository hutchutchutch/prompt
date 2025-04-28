# PromptLab: AI Prompt Testing & Optimization Platform

PromptLab is a comprehensive platform for testing, benchmarking, and optimizing AI prompts across multiple LLM models. The platform helps users develop and evaluate prompts for quality, cost, speed, and security.

## Features

- **Multi-Model Testing**: Test your prompts against various LLM models (OpenAI, Anthropic, Google) simultaneously
- **Real-time Progress**: Monitor test execution with real-time WebSocket updates
- **Performance Visualization**: Compare results with intuitive heatmaps and scatter plots
- **Red-Team Testing**: Evaluate prompt vulnerability to jailbreaking and other security concerns
- **Prompt Library**: Save and reuse your tested prompts for future reference
- **Framework Support**: Test different prompt engineering techniques (Chain-of-Thought, etc.)
- **Performance Metrics**: Get detailed metrics on quality, cost, and latency

## Dashboard

The dashboard provides an overview of key performance indicators:
- Top performing models by category
- Recent test results
- Quality and cost metrics
- Security vulnerability badges

## Wizard Interface

Create new prompt tests in three simple steps:
1. Select target models and frameworks
2. Enter your prompt
3. Launch the test and view real-time progress

## Results Analysis

- **Heat Map Matrix**: Color-coded visualization of model performance
- **Metric Comparison**: Compare quality scores, response times, and costs
- **Output Preview**: Review and compare actual model outputs
- **Red Team Report**: Security analysis of prompt vulnerabilities

## Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express
- **Database**: PostgreSQL with Drizzle ORM
- **Real-time**: WebSocket for live updates
- **Visualization**: Recharts for data visualization

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
npm start
```

## Usage

1. Create an account or use the demo login
2. Navigate to the Wizard to create a new prompt test
3. Review results on the Results page
4. Save successful prompts to your library for future use

## Project Structure

- `/client`: React frontend application
- `/server`: Express backend services
- `/shared`: Shared types and schemas