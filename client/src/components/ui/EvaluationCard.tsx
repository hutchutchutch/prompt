import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Clock, CreditCard, FileText } from 'lucide-react';
import { usePromptStore } from '@/store/promptStore';
import Odometer from 'react-odometerjs';
import 'odometer/themes/odometer-theme-minimal.css';
import { cn } from '@/lib/utils';

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
    if (!metrics) return;
    
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
    <Card className="h-full flex flex-col mx-auto relative overflow-hidden shadow-lg">
      {/* Glow background effect - animated based on score */}
      {metrics && (
        <motion.div
          className="absolute inset-0 rounded-lg bg-primary/30 blur-2xl"
          initial={{ opacity: 0, scale: 0.2 }}
          animate={{ 
            opacity: 0.4 * (metrics.score / 5), 
            scale: 0.5 + (metrics.score / 10),
          }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      )}
      
      <CardHeader className="bg-primary text-primary-foreground rounded-t-lg relative z-10 px-4 py-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Structured Output</CardTitle>
          <Badge variant="outline" className="bg-amber-900/60 text-amber-300 whitespace-nowrap text-xs py-1">
            OpenAI
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 p-4 lg:p-5 flex flex-col space-y-4 relative z-10">
        {/* Model and task name */}
        <div>
          <h3 className="text-lg font-semibold mb-1">Constrained Response</h3>
          <div className="text-sm text-zinc-400 line-clamp-2">
            Provide a comprehensive analysis of [TOPIC] using exactly these headings in this order: 1. Background (2 sentences) 2. Key...
          </div>
        </div>
        
        {/* Model details */}
        <div className="flex justify-between items-center">
          <div className="text-lg font-medium">GPT-3.5 Turbo</div>
          <div className="flex items-center">
            <Badge variant="outline" className="bg-emerald-900/20 text-emerald-400 border-emerald-800">
              Speed<span className="hidden sm:inline ml-1">: Very Fast</span>
            </Badge>
          </div>
        </div>
        
        <div className="space-y-1 text-sm text-zinc-400">
          <div>Cost: ${((metrics?.costUsd || 0) * 1000).toFixed(1)}/1M</div>
          <div className="line-clamp-2">
            This is a complex question requiring careful analysis. Looking at the available evidence, we...
          </div>
        </div>
        
        {/* Divider */}
        <div className="border-t border-border" />
        
        {/* Token Usage */}
        <div>
          <h3 className="flex items-center gap-2 text-sm font-medium mb-2">
            <FileText className="h-4 w-4 text-primary" />
            Token Usage
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-0.5">
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
            <div className="space-y-0.5">
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
          <h3 className="flex items-center gap-2 text-sm font-medium mb-2">
            <Clock className="h-4 w-4 text-primary" />
            Latency
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-0.5">
              <div className="text-xs text-muted-foreground">First Token</div>
              <div className="font-medium">
                <Odometer 
                  value={metrics.latencyFirst} 
                  format="d" 
                  duration={650}
                />ms
              </div>
            </div>
            <div className="space-y-0.5">
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
        
        {/* Total Cost */}
        <div>
          <h3 className="flex items-center gap-2 text-sm font-medium mb-2">
            <CreditCard className="h-4 w-4 text-primary" />
            Total Cost
          </h3>
          <div className="text-xl font-bold text-center text-primary">
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