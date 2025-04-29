import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, Clock, CreditCard, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface EvaluationCardProps {
  overallScore: number; // 0 to 5
  inputTokens: number;
  inputCost: number;
  outputTokens: number;
  outputCost: number;
  totalCost: number;
  firstTokenLatency: number; // in ms
  totalTime: number; // in ms
}

export function EvaluationCard({
  overallScore,
  inputTokens,
  inputCost,
  outputTokens,
  outputCost,
  totalCost,
  firstTokenLatency,
  totalTime,
}: EvaluationCardProps) {
  // Round to single decimal place for display
  const displayScore = Math.round(overallScore * 10) / 10;
  
  // Generate stars based on score
  const stars = Array(5).fill(0).map((_, i) => {
    // Determine if star should be filled, half-filled, or empty
    let fill = "none";
    if (i < Math.floor(overallScore)) {
      fill = "full";
    } else if (i < Math.ceil(overallScore) && Math.ceil(overallScore) !== Math.floor(overallScore)) {
      fill = "half";
    }
    return { fill };
  });
  
  // Format milliseconds to friendly string
  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="bg-primary text-primary-foreground rounded-t-lg">
        <CardTitle className="text-xl font-semibold">Performance Evaluation</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-6 flex flex-col space-y-6">
        {/* Overall Score with Stars */}
        <div className="text-center">
          <div className="text-4xl font-bold mb-2">{displayScore}/5</div>
          <div className="flex justify-center space-x-1">
            {stars.map((star, i) => (
              <Star
                key={i}
                className={cn(
                  "h-6 w-6",
                  star.fill === "full" && "fill-primary text-primary",
                  star.fill === "half" && "fill-primary text-primary opacity-50",
                  star.fill === "none" && "text-muted-foreground"
                )}
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
              <div className="font-medium">{inputTokens.toLocaleString()} tokens</div>
              <div className="text-xs text-muted-foreground">${inputCost.toFixed(4)}</div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Output</div>
              <div className="font-medium">{outputTokens.toLocaleString()} tokens</div>
              <div className="text-xs text-muted-foreground">${outputCost.toFixed(4)}</div>
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
              <div className="font-medium">{formatTime(firstTokenLatency)}</div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Total Time</div>
              <div className="font-medium">{formatTime(totalTime)}</div>
            </div>
          </div>
        </div>
        
        {/* Total Cost */}
        <div>
          <h3 className="flex items-center gap-2 text-sm font-medium mb-3">
            <CreditCard className="h-4 w-4 text-primary" />
            Total Cost
          </h3>
          <div className="text-xl font-bold text-center">${totalCost.toFixed(4)}</div>
        </div>
      </CardContent>
    </Card>
  );
}