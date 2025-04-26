import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { taskCategories } from "@/data/task-categories";

interface TaskCategorySelectorProps {
  onSelect?: (category: string) => void;
}

export function TaskCategorySelector({ onSelect }: TaskCategorySelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [, setLocation] = useLocation();

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    if (onSelect) {
      onSelect(category);
    }
  };

  const handleStartNewTest = () => {
    if (selectedCategory) {
      // Navigate to wizard with pre-selected template category
      setLocation(`/wizard?category=${encodeURIComponent(selectedCategory)}`);
    } else {
      // Navigate to wizard without template
      setLocation("/wizard");
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-2">Choose Use Case</h2>
        <p className="text-sm text-gray-500 mb-4">
          Select a task category to get started with a template or create a custom prompt
        </p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {taskCategories.map((item) => (
            <Badge
              key={item.category}
              variant={selectedCategory === item.category ? "default" : "outline"}
              className={`
                px-3 py-1 text-sm rounded-full cursor-pointer hover:bg-primary/10
                ${selectedCategory === item.category 
                  ? "border-primary bg-primary text-white" 
                  : "border-gray-300 bg-white text-gray-700 hover:text-primary"}
              `}
              onClick={() => handleCategoryClick(item.category)}
            >
              {item.category}
            </Badge>
          ))}
        </div>
      </div>

      {selectedCategory && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle>{selectedCategory}</CardTitle>
            <CardDescription>
              {taskCategories.find(c => c.category === selectedCategory)?.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm">
            <div className="bg-white p-3 rounded-md border border-gray-200 font-mono text-xs overflow-hidden text-ellipsis whitespace-pre-wrap max-h-32">
              {taskCategories.find(c => c.category === selectedCategory)?.template}
            </div>
          </CardContent>
          <CardFooter className="bg-white bg-opacity-50 pt-2">
            <div className="flex justify-end w-full">
              <Button size="sm" variant="default" onClick={handleStartNewTest}>
                Use This Template
              </Button>
            </div>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}