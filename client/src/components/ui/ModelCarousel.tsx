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

export const ModelCarousel: React.FC<{className?: string}> = ({className = ''}) => {
  const { promptIdx, modelIdx, setModelIdx, fetchMetrics } = usePromptStore();
  const [direction, setDirection] = useState(0);
  const controls = useAnimationControls();
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalModel, setModalModel] = useState<typeof models[0] | null>(null);
  
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
  
  // Open modal for a model
  const handleModelCardClick = (model: typeof models[0]) => {
    setModalModel(model);
    setModalOpen(true);
    console.log("Opening model modal for:", model.title);
  };

  return (
    <div className={`relative w-full ${className}`}>
      <div
        className="relative w-full h-[450px] flex items-center justify-center overflow-hidden"
        aria-live="polite"
      >
        {/* Fade cards at edges using CSS mask-image */}
        {/* Previous Model Card */}
        <div 
          className="absolute left-0 top-0 z-10 flex items-center"
          onClick={() => handleCardClick(prevIdx)}
        >
          <div className="absolute -left-4 z-20 bg-primary/20 hover:bg-primary/30 rounded-full p-1 cursor-pointer">
            <ChevronLeft className="h-6 w-6 text-primary" />
          </div>
          <ModelCard 
            model={models[prevIdx]} 
            isPrevious 
          />
        </div>
        
        {/* Current Model Card */}
        <div className="absolute z-20">
          <div onClick={() => handleModelCardClick(models[modelIdx])}>
            <ModelCard 
              model={models[modelIdx]} 
              isSelected 
            />
          </div>
        </div>
        
        {/* Next Model Card */}
        <div 
          className="absolute right-0 top-0 z-10 flex items-center"
          onClick={() => handleCardClick(nextIdx)}
        >
          <ModelCard 
            model={models[nextIdx]} 
            isNext 
          />
          <div className="absolute -right-4 z-20 bg-primary/20 hover:bg-primary/30 rounded-full p-1 cursor-pointer">
            <ChevronRight className="h-6 w-6 text-primary" />
          </div>
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
      
    
      
      {/* Placeholder for Model Modal */}
      {modalOpen && modalModel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-lg shadow-lg max-w-2xl w-full">
            <h2 className="text-xl font-bold mb-4">{modalModel.title}</h2>
            <div className="mb-4">
              <p className="text-muted-foreground mb-2">Model content:</p>
              <div className="bg-background p-4 rounded border border-border">
                {modalModel.content}
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setModalOpen(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}
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
      className={`overflow-hidden rounded-xl border w-full max-w-[340px] h-[450px] transition-all duration-300 cursor-pointer ${
        isSelected
          ? 'bg-card text-card-foreground shadow-xl border-primary/30'
          : 'bg-background/80 text-muted-foreground shadow border-border/50'
      }`}
      initial={false}
      animate={isSelected
        ? { scale: 1, opacity: 1, y: 0 }
        : (isPrevious || isNext)
          ? { scale: 0.93, opacity: 0.9, x: isPrevious ? -254 : 254 }
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
        <h3 className="font-semibold text-base sm:text-lg text-zinc-100 mb-2">Output</h3>
        <div className="flex-grow overflow-auto text-sm text-zinc-300 mb-2 max-h-[330px]">
          {model.content}
        </div>
        <div className="h-px w-full bg-border/40 my-2"></div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex gap-4">
            <div>
              <span className="text-muted-foreground">Cost: </span>
              <span className="font-medium text-zinc-300">{stats.cost}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Speed: </span>
              <span className="font-medium text-zinc-300">{stats.speed}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Context: </span>
              <span className="font-medium text-zinc-300">{stats.context}</span>
            </div>
          </div>
          <div className={`text-xs px-2.5 py-1 rounded-full border ${providerColor}`}>
            {provider}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
