
import React from 'react';

interface AudioWaveformProps {
  isRecording: boolean;
}

export default function AudioWaveform({ isRecording }: AudioWaveformProps) {
  return (
    <div className={`audio-wave ${isRecording ? 'recording' : ''}`}>
      {Array(8).fill(null).map((_, index) => (
        <span 
          key={index} 
          style={{ 
            animationDelay: `${index * 0.1}s`,
            height: '25px', 
            opacity: isRecording ? '1' : '0.3'
          }} 
        />
      ))}
    </div>
  );
}
