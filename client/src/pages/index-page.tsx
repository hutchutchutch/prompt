import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LlmTaskShowcase } from "@/components/llm-task-showcase";
import { CyclingText } from "@/components/cycling-text";
import { examplePrompts } from "@/data/example-prompts";
import { useAuth } from "@/hooks/use-auth";

export default function IndexPage() {
  const { user, demoLoginMutation } = useAuth();
  const [selectedTaskType, setSelectedTaskType] = useState<string | null>(null);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const taskTypes = [
    "classification",
    "entityExtraction",
    "summarization",
    "documentation",
    "explanation"
  ];
  
  const currentTask = selectedTaskType || taskTypes[currentTaskIndex];
  const taskData = examplePrompts[currentTask as keyof typeof examplePrompts];
  const allTaskCategories = taskTypes.map(type => examplePrompts[type as keyof typeof examplePrompts].taskCategory);
  
  useEffect(() => {
    if (selectedTaskType) return; // Don't cycle if user has selected a tab
    
    const interval = setInterval(() => {
      setCurrentTaskIndex((current) => (current + 1) % taskTypes.length);
    }, 8000); // 8 seconds per task type
    
    return () => clearInterval(interval);
  }, [selectedTaskType]);
  
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
      <nav className="border-b bg-white">
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
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Pricing
              </Link>
              <Link
                href="#"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Docs
              </Link>
              <Button 
                variant="outline" 
                className="text-blue-600 border-blue-300 hover:bg-blue-50"
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
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
            <span className="block">Test Your</span>
            <span className="block text-primary">AI Prompts</span>
            <span className="block">Across All Models</span>
          </h1>
          <p className="mt-4 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Find the best model and prompt combination for your use case.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
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

        {/* What LLMs Do Well Section */}
        <div className="my-16">
          <h2 className="text-3xl font-bold mb-6">What LLMs Can Do For You</h2>
          
          {/* Task Type Tabs */}
          <div className="flex overflow-x-auto pb-2 mb-6 space-x-2 border-b">
            {taskTypes.map((taskType, index) => {
              const isActive = currentTask === taskType;
              const taskCategory = examplePrompts[taskType as keyof typeof examplePrompts].taskCategory;
              return (
                <button
                  key={taskType}
                  onClick={() => handleTaskSelect(taskType)}
                  className={`px-4 py-2 rounded-t-lg whitespace-nowrap transition-colors ${
                    isActive 
                      ? "bg-primary text-white font-medium"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700"
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
        <div className="my-16 bg-white rounded-lg shadow-md overflow-hidden max-w-4xl mx-auto">
          <CardHeader className="px-6 py-4 bg-primary text-white">
            <CardTitle className="text-xl font-semibold">Prompt of the Day: {taskData.taskCategory}</CardTitle>
          </CardHeader>
          
          <CardContent className="px-6 py-4">
            <div className="prompt-font text-sm bg-gray-50 p-4 rounded border border-gray-200 mb-4">
              {taskData.promptText}
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between">
              <div>
                <span className="font-medium">Best model: </span>
                <span className="text-primary">{taskData.bestQuality.model}</span>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
                <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                  Quality: {taskData.bestQuality.score.toFixed(1)}/10
                </Badge>
                <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                  Speed: {taskData.bestQuality.time}ms
                </Badge>
                <Badge variant="outline" className="bg-purple-100 text-purple-800 hover:bg-purple-100">
                  Cost: ${taskData.bestQuality.cost.toFixed(5)}
                </Badge>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex justify-between">
            {user ? (
              <Button variant="link" className="text-sm p-0 h-auto text-primary" asChild>
                <Link href="/wizard">
                  Try with your settings →
                </Link>
              </Button>
            ) : (
              <div className="flex gap-6">
                <Button variant="link" className="text-sm p-0 h-auto text-primary" asChild>
                  <Link href="/auth">
                    Sign in to try →
                  </Link>
                </Button>
                <Button 
                  variant="link" 
                  className="text-sm p-0 h-auto text-primary" 
                  onClick={() => demoLoginMutation.mutate()}
                  disabled={demoLoginMutation.isPending}
                >
                  {demoLoginMutation.isPending ? "Loading..." : "Try in demo mode →"}
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
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-blue-100 text-primary rounded-full flex items-center justify-center mb-4">
                <span className="text-xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Input your prompt</h3>
              <p className="text-gray-600">
                Enter your prompt and desired outcome criteria. We'll test
                multiple variations to find the best one.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-blue-100 text-primary rounded-full flex items-center justify-center mb-4">
                <span className="text-xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Select models</h3>
              <p className="text-gray-600">
                Choose from popular models across providers (OpenAI, Anthropic,
                Google, etc.) to test in parallel.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-blue-100 text-primary rounded-full flex items-center justify-center mb-4">
                <span className="text-xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Analyze results</h3>
              <p className="text-gray-600">
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
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="mb-4">
                <h3 className="text-lg font-semibold">Free Trial</h3>
                <div className="mt-2">
                  <span className="text-3xl font-bold">$0</span>
                  <span className="text-gray-500">/mo</span>
                </div>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <svg
                    className="h-5 w-5 text-green-500 mr-2"
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
                    className="h-5 w-5 text-green-500 mr-2"
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
                    className="h-5 w-5 text-green-500 mr-2"
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
                <li className="flex items-start text-gray-500">
                  <svg
                    className="h-5 w-5 text-gray-400 mr-2"
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
            <div className="bg-blue-50 p-6 rounded-lg shadow-sm border border-blue-200 relative">
              <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
                POPULAR
              </div>
              <div className="mb-4">
                <h3 className="text-lg font-semibold">Pro</h3>
                <div className="mt-2">
                  <span className="text-3xl font-bold">$29</span>
                  <span className="text-gray-500">/mo</span>
                </div>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <svg
                    className="h-5 w-5 text-green-500 mr-2"
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
                    className="h-5 w-5 text-green-500 mr-2"
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
                    className="h-5 w-5 text-green-500 mr-2"
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
                    className="h-5 w-5 text-green-500 mr-2"
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
              className="border border-gray-200 rounded-md"
            >
              <AccordionTrigger className="px-4 py-3 bg-white hover:bg-gray-50 font-medium text-left">
                What models does PromptLab support?
              </AccordionTrigger>
              <AccordionContent className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                <p className="text-gray-700">
                  PromptLab supports all major models from OpenAI (GPT-3.5,
                  GPT-4), Anthropic (Claude), Google (Gemini), Cohere, and more.
                  We add new models as they become available.
                </p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem
              value="item-2"
              className="border border-gray-200 rounded-md"
            >
              <AccordionTrigger className="px-4 py-3 bg-white hover:bg-gray-50 font-medium text-left">
                What is red-team testing?
              </AccordionTrigger>
              <AccordionContent className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                <p className="text-gray-700">
                  Red-team testing checks if your prompt is vulnerable to common
                  attacks like prompt injection, jailbreaking, or data leakage.
                  We run a series of tests to ensure your prompt is robust and
                  secure.
                </p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem
              value="item-3"
              className="border border-gray-200 rounded-md"
            >
              <AccordionTrigger className="px-4 py-3 bg-white hover:bg-gray-50 font-medium text-left">
                How does the pricing work?
              </AccordionTrigger>
              <AccordionContent className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                <p className="text-gray-700">
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
      <footer className="bg-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">PromptLab</h3>
              <p className="text-gray-400 text-sm">
                The all-in-one platform for benchmarking and securing your AI
                prompts.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <a href="#" className="hover:text-white">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="hover:text-white">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Security
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <a href="#" className="hover:text-white">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    API Reference
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Blog
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <a href="#" className="hover:text-white">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Privacy
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} PromptLab. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}
