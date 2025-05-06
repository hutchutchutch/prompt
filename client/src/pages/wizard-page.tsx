import React, { useEffect, useCallback, useState } from 'react';
import { PromptCarousel } from '@/components/ui/PromptCarousel';
import { ModelCarousel } from '@/components/ui/ModelCarousel';
import { SimpleEvaluationCard } from '@/components/ui/SimpleEvaluationCard';
import { RecommendationHeader } from '@/components/wizard/RecommendationHeader';
import { usePromptStore } from '@/store/promptStore';
import { useLocation } from 'wouter';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { PlayCircle } from 'lucide-react';

import { ResultBench } from '@/components/wizard/ResultBench';
import { UserMessage } from '@/components/ui/UserMessage';
import { ExpectedOutput } from '@/components/ui/ExpectedOutput';

export default function WizardPage() {
  // CSS styles for consistent card heights
  const [userMessage, setUserMessage] = useState("");
  const [expectedOutput, setExpectedOutput] = useState("");
  const [output, setOutput] = useState<string | null>(null);

  // Handler for user message input change
  const handleUserMessageChange = (value: string) => {
    setUserMessage(value);
  };

  // Handler for expected output input change
  const handleExpectedOutputChange = (value: string) => {
    setExpectedOutput(value);
  };

  // Handler for user message submit
  const handleUserMessageSubmit = () => {
    // Aggregate UserMessage, System Message, and selected Model
    // For now, mock output generation
    // In a real app, fetch the prompt and model details from stores or props
    const systemMessage = "System message from selected prompt"; // TODO: Replace with actual system message
    const modelName = "Selected model"; // TODO: Replace with actual model name
    const generatedOutput = `Model: ${modelName}\nSystem: ${systemMessage}\nUser: ${userMessage}\n\n[Mocked Output]`;
    setOutput(generatedOutput);
  };

  React.useEffect(() => {
    // Add CSS to ensure consistent card height
    const style = document.createElement('style');
    style.textContent = `
      .card-container {
        display: flex;
        align-items: flex-end;
        height: 450px;
        width: 100%;
      }
      
      .card-container > div {
        width: 100%;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  const { promptIdx, modelIdx, fetchMetrics, addToHistory, metrics } = usePromptStore();
  const [location, setLocation] = useLocation();
  
  // Evaluation modal state
  const [evalModalOpen, setEvalModalOpen] = useState(false);
  
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
  
  // Handle evaluation card click
  const handleEvalCardClick = () => {
    setEvalModalOpen(true);
    console.log("Opening evaluation modal");
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
        
        {/* Top row: UserMessage (left) and ExpectedOutput (right) */}
        <motion.div
          className="flex flex-col lg:flex-row gap-8 mb-10"
          variants={childVariants}
        >
          <div className="w-full lg:w-1/2 flex flex-col">
            <UserMessage
              value={userMessage}
              onChange={handleUserMessageChange}
              onSubmit={handleUserMessageSubmit}
            />
          </div>
          <div className="w-full lg:w-1/2 flex flex-col">
            <ExpectedOutput
              value={expectedOutput}
              onChange={handleExpectedOutputChange}
              // Optionally, add onSubmit or validation here
            />
          </div>
        </motion.div>

        {/* Only show the rest of the workflow if userMessage is filled */}
        {userMessage.trim() && (
          <motion.div
            className="flex flex-row gap-8"
            variants={childVariants}
          >
            {/* First column: Prompt */}
            <div className="w-full lg:w-1/3 flex flex-col items-center">
              <h2 className="text-xl font-semibold text-center mb-6">Prompt</h2>
              <div className="w-full max-w-[340px]">
                <div className="card-container h-[450px] flex items-end">
                  <PromptCarousel />
                </div>
              </div>
            </div>
            
            {/* Second column: Model */}
            <div className="w-full lg:w-1/3 flex flex-col items-center">
              <h2 className="text-xl font-semibold text-center mb-6">Model</h2>
              <div className="w-full max-w-[340px]">
                <div className="card-container h-[450px] flex items-end">
                  <ModelCarousel />
                </div>
              </div>
            </div>
            
            {/* Third column: Output */}
            <div className="w-full lg:w-1/3 flex flex-col items-center">
              <h2 className="text-xl font-semibold text-center mb-6">Output</h2>
              <div className="w-full max-w-[340px]">
                <div className="card-container h-[450px] flex items-end" onClick={handleEvalCardClick}>
                  <SimpleEvaluationCard
                    output={output || ""}
                    expectedOutput={expectedOutput}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
        
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
      
      {/* Placeholder for Evaluation Modal */}
      {evalModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-lg shadow-lg max-w-2xl w-full">
            <h2 className="text-xl font-bold mb-4">Evaluation Details</h2>
            <div className="mb-4">
              <p className="text-muted-foreground mb-2">Detailed metrics:</p>
              <div className="bg-background p-4 rounded border border-border">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium">Score</h3>
                    <p className="text-lg">{metrics.score?.toFixed(1) || 'N/A'}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Cost</h3>
                    <p className="text-lg">${metrics.costUsd?.toFixed(4) || 'N/A'}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Latency</h3>
                    <p className="text-lg">{metrics.latencyTotal ? `${(metrics.latencyTotal / 1000).toFixed(2)}s` : 'N/A'}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Tokens</h3>
                    <p className="text-lg">{metrics.tokensIn + metrics.tokensOut || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setEvalModalOpen(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
