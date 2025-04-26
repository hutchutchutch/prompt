import { useState } from "react";
import { HeatCell } from "./heat-cell";
import { PromptResult, VulnerabilityStatus } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { VulnBadge } from "./vuln-badge";

interface ResultsMatrixProps {
  results: PromptResult[];
  isLoading?: boolean;
}

export function ResultsMatrix({ results, isLoading = false }: ResultsMatrixProps) {
  const [selectedResult, setSelectedResult] = useState<PromptResult | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  
  // Extract unique models and variants
  const models = [...new Set(results.map(r => r.modelId))];
  const variants = [...new Set(results.map(r => r.variantId))];
  
  // Find a result for a specific model and variant
  const getResult = (modelId: string, variantId: string) => {
    return results.find(r => r.modelId === modelId && r.variantId === variantId) || null;
  };

  // Format micro-dollars to dollars
  const formatCost = (microDollars: number | null) => {
    if (microDollars === null) return "N/A";
    return `$${(microDollars / 1000000).toFixed(5)}`;
  };

  // Handle cell click to open detail drawer
  const handleCellClick = (result: PromptResult) => {
    setSelectedResult(result);
    setSheetOpen(true);
  };

  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg p-6 mb-8 overflow-auto">
        <div className="min-w-max">
          <Skeleton className="h-10 w-full mb-4" />
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white shadow rounded-lg p-6 mb-8 overflow-auto">
        <div className="min-w-max">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                    if (!result || !result.qualityScore) {
                      return (
                        <td key={variant} className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                          No data
                        </td>
                      );
                    }
                    
                    return (
                      <td key={variant} className="px-6 py-4 whitespace-nowrap">
                        <HeatCell 
                          score={result.qualityScore}
                          costUsd={result.costUsd ? result.costUsd / 1000000 : 0}
                          latencyMs={result.latencyMs || 0}
                          vulnStatus={result.vulnerabilityStatus as VulnerabilityStatus}
                          onClick={() => handleCellClick(result)}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Result Detail Drawer */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
          {selectedResult && (
            <>
              <SheetHeader className="py-6 px-4 bg-primary text-white sm:px-6 mb-6 -mt-6 -mx-6">
                <SheetTitle className="text-white">{selectedResult.modelId} - {selectedResult.variantId}</SheetTitle>
                <SheetDescription className="text-primary-foreground">
                  Test result details
                </SheetDescription>
              </SheetHeader>
              
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900">Quality Score</h3>
                <div className="mt-2 flex items-center">
                  <div className="text-3xl font-bold text-primary">
                    {selectedResult.qualityScore?.toFixed(1) || "N/A"}
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Performance Metrics</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-medium text-gray-500">Cost</div>
                      <div className="mt-1 text-lg font-semibold">
                        {formatCost(selectedResult.costUsd)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500">First Token</div>
                      <div className="mt-1 text-lg font-semibold">
                        {selectedResult.metadata?.firstTokenLatency || "N/A"}ms
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500">Total Time</div>
                      <div className="mt-1 text-lg font-semibold">
                        {selectedResult.latencyMs 
                          ? selectedResult.latencyMs >= 1000 
                            ? `${(selectedResult.latencyMs / 1000).toFixed(1)}s` 
                            : `${selectedResult.latencyMs}ms`
                          : "N/A"
                        }
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500">Tokens</div>
                      <div className="mt-1 text-lg font-semibold">
                        {selectedResult.metadata?.tokenCount || "~400"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Security Assessment</h3>
                <div className={`
                  rounded-lg p-4 border
                  ${selectedResult.vulnerabilityStatus === 'safe' ? 'bg-green-50 border-green-200' : 
                    selectedResult.vulnerabilityStatus === 'partial' ? 'bg-amber-50 border-amber-200' : 
                    selectedResult.vulnerabilityStatus === 'failed' ? 'bg-red-50 border-red-200' : 
                    'bg-gray-50 border-gray-200'}
                `}>
                  <div className="flex">
                    {selectedResult.vulnerabilityStatus === 'safe' ? (
                      <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    ) : selectedResult.vulnerabilityStatus === 'partial' ? (
                      <svg className="h-6 w-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    ) : (
                      <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                    <div className="ml-3">
                      <h4 className={`text-sm font-medium 
                        ${selectedResult.vulnerabilityStatus === 'safe' ? 'text-green-800' : 
                          selectedResult.vulnerabilityStatus === 'partial' ? 'text-amber-800' : 
                          selectedResult.vulnerabilityStatus === 'failed' ? 'text-red-800' : 
                          'text-gray-800'}
                      `}>
                        {selectedResult.vulnerabilityStatus === 'safe' ? 'All Security Tests Passed' : 
                          selectedResult.vulnerabilityStatus === 'partial' ? 'Some Vulnerabilities Detected' : 
                          selectedResult.vulnerabilityStatus === 'failed' ? 'Security Tests Failed' : 
                          'Security Status Unknown'}
                      </h4>
                      <div className={`mt-2 text-sm 
                        ${selectedResult.vulnerabilityStatus === 'safe' ? 'text-green-700' : 
                          selectedResult.vulnerabilityStatus === 'partial' ? 'text-amber-700' : 
                          selectedResult.vulnerabilityStatus === 'failed' ? 'text-red-700' : 
                          'text-gray-700'}
                      `}>
                        {selectedResult.vulnerabilityStatus === 'safe' ? (
                          <p>This prompt is resistant to jailbreaking, prompt injection, and other security vulnerabilities.</p>
                        ) : selectedResult.vulnerabilityStatus === 'partial' ? (
                          <p>Some security issues were detected. The prompt may be vulnerable to certain attacks.</p>
                        ) : selectedResult.vulnerabilityStatus === 'failed' ? (
                          <p>Major security issues detected. This prompt is vulnerable to attacks and should be revised.</p>
                        ) : (
                          <p>Security testing was not performed on this prompt.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Model Output</h3>
                <div className="bg-gray-50 rounded-lg p-4 prompt-font text-sm whitespace-pre-wrap overflow-auto max-h-64">
                  {selectedResult.output || "No output available"}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
