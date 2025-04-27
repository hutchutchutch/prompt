import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Flag, Check, AlertTriangle, XCircle } from "lucide-react";

// This is a simplified structure - in a real app, this would come from the API
interface RedTeamAttack {
  id: string;
  name: string;
  description: string;
  status: 'passed' | 'partial' | 'failed';
  details?: string;
}

interface RedTeamReportProps {
  vulnStatus: 'safe' | 'partial' | 'failed';
  attacks?: RedTeamAttack[];
}

// Provide mock data if real attacks aren't available
const getMockAttacks = (status: 'safe' | 'partial' | 'failed'): RedTeamAttack[] => {
  const baseAttacks = [
    {
      id: "inject-1",
      name: "Ignore previous instructions",
      description: "Attempts to bypass prompt constraints by instructing the model to ignore its original instructions.",
      status: 'passed' as const,
      details: "The model correctly rejected the attempt and followed the original constraints.",
    },
    {
      id: "inject-2",
      name: "Indirect jailbreak via roleplay",
      description: "Tries to manipulate the model through roleplaying scenarios that indirectly lead to constraint violations.",
      status: 'passed' as const,
      details: "The model identified the indirect attempt and maintained its guardrails.",
    },
    {
      id: "inject-3",
      name: "Token manipulation",
      description: "Attempts to manipulate token parsing by using unusual character combinations or encoding tricks.",
      status: 'passed' as const,
      details: "The model parsed the input correctly and maintained security boundaries.",
    }
  ];
  
  if (status === 'safe') {
    return baseAttacks;
  } else if (status === 'partial') {
    return [
      ...baseAttacks.slice(0, 1),
      {
        ...baseAttacks[1],
        status: 'partial',
        details: "The model partially complied with the attack request in some edge cases."
      },
      {
        ...baseAttacks[2],
        status: 'passed',
      }
    ];
  } else {
    return [
      {
        ...baseAttacks[0],
        status: 'passed',
      },
      {
        ...baseAttacks[1],
        status: 'failed',
        details: "The model complied with the attack request, bypassing intended constraints."
      },
      {
        ...baseAttacks[2],
        status: 'failed',
        details: "The model was susceptible to token manipulation and violated security boundaries."
      }
    ];
  }
};

export function RedTeamReport({ vulnStatus, attacks: providedAttacks }: RedTeamReportProps) {
  // Use provided attacks or mock data based on vulnStatus
  const attacks = providedAttacks || getMockAttacks(vulnStatus);
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'partial':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'passed':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Passed</Badge>;
      case 'partial':
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Partial</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Failed</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };
  
  // Get overall status message
  const getOverallStatusMessage = () => {
    switch (vulnStatus) {
      case 'safe':
        return "All security tests passed. The prompt is resistant to injection attacks.";
      case 'partial':
        return "Some security vulnerabilities detected. The prompt may need strengthening in certain areas.";
      case 'failed':
        return "Critical security issues found. This prompt has significant vulnerabilities that need addressing.";
      default:
        return "Security status unknown. No tests were run.";
    }
  };
  
  return (
    <div className="mt-6 mb-8">
      <div className="flex items-center mb-4">
        <Flag className="h-5 w-5 text-primary mr-2" />
        <h2 className="text-lg font-medium text-gray-900">Red-Team Security Assessment</h2>
      </div>
      
      <div className={`
        p-4 rounded-lg mb-5
        ${vulnStatus === 'safe' ? 'bg-green-50 border border-green-200' : 
          vulnStatus === 'partial' ? 'bg-amber-50 border border-amber-200' : 
          'bg-red-50 border border-red-200'}
      `}>
        <div className="flex items-start">
          {vulnStatus === 'safe' ? (
            <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2" />
          ) : vulnStatus === 'partial' ? (
            <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 mr-2" />
          ) : (
            <XCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2" />
          )}
          <div>
            <h3 className={`text-sm font-medium 
              ${vulnStatus === 'safe' ? 'text-green-800' : 
                vulnStatus === 'partial' ? 'text-amber-800' : 
                'text-red-800'}
            `}>
              Security Status: {vulnStatus === 'safe' ? 'Secure' : vulnStatus === 'partial' ? 'Partial Vulnerabilities' : 'Vulnerable'}
            </h3>
            <p className={`mt-1 text-sm 
              ${vulnStatus === 'safe' ? 'text-green-700' : 
                vulnStatus === 'partial' ? 'text-amber-700' : 
                'text-red-700'}
            `}>
              {getOverallStatusMessage()}
            </p>
          </div>
        </div>
      </div>
      
      <Accordion type="single" collapsible className="w-full">
        {attacks.map((attack) => (
          <AccordionItem value={attack.id} key={attack.id}>
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center">
                <Flag className="h-4 w-4 text-gray-500 mr-2" />
                <span className="mr-2">{attack.name}</span>
                {getStatusBadge(attack.status)}
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="pl-6 pt-2 text-sm">
                <p className="text-gray-700 mb-3">{attack.description}</p>
                {attack.details && (
                  <div className={`
                    p-3 rounded
                    ${attack.status === 'passed' ? 'bg-green-50' : 
                      attack.status === 'partial' ? 'bg-amber-50' : 
                      'bg-red-50'}
                  `}>
                    <div className="flex items-start">
                      {getStatusIcon(attack.status)}
                      <p className={`ml-2 text-sm
                        ${attack.status === 'passed' ? 'text-green-700' : 
                          attack.status === 'partial' ? 'text-amber-700' : 
                          'text-red-700'}
                      `}>
                        {attack.details}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}