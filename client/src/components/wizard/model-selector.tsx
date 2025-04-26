import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Model } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

interface ModelSelectorProps {
  selectedModels: string[];
  onToggle: (modelId: string) => void;
}

export function ModelSelector({ 
  selectedModels, 
  onToggle 
}: ModelSelectorProps) {
  const { data: models, isLoading, error } = useQuery<Model[]>({
    queryKey: ["/api/models"],
  });

  // Group models by provider
  const modelsByProvider = models?.reduce((acc, model) => {
    if (!acc[model.provider]) {
      acc[model.provider] = [];
    }
    acc[model.provider].push(model);
    return acc;
  }, {} as Record<string, Model[]>) || {};

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-6 w-32" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border border-red-300 bg-red-50 rounded-md text-red-800">
        Failed to load models. Please try again.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(modelsByProvider).map(([provider, providerModels]) => (
        <div key={provider} className="space-y-2">
          <h3 className="text-lg font-medium text-gray-900">{provider} Models</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {providerModels.map((model) => (
              <Card 
                key={model.id} 
                className={`cursor-pointer transition-all ${
                  selectedModels.includes(model.name) 
                    ? 'ring-2 ring-primary' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => model.enabled && onToggle(model.name)}
              >
                <CardContent className="p-4 flex items-start space-x-4">
                  <Checkbox 
                    id={`model-${model.id}`}
                    checked={selectedModels.includes(model.name)}
                    onCheckedChange={() => model.enabled && onToggle(model.name)}
                    disabled={!model.enabled}
                  />
                  <div className="space-y-1">
                    <label 
                      htmlFor={`model-${model.id}`}
                      className={`text-sm font-medium ${!model.enabled ? 'text-gray-400' : 'text-gray-900'}`}
                    >
                      {model.name}
                    </label>
                    <p className="text-xs text-gray-500">
                      ${(model.inputCost / 1000).toFixed(4)}/1K tokens input
                      <br />
                      ${(model.outputCost / 1000).toFixed(4)}/1K tokens output
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
