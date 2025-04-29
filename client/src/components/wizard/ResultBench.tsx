import React from "react";
import { usePromptStore } from "@/store/promptStore";
import { prompts } from "@/data/prompts";
import { models } from "@/data/models";
import { cn } from "@/lib/utils";
import { GripVertical } from "lucide-react";

export const ResultBench: React.FC = () => {
  const { history, restoreFromHistory, reorderHistory } = usePromptStore();

  // Drag-and-drop logic (simple, not persistent)
  const [draggedIdx, setDraggedIdx] = React.useState<number | null>(null);

  const handleDragStart = (idx: number) => setDraggedIdx(idx);
  const handleDragOver = (idx: number) => {
    if (draggedIdx === null || draggedIdx === idx) return;
    const newHistory = [...history];
    const [removed] = newHistory.splice(draggedIdx, 1);
    newHistory.splice(idx, 0, removed);
    reorderHistory(newHistory);
    setDraggedIdx(idx);
  };
  const handleDragEnd = () => setDraggedIdx(null);

  if (!history.length) return null;

  return (
    <div className="fixed left-1/2 bottom-6 z-40 -translate-x-1/2 bg-background/95 border border-border/40 rounded-2xl shadow-lg px-3 py-2 flex gap-2 items-center min-w-[340px] max-w-[90vw] overflow-x-auto">
      {history.map((entry, idx) => {
        const prompt = prompts[entry.promptIdx];
        const model = models[entry.modelIdx];
        return (
          <div
            key={idx}
            className={cn(
              "flex items-center gap-2 px-3 py-1 rounded-lg cursor-pointer transition-all select-none",
              draggedIdx === idx
                ? "bg-primary/20 border border-primary"
                : "hover:bg-primary/10",
            )}
            draggable
            onClick={() => restoreFromHistory(idx)}
            onDragStart={() => handleDragStart(idx)}
            onDragOver={(e) => { e.preventDefault(); handleDragOver(idx); }}
            onDragEnd={handleDragEnd}
            tabIndex={0}
            aria-label={`Restore ${model.title} + ${prompt.title}`}
          >
            <GripVertical className="w-3 h-3 text-zinc-400 mr-1" />
            <span className="text-xs font-medium text-zinc-500">{model.title}</span>
            <span className="text-xs">+</span>
            <span className="text-xs font-medium text-zinc-500">{prompt.title}</span>
            <span className="mx-1 text-xs text-zinc-400">→</span>
            <span className="text-sm font-bold text-primary">{entry.score}/100</span>
          </div>
        );
      })}
    </div>
  );
};