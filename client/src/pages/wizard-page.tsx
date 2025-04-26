import { useState, useEffect } from "react";
import { useParams, useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { PromptInput } from "@/components/wizard/prompt-input";
import { ModelSelector } from "@/components/wizard/model-selector";
import { FrameworkBadge } from "@/components/wizard/framework-badge";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ProgressBar } from "@/components/progress-bar";
import { useToast } from "@/hooks/use-toast";
import { useWebSocket } from "@/lib/websocket";
import { Framework, PromptTest, WizardFormData } from "@/types";
import { ArrowLeft, AlertCircle, Loader2 } from "lucide-react";
import { Link } from "wouter";

export default function WizardPage() {
  const params = useParams<{ step?: string }>();
  const [, navigate] = useLocation();
  const [match, params2] = useRoute("/wizard/progress");
  const { toast } = useToast();
  
  // Parse the current step or default to "1"
  const currentStep = params.step || "1";
  
  // Get test ID from URL if on progress page
  const testId = match ? new URLSearchParams(window.location.search).get("testId") : null;
  
  // Wizard form state
  const [formData, setFormData] = useState<WizardFormData>({
    promptText: "",
    desiredOutcome: "",
    selectedModels: [],
    selectedFrameworks: [],
    redTeamEnabled: false,
    iterationBudget: 5,
  });
  
  // WebSocket state for test progress
  const { 
    connect, 
    disconnect, 
    progressData, 
    testCompleted, 
    isConnected,
    testId: wsTestId
  } = useWebSocket();
  
  // Fetch frameworks
  const { data: frameworks } = useQuery<Framework[]>({
    queryKey: ["/api/frameworks"],
  });
  
  // Create test mutation
  const createTestMutation = useMutation({
    mutationFn: async (data: WizardFormData) => {
      const response = await fetch("/api/tests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create test");
      }
      
      return response.json() as Promise<PromptTest>;
    },
    onSuccess: (data) => {
      // Navigate to progress page with the test ID
      navigate(`/wizard/progress?testId=${data.id}`);
    },
    onError: (error) => {
      toast({
        title: "Error creating test",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Connect to WebSocket when on progress page and testId is available
  useEffect(() => {
    if (currentStep === "progress" && testId && !isConnected) {
      connect(parseInt(testId));
    }
    
    return () => {
      if (isConnected) {
        disconnect();
      }
    };
  }, [currentStep, testId, isConnected]);
  
  // Navigate to results page when test is completed
  useEffect(() => {
    if (testCompleted && wsTestId) {
      toast({
        title: "Test completed",
        description: "Redirecting to results page",
      });
      
      navigate(`/results/${wsTestId}`);
    }
  }, [testCompleted, wsTestId]);
  
  // Handle form input changes
  const handleInputChange = (field: keyof WizardFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  // Toggle model selection
  const handleModelToggle = (modelId: string) => {
    setFormData(prev => {
      const selectedModels = prev.selectedModels.includes(modelId)
        ? prev.selectedModels.filter(id => id !== modelId)
        : [...prev.selectedModels, modelId];
      
      return { ...prev, selectedModels };
    });
  };
  
  // Toggle framework selection
  const handleFrameworkToggle = (frameworkId: string) => {
    setFormData(prev => {
      const selectedFrameworks = prev.selectedFrameworks.includes(frameworkId)
        ? prev.selectedFrameworks.filter(id => id !== frameworkId)
        : [...prev.selectedFrameworks, frameworkId];
      
      return { ...prev, selectedFrameworks };
    });
  };
  
  // Handle form submission
  const handleSubmit = () => {
    // Validate form data
    if (!formData.promptText) {
      toast({
        title: "Validation Error",
        description: "Prompt text is required",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.desiredOutcome) {
      toast({
        title: "Validation Error",
        description: "Desired outcome is required",
        variant: "destructive",
      });
      return;
    }
    
    if (formData.selectedModels.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one model",
        variant: "destructive",
      });
      return;
    }
    
    if (formData.selectedFrameworks.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one framework",
        variant: "destructive",
      });
      return;
    }
    
    // Submit form
    createTestMutation.mutate(formData);
  };
  
  // Navigate to next step
  const goToNextStep = () => {
    if (currentStep === "1") {
      navigate("/wizard/2");
    } else if (currentStep === "2") {
      navigate("/wizard/3");
    } else if (currentStep === "3") {
      handleSubmit();
    }
  };
  
  // Navigate to previous step
  const goToPrevStep = () => {
    if (currentStep === "2") {
      navigate("/wizard/1");
    } else if (currentStep === "3") {
      navigate("/wizard/2");
    } else {
      navigate("/dashboard");
    }
  };
  
  // Check if current step is valid
  const isStepValid = () => {
    if (currentStep === "1") {
      return formData.promptText.trim() !== "" && formData.desiredOutcome.trim() !== "";
    } else if (currentStep === "2") {
      return formData.selectedModels.length > 0 && formData.selectedFrameworks.length > 0;
    }
    return true;
  };
  
  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case "1":
        return (
          <Card>
            <CardContent className="px-4 py-5 sm:p-6">
              <PromptInput
                value={formData.promptText}
                onChange={(value) => handleInputChange("promptText", value)}
                maxTokens={4000}
                className="mb-6"
              />
              
              <div className="mb-6">
                <PromptInput
                  value={formData.desiredOutcome}
                  onChange={(value) => handleInputChange("desiredOutcome", value)}
                  maxTokens={1000}
                  label="Desired Outcome"
                  placeholder="The response should include..."
                  isRequired={true}
                />
              </div>
              
              <div className="flex justify-end">
                <Button 
                  onClick={goToNextStep}
                  disabled={!isStepValid()}
                >
                  Continue to Models & Frameworks
                </Button>
              </div>
            </CardContent>
          </Card>
        );
        
      case "2":
        return (
          <Card>
            <CardContent className="px-4 py-5 sm:p-6">
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Select Models to Test</h3>
                <ModelSelector
                  selectedModels={formData.selectedModels}
                  onToggle={handleModelToggle}
                />
              </div>
              
              <Separator className="my-6" />
              
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Select Frameworks</h3>
                <div className="flex flex-wrap gap-2">
                  {frameworks?.map((framework) => (
                    <FrameworkBadge
                      key={framework.id}
                      name={framework.name}
                      description={framework.description}
                      enabled={framework.enabled}
                      selected={formData.selectedFrameworks.includes(framework.name)}
                      onClick={() => framework.enabled && handleFrameworkToggle(framework.name)}
                    />
                  ))}
                </div>
              </div>
              
              <div className="flex justify-between">
                <Button variant="outline" onClick={goToPrevStep}>
                  Back
                </Button>
                <Button 
                  onClick={goToNextStep}
                  disabled={!isStepValid()}
                >
                  Continue to Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        );
        
      case "3":
        return (
          <Card>
            <CardContent className="px-4 py-5 sm:p-6">
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Test Settings</h3>
                
                <div className="space-y-6">
                  <div className="flex flex-col space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Iteration Budget
                    </label>
                    <div className="flex items-center space-x-4">
                      <Slider
                        value={[formData.iterationBudget || 5]}
                        min={1}
                        max={10}
                        step={1}
                        onValueChange={(value) => handleInputChange("iterationBudget", value[0])}
                        className="flex-1"
                      />
                      <span className="text-sm font-medium text-gray-900 w-8 text-center">
                        {formData.iterationBudget || 5}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      Higher values may increase cost but improve results
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">
                        Enable Red-Team Testing
                      </label>
                      <p className="text-xs text-gray-500">
                        Test prompt security against attacks and vulnerabilities
                      </p>
                    </div>
                    <Switch
                      checked={formData.redTeamEnabled}
                      onCheckedChange={(checked) => handleInputChange("redTeamEnabled", checked)}
                    />
                  </div>
                </div>
              </div>
              
              <div className="mb-6 bg-amber-50 border border-amber-200 rounded-md p-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-amber-500 mr-2" />
                  <div>
                    <h4 className="text-sm font-medium text-amber-800">Review Before Running</h4>
                    <div className="mt-2 text-xs text-amber-700">
                      <p>You're about to test {formData.selectedModels.length} models with {formData.selectedFrameworks.length} frameworks.</p>
                      <p className="mt-1">This will generate {formData.selectedModels.length * formData.selectedFrameworks.length} different tests.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between">
                <Button variant="outline" onClick={goToPrevStep}>
                  Back
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={createTestMutation.isPending}
                >
                  {createTestMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Running...
                    </>
                  ) : (
                    "Run Tests"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        );
        
      case "progress":
        return (
          <Card>
            <CardContent className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Test Progress</h3>
              
              {testId ? (
                <div className="space-y-6">
                  {Object.keys(progressData).length === 0 ? (
                    <div className="text-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
                      <p className="text-gray-500">Connecting to test session...</p>
                    </div>
                  ) : (
                    <>
                      <div className="grid gap-4">
                        {Object.entries(progressData).map(([key, data]) => {
                          const [modelId, variantId] = key.split(':');
                          return (
                            <div key={key} className="border rounded-md p-4">
                              <div className="flex justify-between mb-2">
                                <span className="font-medium text-sm">{modelId} - {variantId}</span>
                                <span className="text-sm text-gray-500">{data.progress}%</span>
                              </div>
                              <ProgressBar 
                                percent={data.progress} 
                                status={data.progress < 100 ? "loading" : "success"}
                                showLabel={false}
                              />
                              <div className="mt-2 text-sm text-gray-500">{data.message}</div>
                              
                              {data.firstTokenLatency && (
                                <div className="mt-2 text-xs text-gray-400">
                                  First token: {data.firstTokenLatency}ms
                                </div>
                              )}
                              
                              {data.totalTime && (
                                <div className="text-xs text-gray-400">
                                  Total time: {data.totalTime}ms
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      
                      {testCompleted && (
                        <div className="mt-4 text-center">
                          <p className="text-green-600 mb-4">All tests completed!</p>
                          <Button asChild>
                            <Link href={`/results/${testId}`}>View Results</Link>
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No test ID provided. Please start a new test.</p>
                  <Button className="mt-4" asChild>
                    <Link href="/wizard">New Test</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        );
        
      default:
        return (
          <div className="text-center">
            <p>Invalid step. Please return to the wizard.</p>
            <Button className="mt-4" asChild>
              <Link href="/wizard">Return to Wizard</Link>
            </Button>
          </div>
        );
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button 
                onClick={goToPrevStep}
                className="text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <h1 className="ml-3 text-xl font-bold text-gray-900">
                {currentStep === "progress" ? "Test Progress" : "New Prompt Test"}
              </h1>
            </div>
            {currentStep !== "progress" && (
              <div className="text-sm text-gray-500">
                Step {currentStep} of 3
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto sm:px-6 lg:px-8 py-8">
        {currentStep !== "progress" && (
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">
                {currentStep === "1" ? "Enter Your Prompt" : 
                 currentStep === "2" ? "Select Models & Frameworks" : 
                 "Configure Test Settings"}
              </h2>
              <div className="text-sm text-gray-500">
                {currentStep === "1" || currentStep === "2" ? "Required" : "Optional"}
              </div>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              {currentStep === "1" ? "Enter the exact prompt you want to test and the desired outcome." : 
               currentStep === "2" ? "Choose models and frameworks to test your prompt with." :
               "Customize testing settings and security options."}
            </p>
          </div>
        )}

        {renderStepContent()}
      </div>
    </div>
  );
}
