'use client';

import { useEffect, useRef, useState } from 'react';
import Window from '@/app/components/Window/Window';
import Desktop from '@/app/components/Desktop/Desktop';
import Taskbar from '@/app/components/Taskbar/Taskbar';
import FileExplorer from '@/app/components/Apps/FileExplorer/FileExplorer';
import Notepad from '@/app/components/Apps/Notepad/Notepad';
import Minesweeper from '@/app/components/Apps/Minesweeper/Minesweeper';
import Paint from '@/app/components/Apps/Paint/Paint';
import Snake from '@/app/components/Apps/Snake/Snake';
import Camera from '@/app/components/Apps/Camera/Camera';
import TV from '@/app/components/Apps/TV/TV';
import Chatbot from '@/app/components/Apps/Chatbot/Chatbot';
import { BootSequence } from '@/app/components/BootSequence';
import { ErrorDialog, BSOD } from '@/app/components/Dialogs';
import { ShutDownScreen } from '@/app/components/StartMenu';
import MobileWarning from '@/app/components/MobileWarning';
import { useWindowContext } from '@/app/lib/WindowContext';
import { COLORS } from '@/app/lib/constants';
import type {
	Window as WindowType,
	WindowContent,
	NotepadWindowContent,
	MinesweeperWindowContent,
	MinesweeperDifficulty,
	PaintWindowContent,
	SnakeWindowContent,
	CameraWindowContent,
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
	palette: [
		'#000000',
		'#FFFFFF',
		'#FF0000',
		'#00FF00',
		'#0000FF',
		'#FFFF00',
		'#FF00FF',
		'#00FFFF',
	],
};

const DEFAULT_SNAKE_CONFIG: SnakeWindowContent = {
	columns: 30,
	rows: 25,
	initialLength: 4,
	initialSpeedMs: 180,
	speedIncrementMs: 12,
	speedIncreaseEvery: 3,
	minimumSpeedMs: 60,
};

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null;
}

