"use client";

export default function CRTEffect() {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        backgroundImage: [
          'linear-gradient(180deg, rgba(0, 0, 0, 0.12) 0%, rgba(0, 0, 0, 0) 50%, rgba(0, 0, 0, 0.12) 100%)',
          'radial-gradient(ellipse at center, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.4) 95%)',
          'repeating-linear-gradient(0deg, rgba(0, 0, 0, 0) 0px, rgba(0, 0, 0, 0) 2px, rgba(0, 0, 0, 0.4) 3px)'
        ].join(','),
        mixBlendMode: 'screen',
        opacity: 0.3,
      }}
    />
  );
}