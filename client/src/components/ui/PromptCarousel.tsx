import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { prompts } from '@/data/prompts';
import { usePromptStore } from '@/store/promptStore';

// Variants for the card animations
const cardVariants = {
  selected: {
    y: -20,
    scale: 1.1,
    boxShadow: '0px 10px 20px rgba(0, 0, 0, 0.2)',
    zIndex: 10,
    transition: { duration: 0.3 }
  },
  notSelected: (direction: number) => ({
    y: 0,
    scale: 0.9,
    opacity: 0.7,
    x: direction * 30,
    zIndex: 5,
    boxShadow: '0px 5px 10px rgba(0, 0, 0, 0.1)',
    transition: { duration: 0.3 }
  }),
  hidden: (direction: number) => ({
    y: 0,
    scale: 0.8,
    opacity: 0,
    x: direction * 100,
    zIndex: 1,
    transition: { duration: 0.3 }
  })
};

export const PromptCarousel: React.FC = () => {
  const { promptIdx, setPromptIdx } = usePromptStore();
  const [direction, setDirection] = useState(0);

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

  return (
    <div className="relative flex flex-col items-center py-6">
      <h2 className="text-2xl font-bold mb-8 text-foreground">Prompt Techniques</h2>
      
      <div className="relative w-full min-h-[280px] flex items-center justify-center">
        {/* Previous Prompt Card */}
        <motion.div 
          className="absolute w-full max-w-[250px]"
          custom={-1}
          variants={cardVariants}
          animate="notSelected"
          transition={{ duration: 0.3 }}
        >
          <PromptCard prompt={prompts[prevIdx]} isPrevious />
        </motion.div>
        
        {/* Current Prompt Card */}
        <motion.div 
          className="absolute w-full max-w-[250px]"
          variants={cardVariants}
          animate="selected"
          transition={{ duration: 0.3 }}
        >
          <PromptCard prompt={prompts[promptIdx]} isSelected />
        </motion.div>
        
        {/* Next Prompt Card */}
        <motion.div 
          className="absolute w-full max-w-[250px]"
          custom={1}
          variants={cardVariants}
          animate="notSelected"
          transition={{ duration: 0.3 }}
        >
          <PromptCard prompt={prompts[nextIdx]} isNext />
        </motion.div>
      </div>
      
      {/* Navigation Buttons */}
      <div className="flex space-x-4 mt-6">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={prevPrompt}
          className="rounded-full hover:bg-primary/10 hover:text-primary"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={nextPrompt}
          className="rounded-full hover:bg-primary/10 hover:text-primary"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
      
      {/* Pagination Indicator */}
      <div className="flex justify-center mt-2">
        <span className="text-sm text-muted-foreground">
          {promptIdx + 1} / {prompts.length}
        </span>
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

const PromptCard: React.FC<PromptCardProps> = ({ prompt, isSelected, isPrevious, isNext }) => {
  return (
    <Card className={`h-full overflow-hidden transition-all duration-200 ${isSelected ? 'shadow-lg animate-float' : 'shadow'}`}>
      <CardContent className="p-5 flex flex-col h-full">
        <div className="flex flex-col mb-3">
          <h3 className="font-bold text-lg truncate">{prompt.title}</h3>
          <div className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary w-fit mt-1">
            {prompt.task}
          </div>
        </div>
        
        <div className="flex-grow overflow-hidden text-sm text-muted-foreground line-clamp-6">
          {prompt.content}
        </div>
        
        <div className="mt-3 pt-3 border-t border-border/40 flex justify-between items-center text-xs text-muted-foreground">
          <div>ID: {prompt.id}</div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PromptCarousel;