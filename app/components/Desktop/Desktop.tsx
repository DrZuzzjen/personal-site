'use client';

import React, { useState } from 'react';
import { useFileSystemContext } from '@/app/lib/FileSystemContext';
import { COLORS, Z_INDEX } from '@/app/lib/constants';
import DesktopIcon from './DesktopIcon';
import ContextMenu from './ContextMenu';

interface DesktopProps {
	className?: string;
	onProtectedDelete?: (filePath: string, fileName: string) => void;
}

export default function Desktop({ className, onProtectedDelete }: DesktopProps) {
	const [contextMenu, setContextMenu] = useState<{
		x: number;
		y: number;
	} | null>(null);

	const { desktopIcons, deselectAllIcons, createFolder, createFile } =
		useFileSystemContext();

	const handleDesktopClick = (event: React.MouseEvent<HTMLDivElement>) => {
		// Only deselect if clicking on the desktop background itself
		if (event.target === event.currentTarget) {
			deselectAllIcons();
			setContextMenu(null); // Close context menu on click
		}
	};

	const handleDesktopRightClick = (event: React.MouseEvent<HTMLDivElement>) => {
		event.preventDefault();

		// Only show context menu if right-clicking on the desktop background
		if (event.target === event.currentTarget) {
			setContextMenu({ x: event.clientX, y: event.clientY });
		}
	};

	const handleContextMenuClose = () => {
		setContextMenu(null);
	};

	const handleNewFolder = () => {
		createFolder('/Desktop', `New Folder ${Date.now()}`);
	};

	const handleNewTextFile = () => {
		createFile(
			'/Desktop',
			`New File ${Date.now()}.txt`,
			'This is a new text file.'
		);
	};

	const handleRefresh = () => {
		// Simple refresh - could reload icons or refresh the desktop
		console.log('Desktop refreshed');
	};

	const handleProperties = () => {
		// Properties dialog - could show desktop properties
		alert(
			'Desktop Properties\n\nThis is the Windows 3.1 desktop environment.\nBuilt with React and TypeScript.'
		);
	};

	return (
		<div
			className={className}
			onClick={handleDesktopClick}
			onContextMenu={handleDesktopRightClick}
			style={{
				position: 'fixed',
				top: 0,
				left: 0,
				width: '100vw',
				height: '100vh',
				backgroundColor: COLORS.DESKTOP_TEAL,
				zIndex: Z_INDEX.DESKTOP,
				overflow: 'hidden',
				cursor: 'default',
				userSelect: 'none',
			}}
		>
			{desktopIcons.map((icon) => (
				<DesktopIcon key={icon.id} icon={icon} onProtectedDelete={onProtectedDelete} />
			))}

			{/* Context Menu */}
			{contextMenu && (
				<ContextMenu
					x={contextMenu.x}
					y={contextMenu.y}
					onClose={handleContextMenuClose}
					onNewFolder={handleNewFolder}
					onNewTextFile={handleNewTextFile}
					onRefresh={handleRefresh}
					onProperties={handleProperties}
				/>
			)}
		</div>
	);
}
