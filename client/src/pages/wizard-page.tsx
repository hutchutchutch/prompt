import React, { useEffect, useCallback } from 'react';
import { PromptCarousel } from '@/components/ui/PromptCarousel';
import { ModelCarousel } from '@/components/ui/ModelCarousel';
import { ModelGridToggle } from '@/components/wizard/ModelGridToggle';
import { SimpleEvaluationCard } from '@/components/ui/SimpleEvaluationCard';
import { RecommendationHeader } from '@/components/wizard/RecommendationHeader';
import { usePromptStore } from '@/store/promptStore';
import { useLocation } from 'wouter';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { PlayCircle } from 'lucide-react';

import { ResultBench } from '@/components/wizard/ResultBench';

export default function WizardPage() {
  const { promptIdx, modelIdx, fetchMetrics, addToHistory, metrics } = usePromptStore();
  const [location, setLocation] = useLocation();
  
  // Handle navigation
  const navigateToDashboard = useCallback(() => {
    console.log('Navigating to /dashboard');
    setLocation('/dashboard');
  }, [setLocation]);
  
  // Initialize with first prompt and model
  useEffect(() => {
    console.log('WizardPage useEffect running');
    fetchMetrics(promptIdx, modelIdx);
    
    // Handle browser back button
    const handlePopState = () => {
      console.log('Browser back button pressed');
      // If we're on the wizard page and the back button is pressed,
      // we want to navigate to the dashboard
      if (location === '/wizard') {
        navigateToDashboard();
      }
    };
    
    // Add event listener for popstate (browser back/forward buttons)
    window.addEventListener('popstate', handlePopState);
    
    // Cleanup function
    return () => {
      console.log('WizardPage unmounting');
      window.removeEventListener('popstate', handlePopState);
    };
  }, [fetchMetrics, location, modelIdx, navigateToDashboard, promptIdx]);

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

  // Handle back button click
  const handleBackClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigateToDashboard();
  };

  return (
    <>
      <motion.div
        className="container mx-auto py-8 px-4 min-h-screen"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        exit={{ opacity: 0 }}
      >
        <motion.div className="flex justify-between items-center mb-6">
          <motion.h1
            className="text-4xl font-bold text-center"
            variants={childVariants}
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-teal">
              Prompt Engineering Lab
            </span>
          </motion.h1>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleBackClick}
            className="h-8 px-2 hover:bg-primary/10 hover:text-primary"
          >
            Back to Dashboard
          </Button>
        </motion.div>
        
        <motion.div
          className="flex flex-row gap-4"
          variants={childVariants}
        >
          {/* Left column: stacked carousels */}
          <div className="flex flex-col gap-4 w-full lg:w-1/2">
            <PromptCarousel />
            <ModelCarousel />
          </div>
          {/* Right column: recommendation and evaluation card */}
          <div className="flex flex-col items-center justify-start w-full lg:w-1/2">
            <div className="w-full max-w-[400px] mx-auto">
              <RecommendationHeader />
              <SimpleEvaluationCard />
            </div>
          </div>
        </motion.div>
        
        <motion.div
          className="mt-12 flex justify-center"
          variants={childVariants}
        >
          <Button
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 shadow-lg hover:shadow-primary/30 transition-all duration-300 group"
            onClick={async () => {
              await fetchMetrics(promptIdx, modelIdx);
              addToHistory({ promptIdx, modelIdx, score: metrics.score });
            }}
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
      <ResultBench />
    </>
  );
}
