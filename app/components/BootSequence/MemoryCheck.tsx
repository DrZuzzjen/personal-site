'use client';

import { useState, useEffect } from 'react';

const EASTER_EGG_MESSAGES = [
	'Detecting creativity... FOUND',
	'Loading personality drivers... OK',
	'Initializing humor.dll... SUCCESS',
	'Calibrating mouse... DOUBLE-CLICK DETECTED',
	'Mounting resume.pdf... READY',
	'Installing confidence.sys... 100%',
	'Scanning for coffee... NOT FOUND (please provide)',
	'Checking sense of humor... EXCELLENT',
	'Loading developer mode... ACTIVATED',
] as const;

export default function MemoryCheck() {
	const [memoryCount, setMemoryCount] = useState(0);
	const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
	const [showMessage, setShowMessage] = useState(false);

	// Memory counting animation
	useEffect(() => {
		const interval = setInterval(() => {
			setMemoryCount((prev) => {
				const next = prev + 256; // Count in 256 KB increments
				if (next >= 4096) {
					clearInterval(interval);
					return 4096;
				}
				return next;
			});
		}, 200); // Update every 200ms

		return () => clearInterval(interval);
	}, []);

	// Show easter egg messages periodically
	useEffect(() => {
		const messageInterval = setInterval(() => {
			if (currentMessageIndex < EASTER_EGG_MESSAGES.length) {
				setShowMessage(true);
				setTimeout(() => {
					setShowMessage(false);
					setCurrentMessageIndex((prev) => prev + 1);
				}, 800); // Show each message for 800ms
			}
		}, 1000); // Show new message every 1000ms

		return () => clearInterval(messageInterval);
	}, [currentMessageIndex]);

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
			<div style={{ marginBottom: '20px' }}>Testing memory...</div>

			<div
				style={{ marginBottom: '20px', fontSize: '16px', fontWeight: 'bold' }}
			>
				Memory: {memoryCount.toLocaleString()} KB
				{memoryCount >= 4096 && (
					<span style={{ color: '#00FF00', marginLeft: '10px' }}>OK</span>
				)}
			</div>

			{/* Easter egg messages */}
			{showMessage && currentMessageIndex < EASTER_EGG_MESSAGES.length && (
				<div
					style={{
						color: '#00FF00',
						marginBottom: '10px',
						opacity: showMessage ? 1 : 0,
						transition: 'opacity 0.2s',
					}}
				>
					{EASTER_EGG_MESSAGES[currentMessageIndex]}
				</div>
			)}

			{/* Final status when memory check is complete */}
			{memoryCount >= 4096 && (
				<div style={{ marginTop: '20px' }}>
					<div style={{ color: '#00FF00' }}>
						System initialization complete.
					</div>
					<div style={{ color: '#00FF00' }}>Ready to load Windows...</div>
				</div>
			)}
		</div>
	);
}
