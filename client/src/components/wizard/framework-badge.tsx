import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface FrameworkBadgeProps {
  name: string;
  description?: string;
  enabled: boolean;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

export function FrameworkBadge({
  name,
  description,
  enabled,
  selected = false,
  onClick,
  className,
}: FrameworkBadgeProps) {
  if (!enabled) {
    return (
      <Badge 
        variant="outline" 
        className={cn(
          "bg-gray-100 text-gray-500 cursor-not-allowed opacity-60",
          className
        )}
      >
        {name}
        {description && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-3 w-3 ml-1 inline-block" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">{description}</p>
            </TooltipContent>
          </Tooltip>
        )}
      </Badge>
    );
  }

  return (
    <Badge 
      variant={selected ? "default" : "outline"}
      className={cn(
        "cursor-pointer transition-all",
        selected ? "bg-primary text-primary-foreground" : "hover:bg-primary/10",
        className
      )}
      onClick={onClick}
    >
      {name}
      {description && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="h-3 w-3 ml-1 inline-block" />
          </TooltipTrigger>
          <TooltipContent>
            <p className="max-w-xs">{description}</p>
          </TooltipContent>
        </Tooltip>
      )}
    </Badge>
  );
}
