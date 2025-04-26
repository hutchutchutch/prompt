import { Badge } from "@/components/ui/badge";
import { VulnerabilityStatus } from "@/types";
import { cn } from "@/lib/utils";

interface VulnBadgeProps {
  status: VulnerabilityStatus;
  className?: string;
}

export function VulnBadge({ status, className }: VulnBadgeProps) {
  switch (status) {
    case "safe":
      return (
        <Badge 
          variant="outline"
          className={cn(
            "bg-green-100 text-green-800 hover:bg-green-100 text-xs", 
            className
          )}
        >
          ✓ Safe
        </Badge>
      );

    case "partial":
      return (
        <Badge 
          variant="outline"
          className={cn(
            "bg-amber-100 text-amber-800 hover:bg-amber-100 text-xs", 
            className
          )}
        >
          ⚠️ Partial
        </Badge>
      );

    case "failed":
      return (
        <Badge 
          variant="outline"
          className={cn(
            "bg-red-100 text-red-800 hover:bg-red-100 text-xs", 
            className
          )}
        >
          ❌ Failed
        </Badge>
      );

    default:
      return (
        <Badge 
          variant="outline"
          className={cn(
            "bg-gray-100 text-gray-800 hover:bg-gray-100 text-xs", 
            className
          )}
        >
          ? Unknown
        </Badge>
      );
  }
}
