'use client';

import { useEffect, useState } from 'react';
import { getDeviceInfo, getDeviceDescription } from '@/app/lib/utils/deviceDetection';

interface BootMessage {
  text: string;
  color: 'green' | 'yellow' | 'red' | 'white' | 'cyan';
  delay: number;
}

const COLORS = {
  green: '#00ff00',
  yellow: '#ffff00',
  red: '#ff5555',
  white: '#ffffff',
  cyan: '#00ffff',
} as const;

interface MobileBootProps {
  onComplete: () => void;
}

export default function MobileBoot({ onComplete }: MobileBootProps) {
  const [messages, setMessages] = useState<Array<{ text: string; color: string }>>([]);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const deviceInfo = getDeviceInfo();
    const deviceDesc = getDeviceDescription(deviceInfo);

    // Build boot sequence with device-specific info
    const bootSequence: BootMessage[] = [
      { text: 'System Check...', color: 'green', delay: 500 },
      { text: 'OK', color: 'green', delay: 300 },
      { text: '', color: 'white', delay: 200 },
      { text: 'Detecting device...', color: 'yellow', delay: 500 },
      { text: `${deviceDesc} detected`, color: 'yellow', delay: 600 },
      { text: '', color: 'white', delay: 200 },
      { text: '⚠️  Desktop UI disabled on mobile', color: 'red', delay: 800 },
      { text: 'Loading Terminal Mode...', color: 'green', delay: 600 },
      { text: '', color: 'white', delay: 300 },
      { text: '═══════════════════════════════', color: 'white', delay: 100 },
      { text: 'Welcome to Jean Francois Portfolio!', color: 'green', delay: 500 },
      { text: 'Mobile Terminal Edition', color: 'white', delay: 300 },
      { text: '═══════════════════════════════', color: 'white', delay: 100 },
      { text: '', color: 'white', delay: 200 },
      { text: '💡 Type "help" to explore', color: 'yellow', delay: 500 },
      { text: '💡 Type "portfolio" for main menu', color: 'yellow', delay: 500 },
      { text: '', color: 'white', delay: 500 },
    ];

    let currentIndex = 0;
    const displayedMessages: Array<{ text: string; color: string }> = [];

    const showNextMessage = () => {
      if (currentIndex >= bootSequence.length) {
        setIsComplete(true);
        setTimeout(() => {
          onComplete();
        }, 500);
        return;
      }

      const message = bootSequence[currentIndex];
      displayedMessages.push({ text: message.text, color: COLORS[message.color] });
      setMessages([...displayedMessages]);

      currentIndex++;
      setTimeout(showNextMessage, message.delay);
    };

    // Start boot sequence after small delay
    const startTimeout = setTimeout(showNextMessage, 300);

    return () => {
      clearTimeout(startTimeout);
    };
  }, [onComplete]);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: '#000000',
        zIndex: 20000,
        fontFamily: "'Courier New', 'Consolas', monospace",
        fontSize: '14px',
        lineHeight: 1.5,
        padding: '20px',
        overflow: 'auto',
        opacity: isComplete ? 0 : 1,
        transition: 'opacity 0.5s ease-out',
        pointerEvents: isComplete ? 'none' : 'auto',
      }}
    >
      {messages.map((message, index) => (
        <div
          key={index}
          style={{
            color: message.color,
            textShadow: `0 0 6px ${message.color}`,
            marginBottom: '4px',
            whiteSpace: 'pre-wrap',
          }}
        >
          {message.text}
        </div>
      ))}
    </div>
  );
}
