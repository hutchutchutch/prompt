import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ThreeDCarouselProps {
  items: {
    title: string;
    content: string;
    task?: string;
  }[];
  label?: string;
}

export function ThreeDPhotoCarousel({ 
  items, 
  label 
}: ThreeDCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  
  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
  };
  
  const handleNext = () => {
    setActiveIndex((prev) => (prev === items.length - 1 ? 0 : prev + 1));
  };
  
  const getPosition = (itemIndex: number) => {
    const diff = itemIndex - activeIndex;
    if (diff === 0) return "active";
    if (diff === 1 || (activeIndex === items.length - 1 && itemIndex === 0)) return "next";
    if (diff === -1 || (activeIndex === 0 && itemIndex === items.length - 1)) return "prev";
    return "inactive";
  };

  return (
    <div className="relative w-full overflow-hidden py-10">
      {label && (
        <div className="absolute top-0 left-0 z-10 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-br-md font-medium">
          {label}
        </div>
      )}
      
      <div className="flex items-center justify-center h-full">
        <button 
          onClick={handlePrev} 
          className="absolute left-2 z-10 p-2 rounded-full bg-background/80 backdrop-blur-sm text-foreground hover:bg-background"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        
        <div className="relative h-[200px] w-full max-w-4xl mx-auto perspective-1000">
          {items.map((item, index) => (
            <Card
              key={index}
              className={cn(
                "absolute top-0 left-0 right-0 mx-auto transition-all duration-500 ease-in-out shadow-lg",
                getPosition(index) === "active" && "z-20 translate-z-0 opacity-100 w-full md:w-[70%] scale-100",
                getPosition(index) === "prev" && "z-10 -translate-x-[30%] translate-z-[-80px] opacity-80 w-[60%] md:w-[50%] rotate-y-15 scale-90",
                getPosition(index) === "next" && "z-10 translate-x-[30%] translate-z-[-80px] opacity-80 w-[60%] md:w-[50%] -rotate-y-15 scale-90",
                getPosition(index) === "inactive" && "opacity-0 scale-75 translate-z-[-120px]"
              )}
              onClick={getPosition(index) === "prev" ? handlePrev : getPosition(index) === "next" ? handleNext : undefined}
            >
              <CardContent className="p-4 h-full">
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
            </Card>
          ))}
        </div>
        
        <button 
          onClick={handleNext} 
          className="absolute right-2 z-10 p-2 rounded-full bg-background/80 backdrop-blur-sm text-foreground hover:bg-background"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
}

export function ThreeDPhotoCarouselDemo() {
  const demoItems = [
    {
      title: "Sample Card 1",
      content: "This is sample content for the first card. It demonstrates how the carousel works."
    },
    {
      title: "Sample Card 2",
      content: "Here's the second card with some different content to showcase the 3D effect."
    },
    {
      title: "Sample Card 3",
      content: "And this is the third card, which completes our demonstration of the 3D carousel."
    }
  ];

  return (
    <div className="w-full max-w-4xl">
      <div className="min-h-[300px] flex flex-col justify-center rounded-lg space-y-4">
        <ThreeDPhotoCarousel items={demoItems} label="Demo" />
      </div>
    </div>
  );
}

// Add CSS classes for the 3D effect
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    .perspective-1000 {
      perspective: 1000px;
    }
    .rotate-y-15 {
      transform: rotateY(15deg);
    }
    .-rotate-y-15 {
      transform: rotateY(-15deg);
    }
    .translate-z-0 {
      transform: translateZ(0);
    }
    .translate-z-\\[-80px\\] {
      transform: translateZ(-80px);
    }
    .translate-z-\\[-120px\\] {
      transform: translateZ(-120px);
    }
  `;
  document.head.appendChild(style);
}