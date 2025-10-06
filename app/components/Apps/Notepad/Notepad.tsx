'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { COLORS } from '@/app/lib/constants';
import { useFileSystemContext } from '@/app/lib/FileSystemContext';
import { useWindowContext } from '@/app/lib/WindowContext';
import type { NotepadWindowContent } from '@/app/lib/types';

export type NotepadProps = NotepadWindowContent & {
	windowId?: string;
};

const MENU_ITEMS = ['File', 'Edit', 'Search', 'Help'] as const;

const containerStyle: CSSProperties = {
	display: 'flex',
	flexDirection: 'column',
	height: '100%',
	backgroundColor: COLORS.WIN_GRAY,
	color: COLORS.TEXT_BLACK,
	borderTop: `2px solid ${COLORS.BORDER_LIGHT}`,
	borderLeft: `2px solid ${COLORS.BORDER_HIGHLIGHT}`,
	borderBottom: `2px solid ${COLORS.BORDER_SHADOW}`,
	borderRight: `2px solid ${COLORS.BORDER_DARK}`,
	fontFamily: 'var(--font-sans)',
};

const menuBarStyle: CSSProperties = {
	display: 'flex',
	gap: 12,
	padding: '6px 8px',
	borderBottom: `1px solid ${COLORS.BORDER_SHADOW}`,
	fontSize: 12,
};

const menuItemStyle: CSSProperties = {
	fontWeight: 700,
	padding: '2px 6px',
	cursor: 'pointer',
	userSelect: 'none',
	position: 'relative',
};

const fileMenuDropdownStyle: CSSProperties = {
	position: 'absolute',
	top: '100%',
	left: 0,
	minWidth: 120,
	backgroundColor: COLORS.WIN_GRAY,
	border: `2px solid ${COLORS.BORDER_LIGHT}`,
	borderTopColor: COLORS.BORDER_HIGHLIGHT,
	borderLeftColor: COLORS.BORDER_HIGHLIGHT,
	borderBottomColor: COLORS.BORDER_DARK,
	borderRightColor: COLORS.BORDER_DARK,
	boxShadow: '2px 2px 4px rgba(0,0,0,0.3)',
	zIndex: 1000,
};

const fileMenuItemStyle: CSSProperties = {
	padding: '4px 12px',
	cursor: 'pointer',
	fontSize: 12,
	borderBottom: `1px solid ${COLORS.BORDER_SHADOW}`,
};

const infoBarStyle: CSSProperties = {
	display: 'flex',
	justifyContent: 'space-between',
	padding: '4px 8px',
	fontSize: 11,
	borderBottom: `1px solid ${COLORS.BORDER_SHADOW}`,
	fontFamily: 'var(--font-mono)',
};

const statusBarStyle: CSSProperties = {
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'space-between',
	padding: '4px 8px',
	borderTop: `1px solid ${COLORS.BORDER_SHADOW}`,
	fontSize: 11,
};

const statusGroupStyle: CSSProperties = {
	display: 'flex',
	alignItems: 'center',
	gap: 12,
};

const statusButtonStyle: CSSProperties = {
	borderTop: `2px solid ${COLORS.BORDER_LIGHT}`,
	borderLeft: `2px solid ${COLORS.BORDER_HIGHLIGHT}`,
	borderBottom: `2px solid ${COLORS.BORDER_SHADOW}`,
	borderRight: `2px solid ${COLORS.BORDER_DARK}`,
	backgroundColor: COLORS.WIN_GRAY,
	color: COLORS.TEXT_BLACK,
	fontSize: 11,
	padding: '2px 8px',
	cursor: 'pointer',
	fontFamily: 'var(--font-sans)',
};

function calculateCursorPosition(text: string, offset: number) {
	const clampedOffset = Math.max(0, Math.min(offset, text.length));
	const substring = text.slice(0, clampedOffset);
	const segments = substring.split(/\r\n|\r|\n/);
	const line = segments.length;
	const column = segments[segments.length - 1]?.length ?? 0;
	return {
		line,
		column: column + 1,
	};
}

