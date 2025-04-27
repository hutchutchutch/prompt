import { useState } from "react";
import { PromptResult } from "@/types";

interface HeatmapTableProps {
  results: PromptResult[];
  onResultSelect: (result: PromptResult) => void;
}

export function HeatmapTable({ results, onResultSelect }: HeatmapTableProps) {
  // Extract unique models and variants
  const models = [...new Set(results.map(r => r.modelId))];
  const variants = [...new Set(results.map(r => r.variantId))];
  
  // Helper to find a result for a specific model and variant
  const getResult = (modelId: string, variantId: string) => {
    return results.find(r => r.modelId === modelId && r.variantId === variantId) || null;
  };
  
  // Helper to create a color based on score value (0-10)
  const getHeatColor = (score: number) => {
    if (score >= 9) return "bg-green-100 text-green-800";
    if (score >= 8) return "bg-green-50 text-green-700";
    if (score >= 7) return "bg-yellow-50 text-yellow-700";
    if (score >= 6) return "bg-orange-50 text-orange-700";
    return "bg-red-50 text-red-700";
  };

  // Helper to find the best score to highlight it
  const getBestScoreClass = (score: number) => {
    const bestScore = Math.max(...results.map(r => r.qualityScore));
    return score === bestScore ? "border-2 border-green-500" : "";
  };
  
  return (
    <div className="overflow-x-auto shadow rounded-lg mb-8">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th 
              scope="col" 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Model / Variant
            </th>
            {variants.map((variant) => (
              <th 
                key={variant} 
                scope="col" 
                className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {variant}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {models.map((model) => (
            <tr key={model}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {model}
              </td>
              {variants.map((variant) => {
                const result = getResult(model, variant);
                if (!result) {
                  return (
                    <td key={variant} className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                      —
                    </td>
                  );
                }
                
                const heatColor = getHeatColor(result.qualityScore);
                const bestScoreClass = getBestScoreClass(result.qualityScore);
                
                return (
                  <td 
                    key={variant} 
                    className="py-4 whitespace-nowrap text-center cursor-pointer"
                    onClick={() => onResultSelect(result)}
                  >
                    <div 
                      className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium ${heatColor} ${bestScoreClass}`}
                    >
                      {result.qualityScore.toFixed(1)}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}