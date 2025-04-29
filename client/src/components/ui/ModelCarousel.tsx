import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { models } from '@/data/models';
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

export const ModelCarousel: React.FC = () => {
  const { modelIdx, setModelIdx } = usePromptStore();
  const [direction, setDirection] = useState(0);

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

  return (
    <div className="relative flex flex-col items-center py-6">
      <h2 className="text-2xl font-bold mb-8 text-foreground">Model Comparison</h2>
      
      <div className="relative w-full min-h-[280px] flex items-center justify-center">
        {/* Previous Model Card */}
        <motion.div 
          className="absolute w-full max-w-[250px]"
          custom={-1}
          variants={cardVariants}
          animate="notSelected"
          transition={{ duration: 0.3 }}
        >
          <ModelCard model={models[prevIdx]} isPrevious />
        </motion.div>
        
        {/* Current Model Card */}
        <motion.div 
          className="absolute w-full max-w-[250px]"
          variants={cardVariants}
          animate="selected"
          transition={{ duration: 0.3 }}
        >
          <ModelCard model={models[modelIdx]} isSelected />
        </motion.div>
        
        {/* Next Model Card */}
        <motion.div 
          className="absolute w-full max-w-[250px]"
          custom={1}
          variants={cardVariants}
          animate="notSelected"
          transition={{ duration: 0.3 }}
        >
          <ModelCard model={models[nextIdx]} isNext />
        </motion.div>
      </div>
      
      {/* Navigation Buttons */}
      <div className="flex space-x-4 mt-6">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={prevModel}
          className="rounded-full hover:bg-primary/10 hover:text-primary"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={nextModel}
          className="rounded-full hover:bg-primary/10 hover:text-primary"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
      
      {/* Pagination Indicator */}
      <div className="flex justify-center mt-2">
        <span className="text-sm text-muted-foreground">
          {modelIdx + 1} / {models.length}
        </span>
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
  
  return (
    <Card className={`h-full overflow-hidden transition-all duration-200 ${isSelected ? 'shadow-lg animate-float' : 'shadow'}`}>
      <CardContent className="p-5 flex flex-col h-full">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-bold text-lg truncate">{model.title}</h3>
          <div className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
            {provider}
          </div>
        </div>
        
        <div className="flex-grow overflow-hidden text-sm text-muted-foreground line-clamp-6">
          {model.content}
        </div>
        
        <div className="mt-3 pt-3 border-t border-border/40 flex justify-between items-center text-xs text-muted-foreground">
          <div>ID: {model.id}</div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ModelCarousel;