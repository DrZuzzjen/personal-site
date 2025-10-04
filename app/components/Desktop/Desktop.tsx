'use client';

import React, { useState } from 'react';
import { useFileSystemContext } from '@/app/lib/FileSystemContext';
import { useWindowContext } from '@/app/lib/WindowContext';
import { COLORS, Z_INDEX } from '@/app/lib/constants';
import type { NotepadWindowContent } from '@/app/lib/types';
import DesktopIcon from './DesktopIcon';
import ContextMenu from './ContextMenu';

interface DesktopProps {
	className?: string;
	onProtectedDelete?: (filePath: string, fileName: string) => void;
}

export default function Desktop({
	className,
	onProtectedDelete,
}: DesktopProps) {
	const [contextMenu, setContextMenu] = useState<{
		x: number;
		y: number;
	} | null>(null);
	const [isDragOver, setIsDragOver] = useState(false);

	const { desktopIcons, deselectAllIcons, createFolder, createFile, createDesktopIcon, getItemByPath } =
		useFileSystemContext();
	const { openWindow } = useWindowContext();

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
		createFolder('/Desktop', `New Folder`);
		setContextMenu(null);
	};

	const handleNewTextFile = () => {
		const fileName = 'New Text Document.txt';
		const filePath = `/Desktop/${fileName}`;

		// Create the file on desktop with empty content
		const newFile = createFile('/Desktop', fileName, '');

		if (newFile) {
			// Open the new file in Notepad automatically
			openWindow({
				title: `${fileName} - Notepad`,
				appType: 'notepad',
				position: {
					x: 120 + Math.random() * 100,
					y: 100 + Math.random() * 100,
				},
				size: { width: 440, height: 320 },
				icon: 'NP',
				content: {
					fileName: fileName,
					filePath: filePath,
					body: '',
					readOnly: false,
				} as NotepadWindowContent,
			});
		}

		setContextMenu(null);
	};

	const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
		event.preventDefault();
		event.dataTransfer.dropEffect = 'copy';
		setIsDragOver(true);
	};

	const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
		event.preventDefault();
		setIsDragOver(false);
	};

	const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
		event.preventDefault();
		setIsDragOver(false);

		try {
			const fileData = JSON.parse(event.dataTransfer.getData('application/file'));
			
			if (fileData && fileData.id) {
				// Get the actual file item from the file system
				const fileItem = getItemByPath(fileData.path);
				
				if (fileItem) {
					// Calculate drop position
					const dropPosition = {
						x: event.clientX - 25, // Offset for icon size
						y: event.clientY - 25,
					};

					// Create desktop icon
					createDesktopIcon(fileItem, dropPosition);
				}
			}
		} catch (error) {
			console.error('Error handling file drop:', error);
		}
	};

	const handleRefresh = () => {
		// Simple refresh - could reload icons or refresh the desktop
		console.log('Desktop refreshed');
		setContextMenu(null);
	};

	const handleProperties = () => {
		// Properties dialog - could show desktop properties
		alert(
			'Desktop Properties\n\nThis is the Windows 3.1 desktop environment.\nBuilt with React and TypeScript.'
		);
		setContextMenu(null);
	};

	return (
		<div
			className={className}
			onClick={handleDesktopClick}
			onContextMenu={handleDesktopRightClick}
			onDragOver={handleDragOver}
			onDragLeave={handleDragLeave}
			onDrop={handleDrop}
			style={{
				position: 'fixed',
				top: 0,
				left: 0,
				width: '100vw',
				height: '100vh',
				backgroundColor: isDragOver ? '#e6f3ff' : COLORS.DESKTOP_TEAL,
				zIndex: Z_INDEX.DESKTOP,
				overflow: 'hidden',
				cursor: 'default',
				userSelect: 'none',
				transition: 'background-color 0.2s ease',
			}}
		>
			{desktopIcons.map((icon) => (
				<DesktopIcon
					key={icon.id}
					icon={icon}
					onProtectedDelete={onProtectedDelete}
				/>
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
