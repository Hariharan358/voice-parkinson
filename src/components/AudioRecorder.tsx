
import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AnalysisResult {
  prediction: string;
  parkinsons_probability: number;
  healthy_rate: number;
  features: {
    mfccs: number[];
    chroma: number[];
    zeroCrossingRate: number;
    spectralCentroid: number;
  };
}

export default function AudioRecorder() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && ['audio/wav', 'audio/mpeg'].includes(file.type)) {
      setAudioFile(file);
      setError(null);
    } else {
      setError('Please select a valid .wav or .mp3 file.');
    }
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file && ['audio/wav', 'audio/mpeg'].includes(file.type)) {
      setAudioFile(file);
      setError(null);
    } else {
      setError('Please drop a valid .wav or .mp3 file.');
    }
  };

  const handleSubmit = async () => {
    if (!audioFile) {
      setError('Please select or drop an audio file first.');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', audioFile);

    try {
      const response = await axios.post('http://localhost:5000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setResult(response.data);
    } catch (error) {
      console.error('Error:', error.response?.data || error.message);
      setError(error.response?.data?.error || 'Error uploading or processing file. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`;

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Formatter for chart tooltips
  const formatTooltipValue = (value: number | string) => {
    const numValue = Number(value);
    return isNaN(numValue) ? 'N/A' : numValue.toFixed(1);
  };

  // Prepare data for probability bar chart
  const probabilityData = result
    ? [
        { name: "Parkinson's", value: result.parkinsons_probability * 100 },
        { name: 'Healthy', value: result.healthy_rate * 100 },
      ]
    : [];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-6">Parkinson's Disease Audio Prediction</h1>

      {/* Enhanced Upload Section */}
      <div
        className={`border-2 border-dashed rounded-xl p-8 mb-8 text-center transition-all duration-300 ${
          dragActive ? 'border-blue-500 bg-blue-50 shadow-lg' : 'border-gray-300 bg-gray-50'
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
          accept="audio/wav,audio/mpeg"
          onChange={handleFileChange}
          className="hidden"
          id="file-upload"
          ref={fileInputRef}
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer flex flex-col items-center justify-center"
        >
          <svg
            className="w-16 h-16 text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M7 16V12m0 0V8m0 4H3m4 0h14m-7-4V4m0 0v4m0-4H9m5 12v4m0 0v-4m0 4h4m-4 0H9"
            />
          </svg>
          {audioFile ? (
            <div className="text-gray-700">
              <p className="font-semibold">Selected: {audioFile.name}</p>
              <p className="text-sm text-gray-500">Size: {formatFileSize(audioFile.size)}</p>
            </div>
          ) : (
            <p className="text-gray-600 text-lg">
              Drag and drop a .wav or .mp3 file here, or{' '}
              <span className="text-blue-500 hover:underline font-semibold">click to select</span>
            </p>
          )}
        </label>
        <Button
          onClick={handleSubmit}
          disabled={!audioFile || loading}
          className="mt-6 px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all disabled:bg-gray-400"
        >
          Upload and Analyze
        </Button>
      </div>

      {/* Loader UI */}
      {loading && (
        <div className="flex flex-col items-center justify-center my-8">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Analyzing your audio...</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <p className="text-center text-red-500 bg-red-50 p-4 rounded-lg mb-6">{error}</p>
      )}

      {/* Enhanced Result Section */}
      {result && (
        <Card className="mt-8 animate-fade-in">
          <CardHeader>
            <CardTitle className="text-2xl">Analysis Results</CardTitle>
            <CardDescription>Voice pattern analysis for Parkinson's indicators</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Prediction and Probabilities */}
            <div className="mb-6">
              <div className="flex justify-between mb-3">
                <span className="font-semibold text-lg">Prediction:</span>
                <span
                  className={`text-lg font-medium ${
                    result.prediction === "Parkinson's" ? 'text-red-600' : 'text-green-600'
                  }`}
                >
                  {result.prediction}
                </span>
              </div>
              <div className="mb-4">
                <div className="flex justify-between mb-1">
                  <span>Parkinson's Probability:</span>
                  <span>{formatPercent(result.parkinsons_probability)}</span>
                </div>
                <Progress
                  value={result.parkinsons_probability * 100}
                  className="h-4 bg-red-100"
                  indicatorClassName="bg-gradient-to-r from-red-400 to-red-600"
                />
                <p className="text-sm text-gray-500 mt-1">
                  {result.parkinsons_probability > 0.7
                    ? 'High'
                    : result.parkinsons_probability > 0.3
                    ? 'Medium'
                    : 'Low'}{' '}
                  Parkinson’s Indicators
                </p>
              </div>
              <div className="mb-4">
                <div className="flex justify-between mb-1">
                  <span>Healthy Rate:</span>
                  <span>{formatPercent(result.healthy_rate)}</span>
                </div>
                <Progress
                  value={result.healthy_rate * 100}
                  className="h-4 bg-green-100"
                  indicatorClassName="bg-gradient-to-r from-green-400 to-green-600"
                />
              </div>
            </div>

            {/* Probability Bar Chart */}
          

            {/* Quality Indicators (Placeholders) */}
            <Separator className="my-6" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <div className="flex justify-between mb-1">
                  <span>Confidence Score:</span>
                  <span>{formatPercent(result.parkinsons_probability)}</span>
                </div>
                <Progress
                  value={result.parkinsons_probability * 100}
                  className="h-3 bg-gray-100"
                  indicatorClassName="bg-blue-500"
                />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span>Audio Quality:</span>
                  <span>{formatPercent(0.8)}</span>
                </div>
                <Progress
                  value={80}
                  className="h-3 bg-gray-100"
                  indicatorClassName="bg-purple-500"
                />
              </div>
            </div>

            {/* Features Grid */}
            <Separator className="my-6" />
            <div>
              <h3 className="text-xl font-semibold mb-4">Extracted Voice Features</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <span className="font-semibold">MFCC Mean:</span>
                  <p className="text-gray-700">
                    {(result.features.mfccs.reduce((a, b) => a + b, 0) / result.features.mfccs.length).toFixed(6)}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <span className="font-semibold">Chroma Mean:</span>
                  <p className="text-gray-700">
                    {(result.features.chroma.reduce((a, b) => a + b, 0) / result.features.chroma.length).toFixed(6)}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <span className="font-semibold">Zero Crossing Rate:</span>
                  <p className="text-gray-700">{result.features.zeroCrossingRate.toFixed(6)}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <span className="font-semibold">Spectral Centroid:</span>
                  <p className="text-gray-700">{result.features.spectralCentroid.toFixed(6)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
