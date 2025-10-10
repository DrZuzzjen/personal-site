'use client';

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
	return Array.from({ length: count }, (_, index) =>
		createStream(index, count)
	);
}

export default function MatrixRain({ columns = 32 }: { columns?: number }) {
	console.log('[DEBUG] MatrixRain component rendered with columns:', columns);
	const [streams, setStreams] = useState<MatrixStream[]>(() =>
		createStreams(columns)
	);

	console.log(
		'[DEBUG] MatrixRain streams:',
		streams.length,
		streams.slice(0, 2)
	); // Show first 2 streams

	useEffect(() => {
		const interval = setInterval(() => {
			setStreams((prev) =>
				prev.map((_, index) => createStream(index, columns))
			);
		}, 300);

		return () => clearInterval(interval);
	}, [columns]);

	const streamElements = useMemo(() => streams, [streams]);

	console.log('[DEBUG] Rendering', streamElements.length, 'streams');

	return (
		<>
			<style>{`
        @keyframes matrixFall {
          0% { 
            transform: translateY(-100%); 
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% { 
            transform: translateY(calc(100vh + 100px)); 
            opacity: 0;
          }
        }
      `}</style>
			<div
				style={{
					position: 'absolute',
					inset: 0,
					pointerEvents: 'none',
					overflow: 'hidden',
					zIndex: 1000,
				}}
			>
				{streamElements.map((stream, index) => (
					<div
						key={`${index}-${stream.text}`}
						style={{
							position: 'absolute',
							left: `${stream.left}%`,
							top: '-50px', // Start above the container
							opacity: stream.opacity,
							animation: `matrixFall ${stream.duration}s linear infinite`,
							whiteSpace: 'pre',
							color: '#00ff00',
							fontSize: '14px',
							fontFamily: "'Courier New', 'Consolas', monospace",
							textShadow: '0 0 8px rgba(0, 255, 0, 0.8)',
							lineHeight: '16px',
						}}
					>
						{stream.text}
					</div>
				))}
			</div>
		</>
	);
}
