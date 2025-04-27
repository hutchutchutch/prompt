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
    if (value === 0) return "text-gray-500";
    
    const isPositive = value > 0;
    const isGood = isHigherBetter ? isPositive : !isPositive;
    
    return isGood ? "text-green-600" : "text-red-600";
  };
  
  // Display elements for empty state
  if (isEmpty) {
    return (
      <Card className="shadow-sm mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-3">
              <p className="text-sm font-medium text-gray-600">Best Model</p>
              <p className="text-lg text-gray-400">—</p>
              <p className="text-xs text-gray-500">Run your first test for this task type</p>
            </div>
            <div className="p-3">
              <p className="text-sm font-medium text-gray-600">Quality</p>
              <p className="text-lg text-gray-400">—</p>
              <p className="text-xs text-gray-500">No data available</p>
            </div>
            <div className="p-3">
              <p className="text-sm font-medium text-gray-600">Cost</p>
              <p className="text-lg text-gray-400">—</p>
              <p className="text-xs text-gray-500">No data available</p>
            </div>
            <div className="p-3">
              <p className="text-sm font-medium text-gray-600">Speed</p>
              <p className="text-lg text-gray-400">—</p>
              <p className="text-xs text-gray-500">No data available</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="shadow-sm mb-6">
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Best Model Tile */}
          <div 
            className={`p-3 relative ${onModelClick ? "cursor-pointer hover:bg-gray-50 rounded-md transition-colors" : ""}`}
            onClick={() => onModelClick && onModelClick(bestModel.name)}
          >
            <p className="text-sm font-medium text-gray-600">Best Model</p>
            <div className="flex items-baseline">
              <p className="text-lg font-semibold text-gray-900">{bestModel.name}</p>
              
              {onModelClick && (
                <ExternalLink className="ml-1 h-3.5 w-3.5 text-gray-400" />
              )}
            </div>
            <p className="text-xs text-gray-600">{bestModel.quality}% quality</p>
            
            {/* High variance warning */}
            {highVariance && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="absolute top-2 right-2">
                      <BadgeHelp className="h-4 w-4 text-amber-500" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p className="text-xs max-w-xs">
                      High variability — try adding more examples to get more consistent results
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          
          {/* Quality Metric */}
          <div className="p-3">
            <p className="text-sm font-medium text-gray-600">Quality</p>
            <div className="flex items-baseline">
              <p className="text-lg font-semibold text-gray-900">{averageQuality.toFixed(0)}%</p>
              
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
                    <TooltipContent side="bottom">
                      <p className="text-xs">Compared with average across all task types</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <p className="text-xs text-gray-600">Avg quality</p>
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