function resolveNotepadContent(
	content: WindowContent | undefined
): NotepadWindowContent {
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
			fileName ??
			(filePath ? filePath.split('/').pop() ?? null : null) ??
			'Untitled.txt';

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

function resolveExplorerPath(
	content: WindowContent | undefined
): string | null {
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

function resolveMinesweeperContent(
	content: WindowContent | undefined
): MinesweeperWindowContent {
	if (isRecord(content)) {
		const rows =
			typeof content.rows === 'number'
				? content.rows
				: DEFAULT_MINESWEEPER_CONFIG.rows;
		const cols =
			typeof content.cols === 'number'
				? content.cols
				: DEFAULT_MINESWEEPER_CONFIG.cols;
		const mines =
			typeof content.mines === 'number'
				? content.mines
				: DEFAULT_MINESWEEPER_CONFIG.mines;

		let difficulty = DEFAULT_MINESWEEPER_CONFIG.difficulty;
		if (typeof content.difficulty === 'string') {
			const candidate = content.difficulty as string;
			if (
				ALLOWED_MINESWEEPER_DIFFICULTIES.includes(
					candidate as MinesweeperDifficulty
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

function resolvePaintContent(
	content: WindowContent | undefined
): PaintWindowContent {
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
				(value): value is string => typeof value === 'string'
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

function resolveSnakeContent(
	content: WindowContent | undefined
): SnakeWindowContent {
	if (isRecord(content)) {
		const columns =
			typeof content.columns === 'number'
				? (content.columns as number)
				: DEFAULT_SNAKE_CONFIG.columns;
		const rows =
			typeof content.rows === 'number'
				? (content.rows as number)
				: DEFAULT_SNAKE_CONFIG.rows;
		const initialLength =
			typeof content.initialLength === 'number'
				? (content.initialLength as number)
				: DEFAULT_SNAKE_CONFIG.initialLength;
		const initialSpeedMs =
			typeof content.initialSpeedMs === 'number'
				? (content.initialSpeedMs as number)
				: DEFAULT_SNAKE_CONFIG.initialSpeedMs;
		const speedIncrementMs =
			typeof content.speedIncrementMs === 'number'
				? (content.speedIncrementMs as number)
				: DEFAULT_SNAKE_CONFIG.speedIncrementMs;
		const speedIncreaseEvery =
			typeof content.speedIncreaseEvery === 'number'
				? (content.speedIncreaseEvery as number)
				: DEFAULT_SNAKE_CONFIG.speedIncreaseEvery;
		const minimumSpeedMs =
			typeof content.minimumSpeedMs === 'number'
				? (content.minimumSpeedMs as number)
				: DEFAULT_SNAKE_CONFIG.minimumSpeedMs;

		return {
			columns,
			rows,
			initialLength,
			initialSpeedMs,
			speedIncrementMs,
			speedIncreaseEvery,
			minimumSpeedMs,
		};
	}

	return { ...DEFAULT_SNAKE_CONFIG };
}

function renderWindowContent(
	windowData: WindowType,
	onProtectedDelete?: (filePath: string, fileName: string) => void
) {
	switch (windowData.appType) {
		case 'notepad': {
			const notepadProps = resolveNotepadContent(windowData.content);
			return <Notepad {...notepadProps} windowId={windowData.id} />;
		}
		case 'explorer': {
			const initialPath = resolveExplorerPath(windowData.content);
			return (
				<FileExplorer
					initialPath={initialPath}
					onProtectedDelete={onProtectedDelete}
				/>
			);
		}
		case 'minesweeper': {
			const config = resolveMinesweeperContent(windowData.content);
			return <Minesweeper {...config} />;
		}
		case 'paint': {
			const config = resolvePaintContent(windowData.content);
			return <Paint {...config} />;
		}
		case 'snake': {
			return <Snake />;
		}
		case 'camera': {
			return <Camera />;
		}
		case 'tv': {
			return <TV />;
		}
		case 'chatbot': {
			return <Chatbot windowRef={undefined} />;
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

	// Start Menu related state
	const [isShutDown, setIsShutDown] = useState(false);

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

	// Mobile warning state
	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
		const checkMobile = () => {
			const mobile =
				/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
				window.innerWidth < 768;
			setIsMobile(mobile);
		};

		checkMobile();
		window.addEventListener('resize', checkMobile);
		return () => window.removeEventListener('resize', checkMobile);
	}, []);

	useEffect(() => {
		if (bootComplete && typeof window !== 'undefined') {
			localStorage.setItem('hasBooted', 'true');
		}
	}, [bootComplete]);

	// Apply saved background color on load
	useEffect(() => {
		if (typeof window !== 'undefined') {
			const savedColor = localStorage.getItem('desktopBgColor');
			if (savedColor) {
				document.body.style.backgroundColor = savedColor;
			}
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

	// Start Menu handlers
	const handleLaunchApp = (appType: string, content?: any) => {
		const position = {
			x: 100 + Math.random() * 200,
			y: 80 + Math.random() * 150,
		};

		switch (appType) {
			case 'paint':
				openWindow({
					title: 'Paint.exe',
					appType: 'paint',
					position,
					size: { width: 400, height: 350 },
					icon: 'PT',
					content: content || DEFAULT_PAINT_CONFIG,
				});
				break;

			case 'minesweeper':
				openWindow({
					title: 'Minesweeper.exe',
					appType: 'minesweeper',
					position,
					size: { width: 320, height: 280 },
					icon: 'MS',
					content: content || DEFAULT_MINESWEEPER_CONFIG,
				});
				break;

			case 'notepad':
				const fileName = content?.fileName || 'Untitled';
				const title = fileName.endsWith('.txt') ? fileName : `${fileName}.txt`;
				openWindow({
					title: `${title} - Notepad`,
					appType: 'notepad',
					position,
					size: { width: 440, height: 320 },
					icon: 'NP',
					content: {
						fileName: content?.fileName || 'Untitled',
						filePath: content?.filePath || null,
						body: content?.content || DEFAULT_NOTEPAD_MESSAGE,
						readOnly: content?.readOnly || false,
					} as NotepadWindowContent,
				});
				break;

			case 'snake':
				openWindow({
					title: 'Snake.exe',
					appType: 'snake',
					position,
					size: { width: 850, height: 580 },
					icon: 'SN',
					content: {},
				});
				break;

			case 'camera':
				openWindow({
					title: 'Camera',
					appType: 'camera',
					position,
					size: { width: 720, height: 580 },
					icon: '📹',
					content: {
						isActive: false,
						hasPermission: false,
						error: null,
					} as CameraWindowContent,
				});
				break;

			case 'tv':
				openWindow({
					title: 'TV',
					appType: 'tv',
					position,
					size: { width: 880, height: 720 },
					icon: '📺',
					content: {},
				});
				break;

			case 'chatbot':
				openWindow({
					title: 'MSN Messenger - Claude Bot',
					appType: 'chatbot',
					position,
					size: { width: 480, height: 620 },
					icon: '💬',
					content: {},
				});
				break;

			case 'file-explorer':
				openWindow({
					title: `${content?.path || 'My Computer'} - File Explorer`,
					appType: 'explorer',
					position,
					size: { width: 480, height: 360 },
					icon: 'FE',
					content: { folderPath: content?.path || null },
				});
				break;
		}
	};

	const handleRestart = () => {
		if (
			confirm(
				'Restart Windows?\n\nThis will close all programs and restart your computer.'
			)
		) {
			// Clear localStorage to trigger boot sequence
			localStorage.removeItem('hasBooted');
			// Reset state
			setBootComplete(false);
			setIsShutDown(false);
			// Could also clear user files and background color if desired
			// localStorage.removeItem('desktopBgColor');
			// Force a full reload to completely reset state
			window.location.reload();
		}
	};

	const handleShutDown = () => {
		if (
			confirm(
				'Shut Down Windows?\n\nThis will close all programs and shut down Windows so you can safely turn off power.'
			)
		) {
			setIsShutDown(true);
		}
	};

	const handleShowSettings = () => {
		// Simple background color picker
		const colors = [
			{ name: 'Teal', value: '#008080' },
			{ name: 'Blue', value: '#000080' },
			{ name: 'Green', value: '#008000' },
			{ name: 'Purple', value: '#800080' },
			{ name: 'Pink', value: '#FF69B4' },
		];

		const colorChoice = prompt(
			'Choose a background color:\n\n' +
				colors.map((c, i) => `${i + 1}. ${c.name}`).join('\n') +
				'\n\nEnter number (1-5):'
		);

		if (colorChoice) {
			const index = parseInt(colorChoice) - 1;
			if (index >= 0 && index < colors.length) {
				const selectedColor = colors[index].value;
				localStorage.setItem('desktopBgColor', selectedColor);
				// Update the desktop background
				document.body.style.backgroundColor = selectedColor;
			}
		}
	};

	const handleShowFind = () => {
		setErrorDialog({
			visible: true,
			message:
				'Find: Files or Folders\n\nSearch functionality coming soon!\n\nFor now, use File Explorer to browse files.',
			title: 'Find',
		});
	};

	const handleShowHelp = () => {
		handleLaunchApp('notepad', {
			fileName: 'Help',
			content:
				'Windows 3.1 Portfolio Help\n\n' +
				'Welcome to the Windows 3.1 Portfolio Experience!\n\n' +
				'How to use:\n' +
				'• Double-click desktop icons to open apps\n' +
				'• Right-click icons or files for context menu\n' +
				'• Drag windows around by their title bar\n' +
				'• Use taskbar buttons to switch between windows\n' +
				'• Click Start button for system controls\n\n' +
				'Applications:\n' +
				'• Paint.exe - Simple drawing program\n' +
				'• Minesweeper.exe - Classic puzzle game\n' +
				'• Notepad.exe - Text editor\n' +
				'• File Explorer - Browse files and folders\n\n' +
				'System Controls:\n' +
				'• Restart Windows - Replay boot sequence\n' +
				'• Shut Down - End the portfolio session\n' +
				'• Settings - Change background color\n\n' +
				'Easter Eggs:\n' +
				'Try deleting protected files for surprises! 😈\n\n' +
				'Press any key during boot to skip the sequence.',
			readOnly: true,
		});
	};

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
		} else if (fileName === 'Recycle Bin') {
			// Funny message for Recycle Bin
			setErrorDialog({
				visible: true,
				message:
					'Cannot delete the Recycle Bin. Where would deleted files go? Into the void? 🗑️',
				title: 'Error',
			});
		} else if (fileName === 'Resume.pdf') {
			// Special message for Resume
			setErrorDialog({
				visible: true,
				message:
					"Hey! That's my resume! You should be downloading it, not deleting it! 📄",
				title: 'Resume Protection',
			});
		} else if (fileName.includes('.exe')) {
			// Protected executable files
			setErrorDialog({
				visible: true,
				message: `Cannot delete system executable "${fileName}". These apps are part of the portfolio experience! 🚫`,
				title: 'System Protection',
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
			<Desktop onProtectedDelete={handleProtectedDelete} />

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
					right: 16,
					color: COLORS.TEXT_WHITE,
					textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)',
					zIndex: 1000,
					textAlign: 'right',
				}}
			>
				<div style={{ fontSize: 18, fontWeight: 700 }}>
					Jean Francois Gutierrez Portfolio
				</div>
				<div style={{ fontSize: 13 }}>Windows 3.1 </div>
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

			<Taskbar
				onLaunchApp={handleLaunchApp}
				onRestart={handleRestart}
				onShutDown={handleShutDown}
				onShowSettings={handleShowSettings}
				onShowFind={handleShowFind}
				onShowHelp={handleShowHelp}
			/>

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

			<ShutDownScreen isVisible={isShutDown} />

			{/* Mobile Warning */}
			{isMobile && <MobileWarning onProceed={() => setIsMobile(false)} />}
		</>
	);
}
