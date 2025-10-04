'use client';

import { useState, useEffect } from 'react';
import PostScreen from './PostScreen';
import MemoryCheck from './MemoryCheck';
import LoadingScreen from './LoadingScreen';

export interface BootSequenceProps {
	onBootComplete: () => void;
	skipBoot?: boolean;
}

type BootStage = 'post' | 'memory' | 'loading' | 'complete';

export default function BootSequence({
	onBootComplete,
	skipBoot = false,
}: BootSequenceProps) {
	const [currentStage, setCurrentStage] = useState<BootStage>('post');

	useEffect(() => {
		if (skipBoot) {
			onBootComplete();
			return;
		}
	}, [skipBoot, onBootComplete]);

	useEffect(() => {
		if (skipBoot) return;

		let timeout: NodeJS.Timeout;

		switch (currentStage) {
			case 'post':
				// POST screen shows for 3 seconds
				timeout = setTimeout(() => {
					setCurrentStage('memory');
				}, 3000);
				break;

			case 'memory':
				// Memory check shows for 3 seconds
				timeout = setTimeout(() => {
					setCurrentStage('loading');
				}, 3000);
				break;

			case 'loading':
				// Loading screen shows for 2 seconds
				timeout = setTimeout(() => {
					setCurrentStage('complete');
				}, 2000);
				break;

			case 'complete':
				onBootComplete();
				break;
		}

		return () => {
			if (timeout) {
				clearTimeout(timeout);
			}
		};
	}, [currentStage, skipBoot, onBootComplete]);

	// Handle skip on any key press
	useEffect(() => {
		const handleKeyPress = () => {
			if (!skipBoot) {
				onBootComplete();
			}
		};

		window.addEventListener('keydown', handleKeyPress);
		return () => window.removeEventListener('keydown', handleKeyPress);
	}, [skipBoot, onBootComplete]);

	if (skipBoot) {
		return null;
	}

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
				fontFamily: 'monospace',
			}}
		>
			{currentStage === 'post' && <PostScreen />}
			{currentStage === 'memory' && <MemoryCheck />}
			{currentStage === 'loading' && <LoadingScreen />}

			{/* Skip button */}
			<div
				style={{
					position: 'absolute',
					bottom: '20px',
					right: '20px',
					color: '#808080',
					fontSize: '12px',
					opacity: 0.7,
				}}
			>
				Press any key to skip...
			</div>
		</div>
	);
}
