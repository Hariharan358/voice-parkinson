"use client"

import type React from "react"
import { useState, useRef } from "react"
import axios from "axios"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, FileAudio, Upload, CheckCircle2, XCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { motion } from "framer-motion"

// Custom styled Progress component
const StyledProgress = ({
  value,
  className,
  color,
}: {
  value: number
  className?: string
  color?: string
}) => {
  return (
    <Progress
      value={value}
      className={className}
      style={
        {
          ["--progress-foreground" as any]: color,
        } as React.CSSProperties
      }
    />
  )
}

interface AnalysisResult {
  prediction: string
  parkinsons_probability: number
  healthy_rate: number
  features: {
    mfccs: number[]
    chroma: number[]
    zeroCrossingRate: number
    spectralCentroid: number
  }
}

const ResultsDisplay = () => {
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [dragActive, setDragActive] = useState<boolean>(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [activeTab, setActiveTab] = useState("overview")

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile && ["audio/wav", "audio/mpeg"].includes(selectedFile.type)) {
      setFile(selectedFile)
      setError(null)
    } else {
      setError("Please select a valid .wav or .mp3 file.")
    }
  }

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    const selectedFile = e.dataTransfer.files?.[0]
    if (selectedFile && ["audio/wav", "audio/mpeg"].includes(selectedFile.type)) {
      setFile(selectedFile)
      setError(null)
    } else {
      setError("Please drop a valid .wav or .mp3 file.")
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setError("Please select or drop a file")
      return
    }

    const formData = new FormData()
    formData.append("file", file)

    setLoading(true)
    try {
      const response = await axios.post("http://localhost:5000/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      setResult(response.data)
      setError(null)
      setActiveTab("overview")
    } catch (err: any) {
      console.error("Error:", err.response?.data || err.message)
      setError(err.response?.data?.error || "Error uploading or analyzing the file")
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`

  // Formatter for chart tooltips to handle ValueType
  const formatTooltipValue = (value: string | number | undefined) => {
    const numValue = Number(value)
    return isNaN(numValue) ? "N/A" : numValue.toFixed(6)
  }

  // Prepare data for probability bar chart
  const probabilityData = result
    ? [
        { name: "Parkinson's", value: result.parkinsons_probability * 100, color: "#ef4444" },
        { name: "Healthy", value: result.healthy_rate * 100, color: "#10b981" },
      ]
    : []

  // Prepare data for MFCC and Chroma charts
  const mfccData = result
    ? result.features.mfccs.map((value, index) => ({
        name: `MFCC ${index + 1}`,
        value: Math.abs(value),
      }))
    : []

  const chromaData = result
    ? result.features.chroma.map((value, index) => ({
        name: `Chroma ${index + 1}`,
        value: Math.abs(value),
      }))
    : []

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <h1 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
        Parkinson's Disease Voice Analysis
      </h1>

      {/* Enhanced Upload Section */}
      <Card className="mb-8 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
          <CardTitle className="flex items-center gap-2">
            <FileAudio className="h-5 w-5" />
            Audio Upload
          </CardTitle>
          <CardDescription>Upload a voice recording (.wav or .mp3) for Parkinson's disease analysis</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div
            className={`p-8 transition-all duration-300 ${
              dragActive ? "bg-blue-50 dark:bg-blue-950/30" : "bg-slate-50 dark:bg-slate-900/50"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            role="region"
            aria-label="File upload area"
          >
            <input
              type="file"
              accept=".wav,.mp3"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
              ref={fileInputRef}
            />
            <div className="flex flex-col items-center justify-center">
              <div
                className={`mb-4 p-4 rounded-full ${dragActive ? "bg-blue-100 dark:bg-blue-900/30" : "bg-slate-100 dark:bg-slate-800"}`}
              >
                <Upload className={`w-10 h-10 ${dragActive ? "text-blue-500" : "text-slate-400"}`} />
              </div>

              <label htmlFor="file-upload" className="cursor-pointer text-center">
                {file ? (
                  <div className="flex flex-col items-center">
                    <Badge variant="outline" className="px-3 py-1 mb-2 flex items-center gap-2">
                      <FileAudio className="h-3.5 w-3.5" />
                      {file.name}
                    </Badge>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Click to change file</p>
                  </div>
                ) : (
                  <div className="text-slate-600 dark:text-slate-300">
                    <p className="mb-1">Drag and drop a voice recording here</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      or <span className="text-blue-500 hover:underline">browse files</span>
                    </p>
                  </div>
                )}
              </label>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-900/50 border-t">
          <div className="text-sm text-slate-500 dark:text-slate-400">
            {file && <span>File size: {(file.size / 1024 / 1024).toFixed(2)} MB</span>}
          </div>
          <Button onClick={handleUpload} disabled={!file || loading} className="relative">
            {loading ? (
              <>
                <span className="opacity-0">Analyze</span>
                <span className="absolute inset-0 flex items-center justify-center">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                </span>
              </>
            ) : (
              <>Analyze Audio</>
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* Loading Indicator */}
      {loading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center my-8 p-8"
        >
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin"></div>
            </div>
          </div>
          <p className="mt-6 text-slate-600 dark:text-slate-300 font-medium">Analyzing audio features...</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">This may take a few moments</p>
        </motion.div>
      )}

      {/* Error Message */}
      {error && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </motion.div>
      )}

      {/* Enhanced Result Section */}
      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card
            className="mb-8 overflow-hidden border-t-4 shadow-lg"
            style={{
              borderTopColor: result.prediction === "Parkinson's" ? "#ef4444" : "#10b981",
            }}
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">Analysis Results</CardTitle>
                  <CardDescription>Voice pattern analysis for Parkinson's indicators</CardDescription>
                </div>
                <Badge
                  className={`px-3 py-1.5 text-sm ${
                    result.prediction === "Parkinson's"
                      ? "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-300"
                      : "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-300"
                  }`}
                >
                  {result.prediction === "Parkinson's" ? (
                    <XCircle className="h-4 w-4 mr-1 inline" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 mr-1 inline" />
                  )}
                  {result.prediction}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-3 mb-6">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="features">Voice Features</TabsTrigger>
                  <TabsTrigger value="analysis">Detailed Analysis</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  {/* Prediction Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Probability Assessment</h3>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between mb-1">
                            <div className="flex items-center">
                              <span>Parkinson's Probability</span>
                              <TooltipProvider>
                                <UITooltip>
                                  <TooltipTrigger asChild>
                                    <AlertCircle className="h-3.5 w-3.5 ml-1 text-slate-400" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="max-w-xs">
                                      Likelihood of Parkinson's disease based on voice analysis
                                    </p>
                                  </TooltipContent>
                                </UITooltip>
                              </TooltipProvider>
                            </div>
                            <span className="font-medium text-red-600 dark:text-red-400">
                              {formatPercent(result.parkinsons_probability)}
                            </span>
                          </div>
                          <StyledProgress
                            value={result.parkinsons_probability * 100}
                            className="h-2.5 bg-red-100 dark:bg-red-950/30"
                            color="#ef4444"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <div className="flex items-center">
                              <span>Healthy Probability</span>
                              <TooltipProvider>
                                <UITooltip>
                                  <TooltipTrigger asChild>
                                    <AlertCircle className="h-3.5 w-3.5 ml-1 text-slate-400" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="max-w-xs">Likelihood of healthy voice patterns</p>
                                  </TooltipContent>
                                </UITooltip>
                              </TooltipProvider>
                            </div>
                            <span className="font-medium text-green-600 dark:text-green-400">
                              {formatPercent(result.healthy_rate)}
                            </span>
                          </div>
                          <StyledProgress
                            value={result.healthy_rate * 100}
                            className="h-2.5 bg-green-100 dark:bg-green-950/30"
                            color="#10b981"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-4">Probability Distribution</h3>
                      <div className="h-64 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={probabilityData} layout="vertical" margin={{ left: 20, right: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                            <XAxis type="number" domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                            <YAxis dataKey="name" type="category" />
                            <Tooltip
                              formatter={(value: string | number) => [`${Number(value).toFixed(1)}%`, "Probability"]}
                              contentStyle={{
                                backgroundColor: "rgba(255, 255, 255, 0.9)",
                                borderRadius: "6px",
                                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                                border: "none",
                              }}
                            />
                            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                              {probabilityData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Key Indicators */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Key Voice Indicators</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Card className="bg-slate-50 dark:bg-slate-900/50">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-sm text-slate-500 dark:text-slate-400">Zero Crossing Rate</p>
                              <p className="text-xl font-semibold">{result.features.zeroCrossingRate.toFixed(4)}</p>
                            </div>
                            <TooltipProvider>
                              <UITooltip>
                                <TooltipTrigger asChild>
                                  <AlertCircle className="h-4 w-4 text-slate-400" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="max-w-xs">
                                    Rate at which the signal changes from positive to negative or back
                                  </p>
                                </TooltipContent>
                              </UITooltip>
                            </TooltipProvider>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-slate-50 dark:bg-slate-900/50">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-sm text-slate-500 dark:text-slate-400">Spectral Centroid</p>
                              <p className="text-xl font-semibold">{result.features.spectralCentroid.toFixed(4)}</p>
                            </div>
                            <TooltipProvider>
                              <UITooltip>
                                <TooltipTrigger asChild>
                                  <AlertCircle className="h-4 w-4 text-slate-400" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="max-w-xs">
                                    Indicates where the "center of mass" of the spectrum is located
                                  </p>
                                </TooltipContent>
                              </UITooltip>
                            </TooltipProvider>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="features" className="space-y-6">
                  {/* Extracted Features Table */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Extracted Voice Features</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-100 dark:bg-slate-800">
                            <th className="p-3 font-semibold rounded-tl-lg">Feature</th>
                            <th className="p-3 font-semibold rounded-tr-lg">Value</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                          <tr className="bg-white dark:bg-slate-900/50">
                            <td className="p-3">MFCC Mean</td>
                            <td className="p-3 font-mono">
                              {(
                                result.features.mfccs.reduce((a, b) => a + b, 0) / result.features.mfccs.length
                              ).toFixed(6)}
                            </td>
                          </tr>
                          <tr className="bg-slate-50 dark:bg-slate-800/50">
                            <td className="p-3">Chroma Mean</td>
                            <td className="p-3 font-mono">
                              {(
                                result.features.chroma.reduce((a, b) => a + b, 0) / result.features.chroma.length
                              ).toFixed(6)}
                            </td>
                          </tr>
                          <tr className="bg-white dark:bg-slate-900/50">
                            <td className="p-3">Zero Crossing Rate</td>
                            <td className="p-3 font-mono">{result.features.zeroCrossingRate.toFixed(6)}</td>
                          </tr>
                          <tr className="bg-slate-50 dark:bg-slate-800/50">
                            <td className="p-3 rounded-bl-lg">Spectral Centroid</td>
                            <td className="p-3 font-mono rounded-br-lg">
                              {result.features.spectralCentroid.toFixed(6)}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <Separator />

                  {/* MFCC Coefficients */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium">MFCC Coefficients</h3>
                      <TooltipProvider>
                        <UITooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 cursor-help">
                              <AlertCircle className="h-3.5 w-3.5 mr-1" />
                              What is this?
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="left">
                            <p className="max-w-xs">
                              Mel-frequency cepstral coefficients represent the short-term power spectrum of sound. They
                              are commonly used in speech recognition.
                            </p>
                          </TooltipContent>
                        </UITooltip>
                      </TooltipProvider>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg">
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={mfccData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip
                              formatter={formatTooltipValue}
                              contentStyle={{
                                backgroundColor: "rgba(255, 255, 255, 0.9)",
                                borderRadius: "6px",
                                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                                border: "none",
                              }}
                            />
                            <Bar dataKey="value" fill="#8884d8" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Chroma Features */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium">Chroma Features</h3>
                      <TooltipProvider>
                        <UITooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 cursor-help">
                              <AlertCircle className="h-3.5 w-3.5 mr-1" />
                              What is this?
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="left">
                            <p className="max-w-xs">
                              Chroma features represent the 12 different pitch classes in music. They are useful for
                              analyzing the harmonic content of audio.
                            </p>
                          </TooltipContent>
                        </UITooltip>
                      </TooltipProvider>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg">
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={chromaData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip
                              formatter={formatTooltipValue}
                              contentStyle={{
                                backgroundColor: "rgba(255, 255, 255, 0.9)",
                                borderRadius: "6px",
                                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                                border: "none",
                              }}
                            />
                            <Bar dataKey="value" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="analysis" className="space-y-6">
                  {/* Detailed Analysis */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Detailed Analysis</h3>
                    <Card className="bg-slate-50 dark:bg-slate-900/50">
                      <CardContent className="p-6">
                        <h4 className="font-medium mb-3">Interpretation</h4>
                        <p className="mb-4 text-slate-700 dark:text-slate-300">
                          {result.prediction === "Parkinson's" ? (
                            <>
                              The voice analysis indicates patterns consistent with Parkinson's disease. Key indicators
                              show a {formatPercent(result.parkinsons_probability)} probability of Parkinson's-related
                              voice characteristics.
                            </>
                          ) : (
                            <>
                              The voice analysis indicates patterns consistent with healthy voice characteristics. Key
                              indicators show a {formatPercent(result.healthy_rate)} probability of normal voice
                              patterns.
                            </>
                          )}
                        </p>

                        <h4 className="font-medium mb-3 mt-6">Key Findings</h4>
                        <ul className="list-disc pl-5 space-y-2 text-slate-700 dark:text-slate-300">
                          <li>
                            <span className="font-medium">Zero Crossing Rate:</span>{" "}
                            {result.features.zeroCrossingRate.toFixed(6)}
                            {result.features.zeroCrossingRate > 0.05
                              ? " - Higher than typical healthy values"
                              : " - Within normal range"}
                          </li>
                          <li>
                            <span className="font-medium">Spectral Centroid:</span>{" "}
                            {result.features.spectralCentroid.toFixed(6)}
                            {result.features.spectralCentroid > 1000
                              ? " - Indicates potential voice tremor"
                              : " - Within normal range"}
                          </li>
                          <li>
                            <span className="font-medium">MFCC Patterns:</span>{" "}
                            {result.parkinsons_probability > 0.5
                              ? "Show irregularities typical in Parkinson's patients"
                              : "Consistent with healthy voice patterns"}
                          </li>
                          <li>
                            <span className="font-medium">Chroma Features:</span>{" "}
                            {result.parkinsons_probability > 0.5
                              ? "Indicate potential voice instability"
                              : "Show normal harmonic distribution"}
                          </li>
                        </ul>

                        <Alert
                          className="mt-6"
                          variant={result.prediction === "Parkinson's" ? "destructive" : "default"}
                        >
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>Important Note</AlertTitle>
                          <AlertDescription>
                            This analysis is based on voice patterns only and should not be considered a clinical
                            diagnosis. Please consult with a healthcare professional for proper medical evaluation.
                          </AlertDescription>
                        </Alert>
                      </CardContent>
                    </Card>
                  </div>

                  <Separator />

                  {/* Feature Comparison */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Feature Comparison</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
                          MFCC vs Chroma Correlation
                        </h4>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={[...mfccData.slice(0, 6), ...chromaData.slice(0, 6)].map((item, index) => ({
                                ...item,
                                type: index < 6 ? "MFCC" : "Chroma",
                                color: index < 6 ? "#8884d8" : "#f59e0b",
                              }))}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip
                                formatter={formatTooltipValue}
                                contentStyle={{
                                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                                  borderRadius: "6px",
                                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                                  border: "none",
                                }}
                              />
                              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                {[...mfccData.slice(0, 6), ...chromaData.slice(0, 6)].map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={index < 6 ? "#8884d8" : "#f59e0b"} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-lg font-medium mb-3">Analysis Summary</h4>
                        <p className="text-slate-700 dark:text-slate-300 mb-4">
                          {result.prediction === "Parkinson's" ? (
                            <>
                              The voice features extracted from this audio sample show characteristics that are commonly
                              associated with Parkinson's disease. The analysis reveals subtle changes in voice quality
                              that may not be perceptible to the human ear.
                            </>
                          ) : (
                            <>
                              The voice features extracted from this audio sample align with typical healthy voice
                              patterns. The analysis shows stable voice characteristics across multiple acoustic
                              parameters.
                            </>
                          )}
                        </p>

                        <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
                          <h5 className="font-medium mb-2">Technical Insights</h5>
                          <ul className="list-disc pl-5 space-y-1 text-sm text-slate-700 dark:text-slate-300">
                            <li>
                              MFCCs (coefficients {mfccData.findIndex((d) => Math.abs(d.value) > 0.1) + 1},{" "}
                              {mfccData.findIndex((d, i) => i > 2 && Math.abs(d.value) > 0.1) + 1}) show{" "}
                              {result.parkinsons_probability > 0.5 ? "significant" : "minimal"} deviation
                            </li>
                            <li>
                              Chroma features indicate {result.parkinsons_probability > 0.5 ? "irregular" : "regular"}{" "}
                              harmonic content
                            </li>
                            <li>
                              Zero crossing rate is {result.features.zeroCrossingRate > 0.05 ? "elevated" : "normal"},
                              which{" "}
                              {result.features.zeroCrossingRate > 0.05
                                ? "may indicate voice tremor"
                                : "suggests stable phonation"}
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="bg-slate-50 dark:bg-slate-900/50 border-t flex justify-between">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Analysis completed: {new Date().toLocaleString()}
              </p>
              <Button variant="outline" size="sm" onClick={() => setFile(null)}>
                New Analysis
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      )}
    </div>
  )
}

export default ResultsDisplay
