import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { PromptResult } from "@/types";

interface ComparisonPanelProps {
  leftResult: PromptResult;
  rightResult: PromptResult;
}

// Helper component for visualizing metric differences
interface MetricBarProps {
  label: string;
  leftValue: number;
  rightValue: number;
  isHigherBetter: boolean;
  formatter?: (value: number) => string;
  unit?: string;
}

function MetricBar({ 
  label, 
  leftValue, 
  rightValue, 
  isHigherBetter,
  formatter = (value: number) => value.toFixed(1),
  unit = ""
}: MetricBarProps) {
  const difference = rightValue - leftValue;
  const percentDiff = leftValue !== 0 
    ? Math.round((difference / leftValue) * 100) 
    : 0;
  
  const isRightBetter = isHigherBetter 
    ? rightValue > leftValue
    : rightValue < leftValue;
  
  const max = Math.max(leftValue, rightValue);
  const min = Math.min(leftValue, rightValue);
  
  const leftPercent = (leftValue / max) * 100;
  const rightPercent = (rightValue / max) * 100;
  
  const getStatusColor = () => {
    if (percentDiff === 0) return "text-gray-500";
    return isRightBetter ? "text-green-600" : "text-red-600";
  };
  
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <div className="text-sm font-medium text-gray-700">{label}</div>
        <div className={`text-sm font-medium ${getStatusColor()}`}>
          {percentDiff === 0 ? "No difference" : (
            <>
              {isRightBetter ? "+" : ""}{percentDiff}%
              {isRightBetter ? " better" : " worse"}
            </>
          )}
        </div>
      </div>
      
      <div className="flex justify-between items-center mb-1 text-xs text-gray-500">
        <div>{formatter(leftValue)}{unit}</div>
        <div>{formatter(rightValue)}{unit}</div>
      </div>
      
      <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
        <div 
          className="absolute left-0 top-0 h-full bg-blue-100 rounded-l-full"
          style={{ width: `${leftPercent}%` }}
        ></div>
        <div 
          className="absolute right-0 top-0 h-full bg-purple-100 rounded-r-full"
          style={{ width: `${rightPercent}%` }}
        ></div>
      </div>
    </div>
  );
}

export function ComparisonPanel({ leftResult, rightResult }: ComparisonPanelProps) {
  const [showFullOutput, setShowFullOutput] = useState(false);
  
  // Helper formatters
  const formatCost = (value: number) => (value / 1000000).toFixed(5);
  const formatLatency = (value: number) => {
    return value >= 1000 
      ? (value / 1000).toFixed(1)
      : Math.round(value).toString();
  };
  const getLatencyUnit = (value: number) => value >= 1000 ? "s" : "ms";
  
  // Truncate output text if not showing full output
  const maxPreviewChars = 200;
  const leftPreviewText = !showFullOutput && leftResult.output && leftResult.output.length > maxPreviewChars
    ? leftResult.output.substring(0, maxPreviewChars) + "..."
    : leftResult.output || "";
    
  const rightPreviewText = !showFullOutput && rightResult.output && rightResult.output.length > maxPreviewChars
    ? rightResult.output.substring(0, maxPreviewChars) + "..."
    : rightResult.output || "";
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 mb-8">
      {/* Left Result Card */}
      <Card className="overflow-hidden">
        <CardContent className="p-5">
          <div className="mb-4 space-y-2">
            <h3 className="font-medium text-gray-900">{leftResult.modelId}</h3>
            <p className="text-xs text-gray-500">Variant: {leftResult.variantId}</p>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-md mb-4">
            <h4 className="text-xs uppercase text-gray-500 mb-2">Output</h4>
            <p className="text-sm text-gray-800 whitespace-pre-wrap overflow-auto" style={{maxHeight: "150px"}}>
              {leftPreviewText}
            </p>
          </div>
        </CardContent>
      </Card>
      
      {/* Right Result Card */}
      <Card className="overflow-hidden">
        <CardContent className="p-5">
          <div className="mb-4 space-y-2">
            <h3 className="font-medium text-gray-900">{rightResult.modelId}</h3>
            <p className="text-xs text-gray-500">Variant: {rightResult.variantId}</p>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-md mb-4">
            <h4 className="text-xs uppercase text-gray-500 mb-2">Output</h4>
            <p className="text-sm text-gray-800 whitespace-pre-wrap overflow-auto" style={{maxHeight: "150px"}}>
              {rightPreviewText}
            </p>
          </div>
        </CardContent>
      </Card>
      
      {/* Metrics Comparison */}
      <Card className="overflow-hidden md:col-span-2">
        <CardContent className="p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium text-gray-900">Performance Comparison</h3>
            <div className="flex items-center space-x-2">
              <Switch
                id="show-full"
                checked={showFullOutput}
                onCheckedChange={setShowFullOutput}
              />
              <Label htmlFor="show-full" className="text-sm">Show full output</Label>
            </div>
          </div>
          
          <MetricBar 
            label="Quality"
            leftValue={leftResult.qualityScore || 0}
            rightValue={rightResult.qualityScore || 0}
            isHigherBetter={true}
          />
          
          <MetricBar 
            label="Cost"
            leftValue={leftResult.costUsd || 0}
            rightValue={rightResult.costUsd || 0}
            isHigherBetter={false}
            formatter={formatCost}
            unit="$"
          />
          
          <MetricBar 
            label="Speed"
            leftValue={leftResult.latencyMs || leftResult.totalTime || 0}
            rightValue={rightResult.latencyMs || rightResult.totalTime || 0}
            isHigherBetter={false}
            formatter={formatLatency}
            unit={getLatencyUnit(Math.max(
              leftResult.latencyMs || leftResult.totalTime || 0,
              rightResult.latencyMs || rightResult.totalTime || 0
            ))}
          />
        </CardContent>
      </Card>
    </div>
  );
}