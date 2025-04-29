import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { PromptCard } from "@/data/prompts";

interface PromptModalProps {
  open: boolean;
  onClose: () => void;
  prompt: PromptCard | null;
  onSave?: (updated: { template: string; inputs: string[]; output: string }) => void;
}

function extractInputs(content: string): string[] {
  // Match [PLACEHOLDER] and {{variable}} patterns
  const bracketMatches = Array.from(content.matchAll(/\[([A-Z_ ]+)\]/g)).map(m => m[1]);
  const curlyMatches = Array.from(content.matchAll(/\{\{(\w+)\}\}/g)).map(m => m[1]);
  return Array.from(new Set([...bracketMatches, ...curlyMatches]));
}

export const PromptModal: React.FC<PromptModalProps> = ({ open, onClose, prompt, onSave }) => {
  const [template, setTemplate] = useState("");
  const [inputs, setInputs] = useState<string[]>([]);
  const [output, setOutput] = useState("");

  useEffect(() => {
    if (prompt) {
      setTemplate(prompt.content);
      setInputs(extractInputs(prompt.content));
      setOutput("The output will match the requirements of the prompt and may vary depending on the input values.");
    }
  }, [prompt]);

  const handleInputChange = (idx: number, value: string) => {
    setInputs(inputs => inputs.map((input, i) => (i === idx ? value : input)));
  };

  const handleAddInput = () => {
    setInputs(inputs => [...inputs, ""]);
  };

  const handleRemoveInput = (idx: number) => {
    setInputs(inputs => inputs.filter((_, i) => i !== idx));
  };

  const handleSave = () => {
    if (onSave) {
      onSave({ template, inputs, output });
    }
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  if (!prompt) return null;

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-lg bg-zinc-900 text-zinc-100 border border-zinc-700">
        <DialogHeader>
          <DialogTitle className="text-xl">{prompt.title}</DialogTitle>
          <DialogDescription className="text-zinc-400">{prompt.task}</DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <div className="mb-2 font-semibold">Prompt Template:</div>
          <textarea
            className="w-full bg-zinc-800 rounded p-3 text-sm text-zinc-100 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-primary"
            rows={5}
            value={template}
            onChange={e => setTemplate(e.target.value)}
          />
        </div>
        <div className="mt-4">
          <div className="mb-2 font-semibold">Inputs:</div>
          {inputs.length > 0 ? (
            <ul className="space-y-2">
              {inputs.map((input, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <input
                    className="flex-1 bg-zinc-800 rounded p-2 text-sm text-zinc-100 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-primary"
                    value={input}
                    onChange={e => handleInputChange(idx, e.target.value)}
                  />
                  <button
                    className="text-red-400 hover:text-red-300 px-2"
                    onClick={() => handleRemoveInput(idx)}
                    title="Remove input"
                  >
                    &times;
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-zinc-400 mb-2">No variable inputs detected.</div>
          )}
          <button
            className="mt-2 px-3 py-1 rounded bg-zinc-700 text-zinc-200 hover:bg-zinc-600 text-xs"
            onClick={handleAddInput}
          >
            + Add Input
          </button>
        </div>
        <div className="mt-4">
          <div className="mb-2 font-semibold">Expected Output:</div>
          <textarea
            className="w-full bg-zinc-800 rounded p-3 text-sm text-zinc-100 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-primary"
            rows={3}
            value={output}
            onChange={e => setOutput(e.target.value)}
          />
        </div>
        <div className="mt-6 flex gap-3">
          <button
            className="flex-1 py-2 rounded bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition"
            onClick={handleSave}
          >
            Save
          </button>
          <button
            className="flex-1 py-2 rounded bg-zinc-700 text-zinc-200 font-semibold hover:bg-zinc-600 transition"
            onClick={handleCancel}
          >
            Cancel
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};