'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { COLORS } from '../../../lib/constants';
import { useFileSystemContext } from '../../../lib/FileSystemContext';

interface CameraProps {
  onClose?: () => void;
}

export default function Camera({ onClose }: CameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');
  const [isActive, setIsActive] = useState(false);
  const [micLevel, setMicLevel] = useState(0);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const { createImageFile, rootItems } = useFileSystemContext();

  // Helper function to get existing PIC files for sequential naming
  const getAllExistingPicFiles = useCallback(() => {
    const picFiles: string[] = [];
    
    const searchItems = (items: typeof rootItems) => {
      items.forEach(item => {
        if (item.extension === 'png' && item.name.match(/^PIC\d+\.png$/)) {
          picFiles.push(item.name);
        }
        if (item.children) {
          searchItems(item.children);
        }
      });
    };
    
    searchItems(rootItems);
    return picFiles.sort();
  }, [rootItems]);

  const setupAudioMonitoring = useCallback((mediaStream: MediaStream) => {
    try {
      const context = new AudioContext();
      const analyser = context.createAnalyser();
      const microphone = context.createMediaStreamSource(mediaStream);

      microphone.connect(analyser);
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateLevel = () => {
        if (context.state === 'closed') return;
        
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setMicLevel(average);
        requestAnimationFrame(updateLevel);
      };

      updateLevel();
      setAudioContext(context);
    } catch (err) {
      console.error('Audio monitoring failed:', err);
    }
  }, []);

  const getCamera = useCallback(async () => {
    try {
      setError('');
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: true
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setIsActive(true);
        
        // Set up audio level monitoring
        setupAudioMonitoring(mediaStream);
      }
    } catch (err: any) {
      console.error('Camera access denied:', err);
      if (err.name === 'NotAllowedError') {
        setError('Camera access denied. Please allow camera permission in your browser settings.');
      } else if (err.name === 'NotFoundError') {
        setError('No camera detected. Please connect a webcam.');
      } else {
        setError('Failed to access camera. Please try again.');
      }
    }
  }, [setupAudioMonitoring]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsActive(false);
    }
    if (audioContext) {
      audioContext.close();
      setAudioContext(null);
    }
    setMicLevel(0);
  }, [stream, audioContext]);

  const takeScreenshot = useCallback(() => {
    const video = videoRef.current;
    if (!video || !isActive) return;

    // Create canvas to capture video frame
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw the current video frame
    ctx.drawImage(video, 0, 0);

    // Convert to data URL (base64)
    const imageData = canvas.toDataURL('image/png');
    
    // Generate sequential filename (PIC1, PIC2, etc.)
    const existingFiles = getAllExistingPicFiles();
    const nextNumber = existingFiles.length + 1;
    const fileName = `PIC${nextNumber}.png`;

    // Save to virtual Desktop
    const savedFile = createImageFile('/Desktop', fileName, imageData);
    
    if (savedFile) {
      // Show success message with Windows 3.1 style alert
      alert(`📸 Screenshot saved to Desktop!\n\n${fileName}\n\nYou can now open it in Paint!`);
    } else {
      // Fallback to download if virtual save fails
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        alert(`📸 Screenshot downloaded as ${fileName}!`);
      }, 'image/png');
    }
  }, [isActive, createImageFile, getAllExistingPicFiles]);

  // Start camera on component mount
  useEffect(() => {
    if (!isInitialized) {
      setIsInitialized(true);
      getCamera();
    }
    
    // Cleanup on unmount
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (audioContext && audioContext.state !== 'closed') {
        audioContext.close();
      }
    };
  }, []); // Empty dependency array - only run on mount/unmount

  if (error) {
    return (
      <div style={{ 
        padding: 20, 
        textAlign: 'center',
        backgroundColor: COLORS.WIN_GRAY,
        height: '400px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <h3 style={{ color: COLORS.WIN_BLACK, marginBottom: 16 }}>⚠️ Camera Access Problem</h3>
        <p style={{ color: COLORS.WIN_BLACK, marginBottom: 8 }}>{error}</p>
        <p style={{ color: COLORS.WIN_BLACK, fontSize: 12, marginBottom: 20 }}>
          Make sure you're using HTTPS and allow camera permission.
        </p>
        <button 
          onClick={getCamera}
          style={{
            padding: '8px 16px',
            backgroundColor: COLORS.WIN_BLUE,
            color: COLORS.WIN_WHITE,
            border: `2px solid ${COLORS.BORDER_LIGHT}`,
            cursor: 'pointer',
            fontSize: 14
          }}
        >
          🔄 Try Again
        </button>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: 16,
      backgroundColor: COLORS.WIN_GRAY,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      {/* CRT Monitor Frame */}
      <div style={{
        position: 'relative',
        backgroundColor: '#1a1a1a',
        padding: 24,
        borderRadius: 8,
        boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8)',
        marginBottom: 16
      }}>
        {/* Scanlines overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)',
          pointerEvents: 'none',
          zIndex: 2,
          borderRadius: 4
        }} />

        {/* Video element */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            width: '100%',
            maxWidth: 640,
            height: 'auto',
            display: 'block',
            filter: 'contrast(1.1) saturate(0.9)',
            borderRadius: 4
          }}
        />

        {/* Camera status indicator */}
        {isActive && (
          <div style={{
            position: 'absolute',
            top: 8,
            right: 8,
            backgroundColor: 'rgba(255, 0, 0, 0.8)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: 4,
            fontSize: 12,
            fontWeight: 'bold',
            zIndex: 3
          }}>
            🔴 LIVE
          </div>
        )}
      </div>

      {/* Microphone Level Indicator */}
      <div style={{ width: '100%', maxWidth: 640, marginBottom: 16 }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          marginBottom: 8,
          fontSize: 14,
          color: COLORS.WIN_BLACK
        }}>
          🎤 Mic Level:
        </div>
        <div style={{
          width: '100%',
          height: 20,
          backgroundColor: COLORS.WIN_WHITE,
          border: `2px solid ${COLORS.BORDER_SHADOW}`,
          position: 'relative',
          borderRadius: 2
        }}>
          <div style={{
            height: '100%',
            width: `${Math.min((micLevel / 255) * 100, 100)}%`,
            backgroundColor: micLevel > 200 ? '#ff0000' : micLevel > 100 ? '#ffff00' : '#00ff00',
            transition: 'width 0.1s ease',
            borderRadius: '1px'
          }} />
        </div>
      </div>

      {/* Control Buttons */}
      <div style={{ 
        display: 'flex', 
        gap: 16, 
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginBottom: 16
      }}>
        {/* Take Screenshot Button (THE MAIN ATTRACTION!) */}
        <button
          onClick={takeScreenshot}
          disabled={!isActive}
          style={{
            padding: '12px 32px',
            fontSize: 16,
            fontWeight: 'bold',
            backgroundColor: isActive ? COLORS.WIN_BLUE : COLORS.WIN_GRAY,
            color: COLORS.WIN_WHITE,
            border: `2px solid ${isActive ? COLORS.BORDER_LIGHT : COLORS.BORDER_SHADOW}`,
            cursor: isActive ? 'pointer' : 'not-allowed',
            borderRadius: 4,
            boxShadow: isActive ? `2px 2px 0px ${COLORS.BORDER_SHADOW}` : 'none'
          }}
        >
          📸 Take Screenshot
        </button>

        {/* Start/Stop Camera Button */}
        <button
          onClick={isActive ? stopCamera : getCamera}
          style={{
            padding: '12px 24px',
            fontSize: 14,
            backgroundColor: isActive ? '#ff4444' : '#44ff44',
            color: COLORS.WIN_WHITE,
            border: `2px solid ${COLORS.BORDER_LIGHT}`,
            cursor: 'pointer',
            borderRadius: 4,
            boxShadow: `2px 2px 0px ${COLORS.BORDER_SHADOW}`
          }}
        >
          {isActive ? '⏹️ Stop Camera' : '🔴 Start Camera'}
        </button>
      </div>

      {/* Status Bar */}
      <div style={{
        width: '100%',
        maxWidth: 640,
        padding: 8,
        backgroundColor: COLORS.WIN_WHITE,
        border: `2px solid ${COLORS.BORDER_SHADOW}`,
        fontSize: 12,
        color: COLORS.WIN_BLACK,
        textAlign: 'center'
      }}>
        Status: {isActive ? '📹 Camera active - Ready to take photos!' : '📴 Camera offline'}
      </div>
    </div>
  );
}