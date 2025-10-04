'use client';

import React from 'react';
import { COLORS } from '@/app/lib/constants';

interface MobileWarningProps {
  onProceed: () => void;
}

export default function MobileWarning({ onProceed }: MobileWarningProps) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '20px',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          backgroundColor: COLORS.WIN_GRAY,
          border: `2px outset ${COLORS.WIN_GRAY}`,
          padding: '32px',
          maxWidth: '400px',
          width: '100%',
          textAlign: 'center',
          fontFamily: 'MS Sans Serif, sans-serif',
          fontSize: '11px',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            fontSize: '16px',
            fontWeight: 'bold',
            marginBottom: '16px',
            color: COLORS.TEXT_BLACK,
          }}
        >
          ⚠️ Desktop Required
        </div>
        
        <div style={{ marginBottom: '16px', lineHeight: '1.4', color: COLORS.TEXT_BLACK }}>
          This Windows 3.1 experience is designed for desktop browsers and requires:
        </div>
        
        <ul style={{ 
          textAlign: 'left', 
          marginBottom: '20px', 
          paddingLeft: '20px',
          color: COLORS.TEXT_BLACK,
        }}>
          <li>Mouse interaction for window dragging</li>
          <li>Right-click context menus</li>
          <li>Keyboard shortcuts</li>
          <li>Minimum screen width of 800px</li>
        </ul>
        
        <div style={{ marginBottom: '20px', color: COLORS.TEXT_BLACK }}>
          Please visit on a desktop or laptop computer for the best experience.
        </div>
        
        <button
          onClick={onProceed}
          style={{
            backgroundColor: COLORS.WIN_GRAY,
            border: `1px outset ${COLORS.WIN_GRAY}`,
            padding: '6px 16px',
            fontSize: '11px',
            fontFamily: 'MS Sans Serif, sans-serif',
            cursor: 'pointer',
            minWidth: '75px',
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.border = `1px inset ${COLORS.WIN_GRAY}`;
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.border = `1px outset ${COLORS.WIN_GRAY}`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.border = `1px outset ${COLORS.WIN_GRAY}`;
          }}
        >
          Proceed Anyway
        </button>
      </div>
    </div>
  );
}