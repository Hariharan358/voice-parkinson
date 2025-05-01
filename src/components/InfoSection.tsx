
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function InfoSection() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">What is this tool?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This tool analyzes voice recordings to detect subtle vocal changes that may be associated with Parkinson's disease. 
            Research has shown that voice patterns can show signs of the disease before other symptoms appear.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">How it works</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Our system extracts acoustic features from your voice recording, including jitter, shimmer, and harmonic-to-noise ratios. 
            These features are analyzed by a machine learning model trained on voice samples from both healthy individuals and those with Parkinson's.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Research backing</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This approach is based on research published in medical journals showing that voice analysis can detect Parkinson's with up to 95% accuracy in research settings. 
            However, this tool is for informational purposes only and should not replace medical advice.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
