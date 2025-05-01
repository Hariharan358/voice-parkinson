
import React, { useState } from 'react';
import AudioRecorder from '@/components/AudioRecorder';
import ResultsDisplay from '@/components/ResultsDisplay';
import InfoSection from '@/components/InfoSection';
import { processAudio, AnalysisResult } from '@/services/audioAnalyzer';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle } from 'lucide-react';

const Index = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState("record");

  const handleAudioCaptured = async (audioBlob: Blob) => {
    setIsProcessing(true);
    try {
      const analysisResult = await processAudio(audioBlob);
      setResult(analysisResult);
      setActiveTab("results");
    } catch (error) {
      console.error('Error processing audio:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetAnalysis = () => {
    setResult(null);
    setActiveTab("record");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-health-50">
      <div className="container max-w-4xl py-8 px-4 md:py-12">
        <header className="text-center mb-8">
          <div className="inline-block bg-neural-500 text-white px-3 py-1 rounded-full text-xs font-medium mb-4">
            Research Tool
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-health-900 mb-2">
            Voice Insight: Parkinson's Check
          </h1>
          <p className="text-health-700 max-w-2xl mx-auto">
            A tool for voice-based screening of potential Parkinson's disease indicators using acoustic analysis
          </p>
        </header>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6 mb-8">
          <div className="flex items-center gap-2 mb-4 text-amber-600 bg-amber-50 p-2 rounded">
            <AlertTriangle className="h-5 w-5" />
            <p className="text-sm">
              <strong>Medical Disclaimer:</strong> This is a research tool and not meant for diagnosis. Always consult healthcare professionals.
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 mb-8">
              <TabsTrigger value="record">Record Voice</TabsTrigger>
              <TabsTrigger value="results" disabled={!result}>Results</TabsTrigger>
            </TabsList>

            <TabsContent value="record" className="space-y-8">
              <div className="text-center max-w-md mx-auto mb-6">
                <p className="text-sm text-muted-foreground mb-4">
                  Please record a 5-10 second voice sample saying "Ah" in a steady tone.
                  Try to record in a quiet environment for best results.
                </p>
              </div>
              
              <AudioRecorder 
                onAudioCaptured={handleAudioCaptured}
                isProcessing={isProcessing}
              />
            </TabsContent>

            <TabsContent value="results">
              <div className="mb-6">
                <ResultsDisplay result={result} />
                <div className="mt-6 text-center">
                  <Button onClick={resetAnalysis}>Try Again</Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <InfoSection />

        <footer className="mt-12 text-center text-sm text-muted-foreground">
          <p>© 2025 Voice Insight. This tool is for educational purposes only.</p>
          <p className="mt-2">
            Based on research in acoustic analysis of voice for neurological condition screening.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
