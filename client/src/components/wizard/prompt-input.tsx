import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  maxTokens?: number;
  placeholder?: string;
  label?: string;
  isRequired?: boolean;
  className?: string;
}

export function PromptInput({
  value,
  onChange,
  maxTokens = 4000,
  placeholder = "You are a customer support agent for a SaaS product...",
  label = "Prompt Text",
  isRequired = true,
  className,
}: PromptInputProps) {
  const [tokenCount, setTokenCount] = useState(0);
  
  // Simple approximation of token count (for UI purposes only)
  // In a real implementation, this would use a proper tokenizer
  useEffect(() => {
    // Rough approximation: ~4 chars per token
    const approximateTokens = Math.ceil(value.length / 4);
    setTokenCount(approximateTokens);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className={className}>
      <Label htmlFor="prompt-input" className="block text-sm font-medium text-gray-700 mb-1">
        {label} {isRequired && <span className="text-red-500">*</span>}
      </Label>
      <div className="mt-1 relative rounded-md shadow-sm">
        <Textarea
          id="prompt-input"
          rows={6}
          className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm prompt-font"
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          required={isRequired}
        />
        <div className="absolute bottom-2 right-2 text-xs text-gray-400">
          {tokenCount} / {maxTokens} tokens
        </div>
      </div>
    </div>
  );
}
