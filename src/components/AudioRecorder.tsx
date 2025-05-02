import React, { useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface AnalysisResult {
  prediction: string; // "Parkinson's Disease" or "Healthy"
  probability: number; // e.g., 0.85
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && ['audio/wav', 'audio/mpeg'].includes(file.type)) {
      setAudioFile(file);
      setError(null);
    } else {
      setError('Please select a valid .wav or .mp3 file.');
    }
  };

  const handleSubmit = async () => {
    if (!audioFile) {
      setError('Please select an audio file first.');
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

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div>
      <input type="file" accept="audio/wav,audio/mpeg" onChange={handleFileChange} />
      <Button onClick={handleSubmit} disabled={!audioFile}>
        Submit
      </Button>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
            <CardDescription>Voice pattern analysis for Parkinson's indicators</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Parkinson's Indicators */}
            <div>
              <div className="flex justify-between mb-2">
                <span>Parkinson's Indicators Detected:</span>
                <span>{result.probability > 0.7 ? 'High' : result.probability > 0.3 ? 'Medium' : 'Low'}</span>
              </div>
              <Progress value={result.probability * 100} className="h-3" />
            </div>

            {/* Quality Indicators (Placeholders) */}
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between">
                  <span>Confidence Score:</span>
                  <span>{formatPercent(result.probability)}</span>
                </div>
                <Progress value={result.probability * 100} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between">
                  <span>Audio Quality:</span>
                  <span>{formatPercent(0.8)}</span> {/* Placeholder */}
                </div>
                <Progress value={80} className="h-2" />
              </div>
            </div>

            {/* Features Table */}
            <Separator />
            <div>
              <h4>Extracted Voice Features:</h4>
              <table>
                <thead>
                  <tr>
                    <th>Feature</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>MFCC Mean</td>
                    <td>{(result.features.mfccs.reduce((a, b) => a + b, 0) / result.features.mfccs.length).toFixed(6)}</td>
                  </tr>
                  <tr>
                    <td>Chroma Mean</td>
                    <td>{(result.features.chroma.reduce((a, b) => a + b, 0) / result.features.chroma.length).toFixed(6)}</td>
                  </tr>
                  <tr>
                    <td>Zero Crossing Rate</td>
                    <td>{result.features.zeroCrossingRate.toFixed(6)}</td>
                  </tr>
                  <tr>
                    <td>Spectral Centroid</td>
                    <td>{result.features.spectralCentroid.toFixed(6)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}