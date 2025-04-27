import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { PromptResult } from "@/types";

interface ComparisonPanelProps {
  leftResult: PromptResult;
  rightResult: PromptResult;
}

interface MetricBarProps {
  label: string;
  leftValue: number;
  rightValue: number;
  isHigherBetter?: boolean;
  formatter?: (value: number) => string;
  unit?: string;
}

function MetricBar({ 
  label, 
  leftValue, 
  rightValue, 
  isHigherBetter = true, 
  formatter, 
  unit = "" 
}: MetricBarProps) {
  // Format values if needed
  const formattedLeftValue = formatter ? formatter(leftValue) : leftValue;
  const formattedRightValue = formatter ? formatter(rightValue) : rightValue;
  
  // Calculate percentages for bar widths (max 85% to leave room for labels)
  const total = leftValue + rightValue;
  const leftPercent = total > 0 ? (leftValue / total) * 85 : 42.5;
  const rightPercent = total > 0 ? (rightValue / total) * 85 : 42.5;
  
  // Determine which value is better
  const leftIsBetter = isHigherBetter ? leftValue > rightValue : leftValue < rightValue;
  const rightIsBetter = isHigherBetter ? rightValue > leftValue : rightValue < leftValue;
  const equal = leftValue === rightValue;
  
  return (
    <div className="mb-5">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">{label}</span>
      </div>
      
      <div className="flex items-center w-full">
        {/* Left bar */}
        <div className="flex justify-end items-center w-[42.5%]">
          <span className={`text-sm font-medium ${leftIsBetter ? 'text-green-600' : 'text-gray-600'}`}>
            {formattedLeftValue}{unit}
          </span>
          <div className={`h-4 rounded-l-full ml-2 ${
            leftIsBetter ? 'bg-green-500' : equal ? 'bg-blue-400' : 'bg-gray-400'
          }`} style={{width: `${leftPercent}%`}}></div>
        </div>
        
        {/* Divider */}
        <div className="h-8 border-r border-gray-300 mx-1"></div>
        
        {/* Right bar */}
        <div className="flex items-center w-[42.5%]">
          <div className={`h-4 rounded-r-full mr-2 ${
            rightIsBetter ? 'bg-green-500' : equal ? 'bg-blue-400' : 'bg-gray-400'
          }`} style={{width: `${rightPercent}%`}}></div>
          <span className={`text-sm font-medium ${rightIsBetter ? 'text-green-600' : 'text-gray-600'}`}>
            {formattedRightValue}{unit}
          </span>
        </div>
      </div>
    </div>
  );
}

export function ComparisonPanel({ leftResult, rightResult }: ComparisonPanelProps) {
  const [showFullOutput, setShowFullOutput] = useState(false);
  
  // Format cost from microUSD to USD
  const formatCost = (value: number) => (value / 1000000).toFixed(5);
  
  // Format latency from ms to seconds with 1 decimal place if >= 1000ms
  const formatLatency = (value: number) => {
    if (value >= 1000) {
      return (value / 1000).toFixed(1);
    }
    return value.toString();
  };
  
  // Get unit for latency based on value
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
            leftValue={leftResult.qualityScore}
            rightValue={rightResult.qualityScore}
            isHigherBetter={true}
          />
          
          <MetricBar 
            label="Cost"
            leftValue={leftResult.costUsd}
            rightValue={rightResult.costUsd}
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