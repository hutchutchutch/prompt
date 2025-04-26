import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";

// This is a static component for the landing page
// In a real implementation, this would fetch data from an API
export default function PromptOfDay() {
  const { user } = useAuth();
  
  return (
    <div className="my-16 bg-white rounded-lg shadow-md overflow-hidden max-w-4xl mx-auto">
      <CardHeader className="px-6 py-4 bg-primary text-white">
        <CardTitle className="text-xl font-semibold">Prompt of the Day</CardTitle>
      </CardHeader>
      
      <CardContent className="px-6 py-4">
        <div className="prompt-font text-sm bg-gray-50 p-4 rounded border border-gray-200 mb-4">
          <p>You are a customer support agent for a SaaS product called CloudTrack. Respond to the following customer query about their invoice:</p>
          <p className="mt-2 italic">"I was charged $59.99 this month but my plan is supposed to be $49.99. Can you explain the discrepancy and refund the difference?"</p>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between">
          <div>
            <span className="font-medium">Best model: </span>
            <span className="text-primary">GPT-4 Turbo</span>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
            <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
              Quality: 9.2/10
            </Badge>
            <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
              Speed: 1.2s
            </Badge>
            <Badge variant="outline" className="bg-purple-100 text-purple-800 hover:bg-purple-100">
              Cost: $0.09
            </Badge>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="px-6 py-3 bg-gray-50 border-t border-gray-200">
        <Button variant="link" className="text-sm p-0 h-auto text-primary" asChild>
          <Link href={user ? "/wizard" : "/auth"}>
            Run with your settings →
          </Link>
        </Button>
      </CardFooter>
    </div>
  );
}
