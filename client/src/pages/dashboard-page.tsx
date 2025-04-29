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

  // Dashboard already uses ProtectedRoute, so we don't need to handle 
  // redirection or automatic login here - protected route will do that
  
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
        return <Badge className="bg-green-100 text-green-800 border-green-200 dark:bg-[rgba(79,248,229,0.1)] dark:text-[#4FF8E5] dark:border-[#4FF8E5]/20 dark:px-3 dark:py-1 dark:rounded-md">Completed</Badge>;
      case "running":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-[rgba(255,193,7,0.1)] dark:text-[#FFC107] dark:border-[#FFC107]/20 dark:px-3 dark:py-1 dark:rounded-md">Running</Badge>;
      case "failed":
        return <Badge className="dark:bg-[rgba(255,92,92,0.1)] dark:text-[#FF5C5C] dark:border-[#FF5C5C]/20 dark:px-3 dark:py-1 dark:rounded-md">Failed</Badge>;
      default:
        return <Badge className="dark:bg-[#232323] dark:text-[#AAAAAA] dark:border-[#2A2A2A] dark:px-3 dark:py-1 dark:rounded-md">Pending</Badge>;
    }
  };

  return (
    <DashboardLayout>
      {/* 1. Page Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold dark:text-[#E0E0E0] dark:font-light">Dashboard</h1>
          <p className="text-sm text-muted-foreground dark:text-[#B0B0B0] mt-1">
            Welcome back, {user?.username}
          </p>
        </div>
        <Button 
          className="dark:bg-[#1D1D1D] dark:text-[#4FF8E5] dark:hover:bg-[#252525] dark:border dark:border-[#2A2A2A] dark:hover:shadow-[0_0_8px_rgba(79,248,229,0.5)] dark:transition-all dark:duration-300 dark:rounded-lg"
          onClick={() => {
            console.log('Navigating to /wizard');
            navigate('/wizard');
          }}
        >
          New Evaluation
        </Button>
      </div>

      {/* 2. Summary / Recommendation Area */}
      <Card className="mb-6 dark:bg-[#1A1A1A] dark:border-[#2A2A2A] dark:shadow-[0_4px_12px_rgba(0,0,0,0.3)] dark:hover:shadow-[0_8px_16px_rgba(0,0,0,0.3),0_0_0_1px_rgba(79,248,229,0.05)] dark:transition-all dark:duration-300 dark:rounded-xl dark:overflow-hidden">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <h2 className="text-lg font-semibold mb-1 dark:text-[#E0E0E0] dark:font-light">Evaluation Summary</h2>
              <p className="text-sm text-card-foreground dark:text-[#E0E0E0] mb-3">
                Prompt Version 3 with LLM <span className="font-medium dark:text-[#00F0FF]">Claude 3</span> performed best for 
                <span className="font-medium dark:text-[#00F0FF]"> Summarization</span> based on ROUGE-L and Cost.
              </p>
              <p className="text-sm text-muted-foreground dark:text-[#B0B0B0] mb-2">
                Key justification: Highest ROUGE-L score (0.78) with moderate estimated cost ($0.05 / 1k calls).
              </p>
            </div>
            <div className="flex-shrink-0 flex flex-col md:flex-row gap-3">
              <div className="p-4 bg-muted dark:bg-[#1D1D1D] dark:border dark:border-[#2A2A2A] rounded-xl text-center min-w-[110px] dark:shadow-[0_4px_12px_rgba(0,0,0,0.2)] dark:hover:shadow-[0_6px_16px_rgba(0,0,0,0.3),0_0_0_1px_rgba(79,248,229,0.05)] dark:transition-all dark:duration-300">
                <p className="text-xs text-muted-foreground dark:text-[#B0B0B0] dark:uppercase dark:tracking-wider dark:font-medium metric-label mb-2">Quality Score</p>
                <p className="text-2xl font-semibold dark:text-[#4FF8E5] dark:font-light metric-value">8.7<span className="text-xs text-muted-foreground dark:text-[#B0B0B0] ml-1">/10</span></p>
              </div>
              <div className="p-4 bg-muted dark:bg-[#1D1D1D] dark:border dark:border-[#2A2A2A] rounded-xl text-center min-w-[110px] dark:shadow-[0_4px_12px_rgba(0,0,0,0.2)] dark:hover:shadow-[0_6px_16px_rgba(0,0,0,0.3),0_0_0_1px_rgba(79,248,229,0.05)] dark:transition-all dark:duration-300">
                <p className="text-xs text-muted-foreground dark:text-[#B0B0B0] dark:uppercase dark:tracking-wider dark:font-medium metric-label mb-2">Est. Cost/1k</p>
                <p className="text-2xl font-semibold dark:text-[#4FF8E5] dark:font-light metric-value">$0.05</p>
              </div>
              <div className="p-4 bg-muted dark:bg-[#1D1D1D] dark:border dark:border-[#2A2A2A] rounded-xl text-center min-w-[110px] dark:shadow-[0_4px_12px_rgba(0,0,0,0.2)] dark:hover:shadow-[0_6px_16px_rgba(0,0,0,0.3),0_0_0_1px_rgba(79,248,229,0.05)] dark:transition-all dark:duration-300">
                <p className="text-xs text-muted-foreground dark:text-[#B0B0B0] dark:uppercase dark:tracking-wider dark:font-medium metric-label mb-2">Latency</p>
                <p className="text-2xl font-semibold dark:text-[#4FF8E5] dark:font-light metric-value">1.2s</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Context / Input Summary Area */}
      <Card className="mb-8 dark:bg-[#1A1A1A] dark:border-[#2A2A2A] dark:shadow-[0_4px_12px_rgba(0,0,0,0.3)] dark:hover:shadow-[0_8px_16px_rgba(0,0,0,0.3),0_0_0_1px_rgba(79,248,229,0.05)] dark:transition-all dark:duration-300 dark:rounded-xl dark:overflow-hidden">
        <CardHeader className="pb-2 dark:border-b dark:border-[#2A2A2A]">
          <CardTitle className="text-base font-medium dark:text-[#E0E0E0] dark:font-light">Evaluation Context</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium mb-1 dark:text-[#B0B0B0] dark:uppercase dark:tracking-wider dark:text-xs dark:font-medium metric-label">Task Type</h3>
              <div className="text-sm bg-blue-950/20 dark:bg-[rgba(0,240,255,0.08)] text-blue-700 dark:text-[#00F0FF] py-1 px-2 rounded inline-block">Summarization</div>
              
              <h3 className="text-sm font-medium mt-4 mb-1 dark:text-[#B0B0B0] dark:uppercase dark:tracking-wider dark:text-xs dark:font-medium metric-label">Original Prompt</h3>
              <p className="text-sm text-card-foreground dark:text-[#E0E0E0] bg-muted dark:bg-[#232323] p-2 rounded border border-border dark:border-[#2A2A2A]">
                Summarize the following text in 2-3 sentences while preserving the key points and main message.
              </p>
              
              <h3 className="text-sm font-medium mt-4 mb-1 dark:text-[#B0B0B0] dark:uppercase dark:tracking-wider dark:text-xs dark:font-medium metric-label">LLMs Tested</h3>
              <div className="flex flex-wrap gap-2">
                <div className="text-xs bg-muted dark:bg-[#232323] text-card-foreground dark:text-[#E0E0E0] py-1 px-2 rounded border dark:border-[#2A2A2A]">GPT-4</div>
                <div className="text-xs bg-muted dark:bg-[#232323] text-card-foreground dark:text-[#E0E0E0] py-1 px-2 rounded border dark:border-[#2A2A2A]">Claude 3</div>
                <div className="text-xs bg-muted dark:bg-[#232323] text-card-foreground dark:text-[#E0E0E0] py-1 px-2 rounded border dark:border-[#2A2A2A]">Llama 3</div>
                <div className="text-xs bg-muted dark:bg-[#232323] text-card-foreground dark:text-[#E0E0E0] py-1 px-2 rounded border dark:border-[#2A2A2A]">Mistral</div>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-1 dark:text-[#B0B0B0] dark:uppercase dark:tracking-wider dark:text-xs dark:font-medium metric-label">Expected Output</h3>
              <p className="text-sm text-card-foreground dark:text-[#E0E0E0] bg-muted dark:bg-[#232323] p-2 rounded border border-border dark:border-[#2A2A2A] h-20 overflow-auto">
                A concise summary that covers the main topics of the source text while maintaining accuracy and coherence.
              </p>
              
              <h3 className="text-sm font-medium mt-4 mb-1 dark:text-[#B0B0B0] dark:uppercase dark:tracking-wider dark:text-xs dark:font-medium metric-label">Evaluation Metrics</h3>
              <div className="flex flex-wrap gap-2">
                <div className="text-xs bg-primary/10 dark:bg-[rgba(0,240,255,0.1)] text-primary dark:text-[#00F0FF] py-1 px-2 rounded dark:border dark:border-[#00F0FF]/20">ROUGE-L</div>
                <div className="text-xs bg-primary/10 dark:bg-[rgba(0,240,255,0.1)] text-primary dark:text-[#00F0FF] py-1 px-2 rounded dark:border dark:border-[#00F0FF]/20">Compression Ratio</div>
                <div className="text-xs bg-primary/10 dark:bg-[rgba(0,240,255,0.1)] text-primary dark:text-[#00F0FF] py-1 px-2 rounded dark:border dark:border-[#00F0FF]/20">Faithfulness</div>
                <div className="text-xs bg-primary/10 dark:bg-[rgba(0,240,255,0.1)] text-primary dark:text-[#00F0FF] py-1 px-2 rounded dark:border dark:border-[#00F0FF]/20">Coherence</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Category Navigation */}
      <div>
        <h2 className="text-lg font-medium mb-4 dark:text-[#E0E0E0] dark:font-light">Best Model by Category</h2>
        {isLoadingCategories ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary dark:border-[#00F0FF]"></div>
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
              <div className="flex justify-center py-4 my-4 bg-muted rounded-lg">
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
              <div className="p-4 my-4 bg-muted text-muted-foreground text-sm rounded-lg">
                No performance data available for this category
              </div>
            )}
          </>
        )}
      </div>

      {/* 4. Main Content Area (Tabbed/Segmented View) */}
      <div className="mt-8">
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4 dark:text-[#E0E0E0] dark:font-light">Detailed Comparison Results</h2>
          
          <Tabs defaultValue="prompts" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 dark:bg-[#1A1A1A] dark:border dark:border-[#2A2A2A] p-1 rounded-lg">
              <TabsTrigger 
                value="prompts" 
                className="text-sm dark:text-[#CCCCCC] dark:hover:bg-[#232323] transition-all duration-200 rounded-md
                  data-[state=active]:dark:bg-[#252525] data-[state=active]:dark:text-[#4FF8E5] data-[state=active]:dark:border data-[state=active]:dark:border-[#4FF8E5]/20 data-[state=active]:dark:shadow-[0_0_6px_rgba(79,248,229,0.2)]"
              >
                Prompt Comparison
              </TabsTrigger>
              <TabsTrigger 
                value="models" 
                className="text-sm dark:text-[#CCCCCC] dark:hover:bg-[#232323] transition-all duration-200 rounded-md
                  data-[state=active]:dark:bg-[#252525] data-[state=active]:dark:text-[#4FF8E5] data-[state=active]:dark:border data-[state=active]:dark:border-[#4FF8E5]/20 data-[state=active]:dark:shadow-[0_0_6px_rgba(79,248,229,0.2)]"
              >
                LLM Comparison
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="prompts" className="space-y-6">
              <Card className="dark:bg-[#1A1A1A] dark:border-[#2A2A2A] dark:shadow-[0_4px_12px_rgba(0,0,0,0.3)] dark:hover:shadow-[0_8px_16px_rgba(0,0,0,0.3),0_0_0_1px_rgba(79,248,229,0.05)] dark:transition-all dark:duration-300 dark:rounded-xl dark:overflow-hidden">
                <CardHeader className="pb-3 dark:border-b dark:border-[#2A2A2A]">
                  <CardTitle className="text-base font-medium dark:text-[#E0E0E0] dark:font-light">Prompt Versions Comparison</CardTitle>
                  <p className="text-sm text-muted-foreground dark:text-[#B0B0B0]">
                    Performance across different prompt variations
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="relative overflow-x-auto rounded-md border border-border dark:border-[#2A2A2A] dark:shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
                      <table className="w-full text-sm text-left dark:text-[#E0E0E0]">
                        <thead className="text-xs bg-muted dark:bg-[#232323] text-card-foreground dark:text-[#B0B0B0]">
                          <tr>
                            <th className="px-4 py-3 font-medium dark:uppercase dark:tracking-wider dark:text-xs">Prompt Version</th>
                            <th className="px-4 py-3 font-medium dark:uppercase dark:tracking-wider dark:text-xs">Quality Score</th>
                            <th className="px-4 py-3 font-medium dark:uppercase dark:tracking-wider dark:text-xs">ROUGE-L</th>
                            <th className="px-4 py-3 font-medium dark:uppercase dark:tracking-wider dark:text-xs">Compression</th>
                            <th className="px-4 py-3 font-medium dark:uppercase dark:tracking-wider dark:text-xs">Cost ($)</th>
                            <th className="px-4 py-3 font-medium dark:uppercase dark:tracking-wider dark:text-xs">Latency (ms)</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-border dark:border-[#2A2A2A] hover:bg-muted/50 dark:hover:bg-[#232323]">
                            <td className="px-4 py-3">Original</td>
                            <td className="px-4 py-3">7.6</td>
                            <td className="px-4 py-3">0.65</td>
                            <td className="px-4 py-3">24%</td>
                            <td className="px-4 py-3">0.08</td>
                            <td className="px-4 py-3">980</td>
                          </tr>
                          <tr className="border-b border-border dark:border-[#2A2A2A] hover:bg-muted/50 dark:hover:bg-[#232323]">
                            <td className="px-4 py-3">Version 2</td>
                            <td className="px-4 py-3">8.2</td>
                            <td className="px-4 py-3">0.72</td>
                            <td className="px-4 py-3">22%</td>
                            <td className="px-4 py-3">0.06</td>
                            <td className="px-4 py-3">850</td>
                          </tr>
                          <tr className="border-b border-border dark:border-[#2A2A2A] bg-green-950/10 dark:bg-[rgba(0,240,255,0.05)] hover:bg-green-950/20 dark:hover:bg-[rgba(0,240,255,0.08)]">
                            <td className="px-4 py-3 font-medium dark:text-[#00F0FF]">Version 3 (Best)</td>
                            <td className="px-4 py-3 font-medium dark:text-[#00F0FF]">8.7</td>
                            <td className="px-4 py-3 font-medium dark:text-[#00F0FF]">0.78</td>
                            <td className="px-4 py-3 font-medium dark:text-[#00F0FF]">20%</td>
                            <td className="px-4 py-3 font-medium dark:text-[#00F0FF]">0.05</td>
                            <td className="px-4 py-3 font-medium dark:text-[#00F0FF]">920</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="h-64 bg-muted dark:bg-[#1D1D1D] dark:border dark:border-[#2A2A2A] rounded-lg p-4 flex items-center justify-center dark:shadow-[0_4px_12px_rgba(0,0,0,0.2)] dark:hover:shadow-[0_6px_16px_rgba(0,0,0,0.3),0_0_0_1px_rgba(79,248,229,0.05)] dark:transition-all dark:duration-300">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground dark:text-[#AAAAAA] dark:uppercase dark:tracking-wider dark:font-medium mb-2">ROUGE-L Score Chart</p>
                          <div className="h-36 flex items-center justify-center">
                            <div className="w-full h-full bg-[#232323] rounded-md flex items-center justify-center">
                              <span className="text-xs text-[#B0B0B0]">Chart rendering...</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="h-64 bg-muted dark:bg-[#1D1D1D] dark:border dark:border-[#2A2A2A] rounded-lg p-4 flex items-center justify-center dark:shadow-[0_4px_12px_rgba(0,0,0,0.2)] dark:hover:shadow-[0_6px_16px_rgba(0,0,0,0.3),0_0_0_1px_rgba(79,248,229,0.05)] dark:transition-all dark:duration-300">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground dark:text-[#AAAAAA] dark:uppercase dark:tracking-wider dark:font-medium mb-2">Cost vs Quality Chart</p>
                          <div className="h-36 flex items-center justify-center">
                            <div className="w-full h-full bg-[#232323] rounded-md flex items-center justify-center">
                              <span className="text-xs text-[#B0B0B0]">Chart rendering...</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="models" className="space-y-6">
              <Card className="dark:bg-[#1A1A1A] dark:border-[#2A2A2A] dark:shadow-[0_4px_12px_rgba(0,0,0,0.3)] dark:hover:shadow-[0_8px_16px_rgba(0,0,0,0.3),0_0_0_1px_rgba(79,248,229,0.05)] dark:transition-all dark:duration-300 dark:rounded-xl dark:overflow-hidden">
                <CardHeader className="pb-3 dark:border-b dark:border-[#2A2A2A]">
                  <CardTitle className="text-base font-medium dark:text-[#E0E0E0] dark:font-light">LLM Performance Comparison</CardTitle>
                  <p className="text-sm text-muted-foreground dark:text-[#B0B0B0]">
                    Comparison across different models using the best prompt (Version 3)
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="relative overflow-x-auto rounded-md border border-border dark:border-[#2A2A2A] dark:shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
                      <table className="w-full text-sm text-left dark:text-[#E0E0E0]">
                        <thead className="text-xs bg-muted dark:bg-[#232323] text-card-foreground dark:text-[#B0B0B0]">
                          <tr>
                            <th className="px-4 py-3 font-medium dark:uppercase dark:tracking-wider dark:text-xs">Model</th>
                            <th className="px-4 py-3 font-medium dark:uppercase dark:tracking-wider dark:text-xs">Quality Score</th>
                            <th className="px-4 py-3 font-medium dark:uppercase dark:tracking-wider dark:text-xs">ROUGE-L</th>
                            <th className="px-4 py-3 font-medium dark:uppercase dark:tracking-wider dark:text-xs">Faithfulness</th>
                            <th className="px-4 py-3 font-medium dark:uppercase dark:tracking-wider dark:text-xs">Cost ($)</th>
                            <th className="px-4 py-3 font-medium dark:uppercase dark:tracking-wider dark:text-xs">Latency (ms)</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-border dark:border-[#2A2A2A] hover:bg-muted/50 dark:hover:bg-[#232323]">
                            <td className="px-4 py-3">GPT-4</td>
                            <td className="px-4 py-3">8.5</td>
                            <td className="px-4 py-3">0.76</td>
                            <td className="px-4 py-3">0.89</td>
                            <td className="px-4 py-3">0.12</td>
                            <td className="px-4 py-3">1100</td>
                          </tr>
                          <tr className="border-b border-border dark:border-[#2A2A2A] bg-green-950/10 dark:bg-[rgba(0,240,255,0.05)] hover:bg-green-950/20 dark:hover:bg-[rgba(0,240,255,0.08)]">
                            <td className="px-4 py-3 font-medium dark:text-[#00F0FF]">Claude 3 (Best)</td>
                            <td className="px-4 py-3 font-medium dark:text-[#00F0FF]">8.7</td>
                            <td className="px-4 py-3 font-medium dark:text-[#00F0FF]">0.78</td>
                            <td className="px-4 py-3 font-medium dark:text-[#00F0FF]">0.92</td>
                            <td className="px-4 py-3 font-medium dark:text-[#00F0FF]">0.05</td>
                            <td className="px-4 py-3 font-medium dark:text-[#00F0FF]">920</td>
                          </tr>
                          <tr className="border-b border-border dark:border-[#2A2A2A] hover:bg-muted/50 dark:hover:bg-[#232323]">
                            <td className="px-4 py-3">Llama 3</td>
                            <td className="px-4 py-3">8.1</td>
                            <td className="px-4 py-3">0.74</td>
                            <td className="px-4 py-3">0.86</td>
                            <td className="px-4 py-3">0.02</td>
                            <td className="px-4 py-3">750</td>
                          </tr>
                          <tr className="border-b border-border dark:border-[#2A2A2A] hover:bg-muted/50 dark:hover:bg-[#232323]">
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
                      <div className="h-64 bg-muted dark:bg-[#1D1D1D] dark:border dark:border-[#2A2A2A] rounded-lg p-4 flex items-center justify-center dark:shadow-[0_4px_12px_rgba(0,0,0,0.2)] dark:hover:shadow-[0_6px_16px_rgba(0,0,0,0.3),0_0_0_1px_rgba(79,248,229,0.05)] dark:transition-all dark:duration-300">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground dark:text-[#AAAAAA] dark:uppercase dark:tracking-wider dark:font-medium mb-2">Performance Radar Chart</p>
                          <div className="h-36 flex items-center justify-center">
                            <div className="w-full h-full bg-[#232323] rounded-md flex items-center justify-center">
                              <span className="text-xs text-[#B0B0B0]">Chart rendering...</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="h-64 bg-muted dark:bg-[#1D1D1D] dark:border dark:border-[#2A2A2A] rounded-lg p-4 flex items-center justify-center dark:shadow-[0_4px_12px_rgba(0,0,0,0.2)] dark:hover:shadow-[0_6px_16px_rgba(0,0,0,0.3),0_0_0_1px_rgba(79,248,229,0.05)] dark:transition-all dark:duration-300">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground dark:text-[#AAAAAA] dark:uppercase dark:tracking-wider dark:font-medium mb-2">Latency Distribution</p>
                          <div className="h-36 flex items-center justify-center">
                            <div className="w-full h-full bg-[#232323] rounded-md flex items-center justify-center">
                              <span className="text-xs text-[#B0B0B0]">Chart rendering...</span>
                            </div>
                          </div>
                        </div>
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
        <h2 className="text-lg font-medium mb-4 dark:text-[#E0E0E0] dark:font-light">Evaluation History</h2>
        
        {!user ? (
          <Card className="dark:bg-[#1A1A1A] dark:border-[#2A2A2A] dark:shadow-[0_4px_12px_rgba(0,0,0,0.3)] dark:hover:shadow-[0_8px_16px_rgba(0,0,0,0.3),0_0_0_1px_rgba(79,248,229,0.05)] transition-all duration-300 rounded-xl overflow-hidden">
            <CardContent className="h-48 flex flex-col items-center justify-center p-6">
              <p className="text-sm text-muted-foreground dark:text-[#AAAAAA] mb-6">Authenticating with demo mode...</p>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary dark:border-[#4FF8E5] opacity-80"></div>
            </CardContent>
          </Card>
        ) : isLoading ? (
          <Card className="dark:bg-[#1A1A1A] dark:border-[#2A2A2A] dark:shadow-[0_4px_12px_rgba(0,0,0,0.3)] dark:hover:shadow-[0_8px_16px_rgba(0,0,0,0.3),0_0_0_1px_rgba(79,248,229,0.05)] transition-all duration-300 rounded-xl overflow-hidden">
            <CardContent className="h-48 flex flex-col items-center justify-center p-6">
              <p className="text-sm text-muted-foreground dark:text-[#AAAAAA] mb-6">Loading evaluation data...</p>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary dark:border-[#4FF8E5] opacity-80"></div>
            </CardContent>
          </Card>
        ) : error ? (
          <Card className="dark:bg-[#1A1A1A] dark:border-[#2A2A2A] dark:shadow-[0_4px_12px_rgba(0,0,0,0.3)] dark:hover:shadow-[0_8px_16px_rgba(0,0,0,0.3),0_0_0_1px_rgba(79,248,229,0.05)] transition-all duration-300 rounded-xl overflow-hidden">
            <CardContent className="h-48 flex items-center justify-center p-6">
              <p className="text-sm text-muted-foreground dark:text-[#AAAAAA]">Error loading evaluation history</p>
            </CardContent>
          </Card>
        ) : enhancedTests?.length === 0 ? (
          <Card className="dark:bg-[#1A1A1A] dark:border-[#2A2A2A] dark:shadow-[0_4px_12px_rgba(0,0,0,0.3)] dark:hover:shadow-[0_8px_16px_rgba(0,0,0,0.3),0_0_0_1px_rgba(79,248,229,0.05)] transition-all duration-300 rounded-xl overflow-hidden">
            <CardContent className="h-48 flex flex-col items-center justify-center p-6">
              <p className="text-sm text-muted-foreground dark:text-[#AAAAAA] mb-6">You haven't run any evaluations yet</p>
              <Button 
                className="dark:bg-[#1D1D1D] dark:text-[#4FF8E5] dark:hover:bg-[#252525] dark:border dark:border-[#2A2A2A] dark:hover:shadow-[0_0_8px_rgba(79,248,229,0.5)] dark:transition-all dark:duration-300 dark:rounded-lg"
                onClick={() => {
                  console.log('Navigating to /wizard from empty state');
                  navigate('/wizard');
                }}
              >
                Run your first evaluation
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="bg-card dark:bg-[#1A1A1A] shadow dark:shadow-[0_4px_12px_rgba(0,0,0,0.3)] overflow-hidden rounded-xl dark:border dark:border-[#2A2A2A]">
            <ul className="divide-y divide-border dark:divide-[#2A2A2A]">
              {enhancedTests.map((test: EnhancedTestData) => (
                <li key={test.id}>
                  <div className="block hover:bg-muted/50 dark:hover:bg-[#252525] cursor-pointer transition-all duration-200 dark:hover:shadow-[0_0_0_1px_rgba(79,248,229,0.05)]" onClick={() => 
                    navigate(test.status === "completed" ? `/results/${test.id}` : `/wizard/progress?testId=${test.id}`)
                  }>
                    <div className="px-6 py-5 sm:px-8">
                      <div className="flex items-center justify-between">
                        <div className="truncate">
                          <div className="flex items-center">
                            <p className="text-sm font-medium text-primary dark:text-[#4FF8E5] truncate">
                              {test.promptText.length > 50 
                                ? `${test.promptText.substring(0, 50)}...` 
                                : test.promptText}
                            </p>
                            <div className="ml-3">
                              {getStatusBadge(test.status)}
                            </div>
                          </div>
                          {/* Task Category Tag */}
                          {test.category && (
                            <div className="mt-1 mb-2">
                              <Badge variant="outline" className="bg-blue-950/10 dark:bg-[#232323] text-blue-700 dark:text-[#4FF8E5] border-blue-300/20 dark:border-[#4FF8E5]/20 hover:bg-blue-950/30 dark:hover:bg-[#252525] py-1 px-3 rounded-md">
                                {test.category}
                              </Badge>
                            </div>
                          )}
                          
                          {/* Date and Security Info */}
                          <div className="mt-1 flex flex-wrap">
                            <div className="flex items-center text-sm text-muted-foreground dark:text-[#B0B0B0] mr-4">
                              <CalendarIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-muted-foreground/70 dark:text-[#B0B0B0]/70" />
                              <span>{formatDistanceToNow(new Date(test.createdAt), { addSuffix: true })}</span>
                            </div>
                            {test.redTeamEnabled && (
                              <div className="flex items-center text-sm text-muted-foreground dark:text-[#B0B0B0] mr-4">
                                <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-muted-foreground/70 dark:text-[#B0B0B0]/70" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                <span>Red-team enabled</span>
                              </div>
                            )}
                            
                            {/* Best Model Section - Only shown for completed tests with best model info */}
                            {test.status === "completed" && test.bestModel && (
                              <div className="flex items-center text-sm text-muted-foreground dark:text-[#B0B0B0]">
                                <Award className="flex-shrink-0 mr-1.5 h-5 w-5 text-yellow-500 dark:text-yellow-400" />
                                <span className="font-medium dark:text-[#00F0FF]">Best: {test.bestModel.modelId}</span>
                              </div>
                            )}
                          </div>
                          
                          {/* Performance Metrics - Only shown for completed tests */}
                          {test.status === "completed" && test.bestModel && test.improvements && (
                            <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                              <div className="flex items-center">
                                <BarChart2 className="h-3 w-3 mr-1 text-green-500 dark:text-[#4FF8E5]" />
                                <span className="text-muted-foreground dark:text-[#B0B0B0]">Quality: </span>
                                <span className="ml-1 font-medium dark:text-[#E0E0E0]">{test.bestModel.score.toFixed(1)}</span>
                                {parseInt(test.improvements.score) > 0 && (
                                  <span className="ml-1 text-green-600 dark:text-[#4FF8E5]">+{test.improvements.score}%</span>
                                )}
                              </div>
                              <div className="flex items-center">
                                <DollarSign className="h-3 w-3 mr-1 text-blue-500 dark:text-blue-400" />
                                <span className="text-muted-foreground dark:text-[#B0B0B0]">Cost: </span>
                                <span className="ml-1 font-medium dark:text-[#E0E0E0]">${test.bestModel.cost.toFixed(3)}</span>
                                {parseInt(test.improvements.cost) > 0 && (
                                  <span className="ml-1 text-green-600 dark:text-[#4FF8E5]">-{test.improvements.cost}%</span>
                                )}
                              </div>
                              <div className="flex items-center">
                                <Zap className="h-3 w-3 mr-1 text-purple-500 dark:text-purple-400" />
                                <span className="text-muted-foreground dark:text-[#B0B0B0]">Speed: </span>
                                <span className="ml-1 font-medium dark:text-[#E0E0E0]">
                                  {test.bestModel?.time !== undefined ? test.bestModel.time.toFixed(1) : "0.0"}ms
                                </span>
                                {parseInt(test.improvements.time) > 0 && (
                                  <span className="ml-1 text-green-600 dark:text-[#4FF8E5]">-{test.improvements.time}%</span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="ml-5 flex-shrink-0">
                          <svg className="h-5 w-5 text-muted-foreground/70 dark:text-[#B0B0B0]/70" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
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
