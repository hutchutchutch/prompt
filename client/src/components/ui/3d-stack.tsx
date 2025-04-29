// 3D Stack with improved sizing, less nesting, and dark theme consistency

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { prompts } from '@/data/prompts';
import { models } from '@/data/models';

// Task category badge colors for prompt block
const TaskBadgeColors: Record<string, string> = {
  "Explanation": "bg-teal-500/20 text-teal-400",
  "Classification": "bg-blue-500/20 text-blue-400",
  "Specialized Response": "bg-amber-500/20 text-amber-400",
  "Creative Writing": "bg-purple-500/20 text-purple-400",
  "Red Teaming": "bg-red-500/20 text-red-400",
  "Critical Analysis": "bg-indigo-500/20 text-indigo-400",
  "Structured Output": "bg-orange-500/20 text-orange-400",
  "Image Analysis": "bg-emerald-500/20 text-emerald-400"
};

// Provider colors for model block
const ProviderColors: Record<string, string> = {
  "Anthropic": "bg-red-500/20 text-red-400 border-red-500/30",
  "OpenAI": "bg-green-500/20 text-green-400 border-green-500/30",
  "Google": "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "Meta": "bg-blue-700/20 text-blue-300 border-blue-700/30",
  "Mistral": "bg-purple-500/20 text-purple-400 border-purple-500/30",
  "Other": "bg-gray-500/20 text-gray-400 border-gray-500/30"
};

const ModelStats: Record<string, { cost: string, speed: string }> = {
  "claude-opus": { cost: "$15/1M", speed: "Fast" },
  "gpt-4o": { cost: "$10/1M", speed: "Very Fast" },
  "gemini-1.5-pro": { cost: "$7/1M", speed: "Fast" },
  "llama-3-70b": { cost: "$1/1M", speed: "Medium" },
  "mixtral-8x22b": { cost: "$0.9/1M", speed: "Medium" },
  "claude-haiku": { cost: "$1/1M", speed: "Very Fast" },
  "gpt-3.5-turbo": { cost: "$0.5/1M", speed: "Very Fast" },
};

const getProvider = (id: string) => {
  if (id.includes('claude')) return 'Anthropic';
  if (id.includes('gpt')) return 'OpenAI';
  if (id.includes('gemini')) return 'Google';
  if (id.includes('llama')) return 'Meta';
  if (id.includes('mixtral')) return 'Mistral';
  return 'Other';
};

const contentVariants = {
  enter: { opacity: 0, rotateY: -90, x: -20, transition: { duration: 0, ease: 'easeOut' } },
  center: { opacity: 1, rotateY: 0, x: 0, transition: { duration: 0.45, ease: [0.25, 0.1, 0.25, 1.0] } },
  exit: { opacity: 0, rotateY: 90, x: 20, transition: { duration: 0.25, ease: 'easeIn' } },
};

const Cuboid: React.FC<{
  depth: number;
  height: number;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ depth, height, children, className = '', style = {} }) => (
  <div
    className={`absolute left-1/2 -translate-x-1/2 preserve-3d ${className}`}
    style={{ height, width: '100%', ...style }}
  >
    {/* Front face */}
    <div className="absolute inset-0 bg-card rounded-xl shadow-card border border-border preserve-3d flex flex-col overflow-hidden">
      {children}
    </div>
    {/* Back face */}
    <div
      className="absolute inset-0 bg-card/40 rounded-xl border border-border"
      style={{ transform: `translateZ(-${depth}px) rotateY(180deg)` }}
    />
    {/* Top face */}
    <div
      className="absolute inset-x-0 -top-[2px] h-[2px] bg-primary/20 rounded-t-xl"
      style={{ transform: `translateZ(0px) rotateX(90deg) translateZ(${depth/2}px)` }}
    />
    {/* Bottom face */}
    <div
      className="absolute inset-x-0 -bottom-[2px] h-[2px] bg-primary/10 rounded-b-xl"
      style={{ transform: `translateZ(0px) rotateX(-90deg) translateZ(${depth/2}px)` }}
    />
    {/* Right face */}
    <div
      className="absolute top-0 bottom-0 -right-[2px] bg-card/60 border-r border-border"
      style={{
        transform: `translateX(${depth/2}px) rotateY(90deg)`,
        width: `${depth}px`,
        transformOrigin: 'right center'
      }}
    />
    {/* Left face */}
    <div
      className="absolute top-0 bottom-0 -left-[2px] bg-card/60 border-l border-border"
      style={{
        transform: `translateX(-${depth/2}px) rotateY(-90deg)`,
        width: `${depth}px`,
        transformOrigin: 'left center'
      }}
    />
    {/* Top edge glow */}
    <div
      className="absolute inset-x-[20%] -top-[1px] h-[2px] bg-primary/40 rounded-full blur-[1px]"
      style={{ transform: `translateZ(${depth/2}px)` }}
    />
    {/* Bottom edge glow */}
    <div
      className="absolute inset-x-[20%] -bottom-[1px] h-[2px] bg-primary/30 rounded-full blur-[2px]"
      style={{ transform: `translateZ(${depth/2}px)` }}
    />
  </div>
);

