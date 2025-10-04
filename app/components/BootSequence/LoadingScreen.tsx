'use client';

import { useState, useEffect } from 'react';
import { LOADING_MESSAGES } from '@/app/lib/constants';

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [dots, setDots] = useState('');

  // Progress bar animation
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        const next = prev + 5; // Increase by 5% every 100ms
        return next > 100 ? 100 : next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Loading message rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex(prev => 
        prev < LOADING_MESSAGES.length - 1 ? prev + 1 : 0
      );
    }, 500); // Change message every 500ms

    return () => clearInterval(interval);
  }, []);

  // Animated dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev.length >= 3) return '';
        return prev + '.';
      });
    }, 300);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        backgroundColor: '#C0C0C0',
        color: '#000000',
        fontFamily: 'ms sans serif, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        fontSize: '14px',
      }}
    >
      {/* Windows logo area */}
      <div
        style={{
          border: '2px inset #C0C0C0',
          backgroundColor: '#FFFFFF',
          padding: '40px 60px',
          marginBottom: '40px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#000080',
            marginBottom: '10px',
          }}
        >
          Microsoft Windows
        </div>
        <div
          style={{
            fontSize: '18px',
            color: '#000080',
          }}
        >
          3.1
        </div>
      </div>

      {/* Loading message */}
      <div style={{ marginBottom: '20px', fontSize: '16px' }}>
        {LOADING_MESSAGES[currentMessageIndex]}{dots}
      </div>

      {/* Progress bar */}
      <div
        style={{
          width: '300px',
          height: '20px',
          border: '1px inset #C0C0C0',
          backgroundColor: '#FFFFFF',
          position: 'relative',
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: '100%',
            backgroundColor: '#000080',
            transition: 'width 0.1s ease-out',
          }}
        />
      </div>

      {/* Progress percentage */}
      <div style={{ marginTop: '10px', fontSize: '12px' }}>
        {progress}% Complete
      </div>
    </div>
  );
}