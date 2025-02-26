"use client"

import { useState, useEffect, useRef } from "react"
import { DiagnosisForm } from "@/components/diagnosis/DiagnosisForm"
import { AlertCircle, CheckCircle, Loader2, Download } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import ReactMarkdown from "react-markdown"
import "./markdown-styles.css"
import { useToast } from "@/hooks/use-toast"

// Use environment variable with fallback for API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

interface Message {
  type: "plan" | "error" | "end" | "general_diagnosis" | "plan_step"
  content: any
  timestamp: string
}

interface WorkflowStep {
  agent: string
  response?: string
  timestamp: string
  task: string
}

interface ExecutedStep {
  response: string
  agent_name: string
}

interface FinalReport {
  content: string
}

export default function MedicalWorkflowPage() {
  const [loading, setLoading] = useState<boolean>(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [currentWorkflow, setCurrentWorkflow] = useState<WorkflowStep[]>([])
  const [error, setError] = useState<string>("")
  const [generalDiagnosis, setGeneralDiagnosis] = useState<string>("")
  const [executedSteps, setExecutedSteps] = useState<ExecutedStep[]>([])
  const [finalReport, setFinalReport] = useState<FinalReport | null>(null)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const eventSourceRef = useRef<EventSource | null>(null)
  const { toast } = useToast()
  const loadingToastRef = useRef<{ id: string; dismiss: () => void } | null>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, executedSteps, finalReport])

  useEffect(() => {
    return () => {
      eventSourceRef.current?.close();
      if (loadingToastRef.current) {
        loadingToastRef.current.dismiss();
      }
    }
  }, [])

  const resetState = () => {
    setLoading(true)
    setMessages([])
    setCurrentWorkflow([])
    setError("")
    setGeneralDiagnosis("")
    setExecutedSteps([])
    setFinalReport(null)

    // Show loading toast
    if (loadingToastRef.current) {
      loadingToastRef.current.dismiss();
    }

    loadingToastRef.current = toast({
      title: "Processing",
      description: (
        <div className="flex items-center">
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          <span>Analyzing medical data...</span>
        </div>
      ),
      duration: Infinity,
    });
  }

  const processEventData = (data: any) => {
    if (data.event === "error") {
      setError(data.data)
      setLoading(false)

      // Dismiss the loading toast and show error
      if (loadingToastRef.current) {
        loadingToastRef.current.dismiss();
        toast({
          title: "Error",
          description: data.data,
          variant: "destructive",
        });
        loadingToastRef.current = null;
      }
    } else if (data.event === "end") {
      setLoading(false)

      // Dismiss the loading toast and show completion
      if (loadingToastRef.current) {
        loadingToastRef.current.dismiss();
        toast({
          title: "Diagnosis Complete",
          description: "The medical workflow has been completed successfully.",
          variant: "default",
        });
        loadingToastRef.current = null;
      }
    } else if (data.event === "general_diagnosis") {
      setGeneralDiagnosis(data.data.intial_diagnosis)

      // Update loading toast with progress
      if (loadingToastRef.current) {
        loadingToastRef.current.dismiss();
        loadingToastRef.current = toast({
          title: "Processing",
          description: (
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              <span>Initial diagnosis completed. Continuing analysis...</span>
            </div>
          ),
          duration: Infinity,
        });
      }
    } else if (data.event === "plan_step") {
      const steps = data.data.plan.steps.map((step: any) => ({
        agent: step.agent,
        task: step.task,
        timestamp: new Date().toISOString(),
      }))
      setCurrentWorkflow(steps)

      // Update loading toast with plan progress
      if (loadingToastRef.current) {
        loadingToastRef.current.dismiss();
        loadingToastRef.current = toast({
          title: "Processing",
          description: (
            <div className="flex items-center">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              <span>Medical workflow plan updated. Processing steps...</span>
            </div>
          ),
          duration: Infinity,
        });
      }
    } else if (data.event === "replan") {
      console.log(data.data)
      // Handle replan event
      if (data.data.plan && data.data.plan.steps) {
        // Update the workflow plan if steps are provided
        const steps = data.data.plan.steps.map((step: any) => ({
          agent: step.agent,
          task: step.task,
          timestamp: new Date().toISOString(),
        }))
        setCurrentWorkflow(steps)

        // Update loading toast with replan progress
        if (loadingToastRef.current) {
          loadingToastRef.current.dismiss();
          loadingToastRef.current = toast({
            title: "Processing",
            description: (
              <div className="flex items-center">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                <span>Medical workflow plan has been updated. Continuing with new steps...</span>
              </div>
            ),
            duration: Infinity,
          });
        }
      } else if (data.data.response && data.data.response.stop_reason) {
        // No plan update, just show the message
        toast({
          title: "Plan Update",
          description: data.data.response.stop_reason || "No changes to the current plan.",
          variant: "default",
        });
      }
    } else if (data.event === "execute_step") {
      setExecutedSteps((prevSteps) => [...prevSteps, data.data.response])

      // Update loading toast with step progress
      if (loadingToastRef.current) {
        loadingToastRef.current.dismiss();
        loadingToastRef.current = toast({
          title: "Processing",
          description: (
            <div className="flex items-center">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              <span>{capitalizeAgentName(data.data.response.agent_name)} analysis completed. Continuing workflow...</span>
            </div>
          ),
          duration: Infinity,
        });
      }
    } else if (data.event === "final_report") {
      // Handle final report event
      const reportData = data.data.response || data.data;
      setFinalReport({
        content: reportData
      });

      // Update loading toast with final report notification
      if (loadingToastRef.current) {
        loadingToastRef.current.dismiss();
        toast({
          title: "Final Report Ready",
          description: "Medical assessment and recommendations are now available.",
          variant: "default",
        });
        loadingToastRef.current = null;
      }
    }
  }

  const startDiagnosis = (input: string) => {
    if (!input.trim()) return
    resetState()

    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }

    const url = `${API_URL}/medical/diagnose?input=${encodeURIComponent(input)}`
    const eventSource = new EventSource(url)
    eventSourceRef.current = eventSource

    eventSource.onmessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data)
        processEventData(data)

        if (data.event === "end") {
          eventSource.close()
          eventSourceRef.current = null
        }
      } catch (err) {
        setError("Error processing server response")
        setLoading(false)

        // Dismiss loading toast and show error
        if (loadingToastRef.current) {
          loadingToastRef.current.dismiss();
          toast({
            title: "Error",
            description: "Error processing server response",
            variant: "destructive",
          });
          loadingToastRef.current = null;
        }
      }
    }

    eventSource.onerror = (event) => {
      console.log(event)
      setError(`Connection error: ${event}. Please try again.`)
      setLoading(false)
      eventSource.close()
      eventSourceRef.current = null

      // Dismiss loading toast and show error
      if (loadingToastRef.current) {
        loadingToastRef.current.dismiss();
        toast({
          title: "Connection Error",
          description: "Failed to connect to the server. Please try again.",
          variant: "destructive",
        });
        loadingToastRef.current = null;
      }
    }
  }

  const capitalizeAgentName = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  const downloadReport = () => {
    if (!finalReport) return;

    // Create a blob and download it
    const blob = new Blob([finalReport.content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `medical_report_${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);

    toast({
      title: "Report Downloaded",
      description: "Medical report has been downloaded successfully.",
      variant: "default",
    });
  };

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <DiagnosisForm onSubmit={startDiagnosis} loading={loading} />

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="mb-4">
        <CardContent className="p-4">
          <h2 className="text-xl font-bold mb-2">Initial Diagnosis</h2>
          {loading && !generalDiagnosis ? (
            <Skeleton className="w-full h-20" />
          ) : generalDiagnosis ? (
            <div className="markdown-content">
              <ReactMarkdown>{generalDiagnosis}</ReactMarkdown>
            </div>
          ) : (
            <p className="text-muted-foreground">No diagnosis available yet.</p>
          )}
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardContent className="p-4">
          <h2 className="text-xl font-bold mb-2">Plan Steps</h2>
          {loading && currentWorkflow.length === 0 ? (
            <Skeleton className="w-full h-20" />
          ) : currentWorkflow.length > 0 ? (
            <ul className="list-disc pl-5">
              {currentWorkflow.map((step, index) => (
                <li key={index} className="mb-2">
                  <strong>{capitalizeAgentName(step.agent)}:</strong> {step.task}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">No plan steps available yet.</p>
          )}
        </CardContent>
      </Card>

      <h2 className="text-xl font-bold mb-2">Executed Steps</h2>
      {loading && executedSteps.length === 0 ? (
        <Card className="mb-4">
          <CardContent className="p-4">
            <Skeleton className="w-full h-20" />
          </CardContent>
        </Card>
      ) : executedSteps.length > 0 ? (
        executedSteps.map((step, index) => (
          <Card key={index} className="mb-4">
            <CardContent className="p-4">
              <strong className="text-lg">{capitalizeAgentName(step.agent_name)}:</strong>
              <div className="markdown-content mt-2">
                <ReactMarkdown>{step.response}</ReactMarkdown>
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <Card className="mb-4">
          <CardContent className="p-4">
            <p className="text-muted-foreground">No executed steps available yet.</p>
          </CardContent>
        </Card>
      )}

      {finalReport && (
        <Card className="mb-4 border-2 border-primary">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Final Medical Report</h2>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={downloadReport}
              >
                <Download className="h-4 w-4" />
                <span>Download</span>
              </Button>
            </div>

            <div className="markdown-content">
              <ReactMarkdown>{finalReport.content}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}

      <div ref={messagesEndRef} />
    </div>
  )
}

