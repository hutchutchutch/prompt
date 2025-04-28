import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, TrendingUp, TrendingDown, BadgeHelp } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface GlobalKPIProps {
  category: string;
  bestModel: {
    name: string;
    quality: number;
  };
  averageQuality: number;
  averageCost: number;
  averageSpeed: number;
  // Deltas compared to all-category baseline
  deltas?: {
    quality: number;
    cost: number;
    speed: number;
  };
  // Key metrics for this category
  metrics?: string[];
  // Optional callback when user clicks on best model
  onModelClick?: (modelName: string) => void;
  // Flag for high variance warning
  highVariance?: boolean;
  // Flag for no data
  isEmpty?: boolean;
}

export function GlobalKPIBar({
  category,
  bestModel,
  averageQuality,
  averageCost,
  averageSpeed,
  deltas = { quality: 0, cost: 0, speed: 0 },
  metrics = [],
  onModelClick,
  highVariance = false,
  isEmpty = false
}: GlobalKPIProps) {
  
  // Format deltas with + sign when positive
  const formatDelta = (value: number) => {
    const prefix = value > 0 ? "+" : "";
    return `${prefix}${value.toFixed(0)}%`;
  };
  
  // Classes for delta color
  const getDeltaClass = (value: number, isHigherBetter: boolean) => {
    if (value === 0) return "text-gray-500 dark:text-gray-400";
    
    const isPositive = value > 0;
    const isGood = isHigherBetter ? isPositive : !isPositive;
    
    return isGood ? "text-green-600 dark:text-[#4FF8E5]" : "text-red-600 dark:text-[#FF5C5C]";
  };
  
  // Display elements for empty state
  if (isEmpty) {
    return (
      <Card className="shadow-sm mb-6 dark:bg-[#181818] dark:border-[#2A2A2A] dark:shadow-[0_4px_12px_rgba(0,0,0,0.2)] dashboard-card">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-3">
              <p className="text-sm font-medium text-gray-600 dark:text-[#B0B0B0] dark:uppercase dark:tracking-wider dark:text-xs dark:font-medium metric-label">Best Model</p>
              <p className="text-lg text-gray-400 dark:text-[#2A2A2A]">—</p>
              <p className="text-xs text-gray-500 dark:text-[#505050]">Run your first test for this task type</p>
            </div>
            <div className="p-3">
              <p className="text-sm font-medium text-gray-600 dark:text-[#B0B0B0] dark:uppercase dark:tracking-wider dark:text-xs dark:font-medium metric-label">Quality</p>
              <p className="text-lg text-gray-400 dark:text-[#2A2A2A]">—</p>
              <p className="text-xs text-gray-500 dark:text-[#505050]">No data available</p>
            </div>
            <div className="p-3">
              <p className="text-sm font-medium text-gray-600 dark:text-[#B0B0B0] dark:uppercase dark:tracking-wider dark:text-xs dark:font-medium metric-label">Cost</p>
              <p className="text-lg text-gray-400 dark:text-[#2A2A2A]">—</p>
              <p className="text-xs text-gray-500 dark:text-[#505050]">No data available</p>
            </div>
            <div className="p-3">
              <p className="text-sm font-medium text-gray-600 dark:text-[#B0B0B0] dark:uppercase dark:tracking-wider dark:text-xs dark:font-medium metric-label">Speed</p>
              <p className="text-lg text-gray-400 dark:text-[#2A2A2A]">—</p>
              <p className="text-xs text-gray-500 dark:text-[#505050]">No data available</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="shadow-sm mb-6 dark:bg-[#181818] dark:border-[#2A2A2A] dark:shadow-[0_4px_12px_rgba(0,0,0,0.2)] dashboard-card">
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Best Model Tile */}
          <div 
            className={`p-3 relative ${onModelClick ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-[#232323] rounded-md transition-colors" : ""}`}
            onClick={() => onModelClick && onModelClick(bestModel.name)}
          >
            <p className="text-sm font-medium text-gray-600 dark:text-[#B0B0B0] dark:uppercase dark:tracking-wider dark:text-xs dark:font-medium metric-label">Best Model</p>
            <div className="flex items-baseline">
              <p className="text-lg font-semibold text-gray-900 dark:text-[#E0E0E0] dark:font-light metric-value">{bestModel.name}</p>
              
              {onModelClick && (
                <ExternalLink className="ml-1 h-3.5 w-3.5 text-gray-400 dark:text-[#00F0FF]/70" />
              )}
            </div>
            <p className="text-xs text-gray-600 dark:text-[#00F0FF]">{bestModel.quality}% quality</p>
            
            {/* High variance warning */}
            {highVariance && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="absolute top-2 right-2">
                      <BadgeHelp className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="dark:bg-[#181818] dark:border-[#2A2A2A] dark:shadow-[0_4px_12px_rgba(0,240,255,0.08)]">
                    <p className="text-xs max-w-xs dark:text-[#B0B0B0]">
                      High variability — try adding more examples to get more consistent results
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          
          {/* Quality Metric */}
          <div className="p-3">
            <p className="text-sm font-medium text-gray-600 dark:text-[#B0B0B0] dark:uppercase dark:tracking-wider dark:text-xs dark:font-medium metric-label">Quality</p>
            <div className="flex items-baseline">
              <p className="text-lg font-semibold text-gray-900 dark:text-[#E0E0E0] dark:font-light metric-value">{averageQuality.toFixed(0)}%</p>
              
              {deltas.quality !== 0 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className={`ml-2 flex items-center text-xs font-medium ${getDeltaClass(deltas.quality, true)}`}>
                        {deltas.quality > 0 ? (
                          <TrendingUp className="mr-0.5 h-3 w-3" />
                        ) : (
                          <TrendingDown className="mr-0.5 h-3 w-3" />
                        )}
                        {formatDelta(deltas.quality)}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="dark:bg-[#181818] dark:border-[#2A2A2A] dark:shadow-[0_4px_12px_rgba(0,240,255,0.08)]">
                      <p className="text-xs dark:text-[#B0B0B0]">Compared with average across all task types</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <p className="text-xs text-gray-600 dark:text-[#B0B0B0]">Avg quality</p>
            
            {/* Display key metrics if available */}
            {metrics && metrics.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1">
                {metrics.map((metric, i) => (
                  <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-[rgba(0,240,255,0.1)] dark:text-[#00F0FF] dark:border dark:border-[#00F0FF]/20">
                    {metric}
                  </span>
                ))}
              </div>
            )}
          </div>
          
          {/* Cost Metric */}
          <div className="p-3">
            <p className="text-sm font-medium text-gray-600">Cost</p>
            <div className="flex items-baseline">
              <p className="text-lg font-semibold text-gray-900">${averageCost.toFixed(5)}</p>
              
              {deltas.cost !== 0 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className={`ml-2 flex items-center text-xs font-medium ${getDeltaClass(deltas.cost, false)}`}>
                        {deltas.cost > 0 ? (
                          <TrendingUp className="mr-0.5 h-3 w-3" />
                        ) : (
                          <TrendingDown className="mr-0.5 h-3 w-3" />
                        )}
                        {formatDelta(deltas.cost)}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p className="text-xs">Compared with average across all task types</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <p className="text-xs text-gray-600">Avg cost per run</p>
          </div>
          
          {/* Speed Metric */}
          <div className="p-3">
            <p className="text-sm font-medium text-gray-600">Speed</p>
            <div className="flex items-baseline">
              <p className="text-lg font-semibold text-gray-900">{averageSpeed.toFixed(1)} s</p>
              
              {deltas.speed !== 0 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className={`ml-2 flex items-center text-xs font-medium ${getDeltaClass(deltas.speed, false)}`}>
                        {deltas.speed > 0 ? (
                          <TrendingUp className="mr-0.5 h-3 w-3" />
                        ) : (
                          <TrendingDown className="mr-0.5 h-3 w-3" />
                        )}
                        {formatDelta(deltas.speed)}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p className="text-xs">Compared with average across all task types</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <p className="text-xs text-gray-600">Avg total latency</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}