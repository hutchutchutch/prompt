import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { PromptTemplate } from "@/data/task-categories";

interface CategoryTabsProps {
  categories: PromptTemplate[];
  active: string;
  onChange: (category: string) => void;
  newCategories?: string[]; // Categories with new prompts in last 24h
}

export function CategoryTabs({
  categories,
  active,
  onChange,
  newCategories = []
}: CategoryTabsProps) {
  // Sort categories alphabetically for consistent order
  const sortedCategories = [...categories].sort((a, b) => 
    a.category.localeCompare(b.category)
  );
  
  return (
    <div className="w-full mb-6">
      <ScrollArea className="w-full whitespace-nowrap">
        <Tabs 
          value={active} 
          onValueChange={onChange}
          className="w-full"
        >
          <TabsList className="w-full justify-start">
            {sortedCategories.map((cat) => (
              <TooltipProvider key={cat.category}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <TabsTrigger 
                      value={cat.category} 
                      className="relative flex items-center gap-1 px-4 
                        data-[state=active]:bg-primary data-[state=active]:text-primary-foreground 
                        dark:data-[state=active]:bg-[#252525] dark:data-[state=active]:text-[#4FF8E5] 
                        dark:data-[state=active]:border dark:data-[state=active]:border-[#4FF8E5]/20
                        dark:data-[state=active]:shadow-[0_0_6px_rgba(79,248,229,0.2)]
                        dark:hover:border-[#4FF8E5]/20 dark:hover:bg-[#232323] 
                        dark:text-[#CCCCCC] dark:transition-all dark:duration-150 rounded-md py-2"
                    >
                      {cat.category}
                      
                      {/* New content indicator */}
                      {newCategories.includes(cat.category) && (
                        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-[#4FF8E5]" />
                      )}
                    </TabsTrigger>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm p-4 dark:bg-[#1A1A1A] dark:border-[#2A2A2A] dark:shadow-[0_4px_12px_rgba(79,248,229,0.08)]">
                    <div className="space-y-2">
                      <p className="font-medium dark:text-[#E0E0E0]">{cat.category}</p>
                      <p className="text-sm text-muted-foreground dark:text-[#B0B0B0]">{cat.description}</p>
                      {cat.businessImpact && (
                        <div className="mt-2">
                          <Badge variant="secondary" className="mb-1 dark:bg-[#252525] dark:text-[#4FF8E5] dark:border dark:border-[#4FF8E5]/20 dark:shadow-[0_0_6px_rgba(79,248,229,0.1)]">Business Impact</Badge>
                          <p className="text-xs text-muted-foreground dark:text-[#B0B0B0]">{cat.businessImpact}</p>
                        </div>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </TabsList>
        </Tabs>
        <ScrollBar orientation="horizontal" className="opacity-0" />
      </ScrollArea>
    </div>
  );
}