import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface OutputPreviewProps {
  text: string;
  maxChars?: number;
  label?: string;
}

export function OutputPreview({ 
  text, 
  maxChars = 200,
  label = "Output"
}: OutputPreviewProps) {
  const { toast } = useToast();
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const displayText = expanded ? text : (text.length > maxChars ? text.slice(0, maxChars) + "..." : text);
  const hasMore = text.length > maxChars;
  
  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      toast({
        description: "Text copied to clipboard",
      });
      
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      toast({
        title: "Failed to copy",
        description: "Could not copy text to clipboard",
        variant: "destructive",
      });
    });
  };
  
  return (
    <Card className="shadow-sm">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-xs uppercase text-gray-500">{label}</h3>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 w-7 p-0" 
            onClick={handleCopy}
            aria-label="Copy text"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
        
        <div className="bg-gray-50 p-3 rounded-md">
          <pre className="text-sm text-gray-700 whitespace-pre-wrap overflow-auto max-h-[200px]">
            {displayText}
          </pre>
        </div>
        
        {hasMore && (
          <Button 
            variant="link" 
            size="sm" 
            className="mt-2 h-auto p-0" 
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? "Show less" : "Show full output"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}