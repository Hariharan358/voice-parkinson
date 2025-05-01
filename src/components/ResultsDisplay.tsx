
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, Info } from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { AnalysisResult } from '@/services/audioAnalyzer';

interface ResultsDisplayProps {
  result: AnalysisResult | null;
}

export default function ResultsDisplay({ result }: ResultsDisplayProps) {
  if (!result) return null;
  
  const { pdLikelihood, features, confidenceScore, qualityScore } = result;

  // Risk categories
  let riskLevel = "Low";
  let riskColor = "text-green-600";
  
  if (pdLikelihood > 0.7) {
    riskLevel = "High";
    riskColor = "text-red-600";
  } else if (pdLikelihood > 0.3) {
    riskLevel = "Medium";
    riskColor = "text-amber-600";
  }

  // Format percentage
  const formatPercent = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Analysis Results
            <span className="text-xs bg-health-100 text-health-800 px-2 py-1 rounded-full">
              Research Grade
            </span>
          </CardTitle>
          <CardDescription>
            Voice pattern analysis for Parkinson's indicators
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Primary indicator */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="font-medium">Parkinson's Indicators Detected:</span>
              <span className={`font-semibold ${riskColor}`}>{riskLevel}</span>
            </div>
            <Progress 
              value={pdLikelihood * 100} 
              className={`h-3 ${
                pdLikelihood > 0.7 ? 'bg-red-200' : 
                pdLikelihood > 0.3 ? 'bg-amber-200' : 'bg-green-200'
              }`} 
            />
            <div className="flex justify-between mt-1 text-xs text-muted-foreground">
              <span>Low</span>
              <span>Medium</span>
              <span>High</span>
            </div>
          </div>

          <Separator />

          {/* Quality indicators */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm">Confidence Score:</span>
                <span className="text-sm font-medium">{formatPercent(confidenceScore)}</span>
              </div>
              <Progress value={confidenceScore * 100} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm">Audio Quality:</span>
                <span className="text-sm font-medium">{formatPercent(qualityScore)}</span>
              </div>
              <Progress value={qualityScore * 100} className="h-2" />
            </div>
          </div>

          {/* Voice features */}
          <div>
            <h4 className="text-sm font-medium mb-2">Extracted Voice Features:</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Feature</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Jitter</TableCell>
                  <TableCell className="text-right">{features.jitter.toFixed(4)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Shimmer</TableCell>
                  <TableCell className="text-right">{features.shimmer.toFixed(4)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Harmonic to Noise Ratio</TableCell>
                  <TableCell className="text-right">{features.harmonicToNoise.toFixed(2)} dB</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Pitch Variability</TableCell>
                  <TableCell className="text-right">{features.pitchVariability.toFixed(2)} st</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Formant Frequency</TableCell>
                  <TableCell className="text-right">{features.formantFrequency.toFixed(0)} Hz</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* Disclaimer */}
          <div className="bg-amber-50 border border-amber-200 rounded-md p-3 flex gap-2 text-amber-800">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            <div className="text-sm">
              <strong>Medical Disclaimer:</strong> This tool is not a substitute for professional medical diagnosis. 
              If you have concerns about Parkinson's disease or other neurological conditions, please consult a healthcare professional.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
