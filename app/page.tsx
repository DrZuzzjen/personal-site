'use client';

import { useEffect, useRef, useState } from 'react';
import Window from '@/app/components/Window/Window';
import Desktop from '@/app/components/Desktop/Desktop';
import Taskbar from '@/app/components/Taskbar/Taskbar';
import FileExplorer from '@/app/components/Apps/FileExplorer/FileExplorer';
import Notepad from '@/app/components/Apps/Notepad/Notepad';
import Minesweeper from '@/app/components/Apps/Minesweeper/Minesweeper';
import Paint from '@/app/components/Apps/Paint/Paint';
import { BootSequence } from '@/app/components/BootSequence';
import { ErrorDialog, BSOD } from '@/app/components/Dialogs';
import { useWindowContext } from '@/app/lib/WindowContext';
import { COLORS } from '@/app/lib/constants';
import type {
	Window as WindowType,
	WindowContent,
	NotepadWindowContent,
	MinesweeperWindowContent,
	MinesweeperDifficulty,
	PaintWindowContent,
} from '@/app/lib/types';

const DEFAULT_NOTEPAD_MESSAGE =
	'Welcome to the Windows 3.1 portfolio prototype. This window is powered by the Phase 2 window manager.';

const DEFAULT_MINESWEEPER_CONFIG: MinesweeperWindowContent = {
	rows: 9,
	cols: 9,
	mines: 10,
	difficulty: 'beginner',
	firstClickSafe: true,
};

const ALLOWED_MINESWEEPER_DIFFICULTIES: MinesweeperDifficulty[] = [
	'beginner',
	'intermediate',
	'expert',
	'custom',
];

const DEFAULT_PAINT_CONFIG: PaintWindowContent = {
	canvasWidth: 320,
	canvasHeight: 200,
	backgroundColor: '#FFFFFF',
	brushSize: 4,
	palette: ['#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'],
};

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null;
}

function resolveNotepadContent(content: WindowContent | undefined): NotepadWindowContent {
	if (typeof content === 'string') {
		return {
			filePath: null,
			fileName: 'Untitled.txt',
			body: content,
			readOnly: true,
		};
	}

	if (isRecord(content)) {
		let filePath: string | null = null;
		if ('filePath' in content) {
			const candidate = (content as Record<string, unknown>).filePath;
			if (typeof candidate === 'string') {
				filePath = candidate;
			} else if (candidate === null) {
				filePath = null;
			}
		}

		let fileName: string | null = null;
		if ('fileName' in content) {
			const candidate = (content as Record<string, unknown>).fileName;
			if (typeof candidate === 'string') {
				fileName = candidate;
			} else if (candidate === null) {
				fileName = null;
			}
		}

		const fallbackName =
			fileName ?? (filePath ? filePath.split('/').pop() ?? null : null) ?? 'Untitled.txt';

		const body =
			'body' in content && typeof content.body === 'string'
				? (content.body as string)
				: DEFAULT_NOTEPAD_MESSAGE;

		const readOnly =
			'readOnly' in content && typeof content.readOnly === 'boolean'
				? (content.readOnly as boolean)
				: true;

		return {
			filePath,
			fileName: fallbackName,
			body,
			readOnly,
		};
	}

	return {
		filePath: null,
		fileName: 'Untitled.txt',
		body: DEFAULT_NOTEPAD_MESSAGE,
		readOnly: true,
	};
}

function resolveExplorerPath(content: WindowContent | undefined): string | null {
	if (typeof content === 'string') {
		return content;
	}

	if (isRecord(content) && 'folderPath' in content) {
		const candidate = (content as Record<string, unknown>).folderPath;
		if (typeof candidate === 'string') {
			return candidate;
		}
		if (candidate === null) {
			return null;
		}
	}

	return null;
}

function resolveMinesweeperContent(content: WindowContent | undefined): MinesweeperWindowContent {
	if (isRecord(content)) {
		const rows =
			typeof content.rows === 'number' ? content.rows : DEFAULT_MINESWEEPER_CONFIG.rows;
		const cols =
			typeof content.cols === 'number' ? content.cols : DEFAULT_MINESWEEPER_CONFIG.cols;
		const mines =
			typeof content.mines === 'number' ? content.mines : DEFAULT_MINESWEEPER_CONFIG.mines;

		let difficulty = DEFAULT_MINESWEEPER_CONFIG.difficulty;
		if (typeof content.difficulty === 'string') {
			const candidate = content.difficulty as string;
			if (
				ALLOWED_MINESWEEPER_DIFFICULTIES.includes(
					candidate as MinesweeperDifficulty,
				)
			) {
				difficulty = candidate as MinesweeperDifficulty;
			}
		}

		const firstClickSafe =
			typeof content.firstClickSafe === 'boolean'
				? (content.firstClickSafe as boolean)
				: DEFAULT_MINESWEEPER_CONFIG.firstClickSafe;

		return {
			rows,
			cols,
			mines,
			difficulty,
			firstClickSafe,
		};
	}

	return { ...DEFAULT_MINESWEEPER_CONFIG };
}

