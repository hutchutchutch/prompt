import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, CreditCard, FileText } from 'lucide-react';
import { usePromptStore } from '@/store/promptStore';

// Simplified version of EvaluationCard without Odometer
export const SimpleEvaluationCard: React.FC = () => {
  const { metrics, loading } = usePromptStore();
  const [showGlow, setShowGlow] = useState(false);

  // Format number with commas
  const formatNumber = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Format currency
  const formatCurrency = (num: number): string => {
    return num.toFixed(4);
  };

  // Format time
  const formatTime = (ms: number): string => {
    if (ms >= 1000) {
      return `${(ms / 1000).toFixed(1)}s`;
    }
    return `${ms}ms`;
  };

  // Setup a timer to trigger the animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowGlow(true);
    }, 500);
    
    return () => {
      clearTimeout(timer);
    };
  }, [metrics]);

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
  const MetricsCard: React.FC = () => {
    return (
      <Card
        className="eval-panel h-full flex flex-col mx-auto relative overflow-hidden shadow-lg"
        style={{ position: "sticky", top: 96, zIndex: 20 }}
      >
        {/* Glow background effect - animated based on score */}
        {showGlow && (
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
            <span className="text-3xl font-extrabold flex items-center gap-2 drop-shadow-lg">
              {metrics.score} / 100 <span className="text-2xl">⭐</span>
            </span>
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
                  {formatNumber(metrics.tokensIn)} tokens
                </div>
                <div className="text-xs text-muted-foreground">
                  ${formatCurrency(metrics.costUsd / 3)}
                </div>
              </div>
              <div className="space-y-0.5">
                <div className="text-xs text-muted-foreground">Output</div>
                <div className="font-medium">
                  {formatNumber(metrics.tokensOut)} tokens
                </div>
                <div className="text-xs text-muted-foreground">
                  ${formatCurrency((metrics.costUsd / 3) * 2)}
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
                  {formatTime(metrics.latencyFirst)}
                </div>
              </div>
              <div className="space-y-0.5">
                <div className="text-xs text-muted-foreground">Total Time</div>
                <div className="font-medium">
                  {formatTime(metrics.latencyTotal)}
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
              ${formatCurrency(metrics.costUsd)}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // --- Auto-Optimize Dialog State ---
  const [optimizeOpen, setOptimizeOpen] = React.useState(false);

  // --- Sparkles Icon (inline for now) ---
  const Sparkles = () => (
    <svg className="inline-block mr-1 -mt-1" width="20" height="20" fill="none" viewBox="0 0 24 24">
      <path d="M12 2v2m0 16v2m10-10h-2M4 12H2m15.07-7.07l-1.41 1.41M6.34 17.66l-1.41 1.41M17.66 17.66l-1.41-1.41M6.34 6.34L4.93 4.93" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="12" cy="12" r="5" stroke="#14b8a6" strokeWidth="2"/>
    </svg>
  );

  return (
    <div className="w-full min-w-[300px] max-w-[400px] mx-auto">
      {loading ? <SkeletonCard /> : <MetricsCard />}
      {/* Evaluation Panel Footer */}
      <div className="w-full flex justify-center mt-4">
        <button
          className="px-6 py-2 rounded-lg bg-teal-500 text-white font-semibold shadow-lg flex items-center gap-2 text-base hover:bg-teal-600 transition-all"
          onClick={() => setOptimizeOpen(true)}
        >
          <Sparkles />
          Auto-Optimize
        </button>
      </div>
      {/* Auto-Optimize Dialog (stub) */}
      {optimizeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-background rounded-xl shadow-2xl p-8 min-w-[340px] max-w-[90vw]">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Sparkles /> Auto-Optimize
            </h2>
            <p className="mb-4 text-sm text-muted-foreground">
              (Dialog UI and optimization flow to be implemented)
            </p>
            <button
              className="mt-2 px-4 py-2 rounded bg-zinc-800 text-zinc-100 hover:bg-zinc-700"
              onClick={() => setOptimizeOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
