import { CyclingText } from "@/components/cycling-text";
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
  const llmTasks = [
    taskCategory
  ];

  return (
    <div className="bg-gradient-to-b from-blue-50 to-white py-10 px-4 rounded-xl border border-blue-100">
      <div className="text-center mb-8">
        <p className="text-gray-600 text-left max-w-2xl">
          Here's how different models performed on this{" "}
          <span className="font-medium text-primary">{taskCategory.toLowerCase()}</span> prompt.
        </p>
        
        {/* Display business value section if available */}
        {businessValue && (
          <div className="bg-green-50 border border-green-100 rounded-lg p-4 mt-4 text-left">
            <h3 className="text-base font-semibold text-green-800 mb-1">Business Impact</h3>
            <p className="text-sm text-gray-700">{businessValue.description}</p>
            <div className="mt-2 inline-block bg-white px-3 py-1 rounded-full border border-green-200">
              <p className="text-sm font-medium text-green-700">{businessValue.metric}</p>
            </div>
          </div>
        )}
      </div>

      <div className="mb-6">
        <Card className="bg-gray-50 border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Prompt of the Day</CardTitle>
            <CardDescription>
              Example prompt for {taskCategory.toLowerCase()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-white p-4 rounded-md border border-gray-200 prompt-font text-sm">
              {promptText}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="quality" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="quality">
            <CheckCircle className="h-4 w-4 mr-2" />
            Best Quality
          </TabsTrigger>
          <TabsTrigger value="value">
            <DollarSign className="h-4 w-4 mr-2" />
            Best Value
          </TabsTrigger>
          <TabsTrigger value="speed">
            <Clock className="h-4 w-4 mr-2" />
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
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center">
              {result.model}
              <Badge className="ml-2 text-xs" variant="outline">
                {result.provider}
              </Badge>
            </CardTitle>
            <CardDescription>
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
                className={`font-medium ${highlightType === "quality" ? "text-green-600" : "text-gray-500"}`}
              >
                Score: {result.score.toFixed(1)}
              </span>
            </div>
            <div className="flex items-center">
              <span
                className={`font-medium ${highlightType === "value" ? "text-green-600" : "text-gray-500"}`}
              >
                ${result.cost.toFixed(5)}
              </span>
            </div>
            <div className="flex items-center">
              <span
                className={`font-medium ${highlightType === "speed" ? "text-green-600" : "text-gray-500"}`}
              >
                {result.time}ms
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="bg-gray-50 p-4 rounded-md border border-gray-100 prompt-font text-sm max-h-40 overflow-y-auto">
          {result.output}
        </div>
      </CardContent>
    </Card>
  );
}
