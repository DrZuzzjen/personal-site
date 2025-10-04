'use client';

import React, { useState, useRef } from 'react';
import { useFileSystemContext } from '@/app/lib/FileSystemContext';
import { useWindowContext } from '@/app/lib/WindowContext';
import { COLORS, DESKTOP_GRID } from '@/app/lib/constants';
import { useIconDrag } from './useIconDrag';
import type {
	DesktopIcon as DesktopIconType,
	FileSystemItem,
	NotepadWindowContent,
	MinesweeperWindowContent,
	PaintWindowContent,
	SnakeWindowContent,
	CameraWindowContent,
	WindowContent,
} from '@/app/lib/types';

interface DesktopIconProps {
	icon: DesktopIconType;
	onProtectedDelete?: (filePath: string, fileName: string) => void;
}

interface LaunchConfig {
	title: string;
	appType:
		| 'notepad'
		| 'paint'
		| 'minesweeper'
		| 'explorer'
		| 'snake'
		| 'camera'
		| 'tv'
		| 'chatbot';
	position: { x: number; y: number };
	size: { width: number; height: number };
	icon?: string;
	content?: WindowContent;
}

const DEFAULT_LAUNCH_POSITION = { x: 140, y: 110 };
const NOTEPAD_WINDOW_SIZE = { width: 520, height: 380 };
const MINESWEEPER_WINDOW_SIZE = { width: 360, height: 440 };
const PAINT_WINDOW_SIZE = { width: 800, height: 600 }; // Compact but roomy for new sidebar layout
const CAMERA_WINDOW_SIZE = { width: 720, height: 580 }; // Good size for camera interface
const TV_WINDOW_SIZE = { width: 880, height: 720 }; // Good size for retro TV with controls
const PAINT_PALETTE = [
	'#000000',
	'#FFFFFF',
	'#FF0000',
	'#00FF00',
	'#0000FF',
	'#FFFF00',
	'#FF00FF',
	'#00FFFF',
];

function createNotepadLaunch(
	item: FileSystemItem,
	overrides?: Partial<NotepadWindowContent>
): LaunchConfig {
	const baseContent: NotepadWindowContent = {
		filePath: item.path,
		fileName: item.name,
		body: item.content ?? '',
		readOnly: true,
	};

	const mergedContent: NotepadWindowContent = {
		...baseContent,
		...overrides,
	};

	return {
		title: `${item.name} - Notepad`,
		appType: 'notepad',
		position: DEFAULT_LAUNCH_POSITION,
		size: NOTEPAD_WINDOW_SIZE,
		icon: 'NP',
		content: mergedContent,
	};
}

function createUnsupportedFileLaunch(
	item: FileSystemItem,
	message: string
): LaunchConfig {
	return createNotepadLaunch(item, {
		body: message,
	});
}

function createPaintLaunch(): LaunchConfig {
	const content: PaintWindowContent = {
		canvasWidth: 600, // Larger canvas for new design
		canvasHeight: 400,
		backgroundColor: '#FFFFFF',
		brushSize: 6, // Slightly larger default brush
		palette: PAINT_PALETTE,
	};

	return {
		title: 'Paint',
		appType: 'paint',
		position: { x: 180, y: 120 },
		size: PAINT_WINDOW_SIZE,
		icon: 'PT',
		content,
	};
}

function createMinesweeperLaunch(): LaunchConfig {
	const content: MinesweeperWindowContent = {
		rows: 9,
		cols: 9,
		mines: 10,
		difficulty: 'beginner',
		firstClickSafe: true,
	};

	return {
		title: 'Minesweeper',
		appType: 'minesweeper',
		position: { x: 220, y: 160 },
		size: MINESWEEPER_WINDOW_SIZE,
		icon: 'MS',
		content,
	};
}

function createTerminalLaunch(): LaunchConfig {
	return {
		title: 'Terminal',
		appType: 'terminal',
		position: { x: 180, y: 120 },
		size: { width: 820, height: 540 },
		icon: 'CMD',
		content: {},
	};
}

