import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface CyclingTextProps {
  texts: string[];
  interval?: number;
  className?: string;
}

export function CyclingText({ texts, interval = 3000, className }: CyclingTextProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    // Skip effect if no texts provided
    if (!texts.length) return;

    // Fade out current text
    const fadeOutTimeout = setTimeout(() => {
      setFade(true);
    }, interval - 500); // Start fading 500ms before changing text

    // Change text and fade in
    const changeTextTimeout = setTimeout(() => {
      setCurrentIndex((current) => (current + 1) % texts.length);
      setFade(false);
    }, interval);

    return () => {
      clearTimeout(fadeOutTimeout);
      clearTimeout(changeTextTimeout);
    };
  }, [currentIndex, interval, texts]);

  if (!texts.length) return null;

  return (
    <span 
      className={cn(
        "transition-opacity duration-300", 
        fade ? "opacity-0" : "opacity-100",
        className
      )}
    >
      {texts[currentIndex]}
    </span>
  );
}