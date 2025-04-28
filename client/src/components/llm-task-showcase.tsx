import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, Clock, DollarSign } from "lucide-react";

interface ModelResult {
  model: string;
  provider: string;
  score: number;
  cost: number;
  time: number;
  output: string;
}

interface BusinessValue {
  description: string;
  metric: string;
}

interface LlmTaskShowcaseProps {
  promptText: string;
  taskCategory: string;
  bestQuality: ModelResult;
  bestValue: ModelResult;
  fastest: ModelResult;
  businessValue?: BusinessValue;
}

export function LlmTaskShowcase({
  promptText,
  taskCategory,
  bestQuality,
  bestValue,
  fastest,
  businessValue,
}: LlmTaskShowcaseProps) {
  const llmTasks = [taskCategory];

  return (
    <div className="bg-gradient-to-b from-blue-50 to-white py-10 px-4 rounded-xl border border-blue-100 dark:bg-gradient-to-b dark:from-[#252525] dark:to-[#1A1A1A] dark:border-[#2A2A2A] dark:shadow-[0_8px_16px_rgba(0,0,0,0.3),0_0_0_1px_rgba(79,248,229,0.05)]">
      <div className="text-center mb-8">
        <p className="text-gray-600 dark:text-[#B0B0B0] text-left max-w-2xl">
          Here's how different models performed on this{" "}
          <span className="font-medium text-primary dark:text-[#4FF8E5]">
            {taskCategory.toLowerCase()}
          </span>{" "}
          prompt.
        </p>

        {/* Display business value section if available */}
        {businessValue && (
          <div className="bg-green-50 border border-green-100 rounded-lg p-4 mt-4 text-left dark:bg-[rgba(79,248,229,0.05)] dark:border-[#4FF8E5]/20">
            <h3 className="text-base font-semibold text-green-800 mb-1 dark:text-[#4FF8E5]">
              Business Impact
            </h3>
            <p className="text-sm text-gray-700 dark:text-[#E0E0E0]">{businessValue.description}</p>
            <div className="mt-2 inline-block bg-white px-3 py-1 rounded-full border border-green-200 dark:bg-[#252525] dark:border-[#4FF8E5]/30 dark:shadow-[0_0_8px_rgba(79,248,229,0.1)]">
              <p className="text-sm font-medium text-green-700 dark:text-[#4FF8E5]">
                {businessValue.metric}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="mb-6">
        <Card className="bg-gray-50 border-gray-200 dark:bg-[#232323] dark:border-[#2A2A2A] dark:shadow-[0_4px_12px_rgba(0,0,0,0.2)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg dark:text-[#E0E0E0]">Prompt of the Day</CardTitle>
            <CardDescription className="dark:text-[#B0B0B0]">
              Example prompt for {taskCategory.toLowerCase()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-white p-4 rounded-md border border-gray-200 prompt-font text-sm dark:bg-[#1A1A1A] dark:border-[#2A2A2A] dark:text-[#E0E0E0]">
              {promptText}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="quality" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6 dark:bg-[#252525] dark:border-[#2A2A2A]">
          <TabsTrigger 
            value="quality"
            className="dark:data-[state=active]:bg-[#252525] dark:data-[state=active]:text-[#4FF8E5] 
              dark:data-[state=active]:border dark:data-[state=active]:border-[#4FF8E5]/20
              dark:data-[state=active]:shadow-[0_0_6px_rgba(79,248,229,0.2)]
              dark:hover:border-[#4FF8E5]/20 dark:hover:bg-[#232323] 
              dark:text-[#CCCCCC] dark:transition-all dark:duration-150"
          >
            <CheckCircle className="h-4 w-4 mr-2 dark:group-data-[state=active]:text-[#4FF8E5] dark:text-[#CCCCCC]" />
            Best Quality
          </TabsTrigger>
          <TabsTrigger 
            value="value"
            className="dark:data-[state=active]:bg-[#252525] dark:data-[state=active]:text-[#4FF8E5] 
              dark:data-[state=active]:border dark:data-[state=active]:border-[#4FF8E5]/20
              dark:data-[state=active]:shadow-[0_0_6px_rgba(79,248,229,0.2)]
              dark:hover:border-[#4FF8E5]/20 dark:hover:bg-[#232323] 
              dark:text-[#CCCCCC] dark:transition-all dark:duration-150"
          >
            <DollarSign className="h-4 w-4 mr-2 dark:group-data-[state=active]:text-[#4FF8E5] dark:text-[#CCCCCC]" />
            Best Value
          </TabsTrigger>
          <TabsTrigger 
            value="speed"
            className="dark:data-[state=active]:bg-[#252525] dark:data-[state=active]:text-[#4FF8E5] 
              dark:data-[state=active]:border dark:data-[state=active]:border-[#4FF8E5]/20
              dark:data-[state=active]:shadow-[0_0_6px_rgba(79,248,229,0.2)]
              dark:hover:border-[#4FF8E5]/20 dark:hover:bg-[#232323] 
              dark:text-[#CCCCCC] dark:transition-all dark:duration-150"
          >
            <Clock className="h-4 w-4 mr-2 dark:group-data-[state=active]:text-[#4FF8E5] dark:text-[#CCCCCC]" />
            Fastest Response
          </TabsTrigger>
        </TabsList>

        <TabsContent value="quality" className="space-y-4">
          <ModelResultCard result={bestQuality} highlightType="quality" />
        </TabsContent>

        <TabsContent value="value" className="space-y-4">
          <ModelResultCard result={bestValue} highlightType="value" />
        </TabsContent>

        <TabsContent value="speed" className="space-y-4">
          <ModelResultCard result={fastest} highlightType="speed" />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface ModelResultCardProps {
  result: ModelResult;
  highlightType: "quality" | "value" | "speed";
}

function ModelResultCard({ result, highlightType }: ModelResultCardProps) {
  return (
    <Card className="dark:bg-[#232323] dark:border-[#2A2A2A] dark:shadow-[0_4px_12px_rgba(0,0,0,0.2)]">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center dark:text-[#E0E0E0]">
              {result.model}
              <Badge className="ml-2 text-xs dark:bg-transparent dark:text-[#4FF8E5] dark:border-[#4FF8E5]/20" variant="outline">
                {result.provider}
              </Badge>
            </CardTitle>
            <CardDescription className="dark:text-[#B0B0B0]">
              {highlightType === "quality"
                ? "Highest quality score"
                : highlightType === "value"
                  ? "Best cost-to-quality ratio"
                  : "Fastest response time"}
            </CardDescription>
          </div>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center">
              <span
                className={`font-medium ${
                  highlightType === "quality" 
                    ? "text-green-600 dark:text-[#4FF8E5]" 
                    : "text-gray-500 dark:text-[#B0B0B0]"
                }`}
              >
                Score: {result.score.toFixed(1)}
              </span>
            </div>
            <div className="flex items-center">
              <span
                className={`font-medium ${
                  highlightType === "value" 
                    ? "text-green-600 dark:text-[#4FF8E5]" 
                    : "text-gray-500 dark:text-[#B0B0B0]"
                }`}
              >
                ${result.cost.toFixed(5)}
              </span>
            </div>
            <div className="flex items-center">
              <span
                className={`font-medium ${
                  highlightType === "speed" 
                    ? "text-green-600 dark:text-[#4FF8E5]" 
                    : "text-gray-500 dark:text-[#B0B0B0]"
                }`}
              >
                {result.time}ms
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="bg-gray-50 p-4 rounded-md border border-gray-100 prompt-font text-sm max-h-40 overflow-y-auto dark:bg-[#1A1A1A] dark:border-[#2A2A2A] dark:text-[#E0E0E0]">
          {result.output}
        </div>
      </CardContent>
    </Card>
  );
}