function createSnakeLaunch(): LaunchConfig {
	return {
		title: 'Snake.exe',
		appType: 'snake',
		position: { x: 200, y: 140 },
		size: { width: 850, height: 580 },
		icon: 'SN',
		content: {},
	};
}

function createCameraLaunch(): LaunchConfig {
	const content: CameraWindowContent = {
		isActive: false,
		hasPermission: false,
		error: null,
	};

	return {
		title: 'Camera',
		appType: 'camera',
		position: { x: 160, y: 80 },
		size: CAMERA_WINDOW_SIZE,
		icon: '📹',
		content,
	};
}

function createTVLaunch(): LaunchConfig {
	return {
		title: 'TV',
		appType: 'tv',
		position: { x: 120, y: 60 },
		size: TV_WINDOW_SIZE,
		icon: '📺',
	};
}

function createChatbotLaunch(): LaunchConfig {
	return {
		title: 'MSN Messenger - Claude Bot',
		appType: 'chatbot',
		position: { x: 100, y: 80 },
		size: { width: 480, height: 620 },
		icon: '💬',
		content: {},
	};
}

function getLaunchConfigForFile(item: FileSystemItem): LaunchConfig | null {
	if (item.extension === 'txt') {
		return createNotepadLaunch(item);
	}

	if (item.extension === 'exe') {
		const exeName = item.name.toLowerCase();

		if (exeName.includes('paint')) {
			return createPaintLaunch();
		}

		if (exeName.includes('minesweeper')) {
			return createMinesweeperLaunch();
		}

		if (exeName.includes('notepad')) {
			return createNotepadLaunch(item, {
				body: 'Welcome to Notepad!\n\nThis is a simple text editor application.',
			});
		}

		if (exeName.includes('snake')) {
			return createSnakeLaunch();
		}

		if (exeName.includes('terminal')) {
			return createTerminalLaunch();
		}

		if (exeName.includes('camera')) {
			return createCameraLaunch();
		}

		if (exeName.includes('tv')) {
			return createTVLaunch();
		}

		if (exeName.includes('msn') || exeName.includes('messenger')) {
			return createChatbotLaunch();
		}

		return createUnsupportedFileLaunch(
			item,
			`No application handler is defined for ${item.name}.`
		);
	}

	if (item.content) {
		return createNotepadLaunch(item);
	}

	if (item.extension === 'png' && item.imageData) {
		// Open PNG files in Paint
		const content: PaintWindowContent = {
			canvasWidth: 640,
			canvasHeight: 480,
			backgroundColor: '#FFFFFF',
			brushSize: 4,
			palette: PAINT_PALETTE,
			backgroundImage: item.imageData, // Load the screenshot as background
		};

		return {
			title: `${item.name} - Paint`,
			appType: 'paint',
			position: { x: 180, y: 120 },
			size: PAINT_WINDOW_SIZE,
			icon: 'PT',
			content,
		};
	}

	if (item.extension === 'pdf') {
		return createUnsupportedFileLaunch(
			item,
			'This preview is not available yet. Download functionality is coming in a later phase.'
		);
	}

	return createUnsupportedFileLaunch(
		item,
		`No application is associated with "${item.name}" yet.`
	);
}

