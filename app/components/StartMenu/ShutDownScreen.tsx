'use client';

import { COLORS } from '@/app/lib/constants';

interface ShutDownScreenProps {
  isVisible: boolean;
}

export default function ShutDownScreen({ isVisible }: ShutDownScreenProps) {
  if (!isVisible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: '#000000',
        color: '#FF8C00', // Orange text like classic Windows
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 24,
        fontFamily: 'monospace',
        zIndex: 10000,
        textAlign: 'center',
        userSelect: 'none',
      }}
    >
      <div style={{ marginBottom: 40 }}>
        It&apos;s now safe to turn off
      </div>
      <div style={{ marginBottom: 60 }}>
        your computer.
      </div>
      <div style={{ fontSize: 16, color: '#888888', fontStyle: 'italic' }}>
        (Refresh page to restart Windows)
      </div>
    </div>
  );
}