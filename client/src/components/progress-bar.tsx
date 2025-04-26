import { cn } from "@/lib/utils";

interface ProgressBarProps {
  percent: number;
  status?: "idle" | "loading" | "success" | "error";
  className?: string;
  showLabel?: boolean;
}

export function ProgressBar({ 
  percent, 
  status = "loading", 
  className,
  showLabel = true
}: ProgressBarProps) {
  const getStatusClass = () => {
    switch (status) {
      case "success":
        return "bg-green-500";
      case "error":
        return "bg-red-500";
      case "loading":
        return "bg-blue-500";
      default:
        return "bg-gray-300";
    }
  };

  // Ensure percent is between 0 and 100
  const normalizedPercent = Math.max(0, Math.min(100, percent));
  
  return (
    <div className={cn("w-full", className)}>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={cn("h-full transition-all duration-300 ease-in-out", getStatusClass())}
          style={{ width: `${normalizedPercent}%` }}
        />
      </div>
      {showLabel && (
        <div className="mt-1 flex justify-between text-xs text-gray-500">
          <span>{normalizedPercent}%</span>
          {status === "loading" && <span>Loading...</span>}
          {status === "success" && <span>Complete</span>}
          {status === "error" && <span>Error</span>}
        </div>
      )}
    </div>
  );
}