export default function Notepad({
	fileName,
	filePath,
	body,
	readOnly,
	windowId,
}: NotepadProps) {
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const [isWrapped, setIsWrapped] = useState(true);
	const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });
	const [showFileMenu, setShowFileMenu] = useState(false);

	// State for editing
	const [editedText, setEditedText] = useState(body);
	const [savedText, setSavedText] = useState(body); // Track the last saved version

	// File system and window context
	const { updateFileContent, createFile, getItemByPath } =
		useFileSystemContext();
	const { openWindow, updateWindowContent, updateWindowTitle } =
		useWindowContext();

	const text = editedText; // Use edited text instead of original body
	const hasChanges = editedText !== savedText; // Compare with saved text, not original body
	const displayName = fileName ?? 'Untitled.txt';
	const displayTitle = hasChanges ? `${displayName}*` : displayName; // Show asterisk for unsaved changes
	const displayPath = filePath ?? '(unsaved document)';
	const isReadOnly = readOnly === true; // Only readonly if explicitly set to true

	const lineCount = useMemo(() => text.split(/\r\n|\r|\n/).length, [text]);
	const charCount = text.length;
	const wordCount = useMemo(() => {
		const trimmed = text.trim();
		return trimmed.length === 0 ? 0 : trimmed.split(/\s+/).length;
	}, [text]);

	useEffect(() => {
		const element = textareaRef.current;
		if (!element) {
			return;
		}
		// Reset scroll and caret when new content is loaded.
		element.scrollTop = 0;
		element.scrollLeft = 0;
		element.setSelectionRange(0, 0);
		setCursorPosition({ line: 1, column: 1 });
	}, [text]);

	// Reset edited text when body prop changes (new file loaded)
	useEffect(() => {
		setEditedText(body);
		setSavedText(body); // Also update saved text when new file loads
	}, [body]);

	const updateCursorPosition = () => {
		const element = textareaRef.current;
		if (!element) {
			return;
		}

		setCursorPosition(
			calculateCursorPosition(element.value, element.selectionStart ?? 0)
		);
	};

	const queueCursorUpdate = () => {
		if (typeof window === 'undefined') {
			return;
		}
		window.requestAnimationFrame(updateCursorPosition);
	};

	const handleToggleWrap = () => {
		setIsWrapped((previous) => !previous);

		// After toggling wrap, cursor position may shift due to layout changes.
		queueCursorUpdate();
	};

	// Save current file
	const handleSave = () => {
		if (!filePath) {
			// No file path = new file, need "Save As"
			alert('Please use Save As for new files');
			return;
		}

		const success = updateFileContent(filePath, editedText);

		if (success) {
			// Update the saved text to match what we just saved
			setSavedText(editedText);
		} else {
			alert('Failed to save file - file not found at path: ' + filePath);
		}
	};

	// Create new notepad window
	const handleNew = () => {
		openWindow({
			title: 'Untitled - Notepad',
			appType: 'notepad',
			position: { x: 120 + Math.random() * 100, y: 100 + Math.random() * 100 },
			size: { width: 440, height: 320 },
			icon: 'NP',
			content: {
				fileName: null,
				filePath: null,
				body: '',
				readOnly: false,
			} as NotepadWindowContent,
		});
	};

	// Save As - create new file
	const handleSaveAs = () => {
		const filename = prompt('Save as:', fileName || 'Untitled.txt');
		if (!filename) return; // User cancelled

		// Make sure it ends with .txt
		const finalName = filename.endsWith('.txt') ? filename : filename + '.txt';

		// Create file in My Documents - use the correct path structure
		const parentPath = '/C:/Users/Guest/Documents';
		const newFilePath = `${parentPath}/${finalName}`;

		// Check if file already exists
		const existingFile = getItemByPath(newFilePath);
		if (
			existingFile &&
			!confirm(`File ${finalName} already exists. Overwrite?`)
		) {
			return;
		}

		const newFile = createFile(parentPath, finalName, editedText);

		if (newFile) {
			// Update current window to point to the new file
			if (windowId) {
				updateWindowContent(windowId, {
					fileName: finalName,
					filePath: newFilePath,
					body: editedText,
					readOnly: false,
				} as NotepadWindowContent);

				updateWindowTitle(windowId, `${finalName} - Notepad`);
			}

			// Update our local state
			setSavedText(editedText);
		} else {
			alert('Failed to create file. Please try again.');
		}
	};

	// Keyboard shortcuts
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.ctrlKey && e.key === 's') {
				e.preventDefault();
				if (hasChanges && filePath) {
					handleSave();
				} else if (!filePath) {
					handleSaveAs();
				}
			} else if (e.ctrlKey && e.key === 'n') {
				e.preventDefault();
				handleNew();
			}
		};

		const handleClickOutside = (e: MouseEvent) => {
			// Close file menu when clicking outside
			if (showFileMenu) {
				setShowFileMenu(false);
			}
		};

		document.addEventListener('keydown', handleKeyDown);
		document.addEventListener('click', handleClickOutside);
		return () => {
			document.removeEventListener('keydown', handleKeyDown);
			document.removeEventListener('click', handleClickOutside);
		};
	}, [hasChanges, filePath, showFileMenu]); // Dependencies

	return (
		<div style={containerStyle}>
			<div style={menuBarStyle}>
				<span
					style={menuItemStyle}
					onClick={() => setShowFileMenu(!showFileMenu)}
				>
					File
					{showFileMenu && (
						<div style={fileMenuDropdownStyle}>
							<div
								style={fileMenuItemStyle}
								onClick={(e) => {
									e.stopPropagation();
									handleNew();
									setShowFileMenu(false);
								}}
								onMouseEnter={(e) => {
									e.currentTarget.style.backgroundColor = COLORS.WIN_BLUE;
									e.currentTarget.style.color = COLORS.TEXT_WHITE;
								}}
								onMouseLeave={(e) => {
									e.currentTarget.style.backgroundColor = 'transparent';
									e.currentTarget.style.color = COLORS.TEXT_BLACK;
								}}
							>
								New Ctrl+N
							</div>
							<div
								style={fileMenuItemStyle}
								onClick={(e) => {
									e.stopPropagation();
									handleSave();
									setShowFileMenu(false);
								}}
								onMouseEnter={(e) => {
									e.currentTarget.style.backgroundColor = COLORS.WIN_BLUE;
									e.currentTarget.style.color = COLORS.TEXT_WHITE;
								}}
								onMouseLeave={(e) => {
									e.currentTarget.style.backgroundColor = 'transparent';
									e.currentTarget.style.color = COLORS.TEXT_BLACK;
								}}
							>
								Save Ctrl+S
							</div>
							<div
								style={fileMenuItemStyle}
								onClick={(e) => {
									e.stopPropagation();
									handleSaveAs();
									setShowFileMenu(false);
								}}
								onMouseEnter={(e) => {
									e.currentTarget.style.backgroundColor = COLORS.WIN_BLUE;
									e.currentTarget.style.color = COLORS.TEXT_WHITE;
								}}
								onMouseLeave={(e) => {
									e.currentTarget.style.backgroundColor = 'transparent';
									e.currentTarget.style.color = COLORS.TEXT_BLACK;
								}}
							>
								Save As...
							</div>
						</div>
					)}
				</span>
				{MENU_ITEMS.slice(1).map((item) => (
					<span key={item} style={menuItemStyle}>
						{item}
					</span>
				))}
			</div>

			<div style={infoBarStyle}>
				<span>{displayTitle}</span>
				<span>{displayPath}</span>
			</div>

			<textarea
				ref={textareaRef}
				value={text}
				onChange={(e) => setEditedText(e.target.value)}
				readOnly={isReadOnly}
				spellCheck={false}
				wrap={isWrapped ? 'soft' : 'off'}
				onClick={queueCursorUpdate}
				onKeyUp={queueCursorUpdate}
				onSelect={queueCursorUpdate}
				onKeyDown={queueCursorUpdate}
				style={{
					flex: 1,
					margin: 8,
					padding: 8,
					backgroundColor: COLORS.WIN_WHITE,
					color: COLORS.TEXT_BLACK,
					borderTop: `2px solid ${COLORS.BORDER_LIGHT}`,
					borderLeft: `2px solid ${COLORS.BORDER_HIGHLIGHT}`,
					borderBottom: `2px solid ${COLORS.BORDER_SHADOW}`,
					borderRight: `2px solid ${COLORS.BORDER_DARK}`,
					resize: 'none',
					fontFamily: 'var(--font-mono)',
					fontSize: 12,
					lineHeight: 1.4,
					whiteSpace: isWrapped ? 'pre-wrap' : 'pre',
					wordBreak: 'break-word',
					overflowX: isWrapped ? 'hidden' : 'auto',
					overflowY: 'auto',
				}}
				aria-label='Notepad text viewer'
			/>

			<div style={statusBarStyle}>
				<div style={statusGroupStyle}>
					<span>
						Ln {cursorPosition.line}, Col {cursorPosition.column}
					</span>
					<span>{lineCount} lines</span>
					<span>{charCount} chars</span>
					<span>{wordCount} words</span>
				</div>
				<div style={statusGroupStyle}>
					<button type='button' onClick={handleNew} style={statusButtonStyle}>
						New
					</button>
					<button
						type='button'
						onClick={handleSave}
						disabled={!hasChanges || !filePath}
						style={{
							...statusButtonStyle,
							opacity: hasChanges && filePath ? 1 : 0.5,
							cursor: hasChanges && filePath ? 'pointer' : 'not-allowed',
						}}
					>
						Save
					</button>
					<button
						type='button'
						onClick={handleSaveAs}
						style={statusButtonStyle}
					>
						Save As
					</button>
					<button
						type='button'
						onClick={handleToggleWrap}
						style={statusButtonStyle}
					>
						Word Wrap: {isWrapped ? 'On' : 'Off'}
					</button>
					<span>
						{isReadOnly ? 'Read-only' : hasChanges ? 'Modified' : 'Saved'}
					</span>
				</div>
			</div>
		</div>
	);
}
