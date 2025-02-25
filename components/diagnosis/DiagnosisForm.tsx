import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

interface DiagnosisFormProps {
  onSubmit: (input: string) => void;
  loading: boolean;
}

export function DiagnosisForm({ onSubmit, loading }: DiagnosisFormProps) {
  const [input, setInput] = useState<string>("");

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Medical Workflow Assistant</CardTitle>
        <CardDescription>
          Describe your symptoms or medical concerns for an AI-powered diagnosis.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Textarea
          placeholder="Describe your symptoms or medical concerns..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={4}
          className="resize-none"
        />
      </CardContent>
      <CardFooter className="flex justify-end">
        <div className="space-x-2">
          <Button 
            variant="outline" 
            onClick={() => setInput("")} 
            disabled={loading || !input}
          >
            Clear
          </Button>
          <Button 
            onClick={() => onSubmit(input)} 
            disabled={loading || !input}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Get Diagnosis'
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}