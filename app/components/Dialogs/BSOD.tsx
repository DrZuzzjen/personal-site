'use client';

import { useEffect, useState } from 'react';

export interface BSODProps {
	visible: boolean;
	onDismiss: () => void;
	message?: string;
}

const DEFAULT_BSOD_MESSAGE = `Windows 3.1 Portfolio Edition

A fatal exception 0xC0FFEE has occurred at 0028:C001CAFE in VXD
RESUME(01) + 00000420. The current application will be terminated.

* Press any key to continue your job search
* Press CTRL+ALT+DEL to hire me immediately

Your portfolio experience will now restart...`;

export default function BSOD({ visible, onDismiss, message }: BSODProps) {
	const [showContinue, setShowContinue] = useState(false);

	// Show "Press any key" text after a brief delay
	useEffect(() => {
		if (!visible) {
			setShowContinue(false);
			return;
		}

		const timer = setTimeout(() => {
			setShowContinue(true);
		}, 1500); // 1.5 second delay

		return () => clearTimeout(timer);
	}, [visible]);

	// Handle any key press to dismiss
	useEffect(() => {
		if (!visible) return;

		const handleKeyDown = (event: KeyboardEvent) => {
			event.preventDefault();
			onDismiss();
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [visible, onDismiss]);

	if (!visible) return null;

	return (
		<div
			style={{
				position: 'fixed',
				top: 0,
				left: 0,
				width: '100vw',
				height: '100vh',
				backgroundColor: '#0000AA',
				color: '#FFFFFF',
				fontFamily: 'Courier New, monospace',
				fontSize: '16px',
				zIndex: 9999,
				padding: '40px',
				overflow: 'hidden',
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'flex-start',
			}}
		>
			{/* BSOD Content */}
			<div style={{ lineHeight: 1.6, whiteSpace: 'pre-line' }}>
				{message || DEFAULT_BSOD_MESSAGE}
			</div>

			{/* Press any key message with blinking cursor */}
			{showContinue && (
				<div
					style={{
						marginTop: 'auto',
						marginBottom: '40px',
						display: 'flex',
						alignItems: 'center',
						gap: '4px',
					}}
				>
					<span>Press any key to continue</span>
					<BlinkingCursor />
				</div>
			)}
		</div>
	);
}

// Blinking cursor component
function BlinkingCursor() {
	const [visible, setVisible] = useState(true);

	useEffect(() => {
		const interval = setInterval(() => {
			setVisible((prev) => !prev);
		}, 500); // Blink every 500ms

		return () => clearInterval(interval);
	}, []);

	return (
		<span style={{ opacity: visible ? 1 : 0, fontWeight: 'bold' }}>_</span>
	);
}