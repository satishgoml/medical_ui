"use client"

import { useState, useEffect, useRef } from "react"
import { DiagnosisForm } from "@/components/diagnosis/DiagnosisForm"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import ReactMarkdown from "react-markdown"
import "./markdown-styles.css"

const API_URL = "http://localhost:8000"

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

export default function MedicalWorkflowPage() {
  const [loading, setLoading] = useState<boolean>(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [currentWorkflow, setCurrentWorkflow] = useState<WorkflowStep[]>([])
  const [error, setError] = useState<string>("")
  const [generalDiagnosis, setGeneralDiagnosis] = useState<string>("")
  const [executedSteps, setExecutedSteps] = useState<ExecutedStep[]>([])
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const eventSourceRef = useRef<EventSource | null>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    return () => eventSourceRef.current?.close()
  }, [])

  const resetState = () => {
    setLoading(true)
    setMessages([])
    setCurrentWorkflow([])
    setError("")
    setGeneralDiagnosis("")
    setExecutedSteps([])
  }

  const processEventData = (data: any) => {
    if (data.event === "error") {
      setError(data.data)
      setLoading(false)
    } else if (data.event === "end") {
      setLoading(false)
    } else if (data.event === "general_diagnosis") {
      setGeneralDiagnosis(data.data.intial_diagnosis)
    } else if (data.event === "plan_step") {
      const steps = data.data.plan.steps.map((step: any) => ({
        agent: step.agent,
        task: step.task,
        timestamp: new Date().toISOString(),
      }))
      setCurrentWorkflow(steps)
    } else if (data.event === "execute_step") {
      setExecutedSteps((prevSteps) => [...prevSteps, data.data.response])
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
      }
    }

    eventSource.onerror = () => {
      setError("Connection error. Please try again.")
      setLoading(false)
      eventSource.close()
      eventSourceRef.current = null
    }
  }

  const capitalizeAgentName = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

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

      <div ref={messagesEndRef} />
    </div>
  )
}

