// 3D Carousel with Framer Motion, auto-advance, pause-on-hover, and smooth 3D transitions

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThreeDCarouselProps {
  items: {
    title: string;
    content: string;
    task?: string;
  }[];
  label?: string;
}

const TRANSITION = { duration: 0.45, ease: [0.45, 0, 0.2, 1] };

export function ThreeDPhotoCarousel({
  items,
  label,
}: ThreeDCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // For timer reset on manual interaction
  const resetInterval = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % items.length);
    }, 2000);
  }, [items.length]);

  // Auto-advance logic
  useEffect(() => {
    if (!isHovered) {
      resetInterval();
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isHovered, resetInterval]);

  // Manual prev/next
  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
    resetInterval();
  };
  const handleNext = () => {
    setActiveIndex((prev) => (prev === items.length - 1 ? 0 : prev + 1));
    resetInterval();
  };

  // Manual set
  const handleSet = (idx: number) => {
    setActiveIndex(idx);
    resetInterval();
  };

  // 3D position logic
  const getPosition = (itemIndex: number) => {
    if (itemIndex === activeIndex) return "active";
    if (
      (itemIndex === activeIndex - 1) ||
      (activeIndex === 0 && itemIndex === items.length - 1)
    ) return "prev";
    if (
      (itemIndex === activeIndex + 1) ||
      (activeIndex === items.length - 1 && itemIndex === 0)
    ) return "next";
    return "inactive";
  };

  // 3D style for each card
  const getCardStyle = (pos: string) => {
    switch (pos) {
      case "active":
        return {
          zIndex: 20,
          opacity: 1,
          scale: 1,
          x: 0,
          rotateY: 0,
          translateZ: 0,
          boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
        };
      case "prev":
        return {
          zIndex: 10,
          opacity: 0.8,
          scale: 0.93,
          x: "-60%",
          rotateY: 10,
          translateZ: -80,
          boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
        };
      case "next":
        return {
          zIndex: 10,
          opacity: 0.8,
          scale: 0.93,
          x: "60%",
          rotateY: -10,
          translateZ: -80,
          boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
        };
      default:
        return {
          zIndex: 0,
          opacity: 0,
          scale: 0.85,
          x: 0,
          rotateY: 0,
          translateZ: -120,
          pointerEvents: "none" as const,
        };
    }
  };

  return (
    <div
      className="relative w-full overflow-visible py-10"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        perspective: "1000px",
        WebkitPerspective: "1000px",
      }}
    >
      {label && (
        <div className="absolute top-0 left-0 z-10 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-br-md font-medium">
          {label}
        </div>
      )}

      <div className="flex items-center justify-center h-full">
        <button
          onClick={handlePrev}
          className="absolute left-2 z-30 p-2 rounded-full bg-background/80 backdrop-blur-sm text-foreground hover:bg-background"
          aria-label="Previous"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        <div
          className="relative h-[200px] w-full max-w-[260px] mx-auto"
          style={{
            transformStyle: "preserve-3d",
            WebkitTransformStyle: "preserve-3d",
          }}
        >
          <AnimatePresence initial={false}>
            {items.map((item, idx) => {
              const pos = getPosition(idx);
              // Use a stable key (title+idx)
              return (
                <motion.div
                  key={item.title + idx}
                  className={cn(
                    "absolute top-0 left-0 right-0 mx-auto w-full max-w-[260px] cursor-pointer",
                    pos === "active" && "shadow-xl border-primary/30",
                    pos !== "active" && "shadow border-border/50"
                  )}
                  style={{
                    transformStyle: "preserve-3d",
                  }}
                  initial={getCardStyle(pos)}
                  animate={getCardStyle(pos)}
                  exit={getCardStyle("inactive")}
                  transition={TRANSITION}
                  onClick={
                    pos === "prev"
                      ? handlePrev
                      : pos === "next"
                      ? handleNext
                      : undefined
                  }
                  tabIndex={pos === "active" ? 0 : -1}
                  aria-selected={pos === "active"}
                  role="button"
                >
                  <CardContent className="p-4 h-full flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold">{item.title}</h3>
                      {item.task && (
                        <Badge variant="secondary" className="text-xs">
                          {item.task}
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground prompt-font overflow-y-auto max-h-24 p-2 bg-muted/30 rounded">
                      {item.content}
                    </div>
                  </CardContent>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        <button
          onClick={handleNext}
          className="absolute right-2 z-30 p-2 rounded-full bg-background/80 backdrop-blur-sm text-foreground hover:bg-background"
          aria-label="Next"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      {/* Pagination dots */}
      <div className="flex justify-center mt-4">
        <div className="bg-card/30 backdrop-blur-sm rounded-full px-3 py-1.5 flex space-x-1.5">
          {items.map((_, idx) => (
            <button
              key={idx}
              className={cn(
                "w-2 h-2 rounded-full transition-colors",
                idx === activeIndex
                  ? "bg-primary"
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              )}
              onClick={() => handleSet(idx)}
              aria-label={`Go to card ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}