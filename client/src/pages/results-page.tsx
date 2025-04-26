import { useState } from "react";
import { useParams, Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ResultsMatrix } from "@/components/results/results-matrix";
import { ScatterPlot } from "@/components/results/scatter-plot";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Download, Save } from "lucide-react";
import { PromptTest, PromptResult } from "@/types";
import { useToast } from "@/hooks/use-toast";

export default function ResultsPage() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("cost-quality");
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [saveCategory, setSaveCategory] = useState("");
  
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
  
  const isLoading = isLoadingTest || isLoadingResults;
  const error = testError || resultsError;
  
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
            <Skeleton className="h-6 w-40 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          
          <Skeleton className="h-80 w-full mb-8" />
          
          <Skeleton className="h-10 w-full mb-4" />
          <Skeleton className="h-60 w-full" />
        </main>
      </div>
    );
  }
  
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
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Button variant="ghost" size="icon" asChild className="mr-2">
                <Link href="/dashboard">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <h1 className="text-xl font-bold text-gray-900">Test Results</h1>
              <Badge className="ml-3" variant={test.status === "completed" ? "success" : "default"}>
                {test.status === "completed" ? "Completed" : test.status}
              </Badge>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Save className="mr-2 h-4 w-4" />
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
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-1">Results Matrix</h2>
          <p className="text-sm text-gray-500">
            Compare performance across models and prompt variants. Click on a cell to view details.
          </p>
        </div>

        <ResultsMatrix results={results} />

        <div className="bg-white shadow rounded-lg p-6">
          <Tabs defaultValue="cost-quality" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="cost-quality">Cost vs Quality</TabsTrigger>
              <TabsTrigger value="speed-quality">Speed vs Quality</TabsTrigger>
              <TabsTrigger value="cost-speed">Cost vs Speed</TabsTrigger>
            </TabsList>
            
            <TabsContent value="cost-quality">
              <ScatterPlot 
                results={results} 
                xKey="costUsd" 
                yKey="qualityScore" 
                xLabel="Cost (USD)" 
                yLabel="Quality Score" 
              />
            </TabsContent>
            
            <TabsContent value="speed-quality">
              <ScatterPlot 
                results={results} 
                xKey="latencyMs" 
                yKey="qualityScore" 
                xLabel="Latency (ms)" 
                yLabel="Quality Score" 
              />
            </TabsContent>
            
            <TabsContent value="cost-speed">
              <ScatterPlot 
                results={results} 
                xKey="costUsd" 
                yKey="latencyMs" 
                xLabel="Cost (USD)" 
                yLabel="Latency (ms)" 
              />
            </TabsContent>
          </Tabs>
          
          <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Model legend dynamically generated from results */}
            {[...new Set(results.map(r => r.modelId))].map((modelId, index) => {
              // Array of colors to match ScatterPlot component
              const modelColors = [
                "bg-blue-500", // Blue
                "bg-purple-500", // Purple
                "bg-pink-500", // Pink
                "bg-orange-500", // Orange
                "bg-teal-500", // Teal
                "bg-green-500", // Green
              ];
              
              return (
                <div key={modelId} className="flex items-center">
                  <div className={`h-4 w-4 rounded-full ${modelColors[index % modelColors.length]} mr-2`}></div>
                  <span className="text-sm text-gray-600">{modelId}</span>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
