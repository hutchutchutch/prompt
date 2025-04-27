import { PromptResult } from "@/types";

interface ScatterPlotProps {
  results: PromptResult[];
  xKey: keyof PromptResult;
  yKey: keyof PromptResult;
  xLabel: string;
  yLabel: string;
}

export function ScatterPlot({
  results,
  xKey,
  yKey,
  xLabel,
  yLabel
}: ScatterPlotProps) {
  if (!results || results.length === 0) {
    return (
      <div className="w-full h-48 flex items-center justify-center border border-gray-200 rounded-md">
        <p className="text-gray-400">No data available</p>
      </div>
    );
  }
  
  // Find min/max for both axes to set up the scale
  const xValues = results.map(r => Number(r[xKey]) || 0);
  const yValues = results.map(r => Number(r[yKey]) || 0);
  
  const minX = Math.min(...xValues);
  const maxX = Math.max(...xValues);
  const xRange = maxX - minX;
  
  const minY = Math.min(...yValues);
  const maxY = Math.max(...yValues);
  const yRange = maxY - minY;
  
  // Add padding to the ranges
  const paddedMinX = minX - (xRange * 0.1);
  const paddedMaxX = maxX + (xRange * 0.1);
  const xScaleFactor = paddedMaxX - paddedMinX;
  
  const paddedMinY = minY - (yRange * 0.1);
  const paddedMaxY = maxY + (yRange * 0.1);
  const yScaleFactor = paddedMaxY - paddedMinY;
  
  // Plot height and width
  const plotHeight = 300;
  const plotWidth = 800; // This will be max-width in CSS, will scale down
  
  // Helper to convert data value to position
  const getXPos = (val: number) => (
    ((val - paddedMinX) / xScaleFactor) * plotWidth
  );
  
  const getYPos = (val: number) => (
    plotHeight - ((val - paddedMinY) / yScaleFactor) * plotHeight
  );
  
  // Generate markers for a simple y-axis
  const yAxisMarkers = Array.from({ length: 5 }, (_, i) => {
    const value = paddedMinY + (i * (yScaleFactor / 4));
    return {
      value: Math.round(value * 100) / 100, // Round to 2 decimal places
      position: getYPos(value)
    };
  });
  
  // Generate markers for a simple x-axis
  const xAxisMarkers = Array.from({ length: 5 }, (_, i) => {
    const value = paddedMinX + (i * (xScaleFactor / 4));
    return {
      value: Math.round(value * 100000) / 100000, // Format depends on the data type
      position: getXPos(value)
    };
  });
  
  // Helper to get color based on model
  const getColorForModel = (modelId: string) => {
    const colors = [
      "text-blue-500 fill-blue-500", 
      "text-purple-500 fill-purple-500",
      "text-pink-500 fill-pink-500", 
      "text-orange-500 fill-orange-500",
      "text-teal-500 fill-teal-500", 
      "text-green-500 fill-green-500"
    ];
    
    const modelIndex = [...new Set(results.map(r => r.modelId))].indexOf(modelId);
    return colors[modelIndex % colors.length];
  };
  
  // Generate tooltip text for each point
  const getTooltipText = (result: PromptResult) => {
    return `Model: ${result.modelId}
Variant: ${result.variantId}
${yLabel}: ${result[yKey]}
${xLabel}: ${result[xKey]}
Speed: ${result.latencyMs || 0}ms`;
  };
  
  return (
    <div className="relative w-full max-w-full overflow-hidden">
      {/* Y axis */}
      <div className="absolute top-0 bottom-0 left-0 w-12 border-r border-gray-200">
        {yAxisMarkers.map((marker, i) => (
          <div 
            key={`y-${i}`} 
            className="absolute left-0 w-12 text-xs text-gray-500 flex items-center justify-end pr-2"
            style={{ top: marker.position - 10 }}
          >
            {marker.value}
          </div>
        ))}
        <div className="absolute left-0 top-1/2 -rotate-90 origin-left text-xs text-gray-500 ml-2">
          {yLabel}
        </div>
      </div>
      
      {/* Chart container */}
      <div className="relative ml-12 h-[300px] pl-0 pr-4">
        {/* X axis */}
        <div className="absolute left-0 right-0 bottom-0 h-8 border-t border-gray-200">
          {xAxisMarkers.map((marker, i) => (
            <div 
              key={`x-${i}`} 
              className="absolute bottom-0 text-xs text-gray-500 text-center -translate-x-1/2"
              style={{ left: marker.position }}
            >
              {xKey === 'costUsd' ? `$${marker.value}` : marker.value}
            </div>
          ))}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 mb-[-24px]">
            {xLabel}
          </div>
        </div>
        
        {/* Data points */}
        <svg 
          className="absolute top-0 left-0 w-full h-[300px]" 
          viewBox={`0 0 ${plotWidth} ${plotHeight}`}
          preserveAspectRatio="none"
        >
          {/* Grid lines - horizontal */}
          {yAxisMarkers.map((marker, i) => (
            <line 
              key={`grid-y-${i}`}
              x1="0" 
              y1={marker.position} 
              x2={plotWidth} 
              y2={marker.position}
              stroke="#f1f1f1" 
              strokeWidth="1"
            />
          ))}
          
          {/* Grid lines - vertical */}
          {xAxisMarkers.map((marker, i) => (
            <line 
              key={`grid-x-${i}`}
              x1={marker.position} 
              y1="0" 
              x2={marker.position} 
              y2={plotHeight}
              stroke="#f1f1f1" 
              strokeWidth="1"
            />
          ))}
          
          {/* Plot data points */}
          {results.map((result, i) => {
            const x = getXPos(Number(result[xKey]) || 0);
            const y = getYPos(Number(result[yKey]) || 0);
            const color = getColorForModel(result.modelId);
            const size = 6 + ((result.latencyMs || 1) / 200); // Size based on latency
            
            return (
              <g key={`point-${i}`}>
                <title>{getTooltipText(result)}</title>
                <circle 
                  cx={x} 
                  cy={y} 
                  r={Math.max(5, Math.min(12, size))} 
                  className={`${color} opacity-70 stroke-white`}
                  strokeWidth="1"
                />
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}