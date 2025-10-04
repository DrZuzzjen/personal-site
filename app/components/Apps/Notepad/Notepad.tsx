'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { COLORS } from '@/app/lib/constants';
import type { NotepadWindowContent } from '@/app/lib/types';

export type NotepadProps = NotepadWindowContent;

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
	cursor: 'default',
	userSelect: 'none',
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

export default function Notepad({ fileName, filePath, body, readOnly }: NotepadProps) {
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const [isWrapped, setIsWrapped] = useState(true);
	const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });

	const text = body;
	const displayName = fileName ?? 'Untitled.txt';
	const displayPath = filePath ?? '(unsaved document)';
	const isReadOnly = readOnly !== false;

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

	const updateCursorPosition = () => {
		const element = textareaRef.current;
		if (!element) {
			return;
		}

		setCursorPosition(
			calculateCursorPosition(element.value, element.selectionStart ?? 0),
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

	return (
		<div style={containerStyle}>
			<div style={menuBarStyle}>
				{MENU_ITEMS.map((item) => (
					<span key={item} style={menuItemStyle}>
						{item}
					</span>
				))}
			</div>

			<div style={infoBarStyle}>
				<span>{displayName}</span>
				<span>{displayPath}</span>
			</div>

			<textarea
				ref={textareaRef}
				value={text}
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
				aria-label="Notepad text viewer"
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
					<button
						type="button"
						onClick={handleToggleWrap}
						style={statusButtonStyle}
					>
						Word Wrap: {isWrapped ? 'On' : 'Off'}
					</button>
					<span>{isReadOnly ? 'Read-only' : 'Editable'}</span>
				</div>
			</div>
		</div>
	);
}