export default function DesktopIcon({
	icon,
	onProtectedDelete,
}: DesktopIconProps) {
	const [lastClickTime, setLastClickTime] = useState(0);
	const iconRef = useRef<HTMLDivElement>(null);
	const [contextMenu, setContextMenu] = useState<{
		x: number;
		y: number;
	} | null>(null);

	const {
		selectIcon,
		getItemByPath,
		updateIconPosition,
		rootItems,
		deleteItem,
	} = useFileSystemContext();

	const { openWindow } = useWindowContext();

	// Get the file system item data for this icon
	// First try direct ID match, then search recursively through the entire tree
	const findFileSystemItem = (): FileSystemItem | null => {
		// First try direct ID match in top-level items
		const directMatch = rootItems.find(
			(item: FileSystemItem) => item.id === icon.fileSystemId
		);
		if (directMatch) return directMatch;

		// Then search recursively through all items
		const searchRecursively = (
			items: FileSystemItem[]
		): FileSystemItem | null => {
			for (const item of items) {
				if (item.id === icon.fileSystemId) return item;
				if (item.children) {
					const found = searchRecursively(item.children);
					if (found) return found;
				}
			}
			return null;
		};

		return searchRecursively(rootItems);
	};

	const fileSystemItem: FileSystemItem | null = findFileSystemItem();

	// Convert grid position to pixel position
	const pixelPosition = {
		x: icon.position.x * DESKTOP_GRID.ICON_WIDTH,
		y: icon.position.y * DESKTOP_GRID.ICON_HEIGHT,
	};

	// Use the drag hook for icon repositioning
	const { isDragging, handleMouseDown } = useIconDrag({
		iconId: icon.id,
		currentPosition: pixelPosition,
		onPositionChange: (
			iconId: string,
			newPixelPos: { x: number; y: number }
		) => {
			// Convert pixel position back to grid position for storage
			const gridPos = {
				x: Math.round(newPixelPos.x / DESKTOP_GRID.ICON_WIDTH),
				y: Math.round(newPixelPos.y / DESKTOP_GRID.ICON_HEIGHT),
			};
			updateIconPosition(iconId, gridPos);
		},
	});

	if (!fileSystemItem) {
		// If we can't find the file system item, don't render the icon
		return null;
	}

	const handleClick = (event: React.MouseEvent) => {
		event.stopPropagation(); // Prevent desktop deselection

		const now = Date.now();
		const timeSinceLastClick = now - lastClickTime;

		if (timeSinceLastClick < 500) {
			// Double-click detected - open the item
			handleDoubleClick();
		} else {
			// Single-click - select the icon
			selectIcon(icon.id);
		}

		setLastClickTime(now);
	};

	const handleDoubleClick = () => {
		// Open a window for this item
		if (fileSystemItem.type === 'folder') {
			openWindow({
				title: fileSystemItem.name,
				appType: 'explorer',
				position: { x: 100, y: 100 },
				size: { width: 400, height: 300 },
				content: { folderPath: fileSystemItem.path },
			});
			return;
		}

		const launchConfig = getLaunchConfigForFile(fileSystemItem);
		if (!launchConfig) {
			return;
		}

		openWindow(launchConfig);
	};

	const handleContextMenu = (event: React.MouseEvent) => {
		event.preventDefault();
		event.stopPropagation();
		setContextMenu({
			x: event.clientX,
			y: event.clientY,
		});
	};

	const handleDeleteItem = () => {
		if (fileSystemItem.isProtected) {
			// Trigger easter egg for protected items
			if (onProtectedDelete) {
				onProtectedDelete(fileSystemItem.path, fileSystemItem.name);
			}
			return;
		}

		// Delete non-protected items normally
		const success = deleteItem(fileSystemItem.path);
		if (!success) {
			// This shouldn't happen for non-protected items, but just in case
			if (onProtectedDelete) {
				onProtectedDelete(fileSystemItem.path, fileSystemItem.name);
			}
		}
	};

	const getIconDisplay = (
		item: FileSystemItem
	): { symbol: string; color: string } => {
		if (item.isSystem) {
			if (item.name === 'My Computer')
				return { symbol: '🖥️', color: '#000080' };
			if (item.name === 'Recycle Bin')
				return { symbol: '🗑️', color: '#808080' };
		}

		if (item.type === 'folder') {
			return { symbol: '📁', color: '#FFD700' };
		}

		if (item.extension === 'txt') {
			return { symbol: '📄', color: '#FFFFFF' };
		}

		if (item.extension === 'exe') {
			const exeName = item.name.toLowerCase();
			if (exeName.includes('paint')) {
				return { symbol: '🎨', color: '#C0C0C0' };
			}
			if (exeName.includes('minesweeper')) {
				return { symbol: '💣', color: '#C0C0C0' };
			}
			if (exeName.includes('notepad')) {
				return { symbol: '📝', color: '#C0C0C0' };
			}
			if (exeName.includes('snake')) {
				return { symbol: '🐍', color: '#C0C0C0' };
			}
			if (exeName.includes('camera')) {
				return { symbol: '📷', color: '#C0C0C0' };
			}
			if (exeName.includes('tv')) {
				return { symbol: '📺', color: '#C0C0C0' };
			}
			return { symbol: 'EXE', color: '#C0C0C0' };
		}

		return { symbol: 'FILE', color: '#C0C0C0' };
	};

	const iconDisplay = getIconDisplay(fileSystemItem);

	return (
		<>
			<div
				ref={iconRef}
				onClick={handleClick}
				onMouseDown={handleMouseDown}
				onContextMenu={handleContextMenu}
				style={{
					position: 'absolute',
					left: pixelPosition.x,
					top: pixelPosition.y,
					width: DESKTOP_GRID.ICON_WIDTH,
					height: DESKTOP_GRID.ICON_HEIGHT,
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'center',
					cursor: isDragging ? 'grabbing' : 'pointer',
					userSelect: 'none',
					backgroundColor: icon.isSelected
						? 'rgba(0, 120, 215, 0.3)'
						: 'transparent',
					borderRadius: 4,
					padding: 4,
				}}
			>
				{/* Icon */}
				<div
					style={{
						width: 32,
						height: 32,
						backgroundColor: iconDisplay.color,
						border: `2px solid ${COLORS.BORDER_SHADOW}`,
						borderTopColor: COLORS.BORDER_LIGHT,
						borderLeftColor: COLORS.BORDER_LIGHT,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						fontSize: '16px',
						marginBottom: 4,
					}}
				>
					{iconDisplay.symbol}
				</div>

				{/* Label */}
				<div
					style={{
						color: COLORS.TEXT_WHITE,
						fontSize: '11px',
						textAlign: 'center',
						textShadow: '1px 1px 1px rgba(0, 0, 0, 0.8)',
						lineHeight: '12px',
						wordWrap: 'break-word',
						maxWidth: '70px',
					}}
				>
					{fileSystemItem.name}
				</div>
			</div>

			{/* Context Menu */}
			{contextMenu && (
				<>
					{/* Invisible overlay to catch clicks outside menu */}
					<div
						style={{
							position: 'fixed',
							top: 0,
							left: 0,
							right: 0,
							bottom: 0,
							zIndex: 10001,
						}}
						onClick={() => setContextMenu(null)}
						onContextMenu={(e) => {
							e.preventDefault();
							setContextMenu(null);
						}}
					/>

					{/* Context menu */}
					<div
						style={{
							position: 'fixed',
							left: contextMenu.x,
							top: contextMenu.y,
							backgroundColor: COLORS.WIN_GRAY,
							border: `2px outset ${COLORS.WIN_GRAY}`,
							boxShadow: '2px 2px 4px rgba(0,0,0,0.3)',
							zIndex: 10002,
							minWidth: '120px',
							fontFamily: 'MS Sans Serif, sans-serif',
							fontSize: '11px',
						}}
					>
						<div
							style={{
								padding: '4px 12px',
								cursor: 'pointer',
								backgroundColor: 'transparent',
							}}
							onClick={() => {
								handleDoubleClick();
								setContextMenu(null);
							}}
							onMouseEnter={(e) => {
								e.currentTarget.style.backgroundColor = COLORS.WIN_BLUE;
								e.currentTarget.style.color = COLORS.WIN_WHITE;
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.backgroundColor = 'transparent';
								e.currentTarget.style.color = COLORS.TEXT_BLACK;
							}}
						>
							Open
						</div>
						<div
							style={{
								padding: '4px 12px',
								cursor: 'pointer',
								backgroundColor: 'transparent',
								borderTop: '1px solid ' + COLORS.BORDER_SHADOW,
							}}
							onClick={() => {
								handleDeleteItem();
								setContextMenu(null);
							}}
							onMouseEnter={(e) => {
								e.currentTarget.style.backgroundColor = COLORS.WIN_BLUE;
								e.currentTarget.style.color = COLORS.WIN_WHITE;
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.backgroundColor = 'transparent';
								e.currentTarget.style.color = COLORS.TEXT_BLACK;
							}}
						>
							Delete
						</div>
					</div>
				</>
			)}
		</>
	);
}
