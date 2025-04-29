import React from "react";
import { prompts } from "@/data/prompts";
import { usePromptStore } from "@/store/promptStore";
import { cn } from "@/lib/utils";

// Icon mapping for prompt types
const promptIcons: Record<string, React.ReactNode> = {
  cot: <span role="img" aria-label="ChainOfThought" className="mr-1">🧠</span>,
  fewshot: <span role="img" aria-label="FewShot" className="mr-1">🪄</span>,
  roleplay: <span role="img" aria-label="Roleplay" className="mr-1">🎭</span>,
  // Add more mappings as needed
};

export const PromptDrawer: React.FC = () => {
  const { promptIdx, setPromptIdx } = usePromptStore();

  return (
    <aside className="w-72 min-w-[280px] max-w-xs h-full bg-background border-r border-border/30 flex flex-col">
      {/* Vertical pill menu */}
      <div className="py-4 px-3 border-b border-border/20">
        <h2 className="text-lg font-semibold mb-3">Prompt Types</h2>
        <nav className="flex flex-col gap-2">
          {prompts.map((prompt, idx) => (
            <button
              key={prompt.id}
              className={cn(
                "flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all",
                promptIdx === idx
                  ? "bg-primary text-primary-foreground shadow ring-2 ring-primary/60"
                  : "bg-zinc-800 text-zinc-200 hover:bg-zinc-700/80"
              )}
              onClick={() => setPromptIdx(idx)}
            >
              {promptIcons[prompt.id] || null}
              {prompt.title}
            </button>
          ))}
        </nav>
      </div>
      {/* Scrollable prompt card list */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex flex-col gap-4">
          {prompts.map((prompt, idx) => (
            <div
              key={prompt.id}
              className={cn(
                "rounded-xl border aspect-[3/4] w-full max-w-[280px] mx-auto transition-all duration-300 cursor-pointer",
                promptIdx === idx
                  ? "bg-card text-card-foreground shadow-xl border-gradient-to-r from-primary/60 to-teal-400/60 border-2"
                  : "bg-background/80 text-muted-foreground shadow border-border/50"
              )}
              style={{
                borderImage: promptIdx === idx
                  ? "linear-gradient(90deg, #06b6d4 0%, #14b8a6 100%) 1"
                  : undefined
              }}
              onClick={() => setPromptIdx(idx)}
              tabIndex={0}
              aria-selected={promptIdx === idx}
            >
              <div className="p-5 flex flex-col h-full">
                <div className="flex justify-between items-start mb-2">
                  <div className="px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-800 text-zinc-200">
                    {prompt.task}
                  </div>
                </div>
                <h3 className="font-semibold text-base mb-2 text-zinc-100 line-clamp-2">
                  {prompt.title}
                </h3>
                <div className="h-px w-full bg-border/40 my-2"></div>
                <div className="flex-grow overflow-auto text-sm text-zinc-300 max-h-[120px] relative">
                  {prompt.content}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};