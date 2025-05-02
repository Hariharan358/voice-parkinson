import React, { useState } from 'react';
import axios from 'axios';

interface AnalysisResult {
  prediction: string;
  probability: number;
  features: {
    mfccs: number[];
    chroma: number[];
    zeroCrossingRate: number;
    spectralCentroid: number;
  };
}

const ResultsDisplay = () => {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && ['audio/wav', 'audio/mpeg'].includes(selectedFile.type)) {
      setFile(selectedFile);
      setError(null);
    } else {
      setError('Please select a valid .wav or .mp3 file.');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setResult(response.data);
      setError(null);
    } catch (err) {
      console.error('Error:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Error uploading or analyzing the file');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-6">Parkinson's Disease Audio Prediction</h1>

      <div className="flex justify-center mb-6">
        <input
          type="file"
          accept=".wav,.mp3"
          onChange={handleFileChange}
          className="border-2 border-gray-300 p-2 rounded-lg"
        />
        <button
          onClick={handleUpload}
          disabled={!file || loading}
          className="ml-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700 transition-all"
        >
          Upload and Analyze
        </button>
      </div>

      {loading && <p className="text-center text-blue-500">Analyzing your audio...</p>}

      {error && <p className="text-center text-red-500">{error}</p>}

      {result && (
        <div className="result-container mt-8 p-6 border-2 border-gray-300 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Analysis Result</h2>

          <div className="mb-4">
            <p className="text-xl">
              <strong>Prediction:</strong> {result.prediction}
            </p>
            <p className="text-lg">
              <strong>Probability:</strong> {(result.probability * 100).toFixed(1)}%
            </p>
          </div>

          <h3 className="text-xl font-semibold mt-4">Extracted Features:</h3>
          <ul className="list-disc pl-5">
            <li>
              <strong>MFCC Mean:</strong> {(result.features.mfccs.reduce((a, b) => a + b, 0) / result.features.mfccs.length).toFixed(6)}
            </li>
            <li>
              <strong>Chroma Mean:</strong> {(result.features.chroma.reduce((a, b) => a + b, 0) / result.features.chroma.length).toFixed(6)}
            </li>
            <li>
              <strong>Zero Crossing Rate:</strong> {result.features.zeroCrossingRate.toFixed(6)}
            </li>
            <li>
              <strong>Spectral Centroid:</strong> {result.features.spectralCentroid.toFixed(6)}
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default ResultsDisplay;