
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Square, Upload } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import AudioWaveform from './AudioWaveform';

interface AudioRecorderProps {
  onAudioCaptured: (audioBlob: Blob) => void;
  isProcessing: boolean;
}

export default function AudioRecorder({ onAudioCaptured, isProcessing }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const startRecording = async () => {
    audioChunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      mediaRecorderRef.current.addEventListener('dataavailable', (event) => {
        audioChunksRef.current.push(event.data);
      });

      mediaRecorderRef.current.addEventListener('stop', () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(audioUrl);
      });

      mediaRecorderRef.current.start();
      setIsRecording(true);
      toast({
        title: "Recording started",
        description: "Speak clearly into your microphone",
      });
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        variant: "destructive",
        title: "Error accessing microphone",
        description: "Please make sure your microphone is connected and permissions are granted.",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Stop all tracks on the stream
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      
      toast({
        title: "Recording stopped",
        description: "You can now submit your recording or try again",
      });
    }
  };

  const submitRecording = () => {
    if (audioChunksRef.current.length > 0) {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      onAudioCaptured(audioBlob);
      toast({
        title: "Recording submitted",
        description: "Your voice sample is being processed",
      });
    } else {
      toast({
        variant: "destructive",
        title: "No recording available",
        description: "Please record a voice sample before submitting",
      });
    }
  };

  const resetRecording = () => {
    setAudioUrl(null);
    audioChunksRef.current = [];
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-6">
        <div className="flex flex-col items-center gap-4">
          <div className="mb-4 h-[50px] flex items-center justify-center">
            {isRecording ? (
              <AudioWaveform isRecording={isRecording} />
            ) : (
              <div className="text-muted-foreground text-sm">
                {audioUrl ? "Recording complete" : "Ready to record"}
              </div>
            )}
          </div>

          {audioUrl && (
            <audio src={audioUrl} controls className="w-full mb-4" />
          )}

          <div className="flex gap-3 flex-wrap justify-center">
            {!isRecording && !audioUrl && (
              <Button 
                onClick={startRecording} 
                className="gap-2"
                disabled={isProcessing}
              >
                <Mic className="w-4 h-4" /> Start Recording
              </Button>
            )}

            {isRecording && (
              <Button 
                onClick={stopRecording} 
                variant="destructive"
                className="gap-2"
              >
                <Square className="w-4 h-4" /> Stop Recording
              </Button>
            )}

            {audioUrl && !isProcessing && (
              <>
                <Button 
                  onClick={submitRecording} 
                  className="gap-2"
                >
                  <Upload className="w-4 h-4" /> Submit Recording
                </Button>
                <Button 
                  onClick={resetRecording} 
                  variant="outline"
                >
                  Try Again
                </Button>
              </>
            )}

            {isProcessing && (
              <Button disabled className="gap-2">
                <div className="animate-pulse-slow">Processing...</div>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
