import React, { useState, useEffect } from 'react';
import { PromptModal } from './PromptModal';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { prompts } from '@/data/prompts';
import { usePromptStore } from '@/store/promptStore';
import { promptFormats } from '@/data/prompt-formats';

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

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalPrompt, setModalPrompt] = useState<typeof prompts[0] | null>(null);

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

  // Select a specific card (carousel navigation)
  const handleCardClick = (index: number) => {
    setDirection(index > promptIdx ? 1 : -1);
    setPromptIdx(index);
    // Set activeFormat to the selected prompt's title
    setActiveFormat(prompts[index]?.title || null);
  };

  // Open modal for a prompt
  const handlePromptCardClick = (prompt: typeof prompts[0]) => {
    setModalPrompt(prompt);
    setModalOpen(true);
  };

  // Get prompt formats from data
  const formats = promptFormats.map(f => f.title);

  // State for active format filter
  const [activeFormat, setActiveFormat] = useState<string | null>(null);

  // Filtered prompts based on active format
  const filteredPrompts = activeFormat
    ? prompts.filter(prompt => prompt.title === activeFormat)
    : prompts;

  // When prompt card changes, update activeFormat to match its title
  useEffect(() => {
    setActiveFormat(prompts[promptIdx]?.title || null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [promptIdx]);
  
  // Handle task filter click
  const handleFormatClick = (format: string) => {
    if (activeFormat === format) {
      setActiveFormat(null); // Toggle off if already active
    } else {
      setActiveFormat(format);
      // Find first prompt with this format and set it as active
      const firstMatchIndex = prompts.findIndex(p => p.title === format);
      if (firstMatchIndex !== -1) {
        setPromptIdx(firstMatchIndex);
      }
    }
  };

  return (
    <>
      <div className="relative flex flex-col py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-foreground">
            Prompt chosen: {prompts[promptIdx].title} for {prompts[promptIdx].task}
          </h2>
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
        
        <div className="flex items-center mb-4">
          <div>
            <label htmlFor="prompt-structure-select" className="mr-2 text-sm text-muted-foreground font-medium">
              Prompt Structure
            </label>
            <select
              id="prompt-structure-select"
              className="bg-zinc-800 text-zinc-200 rounded-md px-3 py-1.5 text-xs font-medium border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              value={activeFormat || ""}
              onChange={e => handleFormatClick(e.target.value)}
            >
              <option value="">All</option>
              {formats.map(format => (
                <option key={format} value={format}>
                  {format}
                </option>
              ))}
            </select>
          </div>
          <div className="ml-auto">
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3 bg-primary/10 hover:bg-primary/20 text-primary"
            >
              Create New
            </Button>
          </div>
        </div>
        
        <div
          className="relative w-full h-[280px] flex items-center justify-center overflow-hidden px-[14px]"
          aria-live="polite"
          style={{
            WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 20%, black 80%, transparent 100%)",
            maskImage: "linear-gradient(to right, transparent 0%, black 20%, black 80%, transparent 100%)"
          }}
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
            <div onClick={() => handlePromptCardClick(prompts[promptIdx])}>
              <PromptCard
                prompt={prompts[promptIdx]}
                isSelected
              />
            </div>
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
      {/* Prompt Modal */}
      <PromptModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        prompt={modalPrompt}
      />
    </>
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
  
  // Use a consistent dark badge style for all categories
  return (
    <motion.div
      className={`overflow-hidden rounded-xl border aspect-[3/4] w-full max-w-[480px] max-h-[280px] h-full transition-all duration-300 cursor-pointer ${
        isSelected
          ? 'bg-card text-card-foreground shadow-xl border-primary/30'
          : 'bg-background/80 text-muted-foreground shadow border-border/50'
      }`}
      initial={false}
      animate={isSelected
        ? { scale: 1, opacity: 1, y: 0 }
        : (isPrevious || isNext)
          ? { scale: 0.93, opacity: 0.9, x: isPrevious ? -254 : 254, y: 0 }
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
          <div className={`px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-800 text-zinc-200`}>
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
        
        <div className="flex-grow overflow-auto text-sm text-zinc-300 max-h-[120px] relative">
          {prompt.content}
        </div>
        
        <div className="mt-auto pt-3 flex justify-between items-center text-xs text-muted-foreground border-t border-border/30 mt-2 pt-2">
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
