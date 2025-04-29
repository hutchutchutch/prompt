import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, Clock, CreditCard, FileText } from 'lucide-react';
import { usePromptStore } from '@/store/promptStore';
import Odometer from 'react-odometerjs';
import 'odometer/themes/odometer-theme-minimal.css';

// Import Odometer CSS
import 'odometer/themes/odometer-theme-minimal.css';

// Glow variants for the background effect
const glowVariants = {
  hidden: { opacity: 0, scale: 0 },
  visible: (score: number) => ({
    opacity: 0.7 * (score / 5),
    scale: 0.4 + 0.6 * (score / 5), // min .4 → max 1
    transition: { duration: .4, ease: 'easeInOut' }
  }),
};

// Skeleton loader component
const SkeletonCard: React.FC = () => (
  <Card className="h-full flex flex-col mx-auto relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-r from-card to-background animate-pulse"></div>
    <CardHeader className="bg-primary/30 text-primary-foreground rounded-t-lg">
      <div className="h-7 w-48 bg-card/20 rounded animate-pulse"></div>
    </CardHeader>
    <CardContent className="flex-1 p-6 flex flex-col space-y-6">
      <div className="text-center">
        <div className="h-10 w-20 bg-card/20 rounded mx-auto animate-pulse"></div>
        <div className="flex justify-center space-x-1 mt-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-6 w-6 bg-card/20 rounded-full animate-pulse"></div>
          ))}
        </div>
      </div>
      <div className="border-t border-border/30"></div>
      <div>
        <div className="h-5 w-32 bg-card/20 rounded mb-3 animate-pulse"></div>
        <div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 w-16 bg-card/20 rounded animate-pulse"></div>
              <div className="h-5 w-20 bg-card/20 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    </CardContent>
  </Card>
);

// Metrics card that shows actual data
const MetricsCard: React.FC<{ onAnimationComplete?: () => void }> = ({ onAnimationComplete }) => {
  const { metrics } = usePromptStore();
  const [animationComplete, setAnimationComplete] = useState(false);
  
  if (!metrics) return null;
  
  // Round to single decimal place for display
  const displayScore = Math.round(metrics.score * 10) / 10;
  
  // Generate stars based on score
  const stars = Array(5).fill(0).map((_, i) => {
    // Determine if star should be filled, half-filled, or empty
    let fill = "none";
    if (i < Math.floor(metrics.score)) {
      fill = "full";
    } else if (i < Math.ceil(metrics.score) && Math.ceil(metrics.score) !== Math.floor(metrics.score)) {
      fill = "half";
    }
    return { fill };
  });
  
  // Format milliseconds to friendly string
  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  // Setup a timer to trigger the animation after the odometer animation should be complete
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationComplete(true);
      if (onAnimationComplete) {
        onAnimationComplete();
      }
    }, 850); // slightly longer than odometer duration
    
    return () => {
      clearTimeout(timer);
    };
  }, [metrics, onAnimationComplete]);
  
  return (
    <Card className="h-full flex flex-col mx-auto relative overflow-hidden">
      {/* Glow background effect - animated based on score */}
      <motion.div
        className="absolute inset-0 rounded-lg bg-teal-400/50 blur-2xl"
        variants={glowVariants}
        initial="hidden"
        animate={animationComplete ? "visible" : "hidden"}
        custom={metrics.score}
      />
      
      <CardHeader className="bg-primary text-primary-foreground rounded-t-lg relative z-10">
        <CardTitle className="text-xl font-semibold">Performance Evaluation</CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 p-6 flex flex-col space-y-6 relative z-10">
        {/* Overall Score with Stars */}
        <div className="text-center">
          <div className="text-4xl font-bold mb-2">
            <Odometer 
              value={displayScore} 
              format="(.1)" 
              duration={800}
              theme="minimal"
            />/5
          </div>
          <div className="flex justify-center space-x-1">
            {stars.map((star, i) => (
              <Star
                key={i}
                className={`h-6 w-6 ${
                  star.fill === "full" ? "fill-primary text-primary" : 
                  star.fill === "half" ? "fill-primary text-primary opacity-50" : 
                  "text-muted-foreground"
                }`}
              />
            ))}
          </div>
        </div>
        
        {/* Divider */}
        <div className="border-t border-border" />
        
        {/* Token Usage */}
        <div>
          <h3 className="flex items-center gap-2 text-sm font-medium mb-3">
            <FileText className="h-4 w-4 text-primary" />
            Token Usage
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Input</div>
              <div className="font-medium">
                <Odometer 
                  value={metrics.tokensIn} 
                  format="d" 
                  duration={600}
                /> tokens
              </div>
              <div className="text-xs text-muted-foreground">
                $<Odometer 
                  value={metrics.costUsd / 3} 
                  format="(0.0000)" 
                  duration={700}
                />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Output</div>
              <div className="font-medium">
                <Odometer 
                  value={metrics.tokensOut} 
                  format="d" 
                  duration={600}
                /> tokens
              </div>
              <div className="text-xs text-muted-foreground">
                $<Odometer 
                  value={(metrics.costUsd / 3) * 2} 
                  format="(0.0000)" 
                  duration={700}
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Latency */}
        <div>
          <h3 className="flex items-center gap-2 text-sm font-medium mb-3">
            <Clock className="h-4 w-4 text-primary" />
            Latency
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">First Token</div>
              <div className="font-medium">
                <Odometer 
                  value={metrics.latencyFirst} 
                  format="d" 
                  duration={650}
                />ms
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Total Time</div>
              <div className="font-medium">
                {metrics.latencyTotal >= 1000 ? (
                  <><Odometer 
                    value={metrics.latencyTotal / 1000} 
                    format="(0.0)" 
                    duration={700}
                  />s</>
                ) : (
                  <><Odometer 
                    value={metrics.latencyTotal} 
                    format="d" 
                    duration={700}
                  />ms</>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Quality Metrics */}
        <div>
          <h3 className="flex items-center gap-2 text-sm font-medium mb-3">
            <div className="h-4 w-4 text-primary flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 6H4V18H20V6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M4 10H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 14H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            Quality Metrics
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Coverage</div>
              <div className="font-medium">
                <Odometer 
                  value={metrics.coverage * 100} 
                  format="d" 
                  duration={750}
                />%
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Factual</div>
              <div className="font-medium">
                <Odometer 
                  value={metrics.factual * 100} 
                  format="d" 
                  duration={750}
                />%
              </div>
            </div>
          </div>
        </div>
        
        {/* Total Cost */}
        <div>
          <h3 className="flex items-center gap-2 text-sm font-medium mb-3">
            <CreditCard className="h-4 w-4 text-primary" />
            Total Cost
          </h3>
          <div className="text-xl font-bold text-center">
            $<Odometer 
              value={metrics.costUsd} 
              format="(0.0000)" 
              duration={800}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const EvaluationCard: React.FC = () => {
  const { promptIdx, modelIdx, metrics, loading, fetchMetrics } = usePromptStore();
  const [showGlow, setShowGlow] = useState(false);

  // Fetch metrics when prompt or model changes
  useEffect(() => {
    fetchMetrics(promptIdx, modelIdx);
    setShowGlow(false);
  }, [promptIdx, modelIdx, fetchMetrics]);

  return (
    <div className="w-full min-w-[300px] max-w-[400px] mx-auto">
      {loading ? <SkeletonCard /> : <MetricsCard onAnimationComplete={() => setShowGlow(true)} />}
    </div>
  );
};