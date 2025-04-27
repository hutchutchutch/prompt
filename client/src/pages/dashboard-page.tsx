import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    time: number;
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

  // Fetch recent tests - only when user is authenticated
  const { data: rawRecentTests, isLoading: isLoadingTests, error: testsError } = useQuery<PromptTest[]>({
    queryKey: ["/api/tests/recent"],
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
              const avgTime = normalizedResults.reduce((sum, r) => sum + r.totalTime, 0) / normalizedResults.length;

              // Find best model (by quality score)
              const bestResult = [...normalizedResults].sort((a, b) => b.qualityScore - a.qualityScore)[0];
              
              // Calculate improvements (percentage better than average)
              const scoreDiff = ((bestResult.qualityScore - avgScore) / avgScore * 100).toFixed(0);
              const costDiff = ((avgCost - bestResult.costUsd) / avgCost * 100).toFixed(0);
              const timeDiff = ((avgTime - bestResult.totalTime) / avgTime * 100).toFixed(0);

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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Welcome back, {user?.username}
          </p>
        </div>
        <Button asChild>
          <Link href="/wizard">New Test</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline">
              <span className="text-3xl font-bold text-gray-900">
                {enhancedTests?.length || 0}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Average Quality</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline">
              <span className="text-3xl font-bold text-gray-900">8.5</span>
              <span className="ml-1 text-sm text-gray-500">/10</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Average Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline">
              <span className="text-3xl font-bold text-gray-900">$0.09</span>
              <span className="ml-1 text-sm text-gray-500">/test</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Saved Prompts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline">
              <span className="text-3xl font-bold text-gray-900">3</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Task Categories Section */}
      <div className="mb-8">
        <TaskCategorySelector />
      </div>

      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Tests</h2>
        
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
              <p className="text-sm text-gray-500 mb-4">Loading test data...</p>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </CardContent>
          </Card>
        ) : error ? (
          <Card>
            <CardContent className="h-40 flex items-center justify-center">
              <p className="text-sm text-gray-500">Error loading recent tests</p>
            </CardContent>
          </Card>
        ) : enhancedTests?.length === 0 ? (
          <Card>
            <CardContent className="h-40 flex flex-col items-center justify-center">
              <p className="text-sm text-gray-500 mb-4">You haven't run any tests yet</p>
              <Button asChild>
                <Link href="/wizard">Run your first test</Link>
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
                                <span className="ml-1 font-medium">{(test.bestModel.time).toFixed(1)}ms</span>
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
