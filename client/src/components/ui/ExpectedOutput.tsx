import React from "react";
import { Button } from "./button";

interface ExpectedOutputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  disabled?: boolean;
}

export const ExpectedOutput: React.FC<ExpectedOutputProps> = ({
  value,
  onChange,
  onSubmit,
  disabled = false,
}) => {
  const [localValue, setLocalValue] = React.useState(value);

  React.useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalValue(e.target.value);
    onChange(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && onSubmit) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <label className="font-medium text-sm text-muted-foreground mb-1">
        Expected Output
      </label>
      <textarea
        className="w-full min-h-[80px] rounded border border-border bg-background px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
        value={localValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Describe the ideal output for your prompt..."
        disabled={disabled}
        aria-label="Expected Output"
      />
      {onSubmit && (
        <Button
          type="button"
          size="sm"
          className="self-end mt-1"
          onClick={onSubmit}
          disabled={disabled}
        >
          Save Expected Output
        </Button>
      )}
    </div>
  );
};