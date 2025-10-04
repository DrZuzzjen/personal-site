'use client';

import { useState, useEffect } from 'react';
import { BOOT_MESSAGES } from '@/app/lib/constants';

export default function PostScreen() {
	const [currentLineIndex, setCurrentLineIndex] = useState(0);
	const [showCursor, setShowCursor] = useState(true);

	// Display messages line by line
	useEffect(() => {
		if (currentLineIndex < BOOT_MESSAGES.length) {
			const timeout = setTimeout(() => {
				setCurrentLineIndex(currentLineIndex + 1);
			}, 300); // Show each line after 300ms

			return () => clearTimeout(timeout);
		}
	}, [currentLineIndex]);

	// Blinking cursor effect
	useEffect(() => {
		const interval = setInterval(() => {
			setShowCursor((prev) => !prev);
		}, 500);

		return () => clearInterval(interval);
	}, []);

	const visibleMessages = BOOT_MESSAGES.slice(0, currentLineIndex);

	return (
		<div
			style={{
				backgroundColor: '#000000',
				color: '#FFFFFF',
				fontFamily: 'monospace',
				fontSize: '14px',
				lineHeight: 1.5,
				padding: '20px',
				width: '100%',
				height: '100%',
				overflow: 'hidden',
			}}
		>
			{visibleMessages.map((message, index) => (
				<div key={index} style={{ marginBottom: '4px' }}>
					{message}
				</div>
			))}

			{/* Show blinking cursor after last message */}
			{currentLineIndex >= BOOT_MESSAGES.length && (
				<span style={{ opacity: showCursor ? 1 : 0 }}>_</span>
			)}
		</div>
	);
}
