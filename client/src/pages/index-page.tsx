import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LlmTaskShowcase } from "@/components/llm-task-showcase";
import { examplePrompts } from "@/data/example-prompts";
import { useAuth } from "@/hooks/use-auth";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { Crown } from "lucide-react";

export default function IndexPage() {
  const { user, demoLoginMutation, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const [selectedTaskType, setSelectedTaskType] = useState<string | null>(null);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);

  // For LLM showcase examples
  const taskTypes = [
    "classification",
    "entityExtraction",
    "summarization",
    "documentation",
    "explanation",
  ];

  // Model performance data for each category
  const modelPerformanceData = [
    {
      category: "Text Summarization",
      bestModel: "Claude 3 Opus",
      provider: "Anthropic",
      metrics: [
        { name: "Content Coverage (ROUGE-1)", score: 0.87 },
        { name: "Key Point Retention (ROUGE-2)", score: 0.79 },
        { name: "Flow Preservation (ROUGE-L)", score: 0.83 },
        { name: "Factual Accuracy", score: 0.96 },
      ],
    },
    {
      category: "Information Extraction",
      bestModel: "GPT-4",
      provider: "OpenAI",
      metrics: [
        { name: "Extraction Accuracy (Precision)", score: 0.92 },
        { name: "Extraction Completeness (Recall)", score: 0.88 },
        { name: "Overall Extraction Quality (F1-Score)", score: 0.9 },
        { name: "Structured Format Compliance", score: 0.95 },
      ],
    },
    {
      category: "Question Answering",
      bestModel: "Claude 3 Sonnet",
      provider: "Anthropic",
      metrics: [
        { name: "Perfect Match Rate (Exact Match)", score: 0.81 },
        { name: "Answer Overlap (F1-Score)", score: 0.89 },
        { name: "Factual Correctness", score: 0.94 },
        { name: "Question Relevance", score: 0.92 },
      ],
    },
    {
      category: "Text Classification",
      bestModel: "GPT-4",
      provider: "OpenAI",
      metrics: [
        { name: "Overall Correctness (Accuracy)", score: 0.95 },
        { name: "Classification Reliability (Precision)", score: 0.92 },
        { name: "Category Coverage (Recall)", score: 0.89 },
        { name: "Balanced Performance (F1-Score)", score: 0.91 },
      ],
    },
    {
      category: "Code Generation",
      bestModel: "Claude 3 Opus",
      provider: "Anthropic",
      metrics: [
        { name: "Test Pass Rate (Pass@k)", score: 0.91 },
        { name: "Code Correctness", score: 0.88 },
        { name: "Code Quality Score", score: 0.86 },
        { name: "Readability Index", score: 0.93 },
      ],
    },
    {
      category: "Conversational AI",
      bestModel: "Claude 3 Haiku",
      provider: "Anthropic",
      metrics: [
        { name: "Goal Achievement", score: 0.87 },
        { name: "Response Appropriateness", score: 0.92 },
        { name: "Information Accuracy", score: 0.9 },
        { name: "User Experience", score: 0.94 },
      ],
    },
  ];

  const currentTask = selectedTaskType || taskTypes[currentTaskIndex];
  const taskData = examplePrompts[currentTask as keyof typeof examplePrompts];
  const allTaskCategories = taskTypes.map(
    (type) => examplePrompts[type as keyof typeof examplePrompts].taskCategory,
  );

  // Only redirect if user is already authenticated
  useEffect(() => {
    // Only run after auth state is determined
    if (!isLoading && user) {
      // If already logged in, go to dashboard
      navigate("/dashboard");
    }
    // No automatic demo login - let users explore the landing page first
  }, [isLoading, user, navigate]);

  useEffect(() => {
    if (selectedTaskType) return; // Don't cycle if user has selected a tab

    const interval = setInterval(() => {
      setCurrentTaskIndex((current) => (current + 1) % taskTypes.length);
    }, 8000); // 8 seconds per task type

    return () => clearInterval(interval);
  }, [selectedTaskType]);

  // Cycle through categories for the hero animation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCategoryIndex(
        (current) => (current + 1) % modelPerformanceData.length,
      );
    }, 5000); // 5 seconds per category

    return () => clearInterval(interval);
  }, []);

  // Handle tab selection to pause animation
  const handleTaskSelect = (taskType: string) => {
    if (selectedTaskType === taskType) {
      // If clicking the already selected tab, resume animation
      setSelectedTaskType(null);
    } else {
      // Otherwise, select that tab and pause animation
      setSelectedTaskType(taskType);
    }
  };

  return (
    <main className="min-h-screen">
      {/* Navigation */}
      <nav className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <svg
                  className="h-8 w-8 text-primary"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z"
                    fill="currentColor"
                  />
                </svg>
                <span className="ml-2 text-xl font-bold">PromptLab</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="#pricing"
                className="text-muted-foreground hover:text-foreground px-3 py-2 rounded-md text-sm font-medium"
              >
                Pricing
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-foreground px-3 py-2 rounded-md text-sm font-medium"
              >
                Docs
              </Link>
              <Button
                variant="outline"
                onClick={() => demoLoginMutation.mutate()}
                disabled={demoLoginMutation.isPending}
              >
                {demoLoginMutation.isPending ? "Loading..." : "Try Demo"}
              </Button>
              {user ? (
                <Button asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
              ) : (
                <Button asChild>
                  <Link href="/auth">Sign In</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="mb-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left column: Heading and CTAs */}
          <div className="text-left">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
              <span className="block">Test Your</span>
              <span className="block text-primary">AI Prompts</span>
              <span className="block">Across All Models</span>
            </h1>
            <p className="mt-4 text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl max-w-xl">
              Find the best model and prompt combination for your specific use
              case. Compare performance, cost, and accuracy in one place.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button asChild size="lg">
                <Link href={user ? "/wizard" : "/auth"}>Try your prompt</Link>
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => demoLoginMutation.mutate()}
                disabled={demoLoginMutation.isPending}
              >
                {demoLoginMutation.isPending ? "Loading..." : "Try Demo Mode"}
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="#how-it-works">Learn more</Link>
              </Button>
            </div>
          </div>

          {/* Right column: Animated model performance card */}
          <div className="h-full flex items-center justify-center">
            <div className="bg-card rounded-lg shadow-md overflow-hidden w-full max-w-md transform transition-all duration-500 ease-in-out hover:shadow-lg border border-border">
              <div className="bg-primary text-primary-foreground px-6 py-4">
                <h3 className="text-lg font-semibold flex items-center justify-between">
                  <span
                    key={modelPerformanceData[currentCategoryIndex].category}
                    className="animate-fadeIn"
                  >
                    {modelPerformanceData[currentCategoryIndex].category}
                  </span>
                  <Badge
                    variant="outline"
                    className="bg-secondary text-secondary-foreground flex items-center gap-1"
                  >
                    <Crown 
                      className="h-4 w-4"
                      style={{ 
                        transformOrigin: "center",
                        animation: `wiggleGrow 1.5s ease-in-out`
                      }}
                      key={`crown-${currentCategoryIndex}`} 
                    />
                    Best Model
                  </Badge>
                </h3>
              </div>

              <style
                dangerouslySetInnerHTML={{
                  __html: `                
                @keyframes fadeIn {
                  0% { opacity: 0; }
                  100% { opacity: 1; }
                }
                
                @keyframes growWidth {
                  0% { width: 0%; }
                  100% { width: 100%; }
                }
                
                @keyframes wiggleGrow {
                  0% { transform: rotate(90deg) scale(1); }
                  25% { transform: rotate(80deg) scale(1.3); }
                  50% { transform: rotate(100deg) scale(1.3); }
                  75% { transform: rotate(85deg) scale(1.1); }
                  100% { transform: rotate(90deg) scale(1); }
                }
                
                .animate-fadeIn {
                  animation: fadeIn 0.5s ease-out;
                }
                
                .animate-wiggle-grow {
                  animation: wiggleGrow 1s ease-in-out;
                }
              `,
                }}
              />

              <div className="p-6">
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span
                      key={modelPerformanceData[currentCategoryIndex].bestModel}
                      className="text-2xl font-bold text-card-foreground animate-fadeIn"
                    >
                      {modelPerformanceData[currentCategoryIndex].bestModel}
                    </span>
                    <span
                      key={modelPerformanceData[currentCategoryIndex].provider}
                      className="text-sm text-muted-foreground animate-fadeIn"
                    >
                      {modelPerformanceData[currentCategoryIndex].provider}
                    </span>
                  </div>
                  <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-1000"
                      style={{
                        width: "92%",
                        animation: "growWidth 1s ease-out",
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-muted-foreground">
                      Performance Score
                    </span>
                    <div className="flex items-center">
                      <AnimatedNumber
                        value={92}
                        className="text-xs font-medium"
                        duration={1500}
                      />
                      <span className="text-xs font-medium">/100</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-card-foreground">
                    Evaluation Metrics
                  </h4>
                  {modelPerformanceData[currentCategoryIndex].metrics.map(
                    (metric, i) => (
                      <div
                        key={`${currentCategoryIndex}-${i}`}
                        className="space-y-1 animate-fadeIn"
                        style={{ animationDelay: `${i * 100}ms` }}
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">
                            {metric.name}
                          </span>
                          <AnimatedNumber
                            value={metric.score}
                            className="text-sm font-medium text-card-foreground"
                            formatOptions={{ decimals: 2 }}
                            duration={1500}
                          />
                        </div>
                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{
                              width: `${metric.score * 100}%`,
                              animation: `growWidth 1s ease-out ${i * 100 + 300}ms`,
                            }}
                          ></div>
                        </div>
                      </div>
                    ),
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-border">
                  <Button
                    variant="link"
                    className="text-sm p-0 h-auto text-primary"
                    asChild
                  >
                    <Link href={user ? "/wizard" : "/auth"}>
                      Try with your prompt →
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* What LLMs Do Well Section */}
        <div className="my-16">
          <h2 className="text-3xl font-bold mb-6">What LLMs Can Do For You</h2>

          {/* Task Type Tabs */}
          <div className="flex overflow-x-auto pb-2 mb-6 space-x-2 border-b">
            {taskTypes.map((taskType, index) => {
              const isActive = currentTask === taskType;
              const taskCategory =
                examplePrompts[taskType as keyof typeof examplePrompts]
                  .taskCategory;
              return (
                <button
                  key={taskType}
                  onClick={() => handleTaskSelect(taskType)}
                  className={`px-4 py-2 rounded-t-lg whitespace-nowrap transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground font-medium"
                      : "bg-card hover:bg-muted text-card-foreground"
                  } ${
                    currentTaskIndex === index && !selectedTaskType
                      ? "ring-2 ring-primary ring-opacity-50"
                      : ""
                  }`}
                >
                  {taskCategory}
                </button>
              );
            })}
          </div>

          <LlmTaskShowcase
            promptText={taskData.promptText}
            taskCategory={taskData.taskCategory}
            bestQuality={taskData.bestQuality}
            bestValue={taskData.bestValue}
            fastest={taskData.fastest}
            businessValue={taskData.businessValue}
          />
        </div>

        {/* Prompt of the Day */}
        <div className="my-16 bg-card rounded-lg shadow-md overflow-hidden max-w-4xl mx-auto border border-border">
          <CardHeader className="px-6 py-4 bg-primary text-primary-foreground">
            <CardTitle className="text-xl font-semibold">
              Prompt of the Day: {taskData.taskCategory}
            </CardTitle>
          </CardHeader>

          <CardContent className="px-6 py-4">
            <div className="prompt-font text-sm bg-muted p-4 rounded border border-border mb-4">
              {taskData.promptText}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between">
              <div>
                <span className="font-medium">Best model: </span>
                <span className="text-primary">
                  {taskData.bestQuality.model}
                </span>
              </div>

              <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
                <Badge
                  variant="secondary"
                  className="text-green-600 dark:text-green-400"
                >
                  Quality: {taskData.bestQuality.score.toFixed(1)}/10
                </Badge>
                <Badge
                  variant="secondary"
                  className="text-blue-600 dark:text-blue-400"
                >
                  Speed: {taskData.bestQuality.time}ms
                </Badge>
                <Badge
                  variant="secondary"
                  className="text-purple-600 dark:text-purple-400"
                >
                  Cost: ${taskData.bestQuality.cost.toFixed(5)}
                </Badge>
              </div>
            </div>
          </CardContent>

          <CardFooter className="px-6 py-3 bg-muted border-t border-border flex justify-between">
            {user ? (
              <Button
                variant="link"
                className="text-sm p-0 h-auto text-primary"
                asChild
              >
                <Link href="/wizard">Try with your settings →</Link>
              </Button>
            ) : (
              <div className="flex gap-6">
                <Button
                  variant="link"
                  className="text-sm p-0 h-auto text-primary"
                  asChild
                >
                  <Link href="/auth">Sign in to try →</Link>
                </Button>
                <Button
                  variant="link"
                  className="text-sm p-0 h-auto text-primary"
                  onClick={() => demoLoginMutation.mutate()}
                  disabled={demoLoginMutation.isPending}
                >
                  {demoLoginMutation.isPending
                    ? "Loading..."
                    : "Try in demo mode →"}
                </Button>
              </div>
            )}
          </CardFooter>
        </div>

        {/* How It Works Section */}
        <div id="how-it-works" className="my-16 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">
            How PromptLab Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
              <div className="w-12 h-12 bg-primary/20 text-primary rounded-full flex items-center justify-center mb-4">
                <span className="text-xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Input your prompt</h3>
              <p className="text-muted-foreground">
                Enter your prompt and desired outcome criteria. We'll test
                multiple variations to find the best one.
              </p>
            </div>
            <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
              <div className="w-12 h-12 bg-primary/20 text-primary rounded-full flex items-center justify-center mb-4">
                <span className="text-xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Select models</h3>
              <p className="text-muted-foreground">
                Choose from popular models across providers (OpenAI, Anthropic,
                Google, etc.) to test in parallel.
              </p>
            </div>
            <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
              <div className="w-12 h-12 bg-primary/20 text-primary rounded-full flex items-center justify-center mb-4">
                <span className="text-xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Analyze results</h3>
              <p className="text-muted-foreground">
                View performance metrics across cost, speed, and quality.
                Identify vulnerabilities with red-team testing.
              </p>
            </div>
          </div>
        </div>

        {/* Pricing Section */}
        <div id="pricing" className="my-16 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">
            Simple, Transparent Pricing
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
              <div className="mb-4">
                <h3 className="text-lg font-semibold">Free Trial</h3>
                <div className="mt-2">
                  <span className="text-3xl font-bold">$0</span>
                  <span className="text-muted-foreground">/mo</span>
                </div>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <svg
                    className="h-5 w-5 text-green-500 dark:text-green-400 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>5 prompt tests/month</span>
                </li>
                <li className="flex items-start">
                  <svg
                    className="h-5 w-5 text-green-500 dark:text-green-400 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>3 models per test</span>
                </li>
                <li className="flex items-start">
                  <svg
                    className="h-5 w-5 text-green-500 dark:text-green-400 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Basic quality metrics</span>
                </li>
                <li className="flex items-start text-muted-foreground">
                  <svg
                    className="h-5 w-5 text-muted-foreground mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>No red-team testing</span>
                </li>
              </ul>
              <Button className="w-full" variant="outline">
                Start free
              </Button>
            </div>
            <div className="bg-primary/10 p-6 rounded-lg shadow-sm border border-primary/30 relative">
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
                POPULAR
              </div>
              <div className="mb-4">
                <h3 className="text-lg font-semibold">Pro</h3>
                <div className="mt-2">
                  <span className="text-3xl font-bold">$29</span>
                  <span className="text-muted-foreground">/mo</span>
                </div>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <svg
                    className="h-5 w-5 text-green-500 dark:text-green-400 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Unlimited prompt tests</span>
                </li>
                <li className="flex items-start">
                  <svg
                    className="h-5 w-5 text-green-500 dark:text-green-400 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>All available models</span>
                </li>
                <li className="flex items-start">
                  <svg
                    className="h-5 w-5 text-green-500 dark:text-green-400 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Advanced analytics & charts</span>
                </li>
                <li className="flex items-start">
                  <svg
                    className="h-5 w-5 text-green-500 dark:text-green-400 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Red-team vulnerability testing</span>
                </li>
              </ul>
              <Button className="w-full">Get started</Button>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="my-16 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">
            Frequently Asked Questions
          </h2>
          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem
              value="item-1"
              className="border border-border rounded-md"
            >
              <AccordionTrigger className="px-4 py-3 bg-card hover:bg-muted font-medium text-left">
                What models does PromptLab support?
              </AccordionTrigger>
              <AccordionContent className="px-4 py-3 bg-muted border-t border-border">
                <p className="text-card-foreground">
                  PromptLab supports all major models from OpenAI (GPT-3.5,
                  GPT-4), Anthropic (Claude), Google (Gemini), Cohere, and more.
                  We add new models as they become available.
                </p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem
              value="item-2"
              className="border border-border rounded-md"
            >
              <AccordionTrigger className="px-4 py-3 bg-card hover:bg-muted font-medium text-left">
                What is red-team testing?
              </AccordionTrigger>
              <AccordionContent className="px-4 py-3 bg-muted border-t border-border">
                <p className="text-card-foreground">
                  Red-team testing checks if your prompt is vulnerable to common
                  attacks like prompt injection, jailbreaking, or data leakage.
                  We run a series of tests to ensure your prompt is robust and
                  secure.
                </p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem
              value="item-3"
              className="border border-border rounded-md"
            >
              <AccordionTrigger className="px-4 py-3 bg-card hover:bg-muted font-medium text-left">
                How does the pricing work?
              </AccordionTrigger>
              <AccordionContent className="px-4 py-3 bg-muted border-t border-border">
                <p className="text-card-foreground">
                  You pay a flat monthly subscription fee that covers all
                  testing. The only additional costs are the actual API calls to
                  the model providers, which are passed through at cost with no
                  markup.
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-primary-foreground dark:bg-slate-900 text-primary dark:text-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">PromptLab</h3>
              <p className="text-muted-foreground text-sm">
                The all-in-one platform for benchmarking and securing your AI
                prompts.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li>
                  <a
                    href="#"
                    className="hover:text-primary hover:dark:text-slate-100 transition-colors"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#pricing"
                    className="hover:text-primary hover:dark:text-slate-100 transition-colors"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-primary hover:dark:text-slate-100 transition-colors"
                  >
                    Security
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li>
                  <a
                    href="#"
                    className="hover:text-primary hover:dark:text-slate-100 transition-colors"
                  >
                    Documentation
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-primary hover:dark:text-slate-100 transition-colors"
                  >
                    API Reference
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-primary hover:dark:text-slate-100 transition-colors"
                  >
                    Blog
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li>
                  <a
                    href="#"
                    className="hover:text-primary hover:dark:text-slate-100 transition-colors"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-primary hover:dark:text-slate-100 transition-colors"
                  >
                    Contact
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-primary hover:dark:text-slate-100 transition-colors"
                  >
                    Privacy
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border text-center text-muted-foreground text-sm">
            &copy; {new Date().getFullYear()} PromptLab. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}
