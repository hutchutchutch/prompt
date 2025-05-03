import React from 'react';
import { usePromptStore } from '@/store/promptStore';
import { prompts } from '@/data/prompts';
import { models } from '@/data/models';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export const RecommendationHeader: React.FC<{className?: string}> = ({className = ''}) => {
  const { setPromptIdx, setModelIdx, metrics } = usePromptStore();
  
  console.log("Current metrics:", metrics);
  
  // Find the highest scoring combo
  const best = Array.isArray(metrics)
    ? metrics.reduce((max, curr) => (curr.score > (max?.score ?? -Infinity) ? curr : max), null)
    : null;

  const bestPrompt = best ? prompts.find(p => p.id === best.promptId) : null;
  const bestModel = best ? models.find(m => m.id === best.modelId) : null;
  const bestScore = best?.score;

  if (!bestPrompt || !bestModel) return null;
  
  // Find indices for best prompt and model
  const bestPromptIdx = bestPrompt ? prompts.findIndex(p => p.id === bestPrompt.id) : -1;
  const bestModelIdx = bestModel ? models.findIndex(m => m.id === bestModel.id) : -1;
  
  // Handle click to apply recommendation
  const handleRecommendationClick = () => {
    console.log("Recommendation clicked!");
    console.log("Recommended prompt index:", bestPromptIdx);
    console.log("Recommended model index:", bestModelIdx);
    
    if (bestPromptIdx >= 0) {
      setPromptIdx(bestPromptIdx);
      console.log("Setting prompt index to:", bestPromptIdx);
    }
    if (bestModelIdx >= 0) {
      setModelIdx(bestModelIdx);
      console.log("Setting model index to:", bestModelIdx);
    }
  };
  
  return (
    <motion.div 
      className={`w-full cursor-pointer ${className}`}
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
            <span className="font-medium text-sm">{bestPrompt.title}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Model:</span>
            <span className="font-medium text-sm">{bestModel.title}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Score:</span>
            <span className="font-medium text-sm">{bestScore}</span>
          </div>
        </div>
        
        <div className="mt-2 text-xs text-center text-primary/80 italic">
          Click to apply this recommendation
        </div>
      </div>
    </motion.div>
  );
};