function resolvePaintContent(content: WindowContent | undefined): PaintWindowContent {
	if (isRecord(content)) {
		const canvasWidth =
			typeof content.canvasWidth === 'number'
				? (content.canvasWidth as number)
				: DEFAULT_PAINT_CONFIG.canvasWidth;
		const canvasHeight =
			typeof content.canvasHeight === 'number'
				? (content.canvasHeight as number)
				: DEFAULT_PAINT_CONFIG.canvasHeight;
		const backgroundColor =
			typeof content.backgroundColor === 'string'
				? (content.backgroundColor as string)
				: DEFAULT_PAINT_CONFIG.backgroundColor;
		const brushSize =
			typeof content.brushSize === 'number'
				? (content.brushSize as number)
				: DEFAULT_PAINT_CONFIG.brushSize;

		let palette = DEFAULT_PAINT_CONFIG.palette;
		if (Array.isArray(content.palette)) {
			const validColors = (content.palette as unknown[]).filter(
				(value): value is string => typeof value === 'string',
			);
			if (validColors.length > 0) {
				palette = validColors;
			}
		}

		return {
			canvasWidth,
			canvasHeight,
			backgroundColor,
			brushSize,
			palette: [...palette],
		};
	}

	return {
		canvasWidth: DEFAULT_PAINT_CONFIG.canvasWidth,
		canvasHeight: DEFAULT_PAINT_CONFIG.canvasHeight,
		backgroundColor: DEFAULT_PAINT_CONFIG.backgroundColor,
		brushSize: DEFAULT_PAINT_CONFIG.brushSize,
		palette: [...DEFAULT_PAINT_CONFIG.palette],
	};
}

function renderWindowContent(windowData: WindowType, onProtectedDelete?: (filePath: string, fileName: string) => void) {
	switch (windowData.appType) {
		case 'notepad': {
			const notepadProps = resolveNotepadContent(windowData.content);
			return <Notepad {...notepadProps} />;
		}
		case 'explorer': {
			const initialPath = resolveExplorerPath(windowData.content);
			return <FileExplorer initialPath={initialPath} onProtectedDelete={onProtectedDelete} />;
		}
		case 'minesweeper': {
			const config = resolveMinesweeperContent(windowData.content);
			return <Minesweeper {...config} />;
		}
		case 'paint': {
			const config = resolvePaintContent(windowData.content);
			return <Paint {...config} />;
		}
		default:
			return (
				<div style={{ color: COLORS.TEXT_BLACK }}>
					{windowData.title} app content coming soon.
				</div>
			);
	}
}

export default function MainPage() {
	const { windows, openWindow } = useWindowContext();
	const bootRef = useRef(false);
	const [bootComplete, setBootComplete] = useState(() => {
		if (typeof window !== 'undefined') {
			return localStorage.getItem('hasBooted') === 'true';
		}
		return false;
	});

	// Easter egg dialog states
	const [errorDialog, setErrorDialog] = useState<{
		visible: boolean;
		message: string;
		title?: string;
	}>({
		visible: false,
		message: '',
		title: 'Error',
	});

	const [bsod, setBsod] = useState({
		visible: false,
		message: '',
	});

	useEffect(() => {
		if (bootComplete && typeof window !== 'undefined') {
			localStorage.setItem('hasBooted', 'true');
		}
	}, [bootComplete]);

	useEffect(() => {
		if (bootRef.current || !bootComplete) {
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
			size: { width: 440, height: 320 },
			icon: 'NP',
			content: {
				fileName: 'Welcome.txt',
				filePath: null,
				body: 'Hello! This draggable window is rendered through the new Phase 2 window system. Try dragging it around.',
				readOnly: true,
			},
		});

		openWindow({
			title: 'Program Manager',
			appType: 'explorer',
			position: { x: 360, y: 180 },
			size: { width: 420, height: 320 },
			icon: 'PM',
			content: { folderPath: null },
		});
	}, [openWindow, windows.length, bootComplete]);

	// Easter egg handlers for protected file operations
	const handleProtectedDelete = (filePath: string, fileName: string) => {
		if (fileName === 'About.txt') {
			// Trigger BSOD for About.txt
			setBsod({
				visible: true,
				message: `Windows 3.1 Portfolio Edition

A fatal exception 0xC0FFEE has occurred at 0028:C001CAFE in VXD
RESUME(01) + 00000420. The current application will be terminated.

You tried to delete my About file? Really?

* Press any key to continue your job search
* Press CTRL+ALT+DEL to hire me immediately

Press any key to continue your portfolio exploration...`,
			});
		} else if (fileName === 'My Documents') {
			// Show error for My Documents
			setErrorDialog({
				visible: true,
				message: 'Cannot delete critical system folder. Nice try! 😏',
				title: 'Error',
			});
		} else if (fileName === 'My Computer') {
			// Show error for My Computer
			setErrorDialog({
				visible: true,
				message: 'Error: Access denied. This is a critical system file.',
				title: 'Error',
			});
		} else {
			// Default protected file error
			setErrorDialog({
				visible: true,
				message: 'Cannot delete protected system file.',
				title: 'Error',
			});
		}
	};

	if (!bootComplete) {
		return <BootSequence onBootComplete={() => setBootComplete(true)} />;
	}

	return (
		<>
			<Desktop />

			{windows.map((windowData) => (
				<Window
					key={windowData.id}
					id={windowData.id}
					title={windowData.title}
					icon={windowData.icon}
				>
					{renderWindowContent(windowData, handleProtectedDelete)}
				</Window>
			))}

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

			{/* Easter Egg Dialogs */}
			<ErrorDialog
				visible={errorDialog.visible}
				message={errorDialog.message}
				title={errorDialog.title}
				onClose={() =>
					setErrorDialog({ visible: false, message: '', title: 'Error' })
				}
			/>

			<BSOD
				visible={bsod.visible}
				message={bsod.message}
				onDismiss={() => setBsod({ visible: false, message: '' })}
			/>
		</>
	);
}
