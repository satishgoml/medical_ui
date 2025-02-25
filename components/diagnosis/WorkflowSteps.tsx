import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserRound, Activity, FileText, Brain } from "lucide-react";

interface WorkflowStep {
  agent: string;
  response: string;
  timestamp: string;
  type?: string; // Add type to differentiate between plan and other steps
}

interface WorkflowStepsProps {
  steps: WorkflowStep[];
}

export function WorkflowSteps({ steps }: WorkflowStepsProps) {
  const getAgentIcon = (agent: string) => {
    switch (agent?.toLowerCase()) {
      case "doctor":
        return <UserRound className="h-5 w-5 text-blue-500" />;
      case "specialist":
        return <Activity className="h-5 w-5 text-green-500" />;
      case "researcher":
        return <FileText className="h-5 w-5 text-purple-500" />;
      case "medical_ai":
        return <Brain className="h-5 w-5 text-amber-500" />;
      default:
        return <UserRound className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-4">
      {steps.map((step, index) => (
        <Card key={index}>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="mt-1">
                {getAgentIcon(step.agent)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline">
                    {step.agent}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {new Date(step.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="prose prose-sm max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: step.response }} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}