import React, { useState } from "react";
import { models } from "@/data/models";
import { usePromptStore } from "@/store/promptStore";
import { cn } from "@/lib/utils";

// Vendor badge mapping
const vendorMap: Record<string, { name: string; color: string }> = {
  claude: { name: "Anthropic", color: "bg-gradient-to-r from-yellow-200 to-yellow-400 text-yellow-900" },
  gpt: { name: "OpenAI", color: "bg-gradient-to-r from-green-200 to-green-400 text-green-900" },
  gemini: { name: "Google", color: "bg-gradient-to-r from-blue-200 to-blue-400 text-blue-900" },
  llama: { name: "Meta", color: "bg-gradient-to-r from-fuchsia-200 to-fuchsia-400 text-fuchsia-900" },
  mixtral: { name: "Mistral", color: "bg-gradient-to-r from-gray-200 to-gray-400 text-gray-900" },
};

function getVendor(id: string) {
  if (id.startsWith("claude")) return vendorMap.claude;
  if (id.startsWith("gpt")) return vendorMap.gpt;
  if (id.startsWith("gemini")) return vendorMap.gemini;
  if (id.startsWith("llama")) return vendorMap.llama;
  if (id.startsWith("mixtral")) return vendorMap.mixtral;
  return { name: "Other", color: "bg-zinc-200 text-zinc-900" };
}

const sortOptions = [
  { key: "cost", label: "Cost ▾" },
  { key: "speed", label: "Speed ▾" },
  { key: "context", label: "Context ▴" },
];

export const ModelGridToggle: React.FC = () => {
  const { modelIdx, setModelIdx } = usePromptStore();
  const [view, setView] = useState<"grid" | "carousel">("grid");
  const [sortKey, setSortKey] = useState("cost");

  // Placeholder: sort models alphabetically for now
  const sortedModels = [...models].sort((a, b) => a.title.localeCompare(b.title));

  return (
    <section>
      {/* Toggle and sort chips */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex gap-2">
          {sortOptions.map(opt => (
            <button
              key={opt.key}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                sortKey === opt.key
                  ? "bg-primary text-primary-foreground ring-2 ring-primary"
                  : "bg-zinc-800 text-zinc-200 hover:bg-zinc-700/80"
              )}
              onClick={() => setSortKey(opt.key)}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          <button
            className={cn(
              "px-2 py-1 rounded text-xs font-medium",
              view === "grid" ? "bg-primary text-primary-foreground" : "bg-zinc-800 text-zinc-200"
            )}
            onClick={() => setView("grid")}
          >
            Grid
          </button>
          <button
            className={cn(
              "px-2 py-1 rounded text-xs font-medium",
              view === "carousel" ? "bg-primary text-primary-foreground" : "bg-zinc-800 text-zinc-200"
            )}
            onClick={() => setView("carousel")}
          >
            Carousel
          </button>
        </div>
      </div>
      {/* Grid view */}
      {view === "grid" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {sortedModels.map((model, idx) => {
            const vendor = getVendor(model.id);
            return (
              <div
                key={model.id}
                className={cn(
                  "rounded-xl border w-full max-w-[280px] h-[150px] mx-auto transition-all duration-300 cursor-pointer flex flex-col justify-between p-4",
                  modelIdx === idx
                    ? "bg-card text-card-foreground shadow-xl border-primary/30 ring-2 ring-primary"
                    : "bg-background/80 text-muted-foreground shadow border-border/50"
                )}
                onClick={() => setModelIdx(idx)}
                tabIndex={0}
                aria-selected={modelIdx === idx}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-base">{model.title}</span>
                  <span className={cn("ml-2 px-2 py-0.5 rounded text-xs font-medium", vendor.color)}>
                    {vendor.name}
                  </span>
                </div>
                <div className="flex-1 text-xs text-zinc-400 line-clamp-2">{model.content}</div>
                <div className="flex justify-end items-center gap-2 mt-2">
                  {/* Placeholder for tokens/cost */}
                  <span className="text-xs text-right text-zinc-500">Tokens: —</span>
                  <span className="text-xs text-right text-zinc-500">Cost: —</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {/* Carousel view (placeholder) */}
      {view === "carousel" && (
        <div className="flex overflow-x-auto gap-4">
          {sortedModels.map((model, idx) => {
            const vendor = getVendor(model.id);
            return (
              <div
                key={model.id}
                className={cn(
                  "rounded-xl border w-[280px] h-[150px] flex-shrink-0 transition-all duration-300 cursor-pointer flex flex-col justify-between p-4",
                  modelIdx === idx
                    ? "bg-card text-card-foreground shadow-xl border-primary/30 ring-2 ring-primary"
                    : "bg-background/80 text-muted-foreground shadow border-border/50"
                )}
                onClick={() => setModelIdx(idx)}
                tabIndex={0}
                aria-selected={modelIdx === idx}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-base">{model.title}</span>
                  <span className={cn("ml-2 px-2 py-0.5 rounded text-xs font-medium", vendor.color)}>
                    {vendor.name}
                  </span>
                </div>
                <div className="flex-1 text-xs text-zinc-400 line-clamp-2">{model.content}</div>
                <div className="flex justify-end items-center gap-2 mt-2">
                  {/* Placeholder for tokens/cost */}
                  <span className="text-xs text-right text-zinc-500">Tokens: —</span>
                  <span className="text-xs text-right text-zinc-500">Cost: —</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};