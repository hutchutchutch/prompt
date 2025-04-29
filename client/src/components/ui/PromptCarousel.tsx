import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePromptStore } from '@/store/promptStore';
import { prompts } from '@/data';

// Shared transforms in px; container perspective = 1000px
const cardVariants = {
  active:   { x:   0,   z:   0, opacity: 1, scale: 1,  rotateY:   0, transition: { duration: 0.5, ease: 'easeInOut' } },
  prev:     { x: '-30%', z: -80, opacity: .8, scale: .9, rotateY:  15, transition: { duration: 0.5, ease: 'easeInOut' } },
  next:     { x:  '30%', z: -80, opacity: .8, scale: .9, rotateY: -15, transition: { duration: 0.5, ease: 'easeInOut' } },
  inactive: { z: -120, opacity: 0, scale: .75, transition: { duration: 0.5, ease: 'easeInOut' } },
};

// Helper function to determine card position
const getPosition = (index: number, activeIndex: number, length: number) => {
  if (index === activeIndex) return 'active';
  if ((index === activeIndex + 1) || (activeIndex === length - 1 && index === 0)) return 'next';
  if ((index === activeIndex - 1) || (activeIndex === 0 && index === length - 1)) return 'prev';
  return 'inactive';
};

export const PromptCarousel: React.FC = () => {
  const { promptIdx, nextPrompt } = usePromptStore();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Setup autoplay with pause-on-hover
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const startInterval = () => {
      intervalRef.current = setInterval(() => {
        nextPrompt();
      }, 5000); // 5s cadence
    };

    startInterval();
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [nextPrompt]);

  const handleHoverStart = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const handleHoverEnd = () => {
    if (!intervalRef.current) {
      intervalRef.current = setInterval(() => {
        nextPrompt();
      }, 5000);
    }
  };

  const handleCardClick = (index: number) => {
    const position = getPosition(index, promptIdx, prompts.length);
    if (position === 'prev' || position === 'next') {
      usePromptStore.getState().setPromptIdx(index);
    }
  };

  return (
    <div className="relative w-full overflow-hidden py-10">
      <div className="absolute top-0 left-0 z-10 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-br-md font-medium">
        Prompts
      </div>
      
      <motion.div 
        className="flex items-center justify-center h-full"
        onHoverStart={handleHoverStart}
        onHoverEnd={handleHoverEnd}
      >
        <div className="relative h-[200px] w-full max-w-[250px] mx-auto" style={{ perspective: '1000px' }}>
          {prompts.map((prompt, index) => (
            <motion.div
              key={prompt.id}
              className="absolute top-0 left-0 right-0 mx-auto transition-all h-[200px] w-full max-w-[250px]"
              variants={cardVariants}
              animate={getPosition(index, promptIdx, prompts.length)}
              whileHover={{ scale: getPosition(index, promptIdx, prompts.length) === 'active' ? 1.02 : undefined }}
              onClick={() => handleCardClick(index)}
            >
              <Card className="h-full shadow-card border border-border/50 dark:border-border/30 overflow-hidden">
                <CardContent className="p-4 h-full">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold">{prompt.title}</h3>
                    {prompt.task && (
                      <Badge variant="secondary" className="text-xs">
                        {prompt.task}
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground prompt-font overflow-y-auto max-h-24 p-2 bg-muted/30 rounded">
                    {prompt.content}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};