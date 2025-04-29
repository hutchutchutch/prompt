import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { prompts } from '@/data/prompts';
import { usePromptStore } from '@/store/promptStore';

// Animation controls for sequence
import { useAnimationControls } from "framer-motion";

// Custom transition
const customTransition = { 
  duration: 0.45, 
  ease: [0.45, 0, 0.2, 1] 
};

export const PromptCarousel: React.FC = () => {
  const { promptIdx, setPromptIdx, fetchMetrics } = usePromptStore();
  const [direction, setDirection] = useState(0);
  const controls = useAnimationControls();
  
  const nextPrompt = () => {
    setDirection(1);
    setPromptIdx((promptIdx + 1) % prompts.length);
  };

  const prevPrompt = () => {
    setDirection(-1);
    setPromptIdx((promptIdx - 1 + prompts.length) % prompts.length);
  };

  // Get previous, current, and next prompt indices
  const prevIdx = (promptIdx - 1 + prompts.length) % prompts.length;
  const nextIdx = (promptIdx + 1) % prompts.length;
  
  // Trigger model evaluation when prompt changes
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMetrics(promptIdx, 0);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [promptIdx, fetchMetrics]);
  
  // Select a specific card
  const handleCardClick = (index: number) => {
    setDirection(index > promptIdx ? 1 : -1);
    setPromptIdx(index);
  };

  return (
    <div className="relative flex flex-col py-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">Prompt Techniques</h2>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={prevPrompt}
            className="h-8 px-2 hover:bg-primary/10 hover:text-primary"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={nextPrompt}
            className="h-8 px-2 hover:bg-primary/10 hover:text-primary"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
      
      <div 
        className="relative w-full h-[220px] flex items-center justify-center"
        aria-live="polite"
      >
        {/* Previous Prompt Card */}
        <div 
          className="absolute left-0 top-0 z-10"
          onClick={() => handleCardClick(prevIdx)}
        >
          <PromptCard 
            prompt={prompts[prevIdx]} 
            isPrevious 
          />
        </div>
        
        {/* Current Prompt Card */}
        <div className="absolute z-20">
          <PromptCard 
            prompt={prompts[promptIdx]} 
            isSelected 
          />
        </div>
        
        {/* Next Prompt Card */}
        <div 
          className="absolute right-0 top-0 z-10"
          onClick={() => handleCardClick(nextIdx)}
        >
          <PromptCard 
            prompt={prompts[nextIdx]} 
            isNext 
          />
        </div>
      </div>
      
      {/* Pagination Indicator */}
      <div className="flex justify-center mt-4">
        <div className="bg-card/30 backdrop-blur-sm rounded-full px-3 py-1.5 flex space-x-1.5">
          {prompts.map((_, idx) => (
            <button 
              key={idx} 
              className={`w-2 h-2 rounded-full transition-colors ${
                idx === promptIdx 
                  ? 'bg-primary' 
                  : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
              onClick={() => handleCardClick(idx)}
              aria-label={`Go to prompt ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

interface PromptCardProps {
  prompt: {
    id: string;
    title: string;
    task: string;
    content: string;
  };
  isSelected?: boolean;
  isPrevious?: boolean;
  isNext?: boolean;
}

const TaskBadgeColors: Record<string, string> = {
  "Explanation": "bg-teal-500/20 text-teal-400",
  "Classification": "bg-blue-500/20 text-blue-400",
  "Specialized Response": "bg-amber-500/20 text-amber-400",
  "Creative Writing": "bg-purple-500/20 text-purple-400",
  "Red Teaming": "bg-red-500/20 text-red-400",
  "Critical Analysis": "bg-indigo-500/20 text-indigo-400",
  "Structured Output": "bg-orange-500/20 text-orange-400",
  "Image Analysis": "bg-emerald-500/20 text-emerald-400"
};

// Calculate estimated token count based on content length
const estimateTokens = (content: string): number => {
  // Rough estimate: 4 characters per token
  return Math.ceil(content.length / 4);
};

// Calculate estimated cost based on token count
const estimateCost = (tokenCount: number): number => {
  // Rough estimate: $0.01 per 1000 tokens
  return parseFloat((tokenCount * 0.00001).toFixed(5));
};

const PromptCard: React.FC<PromptCardProps> = ({ prompt, isSelected, isPrevious, isNext }) => {
  // Calculate estimated tokens and cost
  const tokenEstimate = estimateTokens(prompt.content);
  const costEstimate = estimateCost(tokenEstimate);
  
  // Get badge color based on task
  const badgeColor = TaskBadgeColors[prompt.task] || "bg-primary/10 text-primary";
  
  return (
    <motion.div 
      className={`overflow-hidden rounded-xl border aspect-[4/3] w-full max-w-[260px] transition-all duration-300 cursor-pointer ${
        isSelected 
          ? 'bg-card text-card-foreground shadow-xl border-primary/30' 
          : 'bg-background/80 text-muted-foreground shadow border-border/50'
      }`}
      initial={false}
      animate={isSelected 
        ? { scale: 1, opacity: 1, y: 0 } 
        : (isPrevious || isNext) 
          ? { scale: 0.93, opacity: 0.9, x: isPrevious ? '-40%' : '40%' } 
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
        <div className="flex justify-between items-start mb-2">
          <div className={`px-2.5 py-1 rounded-full text-xs font-medium ${badgeColor}`}>
            {prompt.task}
          </div>
          <button className="text-muted-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="1" />
              <circle cx="19" cy="12" r="1" />
              <circle cx="5" cy="12" r="1" />
            </svg>
          </button>
        </div>
        
        <h3 className="font-semibold text-base sm:text-lg mb-2 text-zinc-100 line-clamp-2">
          {prompt.title}
        </h3>
        
        <div className="h-px w-full bg-border/40 my-2"></div>
        
        <div className="flex-grow overflow-hidden text-sm text-zinc-300 line-clamp-2 relative">
          {prompt.content}
          <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-card to-transparent"></div>
        </div>
        
        <div className="mt-auto pt-3 flex justify-between items-center text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
              <line x1="7" y1="7" x2="7.01" y2="7"></line>
            </svg>
            {tokenEstimate} tokens
          </div>
          <div className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M12 6v6l4 2"></path>
            </svg>
            ${costEstimate}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PromptCarousel;