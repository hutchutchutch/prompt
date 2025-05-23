import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, CreditCard, FileText, Star } from 'lucide-react';
import { usePromptStore } from '@/store/promptStore';
import { models } from '@/data/models';
import { Rating, RatingButton } from '@/components/ui/rating';

/**
 * Simplified version of EvaluationCard without Odometer.
 * If `output` is provided, displays the output string instead of metrics.
 * If `expectedOutput` is provided, displays it for evaluation reference.
 */
export const SimpleEvaluationCard: React.FC<{
  className?: string;
  output?: string;
  expectedOutput?: string;
}> = ({className = '', output, expectedOutput}) => {
  const { metrics, loading, modelIdx } = usePromptStore();
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
    <Card className="h-[450px] flex flex-col mx-auto relative overflow-hidden dark:bg-[#1A1A1A]">
      <div className="absolute inset-0 bg-gradient-to-r from-card to-background animate-pulse dark:from-[#232323] dark:to-[#1A1A1A]"></div>
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

  // Output card for displaying generated output
  const OutputCard: React.FC<{output: string; expectedOutput?: string}> = ({ output, expectedOutput }) => (
    <Card className="h-[450px] flex flex-col mx-auto relative overflow-hidden shadow-lg dark:bg-[#1A1A1A]">
      <CardHeader className="bg-primary text-primary-foreground rounded-t-lg relative z-10 px-3 py-2">
        <CardTitle className="text-lg font-bold">Model Output</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-4 flex flex-col space-y-3 relative z-10">
        <pre className="whitespace-pre-wrap text-sm text-foreground">{output}</pre>
        {expectedOutput && (
          <div className="mt-4 p-2 rounded bg-primary/10 border border-primary/20">
            <div className="text-xs font-semibold text-primary mb-1">Expected Output</div>
            <div className="whitespace-pre-line text-sm text-muted-foreground">{expectedOutput}</div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  // Metrics card that shows actual data
  const MetricsCard: React.FC = () => {
    const displayScore = metrics.score?.toFixed(1) ?? '0.0';
    const model = models[modelIdx] || { title: 'Unknown' };
    return (
      <Card
        className="eval-panel h-[450px] flex flex-col mx-auto relative overflow-hidden shadow-lg dark:bg-[#1A1A1A] dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)]"
        style={{ position: "sticky", top: 96, zIndex: 20 }}
      >
        {/* Remove or comment out the animated teal glow background */}
        {/* {showGlow && (
          <motion.div
            className="absolute inset-0 rounded-lg bg-primary/30 blur-2xl"
            initial={{ opacity: 0, scale: 0.2 }}
            animate={{
              opacity: 0.4 * (metrics.score / 5),
              scale: 0.5 + (metrics.score / 10),
            }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        )} */}
        
        <CardHeader className="bg-primary text-primary-foreground rounded-t-lg relative z-10 px-3 py-2">
          <div className="flex items-center justify-between w-full">
            <span className="text-2xl font-extrabold flex items-center gap-2 drop-shadow-lg">
              {displayScore}
              <Rating value={metrics.score} readOnly>
                {Array.from({ length: 5 }).map((_, i) => (
                  <RatingButton key={i} size={24} />
                ))}
              </Rating>
            </span>
            <span className="text-sm font-semibold text-primary-foreground/80 whitespace-nowrap">{model.title}</span>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 p-3 flex flex-col space-y-3 relative z-10">
          {/* Model and task name */}
          <div>
            <h3 className="text-base font-semibold mb-1">Constrained Response</h3>
            <div className="text-xs text-zinc-400 line-clamp-2">
              Provide a comprehensive analysis of [TOPIC] using exactly these headings in this order: 1. Background (2 sentences) 2. Key...
            </div>
          </div>
          
          {/* Model details */}
          <div className="flex justify-between items-center">
            <div className="text-base font-medium">GPT-3.5 Turbo</div>
            <div className="flex items-center">
              <Badge variant="outline" className="bg-emerald-900/20 text-emerald-400 border-emerald-800 text-xs py-0.5">
                Speed<span className="hidden sm:inline ml-1">: Fast</span>
              </Badge>
            </div>
          </div>
          
          <div className="space-y-1 text-xs text-zinc-400">
            <div>Cost: ${((metrics?.costUsd || 0) * 1000).toFixed(1)}/1M</div>
            <div className="line-clamp-2">
              This is a complex question requiring careful analysis. Looking at the available evidence, we...
            </div>
          </div>
          
          {/* Divider */}
          <div className="border-t border-border" />
          
          {/* Token Usage */}
          <div>
            <h3 className="flex items-center gap-1 text-xs font-medium mb-1">
              <FileText className="h-3 w-3 text-primary" />
              Token Usage
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-0.5">
                <div className="text-[10px] text-muted-foreground">Input</div>
                <div className="text-xs font-medium">
                  {formatNumber(metrics.tokensIn)} tokens
                </div>
                <div className="text-[10px] text-muted-foreground">
                  ${formatCurrency(metrics.costUsd / 3)}
                </div>
              </div>
              <div className="space-y-0.5">
                <div className="text-[10px] text-muted-foreground">Output</div>
                <div className="text-xs font-medium">
                  {formatNumber(metrics.tokensOut)} tokens
                </div>
                <div className="text-[10px] text-muted-foreground">
                  ${formatCurrency((metrics.costUsd / 3) * 2)}
                </div>
              </div>
            </div>
          </div>
          
          {/* Latency */}
          <div>
            <h3 className="flex items-center gap-1 text-xs font-medium mb-1">
              <Clock className="h-3 w-3 text-primary" />
              Latency
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-0.5">
                <div className="text-[10px] text-muted-foreground">First Token</div>
                <div className="text-xs font-medium">
                  {formatTime(metrics.latencyFirst)}
                </div>
              </div>
              <div className="space-y-0.5">
                <div className="text-[10px] text-muted-foreground">Total Time</div>
                <div className="text-xs font-medium">
                  {formatTime(metrics.latencyTotal)}
                </div>
              </div>
            </div>
          </div>
          
          {/* Total Cost */}
          <div>
            <h3 className="flex items-center gap-1 text-xs font-medium mb-1">
              <CreditCard className="h-3 w-3 text-primary" />
              Total Cost
            </h3>
            <div className="text-base font-bold text-center text-primary">
              ${formatCurrency(metrics.costUsd)}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className={`w-full ${className}`}>
      {output
        ? <OutputCard output={output} expectedOutput={expectedOutput} />
        : loading
          ? <SkeletonCard />
          : <MetricsCard />
      }
    </div>
  );
};
