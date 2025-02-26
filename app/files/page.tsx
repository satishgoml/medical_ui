"use client"

import { useState, useEffect } from "react"
import { UploadCloud, FileIcon, Download, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"

// Use environment variable with fallback for API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export default function FilesPage() {
  const [files, setFiles] = useState<string[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>("")
  const [uploading, setUploading] = useState<boolean>(false)
  const [uploadSuccess, setUploadSuccess] = useState<string>("")

  useEffect(() => {
    fetchFiles()
  }, [])

  const fetchFiles = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/files/list`)
      const data = await response.json()
      
      if (Array.isArray(data)) {
        setFiles(data)
        setError("")
      } else if (data.error) {
        setError(data.error)
      }
    } catch (err) {
      setError("Failed to fetch files. Please check if the server is running.")
    } finally {
      setLoading(false)
    }
  }

  const downloadFile = (filename: string) => {
    window.open(`${API_URL}/files/${filename}`, '_blank')
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)
      setUploadSuccess("")
      setError("")
      
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch(`${API_URL}/files/upload`, {
        method: "POST",
        body: formData,
      })

      const result = await response.json()
      
      if (result.error) {
        setError(result.error)
      } else {
        setUploadSuccess(`Successfully uploaded ${result.filename}`)
        fetchFiles() // Refresh the file list
      }
    } catch (err) {
      setError("Failed to upload file. Please try again.")
    } finally {
      setUploading(false)
      // Clear the file input
      e.target.value = ""
    }
  }

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">File Management</h1>
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {uploadSuccess && (
        <Alert className="mb-4 bg-green-50 border-green-200">
          <AlertDescription className="text-green-700">{uploadSuccess}</AlertDescription>
        </Alert>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <UploadCloud className="w-5 h-5 mr-2" />
            Upload File
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Input
              type="file"
              onChange={handleFileUpload}
              disabled={uploading}
              className="max-w-md"
            />
            {uploading && <span className="text-sm text-muted-foreground">Uploading...</span>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileIcon className="w-5 h-5 mr-2" />
            Available Files
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : files.length > 0 ? (
            <div className="divide-y">
              {files.map((file, index) => (
                <div key={index} className="py-3 flex justify-between items-center">
                  <span className="truncate max-w-md">{file}</span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => downloadFile(file)}
                    className="flex items-center gap-1"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">
              No files available. Upload some files to get started.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="mt-4 text-sm text-muted-foreground">
        <p>Note: Files are stored in the server's data directory.</p>
      </div>
    </div>
  )
}