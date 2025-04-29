import React, { useEffect } from 'react';
import { PromptCarousel } from '@/components/ui/PromptCarousel';
import { ModelCarousel } from '@/components/ui/ModelCarousel';
import { EvaluationCard } from '@/components/ui/EvaluationCard';
import { usePromptStore } from '@/store/promptStore';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { PlayCircle } from 'lucide-react';

export default function WizardPage() {
  const { promptIdx, modelIdx, fetchMetrics } = usePromptStore();
  
  // Initialize with first prompt and model
  useEffect(() => {
    fetchMetrics(promptIdx, modelIdx);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };

  const childVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        type: "spring", 
        damping: 12 
      }
    }
  };

  return (
    <motion.div 
      className="container mx-auto py-8 px-4 min-h-screen"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.h1 
        className="text-4xl font-bold text-center mb-8"
        variants={childVariants}
      >
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-teal">
          Prompt Engineering Lab
        </span>
      </motion.h1>
      
      <motion.div 
        className="grid lg:grid-cols-2 gap-8"
        variants={childVariants}
      >
        <div className="space-y-8">
          <PromptCarousel />
          <ModelCarousel />
        </div>
        
        <div className="flex items-center justify-center">
          <EvaluationCard />
        </div>
      </motion.div>
      
      <motion.div 
        className="mt-12 flex justify-center"
        variants={childVariants}
      >
        <Button 
          size="lg" 
          className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 shadow-lg hover:shadow-primary/30 transition-all duration-300 group"
          onClick={() => fetchMetrics(promptIdx, modelIdx)}
        >
          <PlayCircle className="h-5 w-5 transition-transform group-hover:scale-110" />
          Run Evaluation
        </Button>
      </motion.div>
      
      <motion.div 
        className="mt-16 bg-card p-6 rounded-lg shadow-lg border border-border/50"
        variants={childVariants}
      >
        <h2 className="text-2xl font-semibold mb-4">About PromptLab</h2>
        <p className="text-muted-foreground">
          PromptLab helps you discover the optimal combination of prompt techniques and models for your specific use case. 
          Experiment with different prompt patterns and compare model performance across key metrics like accuracy, speed, and cost.
        </p>
        
        <div className="mt-6 grid sm:grid-cols-3 gap-4">
          <motion.div 
            className="p-4 bg-primary/10 rounded-lg hover:bg-primary/15 transition-colors"
            whileHover={{ scale: 1.03, y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <h3 className="font-medium mb-2">Analyze Performance</h3>
            <p className="text-sm text-muted-foreground">Compare models across quality metrics, latency, and cost efficiency.</p>
          </motion.div>
          
          <motion.div 
            className="p-4 bg-primary/10 rounded-lg hover:bg-primary/15 transition-colors"
            whileHover={{ scale: 1.03, y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <h3 className="font-medium mb-2">Optimize Prompts</h3>
            <p className="text-sm text-muted-foreground">Test different prompt engineering techniques to improve output quality.</p>
          </motion.div>
          
          <motion.div 
            className="p-4 bg-primary/10 rounded-lg hover:bg-primary/15 transition-colors"
            whileHover={{ scale: 1.03, y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <h3 className="font-medium mb-2">Identify Vulnerabilities</h3>
            <p className="text-sm text-muted-foreground">Discover and address potential security risks in your prompts.</p>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}