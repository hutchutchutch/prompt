import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import DashboardLayout from "@/components/dashboard-layout";
import { CalendarIcon, Timer, DollarSign, BarChart2, Award, Zap, TrendingUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { PromptTest } from "@/types";
import { Badge } from "@/components/ui/badge";
import { TaskCategorySelector } from "@/components/task-category-selector";
import { CategoryTabs } from "@/components/dashboard/category-tabs";
import { GlobalKPIBar } from "@/components/dashboard/global-kpi-bar";
import { taskCategories } from "@/data/task-categories";

// Define PromptResult interface for handling test results
interface PromptResult {
  id: number;
  testId: number;
  modelId: string;
  variantId: string; 
  output: string;
  qualityScore: number;
  costUsd: number;
  totalTime?: number;
  latencyMs?: number;
  firstTokenLatency?: number;
  vulnerabilityStatus: string;
  createdAt: string;
}

// Enhanced test data with performance metrics
interface EnhancedTestData extends PromptTest {
  category?: string;
  bestModel?: {
    modelId: string;
    score: number;
    cost: number;
    time: number | undefined;
  };
  averages?: {
    score: number;
    cost: number;
    time: number;
  };
  improvements?: {
    score: string;
    cost: string;
    time: string;
  };
}

// KPI data interface
interface KpiData {
  category: string;
  bestModel: {
    name: string;
    quality: number;
  };
  averageQuality: number;
  averageCost: number;
  averageSpeed: number;
  deltas: {
    quality: number;
    cost: number;
    speed: number;
  };
  metrics?: string[];
  highVariance: boolean;
  isEmpty?: boolean;
}

// Category data interface for API results
interface CategoryData {
  category: string;
  description: string;
  isNew: boolean;
}

export default function DashboardPage() {
  const { user, demoLoginMutation } = useAuth();
  const [, navigate] = useLocation();
  const [activeCategory, setActiveCategory] = useState<string>("All");

  // First, let's use the demo login to authenticate automatically for testing
  useEffect(() => {
    if (!user) {
      // Use the demo login mode to see test data
      demoLoginMutation.mutate();
    }
  }, [user, demoLoginMutation]);
  
  // Fetch available categories
  const { 
    data: categories,
    isLoading: isLoadingCategories 
  } = useQuery<CategoryData[]>({
    queryKey: ["/api/categories"],
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Fetch KPI data for the selected category
  const {
    data: kpiData,
    isLoading: isLoadingKpi
  } = useQuery<KpiData>({
    queryKey: ["/api/kpi", activeCategory],
    enabled: !!user && activeCategory !== "All",
    staleTime: 60 * 1000, // 1 minute
  });

  // Fetch recent tests - only when user is authenticated
  const { data: rawRecentTests, isLoading: isLoadingTests, error: testsError } = useQuery<PromptTest[]>({
    queryKey: ["/api/tests/recent", activeCategory],
    staleTime: 60000, // 1 minute
    enabled: !!user, // Only run this query if the user is authenticated
  });

  // Process tests to add enhanced data (for UI only)
  const [enhancedTests, setEnhancedTests] = useState<EnhancedTestData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch results for tests and enhance them with performance data
  useQuery({
    queryKey: ["enhancedTestData", rawRecentTests],
    enabled: !!rawRecentTests && rawRecentTests.length > 0,
    queryFn: async () => {
      try {
        setIsLoading(true);
        
        // Get demo categories for tests (in a real app, this would come from the DB)
        const demoCategories = [
          "Classification", "Summarization", "Entity Extraction", 
          "Text Generation", "Translation", "Sentiment Analysis"
        ];

        const enhancedTestsData = await Promise.all(
          (rawRecentTests || []).map(async (test) => {
            // Skip if test is not completed
            if (test.status !== "completed") {
              return {
                ...test,
                category: demoCategories[Math.floor(Math.random() * demoCategories.length)]
              } as EnhancedTestData;
            }

            try {
              // Fetch results for this test
              const resultsResponse = await fetch(`/api/tests/${test.id}/results`);
              if (!resultsResponse.ok) throw new Error('Failed to fetch results');
              
              const results = await resultsResponse.json() as PromptResult[];
              
              // Skip if no results
              if (!results || results.length === 0) {
                return test as EnhancedTestData;
              }

              // Normalize API data - handle both latencyMs and totalTime fields
              const normalizedResults = results.map(r => ({
                ...r,
                // If latencyMs exists, use it, otherwise use totalTime
                totalTime: r.latencyMs || r.totalTime
              }));

              // Calculate averages
              const avgScore = normalizedResults.reduce((sum, r) => sum + r.qualityScore, 0) / normalizedResults.length;
              const avgCost = normalizedResults.reduce((sum, r) => sum + r.costUsd, 0) / normalizedResults.length;
              const avgTime = normalizedResults.reduce((sum, r) => sum + (r.totalTime || 0), 0) / normalizedResults.length;

              // Find best model (by quality score)
              const bestResult = [...normalizedResults].sort((a, b) => b.qualityScore - a.qualityScore)[0];
              
              // Calculate improvements (percentage better than average)
              const scoreDiff = ((bestResult.qualityScore - avgScore) / avgScore * 100).toFixed(0);
              const costDiff = ((avgCost - bestResult.costUsd) / avgCost * 100).toFixed(0);
              const timeDiff = ((avgTime - (bestResult.totalTime || 0)) / avgTime * 100).toFixed(0);

              // Return enhanced test data
              return {
                ...test,
                category: demoCategories[Math.floor(Math.random() * demoCategories.length)],
                bestModel: {
                  modelId: bestResult.modelId,
                  score: bestResult.qualityScore,
                  cost: bestResult.costUsd,
                  time: bestResult.totalTime
                },
                averages: {
                  score: avgScore,
                  cost: avgCost,
                  time: avgTime
                },
                improvements: {
                  score: scoreDiff,
                  cost: costDiff,
                  time: timeDiff
                }
              };
            } catch (err) {
              console.error(`Error fetching results for test ${test.id}:`, err);
              return test as EnhancedTestData;
            }
          })
        );

        setEnhancedTests(enhancedTestsData);
        setIsLoading(false);
        return enhancedTestsData;
      } catch (err) {
        console.error('Error enhancing test data:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
        setIsLoading(false);
        return [];
      }
    }
  });

  // Status badges styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Completed</Badge>;
      case "running":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Running</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  return (
    <DashboardLayout>
      {/* 1. Page Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Welcome back, {user?.username}
          </p>
        </div>
        <Button asChild>
          <Link href="/wizard">New Evaluation</Link>
        </Button>
      </div>

      {/* 2. Summary / Recommendation Area */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Evaluation Summary</h2>
              <p className="text-sm text-gray-600 mb-3">
                Prompt Version 3 with LLM <span className="font-medium">Claude 3</span> performed best for 
                <span className="font-medium"> Summarization</span> based on ROUGE-L and Cost.
              </p>
              <p className="text-sm text-gray-500 mb-2">
                Key justification: Highest ROUGE-L score (0.78) with moderate estimated cost ($0.05 / 1k calls).
              </p>
            </div>
            <div className="flex-shrink-0 flex flex-col md:flex-row gap-3">
              <div className="p-3 bg-gray-50 rounded-lg text-center min-w-[100px]">
                <p className="text-xs text-gray-500 mb-1">Quality Score</p>
                <p className="text-xl font-semibold text-gray-900">8.7<span className="text-xs text-gray-500">/10</span></p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg text-center min-w-[100px]">
                <p className="text-xs text-gray-500 mb-1">Est. Cost/1k</p>
                <p className="text-xl font-semibold text-gray-900">$0.05</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg text-center min-w-[100px]">
                <p className="text-xs text-gray-500 mb-1">Latency</p>
                <p className="text-xl font-semibold text-gray-900">1.2s</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Context / Input Summary Area */}
      <Card className="mb-8">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Evaluation Context</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-1">Task Type</h3>
              <div className="text-sm bg-blue-50 text-blue-700 py-1 px-2 rounded inline-block">Summarization</div>
              
              <h3 className="text-sm font-medium text-gray-700 mt-4 mb-1">Original Prompt</h3>
              <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded border border-gray-100">
                Summarize the following text in 2-3 sentences while preserving the key points and main message.
              </p>
              
              <h3 className="text-sm font-medium text-gray-700 mt-4 mb-1">LLMs Tested</h3>
              <div className="flex flex-wrap gap-2">
                <div className="text-xs bg-gray-100 text-gray-700 py-1 px-2 rounded">GPT-4</div>
                <div className="text-xs bg-gray-100 text-gray-700 py-1 px-2 rounded">Claude 3</div>
                <div className="text-xs bg-gray-100 text-gray-700 py-1 px-2 rounded">Llama 3</div>
                <div className="text-xs bg-gray-100 text-gray-700 py-1 px-2 rounded">Mistral</div>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-1">Expected Output</h3>
              <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded border border-gray-100 h-20 overflow-auto">
                A concise summary that covers the main topics of the source text while maintaining accuracy and coherence.
              </p>
              
              <h3 className="text-sm font-medium text-gray-700 mt-4 mb-1">Evaluation Metrics</h3>
              <div className="flex flex-wrap gap-2">
                <div className="text-xs bg-primary/10 text-primary py-1 px-2 rounded">ROUGE-L</div>
                <div className="text-xs bg-primary/10 text-primary py-1 px-2 rounded">Compression Ratio</div>
                <div className="text-xs bg-primary/10 text-primary py-1 px-2 rounded">Faithfulness</div>
                <div className="text-xs bg-primary/10 text-primary py-1 px-2 rounded">Coherence</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Category Navigation */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Best Model by Category</h2>
        {isLoadingCategories ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <CategoryTabs 
            categories={categories ? categories.map(c => ({ 
              category: c.category, 
              description: c.description,
              template: "",
              businessImpact: ""
            })) : taskCategories}
            active={activeCategory}
            onChange={setActiveCategory}
            newCategories={categories ? categories.filter(c => c.isNew).map(c => c.category) : []}
          />
        )}
        
        {/* Global KPI bar for the selected category */}
        {activeCategory !== "All" && (
          <>
            {isLoadingKpi ? (
              <div className="flex justify-center py-4 my-4 bg-gray-50 rounded-lg">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : kpiData ? (
              <GlobalKPIBar 
                category={activeCategory}
                bestModel={kpiData.bestModel}
                averageQuality={kpiData.averageQuality}
                averageCost={kpiData.averageCost}
                averageSpeed={kpiData.averageSpeed}
                deltas={kpiData.deltas}
                metrics={kpiData.metrics}
                highVariance={kpiData.highVariance}
                isEmpty={kpiData.isEmpty}
                onModelClick={(model) => navigate(`/models/${model}`)}
              />
            ) : (
              <div className="p-4 my-4 bg-gray-50 text-gray-500 text-sm rounded-lg">
                No performance data available for this category
              </div>
            )}
          </>
        )}
      </div>

      {/* 4. Main Content Area (Tabbed/Segmented View) */}
      <div className="mt-8">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Detailed Comparison Results</h2>
          
          <Tabs defaultValue="prompts" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="prompts" className="text-sm">Prompt Comparison</TabsTrigger>
              <TabsTrigger value="models" className="text-sm">LLM Comparison</TabsTrigger>
            </TabsList>
            
            <TabsContent value="prompts" className="space-y-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-medium">Prompt Versions Comparison</CardTitle>
                  <p className="text-sm text-gray-500">
                    Performance across different prompt variations
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="relative overflow-x-auto rounded-md border">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs bg-gray-50 text-gray-700">
                          <tr>
                            <th className="px-4 py-3 font-medium">Prompt Version</th>
                            <th className="px-4 py-3 font-medium">Quality Score</th>
                            <th className="px-4 py-3 font-medium">ROUGE-L</th>
                            <th className="px-4 py-3 font-medium">Compression</th>
                            <th className="px-4 py-3 font-medium">Cost ($)</th>
                            <th className="px-4 py-3 font-medium">Latency (ms)</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b hover:bg-gray-50">
                            <td className="px-4 py-3">Original</td>
                            <td className="px-4 py-3">7.6</td>
                            <td className="px-4 py-3">0.65</td>
                            <td className="px-4 py-3">24%</td>
                            <td className="px-4 py-3">0.08</td>
                            <td className="px-4 py-3">980</td>
                          </tr>
                          <tr className="border-b hover:bg-gray-50">
                            <td className="px-4 py-3">Version 2</td>
                            <td className="px-4 py-3">8.2</td>
                            <td className="px-4 py-3">0.72</td>
                            <td className="px-4 py-3">22%</td>
                            <td className="px-4 py-3">0.06</td>
                            <td className="px-4 py-3">850</td>
                          </tr>
                          <tr className="border-b bg-green-50 hover:bg-green-100">
                            <td className="px-4 py-3 font-medium">Version 3 (Best)</td>
                            <td className="px-4 py-3 font-medium">8.7</td>
                            <td className="px-4 py-3 font-medium">0.78</td>
                            <td className="px-4 py-3 font-medium">20%</td>
                            <td className="px-4 py-3 font-medium">0.05</td>
                            <td className="px-4 py-3 font-medium">920</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="h-64 bg-gray-50 rounded-md p-4 flex items-center justify-center">
                        <p className="text-sm text-gray-500">ROUGE-L Score Chart</p>
                      </div>
                      <div className="h-64 bg-gray-50 rounded-md p-4 flex items-center justify-center">
                        <p className="text-sm text-gray-500">Cost vs Quality Chart</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="models" className="space-y-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-medium">LLM Performance Comparison</CardTitle>
                  <p className="text-sm text-gray-500">
                    Comparison across different models using the best prompt (Version 3)
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="relative overflow-x-auto rounded-md border">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs bg-gray-50 text-gray-700">
                          <tr>
                            <th className="px-4 py-3 font-medium">Model</th>
                            <th className="px-4 py-3 font-medium">Quality Score</th>
                            <th className="px-4 py-3 font-medium">ROUGE-L</th>
                            <th className="px-4 py-3 font-medium">Faithfulness</th>
                            <th className="px-4 py-3 font-medium">Cost ($)</th>
                            <th className="px-4 py-3 font-medium">Latency (ms)</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b hover:bg-gray-50">
                            <td className="px-4 py-3">GPT-4</td>
                            <td className="px-4 py-3">8.5</td>
                            <td className="px-4 py-3">0.76</td>
                            <td className="px-4 py-3">0.89</td>
                            <td className="px-4 py-3">0.12</td>
                            <td className="px-4 py-3">1100</td>
                          </tr>
                          <tr className="border-b bg-green-50 hover:bg-green-100">
                            <td className="px-4 py-3 font-medium">Claude 3 (Best)</td>
                            <td className="px-4 py-3 font-medium">8.7</td>
                            <td className="px-4 py-3 font-medium">0.78</td>
                            <td className="px-4 py-3 font-medium">0.92</td>
                            <td className="px-4 py-3 font-medium">0.05</td>
                            <td className="px-4 py-3 font-medium">920</td>
                          </tr>
                          <tr className="border-b hover:bg-gray-50">
                            <td className="px-4 py-3">Llama 3</td>
                            <td className="px-4 py-3">8.1</td>
                            <td className="px-4 py-3">0.74</td>
                            <td className="px-4 py-3">0.86</td>
                            <td className="px-4 py-3">0.02</td>
                            <td className="px-4 py-3">750</td>
                          </tr>
                          <tr className="border-b hover:bg-gray-50">
                            <td className="px-4 py-3">Mistral</td>
                            <td className="px-4 py-3">7.9</td>
                            <td className="px-4 py-3">0.71</td>
                            <td className="px-4 py-3">0.84</td>
                            <td className="px-4 py-3">0.01</td>
                            <td className="px-4 py-3">680</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="h-64 bg-gray-50 rounded-md p-4 flex items-center justify-center">
                        <p className="text-sm text-gray-500">Performance Radar Chart</p>
                      </div>
                      <div className="h-64 bg-gray-50 rounded-md p-4 flex items-center justify-center">
                        <p className="text-sm text-gray-500">Latency Distribution</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* 5. Recent Tests Section */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Evaluation History</h2>
        
        {!user ? (
          <Card>
            <CardContent className="h-40 flex flex-col items-center justify-center">
              <p className="text-sm text-gray-500 mb-4">Authenticating with demo mode...</p>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </CardContent>
          </Card>
        ) : isLoading ? (
          <Card>
            <CardContent className="h-40 flex flex-col items-center justify-center">
              <p className="text-sm text-gray-500 mb-4">Loading evaluation data...</p>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </CardContent>
          </Card>
        ) : error ? (
          <Card>
            <CardContent className="h-40 flex items-center justify-center">
              <p className="text-sm text-gray-500">Error loading evaluation history</p>
            </CardContent>
          </Card>
        ) : enhancedTests?.length === 0 ? (
          <Card>
            <CardContent className="h-40 flex flex-col items-center justify-center">
              <p className="text-sm text-gray-500 mb-4">You haven't run any evaluations yet</p>
              <Button asChild>
                <Link href="/wizard">Run your first evaluation</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {enhancedTests.map((test: EnhancedTestData) => (
                <li key={test.id}>
                  <div className="block hover:bg-gray-50 cursor-pointer" onClick={() => 
                    navigate(test.status === "completed" ? `/results/${test.id}` : `/wizard/progress?testId=${test.id}`)
                  }>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="truncate">
                          <div className="flex items-center">
                            <p className="text-sm font-medium text-primary truncate">
                              {test.promptText.length > 50 
                                ? `${test.promptText.substring(0, 50)}...` 
                                : test.promptText}
                            </p>
                            <div className="ml-2">
                              {getStatusBadge(test.status)}
                            </div>
                          </div>
                          {/* Task Category Tag */}
                          {test.category && (
                            <div className="mt-1 mb-2">
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">
                                {test.category}
                              </Badge>
                            </div>
                          )}
                          
                          {/* Date and Security Info */}
                          <div className="mt-1 flex flex-wrap">
                            <div className="flex items-center text-sm text-gray-500 mr-4">
                              <CalendarIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                              <span>{formatDistanceToNow(new Date(test.createdAt), { addSuffix: true })}</span>
                            </div>
                            {test.redTeamEnabled && (
                              <div className="flex items-center text-sm text-gray-500 mr-4">
                                <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                <span>Red-team enabled</span>
                              </div>
                            )}
                            
                            {/* Best Model Section - Only shown for completed tests with best model info */}
                            {test.status === "completed" && test.bestModel && (
                              <div className="flex items-center text-sm text-gray-500">
                                <Award className="flex-shrink-0 mr-1.5 h-5 w-5 text-yellow-500" />
                                <span className="font-medium text-gray-700">Best: {test.bestModel.modelId}</span>
                              </div>
                            )}
                          </div>
                          
                          {/* Performance Metrics - Only shown for completed tests */}
                          {test.status === "completed" && test.bestModel && test.improvements && (
                            <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                              <div className="flex items-center">
                                <BarChart2 className="h-3 w-3 mr-1 text-green-500" />
                                <span className="text-gray-600">Quality: </span>
                                <span className="ml-1 font-medium">{test.bestModel.score.toFixed(1)}</span>
                                {parseInt(test.improvements.score) > 0 && (
                                  <span className="ml-1 text-green-600">+{test.improvements.score}%</span>
                                )}
                              </div>
                              <div className="flex items-center">
                                <DollarSign className="h-3 w-3 mr-1 text-blue-500" />
                                <span className="text-gray-600">Cost: </span>
                                <span className="ml-1 font-medium">${test.bestModel.cost.toFixed(3)}</span>
                                {parseInt(test.improvements.cost) > 0 && (
                                  <span className="ml-1 text-green-600">-{test.improvements.cost}%</span>
                                )}
                              </div>
                              <div className="flex items-center">
                                <Zap className="h-3 w-3 mr-1 text-purple-500" />
                                <span className="text-gray-600">Speed: </span>
                                <span className="ml-1 font-medium">
                                  {test.bestModel?.time !== undefined ? test.bestModel.time.toFixed(1) : "0.0"}ms
                                </span>
                                {parseInt(test.improvements.time) > 0 && (
                                  <span className="ml-1 text-green-600">-{test.improvements.time}%</span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="ml-5 flex-shrink-0">
                          <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
