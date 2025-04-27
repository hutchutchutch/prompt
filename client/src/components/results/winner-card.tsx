import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Trophy, Check, AlertTriangle, XCircle } from "lucide-react";

interface WinnerCardProps {
  promptName: string;
  modelName: string;
  variantName: string;
  quality: number;
  cost: number;
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
  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-2 border-blue-100 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center">
            <Trophy className="h-5 w-5 text-yellow-500 mr-2" />
            <h2 className="text-lg font-semibold text-blue-900">
              Best result: <span className="font-bold text-primary">{modelName} ({variantName})</span>
            </h2>
          </div>
          
          <p className="mt-1 text-sm text-gray-600 ml-7">
            Top performer based on quality score and overall efficiency
          </p>
          
          <div className="flex flex-wrap gap-2 mt-4 ml-7">
            <Badge className="bg-blue-100 text-blue-800 border-blue-200 flex items-center">
              <span className="text-xs mr-1">Quality:</span> 
              <span className="font-semibold">{quality.toFixed(1)}</span>
            </Badge>
            
            <Badge className="bg-green-100 text-green-800 border-green-200 flex items-center">
              <span className="text-xs mr-1">Cost:</span> 
              <span className="font-semibold">${cost.toFixed(4)}</span>
            </Badge>
            
            <Badge className="bg-purple-100 text-purple-800 border-purple-200 flex items-center">
              <span className="text-xs mr-1">Speed:</span> 
              <span className="font-semibold">{(speed / 1000).toFixed(1)}s</span>
            </Badge>
            
            {vulnStatus === 'safe' && (
              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 flex items-center">
                <Check className="h-3 w-3 mr-1" />
                <span className="font-semibold">Safe</span>
              </Badge>
            )}
            
            {vulnStatus === 'partial' && (
              <Badge className="bg-amber-100 text-amber-800 border-amber-200 flex items-center">
                <AlertTriangle className="h-3 w-3 mr-1" />
                <span className="font-semibold">Caution</span>
              </Badge>
            )}
            
            {vulnStatus === 'failed' && (
              <Badge className="bg-red-100 text-red-800 border-red-200 flex items-center">
                <XCircle className="h-3 w-3 mr-1" />
                <span className="font-semibold">Vulnerable</span>
              </Badge>
            )}
          </div>
        </div>
        
        <div className="bg-white rounded-full p-3 shadow-sm border border-blue-100">
          <Trophy className="h-7 w-7 text-yellow-500" aria-hidden="true" />
        </div>
      </div>
    </Card>
  );
}