import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface MetricTileProps {
  label: string; 
  value: number | string;
  unit?: string;
  delta?: number; // Percentage change relative to average
  description?: string;
  formatter?: (value: number) => string;
  isHigherBetter?: boolean;
}

export function MetricTile({ 
  label, 
  value, 
  unit, 
  delta, 
  description,
  formatter,
  isHigherBetter = true,
}: MetricTileProps) {
  // Format the value if needed
  const formattedValue = typeof value === 'number' && formatter 
    ? formatter(value) 
    : value;

  // Determine if the delta is positive based on whether higher is better
  const isPositiveDelta = delta !== undefined && (
    (isHigherBetter && delta > 0) || (!isHigherBetter && delta < 0)
  );
  
  // Get absolute value of delta for display
  const absDelta = delta !== undefined ? Math.abs(delta) : undefined;
  
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex flex-col">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">{label}</h3>
            {delta !== undefined && (
              <div className={`flex items-center ${isPositiveDelta ? 'text-green-600' : 'text-red-600'}`}>
                {isPositiveDelta 
                  ? <ArrowUpRight className="h-4 w-4 mr-1" /> 
                  : <ArrowDownRight className="h-4 w-4 mr-1" />
                }
                <span className="text-xs font-medium">{absDelta}%</span>
              </div>
            )}
          </div>
          
          <div className="mt-2 flex items-baseline">
            <span className="text-3xl font-bold text-gray-900">
              {formattedValue}
            </span>
            {unit && <span className="ml-1 text-sm text-gray-500">{unit}</span>}
          </div>
          
          {description && (
            <p className="mt-2 text-xs text-gray-500" aria-hidden="true">
              {description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}