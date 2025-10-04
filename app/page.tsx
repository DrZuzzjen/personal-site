'use client';

import { useEffect, useRef } from 'react';
import Window from '@/app/components/Window/Window';
import Desktop from '@/app/components/Desktop/Desktop';
import Taskbar from '@/app/components/Taskbar/Taskbar';
import FileExplorer from '@/app/components/Apps/FileExplorer/FileExplorer';
import { useWindowContext } from '@/app/lib/WindowContext';
import { COLORS } from '@/app/lib/constants';
import type { Window as WindowType } from '@/app/lib/types';

function renderWindowContent(windowData: WindowType) {
	const { content } = windowData;

	if (windowData.appType === 'notepad') {
		let resolvedText: string | null = null;

		if (typeof content === 'string') {
			resolvedText = content;
		} else if (content && typeof content === 'object') {
			const recordContent = content as Record<string, unknown>;
			if (typeof recordContent.fileContent === 'string') {
				resolvedText = recordContent.fileContent;
			} else if (typeof recordContent.body === 'string') {
				resolvedText = recordContent.body;
			}
		}

		const text =
			resolvedText === null || resolvedText === undefined
				? 'Welcome to the Windows 3.1 portfolio prototype. This window is powered by the Phase 2 window manager.'
				: resolvedText;

		return (
			<pre
				style={{
					backgroundColor: COLORS.WIN_WHITE,
					border: `1px solid ${COLORS.BORDER_SHADOW}`,
					color: COLORS.TEXT_BLACK,
					padding: 8,
					margin: 0,
					width: '100%',
					height: '100%',
					overflow: 'auto',
					whiteSpace: 'pre-wrap',
					fontFamily: 'var(--font-mono)',
				}}
			>
				{text}
			</pre>
		);
	}
	if (windowData.appType === 'explorer') {
		let initialPath: string | null | undefined;

		if (typeof content === 'string') {
			initialPath = content;
		} else if (content && typeof content === 'object' && 'folderPath' in content) {
			const folderPath = (content as { folderPath?: unknown }).folderPath;
			if (typeof folderPath === 'string' || folderPath === null) {
				initialPath = folderPath;
			}
		}

		return <FileExplorer initialPath={initialPath} />;
	}
	return (
		<div style={{ color: COLORS.TEXT_BLACK }}>
			{windowData.title} app content coming soon.
		</div>
	);
}

export default function MainPage() {
	const { windows, openWindow } = useWindowContext();
	const bootRef = useRef(false);

	useEffect(() => {
		if (bootRef.current) {
			return;
		}

		if (windows.length > 0) {
			bootRef.current = true;
			return;
		}

		bootRef.current = true;

		openWindow({
			title: 'Welcome.txt - Notepad',
			appType: 'notepad',
			position: { x: 120, y: 100 },
			size: { width: 420, height: 280 },
			icon: 'NP',
			content:
				'Hello! This draggable window is rendered through the new Phase 2 window system. Try dragging it around.',
		});

		openWindow({
			title: 'Program Manager',
			appType: 'explorer',
			position: { x: 360, y: 180 },
			size: { width: 420, height: 320 },
			icon: 'PM',
			content: null,
		});
	}, [openWindow, windows.length]);

	return (
		<>
			{/* Desktop background with icons */}
			<Desktop />

			{/* Windows rendered on top of desktop */}
			{windows.map((windowData) => (
				<Window
					key={windowData.id}
					id={windowData.id}
					title={windowData.title}
					icon={windowData.icon}
				>
					{renderWindowContent(windowData)}
				</Window>
			))}

			{/* Debug info */}
			<div
				style={{
					position: 'fixed',
					top: 16,
					left: 16,
					color: COLORS.TEXT_WHITE,
					textShadow: '1px 1px 0 rgba(0, 0, 0, 0.35)',
					zIndex: 1000,
				}}
			>
				<div style={{ fontSize: 18, fontWeight: 700 }}>
					Windows 3.1 Portfolio
				</div>
				<div style={{ fontSize: 13 }}>Phase 3 Desktop + Windows Demo</div>
			</div>

			{windows.length === 0 ? (
				<div
					style={{
						position: 'fixed',
						bottom: 56,
						left: 16,
						color: COLORS.TEXT_WHITE,
						zIndex: 1000,
					}}
				>
					No windows open. Double-click desktop icons to launch apps.
				</div>
			) : null}

		<Taskbar />
		</>
	);
}