const PromptFace: React.FC<{ prompt: typeof prompts[0] }> = ({ prompt }) => {
  const badgeColor = TaskBadgeColors[prompt.task] || "bg-primary/10 text-primary";
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={prompt.id}
        className="p-5 flex flex-col h-full"
        variants={contentVariants}
        initial="enter"
        animate="center"
        exit="exit"
      >
        <div className="flex justify-between items-start mb-2">
          <div className={`px-2.5 py-1 rounded-full text-xs font-medium ${badgeColor}`}>
            {prompt.task}
          </div>
        </div>
        <h3 className="font-semibold text-lg mb-2 text-card-foreground">{prompt.title}</h3>
        <div className="h-px w-full bg-border/40 my-2"></div>
        <div className="flex-grow overflow-auto text-sm text-muted-foreground relative">
          {prompt.content}
          <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-card to-transparent pointer-events-none"></div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

const ModelFace: React.FC<{ model: typeof models[0] }> = ({ model }) => {
  const provider = getProvider(model.id);
  const providerColor = ProviderColors[provider] || ProviderColors.Other;
  const stats = ModelStats[model.id] || { cost: "?", speed: "?" };
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={model.id}
        className="p-5 flex flex-col h-full"
        variants={contentVariants}
        initial="enter"
        animate="center"
        exit="exit"
      >
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-semibold text-lg text-card-foreground truncate max-w-[65%]">
            {model.title}
          </h3>
          <div className={`text-xs px-2.5 py-1 rounded-full border ${providerColor}`}>
            {provider}
          </div>
        </div>
        <div className="h-px w-full bg-border/40 mb-3"></div>
        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
          <div className="flex flex-col">
            <span className="text-muted-foreground mb-1">Cost</span>
            <span className="font-medium text-card-foreground">{stats.cost}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground mb-1">Speed</span>
            <span className="font-medium text-card-foreground">{stats.speed}</span>
          </div>
        </div>
        <div className="flex-grow overflow-auto text-xs text-muted-foreground relative">
          {model.content}
          <div className="absolute bottom-0 right-0 w-20 h-full bg-gradient-to-l from-card to-transparent pointer-events-none"></div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

const PromptBlock: React.FC<{ depth: number; height: number }> = ({ depth, height }) => {
  const [promptIdx, setPromptIdx] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setPromptIdx(prev => (prev + 1) % prompts.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);
  const prompt = prompts[promptIdx];
  return (
    <Cuboid depth={depth} height={height}>
      <PromptFace prompt={prompt} />
    </Cuboid>
  );
};

const ModelBlock: React.FC<{ depth: number; height: number; topOffset: number }> = ({ depth, height, topOffset }) => {
  const [modelIdx, setModelIdx] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setModelIdx(prev => (prev + 1) % models.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);
  const model = models[modelIdx];
  return (
    <Cuboid
      depth={depth}
      height={height}
      className=""
      style={{ top: `${topOffset}px` }}
    >
      <ModelFace model={model} />
    </Cuboid>
  );
};

export const ThreeDStack: React.FC = () => {
  // Target height to match evaluation card (e.g., 400px)
  const promptHeight = 220;
  const modelHeight = 170;
  const stackHeight = promptHeight + modelHeight + 10;

  return (
    <div
      className="relative w-full max-w-[380px] mx-auto"
      style={{
        minHeight: `${stackHeight}px`,
        height: `${stackHeight}px`,
        perspective: "900px",
      }}
    >
      <motion.div
        className="relative preserve-3d"
        animate={{
          rotateX: [-8, -6, -8],
          rotateY: [5, 7, 5],
          y: [0, -5, 0]
        }}
        transition={{
          duration: 6,
          ease: "easeInOut",
          repeat: Infinity,
          times: [0, 0.5, 1]
        }}
        whileHover={{
          scale: 1.03,
          rotateX: -10,
          rotateY: 8,
          transition: { duration: 0.3, ease: "easeOut" }
        }}
        style={{
          minHeight: `${stackHeight}px`,
          height: `${stackHeight}px`,
        }}
      >
        {/* Subtle background glow */}
        <div
          className="absolute -inset-10 bg-primary/5 rounded-full blur-2xl opacity-50 -z-10"
          style={{ transform: 'translateZ(-50px)' }}
        />
        <PromptBlock depth={40} height={promptHeight} />
        <ModelBlock depth={40} height={modelHeight} topOffset={promptHeight + 10} />
      </motion.div>
      {/* Reflection effect */}
      <div
        className="absolute w-full h-10 -bottom-10 bg-primary/10 blur-xl opacity-30 rounded-full scale-x-75"
        style={{ transform: 'rotateX(70deg) translateY(20px)' }}
      />
    </div>
  );
};

export default ThreeDStack;