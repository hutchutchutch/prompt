import { cn } from "@/lib/utils";
import { VulnBadge } from "./vuln-badge";
import { VulnerabilityStatus } from "@/types";

interface HeatCellProps {
  score: number;
  costUsd: number;
  latencyMs: number;
  vulnStatus?: VulnerabilityStatus;
  onClick?: () => void;
  className?: string;
}

export function HeatCell({
  score,
  costUsd,
  latencyMs,
  vulnStatus = "unknown",
  onClick,
  className
}: HeatCellProps) {
  // Determine styling based on score
  const getScoreClass = () => {
    if (score >= 9.0) return "heat-cell-excellent";
    if (score >= 8.0) return "heat-cell-good";
    if (score >= 7.0) return "heat-cell-average";
    return "heat-cell-poor";
  };

  // Format latency as seconds if greater than 1000ms
  const formattedLatency = latencyMs >= 1000 
    ? `${(latencyMs / 1000).toFixed(1)}s` 
    : `${latencyMs}ms`;

  // Format cost to 2 decimal places if less than 1 cent, otherwise to cents
  const formattedCost = costUsd < 0.01
    ? `$${(costUsd).toFixed(4)}`
    : `$${(costUsd).toFixed(2)}`;

  return (
    <div 
      className={cn("heat-cell", getScoreClass(), className)}
      onClick={onClick}
    >
      <div className="text-xl font-semibold">{score.toFixed(1)}</div>
      <div className="flex items-center mt-1">
        <span className="text-xs text-gray-500 mr-2">{formattedCost}</span>
        <span className="text-xs text-gray-500">{formattedLatency}</span>
      </div>
      <div className="mt-1">
        <VulnBadge status={vulnStatus} />
      </div>
    </div>
  );
}
