import React from 'react';
import { usePromptStore } from '@/store/promptStore';
import { prompts } from '@/data/prompts';
import { models } from '@/data/models';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export const RecommendationHeader: React.FC = () => {
  const { setPromptIdx, setModelIdx, metrics } = usePromptStore();
  
  console.log("Current metrics:", metrics);
  
  // Find the best prompt and model based on the metrics
  // In a real app, this would be determined by the backend
  // For now, we'll use the current prompt and model as the recommendation
  const recommendedPromptId = metrics.promptId;
  const recommendedModelId = metrics.modelId;
  
  console.log("Recommended promptId:", recommendedPromptId);
  console.log("Recommended modelId:", recommendedModelId);
  
  // Find the indices of the recommended prompt and model
  const recommendedPromptIdx = prompts.findIndex(p => p.id === recommendedPromptId);
  const recommendedModelIdx = models.findIndex(m => m.id === recommendedModelId);
  
  // Get the prompt and model objects
  const recommendedPrompt = recommendedPromptIdx >= 0 ? prompts[recommendedPromptIdx] : null;
  const recommendedModel = recommendedModelIdx >= 0 ? models[recommendedModelIdx] : null;
  
  // Handle click to apply recommendation
  const handleRecommendationClick = () => {
    console.log("Recommendation clicked!");
    console.log("Recommended prompt index:", recommendedPromptIdx);
    console.log("Recommended model index:", recommendedModelIdx);
    
    if (recommendedPromptIdx >= 0) {
      setPromptIdx(recommendedPromptIdx);
      console.log("Setting prompt index to:", recommendedPromptIdx);
    }
    if (recommendedModelIdx >= 0) {
      setModelIdx(recommendedModelIdx);
      console.log("Setting model index to:", recommendedModelIdx);
    }
  };
  
  if (!recommendedPrompt || !recommendedModel) {
    return null;
  }
  
  return (
    <motion.div 
      className="w-full mb-2 cursor-pointer"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleRecommendationClick}
    >
      <div className="bg-gradient-to-r from-primary/20 to-teal-500/20 p-3 rounded-lg border border-primary/30 shadow-md">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-primary">Recommendation:</h3>
        </div>
        
        <div className="flex flex-col space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Prompt Structure:</span>
            <span className="font-medium text-sm">{recommendedPrompt.title}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Model:</span>
            <span className="font-medium text-sm">{recommendedModel.title}</span>
          </div>
        </div>
        
        <div className="mt-2 text-xs text-center text-primary/80 italic">
          Click to apply this recommendation
        </div>
      </div>
    </motion.div>
  );
};
