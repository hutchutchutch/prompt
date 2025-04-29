import React, { useState, useEffect } from 'react';
import { motion, useAnimationControls } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { models } from '@/data/models';
import { prompts } from '@/data/prompts';
import { usePromptStore } from '@/store/promptStore';

// Custom transition
const customTransition = { 
  duration: 0.45, 
  ease: [0.45, 0, 0.2, 1] 
};

export const ModelCarousel: React.FC = () => {
  const { promptIdx, modelIdx, setModelIdx, fetchMetrics } = usePromptStore();
  const [direction, setDirection] = useState(0);
  const controls = useAnimationControls();
  
  const nextModel = () => {
    setDirection(1);
    setModelIdx((modelIdx + 1) % models.length);
  };

  const prevModel = () => {
    setDirection(-1);
    setModelIdx((modelIdx - 1 + models.length) % models.length);
  };

  // Get previous, current, and next model indices
  const prevIdx = (modelIdx - 1 + models.length) % models.length;
  const nextIdx = (modelIdx + 1) % models.length;
  
  // Trigger evaluation when model changes
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMetrics(promptIdx, modelIdx);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [modelIdx, fetchMetrics, promptIdx]);
  
  // Select a specific card
  const handleCardClick = (index: number) => {
    setDirection(index > modelIdx ? 1 : -1);
    setModelIdx(index);
  };

  return (
    <div className="relative flex flex-col py-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">Model Comparison</h2>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={prevModel}
            className="h-8 px-2 hover:bg-primary/10 hover:text-primary"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={nextModel}
            className="h-8 px-2 hover:bg-primary/10 hover:text-primary"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
      
      <div 
        className="relative w-full h-[200px] flex items-center justify-center"
        aria-live="polite"
      >
        {/* Previous Model Card */}
        <div 
          className="absolute left-0 top-0 z-10"
          onClick={() => handleCardClick(prevIdx)}
        >
          <ModelCard 
            model={models[prevIdx]} 
            isPrevious 
          />
        </div>
        
        {/* Current Model Card */}
        <div className="absolute z-20">
          <ModelCard 
            model={models[modelIdx]} 
            isSelected 
          />
        </div>
        
        {/* Next Model Card */}
        <div 
          className="absolute right-0 top-0 z-10"
          onClick={() => handleCardClick(nextIdx)}
        >
          <ModelCard 
            model={models[nextIdx]} 
            isNext 
          />
        </div>
      </div>
      
      {/* Pagination Indicator */}
      <div className="flex justify-center mt-4">
        <div className="bg-card/30 backdrop-blur-sm rounded-full px-3 py-1.5 flex space-x-1.5">
          {models.map((_, idx) => (
            <button 
              key={idx} 
              className={`w-2 h-2 rounded-full transition-colors ${
                idx === modelIdx 
                  ? 'bg-primary' 
                  : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
              onClick={() => handleCardClick(idx)}
              aria-label={`Select ${models[idx].title}`}
            />
          ))}
        </div>
      </div>
      
      {/* Model/Prompt Combination Status */}
      <div className="mt-2 flex justify-center">
        <div className="px-3 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-xs text-primary-foreground/90 flex items-center gap-1.5">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>
            Testing <span className="font-semibold">{models[modelIdx].title}</span> with <span className="font-semibold">{
              promptIdx >= 0 && promptIdx < (prompts?.length || 0) ? 
              prompts[promptIdx]?.title : "selected prompt"}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
};

interface ModelCardProps {
  model: {
    id: string;
    title: string;
    content: string;
  };
  isSelected?: boolean;
  isPrevious?: boolean;
  isNext?: boolean;
}

// Provider chip colors
const ProviderColors: Record<string, string> = {
  "Anthropic": "bg-red-500/20 text-red-400 border-red-500/30",
  "OpenAI": "bg-green-500/20 text-green-400 border-green-500/30",
  "Google": "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "Meta": "bg-blue-700/20 text-blue-300 border-blue-700/30",
  "Mistral": "bg-purple-500/20 text-purple-400 border-purple-500/30",
  "Other": "bg-gray-500/20 text-gray-400 border-gray-500/30"
};

// Model stats
const ModelStats: Record<string, { cost: string, speed: string, context: string }> = {
  "claude-opus": { cost: "$15/1M", speed: "Fast", context: "200K" },
  "gpt-4o": { cost: "$10/1M", speed: "Very Fast", context: "128K" },
  "gemini-1.5-pro": { cost: "$7/1M", speed: "Fast", context: "1M" },
  "llama-3-70b": { cost: "$1/1M", speed: "Medium", context: "8K" },
  "mixtral-8x22b": { cost: "$0.9/1M", speed: "Medium", context: "32K" },
  "claude-haiku": { cost: "$1/1M", speed: "Very Fast", context: "200K" },
  "gpt-3.5-turbo": { cost: "$0.5/1M", speed: "Very Fast", context: "16K" },
};

const ModelCard: React.FC<ModelCardProps> = ({ model, isSelected, isPrevious, isNext }) => {
  // Function to extract provider
  const getProvider = (id: string) => {
    if (id.includes('claude')) return 'Anthropic';
    if (id.includes('gpt')) return 'OpenAI';
    if (id.includes('gemini')) return 'Google';
    if (id.includes('llama')) return 'Meta';
    if (id.includes('mixtral')) return 'Mistral';
    return 'Other';
  };
  
  const provider = getProvider(model.id);
  const providerColor = ProviderColors[provider] || ProviderColors.Other;
  const stats = ModelStats[model.id] || { cost: "?", speed: "?", context: "?" };
  
  return (
    <motion.div 
      className={`overflow-hidden rounded-xl border aspect-[16/9] w-full max-w-[240px] transition-all duration-300 cursor-pointer ${
        isSelected 
          ? 'bg-card text-card-foreground shadow-xl border-primary/30' 
          : 'bg-background/80 text-muted-foreground shadow border-border/50'
      }`}
      initial={false}
      animate={isSelected 
        ? { scale: 1, opacity: 1, y: 0 } 
        : (isPrevious || isNext) 
          ? { scale: 0.93, opacity: 0.9, x: isPrevious ? '-15%' : '15%' } 
          : { scale: 0.85, opacity: 0 }
      }
      transition={{ 
        duration: 0.45, 
        ease: [0.45, 0, 0.2, 1],
      }}
      role="button"
      aria-selected={isSelected}
      tabIndex={isSelected ? 0 : -1}
    >
      <div className="p-5 flex flex-col h-full">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-semibold text-base sm:text-lg text-zinc-100 truncate max-w-[65%]">
            {model.title}
          </h3>
          <div className={`text-xs px-2.5 py-1 rounded-full border ${providerColor}`}>
            {provider}
          </div>
        </div>
        
        <div className="h-px w-full bg-border/40 mb-3"></div>
        
        <div className="grid grid-cols-3 gap-2 text-xs mb-3">
          <div className="flex flex-col">
            <span className="text-muted-foreground mb-1">Cost</span>
            <span className="font-medium text-zinc-300">{stats.cost}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground mb-1">Speed</span>
            <span className="font-medium text-zinc-300">{stats.speed}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground mb-1">Context</span>
            <span className="font-medium text-zinc-300">{stats.context}</span>
          </div>
        </div>
        
        <div className="flex-grow overflow-hidden text-sm text-zinc-300 line-clamp-1 relative">
          {model.content}
          <div className="absolute bottom-0 right-0 w-20 h-full bg-gradient-to-l from-card to-transparent"></div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-border/40 flex items-center text-xs text-muted-foreground justify-between">
          <div className="flex items-center gap-1.5">
            <span>{model.id}</span>
          </div>
          {isSelected && (
            <div className="text-primary text-xs font-medium">Selected</div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
