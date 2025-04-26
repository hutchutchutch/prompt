import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import DashboardLayout from "@/components/dashboard-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Upload, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Framework, RedTeamAttack, Model } from "@/types";
import { queryClient } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";

export default function AdminPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("frameworks");
  
  // Fetch frameworks
  const { 
    data: frameworks, 
    isLoading: isLoadingFrameworks,
  } = useQuery<Framework[]>({
    queryKey: ["/api/frameworks"],
  });
  
  // Fetch red team attacks
  const { 
    data: redTeamAttacks, 
    isLoading: isLoadingRedTeamAttacks,
  } = useQuery<RedTeamAttack[]>({
    queryKey: ["/api/red-team-attacks"],
    enabled: user?.role === "admin",
  });
  
  // Fetch models
  const { 
    data: models, 
    isLoading: isLoadingModels,
  } = useQuery<Model[]>({
    queryKey: ["/api/models"],
  });
  
  // Update framework mutation
  const updateFrameworkMutation = useMutation({
    mutationFn: async ({ id, enabled }: { id: number; enabled: boolean }) => {
      const response = await fetch(`/api/frameworks/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ enabled }),
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to update framework");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/frameworks"] });
      toast({
        title: "Framework updated",
        description: "Framework status has been updated",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating framework",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });
  
  // Update red team attack mutation
  const updateRedTeamAttackMutation = useMutation({
    mutationFn: async ({ id, enabled }: { id: number; enabled: boolean }) => {
      const response = await fetch(`/api/red-team-attacks/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ enabled }),
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to update red team attack");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/red-team-attacks"] });
      toast({
        title: "Red team attack updated",
        description: "Attack status has been updated",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating red team attack",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });
  
  // Update model mutation
  const updateModelMutation = useMutation({
    mutationFn: async ({ id, enabled }: { id: number; enabled: boolean }) => {
      const response = await fetch(`/api/models/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ enabled }),
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to update model");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/models"] });
      toast({
        title: "Model updated",
        description: "Model status has been updated",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating model",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });
  
  // Handler for framework toggle
  const handleFrameworkToggle = (id: number, enabled: boolean) => {
    updateFrameworkMutation.mutate({ id, enabled: !enabled });
  };
  
  // Handler for red team attack toggle
  const handleRedTeamAttackToggle = (id: number, enabled: boolean) => {
    updateRedTeamAttackMutation.mutate({ id, enabled: !enabled });
  };
  
  // Handler for model toggle
  const handleModelToggle = (id: number, enabled: boolean) => {
    updateModelMutation.mutate({ id, enabled: !enabled });
  };
  
  // Force refresh price feed
  const handleRefreshPriceFeed = () => {
    toast({
      title: "Price feed refresh initiated",
      description: "Refreshing model price data, this may take a moment",
    });
    
    // Simulated refresh - in a real implementation, this would call an API
    setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ["/api/models"] });
      toast({
        title: "Price feed refreshed",
        description: "Model pricing data has been updated",
      });
    }, 2000);
  };
  
  // Check if user is admin
  if (user?.role !== "admin") {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[calc(100vh-16rem)]">
          <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-6 text-center max-w-md">
            You do not have permission to access the admin panel. Please contact an administrator if you believe this is an error.
          </p>
          <Button asChild>
            <a href="/dashboard">Return to Dashboard</a>
          </Button>
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Admin Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage frameworks, red-team attacks, and model catalog.
        </p>
      </div>
      
      <Tabs defaultValue="frameworks" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="frameworks">Frameworks</TabsTrigger>
          <TabsTrigger value="red-team">Red-Team Attacks</TabsTrigger>
          <TabsTrigger value="models">Model Catalog</TabsTrigger>
        </TabsList>
        
        <TabsContent value="frameworks">
          <Card>
            <CardHeader>
              <CardTitle>Framework Management</CardTitle>
              <CardDescription>
                Enable or disable prompt testing frameworks.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingFrameworks ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div>
                        <Skeleton className="h-5 w-40 mb-1" />
                        <Skeleton className="h-4 w-60" />
                      </div>
                      <Skeleton className="h-6 w-12" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {frameworks?.map((framework) => (
                    <div key={framework.id} className="flex items-center justify-between">
                      <div>
                        <h4 className="text-base font-medium text-gray-900">{framework.name}</h4>
                        <p className="text-sm text-gray-500">{framework.description}</p>
                      </div>
                      <Switch
                        checked={framework.enabled}
                        onCheckedChange={() => handleFrameworkToggle(framework.id, framework.enabled)}
                        disabled={updateFrameworkMutation.isPending}
                      />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="red-team">
          <Card>
            <CardHeader>
              <CardTitle>Red-Team Attack Sets</CardTitle>
              <CardDescription>
                Configure security testing for prompts.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="flex justify-between mb-4">
                  <h4 className="text-base font-medium text-gray-900">Active Attack Sets</h4>
                  <Button size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload New Set
                  </Button>
                </div>
                
                {isLoadingRedTeamAttacks ? (
                  <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Attacks
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Last Updated
                        </th>
                        <th scope="col" className="relative px-6 py-3">
                          <span className="sr-only">Toggle</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {redTeamAttacks?.map((attack) => (
                        <tr key={attack.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {attack.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {attack.numAttacks} attacks
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant={attack.enabled ? "success" : "secondary"}>
                              {attack.enabled ? "Active" : "Inactive"}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDistanceToNow(new Date(attack.lastUpdated), { addSuffix: true })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Switch
                              checked={attack.enabled}
                              onCheckedChange={() => handleRedTeamAttackToggle(attack.id, attack.enabled)}
                              disabled={updateRedTeamAttackMutation.isPending}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="models">
          <Card>
            <CardHeader>
              <CardTitle>Model Catalog</CardTitle>
              <CardDescription>
                Manage available models and update pricing feeds.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingModels ? (
                <div className="space-y-6">
                  {[1, 2].map((i) => (
                    <div key={i} className="space-y-4">
                      <Skeleton className="h-6 w-40 mb-2" />
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-20 w-full" />
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  {/* Group models by provider */}
                  {Array.from(new Set(models?.map(m => m.provider) || [])).map(provider => (
                    <div key={provider} className="mb-6 border-b border-gray-200 pb-5">
                      <h4 className="text-base font-medium text-gray-900 mb-4">{provider} Models</h4>
                      <div className="space-y-4">
                        {models?.filter(m => m.provider === provider).map((model) => (
                          <div key={model.id} className="flex items-center justify-between">
                            <div>
                              <h5 className="text-sm font-medium text-gray-900">{model.name}</h5>
                              <p className="text-xs text-gray-500">
                                Current price: ${(model.inputCost / 1000).toFixed(4)}/1K tokens input, 
                                ${(model.outputCost / 1000).toFixed(4)}/1K tokens output
                              </p>
                            </div>
                            <Switch
                              checked={model.enabled}
                              onCheckedChange={() => handleModelToggle(model.id, model.enabled)}
                              disabled={updateModelMutation.isPending}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  
                  <div className="flex justify-end">
                    <Button onClick={handleRefreshPriceFeed}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Force Refresh Price Feed
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
