import { Trophy, Clock, Star, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface WinnerCardProps {
  promptName: string;
  modelName: string;
  variantName: string;
  quality: number | null;
  cost: number | null;
  speed: number;
  vulnStatus: 'safe' | 'partial' | 'failed';
}

export function WinnerCard({ 
  promptName, 
  modelName, 
  variantName, 
  quality, 
  cost, 
  speed,
  vulnStatus
}: WinnerCardProps) {
  
  // Format speed value (showing in ms or s)
  const formattedSpeed = speed >= 1000 
    ? `${(speed / 1000).toFixed(1)}s`
    : `${Math.round(speed)}ms`;
    
  // Format cost (divide by 1M to get actual USD)
  const formattedCost = cost ? `$${(cost / 1000000).toFixed(5)}` : "$0.00000";
  
  return (
    <Card className="bg-gradient-to-br from-blue-50 via-white to-blue-50 border-blue-200 shadow-md overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center">
              <Trophy className="h-6 w-6 text-amber-500 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Best Performing Model</h2>
            </div>
            
            <div className="mt-1 mb-4">
              <p className="text-sm text-gray-500">
                For prompt: <span className="font-medium text-gray-700">"{promptName}..."</span>
              </p>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm">
              <div className="flex items-center mb-2">
                <h3 className="text-lg font-medium text-gray-900">{modelName}</h3>
                <Badge className="ml-2">{variantName}</Badge>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="flex items-start">
                  <Star className="h-5 w-5 text-amber-500 mt-0.5 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Quality</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {quality?.toFixed(1) || "0.0"}<span className="text-xs text-gray-500">/10</span>
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Clock className="h-5 w-5 text-blue-500 mt-0.5 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Speed</p>
                    <p className="text-lg font-semibold text-gray-900">{formattedSpeed}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  {vulnStatus === 'safe' ? (
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2" />
                  ) : vulnStatus === 'partial' ? (
                    <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 mr-2" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2" />
                  )}
                  <div>
                    <p className="text-sm text-gray-500">Security</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {vulnStatus === 'safe' ? 'Secure' : 
                       vulnStatus === 'partial' ? 'Partial' : 'At Risk'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center ml-6 border-l border-gray-200 pl-6">
            <p className="text-sm text-gray-500 mb-1">Cost</p>
            <p className="text-2xl font-bold text-gray-900">{formattedCost}</p>
            <p className="text-xs text-gray-500">per request</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}