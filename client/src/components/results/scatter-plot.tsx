import { useState, useEffect } from "react";
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from "recharts";
import { PromptResult } from "@/types";
import { Card, CardContent } from "@/components/ui/card";

interface ScatterPlotProps {
  results: PromptResult[];
  xKey: "costUsd" | "latencyMs";
  yKey: "qualityScore" | "costUsd" | "latencyMs";
  xLabel?: string;
  yLabel?: string;
}

interface FormattedDataPoint {
  x: number;
  y: number;
  modelId: string;
  variantId: string;
  tooltip: string;
}

export function ScatterPlot({ results, xKey, yKey, xLabel, yLabel }: ScatterPlotProps) {
  const [formattedData, setFormattedData] = useState<Record<string, FormattedDataPoint[]>>({});
  const [models, setModels] = useState<string[]>([]);
  
  // Default labels based on keys
  const defaultXLabel = xKey === "costUsd" ? "Cost (USD)" : "Latency (ms)";
  const defaultYLabel = yKey === "qualityScore" ? "Quality Score" : 
                       yKey === "costUsd" ? "Cost (USD)" : "Latency (ms)";
  
  // Colors for different models
  const modelColors = [
    "#3B82F6", // Blue
    "#8B5CF6", // Purple
    "#EC4899", // Pink
    "#F97316", // Orange
    "#14B8A6", // Teal
    "#10B981", // Green
  ];
  
  // Format data for scatter plot
  useEffect(() => {
    if (!results.length) return;
    
    // Get unique models
    const uniqueModels = [...new Set(results.map(r => r.modelId))];
    setModels(uniqueModels);
    
    // Group by model and format data
    const groupedData: Record<string, FormattedDataPoint[]> = {};
    
    uniqueModels.forEach(modelId => {
      // Filter results for this model
      const modelResults = results.filter(r => r.modelId === modelId);
      
      // Format data points
      const dataPoints = modelResults.map(result => {
        // Get x value (convert micro-dollars to dollars if needed)
        const xValue = xKey === "costUsd" && result[xKey] 
          ? result[xKey] / 1000000 
          : result[xKey] || 0;
        
        // Get y value (convert micro-dollars to dollars if needed)
        const yValue = yKey === "costUsd" && result[yKey] 
          ? result[yKey] / 1000000 
          : result[yKey] || 0;
        
        // Create tooltip text
        const tooltipText = `
          ${result.modelId}, ${result.variantId}
          ${xLabel || defaultXLabel}: ${xKey === "costUsd" ? '$' + xValue.toFixed(5) : xValue}
          ${yLabel || defaultYLabel}: ${yKey === "costUsd" ? '$' + yValue.toFixed(5) : yValue}
          Vulnerability: ${result.vulnerabilityStatus}
        `;
        
        return {
          x: xValue,
          y: yValue,
          modelId: result.modelId,
          variantId: result.variantId,
          tooltip: tooltipText.trim()
        };
      });
      
      groupedData[modelId] = dataPoints;
    });
    
    setFormattedData(groupedData);
  }, [results, xKey, yKey]);
  
  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Card className="bg-white shadow p-2 border border-gray-200">
          <CardContent className="p-2 text-xs">
            <p className="font-bold">{data.modelId}, {data.variantId}</p>
            <p>{xLabel || defaultXLabel}: {xKey === "costUsd" ? '$' + data.x.toFixed(5) : data.x}</p>
            <p>{yLabel || defaultYLabel}: {yKey === "costUsd" ? '$' + data.y.toFixed(5) : data.y}</p>
          </CardContent>
        </Card>
      );
    }
    return null;
  };
  
  if (!results.length) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500">
        No data available for the scatter plot
      </div>
    );
  }
  
  return (
    <div className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart
          margin={{ top: 20, right: 30, bottom: 20, left: 35 }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis 
            type="number" 
            dataKey="x" 
            name={xLabel || defaultXLabel} 
            label={{ 
              value: xLabel || defaultXLabel, 
              position: 'bottom',
              style: { textAnchor: 'middle', fill: '#666' }
            }}
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            type="number" 
            dataKey="y" 
            name={yLabel || defaultYLabel} 
            label={{ 
              value: yLabel || defaultYLabel, 
              angle: -90, 
              position: 'left',
              style: { textAnchor: 'middle', fill: '#666' }
            }}
            tick={{ fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          
          {/* Render a Scatter for each model */}
          {models.map((model, index) => (
            <Scatter 
              key={model} 
              name={model} 
              data={formattedData[model] || []} 
              fill={modelColors[index % modelColors.length]}
            />
          ))}
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
