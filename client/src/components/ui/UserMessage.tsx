import React from "react";
import { Button } from "./button";
import { Textarea } from "./textarea";

interface UserMessageProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
}

export const UserMessage: React.FC<UserMessageProps> = ({
  value,
  onChange,
  onSubmit,
  disabled = false,
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      onSubmit();
    }
  };

  return (
    <form
      className="flex flex-col gap-2 w-full"
      onSubmit={e => {
        e.preventDefault();
        onSubmit();
      }}
      aria-label="User message input"
    >
      <label htmlFor="user-message" className="font-medium">
        Enter your message
      </label>
      <Textarea
        id="user-message"
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        rows={3}
        className="resize-none"
        placeholder="Type your message here..."
        disabled={disabled}
        aria-label="User message"
      />
      <Button
        type="submit"
        className="self-end"
        disabled={disabled || value.trim() === ""}
      >
        Send
      </Button>
    </form>
  );
};