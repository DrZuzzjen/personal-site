'use client';

import React from 'react';
import Desktop from './Desktop';

/**
 * Test page for Desktop components
 * Shows the desktop with icons in isolation
 */
export default function TestDesktop() {
  return (
    <div>
      <h1 style={{ 
        position: 'absolute', 
        top: 10, 
        left: 10, 
        color: 'white', 
        zIndex: 1000,
        fontFamily: 'monospace',
        fontSize: '12px'
      }}>
        Desktop Component Test
      </h1>
      <Desktop />
    </div>
  );
}