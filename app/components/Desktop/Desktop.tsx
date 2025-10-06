'use client';

import React, { useState } from 'react';
import { useFileSystemContext } from '@/app/lib/FileSystemContext';
import { useWindowContext } from '@/app/lib/WindowContext';
import { COLORS, Z_INDEX, DESKTOP_GRID } from '@/app/lib/constants';
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

	const {
		desktopIcons,
		deselectAllIcons,
		createFolder,
		createFile,
		createDesktopIcon,
		getItemByPath,
	} = useFileSystemContext();
	const { openWindow } = useWindowContext();

	// Helper function to find next available desktop position
	const findNextAvailablePosition = () => {
		const maxCols = Math.floor(window.innerWidth / DESKTOP_GRID.ICON_WIDTH);
		const maxRows = Math.floor(
			(window.innerHeight - 100) / DESKTOP_GRID.ICON_HEIGHT
		); // Account for taskbar

		// Check each position starting from top-left
		for (let row = 0; row < maxRows; row++) {
			for (let col = 0; col < maxCols; col++) {
				const position = { x: col, y: row };
				// Check if this position is already occupied
				const isOccupied = desktopIcons.some(
					(icon) =>
						icon.position.x === position.x && icon.position.y === position.y
				);
				if (!isOccupied) {
					return position;
				}
			}
		}
		// If all positions are taken, just use a random one
		return {
			x: Math.floor(Math.random() * maxCols),
			y: Math.floor(Math.random() * maxRows),
		};
	};

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
		const folderName = prompt('Enter folder name:', 'New Folder');

		if (folderName && folderName.trim()) {
			// Create the folder with the user-provided name in the user's Desktop directory
			createFolder('/C:/Users/Guest/Desktop', folderName.trim());

			// Get the created folder and create a desktop icon for it
			// Use setTimeout to ensure the folder is created first
			setTimeout(() => {
				const createdFolder = getItemByPath(`/C:/Users/Guest/Desktop/${folderName.trim()}`);
				if (createdFolder) {
					// Find a good position for the new icon
					const position = findNextAvailablePosition();
					createDesktopIcon(createdFolder, position);
				}
			}, 10);
		}

		setContextMenu(null);
	};

	const handleNewTextFile = () => {
		const fileName = prompt('Enter file name:', 'New Text Document.txt');

		if (fileName && fileName.trim()) {
			const finalFileName = fileName.trim();
			const filePath = `/C:/Users/Guest/Desktop/${finalFileName}`;

			// Create the file on desktop with empty content
			const newFile = createFile('/C:/Users/Guest/Desktop', finalFileName, '');

			if (newFile) {
				// Create a desktop icon for the new file
				// Find a good position for the new icon
				const position = findNextAvailablePosition();
				createDesktopIcon(newFile, position);

				// Open the new file in Notepad automatically
				openWindow({
					title: `${finalFileName} - Notepad`,
					appType: 'notepad',
					position: {
						x: 120 + Math.random() * 100,
						y: 100 + Math.random() * 100,
					},
					size: { width: 440, height: 320 },
					icon: 'NP',
					content: {
						fileName: finalFileName,
						filePath: filePath,
						body: '',
						readOnly: false,
					} as NotepadWindowContent,
				});
			}
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
			const fileDataString = event.dataTransfer.getData('application/file');
			if (!fileDataString) {
				console.log('No file data found in drop event');
				return;
			}

			const fileData = JSON.parse(fileDataString);

			if (fileData && fileData.id && fileData.path) {
				// Get the actual file item from the file system
				const fileItem = getItemByPath(fileData.path);

				if (fileItem) {
					// Calculate drop position (convert to grid coordinates)
					const pixelX = event.clientX - 25; // Offset for icon size
					const pixelY = event.clientY - 25;

					const gridPosition = {
						x: Math.round(pixelX / DESKTOP_GRID.ICON_WIDTH),
						y: Math.round(pixelY / DESKTOP_GRID.ICON_HEIGHT),
					};

					// Ensure position is within bounds (grid coordinates)
					const maxGridX = Math.floor(
						(window.innerWidth - DESKTOP_GRID.ICON_WIDTH) /
							DESKTOP_GRID.ICON_WIDTH
					);
					const maxGridY = Math.floor(
						(window.innerHeight - 160) / DESKTOP_GRID.ICON_HEIGHT
					); // Account for taskbar

					const boundedGridPosition = {
						x: Math.max(0, Math.min(gridPosition.x, maxGridX)),
						y: Math.max(0, Math.min(gridPosition.y, maxGridY)),
					};

					// Create desktop icon
					const newIcon = createDesktopIcon(fileItem, boundedGridPosition);
					console.log('Created desktop icon:', newIcon);
				} else {
					console.warn('File not found:', fileData.path);
				}
			} else {
				console.warn('Invalid file data:', fileData);
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
