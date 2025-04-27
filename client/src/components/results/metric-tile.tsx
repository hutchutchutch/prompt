import { TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface MetricTileProps {
  label: string;
  value: string;
  unit?: string;
  delta?: number;
  description?: string;
  isHigherBetter?: boolean;
}

export function MetricTile({
  label,
  value,
  unit = "",
  delta = 0,
  description,
  isHigherBetter = true
}: MetricTileProps) {
  
  const showDelta = delta !== 0;
  const isPositiveDelta = delta > 0;
  const isGoodDelta = isHigherBetter ? isPositiveDelta : !isPositiveDelta;
  
  const getDeltaClass = () => {
    if (isGoodDelta) {
      return "text-green-700 bg-green-50";
    } else {
      return "text-red-700 bg-red-50";
    }
  };
  
  return (
    <Card className="overflow-hidden shadow-sm">
      <CardContent className="p-5">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-sm font-medium text-gray-500">{label}</h3>
            <div className="mt-1 flex items-baseline">
              <p className="text-2xl font-semibold text-gray-900">{value}</p>
              {unit && <span className="text-sm text-gray-500 ml-1">{unit}</span>}
            </div>
          </div>
          
          {showDelta && (
            <div className={`flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${getDeltaClass()}`}>
              {isPositiveDelta ? (
                <TrendingUp className="w-3 h-3 mr-1" />
              ) : (
                <TrendingDown className="w-3 h-3 mr-1" />
              )}
              {Math.abs(delta)}%
            </div>
          )}
        </div>
        
        {description && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <p className="mt-4 text-xs text-gray-500 truncate cursor-help border-t border-gray-100 pt-4">
                  {description}
                </p>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="max-w-xs text-xs">{description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </CardContent>
    </Card>
  );
}