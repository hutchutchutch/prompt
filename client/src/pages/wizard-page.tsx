import React, { useEffect } from 'react';
import { PromptCarousel } from '@/components/ui/PromptCarousel';
import { ModelCarousel } from '@/components/ui/ModelCarousel';
import { EvaluationCard } from '@/components/ui/EvaluationCard';
import { usePromptStore } from '@/store/promptStore';

export default function WizardPage() {
  const { promptIdx, modelIdx, fetchMetrics } = usePromptStore();
  
  // Initialize with first prompt and model
  useEffect(() => {
    fetchMetrics(promptIdx, modelIdx);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="container mx-auto py-8 px-4 min-h-screen">
      <h1 className="text-4xl font-bold text-center mb-8">Prompt Engineering Lab</h1>
      
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          <PromptCarousel />
          <ModelCarousel />
        </div>
        
        <div className="flex items-center justify-center">
          <EvaluationCard />
        </div>
      </div>
      
      <div className="mt-16 bg-card p-6 rounded-lg shadow-card">
        <h2 className="text-2xl font-semibold mb-4">About PromptLab</h2>
        <p className="text-muted-foreground">
          PromptLab helps you discover the optimal combination of prompt techniques and models for your specific use case. 
          Experiment with different prompt patterns and compare model performance across key metrics like accuracy, speed, and cost.
        </p>
        
        <div className="mt-6 grid sm:grid-cols-3 gap-4">
          <div className="p-4 bg-primary/10 rounded-lg">
            <h3 className="font-medium mb-2">Analyze Performance</h3>
            <p className="text-sm text-muted-foreground">Compare models across quality metrics, latency, and cost efficiency.</p>
          </div>
          
          <div className="p-4 bg-primary/10 rounded-lg">
            <h3 className="font-medium mb-2">Optimize Prompts</h3>
            <p className="text-sm text-muted-foreground">Test different prompt engineering techniques to improve output quality.</p>
          </div>
          
          <div className="p-4 bg-primary/10 rounded-lg">
            <h3 className="font-medium mb-2">Identify Vulnerabilities</h3>
            <p className="text-sm text-muted-foreground">Discover and address potential security risks in your prompts.</p>
          </div>
        </div>
      </div>
    </div>
  );
}