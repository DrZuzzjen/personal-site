"use client";

import { useEffect, useMemo, useState } from 'react';

const MATRIX_CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789#$%&*';

interface MatrixStream {
  text: string;
  left: number;
  opacity: number;
  duration: number;
}

function createStream(index: number, total: number): MatrixStream {
  const length = 20 + Math.floor(Math.random() * 20);
  let text = '';
  for (let i = 0; i < length; i++) {
    const charIndex = Math.floor(Math.random() * MATRIX_CHARS.length);
    text += MATRIX_CHARS.charAt(charIndex);
  }

  return {
    text,
    left: (index / total) * 100,
    opacity: 0.4 + Math.random() * 0.6,
    duration: 3 + Math.random() * 2,
  };
}

function createStreams(count: number): MatrixStream[] {
  return Array.from({ length: count }, (_, index) => createStream(index, count));
}

export default function MatrixRain({ columns = 32 }: { columns?: number }) {
  const [streams, setStreams] = useState<MatrixStream[]>(() => createStreams(columns));

  useEffect(() => {
    const interval = setInterval(() => {
      setStreams((prev) => prev.map((_, index) => createStream(index, columns)));
    }, 300);

    return () => clearInterval(interval);
  }, [columns]);

  const streamElements = useMemo(() => streams, [streams]);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        color: '#00ff00',
        fontFamily: "'Courier New', 'Consolas', monospace",
        fontSize: 14,
        textShadow: '0 0 8px rgba(0, 255, 0, 0.6)',
        backgroundColor: 'rgba(0, 0, 0, 0.35)',
      }}
    >
      {streamElements.map((stream, index) => (
        <div
          key={`${index}-${stream.text}`}
          style={{
            position: 'absolute',
            left: `${stream.left}%`,
            top: '-20%',
            opacity: stream.opacity,
            animation: `matrix-fall ${stream.duration}s linear infinite`,
            whiteSpace: 'pre',
          }}
        >
          {stream.text}
        </div>
      ))}
      <style>{`
        @keyframes matrix-fall {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(120%); }
        }
      `}</style>
    </div>
  );
}