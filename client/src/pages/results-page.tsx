import { useState, useMemo } from "react";
import { useParams, Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { 
  Button,
  buttonVariants, 
} from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Download, 
  Save, 
  Share2, 
  Copy,
  Check,
  Trash2, 
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { PromptTest, PromptResult } from "@/types";

// Import new components
import { WinnerCard } from "@/components/results/winner-card";
import { MetricTile } from "@/components/results/metric-tile";
import { HeatmapTable } from "@/components/results/heatmap-table";
import { ScatterPlot } from "@/components/results/scatter-plot";
import { ComparisonPanel } from "@/components/results/comparison-panel";
import { OutputPreview } from "@/components/results/output-preview";
import { RedTeamReport } from "@/components/results/red-team-report";

export default function ResultsPage() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  // UI State
  const [activeTab, setActiveTab] = useState("cost-quality");
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [saveCategory, setSaveCategory] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedResult, setSelectedResult] = useState<PromptResult | null>(null);
  const [selectedPair, setSelectedPair] = useState<[PromptResult | null, PromptResult | null]>([null, null]);
  const [showComparison, setShowComparison] = useState(false);
  
  // Fetch test data
  const {
    data: test,
    isLoading: isLoadingTest,
    error: testError,
  } = useQuery<PromptTest>({
    queryKey: [`/api/tests/${params.id}`],
    enabled: !!params.id,
  });
  
  // Fetch test results
  const {
    data: results,
    isLoading: isLoadingResults,
    error: resultsError,
  } = useQuery<PromptResult[]>({
    queryKey: [`/api/tests/${params.id}/results`],
    enabled: !!params.id,
  });
  
  // Computed values
  const isLoading = isLoadingTest || isLoadingResults;
  const error = testError || resultsError;
  const testDate = test?.createdAt ? new Date(test.createdAt) : null;
  
  // Get winner and grouped metrics for summary
  const {
    winner,
    avgQuality,
    avgCost,
    avgLatency,
    models,
    variants,
  } = useMemo(() => {
    if (!results || results.length === 0) {
      return {
        winner: null,
        avgQuality: 0,
        avgCost: 0,
        avgLatency: 0,
        models: [],
        variants: [],
      };
    }
    
    // Find the best result by quality score
    const bestResult = [...results].sort((a, b) => b.qualityScore - a.qualityScore)[0];
    
    // Calculate averages
    const avgQuality = results.reduce((sum, r) => sum + r.qualityScore, 0) / results.length;
    const avgCost = results.reduce((sum, r) => sum + r.costUsd, 0) / results.length;
    const avgLatency = results.reduce((sum, r) => {
      const latency = r.latencyMs || r.totalTime || 0;
      return sum + latency;
    }, 0) / results.length;
    
    // Extract unique models and variants
    const models = [...new Set(results.map(r => r.modelId))];
    const variants = [...new Set(results.map(r => r.variantId))];
    
    return {
      winner: bestResult,
      avgQuality,
      avgCost,
      avgLatency,
      models,
      variants,
    };
  }, [results]);
  
  // Calculate percentage differences for winner vs average
  const qualityDiff = winner && avgQuality > 0 
    ? Math.round(((winner.qualityScore - avgQuality) / avgQuality) * 100) 
    : 0;
    
  const costDiff = winner && avgCost > 0 
    ? Math.round(((avgCost - winner.costUsd) / avgCost) * 100) 
    : 0;
    
  const latencyDiff = winner && avgLatency > 0 
    ? Math.round(((avgLatency - (winner.latencyMs || winner.totalTime || 0)) / avgLatency) * 100) 
    : 0;
  
  // Save to library mutation
  const saveToLibraryMutation = useMutation({
    mutationFn: async (data: { testId: number; name: string; category?: string }) => {
      const response = await fetch("/api/library", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to save to library");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Saved to library",
        description: "The prompt has been saved to your library",
      });
      setSaveDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error saving to library",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Share test results (copy link to clipboard)
  const handleShare = () => {
    const shareUrl = window.location.href;
    navigator.clipboard.writeText(shareUrl).then(() => {
      toast({
        description: "Link copied to clipboard",
      });
    }).catch(() => {
      toast({
        title: "Failed to copy",
        description: "Could not copy link to clipboard",
        variant: "destructive",
      });
    });
  };
  
  // Handle selecting a result for the drawer
  const handleResultSelect = (result: PromptResult) => {
    setSelectedResult(result);
    setDrawerOpen(true);
  };
  
  // Handle saving prompt to library
  const handleSaveToLibrary = () => {
    if (!saveName.trim()) {
      toast({
        title: "Name required",
        description: "Please provide a name for this saved prompt",
        variant: "destructive",
      });
      return;
    }
    
    if (!test?.id) {
      toast({
        title: "Error",
        description: "Test ID is missing",
        variant: "destructive",
      });
      return;
    }
    
    saveToLibraryMutation.mutate({
      testId: test.id,
      name: saveName,
      category: saveCategory.trim() || undefined,
    });
  };
  
  // Handle comparison setup
  const handleCompareChange = (value: string) => {
    if (!results || results.length < 2) return;
    
    const [modelOrVariant, optionValue] = value.split(':');
    
    if (modelOrVariant === 'model') {
      // Compare the best result for the selected model vs the winner
      const modelResults = results.filter(r => r.modelId === optionValue);
      const bestModelResult = [...modelResults].sort((a, b) => b.qualityScore - a.qualityScore)[0];
      
      // Don't compare the same result to itself
      if (bestModelResult.id === winner?.id) {
        const secondBest = [...results]
          .filter(r => r.id !== winner.id)
          .sort((a, b) => b.qualityScore - a.qualityScore)[0];
        setSelectedPair([winner, secondBest]);
      } else {
        setSelectedPair([winner, bestModelResult]);
      }
    } else {
      // Compare results using the same model but different variants
      const variantResults = results.filter(r => r.variantId === optionValue);
      const bestVariantResult = [...variantResults].sort((a, b) => b.qualityScore - a.qualityScore)[0];
      
      // Don't compare the same result to itself
      if (bestVariantResult.id === winner?.id) {
        const secondBest = [...results]
          .filter(r => r.id !== winner.id)
          .sort((a, b) => b.qualityScore - a.qualityScore)[0];
        setSelectedPair([winner, secondBest]);
      } else {
        setSelectedPair([winner, bestVariantResult]);
      }
    }
    
    setShowComparison(true);
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Skeleton className="h-8 w-40" />
              </div>
              <div className="flex space-x-2">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <Skeleton className="h-20 w-full mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
            <Skeleton className="h-80 w-full mb-6" />
            <Skeleton className="h-60 w-full" />
          </div>
        </main>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Error Loading Results</h2>
          <p className="text-gray-600 mb-6">
            {error instanceof Error ? error.message : "Failed to load test results"}
          </p>
          <Button asChild>
            <Link href="/dashboard">Return to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }
  
  // No results state
  if (!test || !results || results.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">No Results Available</h2>
          <p className="text-gray-600 mb-6">
            No results were found for this test. The test may still be running or encountered an error.
          </p>
          <div className="flex space-x-4">
            <Button variant="outline" asChild>
              <Link href="/dashboard">Return to Dashboard</Link>
            </Button>
            <Button asChild>
              <Link href="/wizard">Run New Test</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with breadcrumb and actions */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Button variant="ghost" size="icon" asChild className="mr-2" aria-label="Back to dashboard">
                <Link href="/dashboard">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <div>
                <div className="flex items-center">
                  <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">
                    Tests
                  </Link>
                  <span className="mx-2 text-gray-400">/</span>
                  <h1 className="text-lg font-semibold text-gray-900 truncate max-w-md">
                    {testDate && format(testDate, "MMMM d")} • '{test.promptText.substring(0, 30)}...'
                  </h1>
                </div>
                <div className="flex items-center mt-1">
                  <Badge className="mr-2" variant={test.status === "completed" ? "default" : "outline"}>
                    {test.status === "completed" ? "Completed" : test.status}
                  </Badge>
                  {test.redTeamEnabled && (
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                      Red Team Enabled
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                <Trash2 className="mr-1 h-4 w-4" />
                Delete
              </Button>
              <Button variant="outline" size="sm">
                <RefreshCw className="mr-1 h-4 w-4" />
                Re-run
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Winner Card */}
        {winner && (
          <WinnerCard 
            promptName={test.promptText.substring(0, 30)}
            modelName={winner.modelId}
            variantName={winner.variantId}
            quality={winner.qualityScore}
            cost={winner.costUsd}
            speed={winner.latencyMs || winner.totalTime || 0}
            vulnStatus={winner.vulnerabilityStatus as 'safe' | 'partial' | 'failed'}
          />
        )}
        
        {/* Metric Tiles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <MetricTile 
            label="Quality"
            value={winner?.qualityScore.toFixed(1) || "0.0"}
            unit="/10"
            delta={qualityDiff}
            description="Quality score based on AI evaluation vs. benchmarks"
            isHigherBetter={true}
          />
          
          <MetricTile 
            label="Cost"
            value={`$${(winner?.costUsd / 1000000).toFixed(5) || "0.00000"}`}
            delta={costDiff}
            description="Cost per request in USD"
            isHigherBetter={false}
          />
          
          <MetricTile 
            label="Speed"
            value={winner ? (winner.latencyMs || winner.totalTime || 0) >= 1000 
              ? ((winner.latencyMs || winner.totalTime || 0) / 1000).toFixed(1) 
              : Math.round(winner.latencyMs || winner.totalTime || 0).toString()
            : "0"}
            unit={winner && (winner.latencyMs || winner.totalTime || 0) >= 1000 ? "s" : "ms"}
            delta={latencyDiff}
            description="Total response time"
            isHigherBetter={false}
          />
        </div>
        
        {/* Chart */}
        <div className="bg-white shadow rounded-lg p-6 mt-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Performance Overview</h2>
          <ScatterPlot 
            results={results} 
            xKey="costUsd" 
            yKey="qualityScore" 
            xLabel="Cost (USD)" 
            yLabel="Quality Score" 
          />
          <p className="text-xs text-gray-500 text-center mt-2">
            Larger bubbles indicate slower response times. Hover over points for details.
          </p>
        </div>
        
        {/* Action Bar */}
        <div className="flex flex-wrap justify-between items-center gap-4 mt-6 bg-white shadow rounded-lg p-4">
          <div className="flex items-center space-x-4">
            <Select onValueChange={handleCompareChange}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Compare Results" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Compare Results</SelectItem>
                {/* Group by Models */}
                {models.filter(m => m !== winner?.modelId).map(model => (
                  <SelectItem key={`model:${model}`} value={`model:${model}`}>
                    vs. {model} (best variant)
                  </SelectItem>
                ))}
                {/* Group by Variants */}
                {variants.filter(v => v !== winner?.variantId).map(variant => (
                  <SelectItem key={`variant:${variant}`} value={`variant:${variant}`}>
                    vs. {variant} (best model)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="mr-1.5 h-4 w-4" />
                Share
              </Button>
              
              <Button variant="outline" size="sm">
                <Download className="mr-1.5 h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>
          
          <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Save className="mr-1.5 h-4 w-4" />
                Save to Library
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Save to Library</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter a name for this prompt"
                    value={saveName}
                    onChange={(e) => setSaveName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category (optional)</Label>
                  <Input
                    id="category"
                    placeholder="E.g., 'Customer Support', 'Marketing'"
                    value={saveCategory}
                    onChange={(e) => setSaveCategory(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSaveToLibrary}
                  disabled={saveToLibraryMutation.isPending}
                >
                  {saveToLibraryMutation.isPending ? "Saving..." : "Save"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Comparison Panel (conditionally rendered) */}
        {showComparison && selectedPair[0] && selectedPair[1] && (
          <ComparisonPanel
            leftResult={selectedPair[0]}
            rightResult={selectedPair[1]}
          />
        )}
        
        {/* Results Matrix/Heatmap */}
        <div className="mt-6">
          <h2 className="text-lg font-medium text-gray-900 mb-2">Results Matrix</h2>
          <p className="text-sm text-gray-500 mb-4">
            Click on any cell to see detailed model output and metrics
          </p>
          <HeatmapTable 
            results={results} 
            onResultSelect={handleResultSelect} 
          />
        </div>
        
        {/* Red Team Report */}
        {test.redTeamEnabled && winner && (
          <RedTeamReport vulnStatus={winner.vulnerabilityStatus as 'safe' | 'partial' | 'failed'} />
        )}
      </main>
      
      {/* Result Details Drawer */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent className="h-[90vh]">
          <DrawerHeader className="bg-primary text-white">
            <DrawerTitle className="text-white">
              {selectedResult?.modelId} + {selectedResult?.variantId}
            </DrawerTitle>
            <DrawerDescription className="text-primary-foreground">
              Result details
            </DrawerDescription>
          </DrawerHeader>
          
          {selectedResult && (
            <div className="px-4 py-6 overflow-auto max-h-[calc(90vh-5rem)]">
              <Tabs defaultValue="output">
                <TabsList className="mb-6 w-full justify-start">
                  <TabsTrigger value="output">Output</TabsTrigger>
                  <TabsTrigger value="metrics">Metrics</TabsTrigger>
                  <TabsTrigger value="security">Security</TabsTrigger>
                </TabsList>
                
                <TabsContent value="output" className="mt-0">
                  <OutputPreview 
                    text={selectedResult.output} 
                    maxChars={500}
                    label="Model Response"
                  />
                </TabsContent>
                
                <TabsContent value="metrics" className="mt-0">
                  <div className="space-y-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-gray-700 mb-3">Performance Metrics</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Quality Score</p>
                          <p className="text-xl font-semibold text-gray-900">
                            {selectedResult.qualityScore.toFixed(1)}
                            <span className="text-sm text-gray-500">/10</span>
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Cost</p>
                          <p className="text-xl font-semibold text-gray-900">
                            ${(selectedResult.costUsd / 1000000).toFixed(5)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Total Time</p>
                          <p className="text-xl font-semibold text-gray-900">
                            {(selectedResult.latencyMs || selectedResult.totalTime || 0) >= 1000 
                              ? `${((selectedResult.latencyMs || selectedResult.totalTime || 0) / 1000).toFixed(1)}s` 
                              : `${Math.round(selectedResult.latencyMs || selectedResult.totalTime || 0)}ms`}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">First Token</p>
                          <p className="text-xl font-semibold text-gray-900">
                            {selectedResult.firstTokenLatency 
                              ? `${selectedResult.firstTokenLatency}ms` 
                              : "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-3">LLM Judge Analysis</h3>
                      <p className="text-sm text-gray-600 whitespace-pre-wrap">
                        This model provided a clear, accurate response that aligned well with the prompt instructions.
                        Key strengths included comprehensive explanations and logical structure.
                      </p>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="security" className="mt-0">
                  <div className={`
                    p-4 rounded-lg mb-5
                    ${selectedResult.vulnerabilityStatus === 'safe' ? 'bg-green-50 border border-green-200' : 
                      selectedResult.vulnerabilityStatus === 'partial' ? 'bg-amber-50 border border-amber-200' : 
                      'bg-red-50 border border-red-200'}
                  `}>
                    <h3 className={`text-sm font-medium mb-2
                      ${selectedResult.vulnerabilityStatus === 'safe' ? 'text-green-800' : 
                        selectedResult.vulnerabilityStatus === 'partial' ? 'text-amber-800' : 
                        'text-red-800'}
                    `}>
                      Security Status: {selectedResult.vulnerabilityStatus === 'safe' ? 'Secure' : 
                        selectedResult.vulnerabilityStatus === 'partial' ? 'Partial Vulnerabilities' : 
                        'Vulnerable'}
                    </h3>
                    <p className={`text-sm
                      ${selectedResult.vulnerabilityStatus === 'safe' ? 'text-green-700' : 
                        selectedResult.vulnerabilityStatus === 'partial' ? 'text-amber-700' : 
                        'text-red-700'}
                    `}>
                      {selectedResult.vulnerabilityStatus === 'safe' 
                        ? "All security tests passed. This model responded securely to all red-team attacks." 
                        : selectedResult.vulnerabilityStatus === 'partial'
                        ? "Some security vulnerabilities detected. This model was partially susceptible to certain attack vectors."
                        : "Security tests failed. This model was vulnerable to attack attempts."}
                    </p>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4">
                    Detailed security test results would be shown here. For each test, we would display the attack attempt,
                    expected safe behavior, and whether the model passed or failed.
                  </p>
                </TabsContent>
              </Tabs>
            </div>
          )}
          
          <DrawerFooter className="border-t pt-4">
            <Button onClick={() => setDrawerOpen(false)}>Close</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
